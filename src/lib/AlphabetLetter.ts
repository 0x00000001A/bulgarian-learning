import {AlphabetLetterObject} from './types.ts'

class AlphabetLetter {
  id: number
  score: number
  origin: AlphabetLetterObject
  letter: string
  manual: boolean
  sentence: string
  description: string
  
  constructor(id: number, data: AlphabetLetterObject) {
    this.id = id
    this.score = data.score || 0
    this.origin = data
    this.letter = data.letter
    this.manual = !!data.manual
    this.sentence = data.sentence || ''
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
      manual: this.manual,
      letter: this.letter,
      description: this.description,
      sentence: this.sentence,
      score: this.score
    }
  }
}

export default AlphabetLetter
