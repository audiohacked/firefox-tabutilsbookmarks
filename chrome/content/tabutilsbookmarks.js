'use strict';

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

var tabutilsbookmarks = {
	init: function() {
		// this._bookmarkTabs();
		this._multiTabHandler();

		// window.addEventListener("load", this, false);
		// window.addEventListener("unload", this, false);
		//
		// this.fxOnOS = Services.appinfo.OS; //WINNT, Linux or Darwin
		// this.fxVersion = parseFloat(Services.appinfo.version);
		// document.documentElement.setAttribute("OS", this.FxOnOS);
		// document.documentElement.setAttribute("v4", true);
		// document.documentElement.setAttribute("v6", true);
		// document.documentElement.setAttribute("v14", true);
		// document.documentElement.setAttribute("v17", true);
		// document.documentElement.setAttribute("v29", this.fxVersion >= 29.0);
		// document.documentElement.setAttribute("v31", this.fxVersion >= 31.0);
	},

	onload: function() {
	},

	_eventListeners: [],
	addEventListener: function() {
		arguments[0].addEventListener.apply(arguments[0], Array.slice(arguments, 1));
		this._eventListeners.push(arguments);
	},

	onunload: function() {
		this._eventListeners.forEach(function(args) document.removeEventListener.apply(args[0], Array.slice(args, 1)));
		// this._tagsFolderObserver.uninit();
	},

	handleEvent: function(event) {
		window.removeEventListener(event.type, this, false);
		switch (event.type) {
			case "DOMContentLoaded": this.init();break;
			case "load": this.onload();break;
			case "unload": this.onunload();break;
		}
	}
};
// window.addEventListener("DOMContentLoaded", tabutilsbookmarks, false);

[
  ["@mozilla.org/browser/sessionstore;1", "nsISessionStore", "_ss", tabutilsbookmarks], // Bug 898732 [Fx26]
  ["@mozilla.org/docshell/urifixup;1", "nsIURIFixup"], // Bug 802026 [Fx20]
  ["@mozilla.org/places/colorAnalyzer;1", "mozIColorAnalyzer"],
  ["@mozilla.org/uuid-generator;1", "nsIUUIDGenerator"]
].forEach(function([aContract, aInterface, aName, aObject])
  XPCOMUtils.defineLazyServiceGetter(aObject || Services, aName || aInterface, aContract, aInterface)
);

// Bookmark tabs with history
// tabutilsbookmarks._bookmarkTabs = function() {
//   gBrowser.bookmarkTab = function(aTabs) {
//     if (!("length" in aTabs))
//       aTabs = [aTabs];
//
//     if (aTabs.length > 1) {
//       let tabURIs = !gPrivateBrowsingUI.privateBrowsingEnabled && TU_getPref("extensions.tabutilsbookmarks.bookmarkWithHistory", false) ?
//                     Array.map(aTabs, function(aTab) [aTab.linkedBrowser.currentURI, [{name: 'bookmarkProperties/tabState', value: tabutilsbookmarks._ss.getTabState(aTab)}]]) :
//                     Array.map(aTabs, function(aTab) aTab.linkedBrowser.currentURI);
//       PlacesUIUtils.showBookmarkDialog({action: "add",
//                                         type: "folder",
//                                         URIList: tabURIs,
//                                         hiddenRows: ["description"]}, window);
//     }
//     else
//       PlacesCommandHook.bookmarkPage(aTabs[0].linkedBrowser, PlacesUtils.bookmarksMenuFolderId, true);
//   };
//
//   Helper.hookCode("PlacesCommandHook.bookmarkCurrentPages",
//     ["this.uniqueCurrentPages", (function() {
//       !gPrivateBrowsingUI.privateBrowsingEnabled && TU_getPref("extensions.tabutilsbookmarks.bookmarkAllWithHistory", true) ?
//       Array.map(gBrowser.allTabs, function(aTab) [aTab.linkedBrowser.currentURI, [{name: 'bookmarkProperties/tabState', value: tabutilsbookmarks._ss.getTabState(aTab)}]]) :
//       Array.map(gBrowser.allTabs, function(aTab) aTab.linkedBrowser.currentURI);
//     }).toString().replace(/^.*{|}$/g, "")],
//     ["pages.length > 1", "true"]
//   );
// };

tabutilsbookmarks._multiTabHandler = function() {

  // Select Multiple Tabs
  // gBrowser.__defineGetter__("allTabs", function() {
  //   return this.visibleTabs.slice(this._numPinnedTabs);
  // });

	[
		["context_bookmarkTab", "gBrowser.bookmarkTab(gBrowser.mContextTabs);"],
	].forEach(function([aId, aCommand]) {
		var item = document.getElementById(aId);
		if (item) {
			item.setAttribute("oncommand", aCommand);
			item.setAttribute("multiselected", "any");
		}
	});
}

var EXPORTED_SYMBOLS = ['tabutilsbookmarks'];
