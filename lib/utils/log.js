const bunyan = require('bunyan')
module.exports = bunyan.createLogger({
  name: 'jenkins-watcher',
  stream: process.stdout,
  level: process.env.LOG_LEVEL
})
