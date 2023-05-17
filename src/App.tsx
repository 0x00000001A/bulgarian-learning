import {Button, Card, Form, Input, Progress, Space, Typography} from 'antd'
import {useCallback, useEffect, useMemo, useState} from 'react'
import Quiz from './lib/AlphabetQuiz'

import bulgarian from './bulgrarian.json'
import {QuizOption, QuizQuestion} from './lib/types.ts'

const quiz = new Quiz()

const ANSWER_STATUSES = {
  NONE: 0,
  FAIL: 1,
  SUCC: 2
}

type FormInitial = {
  answer: string
}

function App() {
  const [form] = Form.useForm()
  const [showHint, setShowHint] = useState(false)
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
  
  const answer = useCallback((option: QuizOption) => {
    if (!quiz.isCorrect(option.text)) {
      setAnswerStatus(ANSWER_STATUSES.FAIL)
    } else {
      setAnswerStatus(ANSWER_STATUSES.SUCC)
    }
    
    setTimeout(() => {
      setShowHint(false)
      quiz.next(option.text)
      setQuestion(quiz.getQuestion())
      
      localStorage.setItem('al-bulgarian', JSON.stringify(quiz.getSnapshot()))
      
      setAnswerStatus(ANSWER_STATUSES.NONE)
    }, 1000)
  }, [])
  
  const handleManualAnswer = useCallback((values: FormInitial) => {
    answer({
      text: values.answer.toLowerCase()
    })
    form.resetFields()
  }, [answer, form])
  
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
    <Card bordered={false} className={'quizCard'}>
      <Progress style={{margin: 0}} percent={question.progress} showInfo={false} size={'small'}/>
      <Typography.Text type={'secondary'}>Раздел: {question.group}</Typography.Text>
      <Typography.Title style={{margin: '0.5em 0'}}>
        {question.text}
      </Typography.Title>
      <Space direction={'vertical'} size={'large'}>
        {
          showHint
            ? (
              <Typography.Text type={'danger'} strong>
                {question.hint}
              </Typography.Text>
            )
            : (
              <>
                {
                  answerStatus === ANSWER_STATUSES.NONE &&
                  <Button onClick={toggleHint} size={'small'} type={'text'}>Show hint</Button>
                }
                {
                  answerStatus === ANSWER_STATUSES.FAIL &&
                  <Typography.Text type={'danger'}>Wrong answer!</Typography.Text>
                }
                {
                  answerStatus === ANSWER_STATUSES.SUCC &&
                  <Typography.Text type={'success'}>Correct!</Typography.Text>
                }
              </>
            )
        }
        <Space align={'center'} className={'quizOptions'} wrap>
          {
            isOptionsMode &&
            question.options.map((option, optionIndex) => (
              <Button key={`${option.text}${optionIndex}`} onClick={() => answer(option)} disabled={!!answerStatus}
                      size={'large'}>
                {option.text}
              </Button>
            ))
          }
          {
            !isOptionsMode &&
            <Form
              form={form}
              initialValues={{answer: ''}}
              onFinish={handleManualAnswer}
              autoComplete={'off'}
              disabled={!!answerStatus}
              size={'large'}
            >
              <Form.Item name={'answer'} rules={[{required: true, message: 'Please input your answer!'}]}>
                <Space.Compact style={{width: '100%'}}>
                  <Input autoFocus placeholder={'Answer here'}/>
                  <Button type={'primary'} htmlType={'submit'}>
                    Submit
                  </Button>
                </Space.Compact>
              </Form.Item>
            </Form>
          }
        </Space>
        <Button onClick={resetProgress} size={'small'} type={'text'}>Reset progress</Button>
      </Space>
    </Card>
  )
}

export default App
