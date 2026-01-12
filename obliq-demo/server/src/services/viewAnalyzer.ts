import Anthropic from '@anthropic-ai/sdk';
import { db, type Message } from './database.js';
import { v4 as uuidv4 } from 'uuid';

// Lazy initialization to ensure env vars are loaded
let _anthropic: Anthropic | null = null;
function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

// Message with context for AI analysis
export interface MessageWithContext extends Message {
  contact_name: string;
  chat_name: string;
  is_group: number;
}

// Result from AI analysis
export interface AnalysisResult {
  viewName: string;
  relevantMessages: {
    messageId: string;
    score: number;
    reason?: string;
  }[];
  keywords: string[];
  entities: string[];
  aiContext: string;
}

// Result of checking a single message against a view
export interface MessageCheckResult {
  isRelevant: boolean;
  score: number;
  reason?: string;
}

/**
 * Analyze all messages to find those relevant to the given criteria
 * Uses a two-phase approach:
 * 1. First, ask AI to understand the criteria and generate search terms
 * 2. Then, send candidate messages for semantic analysis
 */
export async function analyzeMessagesForView(criteria: string): Promise<AnalysisResult> {
  // Get all messages with context
  const allMessages = db.getAllMessagesWithContext();

  if (allMessages.length === 0) {
    return {
      viewName: generateFallbackViewName(criteria),
      relevantMessages: [],
      keywords: extractSimpleKeywords(criteria),
      entities: [],
      aiContext: `No messages found to analyze for: ${criteria}`,
    };
  }

  // Check if API key is available for intelligent semantic search
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    console.log('No API key available, using keyword-based analysis for criteria:', criteria);
    return performFallbackAnalysis(criteria, allMessages);
  }

  // Use AI-powered semantic search for intelligent context understanding
  console.log(`Using AI-powered semantic search for criteria: "${criteria}" (${allMessages.length} messages)`);

  try {
    // Phase 1: Ask AI to understand the criteria and generate search terms
    console.log('Phase 1: Understanding search criteria...');
    const understandingPrompt = `You are a semantic search assistant. The user wants to find messages related to: "${criteria}"

Think about the FULL MEANING and CONTEXT of what the user is looking for. Consider:
- The main topic/theme (e.g., "house sale" means real estate transaction, property, buying/selling a home)
- Related concepts and synonyms
- Terms that might appear in conversations about this topic
- People who might be involved (realtors, buyers, family discussing it)

Generate a comprehensive list of search terms that would help find relevant messages.

Respond with ONLY a JSON object:
{
  "viewName": "Short 2-4 word name for this collection",
  "searchTerms": ["term1", "term2", "term3", ...],
  "concepts": ["broader concept 1", "broader concept 2"],
  "aiContext": "Brief description of what we're looking for"
}`;

    const understandingResponse = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{ role: 'user', content: understandingPrompt }],
    });

    let searchTerms: string[] = [];
    let viewName = generateFallbackViewName(criteria);
    let aiContext = `Messages related to: ${criteria}`;
    let concepts: string[] = [];

    const understandingText = understandingResponse.content.find(block => block.type === 'text');
    if (understandingText?.type === 'text') {
      try {
        // Strip markdown code blocks if present
        let responseText = understandingText.text;
        const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          responseText = codeBlockMatch[1];
        }
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          searchTerms = parsed.searchTerms || [];
          viewName = parsed.viewName || viewName;
          aiContext = parsed.aiContext || aiContext;
          concepts = parsed.concepts || [];
        }
      } catch (e) {
        console.log('Failed to parse understanding response, using fallback keywords');
        searchTerms = extractSimpleKeywords(criteria);
      }
    }

    if (searchTerms.length === 0) {
      searchTerms = extractSimpleKeywords(criteria);
    }

    console.log(`Phase 1 complete. Search terms: ${searchTerms.slice(0, 5).join(', ')}...`);

    // Phase 2: Pre-filter messages using expanded search terms
    const searchTermsLower = searchTerms.map(t => t.toLowerCase());
    const conceptsLower = concepts.map(c => c.toLowerCase());

    const candidateMessages = allMessages.filter(msg => {
      if (!msg.content) return false;
      const contentLower = msg.content.toLowerCase();
      const chatNameLower = (msg.chat_name || '').toLowerCase();
      const contactLower = (msg.contact_name || '').toLowerCase();

      // Check if any search term or concept is found
      return searchTermsLower.some(term =>
        contentLower.includes(term) ||
        chatNameLower.includes(term) ||
        contactLower.includes(term)
      ) || conceptsLower.some(concept => contentLower.includes(concept));
    });

    console.log(`Phase 2: Found ${candidateMessages.length} candidate messages from ${allMessages.length} total`);

    // If we have too few candidates, expand search with fuzzy matching
    if (candidateMessages.length < 5) {
      // Try partial word matching
      const partialMatches = allMessages.filter(msg => {
        if (!msg.content || candidateMessages.includes(msg)) return false;
        const contentLower = msg.content.toLowerCase();
        return searchTermsLower.some(term => {
          // Check if any word starts with part of our search term
          const words = contentLower.split(/\s+/);
          return words.some(word =>
            term.length >= 3 && (word.startsWith(term.substring(0, 3)) || term.startsWith(word.substring(0, 3)))
          );
        });
      });
      candidateMessages.push(...partialMatches.slice(0, 20));
    }

    if (candidateMessages.length === 0) {
      console.log('No candidate messages found, returning empty result');
      return {
        viewName,
        relevantMessages: [],
        keywords: searchTerms,
        entities: [],
        aiContext,
      };
    }

    // Phase 3: Send candidates to AI for semantic scoring
    console.log(`Phase 3: Semantic analysis of ${candidateMessages.length} candidates...`);

    // Prepare compact message format
    const messagesForAnalysis = candidateMessages.map(msg => ({
      id: msg.id,
      c: msg.content?.substring(0, 300) || '', // Truncate long messages
      s: msg.contact_name,
      ch: msg.chat_name,
    }));

    // Process in parallel batches if needed
    const BATCH_SIZE = 50;
    const batches: typeof messagesForAnalysis[] = [];
    for (let i = 0; i < messagesForAnalysis.length; i += BATCH_SIZE) {
      batches.push(messagesForAnalysis.slice(i, i + BATCH_SIZE));
    }

    // Process batches in parallel (max 3 concurrent)
    const processedBatches = await Promise.all(
      batches.slice(0, 3).map(batch => analyzeMessageBatch(criteria, batch))
    );

    // If there are more batches, process them
    if (batches.length > 3) {
      const remainingBatches = await Promise.all(
        batches.slice(3).map(batch => analyzeMessageBatch(criteria, batch))
      );
      processedBatches.push(...remainingBatches);
    }

    // Combine results
    let allRelevantMessages: AnalysisResult['relevantMessages'] = [];
    for (const batchResult of processedBatches) {
      allRelevantMessages = [...allRelevantMessages, ...batchResult];
    }

    // Deduplicate and sort by score
    const uniqueMessages = deduplicateMessages(allRelevantMessages);

    console.log(`Phase 3 complete. Found ${uniqueMessages.length} relevant messages`);

    return {
      viewName,
      relevantMessages: uniqueMessages,
      keywords: searchTerms,
      entities: concepts,
      aiContext,
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return performFallbackAnalysis(criteria, allMessages);
  }
}

