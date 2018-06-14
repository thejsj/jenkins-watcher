const jenkinsapi = require('jenkins-api')
const Promise = require('bluebird')

const jenkinsConnectitonString = `https://${process.env.JENKINS_USER}:${process.env.JENKINS_PASSWORD}@${process.env.JENKINS_HOST}`
module.exports = Promise.promisifyAll(jenkinsapi.init(jenkinsConnectitonString))
