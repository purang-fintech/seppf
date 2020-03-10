import {
  Message
} from 'element-ui';

function toFullScreen(){
  let elem = document.body;
  elem.webkitRequestFullScreen
  ? elem.webkitRequestFullScreen()
  : elem.mozRequestFullScreen
  ? elem.mozRequestFullScreen()
  : elem.msRequestFullscreen
  ? elem.msRequestFullscreen()
  : elem.requestFullScreen
  ? elem.requestFullScreen()
  : Message.warning("浏览器不支持全屏！");
}

function exitFullScreen(){
  let elem = parent.document;
  elem.webkitCancelFullScreen
  ? elem.webkitCancelFullScreen()
  : elem.mozCancelFullScreen
  ? elem.mozCancelFullScreen()
  : elem.cancelFullScreen
  ? elem.cancelFullScreen()
  : elem.msExitFullscreen
  ? elem.msExitFullscreen()
  : elem.exitFullscreen
  ? elem.exitFullscreen()
  : Message.warning("浏览器不支持全屏！");
}

export {
  toFullScreen,
  exitFullScreen
}