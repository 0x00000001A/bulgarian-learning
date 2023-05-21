import {QuizDataGroupObject, QuizDataQuestionObject} from './types.ts'
import QuizDataQuestion from "./QuizDataQuestion.ts";

class QuizDataGroup {
  id: number
  questions: QuizDataQuestion[]
  description: string
  questionsCount: number

  constructor(id: number, group: QuizDataGroupObject) {
    this.id = id
    this.questions = []
    this.description = ''
    this.questionsCount = 0

    this.init(group)
  }

  toObject(): QuizDataGroupObject {
    return {
      description: this.description,
      questions: this.questions.map((question) => {
        return question.toObject()
      })
    }
  }

  addQuestion(question: QuizDataQuestionObject, id: number) {
    this.questions.push(new QuizDataQuestion(id, question))
    this.questionsCount++
  }

  init(group: QuizDataGroupObject) {
    this.description = group.description

    group.questions.forEach(this.addQuestion.bind(this))
  }
}

export default QuizDataGroup
