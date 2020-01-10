<template>
  <iframe class="sonar-frame" v-bind:src="sonarUrl" :style="{height:bodyHeight + 'px'}">
  </iframe>
</template>

<script>
export default {
  name: "MonitorAdmin",
  data: function () {
    return {
      bodyHeight: document.body.clientHeight,
      sonarUrl: ''
    };
  },

  created() {
    this.sonarUrl = "http://sonar.purang.com/dashboard?id=" + this.$route.query.projectKey + "&output=embed";
  }
};
</script>

<style>
.sonar-frame {
  width: 99.8%;
  border: 1px solid #e4edf3;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
