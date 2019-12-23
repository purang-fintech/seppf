<template>
  <iframe class="monitor-frame" src="http://10.10.96.140:8009/octopus" :style="{height:bodyHeight + 'px'}">
  </iframe>
</template>

<script>
export default {
  name: "MonitorAdmin",
  data: function () {
    return {
      bodyHeight: document.body.clientHeight - 55
    };
  }
};
</script>

<style>
.monitor-frame {
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
