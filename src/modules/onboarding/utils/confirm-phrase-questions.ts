export const CONFIRM_PHRASE_QUESTION_COUNT = 3;
export const CONFIRM_PHRASE_OPTION_COUNT = 3;

export interface ConfirmPhraseQuestion {
  answerIndex: number;
  options: number[];
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function pickRandomIndexes(wordCount: number, count: number): number[] {
  return shuffle(Array.from({ length: wordCount }, (_, index) => index)).slice(
    0,
    Math.min(count, wordCount),
  );
}

function buildOptions(answerIndex: number, wordCount: number, optionCount: number): number[] {
  const wrongIndexes = shuffle(
    Array.from({ length: wordCount }, (_, index) => index).filter(index => index !== answerIndex),
  ).slice(0, Math.min(optionCount - 1, wordCount - 1));

  return shuffle([answerIndex, ...wrongIndexes]);
}

export function buildConfirmPhraseQuestions(
  wordCount: number,
  questionCount = CONFIRM_PHRASE_QUESTION_COUNT,
  optionCount = CONFIRM_PHRASE_OPTION_COUNT,
): ConfirmPhraseQuestion[] {
  if (wordCount <= 0) return [];

  return pickRandomIndexes(wordCount, questionCount).map(answerIndex => ({
    answerIndex,
    options: buildOptions(answerIndex, wordCount, optionCount),
  }));
}
