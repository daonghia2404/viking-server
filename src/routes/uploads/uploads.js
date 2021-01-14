const express = require("express");
const crypto = require('crypto')
const router = express.Router();
const { DB_URI, IMAGES_TYPE, VIDEO_TYPE } = require('../../common/static-data')
const GridFsStorage = require('multer-gridfs-storage');
const path = require('path')
const multer = require('multer')

const storage = new GridFsStorage({
  url: DB_URI,
  file: (req, file) => {
    return new Promise ((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err)
        const filename = buf.toString('hex') + path.extname(file.originalname)
        const fileInfo = {
          filename,
          bucketName: 'uploads'
        }
        resolve(fileInfo)
      })
    })
  }
})
const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ 
    success: true,
    response: {
      file: req.file
    }
  })
})

router.delete('/upload/:filename', (req, res) => {
  const gfs = req.app.get('gfs')
  gfs.remove({ filename: req.params.filename, root: 'uploads' }, (err, files) => {
    if (err) return res.json({
     success: false,
     message: err,
   })
    res.json({
      success: true,
      response: {},
    })
  })
})

router.get('/image/:filename', (req, res) => {
  const gfs = req.app.get('gfs')
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (err) return res.sendStatus(500)
    if (!file) return res.sendStatus(404)
    if (IMAGES_TYPE.includes(file.contentType)) {
      const readstream = gfs.createReadStream(file.filename)
      readstream.pipe(res)
    } else {
      res.sendStatus(404)
    }
  })
})


router.get('/video/:filename', (req, res) => {
  const gfs = req.app.get('gfs')
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (err) return res.sendStatus(500)
    if (!file) return res.sendStatus(404)
    if (VIDEO_TYPE.includes(file.contentType)) {
      const readstream = gfs.createReadStream(file.filename)
      readstream.pipe(res)
    } else {
      res.sendStatus(404)
    }
  })
})

router.get('/file/:filename', (req, res) => {
  const gfs = req.app.get('gfs')
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (err) return res.sendStatus(500)
    if (!file) return res.sendStatus(404)
    if (!IMAGES_TYPE.includes(file.contentType) && !VIDEO_TYPE.includes(file.contentType)) {
      const readstream = gfs.createReadStream(file.filename)
      readstream.pipe(res)
    } else {
      res.sendStatus(404)
    }
  })
})


module.exports = router
