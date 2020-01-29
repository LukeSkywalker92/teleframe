const fs = require('fs');

// The only one instance of the AddonInterface class
let addonInterfaceObj = null;

// input event names will be used to send to the TeleFrame renderer
const validInputEvents = [
  'next',
  'previous',
  'pause',
  'play',
  'playPause',
  'newest',
  'delete',
  'star',
  'mute',
  'reboot',
  'shutdown',
  'record',
  'askConfirm',
  'askCancel',
  'messageBox',  // send info to the renderer. argument: config object for sweetalert2. Requires to define 'title' or 'html' { title: 'info to display' }
  'imagesUpdated', // send the updated images array to the renderer. argument: the updated images object
  'reloadRenderer',
];

// listen event names
const validListenEvents = [
  'renderer-ready',     // renderer was initialized
  'images-loaded',      // fired only once when the images object was initialized
  'teleFrame-ready',    // Fired only once when TeleFrame has initialized the objects. Arguments: prepared and running TeleFrame objects { config, imageWatchdog, bot, voiceReply}
  'starImage',          // arguments: currentImageIndex
  'unstarImage',        // arguments: currentImageIndex
  'deleteImage',        // arguments: currentImageIndex
  'imageDeleted',       // an image was deleted and the images array is up to date now
  'removeImageUnseen',  // Request to remove the unseen status of all images
  'newImage',           // New image notification
  'paused',             // Notification that the pause status has changed. Arguments: paused true|false
  'muted',              // Notification that the mute status has changed. Arguments: paused true|false
  'recordStarted',
  'recordStopped',
  'recordError',
  'changingActiveImage',  // before changing. arguments: currentImageIndex, fadeTime
  'changedActiveImage',   // after changed. arguments: currentImageIndex
];

/**
 * Generates a logger object which uses a name prefix
 * @param  {string} name         prefix output as [name]
 * @param  {object} logger       logger from TeleFrame
 * @param  {array} enabledTypes logger Types one or more of ['info', 'warn', 'error']
 * @return {object}             winston
 */
const getClassLogger = (name, logger, enabledTypes) => {
  const loggerObj = {};
  ['info', 'warn', 'error'].forEach(type => {
    loggerObj[type] = (...args) => {
      if (enabledTypes.indexOf(type) > -1) {
        logger[type](`[${name}] ${args}`);
      }
    }
  });
  loggerObj.log = logger.info
  return loggerObj;
}

/**
 * Remove invalid characters from the name from security reasons
 * @param  {string} addonName [description]
 * @return {string}           removed characters
 */
const removeInvalidAddonNameChars = (addonName) => addonName.replace(/\.\/\s/g, '');

/**
 * Class to throw addon errors
 * @extends Error
 */
class AddonError extends Error {
  constructor(error) {
    super(error);
  }
}

/**
 * AddonInterface loadsand handle the configured addons
 */
class AddonInterface {
  constructor(images, logger, emitter, ipcMain, config) {
    if (addonInterfaceObj !== null) {
      throw new AddonError("Only one instance of the AddonInterface-class is allowed.");
    }
    // set reference
    addonInterfaceObj = this;

    //  references to the addon instances
    this.addons = [];
    // TeleFrame objects
    this.emitter = emitter;
    this.ipcMain = ipcMain;
    this.images = images;
    // registered addon event listener names
    this.listeners = [];
    this.logger = getClassLogger(this.constructor.name, logger, config.addonInterface.logging);

    // load configured addons
    this.logger.info('Load addons...')
    Object.keys(config.addonInterface.addons).forEach(addonName => {
      // remove invald characters from addon name
      addonName = removeInvalidAddonNameChars(addonName);
      if (config.addonInterface.addons[addonName].enabled === false) {
        this.logger.warn(`Addon ${addonName} disabled in config.`);
        return false;
      }
      if (addonName !== 'addonInterface' && typeof config.addonInterface.addons[addonName] === 'object') {

        let newAddon = null;
        const addonConfig = {
          teleFrameAddonConfig: config.addonInterface.addons[addonName],
          logger: logger,
          logTypes: config.addonInterface.logging,
          images: images,
        };
        try {
          // load  addon
          let AddonClass;
          AddonClass = require(`${__dirname}/../addons/${addonName}`);
          if (AddonClass.addon) {
            AddonClass = AddonClass.addon;
          }

          if (typeof AddonClass !== 'function') {
            throw new AddonError('Invalid addon declaration! Requires class or function.');
          }
          // try to load class
          try {
            // load a AddonBase exteneded class
            newAddon = new AddonClass(addonConfig);
          } catch(loadErr) {
            if (loadErr instanceof TypeError) {
              // create instance of AddoBase and execute the exported addon init function
              // within in the constructor
              newAddon = new (class extends AddonBase {
                constructor(config, loggerName) {
                  super(config, loggerName);
                  // execute exported addon function
                  AddonClass(this);
                }
              })(addonConfig, AddonClass.name || addonName);
            } else {
              throw loadErr;
            }
          }
          // validate base class of the new addon instance
          if (newAddon instanceof AddonBase) {
            this.addons.push(newAddon);
            // get wanted event listeners
            Object.keys(newAddon.listeners).forEach(eventName => {
              if (this.listeners.indexOf(eventName) === -1) {
                  this.listeners.push(eventName);
              }
            });
          } else {
            throw new AddonError(`Invalid class declaration for addon '${addonName}'! The class must extend the AddonBase class.`);
          }
          this.logger.info(`Successfully loaded addon '${addonName}'.`);
        } catch(error) {
          this.logger.error(`Error initialize addon '${addonName}'! Addon was disabled.\n`, error.stack);
        }
      }
    });

    // initialize the requested addon isteners
    this.logger.info('Initialize addons...');
    this.listeners.forEach(eventName => {
      if (validListenEvents.indexOf(eventName) > -1) {
        // install listener
        ipcMain.on(eventName, (event, ...args) => {
          this.executeEventCallbacks(eventName, ...args);
        });
        this.logger.info(`Installed listener '${eventName}'`);
      } else {
        this.logger.warn(`Ignore definition for unknown event listener: '${eventName}'! Use one of '${validListenEvents}'`);
      }
    });

    this.logger.info('Addons loaded and initialized');
  }

