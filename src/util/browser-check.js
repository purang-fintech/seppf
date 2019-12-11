import {
    Message
  } from 'element-ui';

// 控制避免使用部分不安全的浏览器
let ua = navigator.userAgent.toLowerCase();
let mimeTypes = navigator.mimeTypes;
let isRubbish = false;
for (var mt in mimeTypes) {
  if (mimeTypes[mt]["type"] == "application/vnd.chromium.remoting-viewer") {
    isRubbish = true;
  }
}

if (ua.indexOf("chrome") <= 1 || (ua.indexOf("chrome") > 1 && isRubbish)) {
  Message.warning("非Chrome浏览器可能会有功能异常！");
}
