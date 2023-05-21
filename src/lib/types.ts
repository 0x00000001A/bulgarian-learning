export type AlphabetLetterJSON = {
  letter: string
  description: string[]
}

export type AlphabetLetterObject = AlphabetLetterJSON & {
  score?: number
  manual?: boolean
}

export type AlphabetGroupObject = {
  description: string
  letters: AlphabetLetterObject[]
}

export type AlphabetObject = {
  name: string
  groups: AlphabetGroupObject[]
}

export type QuizQuestionSource = keyof AlphabetLetterJSON

export type QuizAnswerType = 'text' | 'select'

export type QuizOption = {
  id: string
  text: string
}

export type QuizQuestion = {
  text: string
  hint: string
  group: string
  score: number
  options: QuizOption[]
  progress: number
  remembered: boolean
  answerType: QuizAnswerType
  questionSource: QuizQuestionSource
  optionsToSelect: number
}

export type QuizSnapshot = {
  answerType: QuizAnswerType
  questionSource: QuizQuestionSource
  group: number
  alphabet: AlphabetObject
  question: number
  database: number
  minScoreToRemember: number
  minScoreToAcceptProgress: number
}
