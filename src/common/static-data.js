const dotenv = require('dotenv')
dotenv.config()

const DB_URI = `mongodb+srv://${process.env.ACCOUNT_MONGGODB}:${process.env.PASSWORD_MONGGODB}@viking-server.a43se.mongodb.net/viking-server?retryWrites=true&w=majority`
const IMAGES_TYPE = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
const VIDEO_TYPE = ['video/mp4']
const AUDIO_TYPE = ['mpeg/mp3']
const FILE_SIZE = 5

module.exports = { DB_URI, IMAGES_TYPE, VIDEO_TYPE, AUDIO_TYPE, FILE_SIZE }
