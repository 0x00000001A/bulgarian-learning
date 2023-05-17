import {ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState} from 'react'
import Quiz from './lib/AlphabetQuiz'

import bulgarian from './bulgrarian.json'
import {QuizQuestion} from './lib/types.ts'

const quiz = new Quiz()

const ANSWER_STATUSES = {
  NONE: 0,
  FAIL: 1,
  SUCC: 2
}

function App() {
  const [showHint, setShowHint] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [answerStatus, setAnswerStatus] = useState(ANSWER_STATUSES.NONE)
  
  const [question, setQuestion] = useState<QuizQuestion>({
    text: '',
    hint: '',
    group: '',
    score: 0,
    options: [],
    progress: 0,
    remembered: false
  })
  
  const loadLanguages = useCallback(() => {
    const stored = localStorage.getItem('al-bulgarian')
    
    if (stored) {
      quiz.useSnapshot(JSON.parse(stored))
    } else {
      quiz.start(bulgarian)
    }
    
    setQuestion(quiz.getQuestion())
  }, [])
  
  const answer = useCallback((option: string) => {
    if (!quiz.isCorrect(option)) {
      setAnswerStatus(ANSWER_STATUSES.FAIL)
    } else {
      setAnswerStatus(ANSWER_STATUSES.SUCC)
    }
    
    setTimeout(() => {
      setTextAnswer('')
      setShowHint(false)
      quiz.next(option)
      setQuestion(quiz.getQuestion())
      localStorage.setItem('al-bulgarian', JSON.stringify(quiz.getSnapshot()))
      setAnswerStatus(ANSWER_STATUSES.NONE)
    }, 1000)
  }, [])
  
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
  
  const isOptionsMode = useMemo(() => {
    return !!question.options.length
  }, [question])
  
  const resetProgress = useCallback(() => {
    if (confirm('Sure?')) {
      localStorage.removeItem('al-bulgarian')
      window.location.reload()
    }
  }, [])
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadLanguages, [])
  
  return (
    <div className={'quizCard'}>
      <div className={'quizProgress'}>
        <div className={'quizProgressInner'} style={{width: `${question.progress}%`}}></div>
      </div>
      <span className={'quizTextSmall quizTextSecondary'}>Раздел: {question.group}</span>
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
        {
          isOptionsMode &&
          question.options.map((option) => (
            <button
              key={option.id}
              className={'quizButton'}
              onClick={() => answer(option.text)}
              disabled={!!answerStatus}
            >
              {option.text}
            </button>
          ))
        }
        {
          !isOptionsMode &&
          <form className={'quizForm'} onSubmit={handleManualAnswer} autoComplete={'off'}>
            <input
              onChange={handleTextAnswerChange}
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
