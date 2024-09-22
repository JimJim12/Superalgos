runRoot()

async function runRoot() {
  /*
  This module represents the execution root of the Task Server.
  We use this module that is outside the Task Server folder to
  load all node dependencies and get them ready to the actual App.
  */

  /*
  The TS object is accessible everywhere at the Superalgos Platform Client.
  It provides access to all modules built for the Task Server.
  */
  global.TS = {}
  /*
  The SA object is accessible everywhere at the Superalgos Social Trading App.
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
  global.PROJECTS_SCHEMA_MAP = new Map()

  for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
    let projectDefinition = PROJECTS_SCHEMA[i]
    PROJECTS_SCHEMA_MAP.set(projectDefinition.name, projectDefinition)
  }
  /*
  Setting up the modules that will be available, defined at the Project Schema file.
  */
  let MULTI_PROJECT = require('./MultiProject.js')
  let MULTI_PROJECT_MODULE = MULTI_PROJECT.newMultiProject()
  MULTI_PROJECT_MODULE.initialize(TS, 'TS')
  MULTI_PROJECT_MODULE.initialize(SA, 'SA')
  /*
  Setting up external dependencies.
  */
  SA.nodeModules = {
    fs: await import('fs').then(module => module.default),
    util: await import('util').then(module => module.default),
    path: await import('path').then(module => module.default),
    ws: await import('ws').then(module => module.default),
    ip: await import('ip').then(module => module.default),
    telegraf: await import('telegraf').then(module => module.default),
    https: await import('https').then(module => module.default),
    http: await import('http').then(module => module.default),
    web3: await import('web3').then(module => module.default),
    nodeFetch: await import('node-fetch').then(module => module.default),
    ccxt: await import('ccxt').then(module => {
      const ccxtMisc = module.default.functions;
      return { default: module.default, misc: ccxtMisc };
    }),
    lookpath: await import('lookpath').then(module => module.default),
    twitter: await import('twitter-api-v2').then(module => module.default),
    slack: await import('@slack/web-api').then(module => module.default),
    discordjs: await import('discord.js').then(module => module.default),
    discordRest: await import('@discordjs/rest').then(module => module.REST),
    discordTypes: await import('discord-api-types/v9'),
    octokit: await import('@octokit/rest').then(module => module.Octokit),
    graphql: await import('@octokit/graphql').then(module => module.graphql),
    axios: await import('axios').then(module => module.default),
    crypto: await import('crypto').then(module => module.default),
    simpleGit: await import('simple-git').then(module => module.default),
    ethers: await import('ethers').then(module => module.default),
    vaderSentiment: await import('vader-sentiment').then(module => module.default)
  }
  SA.version = require('./package.json').version

  /**
   * creates a path for the log file under a Tasks folder and each task will be in a subfolder 
   * using the taskId as a folder name
   * if taskId is undefined then we have a debug action going on and taskId will be set to debug
   * `<PATH_TO_LOG_FILES>/Tasks/<TASK_ID>`
   */
  let taskId = (process.argv[2] == undefined) ? "debug" : process.argv[2]
  const saLogsPath = SA.nodeModules.path.join(global.env.PATH_TO_LOG_FILES, 'Tasks', taskId)
  SA.logger = require('./loggerFactory').loggerFactory(saLogsPath, 'TS')
  
  /* 
  Setting up the App Schema Memory Map. 
  */
  let APP_SCHEMAS = require('./AppSchemas.js')
  let APP_SCHEMAS_MODULE = APP_SCHEMAS.newAppSchemas()
  await APP_SCHEMAS_MODULE.initialize()
  /*
  Setting up Secrets.
  */
  let SECRETS = require('./Secrets.js').newSecrets()
  SECRETS.initialize()

  run()

  async function run() {
    TS.app = require('./TaskServer/TaskServer.js').newTaskServer()
    await TS.app.run()
    console.log('Superalgos TaskServer is Running!')
  }
}
