<template>
  <div id="root" style="width: 100%">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="开发任务" name="coding">
        <v-cms v-if="activeName=='coding'"></v-cms>
      </el-tab-pane>
      <el-tab-pane label="测试任务" name="testing">
        <v-tms v-if="activeName=='testing'"></v-tms>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import codeMission from './CodeMission.vue';
import testMission from './TestMission.vue';
export default {
  data() {
    return {
      activeName: 'coding',
    }
  },

  created() {
    this.activeName = this.$route.params.type ? this.$route.params.type : "coding";
  },

  components: {
    vCms: codeMission,
    vTms: testMission
  },
};
</script>