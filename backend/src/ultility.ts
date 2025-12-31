import { htmlToText } from 'html-to-text';
import fs from 'fs';
import path from 'path';
export function extractSearchableText(description: string): string {
  return htmlToText(description, {
    wordwrap: false,
    selectors: [
      { selector: 'img', format: 'skip' },
      { selector: 'a', options: { ignoreHref: true } },
    ],
  });
}

const offensiveWordFilePath = path.resolve(
  __dirname,
  '../../backend/others/vn_offensive_word.txt',
);

export function checkAndCorrectOffensiveSentence(sentence: string): {
  correctedSentence: string;
  censoredWordList: string[];
} {
  // 1. Load offensive words
  const offensiveWords = fs
    .readFileSync(offensiveWordFilePath, 'utf-8')
    .split('\n')
    .map((w) => w.trim())
    .filter(Boolean);

  const matches: { start: number; end: number; word: string }[] = [];

  for (const word of offensiveWords) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(`(^|[\\s.,!?])(${escaped})(?=$|[\\s.,!?])`, 'gi');

    let match;
    while ((match = regex.exec(sentence))) {
      matches.push({
        start: match.index + match[1].length,
        end: match.index + match[1].length + match[2].length,
        word,
      });
    }
  }

  // 1️⃣ sort by appearance
  matches.sort((a, b) => a.start - b.start);

  // 2️⃣ replace from right to left (important!)
  let correctedSentence = sentence;
  const censoredWordList: string[] = [];

  for (let i = matches.length - 1; i >= 0; i--) {
    const { start, end, word } = matches[i];
    censoredWordList.unshift(word);

    correctedSentence =
      correctedSentence.slice(0, start) +
      `*${i + 1}` +
      correctedSentence.slice(end);
  }

  return { correctedSentence, censoredWordList };
}
// console.log(
//   checkAndCorrectOffensiveSentence(
//     'Thằng này súng ngắn là con chó và đồ ngu t1',
//   ),
// );
