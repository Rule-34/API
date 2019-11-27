const express = require('express')
const path = require('path')
// Plugins
const logger = require('morgan')
const helmet = require('helmet')

// Routes
const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')

// Assigning plugins
const app = express()

app.use(helmet())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', indexRouter)
app.use('/users', usersRouter)

module.exports = app
