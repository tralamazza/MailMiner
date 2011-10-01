/* Copyright (c) 2011 Daniel Tralamazza
   See the file LICENSE.txt for licensing information. */

var EXPORTED_SYMBOLS = [ "rapleaf" ];

Components.utils.import("resource://mailminer/hasher.js");

var rapleaf = {
    queryByEmail: function(api_key, email, cb) {
        // https://developer.mozilla.org/En/XMLHttpRequest/Using_XMLHttpRequest#Using_XMLHttpRequest_from_JavaScript_modules_.2F_XPCOM.C2.A0components
        var xhr = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest); 
        var path = "/v4/dr?api_key=" + api_key + "&md5_email=" + hasher.md5(email);
        xhr.open('GET', 'https://personalize.rapleaf.com' + path, true); // async
        xhr.onreadystatechange = function(aEvt) {
            if (xhr.readyState == 4)
                cb(xhr.status, xhr.responseText);
        }
        xhr.send(null);
    },
    
    updateABCard: function(data, card) {
        card.setProperty("HomeCountry", data.country);
        card.setProperty("HomeState", data.state);
        card.setProperty("HomeCity", data.city);
    }
};
