<template>
  <div id="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-analyze"></i> 度量分析</el-breadcrumb-item>
        <el-breadcrumb-item>产品缺陷</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane label="测试缺陷" name="defect">
        <v-defect v-if="activeName=='defect'"></v-defect>
      </el-tab-pane>
      <el-tab-pane label="线上问题" name="problem">
        <v-problem v-if="activeName=='problem'"></v-problem>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { dateFormat, pickOptions } from "@/util/date.js";
import DefectAnalysis from './DefectAnalysis.vue';
import ProblemAnalysis from './ProblemAnalysis.vue';
export default {
  data: function() {
    return {
      activeName: "defect"
    }
  },

  components: {
    vDefect: DefectAnalysis,
    vProblem: ProblemAnalysis
  },

  created() {
  },

  methods: {
  }
};
</script>