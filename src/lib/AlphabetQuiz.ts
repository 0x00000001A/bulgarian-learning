import {AlphabetObject, QuizModes, QuizOption, QuizQuestion, QuizSnapshot} from './types.ts'
import Alphabet from './Alphabet.ts'
import AlphabetLetterGroup from './AlphabetLetterGroup.ts'
import {getRandomUpTo, shuffleArray} from './utils.ts'
import AlphabetLetter from './AlphabetLetter.ts'
import PriorityQueue from './PriorityQueue.ts'

class AlphabetQuiz {
  modes: QuizModes
  alphabet: Alphabet
  currentMode: QuizModes
  currentGroup: AlphabetLetterGroup
  currentQuestion: AlphabetLetter
  currentDatabase: PriorityQueue<AlphabetLetterGroup>
  
  MIN_SCORE_TO_REMEMBER: number
  MIN_SCORE_TO_ACCEPT_PROGRESS: number
  
  constructor() {
    this.modes = 2
    this.currentMode = 0
    
    this.MIN_SCORE_TO_REMEMBER = 1
    this.MIN_SCORE_TO_ACCEPT_PROGRESS = 2
    
    const dummyAlphabet: AlphabetObject = {
      name: '',
      groups: [{
        description: '',
        letters: [{
          letter: '',
          description: '',
          manual: false,
          score: 0,
          sentence: ''
        }]
      }]
    }
    
    this.alphabet = new Alphabet(dummyAlphabet)
    this.currentGroup = this.alphabet.groups[0]
    this.currentQuestion = this.currentGroup.letters[0]
    this.currentDatabase = new PriorityQueue<AlphabetLetterGroup>()
  }
  
  start(alphabet: AlphabetObject) {
    this.initQuestions(alphabet)
    this.next(undefined, true)
  }
  
  next(answerText = '', isCleanRun = true) {
    if (this.currentQuestion) {
      if (this.isCorrect(answerText)) {
        this.currentQuestion.addScore()
      } else {
        this.currentQuestion.reduceScore()
      }
    }
    
    this.changeGroup(isCleanRun)
    this.changeQuestion()
    this.changeMode()
  }
  
  isCorrect(answer: string) {
    const letter = this.currentQuestion.letter.toLowerCase()
    const description = this.currentQuestion.description.toLowerCase()
    const answerFixed = answer.trim().toLowerCase()
    
    return letter === answerFixed || description === answerFixed
  }
  
  getOptions(): QuizOption[] {
    const options: QuizOption[] = []
    
    // If current mode is 'letter-and-options' or 'description-and-options'
    if (this.currentMode < QuizModes.BIDERECTIONAL_QUESTIONS_WITH_MANUAL_INPUT) {
      this.currentGroup.letters.forEach((letter) => {
        const option: QuizOption = {
          text: letter.letter
        }
        
        if (this.currentMode === 0) {
          option.text = letter.description
        }
        
        options.push(option)
      })
    }
    
    shuffleArray(options)
    
    return options
  }
  
  getGroup() {
    return this.currentGroup
  }
  
  getMessage() {
    let message = ''
    
    if (!this.answerPossiblyRemembered()) {
      switch (this.currentMode) {
        case 0:
          message = this.currentQuestion.description
          break
        case 1:
          message = this.currentQuestion.letter
          break
      }
    } else {
      switch (this.currentMode) {
        case 0: // Letter as question with options
        case 1: // Description as question with options
          message = 'Select one option'
          break
        case 2: // Letter as question with free-type answer
          message = 'Type your answer and press Enter'
          break
        default:
        // unknown mode;
      }
    }
    
    return message
  }
  
  getSentence() {
    return this.currentQuestion.sentence
  }
  
  getQuestion(): QuizQuestion {
    const question = {
      text: '',
      hint: '',
      group: this.currentGroup.description,
      score: this.currentQuestion.score,
      options: this.getOptions(),
      progress: this.getProgress(),
      remembered: this.answerPossiblyRemembered()
    }
    
    switch (this.currentMode) {
      case 0: // Letter with options
      case 2: // Letter and free-type answer
        question.text = this.currentQuestion.letter
        question.hint = this.currentQuestion.description
        break
      case 1: // Description with options
        question.text = this.currentQuestion.description
        question.hint = this.currentQuestion.letter
        break
      default:
      // unknown mode;
    }
    
    return question
  }
  
