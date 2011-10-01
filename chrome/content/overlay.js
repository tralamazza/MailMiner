/* Copyright (c) 2011 Daniel Tralamazza
   See the file LICENSE.txt for licensing information. */

// load JSMs (https://developer.mozilla.org/en/Components.utils.import)
Components.utils.import("resource://mailminer/rapleaf.js");
Components.utils.import("resource://mailminer/qwerly.js");
Components.utils.import("resource://mailminer/addrbook.js");
Components.utils.import("resource://mailminer/utils.js");

// main
var mailminer = {
  testEmail: function() {
    this.msgAdded({ author: "Daniel Tralamazza <tralamazza@gmail.com>" });
  },

  // [EVENT] new email
  msgAdded: function(aMsgHdr) {
    // 1. extract the email from aMsgHdr (https://developer.mozilla.org/en/NsIMsgDBHdr)
    let email = aMsgHdr.author.toLowerCase();
    let i = email.indexOf('<');
    if (i >= 0) {
      email = email.substring(i + 1, email.indexOf('>'));
    }

    // 2. search this email in our address book (https://developer.mozilla.org/En/Address_Book_Examples)
    let ab = addrbook.addressBookForURI(this.prefs.getCharPref("addressBook")); // address book
    let card = ab.cardForEmailAddress(email); // search address card by email
    if (card == null) {
      if (this.prefs.getBoolPref("autoInsert")) {
        card = addrbook.createCard(email, ab); // add a new card
      } else {
        return; // RETURN! email not found and we don't auto add incoming mail
      }
    }

    // 3a. query Rapleaf
    rapleaf.queryByEmail(this.prefs.getCharPref("rapleaf.key"), email, function(rl_status, rl_text) {
      if (rl_status == 200) {
        rapleaf.updateABCard(JSON.parse(rl_text), card);
        ab.modifyCard(card);
      } else {
        utils.error("|rapleaf| " + rl_text); // log rapleaf error
      }
    });

    // 3b. query Qwerly
    qwerly.queryByEmail(this.prefs.getCharPref("qwerly.key"), email, function(qw_status, qw_text) {
      if (qw_status == 200) {
        qwerly.updateABCard(JSON.parse(qw_text), card);
        ab.modifyCard(card);
      } else {
        utils.error("|qwerly| " + qw_text); // log qwerly error
      }
    });
  },

  // Setup
  onLoad: function() {
    this.initialized = true;

    // load preferences (https://developer.mozilla.org/en/Adding_preferences_to_an_extension)
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.mailminer.");

    // https://developer.mozilla.org/en/Extensions/Thunderbird/HowTos/Common_Thunderbird_Use_Cases/Open_Folder#Watch_for_New_Mail
    var notificationService = Components.classes["@mozilla.org/messenger/msgnotificationservice;1"].getService(Components.interfaces.nsIMsgFolderNotificationService);
    notificationService.addListener(this, notificationService.msgAdded);

    this.testEmail();
  },
};

window.addEventListener("load", function () { mailminer.onLoad(); }, false);