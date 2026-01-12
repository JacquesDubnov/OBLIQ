# OBLIQ Demo - Stage 2 Supplement: AI Guardian Features

## Overview

These features demonstrate OBLIQ's "AI that cares" - proactive intelligence that protects users from mistakes, reminds them of commitments, and monitors wellbeing. All features have explicit demo triggers for controlled presentation.

---

## Feature Priority (All P0 - High Demo Impact)

| Feature | AI Type | Demo Impact | Trigger | Time |
|---------|---------|-------------|---------|------|
| **Profanity Guardian** | Content moderation | 🔥🔥🔥 | Type specific word in family group | 1 day |
| **Audience Mismatch Alert** | Security/Privacy | 🔥🔥🔥 | Type sensitive keyword in group | 1 day |
| **Commitment Reminder** | Proactive memory | 🔥🔥🔥 | `/demo reminder` or time-based | 1 day |
| **Mood Analysis Alert** | Emotional intelligence | 🔥🔥🔥 | `/demo mood` command | 1 day |

**Total Additional Time: 4 days**

---

## Feature 1: Profanity Guardian (Family Protection)

### Concept
When typing profane/inappropriate language in a group chat containing minors, AI displays a warning before sending.

### Demo Trigger
**In "Chen Family" or "Lincoln High Parents" group:**
- Type any of: `damn`, `shit`, `fuck`, `ass`, `crap`, `hell` (configurable list)
- Warning appears BEFORE message is sent

### UI Design
```
┌─────────────────────────────────────────────────────────────┐
│                    PROFANITY GUARDIAN                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Chat: Chen Family 👨‍👩‍👦                                        │
│  Members: Sarah, Mom, Jake (14), Aunt May                   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  [Previous messages...]                             │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ╔═════════════════════════════════════════════════════╗    │
│  ║  ⚠️ LANGUAGE WARNING                                ║    │
│  ║                                                     ║    │
│  ║  This group includes minors:                        ║    │
│  ║  • Jake (14 years old)                              ║    │
│  ║                                                     ║    │
│  ║  Your message contains language that may not be     ║    │
│  ║  appropriate for younger family members.            ║    │
│  ║                                                     ║    │
│  ║  [Edit Message]  [Send Anyway]  [Cancel]            ║    │
│  ╚═════════════════════════════════════════════════════╝    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ This is such a damn mess with the house sale...    │    │
│  │                                    ▲ flagged word   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Technical Implementation

```typescript
// Configuration
interface GroupSafetyConfig {
  chatId: string;
  hasMinors: boolean;
  minorNames: { name: string; age: number }[];
  profanityLevel: 'strict' | 'moderate' | 'relaxed';
}

const FAMILY_GROUPS: GroupSafetyConfig[] = [
  {
    chatId: 'chen_family',
    hasMinors: true,
    minorNames: [{ name: 'Jake', age: 14 }],
    profanityLevel: 'strict'
  },
  {
    chatId: 'lincoln_parents',
    hasMinors: true,
    minorNames: [{ name: 'Various children', age: 0 }],
    profanityLevel: 'moderate'
  }
];

// Profanity detection (tiered)
const PROFANITY_TIERS = {
  severe: ['fuck', 'shit', 'ass', 'bitch', 'bastard'],
  moderate: ['damn', 'hell', 'crap', 'piss'],
  mild: ['darn', 'heck', 'freaking']
};

// Check function
function checkMessageSafety(
  message: string, 
  chatId: string
): SafetyCheckResult {
  const config = FAMILY_GROUPS.find(g => g.chatId === chatId);
  if (!config?.hasMinors) return { safe: true };
  
  const words = message.toLowerCase().split(/\s+/);
  const flaggedWords = words.filter(w => 
    PROFANITY_TIERS.severe.includes(w) || 
    PROFANITY_TIERS.moderate.includes(w)
  );
  
  if (flaggedWords.length > 0) {
    return {
      safe: false,
      warning: 'profanity',
      flaggedWords,
      minors: config.minorNames
    };
  }
  
  return { safe: true };
}
```

### Component: ProfanityWarningModal

```tsx
interface ProfanityWarningProps {
  flaggedWords: string[];
  minors: { name: string; age: number }[];
  originalMessage: string;
  onEdit: () => void;
  onSendAnyway: () => void;
  onCancel: () => void;
}