/**
 * Analyze a batch of messages for relevance to criteria
 */
async function analyzeMessageBatch(
  criteria: string,
  messages: { id: string; c: string; s: string; ch: string }[]
): Promise<AnalysisResult['relevantMessages']> {
  const prompt = `Find messages semantically related to: "${criteria}"

Messages (id, content, sender, chat):
${messages.map(m => `[${m.id}] "${m.c}" - ${m.s} in ${m.ch}`).join('\n')}

Score each RELEVANT message (0.3-1.0). Only include messages actually related to "${criteria}".

Respond with ONLY JSON array:
[{"id":"...", "score":0.95}, ...]`;

  try {
    console.log(`[analyzeMessageBatch] Analyzing ${messages.length} messages for: "${criteria}"`);
    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find(block => block.type === 'text');
    if (textContent?.type === 'text') {
      console.log(`[analyzeMessageBatch] AI response (first 500 chars): ${textContent.text.substring(0, 500)}`);
      console.log(`[analyzeMessageBatch] AI response (last 200 chars): ...${textContent.text.substring(textContent.text.length - 200)}`);
      // Strip markdown code blocks if present
      let responseText = textContent.text;
      const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        responseText = codeBlockMatch[1];
        console.log(`[analyzeMessageBatch] Stripped markdown code block`);
      }
      let arrayMatch = responseText.match(/\[[\s\S]*\]/);

      // If no complete array found, check if response was truncated (starts with [ but no ])
      if (!arrayMatch && responseText.trim().startsWith('[')) {
        console.log(`[analyzeMessageBatch] Response appears truncated, attempting to fix...`);
        // Try to fix truncated JSON by adding closing bracket
        // First, find the last complete object
        const lastCompleteObject = responseText.lastIndexOf('}');
        if (lastCompleteObject > 0) {
          const fixedResponse = responseText.substring(0, lastCompleteObject + 1) + ']';
          arrayMatch = fixedResponse.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            console.log(`[analyzeMessageBatch] Fixed truncated response`);
          }
        }
      }

      console.log(`[analyzeMessageBatch] Array match result: ${arrayMatch ? 'found' : 'not found'}`);
      if (arrayMatch) {
        console.log(`[analyzeMessageBatch] Found array match: ${arrayMatch[0].substring(0, 100)}...`);
        try {
          const parsed = JSON.parse(arrayMatch[0]);
          console.log(`[analyzeMessageBatch] Parsed ${parsed.length} items`);
          return parsed.map((item: { id: string; score: number }) => ({
            messageId: item.id,
            score: item.score || 0.5,
          }));
        } catch (e) {
          console.log(`[analyzeMessageBatch] JSON parse error, trying manual extraction`);
          // Try to extract IDs manually - fallback for malformed JSON
          const idMatches = responseText.matchAll(/"id"\s*:\s*"([^"]+)"/g);
          const scoreMatches = [...responseText.matchAll(/"id"\s*:\s*"([^"]+)"[^}]*"score"\s*:\s*([\d.]+)/g)];
          const ids: AnalysisResult['relevantMessages'] = [];

          if (scoreMatches.length > 0) {
            for (const match of scoreMatches) {
              ids.push({ messageId: match[1], score: parseFloat(match[2]) || 0.6 });
            }
          } else {
            for (const match of idMatches) {
              ids.push({ messageId: match[1], score: 0.6 });
            }
          }
          console.log(`[analyzeMessageBatch] Manually extracted ${ids.length} IDs`);
          return ids;
        }
      } else {
        console.log(`[analyzeMessageBatch] No array match found in response`);
        // Last resort: extract IDs manually from whatever we got
        const idMatches = responseText.matchAll(/"id"\s*:\s*"([^"]+)"/g);
        const ids: AnalysisResult['relevantMessages'] = [];
        for (const match of idMatches) {
          ids.push({ messageId: match[1], score: 0.6 });
        }
        if (ids.length > 0) {
          console.log(`[analyzeMessageBatch] Fallback extraction found ${ids.length} IDs`);
          return ids;
        }
      }
    } else {
      console.log(`[analyzeMessageBatch] No text content in response`);
    }
  } catch (error) {
    console.error('Batch analysis error:', error);
  }
  return [];
}

