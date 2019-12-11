<template>
  <div ref="root" class="about-sepp">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item><i class="el-icon-setting"></i> 系统配置</el-breadcrumb-item>
        <el-breadcrumb-item>系统说明</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <iframe src="/static/docs/index.html" style="border:none;width:100%;height:13200px;overflow:auto"></iframe>
  </div>
</template>
<script>
  export default {
    props: ["collapsed"],

    created() {
      let _self =  this;
      _self.init();
    },

    methods: {
      init() {
        if (document.body.clientWidth < 1600 && !this.collapsed) {
          this.$message.warning("检测到您页面宽度不足，建议收起侧边栏！");
        }
      }
    }
  }
</script>
