#!/usr/bin/env bash

# This is an installer script for MagicMirror2. It works well enough
# that it can detect if you have Node installed, run a binary script
# and then download and run MagicMirror2.

echo -e "\e[0m"
echo '_________ _______  _        _______  _______  _______  _______  _______  _______ '
echo '\__   __/(  ____ \( \      (  ____ \(  ____ \(  ____ )(  ___  )(       )(  ____ \'
echo '   ) (   | (    \/| (      | (    \/| (    \/| (    )|| (   ) || () () || (    \/'
echo '   | |   | (__    | |      | (__    | (__    | (____)|| (___) || || || || (__    '
echo '   | |   |  __)   | |      |  __)   |  __)   |     __)|  ___  || |(_)| ||  __)   '
echo '   | |   | (      | |      | (      | (      | (\ (   | (   ) || |   | || (      '
echo '   | |   | (____/\| (____/\| (____/\| )      | ) \ \__| )   ( || )   ( || (____/\'
echo '   )_(   (_______/(_______/(_______/|/       |/   \__/|/     \||/     \|(_______/'
echo -e "\e[0m"

# Define the tested version of Node.js.
NODE_TESTED="v6.9.1"

# Determine which Pi is running.
ARM=$(uname -m)

# Check the Raspberry Pi version.
if [ "$ARM" != "armv7l" ]; then
	echo -e "\e[91mSorry, your Raspberry Pi is not supported."
	echo -e "\e[91mPlease run MagicMirror on a Raspberry Pi 2 or 3."
	echo -e "\e[91mIf this is a Pi Zero, you are in the same boat as the original Raspberry Pi. You must run in server only mode."
	exit;
fi

# Define helper methods.
function version_gt() { test "$(echo "$@" | tr " " "\n" | sort -V | head -n 1)" != "$1"; }
function command_exists () { type "$1" &> /dev/null ;}

# Update before first apt-get
echo -e "\e[96mUpdating packages ...\e[90m"
sudo apt-get update || echo -e "\e[91mUpdate failed, carrying on installation ...\e[90m"

# Installing helper tools
echo -e "\e[96mInstalling helper tools ...\e[90m"
sudo apt-get --assume-yes install curl wget git build-essential unzip || exit

# Check if we need to install or upgrade Node.js.
echo -e "\e[96mCheck current Node installation ...\e[0m"
NODE_INSTALL=false
if command_exists node; then
	echo -e "\e[0mNode currently installed. Checking version number.";
	NODE_CURRENT=$(node -v)
	echo -e "\e[0mMinimum Node version: \e[1m$NODE_TESTED\e[0m"
	echo -e "\e[0mInstalled Node version: \e[1m$NODE_CURRENT\e[0m"
	if version_gt $NODE_TESTED $NODE_CURRENT; then
		echo -e "\e[96mNode should be upgraded.\e[0m"
		NODE_INSTALL=true

		# Check if a node process is currenlty running.
		# If so abort installation.
		if pgrep "node" > /dev/null; then
			echo -e "\e[91mA Node process is currently running. Can't upgrade."
			echo "Please quit all Node processes and restart the installer."
			exit;
		fi

	else
		echo -e "\e[92mNo Node.js upgrade necessary.\e[0m"
	fi

else
	echo -e "\e[93mNode.js is not installed.\e[0m";
	NODE_INSTALL=true
fi

# Install or upgrade node if necessary.
if $NODE_INSTALL; then

	echo -e "\e[96mInstalling Node.js ...\e[90m"

	# Fetch the latest version of Node.js from the selected branch
	# The NODE_STABLE_BRANCH variable will need to be manually adjusted when a new branch is released. (e.g. 7.x)
	# Only tested (stable) versions are recommended as newer versions could break MagicMirror.

	NODE_STABLE_BRANCH="9.x"
	curl -sL https://deb.nodesource.com/setup_$NODE_STABLE_BRANCH | sudo -E bash -
	sudo apt-get install -y nodejs
	echo -e "\e[92mNode.js installation Done!\e[0m"
fi

