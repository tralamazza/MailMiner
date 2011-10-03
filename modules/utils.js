/* Copyright (c) 2011 Daniel Tralamazza
   See the file LICENSE.txt for licensing information. */

const Cc = Components.classes;
const Ci = Components.interfaces;

var EXPORTED_SYMBOLS = [ "utils" ];

var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);

var utils = {
    info: function(str) {
        consoleService.logStringMessage('[mailminer] ' + str);
    },

    error: function(str) {
        Components.utils.reportError('[mailminer] ' + str);
    }
};
