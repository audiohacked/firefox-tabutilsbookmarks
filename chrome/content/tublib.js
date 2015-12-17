"use strict";

let {classes: Cc, interfaces: Ci, utils: Cu} = Components;

var EXPORTED_SYMBOLS = ["TUB"];

var TUB = {
	hookCode: function(aStr) {
	  try {
	    var namespaces = aStr.split(".");

	    try {
	      var object = this;
	      while (namespaces.length > 1) {
	        object = object[namespaces.shift()];
	      }
	    }
	    catch (e) {
	      throw TypeError(aStr + " is not a function");
	    }

	    var method = namespaces.pop();
	    if (typeof object[method] != "function")
	      throw TypeError(aStr + " is not a function");

	    return object[method] = this.hookFunc.apply(this, Array.concat(object[method], Array.slice(arguments, 1)));
	  }
	  catch (e) {
	    Cu.reportError("Failed to hook " + aStr + ": " + e.message);
	  }
	},

	hookSetter: function(aStr) {
	  try {
	    var namespaces = aStr.split(".");

	    try {
	      var object = this;
	      while (namespaces.length > 1) {
	        object = object[namespaces.shift()];
	      }
	    }
	    catch (e) {
	      throw TypeError(aStr + " has no setter");
	    }

	    var property = namespaces.pop();
	    var orgSetter = object.__lookupSetter__(property);
	    if (!orgSetter)
	      throw TypeError(aStr + " has no setter");

	    var mySetter = this.hookFunc.apply(this, Array.concat(orgSetter, Array.slice(arguments, 1)));
	    object.__defineGetter__(property, object.__lookupGetter__(property));
	    object.__defineSetter__(property, mySetter);

	    return mySetter;
	  }
	  catch (e) {
	    Cu.reportError("Failed to hook " + aStr + ": " + e.message);
	  }
	},

	hookFunc: function(aFunc) {
	  var myCode = aFunc.toString();
	  var orgCode, newCode, flags;

	  for (var i = 1; i < arguments.length;) {
	    if (arguments[i].constructor.name == "Array")
	      [orgCode, newCode, flags] = arguments[i++];
	    else
	      [orgCode, newCode, flags] = [arguments[i++], arguments[i++], arguments[i++]];

	    if (typeof newCode == "function" && newCode.length == 0)
	      newCode = newCode.toString().replace(/^.*{|}$/g, "");

	    switch (orgCode) {
	      case "{": [orgCode, newCode] = [/{/, "$&\n" + newCode];break;
	      case "}": [orgCode, newCode] = [/}$/, newCode + "\n$&"];break;
	    }

	    if (typeof orgCode == "string")
	      orgCode = RegExp(orgCode.replace(/[{[(\\^|$.?*+/)\]}]/g, "\\$&"), flags || "");

	    myCode = myCode.replace(orgCode, newCode);
	  }

	  return eval("(" + myCode + ")");
	},

	 getPref: function(aPrefName, aDefault) {
	  switch (Services.prefs.getPrefType(aPrefName)) {
	    case Services.prefs.PREF_BOOL: return Services.prefs.getBoolPref(aPrefName);
	    case Services.prefs.PREF_INT: return Services.prefs.getIntPref(aPrefName);
	    case Services.prefs.PREF_STRING: return Services.prefs.getComplexValue(aPrefName, Components.interfaces.nsISupportsString).data;
	    default:
	      switch (typeof aDefault) {
	        case "boolean": Services.prefs.setBoolPref(aPrefName, aDefault);break;
	        case "number": Services.prefs.setIntPref(aPrefName, aDefault);break;
	        case "string": Services.prefs.setCharPref(aPrefName, aDefault);break;
	      }
	      return aDefault;
	  }
	},

	setPref: function(aPrefName, aValue) {
	  switch (Services.prefs.getPrefType(aPrefName)) {
	    case Services.prefs.PREF_BOOL: Services.prefs.setBoolPref(aPrefName, aValue);break;
	    case Services.prefs.PREF_INT: Services.prefs.setIntPref(aPrefName, aValue);break;
	    case Services.prefs.PREF_STRING: Services.prefs.setCharPref(aPrefName, aValue);break;
	    default:
	      switch (typeof aValue) {
	        case "boolean": Services.prefs.setBoolPref(aPrefName, aValue);break;
	        case "number": Services.prefs.setIntPref(aPrefName, aValue);break;
	        case "string": Services.prefs.setCharPref(aPrefName, aValue);break;
	      }
	  }
	}
};