# Install MagicMirror
cd ~
if [ -d "$HOME/TeleFrame" ] ; then
	echo -e "\e[93mIt seems like TeleFrame is already installed."
	echo -e "To prevent overwriting, the installer will be aborted."
	echo -e "Please rename the \e[1m~/TeleFrame\e[0m\e[93m folder and try again.\e[0m"
	echo ""
	echo -e "If you want to upgrade your installation run \e[1m\e[97mgit pull\e[0m from the ~/TeleFrame directory."
	echo ""
	exit;
fi

echo -e "\e[96mCloning TeleFrame ...\e[90m"
if git clone --depth=1 https://github.com/LukeSkywalker92/TeleFrame.git; then
	echo -e "\e[92mCloning TeleFrame Done!\e[0m"
else
	echo -e "\e[91mUnable to clone TeleFrame."
	exit;
fi

cd ~/TeleFrame  || exit
echo -e "\e[96mInstalling dependencies ...\e[90m"
if npm install; then
	echo -e "\e[92mDependencies installation Done!\e[0m"
else
	echo -e "\e[91mUnable to install dependencies!"
	exit;
fi

echo -e "\e[96mInstalling electron globally ...\e[90m"
if sudo npm install -g electron --unsafe-perm=true --allow-root; then
	echo -e "\e[92mElectron installation Done!\e[0m"
else
	echo -e "\e[91mUnable to install electron!"
	exit;
fi

# Use sample config for start MagicMirror
cp config/config.js.example config/config.js

# Create image directory
echo -e "\e[96mCreating image directory ...\e[90m"
sudo mkdir /var/TeleFrame
sudo mkdir /var/TeleFrame/images

# Check if plymouth is installed (default with PIXEL desktop environment), then install custom splashscreen.
echo -e "\e[96mCheck plymouth installation ...\e[0m"
if command_exists plymouth; then
	THEME_DIR="/usr/share/plymouth/themes"
	echo -e "\e[90mSplashscreen: Checking themes directory.\e[0m"
	if [ -d $THEME_DIR ]; then
		echo -e "\e[90mSplashscreen: Create theme directory if not exists.\e[0m"
		if [ ! -d $THEME_DIR/TeleFrame ]; then
			sudo mkdir $THEME_DIR/TeleFrame
		fi

		if sudo cp ~/TeleFrame/splashscreen/splash.png $THEME_DIR/TeleFrame/splash.png && sudo cp ~/TeleFrame/splashscreen/TeleFrame.plymouth $THEME_DIR/TeleFrame/TeleFrame.plymouth && sudo cp ~/TeleFrame/splashscreen/TeleFrame.script $THEME_DIR/TeleFrame/TeleFrame.script; then
			echo -e "\e[90mSplashscreen: Theme copied successfully.\e[0m"
			if sudo plymouth-set-default-theme -R TeleFrame; then
				echo -e "\e[92mSplashscreen: Changed theme to TeleFrame successfully.\e[0m"
			else
				echo -e "\e[91mSplashscreen: Couldn't change theme to TeleFrame!\e[0m"
			fi
		else
			echo -e "\e[91mSplashscreen: Copying theme failed!\e[0m"
		fi
	else
		echo -e "\e[91mSplashscreen: Themes folder doesn't exist!\e[0m"
	fi
else
	echo -e "\e[93mplymouth is not installed.\e[0m";
fi

# Use pm2 control like a service MagicMirror
read -p "Do you want use pm2 for auto starting of your MagicMirror (y/N)?" choice
if [[ $choice =~ ^[Yy]$ ]]; then
    sudo npm install -g pm2
    sudo su -c "env PATH=$PATH:/usr/bin pm2 startup linux -u pi --hp /home/pi"
    pm2 start ~/TeleFrame/tools/pm2_TeleFrame.json
    pm2 save
fi

echo " "
echo -e "\e[92mWe're ready! Run \e[1m\e[97mDISPLAY=:0 npm start\e[0m\e[92m from the ~/TeleFrame directory to start your TeleFrame.\e[0m"
echo " "
echo " "