const ProfanityWarningModal: React.FC<ProfanityWarningProps> = ({
  flaggedWords,
  minors,
  originalMessage,
  onEdit,
  onSendAnyway,
  onCancel
}) => (
  <WarningOverlay severity="high">
    <WarningHeader>
      <WarningIcon /> LANGUAGE WARNING
    </WarningHeader>
    
    <WarningBody>
      <Text>This group includes minors:</Text>
      <MinorList>
        {minors.map(m => (
          <MinorItem key={m.name}>
            • {m.name} ({m.age} years old)
          </MinorItem>
        ))}
      </MinorList>
      
      <Text>
        Your message contains language that may not be 
        appropriate for younger family members.
      </Text>
      
      <FlaggedPreview>
        <HighlightedMessage 
          text={originalMessage}
          highlights={flaggedWords}
        />
      </FlaggedPreview>
    </WarningBody>
    
    <WarningActions>
      <Button onClick={onEdit}>Edit Message</Button>
      <Button variant="outline" onClick={onSendAnyway}>
        Send Anyway
      </Button>
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
    </WarningActions>
  </WarningOverlay>
);
```

### Demo Script
1. Open "Chen Family" group chat
2. Start typing: "This is such a damn mess with the house sale"
3. Press Enter or Send
4. Red warning modal appears highlighting "damn" and showing Jake (14)
5. Click "Edit Message" to demonstrate responsible UX
6. Retype without profanity and send

---

## Feature 2: Audience Mismatch Alert (Security Guardian)

### Concept
When about to send sensitive/confidential information in a group, AI detects if any member seems out of place for this type of discussion.

### Demo Trigger
**In "Project Alpha" or "House Sale Team" group:**
- Type keywords like: `salary`, `confidential`, `offer price`, `budget`, `NDA`, `fired`, `layoff`
- System checks if all members are appropriate for this content

### Scenario Setup
In "House Sale Team" group, add a member who shouldn't see financial details:
- **Members**: You, Sarah Chen, Michael Torres, **Tom (Neighbor)** ← out of place

### UI Design
```
┌─────────────────────────────────────────────────────────────┐
│                  AUDIENCE MISMATCH ALERT                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Chat: House Sale Team 🏠                                    │
│  Members: Sarah, Michael Torres, Tom (Neighbor)             │
│                                                              │
│  ╔═════════════════════════════════════════════════════╗    │
│  ║  🚨 SECURITY ALERT                                  ║    │
│  ║                                                     ║    │
│  ║  You're about to share sensitive information:       ║    │
│  ║  ┌─────────────────────────────────────────────┐   ║    │
│  ║  │ "Our max budget is $550K, don't go higher"  │   ║    │
│  ║  └─────────────────────────────────────────────┘   ║    │
│  ║                                                     ║    │
│  ║  ⚠️ UNUSUAL RECIPIENT DETECTED:                    ║    │
│  ║                                                     ║    │
│  ║  ┌─────────────────────────────────────────────┐   ║    │
│  ║  │ 👤 Tom (Neighbor)                           │   ║    │
│  ║  │                                             │   ║    │
│  ║  │ • Not in your usual finance discussions     │   ║    │
│  ║  │ • Added to this group 2 days ago            │   ║    │
│  ║  │ • No previous messages in this group        │   ║    │
│  ║  │                                             │   ║    │
│  ║  │ This person may have been added by mistake. │   ║    │
│  ║  └─────────────────────────────────────────────┘   ║    │
│  ║                                                     ║    │
│  ║  [Review Members]  [Send Anyway]  [Cancel]         ║    │
│  ╚═════════════════════════════════════════════════════╝    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Technical Implementation

