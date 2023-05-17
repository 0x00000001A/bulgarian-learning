export type AlphabetLetterObject = {
  letter: string
  description: string
  score?: number
  manual?: boolean
  sentence?: string
}

export type AlphabetGroupObject = {
  description: string,
  letters: AlphabetLetterObject[]
}

export type AlphabetObject = {
  name: string
  groups: AlphabetGroupObject[]
}

export enum QuizModes {
  ONEDIRECTIONAL_QUESTIONS,
  BIDERECTIONAL_QUESTIONS,
  BIDERECTIONAL_QUESTIONS_WITH_MANUAL_INPUT
}

export type QuizOption = {
  id: string
  text: string
}

export type QuizQuestion = {
  text: string
  hint: string
  group: string,
  score: number,
  options: QuizOption[]
  progress: number
  remembered: boolean
}

export type QuizSnapshot = {
  mode: QuizModes,
  group: number,
  alphabet: AlphabetObject,
  question: number,
  database: number,
  minScoreToRemember: number,
  minScoreToAcceptProgress: number
}
