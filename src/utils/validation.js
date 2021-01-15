const { FILE_SIZE } = require('../common/static-data')

const validateFileSize = (file, size = FILE_SIZE) => {
  const fileSize = file.size / 1024 / 1024
  return fileSize < size
}

module.exports = { validateFileSize }