```typescript
// Sensitive content patterns
const SENSITIVE_PATTERNS = {
  financial: [
    /budget/i, /salary/i, /offer.*price/i, /\$\d+[kK]?/,
    /confidential/i, /don't.*tell/i, /between.*us/i
  ],
  hr_sensitive: [
    /fired/i, /layoff/i, /termination/i, /performance.*review/i,
    /promotion/i, /raise/i
  ],
  legal: [
    /NDA/i, /lawsuit/i, /settlement/i, /attorney/i
  ],
  personal: [
    /medical/i, /diagnosis/i, /password/i, /social.*security/i
  ]
};

// Member trust scoring
interface MemberTrustProfile {
  memberId: string;
  name: string;
  messageCountInGroup: number;
  daysInGroup: number;
  topicsDiscussedWith: string[];  // ['finance', 'family', 'work']
  trustScore: number;  // 0-100
}

// Analysis function
async function analyzeAudienceFit(
  message: string,
  groupId: string,
  members: MemberTrustProfile[]
): Promise<AudienceCheckResult> {
  // 1. Detect sensitive content type
  const sensitiveType = detectSensitiveContent(message);
  if (!sensitiveType) return { safe: true };
  
  // 2. Check each member's fit for this content
  const misfitMembers = members.filter(member => {
    // Low trust score
    if (member.trustScore < 50) return true;
    
    // New to group
    if (member.daysInGroup < 7 && member.messageCountInGroup < 5) return true;
    
    // Never discussed this topic type before
    if (!member.topicsDiscussedWith.includes(sensitiveType)) return true;
    
    return false;
  });
  
  if (misfitMembers.length > 0) {
    return {
      safe: false,
      warning: 'audience_mismatch',
      sensitiveType,
      misfitMembers,
      recommendation: 'Review group members before sending'
    };
  }
  
  return { safe: true };
}
```

### Demo Data Setup
```typescript
// House Sale Team group - add misfit member for demo
const HOUSE_SALE_TEAM_MEMBERS = [
  {
    id: 'user',
    name: 'You',
    trustScore: 100,
    topicsDiscussedWith: ['finance', 'property', 'family']
  },
  {
    id: 'sarah',
    name: 'Sarah Chen',
    trustScore: 100,
    topicsDiscussedWith: ['finance', 'property', 'family']
  },
  {
    id: 'michael',
    name: 'Michael Torres',
    trustScore: 95,
    topicsDiscussedWith: ['finance', 'property', 'real_estate']
  },
  {
    id: 'tom_neighbor',  // MISFIT for demo
    name: 'Tom (Neighbor)',
    trustScore: 30,
    daysInGroup: 2,
    messageCountInGroup: 0,
    topicsDiscussedWith: ['neighborhood']  // No finance!
  }
];
```

### Demo Script
1. Open "House Sale Team" group
2. Type: "Our max budget is $550K, don't go higher than that"
3. Press Send
4. Red security alert appears highlighting Tom (Neighbor)
5. Shows analysis: "Not in your usual finance discussions"
6. Click "Review Members" to show member list
7. Option to remove Tom or send anyway

---

## Feature 3: Commitment Reminder (Proactive Memory)

### Concept
AI analyzes conversations and proactively reminds user of commitments they made, especially time-sensitive ones.

### Demo Trigger
**Two options:**
1. **Manual:** `/demo reminder` command
2. **Time-based:** Set to trigger at specific demo moment

### Setup: The Promise
In Jake's chat history, include this exchange:
```
Jake: Dad can you get me a new football? Mine is flat
You: Sure buddy, I'll pick one up today after work
Jake: Thanks dad! You're the best 🙏
```

