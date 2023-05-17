import {AlphabetGroupObject, AlphabetLetterObject} from './types.ts'
import AlphabetLetter from './AlphabetLetter.ts'

class AlphabetLetterGroup {
  id: number
  letters: AlphabetLetter[]
  description: string
  lettersCount: number
  
  constructor(id: number, group: AlphabetGroupObject) {
    this.id = id
    this.letters = []
    this.description = ''
    this.lettersCount = 0
    
    this.initGroup(group)
  }
  
  toObject(): AlphabetGroupObject {
    return {
      description: this.description,
      letters: this.letters.map((letter) => letter.toObject())
    }
  }
  
  addLetter(id: number, letter: AlphabetLetterObject) {
    this.letters[id] = new AlphabetLetter(id, letter)
  }
  
  initGroup(group: AlphabetGroupObject) {
    this.lettersCount = group.letters.length
    this.description = group.description
    
    for (let i = 0; i < this.lettersCount; i++) {
      this.addLetter(i, group.letters[i])
    }
  }
}

export default AlphabetLetterGroup
