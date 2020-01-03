/*
 * settings for Sunfounder 10.1 inch touch sreen connected via HDMI
 * http://wiki.sunfounder.cc/index.php?title=10.1_Inch_Touch_Screen_for_Raspberry_Pi
 * 
 * This screen is turned on and off via a GPIO port, because when HDMI is turned off 
 * via software, the text "No Signal" is permanently displayed.
 * 
 * To control the power switch an additional script and some hardware (optocoupler 
 * and a resistor) is required. 
 */
 
var screen = {
    name: "Sunfounder HDMI screen",
    xres: 1280,
    yres: 800,
    aspectRatio: 1.0, // defines the aspect ratio of a pixel (width/height)
    hasTouch: true,
    hasBacklightCtl: false,
    hasBacklightDimming: false,
    pin: 1,
    cmdInit: "gpio mode " + this.pin + "out",
    cmdBacklightOff: "bash ../tools/screen_switch.sh " + this.pin,
    cmdBacklightOn:  "bash ../tools/screen_switch.sh " + this.pin,
    cmdBacklightDimming: "",
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = screen;
}