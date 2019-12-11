import Vue from 'vue';
import router from '../router';
import axios from 'axios';
import Auth from '../components/auth/auth'
import Has from '../components/auth/has'
Vue.use(Auth);
Vue.use(Has);
import {
  Message
} from 'element-ui';

Vue.prototype.$auth = function (options) {
  this.$axios.get("/resource/configs/auth/" + this.$options.name)
    .then(resp => {
      if (this.$options.name && resp.data && resp.data.length) {
        localStorage.removeItem(this.$options.name);
        localStorage.setItem(this.$options.name, JSON.stringify(resp.data));
      }
    })
    .catch(e => {});
};

function checkRouter(from, to, callback) {
  axios.get("/router/auth?router=" + to.path).then(resp => {
    if (!resp.data.hasLoginAuth) {
      if (from.path != "/") {
        Message.warning("登录信息无效，请登录！");
      }
      router.push("/login");
      return;
    }
    if (!resp.data.hasRouterAuth) {
      router.push(from.path);
      Message.warning("您未被授权访问此页面，请联系管理员！");
      return;
    }
    if (typeof callback == "function") {
      callback();
    }
  })
}

function isUnLogin() {
  return sessionStorage.userId == null ||sessionStorage.productId == null;
}

router.beforeEach((to, from, next) => {
  // 记录上次操作页面URL
  let excepts = ["/exitus", "/schedule", "/reporter"];
  if (excepts.indexOf(from.path) == -1) {
    localStorage.setItem("lastUrl", from.path);
  }

  // 登入登出状态与逻辑全局控制
  if (to.matched.some(m => m.meta.requireAuth)) {
    if (to.path == '/login' || to.path == '/unauthed') {
      next();
    } else {
      checkRouter(from, to, () => {
        next();
      });
    }
  } else {
    // 不需要登录即可访问的链接，2秒后提示是否登录
    next();
    setTimeout(() => {
      if (isUnLogin() && from.path != '/login') {
        if (window.confirm("更多功能需要登录方可体验，是否登录？")) {
          localStorage.setItem("lastUrl", from.path);
          next("/login");
        }
      }
    }, 5000);
  }
})
