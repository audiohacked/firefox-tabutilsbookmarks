'use strict';

let {classes: Cc, interfaces: Ci, utils: Cu} = Components;

var EXPORTED_SYMBOLS = ['Helper'];

var Helper = {
	hookCode: function (aStr) {
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
	      Components.utils.reportError("Failed to hook " + aStr + ": " + e.message);
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
	    Components.utils.reportError("Failed to hook " + aStr + ": " + e.message);
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
	}
};
