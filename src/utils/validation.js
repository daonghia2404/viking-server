const { FILE_SIZE } = require('../common/static-data')

const validateFileSize = (file, size = FILE_SIZE) => {
  const fileSize = file.size / 1024 / 1024
  return fileSize < size
}

const validateText = (value) => {
  return value && value.trim() !== ''
}

const validateUrlImage = (url) => {
  return /\.(jpeg|jpg|gif|png)$/.test(url)
}
const validateUrlAudio = (url) => {
  return /\.(?:wav|mp3)$/.test(url)
}
const validateUrlVideo = (url) => {
  return /\.(mp4|mov)$/.test(url)
}

module.exports = {
  validateFileSize,
  validateText,
  validateUrlImage,
  validateUrlAudio,
  validateUrlVideo,
}
