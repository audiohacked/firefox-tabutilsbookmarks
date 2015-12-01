'use strict';
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
