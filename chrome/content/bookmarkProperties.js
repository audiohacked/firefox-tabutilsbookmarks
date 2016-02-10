TUB_hookCode("BookmarkPropertiesPanel._determineItemInfo",
    ['this._strings.getString("bookmarkAllTabsDefault")', "dialogInfo.URIList[0] instanceof Components.interfaces.nsIURI ? $& : new Date().TUBString()"]
);

TUB_hookCode("BookmarkPropertiesPanel._getTransactionsForURIList",
    [/(?=.*_getURITitleFromHistory.*)/, "var annos; if (!(uri instanceof Components.interfaces.nsIURI)) [uri, annos] = uri;"],
    [/title(?=\))/, "$&, null, annos"]
);
