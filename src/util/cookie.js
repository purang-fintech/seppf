export function getCookie(name) {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg))
    return (arr[2]);
  else
    return null;
}

export function setCookie(c_name, value, expireSeconds) {
  var exdate = new Date();
  exdate.setSeconds(exdate.getSeconds() + expireSeconds);
  document.cookie = c_name + "=" + escape(value) + ((expireSeconds == null) ? "" : ";expires=" + exdate.toGMTString());
};

export function delCookie(name) {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval = getCookie(name);
  if (cval != null)
    document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
};
