const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
dotenv.config()

const app = express()
const PORT = 3000

// parse application/json
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
 

const dbURI = `mongodb+srv://${process.env.ACCOUNT_MONGGODB}:${process.env.PASSWORD_MONGGODB}@viking-server.a43se.mongodb.net/viking-server?retryWrites=true&w=majority`
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})
	.then((result) => {
		app.listen(PORT, () => {
			console.log(`App listening at http://localhost:${PORT}`)
		})
	})
	.catch((err) => console.log(err))


// Routes
const userRoute = require('./src/routes/auth/auth.js')

app.use(userRoute)