/**
 * Check if a single new message is relevant to a view's criteria
 */
export async function checkMessageRelevance(
  criteria: string,
  keywords: string[],
  message: MessageWithContext
): Promise<MessageCheckResult> {
  // Quick keyword check first
  const messageContent = (message.content || '').toLowerCase();
  const hasKeywordMatch = keywords.some(keyword =>
    messageContent.includes(keyword.toLowerCase())
  );

  // If no keyword match, likely not relevant
  if (!hasKeywordMatch && keywords.length > 0) {
    return { isRelevant: false, score: 0 };
  }

  // Check if API key is available for more accurate analysis
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    // Fallback: use keyword match as relevance indicator
    return {
      isRelevant: hasKeywordMatch,
      score: hasKeywordMatch ? 0.7 : 0,
      reason: hasKeywordMatch ? 'Keyword match' : undefined,
    };
  }

  try {
    const prompt = `Determine if this message is relevant to the topic: "${criteria}"

Message:
- From: ${message.contact_name}
- Chat: ${message.chat_name}
- Content: "${message.content}"

Keywords associated with this topic: ${keywords.join(', ')}

Respond with ONLY a JSON object:
{
  "isRelevant": true/false,
  "score": 0.0-1.0,
  "reason": "brief explanation"
}`;

    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find(block => block.type === 'text');
    if (textContent?.type === 'text') {
      const result = parseCheckResponse(textContent.text);
      return result;
    }
  } catch (error) {
    console.error('Message relevance check error:', error);
  }

  // Fallback on error
  return {
    isRelevant: hasKeywordMatch,
    score: hasKeywordMatch ? 0.6 : 0,
  };
}

