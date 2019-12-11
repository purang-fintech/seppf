<template>
  <div class="relate-query">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>关联缺陷</el-breadcrumb-item>
      </el-breadcrumb> 
    </div>
    <el-form :inline="true" size="mini" label-width="60px">
      <el-form-item label="版本">
        <el-select v-model="relId" style="width:150px" placeholder="请选择" @change="relDefectQuery()">
          <el-option v-for="opt in openReleases" :label="opt.label" :key="opt.value" :value="opt.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="缺陷">
        <el-select v-model="defectIds" style="width:400px" multiple placeholder="请选择" collapse-tags @change="checkDisable()">
          <el-option v-for="opt in defects" :label="opt.label" :key="opt.value" :value="opt.value" :disabled="opt.disabled"></el-option>
        </el-select>
      </el-form-item>
      <br>
      <el-form-item style="float:right;">
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="relatedDefectQuery()">刷新</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-check" @click="relate()" :disabled="btnDisabled || prodForbbiden()">关联</el-button>
      </el-form-item>
    </el-form>
    <div class="related-table" v-bind:style="{height: tableHeight + 'px'}">
      <div class="crumbs">
          <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item>已关联缺陷</el-breadcrumb-item>
          </el-breadcrumb>
      </div>
      <el-table :data="relatedBugs" style="width: 100%;" :max-height="tableHeight - 30" stripe size="small" :border="showBorder">
        <el-table-column prop="id" label="缺陷编号" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="relCode" label="版本号" width="120" align="center">
        </el-table-column>
        <el-table-column prop="statusName" label="缺陷状态" width="120" align="center" sortable>
        </el-table-column>
        <el-table-column prop="summary" label="缺陷摘要" header-align="center">
        </el-table-column>
        <el-table-column  width="80" align="center" label="操作">
            <template slot-scope="scope">
                <el-button v-no-more-click type="text" size="small" @click="unrelate(scope.row.id)" :disabled="prodForbbiden()">解除关联</el-button>
            </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      relatedBugs: [], //已关联的defect
      btnDisabled: true,
      relId: "",
      openReleases: [],
      defectIds: [],
      defects: [],
      tableHeight: ""
    };
  },

  created() {
    this.tableHeight = bodyAviHeightNTab - 170;
    this.openRelQuery();
    this.relatedDefectQuery();
  },

  methods: {
    relate() {
      let _self =  this;
      _self.$axios.post("/case/relate_save", {
        caseId: _self.caseId,
        ids: _self.defectIds.toString(),
        relateType: 1
      })
      .then(function(res) {
        if (res.data > 0) {
          _self.$message.success("关联成功");
          _self.defectIds = [];
          _self.relatedDefectQuery();
        } else {
          _self.$message.info("关联失败");
        }
      })
    },

    unrelate(id) {
      let _self =  this;
      _self.$axios.post("/case/relate_delete", {
        caseId: _self.caseId,
        id: id,
        relateType: 1
      })
      .then(function(res) {
        if (res.data > 0) {
          _self.$message.success("解除关联成功");
          _self.relatedDefectQuery();
        } else {
          _self.$message.info("解除关联失败");
        }
      })
    },

    checkDisable(){
      this.btnDisabled = this.defectIds.length == 0;
    },

    prodForbbiden(){
      return parseInt(this.currentProd) != parseInt(sessionStorage.productId);
    },

    relatedDefectQuery() {
      let _self =  this;
      _self.$axios.post("/case/releted_defect/" + _self.caseId)
      .then(function(res) {
        _self.relatedBugs = eval(res.data);
        let relatedIds = [];
        _self.relatedBugs.forEach(d => {relatedIds.push(d.id)});
        _self.defects.forEach(item => {
          _self.$set(item, "disabled", relatedIds.indexOf(item.value) > -1);
        });
      })
    },

    openRelQuery() {
      let _self =  this;
      _self.$axios({
        method: "post",
        url: "/release/opening",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        }
      })
      .then(function (res) {
        let releases = eval(res.data);
        _self.openReleases.splice(0, _self.openReleases.length);
        for (let i = releases.length - 1; i >= 0; i--) {
          _self.openReleases.push({
            label: "[" + releases[i].branchName + "]" + releases[i].relCode,
            value: releases[i].id
          });
        }
      })
    },

    relDefectQuery() {
      let _self =  this;
      _self.$axios({
        method: "post",
        url: "/defect/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        params: {
          relId: _self.relId
        }
      })
      .then(function(res) {
        let related = [];
        _self.relatedBugs.forEach(d => {related.push(d.id)});
        _self.defects.splice(0, _self.defects.length);
        eval(res.data.list).forEach(item => {
          _self.defects.push({
            value: item.id,
            label: item.id + " - " + item.summary,
            disabled: related.indexOf(item.id) > -1
          });
        });
      })
    },
  },
  
  props: ["caseId", "currentProd"]
};
</script>

<style>
.relate-query {
  margin-top: 10px;
}

.related-table {
  margin-top: 10px;
}
</style>
