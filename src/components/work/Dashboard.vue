<template>
  <div id="root" style="width: 100%">
    <el-tabs v-model="activeName" type="card" class="dash-tabs">
      <el-tab-pane label="产品需求" name="req">
        <v-req v-if="activeName=='req'"></v-req>
      </el-tab-pane>
      <el-tab-pane label="开发任务" name="cms">
        <v-cms v-if="activeName=='cms'"></v-cms>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import cmsDash from './MissionPannel.vue';
import reqDash from './ReqPannel.vue';
export default {
  data() {
    return {
      activeName: 'req',
    }
  },

  created() {
    this.activeName = this.$route.params.type ? this.$route.params.type : "req";
  },

  components: {
    vCms: cmsDash,
    vReq: reqDash
  },
};
</script>

<style>
.dash-tabs .el-tabs__content {
  overflow: visible;
}
</style>
