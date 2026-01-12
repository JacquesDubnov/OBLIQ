// Profanity detection utility for language moderation
// Used to protect minors in chat conversations

export interface ProfanityMatch {
  word: string;
  start: number;
  end: number;
}

// Common profanity words (English)
// This list covers explicit language inappropriate for minors
const PROFANITY_LIST = [
  // F-word variations
  'fuck', 'fucker', 'fuckers', 'fucking', 'fucked', 'fucks', 'motherfucker', 'motherfucking',
  // S-word variations
  'shit', 'shits', 'shitty', 'shitting', 'bullshit',
  // A-word variations
  'ass', 'asshole', 'assholes', 'asses', 'dumbass', 'jackass', 'badass',
  // B-word variations
  'bitch', 'bitches', 'bitchy', 'bitching',
  // D-word variations
  'damn', 'damned', 'damnit', 'goddamn', 'goddamnit',
  'dick', 'dicks', 'dickhead',
  // C-word variations
  'cock', 'cocks', 'cocksucker',
  'cunt', 'cunts',
  'crap', 'crappy',
  // P-word variations
  'pussy', 'pussies',
  'piss', 'pissed', 'pissing',
  // W-word variations
  'whore', 'whores',
  // S-word variations
  'slut', 'sluts', 'slutty',
  // B-word
  'bastard', 'bastards',
  // H-word
  'hell',
  // Other explicit terms
  'wanker', 'wankers',
  'twat', 'twats',
  'bollocks',
  'arse', 'arsehole',
  'bugger',
  'bloody',
  'prick', 'pricks',
  // Slurs (extremely inappropriate)
  'fag', 'fags', 'faggot', 'faggots',
  'nigger', 'niggers', 'nigga', 'niggas',
  'retard', 'retards', 'retarded',
  'spic', 'spics',
  'chink', 'chinks',
  'kike', 'kikes',
  'wetback', 'wetbacks',
  // Sexual terms
  'dildo', 'dildos',
  'penis', 'penises',
  'vagina', 'vaginas',
  'boob', 'boobs', 'boobie', 'boobies',
  'tit', 'tits', 'titty', 'titties',
  'cum', 'cumming', 'cumshot',
  'jizz',
  'orgasm', 'orgasms',
  'horny',
  'blowjob', 'blowjobs',
  'handjob', 'handjobs',
];

// Create a Set for O(1) lookup
const PROFANITY_SET = new Set(PROFANITY_LIST);

// Character substitution map for detecting obfuscated profanity
const CHAR_SUBSTITUTIONS: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '8': 'b',
  '(': 'c',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '0': 'o',
  '$': 's',
  '5': 's',
  '7': 't',
  '+': 't',
  '*': '',
  '.': '',
  '-': '',
  '_': '',
};

/**
 * Normalize a word by converting to lowercase and replacing common
 * character substitutions used to bypass profanity filters
 */
function normalizeWord(word: string): string {
  let normalized = word.toLowerCase();

  // Replace character substitutions
  for (const [sub, char] of Object.entries(CHAR_SUBSTITUTIONS)) {
    normalized = normalized.split(sub).join(char);
  }

  // Remove repeated characters (e.g., "fuuuuck" -> "fuck")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');

  return normalized;
}

/**
 * Check if a single word is profane
 */
function isWordProfane(word: string): boolean {
  const normalized = normalizeWord(word);
  return PROFANITY_SET.has(normalized);
}

/**
 * Detect all profanity in a text string
 * Returns an array of matches with their positions
 */
export function detectProfanity(text: string): ProfanityMatch[] {
  const matches: ProfanityMatch[] = [];

  // Split by whitespace and punctuation while tracking positions
  // This regex captures both words and delimiters
  const tokens = text.split(/(\s+|[.,!?;:'"()\[\]{}])/);

  let position = 0;

  for (const token of tokens) {
    // Skip empty tokens and pure whitespace/punctuation
    if (token && /[a-zA-Z0-9@$!|+*]/.test(token)) {
      if (isWordProfane(token)) {
        matches.push({
          word: token,
          start: position,
          end: position + token.length,
        });
      }
    }
    position += token.length;
  }

  return matches;
}

/**
 * Check if text contains any profanity
 */
export function containsProfanity(text: string): boolean {
  return detectProfanity(text).length > 0;
}

/**
 * Get a censored version of the text (for logging purposes)
 */
export function censorText(text: string): string {
  const matches = detectProfanity(text);

  if (matches.length === 0) return text;

  let censored = text;
  // Process matches in reverse order to preserve positions
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const replacement = match.word[0] + '*'.repeat(match.word.length - 1);
    censored = censored.slice(0, match.start) + replacement + censored.slice(match.end);
  }

  return censored;
}
