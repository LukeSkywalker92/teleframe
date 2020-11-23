var i18n = {
  // Language display name
  name: 'English',

  // welcome reply to '/start'
  welcome: 'Welcome',

  // reply to /help
  help: 'Send me an image or video.\nI support jpg, png, gif or mp4',

  // info missing whitelist entry
  whitelistInfo: 'Hey there, this bot is whitelisted, pls add your chat id to the config file',

  // info missing admin whitelist entry
  whitelistAdminInfo: 'Hey the Admin-Actions of this bot are whitelisted, pls add your chat id to the config file',

  // reply to 'hi' requires additional parameters - use a function
  hiReply: (name, chatId) => `Hey there ${name} \nYour ChatID is ${chatId}`,

  // reply for admin on welcome message from user
  hiAdminPrivateReply: (first_name, last_name, chatId) => `Hey Admin! \n${first_name} ${last_name} wants to add his Chat with the ID ${chatId}.`,

  // reply for admin on welcome message from user in a group
  hiAdminGroupReply: (first_name, last_name, groupName, chatId) => `Hey Admin! \n${first_name} ${last_name} wants to add the Group '${groupName}' with ID ${chatId}.`,

  // The error message if the received document has unknown format
  documentFormatError: 'This document has an unknown format.',

  // Admin action triggered
  adminActionTriggered: (actionName) => `Triggered Action '${actionName}'`,

  // Admin action triggered execution error
  adminActionError: (actionName, errorCode, stderr) => `'${actionName}' ERROR!!!\n\nExitcode: ${errorCode}\nStdErr: ${stderr}`,

  // Admin action triggered execution success
  adminActionSuccess: (actionName, stdout) => `'${actionName}' SUCCESS!!!\n\n${stdout}`,

  // video received
  videoReceived: '\u{1F44D}\u{1F3A5}',

  // image received
  imageReceived: '\u{1F44D}\u{1F4F8}',

  // image received
  videoReceivedError: '\u{274C}\u{1F3A5}',

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = i18n;
}
