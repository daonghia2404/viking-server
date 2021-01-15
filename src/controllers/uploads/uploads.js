const formidable = require('formidable')
const crypto = require('crypto')
const GridFsStorage = require('multer-gridfs-storage')
const path = require('path')
const multer = require('multer')
const { validateFileSize } = require('../../utils/validation')
const { DB_URI } = require('../../common/static-data')

const storage = new GridFsStorage({
  url: DB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err)
        const filename = buf.toString('hex') + path.extname(file.originalname)
        const fileInfo = {
          filename,
          bucketName: 'uploads',
        }
        resolve(fileInfo)
      })
    })
  },
})
const upload = multer({ storage })

const checkFileSize = (req, res, next) => {
  const file = { size: Number(req.headers['content-length']) }
  if (!validateFileSize(file)) {
    return res.json({
      success: false,
      message: 'Kích thước tối đa của file là 5MB',
    })
  } else {
    next()
  }
}

const parseFormData = (req, res, next) => {
  const form = formidable({ multiples: true })
  form.parse(req, (err, fields, files) => {
    if (err)
      return res.json({
        success: false,
        message: err,
      })
    req.response = { fields, files }
    next()
  })
}

module.exports = { checkFileSize, parseFormData, upload }