  /**
   * Execute the callbacks for an event direct.
   * Called for example from Teleframe's main.js, imageWatchdog,...
   * @param  {string]} eventName [description]
   * @param  {any} args      [description]
   */
  executeEventCallbacks(eventName, ...args) {
    if (this.listeners.indexOf(eventName) > - 1) {
      this.addons.forEach(addon => {
        if (Array.isArray(addon.listeners[eventName])) {
          try {
            addon.listeners[eventName].forEach(callback => callback(...args));
          } catch(error) {
            this.logger.error(`Error execute callback for addon ${addon.name} event ${eventName}!\n`, error.stack);
          }
        }
      });
    }
  }

  /**
   * Initialize the instance of AddonInterface
   * @param  {Array} images  TeleFrame images array
   * @param  {Object} logger  TeleFrame main logger
   * @param  {Object} emitter use to send input events
   * @param  {Object} ipcMain use to install listeners
   * @param  {Object} config  TeleFrame configuration
   */
  static initAddonInterface(images, logger, emitter, ipcMain, config) {
    if (addonInterfaceObj !== null) {
      throw new AddonError("Only one instance of the AddonInterface-class is allowed.");
    }
    new AddonInterface(images, logger, emitter, ipcMain, config);
    return addonInterfaceObj;
  }

  /**
   * [addonControl description]
   * @param  {string} command   connand to use to control the addon
   * @param  {string} addonName name of the addon
   * @param  {Array} args      optional arguments
   */
  static addonControl(command, addonName, ...args) {
    if (!command
      || ['help', '--help', '-h'].indexOf(command) > -1
      || (command !== 'status' && !addonName)) {

      console.info(`\nUsage: node ${__filename} <command> <addonName> [...arguments]\n`);
    }

    // remove invald characters from addon name
    addonName = removeInvalidAddonNameChars(addonName);

    const {config} = require(__dirname + '/configuration');

    if (command === 'status') {
      let addonStatus = `
Installed in the order they are loaded when enabled:
-------------------------------------------------------------
Addon                                              | enabled
-------------------------------------------------------------
`;
      Object.keys(config.addonInterface.addons).forEach(addonName => {
        addonStatus += `${addonName.padEnd(50, ' ')} | ${config.addonInterface.addons[addonName].enabled !== false}\n`;
      });
      console.log(addonStatus);
    }

    const addonPath = path.resolve(`${__dirname}/../addons/${addonName}`);

    switch (command) {
      case 'enable':
        try {
          if (!fs.existsSync(addonPath)) {
            console.error(`Addon folder does'nt exist '${addonPath}'`);
            process.exit(1);
          }
          let updateConfig = !config.addonInterface.addons[addonName];
          if (config.addonInterface.addons[addonName] && config.addonInterface.addons[addonName].enabled === false) {
             config.addonInterface.addons[addonName].enabled = true;
          } else if (updateConfig) {
            config.addonInterface.addons[addonName] = { enabled: true};
          }
          if (updateConfig) {
            config.writeConfig();
            console.info(`Enabled addon '${addonName}'.`);
          } else {
            console.info(`Nothing to do. Addon '${addonName}' was already enabled.`);
          }
        } catch(error) {
          console.error(`Error enable addon '${addonName}'!\n`, error.stack);
        }
        break;
      case 'disable':
        try {
          if (config.addonInterface.addons[addonName] && config.addonInterface.addons[addonName].enabled !== false) {
            config.addonInterface.addons[addonName].enabled = false;
            config.writeConfig();
            console.info(`Disabled addon '${addonName}'.`);
          } else {
            console.info(`Nothing to do. Addon '${addonName}' was already disabled or not installed.`);
          }
        } catch(error) {
          console.error(`Error updating config to enable addon '${addonName}'!\n`, error.stack);
        }
        break;
      case 'remove':
        try {
          if (config.addonInterface.addons[addonName]) {
            delete config.addonInterface.addons[addonName];
            config.writeConfig();
            console.info(`Removed addon '${addonName}'.`);
          } else {
            console.info(`Nothing to do. Addon '${addonName}' was not enabled or installed.`);
          }
        } catch(error) {
          console.error(`Error updating config to remove addon '${addonName}'!\n`, error.stack);
        }
        break;
      case 'config': // key value
        if (args.length < 2) {
          console.error(`Error configuring addon '${addonName}'! Too few argunments. Requires <key> <value> `);
          process.exit(1);
        }
        if (!config.addonInterface.addons[addonName]) {
          console.error(`Error configuring not installed addon '${addonName}'!`);
          process.exit(1);
        }

        // try to load addon config object;
        let configCtrl;
        try {
          configCtrl = require(addonPath).configCtrl;
        } catch(error) {
          console.error(`Failed to load configControl for addon '${addonName}!`, error.stack)
        }

        const setConfigValue = (key, value) => {
          config.addonInterface.addons[addonName][key] = value;
          return true;
        }

        try {
          let writeConfig = false;
          if (typeof configCtrl === 'function') {
            console.info(`Use configCtrl function from addon '${addonName}'.`);
            writeConfig = configCtrl(config.addonInterface.addons[addonName], setConfigValue, ...args);
          } else {
            config.addonInterface.addons[addonName][args[0]] = args[1];
            writeConfig = setConfigValue(args[0], args[1]);

          }
          if (writeConfig) {
            config.writeConfig();
            console.info(`Config changed for addon '${addonName}'.`);
          }
        } catch(error) {
          console.error(`Error updating config for addon '${addonName}'!\n`, error.stack);
        }
        break;
    }

  };  // addonControl

};   // end class AddonInterface

