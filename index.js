require('dotenv').config()
const ponos = require('ponos')

const jobHandler = require('./lib/workers/notify-when-build-is-done.js')
const Log = require('./lib/utils/log.js')
const jenkins = require('./lib/utils/jenkins.js')

const opts = {
  rabbitmq: {
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD
  },
  log: Log
}

const server = new ponos.Server(Object.assign({
  events: {
    'notify-when-build-is-done': jobHandler
  }
}), opts)


process.on('SIGINT', () => {
  server.stop()
    .then(() => { Log.info('Server stopped') })
    .catch((err) => { Log.error('server stop error:', err.stack || err.message || err) })
    .then(() => process.exit(1))
})

server.start()
  .then(async () => {
    Log.info('Server started!')
    const jobs = await jenkins.all_jobsAsync()
    const jobNames = jobs.map(x => x.name)
  })
   .catch((err) => { Log.error('Server failed', err) })

