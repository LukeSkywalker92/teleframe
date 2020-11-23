![TeleFrame](.github/header.png)

![TeleFrame in action](.github/TeleFrame.gif)

<p align="center">
	<a><img src="https://img.shields.io/github/last-commit/LukeSkywalker92/TeleFrame.svg" alt="Latest Comit"></a>
<a><img src="https://img.shields.io/github/release/LukeSkywalker92/TeleFrame.svg" alt="Release"></a>
	<a href="https://david-dm.org/LukeSkywalker92/TeleFrame"><img src="https://david-dm.org/LukeSkywalker92/TeleFrame.svg" alt="david-dm"></a>
</p>

**TeleFrame** is an open source digital image frame that displays images and videos, which were send to an Telegram Bot.

## !!! IMPORTANT !!!
**To update TeleFrame on a Raspberry PI, it is required to remove the electron folder and an additional parameter for `npm` to define the processor architecture!**
**Also, make sure that you have the latest version of `npm`.**

Execute the following commands in a terminal to do all this and be prepared for future updates, where again `npm install` is enough to update.
```sh
sudo npm install npm@latest -g
[ -z "$npm_config_arch" ] && (echo -e "# npm archive configuration\nexport npm_config_arch=\$(uname -m)" >> ~/.profile)
export npm_config_arch=$(uname -m)
cd ~/TeleFrame
rm -rf node_modules/
npm install --arch=$(uname -m)
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [Installation](#installation)
  - [Automatic Installation (Raspberry Pi only!)](#automatic-installation-raspberry-pi-only)
  - [Manual Installation](#manual-installation)
- [Configuration](#configuration)
- [Whitelist Chats](#whitelist-chats)
- [Voice Replies using TeleFrame](#voice-replies-using-teleframe)
- [Touchscreen support](#touchscreen-support)
- [Updating](#updating)
- [Addon interface](#addon-interface)
- [Bot only mode (no GUI)](#bot-only-mode-no-gui)
- [Building a TeleFrame](#building-a-teleframe)

## Installation

### Automatic Installation (Raspberry Pi only!)

*Electron*, the app wrapper around Teleframe, only supports the Raspberry Pi 2/3/4. The Raspberry Pi 0/1 is currently **not** supported.

Note that you will need to install the lastest full version of Raspbian, **don't use the Lite version**.

Execute the following command on your Raspberry Pi to install TeleFrame:

```bash
bash -c "$(curl -sL https://raw.githubusercontent.com/LukeSkywalker92/TeleFrame/master/tools/install_raspberry.sh)"
```

### Manual Installation

1. Download and install the latest *Node.js* version.
2. If you like to use the voice reply feature you need to install sox
3. Install *Electron* globally with `npm install -g electron`.
4. Clone the repository and check out the master branch: `git clone https://github.com/LukeSkywalker92/TeleFrame.git`
5. Enter the repository: `cd TeleFrame/`
6. Install and run the app with: `npm install && npm start`

Also note that:

- `npm start` does **not** work via SSH. But you can use `DISPLAY=:0 nohup npm start &` instead. \
  This starts the TeleFrame on the remote display.
- To access toolbar menu when in fullscreen mode, hit `ALT` key.
- To toggle the (web) `Developer Tools` from fullscreen mode, use `CTRL-SHIFT-I` or `ALT` and select `View`.

## Configuration

### Basic Configuration
Basic Configuration is very Easy. Just follow these Steps:
1. Send /start to your Bot
2. Send /settings to yout Bot an do the Basic Configuration

### Advanced Configuration

1. Copy `TeleFrame/config/config.example.json` to `TeleFrame/config/config.json`. \
   **Note:** If you used the installer script. This step is already done for you.

2. Modify your required settings.
  **Note:** You only need to define settings that differ from the standard configuration.


The following properties can be configured:

