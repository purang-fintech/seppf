<template>
  <el-card class="box-card" id="buildLog">
    <div slot="header" class="clearfix">
      <span>
        <h2>{{jobName}}</h2>构建日志
      </span>
    </div>
      <pre class="console-output" v-html="buildLog" :style="{height: contentHeight + 'px'}">
              {{buildLog}}
      </pre>
    <div v-bind:style="{ display: isDisplay }">
      <img src="/static/img/loading.gif">
    </div>
  </el-card>
</template>

<script>
  export default {
    data() {
      return {
        jobName: "",
        buildVersion: "",
        timer: null,
        buildLog: '',
        isDisplay:"none",
        instanceType:"",
        contentHeight: document.body.clientHeight - 200
      }
    },
    methods: {
      logConsole() {
        let _self =  this;
        _self.$axios.get("/build/build-log?jobName=" + this.jobName + "&buildVersion=" + this.buildVersion+"&instanceType="+this.instanceType)
          .then(function (res) {
            _self.buildLog = res.data.buildLog;
            if (!res.data.continue) {
              _self.isDisplay = "none";
              clearInterval(_self.timer);
              return;
            }
          })
      }
    },

    destroyed() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null;
      }
    },

    created() {
      this.jobName = this.$route.query.jobName;
      this.buildVersion = this.$route.query.buildVersion;
      this.buildStatus = this.$route.query.buildStatus;
      this.instanceType = this.$route.query.instanceType;
      this.logConsole();
      if (this.buildStatus == 'BUILDING') {
        this.isDisplay = true;
        this.timer = setInterval(() => {
          if (document.getElementById("buildLog") === null) {
            clearInterval(_self.timer);
            return;
          }
          this.logConsole();
        }, 6000)
      }
    }
  }
</script>

<style scoped>
  .console-output {
    font-size: 14px;
    background-color: #393939;
    color: #b5c4d0;
    padding: 20px 20px 30px;
    border-radius: 2px;
    -webkit-box-shadow: 0 1px 10px rgba(0, 0, 0, .32);
    -moz-box-shadow: 0 1px 10px rgba(0, 0, 0, .32);
    box-shadow: 0 1px 10px rgba(0, 0, 0, .32);
    -webkit-background-clip: padding-box;
    background-clip: padding-box;
    -webkit-border-radius: 2px;
    -moz-border-radius: 2px;
    border-radius: 2px;
    border: 1px solid rgba(0, 0, 0, .2);
    word-wrap: break-word;
    overflow: auto;
  }

  .box-card {
    width: 100%;
    margin: auto;
  }
</style>
