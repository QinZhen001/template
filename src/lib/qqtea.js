!function(r,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.qqtea=e():r.qqtea=e()}(window,function(){return function(r){var e={};function t(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return r[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}return t.m=r,t.c=e,t.d=function(r,e,n){t.o(r,e)||Object.defineProperty(r,e,{enumerable:!0,get:n})},t.r=function(r){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(r,"__esModule",{value:!0})},t.t=function(r,e){if(1&e&&(r=t(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var o in r)t.d(n,o,function(e){return r[e]}.bind(null,o));return n},t.n=function(r){var e=r&&r.__esModule?function(){return r.default}:function(){return r};return t.d(e,"a",e),e},t.o=function(r,e){return Object.prototype.hasOwnProperty.call(r,e)},t.p="",t(t.s=0)}([function(r,e,t){r.exports=t(1)},function(r,e,t){"use strict";var n=t(2),o=t(3),u={encrypt:function(r,e){var t=o.encode(r);return n.encrypt(t,e)},decrypt:function(r,e){var t=n.decrypt(r,e);return o.decode(t)}};r.exports=u},function(r,e,t){"use strict";var n=2654435769;function o(r,e,t,n){for(var o=t,u=a(r),f=a(e);n-- >0;)u[0]+=(u[1]<<4&4294967280)+f[0]^u[1]+o^(u[1]>>5&134217727)+f[1],u[1]+=(u[0]<<4&4294967280)+f[2]^u[0]+o^(u[0]>>5&134217727)+f[3],o+=t;return i(u)}function u(r,e,t,n){for(var o=t*n>>>0,u=a(r),f=a(e);n-- >0;)u[1]-=(u[0]<<4&4294967280)+f[2]^u[0]+o^(u[0]>>5&134217727)+f[3],u[1]=u[1]>>>0,u[0]-=(u[1]<<4&4294967280)+f[0]^u[1]+o^(u[1]>>5&134217727)+f[1],u[0]=u[0]>>>0,o-=t;return i(u)}function f(r,e){r=c(r),e=c(e);for(var t,n=r.length,o=[],u=0;u<n;u+=4)t="0000"+(parseInt(r.substr(u,4),16)^parseInt(e.substr(u,4),16)).toString(16),o.push(t.substr(t.length-4));return o.join("").replace(/\s/g,"").replace(/(..)/g,function(r,e){return String.fromCharCode(parseInt(e,16))})}function c(r){for(var e=[],t=r.length;t--;){var n="00"+r.charCodeAt(t).toString(16);e.push(n.substr(n.length-2))}return e.reverse().join("")}function a(r){for(var e=[],t=0,n=r.length;t<n;t+=4)e.push((r.charCodeAt(t+0)<<24|r.charCodeAt(t+1)<<16|r.charCodeAt(t+2)<<8|r.charCodeAt(t+3))>>>0);return e}function i(r){for(var e=0,t=r.length;e<t;e++)r[e]=String.fromCharCode(r[e]>>24&255,r[e]>>16&255,r[e]>>8&255,255&r[e]);return r.join("")}e.encrypt=function(r,e){var t=(8-(r.length+2))%8;t+=2+(t<0?8:0);for(var u=new Array(t+1).join(",").replace(/,/g,function(){return String.fromCharCode(parseInt(256*Math.random()))}),c=String.fromCharCode(t-2|248)+u+r+String.fromCharCode.apply(String,[0,0,0,0,0,0,0]),a="\0\0\0\0\0\0\0\0",i=a,d="",s=a,p=0;p<c.length;p+=8)s=f(c.substr(p,8),a),a=f(o(s,e,n,16),i),i=s,d+=a;return d},e.decrypt=function(r,e){for(var t,o=r.substr(0,8),a=u(o,e,n,16),i=2+(7&a.charCodeAt(0)),d=a,s=8;s<r.length;s+=8)t=f(u(f(r.substr(s,8),a),e,n,16),o),a=f(t,o),o=r.substr(s,8),d+=t;return 0!==parseInt(c(d.substr(d.length-7)),16)?"":(i++,d.substr(i,d.length-7-i))}},function(r,e,t){"use strict";r.exports={encode:function(r){var e=r.replace(/[\u0080-\u07ff]/g,function(r){var e=r.charCodeAt(0);return String.fromCharCode(192|e>>6,128|63&e)});return e=e.replace(/[\u0800-\uffff]/g,function(r){var e=r.charCodeAt(0);return String.fromCharCode(224|e>>12,128|e>>6&63,128|63&e)})},decode:function(r){var e=r.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,function(r){var e=(15&r.charCodeAt(0))<<12|(63&r.charCodeAt(1))<<6|63&r.charCodeAt(2);return String.fromCharCode(e)});return e=e.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g,function(r){var e=(31&r.charCodeAt(0))<<6|63&r.charCodeAt(1);return String.fromCharCode(e)})}}}])});