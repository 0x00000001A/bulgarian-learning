import {ChangeEvent, FormEvent, useCallback, useEffect, useState} from 'react'
import Quiz from './lib/Quiz.ts'

import bulgarian from './data.json'
import {QuizOption, QuizQuestion} from './lib/types.ts'
import AppToggleButton from "./components/AppToggleButton.tsx";

const quiz = new Quiz()

const ANSWER_STATUSES = {
  NONE: 0,
  FAIL: 1,
  SUCC: 2
}

type AppQuizOption = QuizOption & {
  selected: boolean
}

function App() {
  const [options, setOptions] = useState<AppQuizOption[]>([])
  const [showHint, setShowHint] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [answerStatus, setAnswerStatus] = useState(ANSWER_STATUSES.NONE)

  const [question, setQuestion] = useState<QuizQuestion>({
    progress: 0,
    answerType: 'select',
    questionSource: 'answers',
    optionsToSelect: 1,
    options: [],
    hint: '',
    text: '',
    remembered: false,
    score: 0,
    group: ''
  })

  const handleNextQuestion = useCallback(() => {
    const question = quiz.currentQuestion
    setQuestion(question)

    localStorage.setItem('al-bulgarian', JSON.stringify(quiz.getSnapshot()))
    setAnswerStatus(ANSWER_STATUSES.NONE)
    setTextAnswer('')
    setShowHint(false)
    setOptions(question.options.map((option) => ({
      ...option,
      selected: false
    })))
  }, [])

  const loadLanguages = useCallback(() => {
    const stored = localStorage.getItem('al-bulgarian')

    if (stored) {
      quiz.useSnapshot(JSON.parse(stored))
    } else {
      quiz.start(bulgarian)
    }

    handleNextQuestion()
  }, [handleNextQuestion])

  const handleOptionSelection = useCallback((answerText: string) => {
    const updatedOptions = options.map((optionsItem) => ({
      ...optionsItem,
      selected: optionsItem.text === answerText ? !optionsItem.selected : optionsItem.selected
    }))

    setOptions(updatedOptions)

    return updatedOptions
  }, [options])

  const answer = useCallback((answerText: string) => {
    let answer = [answerText]
    let isCorrectAnswer = quiz.isCorrect(answer)

    if (question.answerType === 'select') {
      const options = handleOptionSelection(answerText)
      answer = options.filter((option) => {
        return option.selected
      }).map((option) => {
        return option.text
      })

      isCorrectAnswer = quiz.isCorrect(answer)
    }

    if (question.optionsToSelect === answer.length) {
      setAnswerStatus(isCorrectAnswer ? ANSWER_STATUSES.SUCC : ANSWER_STATUSES.FAIL)

      setTimeout(() => {
        quiz.next(answer)
        handleNextQuestion()
      }, 1000)
    }
  }, [handleNextQuestion, handleOptionSelection, question.answerType, question.optionsToSelect])

  const handleManualAnswer = useCallback((event: FormEvent) => {
    event.preventDefault()
    answer(textAnswer.trim().toLowerCase())
  }, [answer, textAnswer])

  const handleTextAnswerChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setTextAnswer(event.target.value)
  }, [])

  const toggleHint = useCallback(() => {
    setShowHint(!showHint)
  }, [showHint])

  const resetProgress = useCallback(() => {
    if (confirm('Sure?')) {
      localStorage.removeItem('al-bulgarian')
      window.location.reload()
    }
  }, [])

  const renderOptionsItem = useCallback((option: AppQuizOption) => {
    return (
      <AppToggleButton
        key={option.id}
        label={option.text}
        value={option.text}
        selected={option.selected}
        disabled={!!answerStatus}
        onClick={answer}
      />
    )
  }, [answer, answerStatus])

  const renderOptions = useCallback(() => {
    if (question.answerType === 'select') {
      return options.map(renderOptionsItem)
    }

    return null
  }, [options, question.answerType, renderOptionsItem])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadLanguages, [])

  if (!question) {
    return null
  }

  return (
    <div className={'quizCard'}>
      <div className={'quizProgress'}>
        <div className={'quizProgressInner'} style={{width: `${question.progress}%`}}></div>
      </div>
      <span className={'quizTextSmall quizTextSecondary quizTextCenter'}>
        <span className={'quizTextBold'}>Раздел: {question.group}</span> <br/>
        {
          question.answerType === 'select' &&
          question.optionsToSelect > 1 &&
          `Выберите все (${question.optionsToSelect}) правильные варианты`
        }
        {
          question.answerType === 'select' &&
          question.optionsToSelect === 1 &&
          'Выберите единственнный правильный ответ'
        }
        {
          question.answerType === 'text' &&
          'Введите ответ в текстовое поле'
        }
      </span>
      <span className={'quizQuestion'}>
        {question.text}
      </span>
      <div>
        {
          showHint && !answerStatus &&
          <span className={'quizHint quizTextDanger quizTextBold'}>
            {question.hint}
          </span>
        }
        {
          !showHint && answerStatus === ANSWER_STATUSES.NONE &&
          <button className={'quizButton quizButtonSmall quizTextSecondary'} onClick={toggleHint}>
            Show hint
          </button>
        }
        {
          answerStatus === ANSWER_STATUSES.FAIL &&
          <span className={'quizHint quizTextDanger'}>
            Wrong answer!
          </span>
        }
        {
          answerStatus === ANSWER_STATUSES.SUCC &&
          <span className={'quizHint quizTextSuccess'}>
            Correct!
          </span>
        }
      </div>
      <div className={'quizOptions'}>
        {renderOptions()}
        {
          question.answerType === 'text' &&
          <form className={'quizForm'} onSubmit={handleManualAnswer} autoComplete={'off'}>
            <input
              onChange={handleTextAnswerChange}
              value={textAnswer}
              className={'quizInputText'}
              type={'text'}
              placeholder={'Answer here'}
              autoFocus
            />
            <button className={'quizButton'} type={'submit'}>
              Submit
            </button>
          </form>
        }
      </div>
      <button className={'quizButton quizButtonSmall quizTextSecondary'} onClick={resetProgress}>
        Reset progress
      </button>
    </div>
  )
}

export default App