  getProgress() {
    let total = 0
    let progress = 0
    
    this.alphabet.groups.forEach((group) => {
      group.letters.forEach((letter) => {
        if (letter.score > this.MIN_SCORE_TO_ACCEPT_PROGRESS) {
          progress++
        }
        
        total++
      })
    })
    
    const percentage = progress / total * 100
    
    return isNaN(percentage) ? 0 : percentage
  }
  
  setMinScoreToRememember(val: number) {
    if (val > 0) {
      this.MIN_SCORE_TO_REMEMBER = val
    }
  }
  
  getSnapshot(): QuizSnapshot {
    return {
      mode: this.currentMode,
      group: this.currentGroup.id,
      alphabet: this.alphabet.toObject(),
      question: this.currentQuestion.id,
      database: this.currentDatabase.size,
      minScoreToRemember: this.MIN_SCORE_TO_REMEMBER,
      minScoreToAcceptProgress: this.MIN_SCORE_TO_ACCEPT_PROGRESS
    }
  }
  
  useSnapshot(snapshot: QuizSnapshot) {
    this.initQuestions(snapshot.alphabet)
    
    for (let i = 1; i < snapshot.database; i++) {
      this.currentDatabase.push(this.alphabet.getGroup(i))
    }
    
    this.currentMode = snapshot.mode
    this.currentGroup = this.alphabet.getGroup(snapshot.group)
    this.currentQuestion = this.currentGroup.letters[snapshot.question]
    this.MIN_SCORE_TO_REMEMBER = snapshot.minScoreToRemember
    this.MIN_SCORE_TO_ACCEPT_PROGRESS = snapshot.minScoreToAcceptProgress
  }
  
  initQuestions(alphabet: AlphabetObject) {
    this.alphabet = new Alphabet(alphabet)
    this.currentGroup = this.alphabet.groups[0]
    this.currentDatabase = new PriorityQueue<AlphabetLetterGroup>(this.alphabet.groupsCount)
    this.currentDatabase.setComparator((groupA, groupB) => {
      let aScore = 0
      let bScore = 0
      const aSize = groupA.lettersCount
      const bSize = groupB.lettersCount
      
      const size = Math.min(aSize, bSize)
      
      for (let i = 0; i < size; i++) {
        aScore += groupA.letters[i].score
        bScore += groupB.letters[i].score
      }
      
      return aScore < bScore
    })
    
    this.currentDatabase.push(this.alphabet.getGroup(0))
  }
  
  changeMode() {
    if (this.currentQuestion && this.answerPossiblyRemembered()) {
      if (this.currentMode === QuizModes.BIDERECTIONAL_QUESTIONS_WITH_MANUAL_INPUT) {
        this.currentMode = QuizModes.ONEDIRECTIONAL_QUESTIONS
      } else {
        this.currentMode = getRandomUpTo(this.modes + 1)
      }
    } else {
      this.currentMode = QuizModes.ONEDIRECTIONAL_QUESTIONS
    }
  }
  
  changeGroup(isCleanRun = false) {
    if (!isCleanRun && this.currentGroup) {
      this.currentDatabase.push(this.currentGroup)
    }
    
    let lowestScoreGroup
    const groups = []
    const x = 2
    
    for (let i = 0; i < x; i++) {
      const groupWithLowestScore = this.currentDatabase.shift()
      
      if (groupWithLowestScore) {
        groups.push(groupWithLowestScore)
      }
      
      if (!lowestScoreGroup) {
        lowestScoreGroup = groupWithLowestScore
      }
    }
    
    shuffleArray(groups)

    this.currentGroup = groups.shift() || this.currentGroup
    
    const restGroupsSize = groups.length
    
    for (let xi = 0; xi < restGroupsSize; xi++) {
      this.currentDatabase.push(groups[xi])
    }
    
    if (lowestScoreGroup) {
      this.increaseDifficultyIfNeeded(lowestScoreGroup)
    }
  }
  
  changeQuestion() {
    this.currentQuestion = this.currentGroup.letters[getRandomUpTo(this.currentGroup.lettersCount)]
  }
  
  increaseDifficultyIfNeeded(groupWithLowestScore: AlphabetLetterGroup) {
    const haveLettersToBeLearned = groupWithLowestScore.letters.some((letter) => {
      return letter.score < this.MIN_SCORE_TO_REMEMBER
    })
    
    if (!haveLettersToBeLearned) {
      const nextGroup = this.alphabet.getGroup(this.currentDatabase.size)
      
      if (nextGroup) {
        this.currentDatabase.push(nextGroup)
      }
    }
  }
  
  answerPossiblyRemembered() {
    return this.currentQuestion.score > this.MIN_SCORE_TO_REMEMBER
  }
}

export default AlphabetQuiz
