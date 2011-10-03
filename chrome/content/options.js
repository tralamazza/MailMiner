/* Copyright (c) 2011 Daniel Tralamazza
   See the file LICENSE.txt for licensing information. */

const Cc = Components.classes;
const Ci = Components.interfaces;

let prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.mailminer.");

// [EVENT] dropdown/menulist selection
function onCommand(event) {
    prefs.setCharPref("addressBook", event.target.value) // save menuitem.value in preferences
}

window.addEventListener("load", function () {
    let mlist = document.getElementById("addrbook.menulist"); // get menulist
    
    // load all address books (https://developer.mozilla.org/En/Address_Book_Examples)
    let abManager = Cc["@mozilla.org/abmanager;1"].getService(Ci.nsIAbManager);
    let allAddressBooks = abManager.directories;
    while (allAddressBooks.hasMoreElements()) {
        let ab = allAddressBooks.getNext().QueryInterface(Ci.nsIAbDirectory);
        if (ab instanceof Ci.nsIAbDirectory) {
            mlist.appendItem(ab.dirName, ab.URI, ""); // add a menuitem (label, value, description)
        }
    }

    mlist.value = prefs.getCharPref("addressBook"); // load saved preference
}, false);
