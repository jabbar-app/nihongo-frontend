/**
 * Convert Arabic numerals to Japanese numerals (kanji)
 * Supports numbers 1-10
 */
export function toJapaneseNumeral(num: number): string {
  const japaneseNumerals: Record<number, string> = {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九',
    10: '十',
  };

  return japaneseNumerals[num] || num.toString();
}
