const langDefault = 'en';
const langPath = __dirname + '/../config/i18n/bot/';
const botPhrases = {};
const { logger, rendererLogger } = require("./logger");

const {MenuTemplate, MenuMiddleware, deleteMenuFromContext} = require('telegraf-inline-menu')

botPhrases[langDefault] = require(langPath + langDefault);


const menu = new MenuTemplate(() => 'Configuration-Menu');

menu.toggle('whitelistChats', 'whitelistChats', {
  set: (_, newState) => {
    logger.info("Config-Change for whitelistChats:");
    if (newState) {
      logger.info("New whitelistChats: "+config.whitelistAdmins);
      config.whitelistChats = config.whitelistAdmins;
    } else {
      logger.info("WhitelistChats is now empty");
      config.whitelistChats = [];
    }
    config.writeConfig();
    // Update the menu afterwards
    return true
  },
  isSet: () => config.whitelistChats.length > 0,
  joinLastRow: false
})


menu.toggle('botReply', 'botReply', {
  set: (_, newState) => {
    config.botReply = newState;
    config.writeConfig();
    logger.info("Config-Change for botReply: "+newState);
    // Update the menu afterwards
    return true
  },
  isSet: () => config.botReply,
  joinLastRow: false
})

menu.toggle('showVideos', 'showVideos', {
  set: (_, newState) => {
    config.showVideos = newState;
    config.writeConfig();
    logger.info("Config-Change for showVideos: "+newState);
    // Update the menu afterwards
    return true
  },
  isSet: () => config.showVideos,
  joinLastRow: true
})

menu.toggle('playVideoAudio', 'playVideoAudio', {
  set: (_, newState) => {
    config.playVideoAudio = newState;
    config.writeConfig();
    logger.info("Config-Change for playVideoAudio: "+newState);
    // Update the menu afterwards
    return true
  },
  isSet: () => config.playVideoAudio,
  joinLastRow: false
})

menu.toggle('randomOrder', 'randomOrder', {
  set: (_, newState) => {
    config.randomOrder = newState;
    config.writeConfig();
    logger.info("Config-Change for randomOrder: "+newState);
    // Update the menu afterwards
    return true
  },
  isSet: () => config.randomOrder,
  joinLastRow: true
})

menu.toggle('autoDeleteImages', 'autoDeleteImages', {
  set: (_, newState) => {
    config.autoDeleteImages = newState;
    config.writeConfig();
    logger.info("Config-Change for autoDeleteImages: "+newState);
    // Update the menu afterwards
    return true
  },
  isSet: () => config.autoDeleteImages,
  joinLastRow: false
})

menu.toggle('showSender', 'showSender', {
  set: (_, newState) => {
    config.showSender = newState;
    config.writeConfig();
    logger.info("Config-Change for showSender: "+newState);
    // Update the menu afterwards
    return true
  },
  isSet: () => config.showSender,
  joinLastRow: true
})

menu.toggle('showCaption', 'showCaption', {
  set: (_, newState) => {
    config.showCaption = newState;
    config.writeConfig();
    logger.info("Config-Change for showCaption: "+newState);
    // Update the menu afterwards
    return true
  },
  isSet: () => config.showCaption,
  joinLastRow: false
})

menu.toggle('useFullscreenForCaptionAndSender', 'useFullscreenForCaptionAndSender', {
  set: (_, newState) => {
    config.useFullscreenForCaptionAndSender = newState;
    config.writeConfig();
    logger.info("Config-Change for useFullscreenForCaptionAndSender: "+newState);
    // Update the menu afterwards
    return true
  },
  isSet: () => config.useFullscreenForCaptionAndSender,
  joinLastRow: true
})

menu.interact('Exit', 'unique', {
  do: async context => {
    await deleteMenuFromContext(context);
    return false;
  }
})



/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = menu;
}