| **Option**	| **Type** | **Description** | **Default Value** |
| ----------	| -------- | --------------- | ----------------- |
| `botToken`	| {string} | The token of the Telegram Bot, which will recieve the images. How to create a bot and get the token is explained [here](https://core.telegram.org/bots#6-botfather).	|  |
| `whitelistChats`	| {array-of-string} | Use this to only allow certain users to send photos to your TeleFrame. See [hints](#whitelist-chats) below. |  |
| `whitelistAdmins`	| {array-of-string} | Use this to increase individual users as admin. |  |
| `screenConfig`		| {string} | Defines the configuration file of your screen, see folder TeleFrame/config/screens/ and [README-File](config/screens/README.md) for possible configurations.	| hdmi_default.js.	|
| `playSoundOnRecieve`	| {string} | Play a sound on recieving a message, set `false` to turn off.	| "sound1.mp3" |
| `showVideos`	| {boolean} | When set to true, videos that are send to the bot are also shown.	| True |
| `playVideoAudio`	| {boolean} | If recieved videos should be played with sound or not.	| False |
| `imageFolder`	| {string} | The folder where the images are stored.	| "images" |
| `fullscreen`	| {boolean} | When set to true, TeleFrame will run in fullscreen mode.	| True |
| `fadeTime`	| {number} | The fading time between two images. [Milliseconds]	| 1500 |
| `interval`	| {number} | The time that an image is shown. [Milliseconds]	| 10000 |
| `imageCount`	| {number} | Defines how many different images are shown in the slideshow.	| 30 |
| `randomOrder`	| {boolean} | When set to true, Teleframe will show pictures in random order.	| True |
| `autoDeleteImages`	| {boolean} | Defines if old images should be deleted, when they are no longer used in the slideshow (see 'imageCount'). Starred images will not be deleted.	| True |
| `showSender`	| {boolean} | When set to true, TeleFrame will show the name of the sender when the image is shown.	| True |
| `showCaption`	| {boolean} | When set to true, TeleFrame will show the caption of the image when the image is shown.	| True |
| `cropZoomImages`	| {boolean} | When set to true, TeleFrame will crop and zoom images so there is no black border.	| False |
| `toggleMonitor`	| {boolean} | When set to true, TeleFrame will switch the monitor off and on at the defined hours.	| False |
| `turnOnHour`	| {number} | Defines when the monitor should be turned on.	| 9 |
| `turnOffHour`	| {number} | Defines when the monitor should be turned off.	| 22 |
| `switchLedsOff`	| {boolean} | Defines if the 2 LEDs on the RaspberryPi should be switched off.	| False |
| `botReply`	| {boolean} | Defines if the bot should answer on images or videos with a short reply (:+1: :camera_flash: for images, :+1: :movie_camera: for movies). Also throws a warning on receiving unknown file extensions.	| True |
| `confirmDeleteImage`	| {boolean} | Defines if to show a confirm message before delete an image `true` or `false`	|  |
| `confirmShutdown`	| {boolean} | Defines if to show a confirm message before shutdown the system `true` or `false`	|  |
| `confirmReboot`	| {boolean} | Defines if to show a confirm message before rebooting the system `true` or `false`	|  |
| `keys`	| {object} | Defines an object with 4 strings specifying the keyboard shortcuts for play, next, previous and pause. Set to null for no controls	|  |
| `voiceReply`	| {object} | Defines an object with the config for sending voicemessages with TeleFrame, see [info](#voice-replies-using-teleframe) below	|  |
| `touchBar`	| {object} | Defines an object with the config for using a touch bar for executing commands instead of the default touch gestures, see [info](#using-the-touch-bar) below	|  |
| `language`	| {string} | Defines the language to use.  See `config.example.js` 'Language configuration' for details	|  |
| `adminAction` | {object} | Defines an object with the config for sending Admin-Commands to the TeleFrame, see [info](#sending-admin-commands-to-the-teleframe) below	|  |


## Whitelist Chats

When you start your TeleFrame and send a "Hi" to the bot it will send you back the current chat id. Paste this id or several of them into the `whitelistChats` config option to only allow only pictures from these ids (eg `[1234567, 89101010]`). Leave empty (`[]`) for no whitelist.

## Using the Touch Bar

To use a touch bar for executing commands instead of the default touch gestures you need to add a touchBar obect to your config.
To open the touch bar, just touch the screen. Do the same to hide it again.
The touchBar object takes the height of the touchbar, optionally the autoHideTimeout and a list of elements that should appear as keys. Availiable elements are:

| **Element**             | **Description**                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `showNewest`            | Navigate last arrived image. 																													|
| `previousImage`         | Navigate to the previous Image. 																													|
| `nextImage`  						| Navigate to the next Image. 																															|
| `play`         					| Resume slideshow. 																																				|
| `pause` 								| Pause slideshow. 																																					|
| `playPause`  					  | Toggle between play and pause. 																														|
| `record`         				| Record voice reply. 																																			|
| `starImage`        			| Star the active image to prevent it from beeing deleted.                                  |
| `deleteImage`        		| Delete the active an image.                                                               |
| `mute`        					| Mute notification sounds. 																																|
| `shutdown`        			| Shutdown the system. 																																			|
| `reboot`        				| Reboot the system. 																																				|

## Voice Replies using TeleFrame

A very simple way to respond to the images is by using TeleFrame`s voice reply feature. The feature is intended to work like this: Who ever comes by the frame presses a button, speaks their message into the frame, when there is 2 seconds of silence or the maximum time is reached the recording will stop and the telegram bot will send it to the chat where the current image came from.


| **Option**              | **Description**                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `key`                   | The keyboardkey to start the voice recording                                              |
| `maxRecordTime`         | How long the recorder will record if there is no silence detected (in milliseconds)       |

## Sending Admin-Commands to the TeleFrame

As administrator of a TeleFrame, it could be very useful to execute commands on the TeleFrame computer.
With the TeleFrame-Bot you are able to send these commands without logging on to the remote computer.

Examples for such admin actions could be:
- Reboot the Raspberry Pi
- Restart of the TeleFrame application
- Open a VPN connection
- Close a VPN connection
- ....

To enable Admin-Action on the TeleFrame, following settings must be made in the Config file:
- Adding the Chat-ID to the list of Administators (whitelistAdmins)
- Activating the Admin Actions (allowAdminAction)
- Adding an Action Object (actions) [see adminAction-Object]
- Activation of the action object (enable)

Now the action on the TeleFrame can be triggered by sending the corresponding command (e.g. /reboot for the command named "reboot").

### adminAction-object
| **Option**              | **Description**                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `allowAdminAction`      | Global Switch to enable the Admin-Actions                                                 |
| `actions`               | Defines an array of action-objects, see info bellow                                       |

### action-object
| **Option**              | **Description**                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `name`                  | Name of the action                                                                        |
| `command`               | Command to execute on TeleFrame                                                          |
| `enable`                | When set to True, the command is added to the bot                                         |



## Touchscreen support
* Navigate through the images by touching at the left or right side of your touchscreen.
* Pause and resume the slideshow by touching in the middle of your touchscreen.
* Record a voice message and reply to the shown image by making a long touch in the middle of your touchscreen. The recording starts when you take your finger off.

## Updating

If you want to update your TeleFrame to the latest version, use your terminal to go to your TeleFrame folder and type the following command:

```bash
git pull && npm install
```

If you changed nothing more than the config, this should work without any problems.
Type `git status` to see your changes, if there are any, you can reset them with `git reset --hard`. After that, git pull should be possible.

## Addon interface

TeleFrame provides an addon interface to implement own extensions. See [documentation addon interface](addons/README.md).

## Bot only mode (no GUI)

To run only the bot (without GUI), that saves the recieved images and videos into the folder specified in the config you need to run

```bash
npm run botonly
```
in the TeleFrame folder.

## Building a TeleFrame

A detailed instruction on how to build your own TeleFrame will follow soon.
