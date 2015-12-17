'use strict';
let {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import('resource://gre/modules/Services.jsm');
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const extensionLink = 'chrome://tabutilsbookmarks/',
contentLink = extensionLink + 'content/',
uiModuleLink = contentLink + 'ui.jsm',
helperModuleLink = contentLink + 'helper.jsm',
timestampModuleLink = contentLink + 'timestamp.js',
bookmarksModuleLink = contentLink + 'tabutilsbookmarks.js';


function startup(data,reason) {
	Cu.import(helperModuleLink);
	Cu.import(timestampModuleLink);
	// Cu.import(bookmarksModuleLink);

	forEachOpenWindow(loadIntoWindow);
	Services.wm.addListener(WindowListener);
}

function shutdown(data,reason) {
	if (reason == APP_SHUTDOWN)
		return;

	forEachOpenWindow(unloadFromWindow);
	Services.wm.removeListener(WindowListener);

	Cu.unload(bookmarksModuleLink);
	Cu.unload(helperModuleLink);
	
	Services.obs.notifyObservers(null, "chrome-flush-caches", null);
}

function install(data,reason) {}

function uninstall(data,reason) {}

function loadIntoWindow(window) {
	/* call/move your UI construction function here */
	Helper.hookCode("PlacesCommandHook.bookmarkCurrentPages",
		["this.uniqueCurrentPages", (function() {
			!gPrivateBrowsingUI.privateBrowsingEnabled && TU_getPref("extensions.tabutilsbookmarks.bookmarkAllWithHistory", true) ?
				Array.map(gBrowser.allTabs, function(aTab) [aTab.linkedBrowser.currentURI, [{name: 'bookmarkProperties/tabState', value: tabutilsbookmarks._ss.getTabState(aTab)}]]) :
				Array.map(gBrowser.allTabs, function(aTab) aTab.linkedBrowser.currentURI);
		}).toString().replace(/^.*{|}$/g, "")],
			["pages.length > 1", "true"]
	);

	Helper.hookCode("BookmarkPropertiesPanel._determineItemInfo",
		['this._strings.getString("bookmarkAllTabsDefault")', "dialogInfo.URIList[0] instanceof Ci.nsIURI ? $& : new Date().toMilitaryString()"]
	);

	Helper.hookCode("BookmarkPropertiesPanel._getTransactionsForURIList",
		[/(?=.*_getURITitleFromHistory.*)/, "var annos; if (!(uri instanceof Ci.nsIURI)) [uri, annos] = uri;"],
		[/title(?=\))/, "$&, null, annos"]
	);
}

function unloadFromWindow(window) {
/* call/move your UI tear down function here */
}

function forEachOpenWindow(todo)  // Apply a function to all open browser windows
{
	var windows = Services.wm.getEnumerator("navigator:browser");
	while (windows.hasMoreElements())
		todo(windows.getNext().QueryInterface(Components.interfaces.nsIDOMWindow));
}

var WindowListener = 
{
	onOpenWindow: function(xulWindow) {
		var window = xulWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
								.getInterface(Components.interfaces.nsIDOMWindow);
		function onWindowLoad()
		{
			window.removeEventListener("load",onWindowLoad);
			if (window.document.documentElement.getAttribute("windowtype") == "navigator:browser")
				var item = window.document.getElementById("context_bookmarkTab");
				if (item) {
					item.setAttribute("oncommand", "gBrowser.bookmarkTab(gBrowser.mContextTabs);");
					item.setAttribute("multiselected", "any");
				}
				loadIntoWindow(window);
		}
		window.addEventListener("load",onWindowLoad);
	},
	onCloseWindow: function(xulWindow) { },
	onWindowTitleChange: function(xulWindow, newTitle) { }
};

if (!Date.prototype.toMilitaryString) {
	(function() {
		function pre_pad(number, length) {
			var str = "" + number;
			while (str.length < length) {
				str = '0'+str;
			}
			return str;
		}
		function post_pad(number, length) {
			var str = "" + number;
			while (str.length < length) {
				str = str+'0';
			}
			return str;
		}
		Date.prototype.toMilitaryString = function() {
			var offset = this.getTimezoneOffset();
			var hour_offset = pre_pad(offset/60, 2);
			return this.getUTCFullYear() +
				'-' + pre_pad(this.getUTCMonth() + 1, 2) +
				'-' + pre_pad(this.getUTCDate(), 2) +
				' ' + pre_pad(this.getHours(), 2) +
				':' + pre_pad(this.getUTCMinutes(), 2) +
				':' + pre_pad(this.getUTCSeconds(), 2) +
				' GMT' + (offset<0 ? '+' : '-') + post_pad(hour_offset, 4);
		};
	}());
}
