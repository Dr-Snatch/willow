export type PatternTag =
  | 'anxiety'
  | 'rumination'
  | 'catastrophising'
  | 'low mood'
  | 'withdrawal'
  | 'self-criticism';

const PATTERNS: Record<PatternTag, RegExp[]> = {
  anxiety: [
    /\banxious\b/i, /\banxiety\b/i, /\bworried\b/i, /\bworry\b/i,
    /\bnervous\b/i, /\bpanic/i, /\boverwhelm/i, /\bscared\b/i,
    /\bfrightened\b/i, /\bon\s+edge\b/i, /\bcan'?t\s+(breathe|cope|relax)\b/i,
  ],
  rumination: [
    /\bcan'?t\s+stop\s+think/i, /\bkeep\s+think/i, /\bgoing\s+over\s+(it|everything)\b/i,
    /\bmy\s+brain\s+won'?t\s+(stop|quiet|switch off)\b/i, /\bobsess/i,
    /\bin\s+my\s+head\b/i, /\bspiral/i,
  ],
  catastrophising: [
    /\beverything\s+is\s+(ruined|terrible|awful|over)\b/i,
    /\bworst\s+(case|thing|ever)\b/i,
    /\bgoing\s+to\s+(fail|fall apart|ruin)\b/i,
    /\bnothing\s+(will\s+get\s+better|ever\s+works)\b/i,
    /\bwhat\s+if\s+.{0,30}(disaster|terrible|awful|wrong)\b/i,
  ],
  'low mood': [
    /\bsad\b/i, /\bdepressed\b/i, /\bfeeling\s+(low|down|blue)\b/i,
    /\bempty\b/i, /\bhopeless\b/i, /\bworthless\b/i, /\bnumb\b/i,
    /\bno\s+point\b/i, /\bdon'?t\s+(care\s+anymore|see\s+the\s+point)\b/i,
  ],
  withdrawal: [
    /\bdon'?t\s+want\s+to\s+(see|talk|be around|go out)\b/i,
    /\bavoiding\b/i, /\bstaying\s+(home|in bed|away)\b/i,
    /\bcan'?t\s+face\b/i, /\bisolat/i, /\bcut\s+myself\s+off\b/i,
    /\bcancell/i,
  ],
  'self-criticism': [
    /\bi'?m\s+(so\s+)?(stupid|useless|worthless|pathetic|a\s+failure)\b/i,
    /\bhate\s+myself\b/i, /\bmy\s+(fault|mistake)\b/i,
    /\bshould\s+have\b/i, /\bi\s+always\s+(mess|screw)\s+up\b/i,
    /\bwhy\s+can'?t\s+i\s+(just|be)\b/i,
  ],
};

export function detectPatterns(text: string): PatternTag[] {
  return (Object.entries(PATTERNS) as [PatternTag, RegExp[]][])
    .filter(([, regexes]) => regexes.some((r) => r.test(text)))
    .map(([tag]) => tag);
}
