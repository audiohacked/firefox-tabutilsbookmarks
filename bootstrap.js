const Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

const extensionLink = 'chrome://tabutilsbookmarks/',
contentLink = extensionLink + 'content/',
uiModuleLink = contentLink + 'ui.jsm',
helperModuleLink = contentLink + 'helper.jsm',
bookmarksModuleLink = contentLink + 'tabutilsbookmarks.js';


function startup(data,reason) {
	Cu.import(helperModuleLink)
	Cu.import(bookmarksModuleLink);
	
	tabutilsbookmarks.init();
	
	Helper.hookCode("BookmarkPropertiesPanel._determineItemInfo",
		['this._strings.getString("bookmarkAllTabsDefault")', "dialogInfo.URIList[0] instanceof Ci.nsIURI ? $& : new Date().toMilitaryString()"]
	);

	Helper.hookCode("BookmarkPropertiesPanel._getTransactionsForURIList",
		[/(?=.*_getURITitleFromHistory.*)/, "var annos; if (!(uri instanceof Ci.nsIURI)) [uri, annos] = uri;"],
		[/title(?=\))/, "$&, null, annos"]
	);
	
}

function shutdown(data,reason) {
	if (reason == APP_SHUTDOWN)
		return;
	
	Cu.unload(bookmarksModuleLink);
	Cu.unload(helperModuleLink);
	
	Services.obs.notifyObservers(null, "chrome-flush-caches", null);
}

function install(data) {
	
}

function uninstall() {
	
}