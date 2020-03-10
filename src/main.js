import Vue from "vue";
import router from "./router";
import axios from "axios";
import ElementUI from "element-ui";
import store from "./components/util/minder/store";

import "./assets/style/main.css";
import "./assets/style/chalk/index.css";
import "./assets/icon/iconfont.css";
import locale from "./assets/locale/cn.js";

import "./util/global";
import "./util/permissions";
import "./util/axios-http-interceptors";
import "./util/browser-check";
import "./util/double-commit-control";

import App from "./App";

Vue.use(ElementUI, {
  locale
});

Vue.config.productionTip = false;
Vue.prototype.$axios = axios;

axios.defaults.baseURL = process.env.ROOT_URL;
axios.defaults.headers.common["Content-Type"] =
  "application/json;charset=utf-8";
axios.defaults.withCredentials = true;

new Vue({
  el: "#sepp",
  router,
  store,
  template: "<App/>",
  components: {
    App
  }
});
