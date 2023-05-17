import {Button, Card, Col, Form, Input, Progress, Row, Space, Typography} from 'antd'
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

type QuizState = {
  message: string
  options: QuizOption[]
  question: QuizQuestion
  sentence: string
  progress: number
}

type FormInitial = {
  answer: string
}

function App() {
  const [form] = Form.useForm()
  const [showHint, setShowHint] = useState(false)
  const [answerStatus, setAnswerStatus] = useState(ANSWER_STATUSES.NONE)
  
  const [state, setState] = useState<QuizState>({
    message: '',
    options: [],
    question: {} as QuizQuestion,
    sentence: '',
    progress: 0
  })
  
  const loadLanguages = useCallback(() => {
    const stored = localStorage.getItem('al-bulgarian')
    
    if (stored) {
      quiz.useSnapshot(JSON.parse(stored))
    } else {
      quiz.start(bulgarian)
    }
    
    setState({
      message: quiz.getMessage(),
      options: quiz.getOptions(),
      question: quiz.getQuestion(),
      sentence: quiz.getSentence(),
      progress: quiz.getProgress()
    })
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
      setState({
        message: quiz.getMessage(),
        options: quiz.getOptions(),
        question: quiz.getQuestion(),
        sentence: quiz.getSentence(),
        progress: quiz.getProgress()
      })
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
    return !!state.options.length
  }, [state])
  
  const resetProgress = useCallback(() => {
    if (confirm('Sure?')) {
      localStorage.removeItem('al-bulgarian')
      window.location.reload()
    }
  }, [])
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadLanguages, [])
  
  if (!state?.question?.original) {
    return null
  }
  
  return (
    <Row justify={'center'}>
      <Col xs={20} sm={16} md={16} lg={8} xl={6}>
        <Card bordered={false}>
          <Progress style={{margin: 0}} percent={state.progress} showInfo={false} size={'small'}/>
          <center>
            <Typography.Title style={{margin: '0.5em 0'}}>
              {state.question.text}
            </Typography.Title>
            <Space direction={'vertical'} size={'large'}>
              {
                (showHint || Number(state.question.original.score) <= 0) &&
                <Typography.Text>
                  {JSON.stringify(state.question.original)}
                </Typography.Text>
              }
              {
                !showHint && !!(state.question.original && state.question.original.score) &&
                <Button onClick={toggleHint} size={'small'} type={'text'}>Show hint</Button>
              }
              <Space align={'center'} wrap>
                {
                  isOptionsMode &&
                  state.options.map((option) => (
                    <Button key={option.text} onClick={() => answer(option)} disabled={!!answerStatus} size={'large'}>
                      {option.text}
                    </Button>
                  ))
                }
                {
                  !isOptionsMode &&
                  <Form initialValues={{answer: ''}} onFinish={handleManualAnswer} autoComplete={'off'}
                        disabled={!!answerStatus} size={'large'}>
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
              {
                answerStatus === ANSWER_STATUSES.FAIL &&
                <Typography.Text type={'danger'}>Wrong answer!</Typography.Text>
              }
              {
                answerStatus === ANSWER_STATUSES.SUCC &&
                <Typography.Text type={'success'}>Correct!</Typography.Text>
              }
              <Button onClick={resetProgress} size={'small'} type={'text'}>Reset progress</Button>
            </Space>
          </center>
        </Card>
      </Col>
    </Row>
  )
}

export default App
