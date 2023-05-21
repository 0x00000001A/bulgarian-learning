import {
  QuizDataObject,
  QuizAnswerType,
  QuizOption,
  QuizQuestion,
  QuizQuestionSource,
  QuizSnapshot
} from './types.ts'
import QuizData from './QuizData.ts'
import QuizDataGroup from './QuizDataGroup.ts'
import {getRandomUpTo, shuffleArray} from './utils.ts'
import PriorityQueue from './PriorityQueue.ts'
import QuizDataQuestion from "./QuizDataQuestion.ts";

class Quiz {
  data: QuizData
  currentGroup: QuizDataGroup
  currentQuestion: QuizQuestion
  currentDatabase: PriorityQueue<QuizDataGroup>
  currentQuestionData: QuizDataQuestion

  MIN_SCORE_TO_REMEMBER: number
  MIN_SCORE_TO_ACCEPT_PROGRESS: number

  constructor() {
    this.MIN_SCORE_TO_REMEMBER = 1
    this.MIN_SCORE_TO_ACCEPT_PROGRESS = 2

    const dummyAlphabet: QuizDataObject = {
      name: '',
      groups: [{
        description: '',
        questions: [{
          text: '',
          answers: [],
          score: 0,
        }]
      }]
    }

    this.data = new QuizData(dummyAlphabet)
    this.currentGroup = this.data.groups[0]
    this.currentQuestion = this.buildQuestion()
    this.currentDatabase = new PriorityQueue<QuizDataGroup>()
    this.currentQuestionData = this.currentGroup.questions[0]
  }

  start(alphabet: QuizDataObject) {
    this.initQuestions(alphabet)
    this.next(undefined, true)
  }

  next(answerText: string[] = [], isCleanRun = false) {
    if (this.currentQuestion) {
      if (this.isCorrect(answerText)) {
        this.currentQuestionData.addScore()
      } else {
        this.currentQuestionData.reduceScore()
      }
    }

    this.changeGroup(isCleanRun)
    this.buildQuestion()
  }

  isCorrect(answer: string[]) {
    const questionText = this.currentQuestionData.text.toLowerCase()
    const questionAnswers = this.currentQuestionData.answers.sort().join(', ').toLowerCase()

    const userAnswerWithFixes = answer.sort().join(', ').trim().toLowerCase()

    if (this.currentQuestion.questionSource === 'text') {
      return questionAnswers === userAnswerWithFixes
    }

    return questionText === userAnswerWithFixes
  }

  getUniqueId() {
    const dateString = Date.now().toString(36)
    const randomness = Math.random().toString(36).substring(2)
    return dateString + randomness
  }

  getProgress() {
    let total = 0
    let progress = 0

    this.data.groups.forEach((group) => {
      group.questions.forEach((question) => {
        if (question.score > this.MIN_SCORE_TO_ACCEPT_PROGRESS) {
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
      alphabet: this.data.toObject(),
      question: this.currentQuestionData.id,
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
      this.currentDatabase.push(this.data.getGroup(i))
    }

    this.currentGroup = this.data.getGroup(snapshot.group)
    this.currentQuestion = this.buildQuestion(snapshot)
    this.MIN_SCORE_TO_REMEMBER = snapshot.minScoreToRemember
    this.MIN_SCORE_TO_ACCEPT_PROGRESS = snapshot.minScoreToAcceptProgress
  }

  initQuestions(alphabet: QuizDataObject) {
    this.data = new QuizData(alphabet)
    this.currentGroup = this.data.groups[0]
    this.currentDatabase = new PriorityQueue<QuizDataGroup>(this.data.groupsCount)
    this.currentDatabase.setComparator((groupA, groupB) => {
      let aScore = 0
      let bScore = 0
      const aSize = groupA.questionsCount
      const bSize = groupB.questionsCount

      const size = Math.min(aSize, bSize)

      for (let i = 0; i < size; i++) {
        aScore += groupA.questions[i].score
        bScore += groupB.questions[i].score
      }

      return aScore < bScore
    })

    this.currentDatabase.push(this.data.getGroup(0))
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
    this.currentQuestionData = this.currentGroup.questions[getRandomUpTo(this.currentGroup.questionsCount)]

    if (snapshot?.question) {
      this.currentQuestionData = this.currentGroup.questions[snapshot.question]
    }

    const nextQuestionAnswerTypes: QuizAnswerType[] = ['text', 'select']
    const nextQuestionSources: QuizQuestionSource[] = ['text', 'answers']
    const question: QuizQuestion = {
      hint: '',
      text: '',
      group: this.currentGroup.description,
      score: this.currentQuestionData.score,
      options: [],
      progress: this.getProgress(),
      remembered: this.questionIsPossiblyRemembered(this.currentQuestionData),
      answerType: 'select',
      questionSource: 'text',
      optionsToSelect: 1,
    }

    if (!snapshot) {
      if (question.remembered) {
        question.questionSource = nextQuestionSources[Math.round(Math.random())]
        question.answerType = nextQuestionAnswerTypes[Math.round(Math.random())]
      }

      // if question source is "text" and there is more than one options to select
      // then do not allow manual user input
      if (question.questionSource === 'text' && this.currentQuestionData.answers.length > 1) {
        question.answerType = 'select'
      }
    } else {
      question.answerType = snapshot.answerType
      question.questionSource = snapshot.questionSource
    }

    if (question.questionSource === 'text') {
      question.text = this.currentQuestionData.text
      question.hint = this.currentQuestionData.answers.join(', ')
      question.optionsToSelect = this.currentQuestionData.answers.length
    }

    if (question.questionSource === 'answers') {
      question.text = this.currentQuestionData.answers.join(', ')
      question.hint = this.currentQuestionData.text
    }

    question.options = this.buildOptions(question.questionSource, question.answerType)

    this.currentQuestion = question

    return question
  }

  buildOptions(questionSource: QuizQuestionSource, answerType: QuizAnswerType): QuizOption[] {
    const options: QuizOption[] = []

    if (answerType === 'select') {
      this.currentGroup.questions.forEach((question) => {
        if (questionSource === 'answers') {
          const option: QuizOption = {
            id: this.getUniqueId(),
            text: question.text
          }

          options.push(option)
        }

        if (questionSource === 'text') {
          options.push(...question.answers.map((answer: string) => ({
            id: this.getUniqueId(),
            text: answer
          })))
        }
      })
    }

    shuffleArray(options)

    return options
  }

  increaseDifficultyIfNeeded(groupWithLowestScore: QuizDataGroup) {
    const haveQuestionToBeLearned = groupWithLowestScore.questions.some((question) => {
      return question.score < this.MIN_SCORE_TO_REMEMBER
    })

    if (!haveQuestionToBeLearned) {
      const nextGroup = this.data.getGroup(this.currentDatabase.size)

      if (nextGroup) {
        this.currentDatabase.push(nextGroup)
      }
    }
  }

  questionIsPossiblyRemembered(question: QuizDataQuestion) {
    return Number(question.score) > this.MIN_SCORE_TO_REMEMBER
  }
}

export default Quiz