// ============ HELPER FUNCTIONS ============

function parseCheckResponse(text: string): MessageCheckResult {
  try {
    // Strip markdown code blocks if present
    let responseText = text;
    const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      responseText = codeBlockMatch[1];
    }
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isRelevant: parsed.isRelevant === true,
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        reason: parsed.reason,
      };
    }
  } catch (error) {
    console.error('Failed to parse check response:', error);
  }
  return { isRelevant: false, score: 0 };
}

function deduplicateMessages(messages: AnalysisResult['relevantMessages']): AnalysisResult['relevantMessages'] {
  const seen = new Map<string, AnalysisResult['relevantMessages'][0]>();

  for (const msg of messages) {
    const existing = seen.get(msg.messageId);
    if (!existing || msg.score > existing.score) {
      seen.set(msg.messageId, msg);
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.score - a.score);
}

function generateFallbackViewName(criteria: string): string {
  // Extract key nouns from criteria
  const words = criteria
    .replace(/messages?\s*(related\s*to|about|regarding|for|with)/gi, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 3);

  if (words.length === 0) {
    return 'Collection';
  }

  // Capitalize first letter of each word
  return words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function extractSimpleKeywords(criteria: string): string[] {
  // Remove common words and extract meaningful keywords
  const stopWords = ['messages', 'related', 'to', 'about', 'regarding', 'for', 'with', 'the', 'a', 'an', 'my', 'our', 'your', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'but', 'and', 'or', 'if', 'then', 'else', 'when', 'at', 'by', 'on', 'in', 'of', 'from', 'into', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'once'];

  return criteria
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !stopWords.includes(w))
    .slice(0, 10);
}

function performFallbackAnalysis(criteria: string, messages: MessageWithContext[]): AnalysisResult {
  const keywords = extractSimpleKeywords(criteria);
  const viewName = generateFallbackViewName(criteria);

  const relevantMessages: AnalysisResult['relevantMessages'] = [];

  for (const msg of messages) {
    if (!msg.content) continue;

    const content = msg.content.toLowerCase();
    let matchCount = 0;

    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      const score = Math.min(matchCount / keywords.length, 1);
      if (score >= 0.3) { // Threshold for relevance
        relevantMessages.push({
          messageId: msg.id,
          score,
        });
      }
    }
  }

  // Sort by score and limit results
  relevantMessages.sort((a, b) => b.score - a.score);

  return {
    viewName,
    relevantMessages: relevantMessages.slice(0, 100), // Limit to top 100
    keywords,
    entities: [],
    aiContext: `Messages containing keywords: ${keywords.join(', ')}`,
  };
}
