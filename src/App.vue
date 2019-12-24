<template>
  <div id="sepp" @click="userAlive()">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "sepp",
      lastTime: null,
      currentTime: null,
      logoutInterval: 60 * 60 * 1000,
      keepaliveInterval: 5 * 60 * 1000
    };
  },

  created() {
    this.lastTime = new Date().getTime();
  },

  methods: {
    userAlive() {
      let _self = this;
      if (_self.$route.path == "/login") {
        _self.lastTime = new Date().getTime();
        return;
      }

      // 记录上次操作页面URL
      let excepts = ["/exitus", "/schedule", "/reporter"];
      if (excepts.indexOf(_self.$route.path) == -1) {
        localStorage.setItem("lastUrl", _self.$route.path);
      }

      _self.currentTime = new Date().getTime();
      let currentInterval = _self.currentTime - _self.lastTime;
      if (currentInterval >= _self.keepaliveInterval && currentInterval <= _self.logoutInterval) {
        _self.$axios.get("/sepp").then(resp => {
            // 每隔一段时间检查前端用户是否活跃，活跃则向后端探测一下，便于jwt返回活跃状态
          })
          .catch(e => {
            _self.$message.warning("后端服务异常，请稍后重新登录！");
            _self.$router.push("/login");
            return;
          });
      }
      if (currentInterval > _self.logoutInterval) {
        _self.$message.warning("登录已超时，请重新登录！");
        setTimeout(() => {
          _self.$router.push("/login");
        }, 200);
      }
      _self.lastTime = new Date().getTime();
    }
  }
};
</script>

<style>body {
  margin: 0px;
  padding: 0px;
  font-family: "Helvetica Neue", "Helvetica", "PingFang SC", "Hiragino Sans GB","Microsoft YaHei", "SimSun", "sans-serif";
  font-size: 14px !important;
  width: 100%;
  height: 100%;
  background: url(assets/img/bg.jpg) cover;
  -webkit-font-smoothing: antialiased;
  background: url("assets/img/bg.jpg");
  background-attachment: fixed;
  filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(
      src="assets/img/bg.jpg",
      sizingMethod="scale"
    );
  -ms-filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(
      src="assets/img/bg.jpg",
      sizingMethod="scale"
    );
  background-size: cover;
  -moz-background-size: cover;
  -webkit-background-size: cover;
}

#sepp {
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 100%;
}
</style>
