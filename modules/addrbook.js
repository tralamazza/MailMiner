/* Copyright (c) 2011 Daniel Tralamazza
   See the file LICENSE.txt for licensing information. */

var EXPORTED_SYMBOLS = [ "addrbook" ];
    
let abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);  

var addrbook = {
    // https://developer.mozilla.org/En/Address_Book_Examples

    // creates a new card, adds it to ab_URI
    createCard: function(email, ab) {
        let card = Components.classes["@mozilla.org/addressbook/cardproperty;1"].createInstance(Components.interfaces.nsIAbCard);
        card.primaryEmail = email;
        ab.addCard(card);
        return card;
    },

    // returns the address book for ab_URI, or throws
    addressBookForURI: function(ab_URI) {
        let ab = abManager.getDirectory(ab_URI);
        if (ab == null || ab == undefined)
            throw "Invalid address book: " + ab_URI;
        return ab;
    },

    // returns the default (first) address book
    defaultAddressBook: function() {
        return abManager.directories.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);
    }
};
