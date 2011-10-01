/* Copyright (c) 2011 Daniel Tralamazza
   See the file LICENSE.txt for licensing information. */

var EXPORTED_SYMBOLS = [ "utils" ];

var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

var utils = {
    info: function(str) {
        consoleService.logStringMessage('[mailminer] ' + str);
    },

    error: function(str) {
        Components.utils.reportError('[mailminer] ' + str);
    }
};
