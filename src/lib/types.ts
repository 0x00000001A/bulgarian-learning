export type QuizDataQuestionJSON = {
  text: string
  answers: string[]
}

export type QuizDataQuestionObject = QuizDataQuestionJSON & {
  score?: number
  manual?: boolean
}

export type QuizDataGroupObject = {
  description: string
  questions: QuizDataQuestionObject[]
}

export type QuizDataObject = {
  name: string
  groups: QuizDataGroupObject[]
}

export type QuizQuestionSource = keyof QuizDataQuestionJSON

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
  alphabet: QuizDataObject
  question: number
  database: number
  minScoreToRemember: number
  minScoreToAcceptProgress: number
}
