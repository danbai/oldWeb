/*
 * EMSwitchBox.js
 * Description: An extremely simple but attractive toggle switch you can use in place of a standard input checkbox.
 * Author: Collin Henderson
 * Website: http://syropia.net
 * Contact: collin@syropia.net
 * Version: 1.3
 * Modified By Pengcheng Zou 
 */

var $p = top.$;

// Attach this new method to jQuery
$p.EMSwitchBox = function(id, item, value) {

    var switchButton;
    if (value == "1") {
        switchButton = '<div class="switch on" id="' + id + '" item="' + item + '" value="0" localetitle="LANG2599" title="关闭"><div class="thumb"></div></div>';
    } else if (value == "0") {
        switchButton = '<div class="switch off" id="' + id + '" item="' + item + '" value="1" localetitle="LANG2598" title="开启"><div class="thumb"></div></div>';
    }

    return switchButton;
};