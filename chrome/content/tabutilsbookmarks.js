'use strict';

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("chrome://tabutilsbookmarks/content/helper.jsm");

var tabutilsbookmarks = {
	init: function() {
		Helper.hookCode("PlacesCommandHook.bookmarkCurrentPages",
			["this.uniqueCurrentPages", (function() {
				!gPrivateBrowsingUI.privateBrowsingEnabled && TU_getPref("extensions.tabutilsbookmarks.bookmarkAllWithHistory", true) ?
					Array.map(gBrowser.allTabs, function(aTab) [aTab.linkedBrowser.currentURI, [{name: 'bookmarkProperties/tabState', value: tabutilsbookmarks._ss.getTabState(aTab)}]]) :
					Array.map(gBrowser.allTabs, function(aTab) aTab.linkedBrowser.currentURI);
			}).toString().replace(/^.*{|}$/g, "")],
				["pages.length > 1", "true"]
		);

		var item = window.document.getElementById("context_bookmarkTab");
		if (item) {
			item.setAttribute("oncommand", "gBrowser.bookmarkTab(gBrowser.mContextTabs);");
			item.setAttribute("multiselected", "any");
		}
		// this._bookmarkTabs();
		// this._multiTabHandler();
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

// [
// 	["@mozilla.org/browser/sessionstore;1", "nsISessionStore", "_ss", tabutilsbookmarks], // Bug 898732 [Fx26]
// ].forEach(function([aContract, aInterface, aName, aObject])
// 	XPCOMUtils.defineLazyServiceGetter(aObject || Services, aName || aInterface, aContract, aInterface)
// );

XPCOMUtils.defineLazyServiceGetter(tabutilsbookmarks || Services, "_ss" || "nsISessionStore", "@mozilla.org/browser/sessionstore;1", "nsISessionStore");


// // Bookmark tabs with history
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

// tabutilsbookmarks._multiTabHandler = function() {
// 	// Select Multiple Tabs
// 	gBrowser.__defineGetter__("allTabs", function() {
// 		return this.visibleTabs.slice(this._numPinnedTabs);
// 	});
//
// 	[
// 		["context_bookmarkTab", "gBrowser.bookmarkTab(gBrowser.mContextTabs);"],
// 	].forEach(function([aId, aCommand]) {
// 		var item = document.getElementById(aId);
// 		if (item) {
// 			item.setAttribute("oncommand", aCommand);
// 			item.setAttribute("multiselected", "any");
// 		}
// 	});
// }

var EXPORTED_SYMBOLS = ['tabutilsbookmarks'];
