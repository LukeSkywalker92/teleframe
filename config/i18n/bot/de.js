var i18n = {
  name: 'Deutsch',
  welcome: 'Willkommen',
  help: 'Sende mir ein Foto oder Video.\nDiese Formate sind möglich: jpg, png, gif oder mp4',
  whitelistInfo: 'Hallo, dieser Bot benötigt eine Freischaltung. Bitte definiere deine Chat-Id in der Konfigurationsdatei',
  whitelistAdminInfo: 'Hallo, die Administrierung dieses Bots benötigt eine Freischaltung. Bitte definiere deine Chat-Id in der Konfigurationsdatei',
  hiReply: (name, chatId) => `Hallo ${name} \nDeine ChatID ist ${chatId}`,
  hiAdminPrivateReply: (first_name, last_name, chatId) => `Hey Admin! \n${first_name} ${last_name} möchte seinen Chat mit der ID ${chatId} auf die Whitelist gesetzt bekommen.`,
  hiAdminGroupReply: (first_name, last_name, groupName, chatId) => `Hey Admin! \n${first_name} ${last_name} möchte die Gruppe '${groupName}' mit der ID ${chatId} auf die Whitelist gesetzt bekommen.`,

  // Text der ausgegeben wird, wenn das empfangene Dokument ein nicht unterstütztes Dateiformat hat
  documentFormatError: 'Dieses Dokument hat ein unbekanntes Dateiformat.',
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = i18n;
}
