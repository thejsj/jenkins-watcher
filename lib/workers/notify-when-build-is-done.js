const Promise = require('bluebird')

const client = require('twilio')(
  process.env.TWILIO_ACCOUNTSID,
  process.env.TWILIO_AUTHTOKEN
)

const WorkerStopError = require('error-cat/errors/worker-stop-error')
const jenkins = require('../utils/jenkins.js')
const Log = require('../utils/log.js')

module.exports = Promise.method((data) => {
  const jobName = data.jobName
  const buildNumber = data.buildNumber
  const phoneNumber = data.phoneNumber
  const log = Log.child({ job: data })
  return Promise.resolve()
    .then(async () => {
      log.info('Starting...')
      let job
      try {
        log.trace('Attempting to get job')
        job = await jenkins.job_infoAsync(jobName)
      } catch (error) {
        log.error({ error })
        throw new WorkerStopError(`job with name ${jobName} doesn't exist`)
      }
      let build
      try {
        log.trace('Attempting to get build')
        build = await jenkins.build_infoAsync(jobName, buildNumber)
      } catch (error) {
        throw new WorkerStopError(`build with number ${buildNumber} from ${jobName} doesn't exist`)
      }
      log.trace('Build aquired')
      if (build.result === null) {
        log.info(`Build with number ${buildNumber} from ${jobName} has not finished. Retrying later...`)
        throw new Error(`Build with number ${buildNumber} from ${jobName} has not finished. Retrying later...`)
      }
      if (!phoneNumber) {
        log.trace(`Phone number: ${phoneNumber}`)
        throw new WorkerStopError(`No phone number specified`)
      }
      let message
      try {
        const body = `Build Update ${jobName} (${buildNumber}): ${build.result}`
        message = await client.messages.create({
          from: process.env.TWILIO_FROM_PHONENUMBER,
          to: phoneNumber,
          body
        })
      } catch (error) {
        log.error({ error })
        console.log(error)
        throw new WorkerStopError(`Failed to send message: ${jobName}, ${buildNumber}:`)
      }
      log.info(message)
      log.info('Done')
      return
    })
    .then(() => Promise.resolve(true))
});
