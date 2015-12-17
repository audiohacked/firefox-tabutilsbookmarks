var tabutilsbookmarks = {
	init: function() {
		this._bookmarkTabs();
		this._multiTabHandler();
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
window.addEventListener("DOMContentLoaded", tabutilsbookmarks, false);

[
	["@mozilla.org/browser/sessionstore;1", "nsISessionStore", "_ss", tabutilsbookmarks], // Bug 898732 [Fx26]
].forEach(function([aContract, aInterface, aName, aObject])
	XPCOMUtils.defineLazyServiceGetter(aObject || Services, aName || aInterface, aContract, aInterface)
);

// Bookmark tabs with history
tabutilsbookmarks._bookmarkTabs = function() {
	TUB_hookCode("PlacesCommandHook.bookmarkCurrentPages",
		["this.uniqueCurrentPages", (function() {
			!gPrivateBrowsingUI.privateBrowsingEnabled && TUB_getPref("extensions.tabutilsbookmarks.bookmarkAllWithHistory", true) ?
			Array.map(gBrowser.allTabs, function(aTab) [aTab.linkedBrowser.currentURI, [{name: 'bookmarkProperties/tabState', value: tabutilsbookmarks._ss.getTabState(aTab)}]]) :
			Array.map(gBrowser.allTabs, function(aTab) aTab.linkedBrowser.currentURI);
		}).toString().replace(/^.*{|}$/g, "")],
		["pages.length > 1", "true"]
	);
};

tabutilsbookmarks._multiTabHandler = function() {
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
