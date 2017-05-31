const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const moment = require('moment')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const WORKSHEET_ID = `1zcAt01Nh6jGgM1xcY6PinmgsPSHyeapxr4BkoNS1S74`
let QUESTIONS = []

app.get('/update', async (req, res) => {
  try {
    QUESTIONS = await getQuestions(WORKSHEET_ID)
    res.json({
      success: true
    })
  }
  catch(error) {
    res.json({
      error,
    })
  }
})

app.get('/question', (req, res) => {
  const { category, question } = QUESTIONS.find(question => moment(question.date).isSame(moment(), 'day'))

  res.json({
    messages: [
      {
        text: `Today's question is from the ${category} category. Here it goes!`
      },
      {
        text: question
      }
    ]
  })

})

app.post('/answer', (req, res) => {
  const { answer } = QUESTIONS.find(question => moment(question.date).isSame(moment(), 'day'))
  const attemptedAnswer = req.body.answer

  if(attemptedAnswer.toLowerCase() === answer.toLowerCase()) {
    res.json({
      messages: [
        {
          text: "Yes that's correct! Congratulations!"
        },
        {
          text: "Good luck for tomorrow's question!"
        }
      ]
    })
  }
  else {
    res.json({
      messages: [
        {
          text: "Sorry, that's not the right answer!"
        },
        {
          text: "Try again tomorrow!"
        }
      ]
    })
  }
})

const getQuestions = async (workSheetId) => {
  try {
    const worksheets = await fetch(`https://spreadsheets.google.com/feeds/worksheets/${WORKSHEET_ID}/public/values?alt=json`).then(res => res.json())
    const worksheet = worksheets.feed.entry.find(sheet => sheet.title['$t'] === 'Questions')
    const worksheetUrl = worksheet.link[0].href

    const questionsData = await fetch(`${worksheetUrl}?alt=json`).then(res => res.json())
    const questions = questionsData.feed.entry.map(row => ({
      category: row['gsx$category']['$t'],
      question: row['gsx$question']['$t'],
      answer: row['gsx$answer']['$t'],
      date: moment(row['gsx$date']['$t'], 'MM/DD/YYYY')
    }))

    return questions
  }
  catch(error) {
    console.error(error)
    return []
  }
}

const start = async (app) => {
  QUESTIONS = await getQuestions(WORKSHEET_ID)
  await app.listen(process.env.SERVER_PORT)
  console.log('Chatfuel bot server is listening...')
}

start(app)