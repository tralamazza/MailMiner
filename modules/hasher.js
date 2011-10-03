/* Copyright (c) 2011 Daniel Tralamazza
   See the file LICENSE.txt for licensing information. */

const Cc = Components.classes;
const Ci = Components.interfaces;

var EXPORTED_SYMBOLS = [ "hasher" ];

function toHexString(charCode) {
    return ("0" + charCode.toString(16)).slice(-2);
}

// https://developer.mozilla.org/en/nsICryptoHash
var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
converter.charset = "UTF-8";

var hasher = {
    _nsICSFromStr: function(str, ch) {
        var result = {};
        var data = converter.convertToByteArray(str, result);
        ch.update(data, data.length);
        var hash = ch.finish(false);
        return [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
    },

    md5: function(str) {
        var ch = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
        ch.init(ch.MD5);
        return this._nsICSFromStr(str, ch);
    },

    sha1: function(str) {
        var ch = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
        ch.init(ch.SHA1);
        return this._nsICSFromStr(str, ch);
    }
};
