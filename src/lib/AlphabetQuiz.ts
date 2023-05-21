import {
  AlphabetObject,
  QuizAnswerType,
  QuizOption,
  QuizQuestion,
  QuizQuestionSource,
  QuizSnapshot
} from './types.ts'
import Alphabet from './Alphabet.ts'
import AlphabetLetterGroup from './AlphabetLetterGroup.ts'
import {getRandomUpTo, shuffleArray} from './utils.ts'
import PriorityQueue from './PriorityQueue.ts'
import AlphabetLetter from "./AlphabetLetter.ts";

class AlphabetQuiz {
  alphabet: Alphabet
  currentGroup: AlphabetLetterGroup
  currentQuestion: QuizQuestion
  currentDatabase: PriorityQueue<AlphabetLetterGroup>
  currentQuestionLetter: AlphabetLetter

  MIN_SCORE_TO_REMEMBER: number
  MIN_SCORE_TO_ACCEPT_PROGRESS: number

  constructor() {
    this.MIN_SCORE_TO_REMEMBER = 1
    this.MIN_SCORE_TO_ACCEPT_PROGRESS = 2

    const dummyAlphabet: AlphabetObject = {
      name: '',
      groups: [{
        description: '',
        letters: [{
          letter: '',
          description: [],
          score: 0,
        }]
      }]
    }

    this.alphabet = new Alphabet(dummyAlphabet)
    this.currentGroup = this.alphabet.groups[0]
    this.currentQuestion = this.buildQuestion()
    this.currentDatabase = new PriorityQueue<AlphabetLetterGroup>()
    this.currentQuestionLetter = this.currentGroup.letters[0]
  }

  start(alphabet: AlphabetObject) {
    this.initQuestions(alphabet)
    this.next(undefined, true)
  }

  next(answerText: string[] = [], isCleanRun = false) {
    if (this.currentQuestion) {
      if (this.isCorrect(answerText)) {
        this.currentQuestionLetter.addScore()
      } else {
        this.currentQuestionLetter.reduceScore()
      }
    }

    this.changeGroup(isCleanRun)
    this.buildQuestion()
  }

  isCorrect(answer: string[]) {
    const letter = this.currentQuestionLetter.letter.toLowerCase()
    const description = this.currentQuestionLetter.description.sort().join(', ').toLowerCase()
    const answerFixed = answer.sort().join(', ').trim().toLowerCase()

    return letter === answerFixed || description === answerFixed
  }

  getUniqueId() {
    const dateString = Date.now().toString(36)
    const randomness = Math.random().toString(36).substring(2)
    return dateString + randomness
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

  getSnapshot(): QuizSnapshot {
    return {
      group: this.currentGroup.id,
      alphabet: this.alphabet.toObject(),
      question: this.currentQuestionLetter.id,
      database: this.currentDatabase.size,
      answerType: this.currentQuestion.answerType,
      questionSource: this.currentQuestion.questionSource,
      minScoreToRemember: this.MIN_SCORE_TO_REMEMBER,
      minScoreToAcceptProgress: this.MIN_SCORE_TO_ACCEPT_PROGRESS
    }
  }

  useSnapshot(snapshot: QuizSnapshot) {
    this.initQuestions(snapshot.alphabet)

    for (let i = 1; i < snapshot.database; i++) {
      this.currentDatabase.push(this.alphabet.getGroup(i))
    }

    this.currentGroup = this.alphabet.getGroup(snapshot.group)
    this.currentQuestion = this.buildQuestion(snapshot)
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

  buildQuestion(snapshot?: QuizSnapshot): QuizQuestion {
    this.currentQuestionLetter = this.currentGroup.letters[getRandomUpTo(this.currentGroup.lettersCount)]

    if (snapshot?.question) {
      this.currentQuestionLetter = this.currentGroup.letters[snapshot.question]
    }

    const nextQuestionAnswerTypes: QuizAnswerType[] = ['text', 'select']
    const nextQuestionSources: QuizQuestionSource[] = ['letter', 'description']
    const question: QuizQuestion = {
      hint: '',
      text: '',
      group: this.currentGroup.description,
      score: this.currentQuestionLetter.score,
      options: [],
      progress: this.getProgress(),
      remembered: this.questionIsPossiblyRemembered(this.currentQuestionLetter),
      answerType: 'select',
      questionSource: 'letter',
      optionsToSelect: 1,
    }

    if (!snapshot) {
      if (question.remembered) {
        question.questionSource = nextQuestionSources[Math.round(Math.random())]
        question.answerType = nextQuestionAnswerTypes[Math.round(Math.random())]
      }

      // if question source is letter and there is more than one options to select
      // then do not allow manual user input
      if (question.questionSource === 'letter' && this.currentQuestionLetter.description.length > 1) {
        question.answerType = 'select'
      }
    } else {
      question.answerType = snapshot.answerType
      question.questionSource = snapshot.questionSource
    }

    if (question.questionSource === 'letter') {
      question.text = this.currentQuestionLetter.letter
      question.hint = this.currentQuestionLetter.description.join(', ')
      question.optionsToSelect = this.currentQuestionLetter.description.length
    }

    if (question.questionSource === 'description') {
      question.text = this.currentQuestionLetter.description.join(', ')
      question.hint = this.currentQuestionLetter.letter
    }

    question.options = this.buildOptions(question.questionSource, question.answerType)

    this.currentQuestion = question

    return question
  }

  buildOptions(questionSource: QuizQuestionSource, answerType: QuizAnswerType): QuizOption[] {
    const options: QuizOption[] = []

    if (answerType === 'select') {
      this.currentGroup.letters.forEach((lettersItem) => {
        if (questionSource === 'description') {
          const option: QuizOption = {
            id: this.getUniqueId(),
            text: lettersItem.letter
          }

          options.push(option)
        }

        if (questionSource === 'letter') {
          options.push(...lettersItem.description.map((description: string) => ({
            id: this.getUniqueId(),
            text: description
          })))
        }
      })
    }

    shuffleArray(options)

    return options
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

  questionIsPossiblyRemembered(letter: AlphabetLetter) {
    return Number(letter.score) > this.MIN_SCORE_TO_REMEMBER
  }
}

export default AlphabetQuiz
