import {AlphabetLetterObject} from './types.ts'
import AlphabetLetter from './AlphabetLetter.ts'

class AlphabetLetterGroup {
  id: number
  letters: AlphabetLetter[]
  lettersCount: number
  
  constructor(id: number, letters: AlphabetLetterObject[] = []) {
    this.id = id
    this.letters = []
    this.lettersCount = 0
    
    this.initLetters(letters)
  }
  
  toArray() {
    const result: AlphabetLetterObject[] = []
    
    for (let i = 0; i < this.lettersCount; i++) {
      result.push(this.letters[i].toObject())
    }
    
    return result
  }
  
  addLetter(id: number, letter: AlphabetLetterObject) {
    this.letters[id] = new AlphabetLetter(id, letter)
  }
  
  initLetters(letters: AlphabetLetterObject[]) {
    this.lettersCount = letters.length
    
    for (let i = 0; i < this.lettersCount; i++) {
      this.addLetter(i, letters[i])
    }
  }
}

export default AlphabetLetterGroup
