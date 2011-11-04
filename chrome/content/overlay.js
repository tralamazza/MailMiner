/* Copyright (c) 2011 Daniel Tralamazza
   See the file LICENSE.txt for licensing information. */

const Cc = Components.classes;
const Ci = Components.interfaces;

// main
var mailminer = {

  // [EVENT] new email
  msgAdded: function(aMsgHdr) {
    // 1. extract the email from aMsgHdr (https://developer.mozilla.org/en/NsIMsgDBHdr)
    let email = aMsgHdr.author.toLowerCase();
    let i = email.indexOf('<');
    if (i >= 0) {
      email = email.substring(i + 1, email.indexOf('>'));
    }

    // 2. search this email in our address book (https://developer.mozilla.org/En/Address_Book_Examples)
    let ab_URI = this._prefs.getCharPref("addressBook");
    if (ab_URI == "") { // address book not found, user might have deleted (who knows)
      ab_URI = addressBook.defaultAddressBook().URI; // get the default
      this._prefs.setCharPref("addressBook", ab_URI); // set the preference
    }
    let ab = addrbook.addressBookForURI(ab_URI); // address book
    let card = ab.cardForEmailAddress(email); // search address card by email
    if (card == null) {
      if (this._prefs.getBoolPref("autoInsert")) {
        card = addrbook.createCard(email, ab); // add a new card
      } else {
        utils.info("'" + email + "' not found");
        return; // RETURN! email not found and we don't auto add incoming mail
      }
    }

    // 3. query the APIs
    for (var i = 0; i < this._apis.length; i++) {
      var api = this._apis[i]
      api.queryByEmail(this._prefs.getCharPref(api.keyName), email, function(rl_status, rl_text) {
        if (rl_status == 200) {
          api.updateABCard(JSON.parse(rl_text), card);
          ab.modifyCard(card);
        } else {
          utils.error("|" + api.name + "| " + rl_text); // log error
        }
      });
    }
  },

  // [EVENT] startup
  onLoad: function() {
    // load JSMs (https://developer.mozilla.org/en/Components.utils.import)
    Components.utils.import("resource://mailminer/rapleaf.js");
    Components.utils.import("resource://mailminer/qwerly.js");
    Components.utils.import("resource://mailminer/fliptop.js");
    Components.utils.import("resource://mailminer/addrbook.js");
    Components.utils.import("resource://mailminer/utils.js");

    // load preferences (https://developer.mozilla.org/en/Adding_preferences_to_an_extension)
    this._prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.mailminer.");

    // "register" our APIS
    this._apis = [rapleaf, qwerly, fliptop]
    for (var i = 0; i < this._apis.length; i++) {
      var api = this._apis[i]
      if (this._prefs.getCharPref(api.keyName) == "")
        utils.info("Missing " + api.name + " key");
    }

    // https://developer.mozilla.org/en/Extensions/Thunderbird/HowTos/Common_Thunderbird_Use_Cases/Open_Folder#Watch_for_New_Mail
    var notificationService = Cc["@mozilla.org/messenger/msgnotificationservice;1"].getService(Ci.nsIMsgFolderNotificationService);
    notificationService.addListener(this, notificationService.msgAdded); // register event handler for incoming emails
  }
};

window.addEventListener("load", function () { mailminer.onLoad(); }, false);