/**
 *  The base class for TeleFrame addons contains members to send or listen for
 *  events to/from the renderer process.
 */
class AddonBase {
  /**
   * Initialize the addon
   * @param {Object} addonConfig configuration for the addon given from AddonInterface
   * @param {undefined|String} loggerName the class/function name to for log outputs. Only used if the class is constructed for an addon declared as a function.
   */
  constructor(addonConfig, loggerName) {
    if (addonInterfaceObj === null) {
      throw new AddonError('AddonInterface was not initialized.');
    }

    /**
     * Declare name prefix for log output
     * @type {string}
     */
    this._name = loggerName || this.constructor.name;

    /**
     * The TeleFrame images object
     * @type {Array}
     */
    this._images = addonConfig.images;

    /**
     * Private logger generated from the TeleFrame logger Object
     * @type {Object} winston
     */

    this._logger = getClassLogger(`addon ${this.name}`, addonConfig.logger, addonConfig.logTypes);


    /**
     * Event listener callbacks
     * @type {Array} each entry contains an object {<eventName>: [array of callbacks to execute]}
     */
    this.listeners = [];

    /**
     * The config section from TeleFrame.config.addonInterface.addons['addonName'] for this addon
     * @type {Object}
     */
    this._config;

     // prepare the config to use for the addon
    // remove parts from addonConfig
    delete addonConfig.images;
    delete addonConfig.logger;
    // assign the teleFrameConfig options to the root
    Object.assign(addonConfig, addonConfig.teleFrameAddonConfig);
    // remove  teleFrameConfig
    delete addonConfig.teleFrameAddonConfig;
    // assign the prepared config to this.config
    this._config = addonConfig;
  }

  /**
   * Returns the name prefix for log putputs
   * @return {string} name prefix
   */
  get name() {
    return this._name;
  }

  /**
   * Returns the images array
   * @return {Array} images
   */
  get images() {
    return this._images;
  }

  /**
   * Returns the logger instance
   * @return {Object} logger
   */
  get logger() {
    return this._logger;
  }

  /**
   * Returns the config instance
   * @return {Object} logger
   */
  get config() {
    return this._config;
  }

  /**
   * Register listeners for events sent from the TeleFrame renderer
   * @param  {string|Array}   eventName  name or array of names for the event to listen to
   * @param  {Function|Array} callbacks  function/array of functions to execute when the event was fired
   */
  registerListener(eventName, callbacks) {
    if (!Array.isArray(eventName)) {
      eventName = [eventName];
    }
    eventName.forEach(name => {
      if (!this.listeners[name]) {
        this.listeners[name] = [];
      }
      if (!Array.isArray(callbacks)) {
        callbacks = [callbacks];
      }
      this.listeners[name].push(...callbacks);
    });
  }

  /**
   * Send an input event to the TeleFrame renderer
   * @param  {string} eventName name of the event to send to the TeleFrame renderer
   * @param {Array}   args  optional arguments to send
   */
  sendEvent(eventName, ...args) {
    if (validInputEvents.indexOf(eventName) > -1) {
      try {
        addonInterfaceObj.emitter.send(eventName, ...args);
      } catch(error) {
        this.logger.error(`Error send input event ${eventName}!\n`, error.stack);
      }
    } else {
      this.logger.warn(`sendEvent: Ignored invalid eventName '${eventName}'!`)
    }
  }

};  // class AddonBase


/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = {
    initAddonInterface: AddonInterface.initAddonInterface,
    AddonBase,
    AddonError,
    addonControl: AddonInterface.addonControl
  };

}
