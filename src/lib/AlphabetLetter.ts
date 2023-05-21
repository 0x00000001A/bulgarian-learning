import {AlphabetLetterObject} from "./types.ts";

class AlphabetLetter {
  id: number
  score: number
  letter: string
  description: string[]

  constructor(id: number, data: AlphabetLetterObject) {
    this.id = id
    this.score = data.score || 0
    this.letter = data.letter
    this.description = data.description
  }

  addScore() {
    this.score++
  }

  reduceScore() {
    this.score--
  }

  toObject() {
    return {
      letter: this.letter,
      description: this.description,
      score: this.score
    }
  }
}

export default AlphabetLetter
