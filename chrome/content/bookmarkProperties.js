TUB_hookCode("BookmarkPropertiesPanel._determineItemInfo",
    ['this._strings.getString("bookmarkAllTabsDefault")', "dialogInfo.URIList[0] instanceof Ci.nsIURI ? $& : new Date().TUBString()"]
);

TUB_hookCode("BookmarkPropertiesPanel._getTransactionsForURIList",
    [/(?=.*_getURITitleFromHistory.*)/, "var annos; if (!(uri instanceof Ci.nsIURI)) [uri, annos] = uri;"],
    [/title(?=\))/, "$&, null, annos"]
);
