/* Copyright (c) 2011 Daniel Tralamazza
   See the file LICENSE.txt for licensing information. */

// Fliptop acquired Qwerly

const Cc = Components.classes;
const Ci = Components.interfaces;

var EXPORTED_SYMBOLS = [ "fliptop" ];

var fliptop = {
    name: "Fliptop",

    keyName: "fliptop.key",

    queryByEmail: function(api_key, email, cb) {
        // https://developer.mozilla.org/En/XMLHttpRequest/Using_XMLHttpRequest#Using_XMLHttpRequest_from_JavaScript_modules_.2F_XPCOM.C2.A0components
        var xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest); 
        var path = "/beta/person?email=" + encodeURIComponent(email) + "?api_key=" + api_key;
        xhr.open('GET', 'http://api.fliptop.com' + path, true); // async
        xhr.onreadystatechange = function(aEvt) {
            if (xhr.readyState == 4)
                cb(xhr.status, xhr.responseText);
        }
        xhr.send(null);
    },
    
    updateABCard: function(data, card) {
        data = data.profile;
        if (data.website) card.setProperty("WebPage2", data.website);
        if (data.description) card.setProperty("Notes", data.description);

        for each (var av in data.avatars) {
            if (av.type == "email") {
                card.setProperty("PhotoURI", av.urls.medium);
                card.setProperty("PhotoType", "web");
                break;
            }
        }

        for each (var svc in data.services) {
            switch (svc.type) {
                case "facebook":
                    card.setProperty("Custom1", svc.url);
                    break;
                case "twitter":
                    card.setProperty("Custom2", svc.url);
                    break;
                case "linkedin":
                    card.setProperty("Custom3", svc.url);
                    break;
                case "google_profiles":
                    card.setProperty("Custom4", svc.url);
                    break;
            }
        }
    }
};
