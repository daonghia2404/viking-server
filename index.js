const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { DB_URI } = require('./src/common/static-data')

const app = express()
const PORT = process.env.PORT || 3000

// parse application/json
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
 

const initConnectDb = async () => {
  try {
    const dbOptions = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true
    }
    const db = await mongoose.createConnection(DB_URI, dbOptions)
    const gfs = Grid(db.db, mongoose.mongo)
    gfs.collection('uploads')
    app.set('gfs', gfs);

    
    await mongoose.connect(DB_URI, dbOptions)

    app.listen(PORT, () => {
      console.log(`App listening at http://localhost:${PORT}`)
    })
  } catch (err) {
    console.log(err)
  }
}
initConnectDb()

// Routes
const userRoute = require('./src/routes/auth/auth')
const uploadsRoute = require('./src/routes/uploads/uploads')
const newfeedRoute = require('./src/routes/newfeed/newfeed')

app.get('/', (req, res) => {
  res.send('Welcome to Viking Server !!')
})

app.use(userRoute)
app.use(uploadsRoute)
app.use(newfeedRoute)

// Deploy
if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}