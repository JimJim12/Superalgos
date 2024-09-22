runRoot()

async function runRoot() {
  /*
  This module represents the execution root of the Platform App.
  We use this module that is outside the Platform folder to
  load all node dependencies and get them ready to the actual App.
  */

  /*
  The PL object is accessible everywhere at the Superalgos Platform Client.
  It provides access to all modules built for this Client.
  */
  global.PL = {}
  /*
  The SA object is accessible everywhere at the Superalgos Platform App.
  It provides access to all modules built for Superalgos in general.
  */
  global.SA = {}

  /* Load Environment Variables */
  let ENVIRONMENT = require('./Environment.js')
  let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
  global.env = ENVIRONMENT_MODULE
  /*
  First thing is to load the project schema file.
  */
  global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)
  /*
  Setting up the modules that will be available, defined at the Project Schema file.
  */
  let MULTI_PROJECT = require('./MultiProject.js')
  let MULTI_PROJECT_MODULE = MULTI_PROJECT.newMultiProject()
  MULTI_PROJECT_MODULE.initialize(PL, 'PL')
  MULTI_PROJECT_MODULE.initialize(SA, 'SA')

  /*
  Setting up external dependencies.
  */
  SA.nodeModules = {
    fs: await import('fs').then(module => module.default),
    util: await import('util').then(module => module.default),
    path: await import('path').then(module => module.default),
    ws: await import('ws').then(module => module.default),
    web3: await import('web3').then(module => module.default),
    ethers: await import('ethers').then(module => module.default),
    ethereumjsTx: await import('ethereumjs-tx').then(module => module.default),
    ethereumjsCommon: await import('ethereumjs-common').then(module => module.default),
    nodeFetch: await import('node-fetch').then(module => module.default),
    open: await import('open').then(module => module.default),
    http: await import('http').then(module => module.default),
    ccxt: await import('ccxt').then(module => module.default),
    octokit: await import('@octokit/rest').then(module => module.Octokit),
    graphql: await import('@octokit/graphql').then(module => module.graphql),
    simpleGit: await import('simple-git').then(module => module.default),
    lookpath: await import('lookpath').then(module => module.default),
    process: await import('process').then(module => module.default),
    childProcess: await import('child_process').then(module => module.default),
    twitter: await import('twitter-api-v2').then(module => module.default),
    slack: await import('@slack/web-api').then(module => module.default),
    discordjs: await import('discord.js').then(module => module.default),
    discordRest: await import('@discordjs/rest').then(module => module.REST),
    discordTypes: await import('discord-api-types/v9').then(module => module.default),
    axios: await import('axios').then(module => module.default),
    hyperquest: await import('hyperquest').then(module => module.default),
    ndjson: await import('ndjson').then(module => module.default),
    pako: await import('pako').then(module => module.default)
  }

  const saLogsPath = SA.nodeModules.path.join(global.env.PATH_TO_LOG_FILES, 'Platform')
  SA.logger = require('./loggerFactory').loggerFactory(saLogsPath, 'SA')

  /* 
  Setting up the App Schema Memory Map. 
  */
  let APP_SCHEMAS = require('./AppSchemas.js')
  let APP_SCHEMAS_MODULE = APP_SCHEMAS.newAppSchemas()
  await APP_SCHEMAS_MODULE.initialize()
  /*
  Version Management
  */
  SA.version = require('./package.json').version
  /*
  Check if we are starting from a particular workspace.
  */
  let initialWorkspace = {}

  for (let i = 0; i < process.argv.length; i++) {
    let arg = process.argv[i]

    if (arg === 'noBrowser') { continue }
    if (arg === 'minMemo') { continue }
    if (arg.indexOf(':') >= 0) { continue }
    if (arg.indexOf('/') >= 0) { continue }

    if (initialWorkspace.project === undefined) {
      if (arg !== 'My-Workspaces') {
        initialWorkspace.type = 'Plugin'
        initialWorkspace.project = arg
      } else {
        initialWorkspace.type = 'My-Workspaces'
        initialWorkspace.project = ''
      }
    } else {
      initialWorkspace.name = arg
    }
  }

  run(initialWorkspace)

  async function run(initialWorkspace) {
    PL.app = require('./Platform/PlatformApp.js').newPlatformApp()
    await PL.app.run(initialWorkspace)
    SA.logger.info('Superalgos Platform App is Running!')
    if (process.send) {
      process.send('Running')
    }
  }
}