### UI Design
```
┌─────────────────────────────────────────────────────────────┐
│                   COMMITMENT REMINDER                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User is in any chat, doing anything...                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  💭 OBLIQ Reminder                          ✕      │    │
│  │  ─────────────────────────────────────────────     │    │
│  │                                                     │    │
│  │  🏈 Don't forget!                                   │    │
│  │                                                     │    │
│  │  Earlier today, you promised Jake you'd bring      │    │
│  │  him a new football after work.                    │    │
│  │                                                     │    │
│  │  It's now 5:45 PM and you haven't mentioned        │    │
│  │  picking it up yet.                                │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────┐       │    │
│  │  │ Jake: Dad can you get me a new football?│       │    │
│  │  │ You: Sure buddy, I'll pick one up today │       │    │
│  │  └─────────────────────────────────────────┘       │    │
│  │                                                     │    │
│  │  [View Conversation]  [Mark Complete]  [Snooze]    │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Position: Slide in from bottom-right                       │
│  Style: Soft blue/green gradient, friendly not alarming     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Technical Implementation

```typescript
// Commitment detection patterns
const COMMITMENT_PATTERNS = [
  /I('ll| will) (get|buy|pick up|bring|grab)/i,
  /I('ll| will) (call|text|message|contact)/i,
  /I('ll| will) (do|finish|complete|send)/i,
  /I promise/i,
  /Don't worry,? I('ll| will)/i,
  /Sure,? I('ll| will)/i,
  /remind me to/i
];

// Time extraction
const TIME_PATTERNS = [
  { pattern: /today/i, relative: 'today' },
  { pattern: /tonight/i, relative: 'tonight' },
  { pattern: /tomorrow/i, relative: 'tomorrow' },
  { pattern: /after work/i, relative: 'end_of_workday' },
  { pattern: /this (morning|afternoon|evening)/i, relative: 'timeofday' },
  { pattern: /by (\d{1,2})(:\d{2})?\s*(am|pm)?/i, relative: 'specific_time' }
];

interface DetectedCommitment {
  id: string;
  messageId: string;
  chatId: string;
  personTo: string;           // "Jake"
  commitment: string;         // "pick up a new football"
  timeframe: string;          // "today after work"
  detectedAt: Date;
  dueBy: Date;
  status: 'pending' | 'reminded' | 'completed' | 'missed';
}

// Claude API prompt for extraction
const COMMITMENT_EXTRACTION_PROMPT = `
Analyze this conversation and extract any commitments/promises made.

Conversation:
${messages}

Extract JSON:
{
  "hasCommitment": true/false,
  "commitment": "what was promised",
  "personTo": "who it was promised to",
  "timeframe": "when it should be done",
  "urgency": "high/medium/low",
  "item": "specific item if applicable (e.g., 'football')"
}
`;

// Reminder trigger logic
function shouldShowReminder(commitment: DetectedCommitment): boolean {
  const now = new Date();
  const dueBy = commitment.dueBy;
  
  // If "today" and it's after 5 PM, remind
  if (commitment.timeframe === 'today' && now.getHours() >= 17) {
    return true;
  }
  
  // If specific time, remind 1 hour before
  if (dueBy && (dueBy.getTime() - now.getTime()) < 3600000) {
    return true;
  }
  
  return false;
}
```

### Component: CommitmentReminder

```tsx
interface CommitmentReminderProps {
  commitment: DetectedCommitment;
  originalMessages: Message[];
  onViewConversation: () => void;
  onMarkComplete: () => void;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
}

const CommitmentReminder: React.FC<CommitmentReminderProps> = ({
  commitment,
  originalMessages,
  onViewConversation,
  onMarkComplete,
  onSnooze,
  onDismiss
}) => (
  <ReminderCard 
    initial={{ x: 400, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 400, opacity: 0 }}
  >
    <Header>
      <Icon>💭</Icon>
      <Title>OBLIQ Reminder</Title>
      <CloseButton onClick={onDismiss}>✕</CloseButton>
    </Header>
    
    <Body>
      <ItemIcon>{commitment.item === 'football' ? '🏈' : '📝'}</ItemIcon>
      <Headline>Don't forget!</Headline>
      
      <Description>
        Earlier today, you promised <strong>{commitment.personTo}</strong> you'd{' '}
        <strong>{commitment.commitment}</strong>.
      </Description>
      
      <TimeWarning>
        It's now {format(new Date(), 'h:mm a')} and you haven't 
        mentioned picking it up yet.
      </TimeWarning>
      
      <ConversationPreview>
        {originalMessages.map(msg => (
          <PreviewMessage key={msg.id} sender={msg.sender}>
            {msg.content}
          </PreviewMessage>
        ))}
      </ConversationPreview>
    </Body>
    
    <Actions>
      <Button onClick={onViewConversation}>View Conversation</Button>
      <Button variant="success" onClick={onMarkComplete}>
        Mark Complete ✓
      </Button>
      <Button variant="ghost" onClick={() => onSnooze(30)}>
        Snooze 30m
      </Button>
    </Actions>
  </ReminderCard>
);
```

### Demo Script
1. Navigate through a few chats normally
2. Run `/demo reminder` (or wait for timed trigger)
3. Reminder slides in from bottom-right
4. Shows the original Jake conversation
5. "It's 5:45 PM and you haven't mentioned picking it up"
6. Click "View Conversation" to jump to Jake's chat
7. Demonstrate marking complete

---

## Feature 4: Mood/Wellness Alert (Emotional Intelligence)

### Concept
AI analyzes communication patterns over time and gently alerts user if it detects concerning trends (increased agitation, negative sentiment, unusual patterns).

### Demo Trigger
**Manual only:** `/demo mood` command
(This is too sensitive to trigger accidentally)

### UI Design
```
┌─────────────────────────────────────────────────────────────┐
│                    WELLNESS INSIGHT                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  💙 OBLIQ Wellness Check                    ✕      │    │
│  │  ─────────────────────────────────────────────     │    │
│  │                                                     │    │
│  │  I've noticed some patterns in your recent         │    │
│  │  conversations that I wanted to share with you.    │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │  📊 Communication Analysis (Past 30 Days)   │   │    │
│  │  │                                             │   │    │
│  │  │  In family conversations:                   │   │    │
│  │  │  • Response time: ↑ 40% slower              │   │    │
│  │  │  • Message length: ↓ 35% shorter            │   │    │
│  │  │  • Tone sentiment: ↓ Trending negative      │   │    │
│  │  │                                             │   │    │
│  │  │  [Chart showing sentiment trend over time]  │   │    │
│  │  │  ────────────────────────────               │   │    │
│  │  │       ╭─╮                                   │   │    │
│  │  │      ╭╯ ╰╮    ╭─╮                          │   │    │
│  │  │  ───╯    ╰────╯ ╰──────                    │   │    │
│  │  │  Week 1  Week 2  Week 3  Week 4            │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  │                                                     │    │
│  │  This could indicate increased stress or           │    │
│  │  emotional fatigue. There's nothing wrong with     │    │
│  │  feeling this way, but being aware might help.     │    │
│  │                                                     │    │
│  │  💡 Some things that might help:                   │    │
│  │  • Take breaks from messaging when overwhelmed     │    │
│  │  • Consider talking to someone you trust          │    │
│  │  • The house sale process is stressful - normal!  │    │
│  │                                                     │    │
│  │  [Understood]  [Learn More]  [Don't Show Again]    │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Style: Calm blue/purple gradient                           │
│  Tone: Gentle, non-judgmental, supportive                   │
│  Position: Center modal with soft overlay                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Technical Implementation

```typescript
// Mood analysis data structure
interface MoodAnalysis {
  period: string;                    // "past_30_days"
  overallTrend: 'improving' | 'stable' | 'declining';
  metrics: {
    responseTime: { trend: 'up' | 'down' | 'stable'; change: number };
    messageLength: { trend: 'up' | 'down' | 'stable'; change: number };
    sentiment: { trend: 'positive' | 'neutral' | 'negative'; score: number };
    engagementLevel: { trend: 'up' | 'down' | 'stable'; change: number };
  };
  concernLevel: 'none' | 'low' | 'moderate' | 'high';
  insights: string[];
  suggestions: string[];
}

// Sentiment analysis via Claude
const MOOD_ANALYSIS_PROMPT = `
Analyze the emotional tone and patterns in these messages from the past 30 days.
Focus on family conversations (Sarah, Jake, Mom).

Messages:
${familyMessages}

Analyze for:
1. Overall sentiment trend (positive/negative/neutral)
2. Signs of stress, frustration, or emotional fatigue
3. Changes in communication style (shorter responses, delayed replies)
4. Any concerning patterns

Return JSON:
{
  "overallSentiment": "declining",
  "stressIndicators": ["shorter responses", "more delays", "less emoji use"],
  "possibleCauses": ["house sale stress", "work pressure"],
  "concernLevel": "moderate",
  "supportiveSuggestions": ["...", "..."]
}
`;

// Demo trigger data (pre-computed for demo)
const DEMO_MOOD_ANALYSIS: MoodAnalysis = {
  period: 'past_30_days',
  overallTrend: 'declining',
  metrics: {
    responseTime: { trend: 'up', change: 40 },      // 40% slower
    messageLength: { trend: 'down', change: -35 },  // 35% shorter
    sentiment: { trend: 'negative', score: -0.3 },
    engagementLevel: { trend: 'down', change: -25 }
  },
  concernLevel: 'moderate',
  insights: [
    'Your responses to family members have become noticeably shorter',
    'Response time has increased, especially with Sarah and Jake',
    'Less use of positive language and emojis compared to last month'
  ],
  suggestions: [
    'Take breaks from messaging when feeling overwhelmed',
    'Consider talking to someone you trust about how you\'re feeling',
    'The house sale process is inherently stressful - this is normal'
  ]
};
```

### Component: WellnessInsightModal

```tsx
interface WellnessInsightProps {
  analysis: MoodAnalysis;
  onAcknowledge: () => void;
  onLearnMore: () => void;
  onDisable: () => void;
}

const WellnessInsightModal: React.FC<WellnessInsightProps> = ({
  analysis,
  onAcknowledge,
  onLearnMore,
  onDisable
}) => (
  <ModalOverlay>
    <WellnessCard>
      <Header>
        <HeartIcon color="blue" />
        <Title>OBLIQ Wellness Check</Title>
        <CloseButton onClick={onAcknowledge}>✕</CloseButton>
      </Header>
      
      <Introduction>
        I've noticed some patterns in your recent conversations 
        that I wanted to share with you.
      </Introduction>
      
      <AnalysisCard>
        <AnalysisTitle>
          📊 Communication Analysis (Past 30 Days)
        </AnalysisTitle>
        
        <MetricList>
          <Metric 
            label="Response time"
            trend="up"
            value="40% slower"
            icon="⏱️"
          />
          <Metric 
            label="Message length"
            trend="down"
            value="35% shorter"
            icon="📝"
          />
          <Metric 
            label="Tone sentiment"
            trend="down"
            value="Trending negative"
            icon="💭"
          />
        </MetricList>
        
        <SentimentChart data={analysis.sentimentOverTime} />
      </AnalysisCard>
      
      <Explanation>
        This could indicate increased stress or emotional fatigue.
        There's nothing wrong with feeling this way, but being 
        aware might help.
      </Explanation>
      
      <Suggestions>
        <SuggestionTitle>💡 Some things that might help:</SuggestionTitle>
        <SuggestionList>
          {analysis.suggestions.map((suggestion, i) => (
            <SuggestionItem key={i}>• {suggestion}</SuggestionItem>
          ))}
        </SuggestionList>
      </Suggestions>
      
      <Actions>
        <Button primary onClick={onAcknowledge}>Understood</Button>
        <Button onClick={onLearnMore}>Learn More</Button>
        <Button variant="ghost" onClick={onDisable}>
          Don't Show Again
        </Button>
      </Actions>
    </WellnessCard>
  </ModalOverlay>
);
```

### Demo Script
1. After showing other features, pause
2. Say: "OBLIQ also monitors for your wellbeing..."
3. Run `/demo mood`
4. Wellness modal fades in with gentle animation
5. Walk through the metrics and chart
6. Emphasize: "This is AI that cares about you, not just your data"
7. Click "Understood" to dismiss

---

## Integration: Demo Command Registry

### Add Demo Commands to CLI System

```typescript
// commands/demoCommands.ts

const demoCommands: Command[] = [
  {
    name: 'demo',
    description: 'Trigger demo scenarios',
    usage: '/demo <scenario>',
    subcommands: {
      'reminder': {
        description: 'Show commitment reminder (football for Jake)',
        handler: async () => {
          const reminder = await loadCommitmentReminder('jake_football');
          showCommitmentReminder(reminder);
        }
      },
      'mood': {
        description: 'Show wellness/mood analysis alert',
        handler: async () => {
          showWellnessInsight(DEMO_MOOD_ANALYSIS);
        }
      },
      'profanity': {
        description: 'Instructions for profanity demo',
        handler: async () => {
          showToast('Go to Chen Family chat and type a message with "damn"');
        }
      },
      'audience': {
        description: 'Instructions for audience mismatch demo',
        handler: async () => {
          showToast('Go to House Sale Team and type "Our max budget is $550K"');
        }
      }
    },
    handler: async (args) => {
      if (!args[0]) {
        showDemoMenu();  // Show available scenarios
        return;
      }
      const subcommand = demoCommands[0].subcommands[args[0]];
      if (subcommand) {
        await subcommand.handler();
      }
    }
  }
];

// Demo menu helper
function showDemoMenu() {
  showModal({
    title: '🎬 Demo Scenarios',
    content: (
      <DemoScenarioList>
        <Scenario 
          command="/demo reminder"
          description="Commitment reminder (Jake's football)"
        />
        <Scenario 
          command="/demo mood"
          description="Wellness/mood analysis alert"
        />
        <Scenario 
          command="(automatic)"
          description="Profanity warning - type 'damn' in Chen Family"
        />
        <Scenario 
          command="(automatic)"
          description="Audience alert - type budget in House Sale Team"
        />
      </DemoScenarioList>
    )
  });
}
```

---

## Database Schema Additions

```sql
-- Commitments tracking
CREATE TABLE commitments (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  person_to TEXT NOT NULL,
  commitment_text TEXT NOT NULL,
  timeframe TEXT,
  due_by DATETIME,
  status TEXT DEFAULT 'pending',  -- pending, reminded, completed, missed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id),
  FOREIGN KEY (chat_id) REFERENCES chats(id)
);

-- Group safety configuration
CREATE TABLE group_safety_config (
  chat_id TEXT PRIMARY KEY,
  has_minors BOOLEAN DEFAULT FALSE,
  minor_members TEXT,  -- JSON array of {name, age}
  profanity_level TEXT DEFAULT 'moderate',
  FOREIGN KEY (chat_id) REFERENCES chats(id)
);

-- Member trust profiles (for audience mismatch)
CREATE TABLE member_trust_profiles (
  member_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  chat_ids TEXT,  -- JSON array of group IDs
  topics_discussed TEXT,  -- JSON array
  trust_score INTEGER DEFAULT 50,
  days_known INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0
);

-- Mood analysis snapshots
CREATE TABLE mood_snapshots (
  id TEXT PRIMARY KEY,
  analysis_date DATE NOT NULL,
  metrics TEXT,  -- JSON
  overall_trend TEXT,
  concern_level TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Updated Timeline

```
Week 1: AI Foundation
├── Day 1-2: CLI Interface (existing)
├── Day 3-5: Dynamic Views (existing)
└── Day 6-7: Live Translation (existing)

Week 2: Migration & Security + AI Guardian
├── Day 8-9: Migration Animation (existing)
├── Day 10: Encryption Indicators (existing)
├── Day 11: Profanity Guardian ← NEW
└── Day 12: Audience Mismatch Alert ← NEW

Week 3: Enhanced Features + AI Care
├── Day 13-14: In-Chat Calendar (existing)
├── Day 15: Commitment Reminder ← NEW
├── Day 16: Mood Analysis Alert ← NEW
└── Day 17-19: Integration Testing & Polish
```

**Updated Total: 19-22 days**

---

## Demo Trigger Quick Reference

| Feature | Trigger Method | Location |
|---------|---------------|----------|
| Profanity Guardian | Type `damn`, `shit`, etc. | Chen Family or Lincoln Parents group |
| Audience Mismatch | Type `budget`, `$550K`, `confidential` | House Sale Team group |
| Commitment Reminder | `/demo reminder` | Any chat |
| Mood Analysis | `/demo mood` | Any chat |
| View All Demo Options | `/demo` | Any chat |

---

## Complete Demo Script (Updated)

### Part 1: Migration (Existing)
1. Empty OBLIQ → `/migrate` → Messages flow in

### Part 2: Core AI Features (Existing)
2. Calendar scheduling with Robert (timezones)
3. Translation with Yuki (Japanese)
4. Dynamic Views: `/view create "House Sale"`

### Part 3: AI Guardian Features (NEW)
5. **Profanity Protection**
   - Open Chen Family group
   - Type: "This house sale is such a damn nightmare"
   - Show warning, edit message
   
6. **Audience Mismatch**
   - Open House Sale Team
   - Type: "Our max budget is $550K"
   - Show Tom (Neighbor) warning
   - Demonstrate reviewing members

7. **Commitment Reminder**
   - Navigate casually, then `/demo reminder`
   - Show Jake's football promise
   - Demonstrate marking complete

8. **Wellness Check**
   - Pause, explain wellness monitoring
   - `/demo mood`
   - Walk through mood analysis
   - Emphasize caring AI

### Part 4: Closing
9. Security badges, encryption indicators
10. Final message: "AI that protects you, reminds you, and cares about you"
