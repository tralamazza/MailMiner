/* Copyright (c) 2011 Daniel Tralamazza
   See the file LICENSE.txt for licensing information. */

const Cc = Components.classes;
const Ci = Components.interfaces;

// load JSMs (https://developer.mozilla.org/en/Components.utils.import)
Components.utils.import("resource://mailminer/rapleaf.js");
Components.utils.import("resource://mailminer/qwerly.js");
Components.utils.import("resource://mailminer/addrbook.js");
Components.utils.import("resource://mailminer/utils.js");

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

    // 3a. query Rapleaf
    rapleaf.queryByEmail(this._prefs.getCharPref("rapleaf.key"), email, function(rl_status, rl_text) {
      if (rl_status == 200) {
        rapleaf.updateABCard(JSON.parse(rl_text), card);
        ab.modifyCard(card);
      } else {
        utils.error("|rapleaf| " + rl_text); // log rapleaf error
      }
    });

    // 3b. query Qwerly
    qwerly.queryByEmail(this._prefs.getCharPref("qwerly.key"), email, function(qw_status, qw_text) {
      if (qw_status == 200) {
        qwerly.updateABCard(JSON.parse(qw_text), card);
        ab.modifyCard(card);
      } else {
        utils.error("|qwerly| " + qw_text); // log qwerly error
      }
    });
  },

  // [EVENT] startup
  onLoad: function() {
    // load preferences (https://developer.mozilla.org/en/Adding_preferences_to_an_extension)
    this._prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsI_prefservice).getBranch("extensions.mailminer.");

    if (this._prefs.getCharPref("rapleaf.key") == "")
      utils.info("Missing Rapleaf key");
    if (this._prefs.getCharPref("qwerly.key") == "")
      utils.info("Missing Qwerly key");

    // https://developer.mozilla.org/en/Extensions/Thunderbird/HowTos/Common_Thunderbird_Use_Cases/Open_Folder#Watch_for_New_Mail
    var notificationService = Cc["@mozilla.org/messenger/msgnotificationservice;1"].getService(Ci.nsIMsgFolderNotificationService);
    notificationService.addListener(this, notificationService.msgAdded); // register event handler for incoming emails
  }
};

window.addEventListener("load", function () { mailminer.onLoad(); }, false);
