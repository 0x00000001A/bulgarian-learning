export type AlphabetLetterObject = {
  letter: string
  description: string
  score?: number
  manual?: boolean
  sentence?: string
}

export type AlphabetObject = {
  name: string
  groups: AlphabetLetterObject[][]
}

export enum QuizModes {
  ONEDIRECTIONAL_QUESTIONS,
  BIDERECTIONAL_QUESTIONS,
  BIDERECTIONAL_QUESTIONS_WITH_MANUAL_INPUT
}

export type QuizOption = {
  text: string
}

export type QuizQuestion = {
  text: string
  original: AlphabetLetterObject
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
