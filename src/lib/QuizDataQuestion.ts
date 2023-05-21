import {QuizDataQuestionObject} from "./types.ts";

class QuizDataQuestion {
  id: number
  text: string
  score: number
  answers: string[]

  constructor(id: number, data: QuizDataQuestionObject) {
    this.id = id
    this.text = data.text
    this.score = data.score || 0
    this.answers = data.answers
  }

  addScore() {
    this.score++
  }

  reduceScore() {
    this.score--
  }

  toObject() {
    return {
      text: this.text,
      score: this.score,
      answers: this.answers,
    }
  }
}

export default QuizDataQuestion
