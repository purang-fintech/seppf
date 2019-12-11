<template>
  <div class="relate-query">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>关联开发需求</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-form :inline="true" size="mini" label-width="60px">
      <el-form-item label="版本">
        <el-select v-model="relId" style="width:150px" placeholder="请选择" @change="relReqQuery()">
          <el-option v-for="opt in openReleases" :label="opt.label" :key="opt.value" :value="opt.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="需求">
        <el-select v-model="reqIds" style="width:400px" placeholder="请选择" multiple collapse-tags>
          <el-option v-for="opt in reqs" :label="opt.label" :key="opt.value" :value="opt.value" :disabled="opt.disabled"></el-option>
        </el-select>
      </el-form-item>
      <br>
      <el-form-item style="float:right;">
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="reqBatchQuery()">刷新</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-check" @click="relate()" :disabled="prodForbbiden() || reqIds.length == 0">关联</el-button>
      </el-form-item>
    </el-form>
    <div class="related-table" v-bind:style="{height: tableHeight + 'px'}">
      <div class="crumbs">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>已关联开发需求</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-table :data="relatedReqs" style="width: 100%;" :max-height="tableHeight - 30" stripe size="mini" :border="showBorder">
        <el-table-column prop="id" label="产品需求号" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="relCode" label="版本号" width="120" align="center">
        </el-table-column>
        <el-table-column prop="statusName" label="需求状态" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="summary" label="需求摘要" header-align="center">
        </el-table-column>
        <el-table-column  width="90" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="text" size="mini" @click="unrelate(scope.row.id)" :disabled="prodForbbiden()">解除关联</el-button>
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
      relatedReqs: [], //已关联的REQ
      relId: "",
      openReleases: [],
      reqIds: [],
      reqs: [],
      tableHeight: ""
    };
  },

  created() {
    this.tableHeight = bodyAviHeightNTab - 170;
    this.openRelQuery();
    this.relatedReqQuery();
  },

  methods: {
    relate() {
      let _self =  this;
      _self.$axios.post("/case/relate_save", {
        caseId: _self.caseId,
        ids: _self.reqIds.toString(),
        relateType: 2
      })
      .then(function(res) {
        if (res.data > 0) {
          _self.$message.success("关联成功！");
          _self.reqIds = [];
          _self.relatedReqQuery();
        } else {
          _self.$message.info("关联失败！");
        }
      })
    },

    unrelate(id) {
      let _self =  this;
      _self.$axios.post("/case/relate_delete", {
        caseId: _self.caseId,
        id: id,
        relateType: 2
      })
      .then(function(res) {
        if (res.data > 0) {
          _self.$message.success("解除关联成功");
          _self.relatedReqQuery();
        } else {
          _self.$message.info("解除关联失败");
        }
      })
    },

    prodForbbiden(){
      return parseInt(this.currentProd) != parseInt(sessionStorage.productId);
    },

    relatedReqQuery() {
      let _self =  this;
      _self.$axios.post("/case/releted_req/" + _self.caseId)
      .then(function(res) {
        _self.relatedReqs = eval(res.data);
        let relatedIds = [];
        _self.relatedReqs.forEach(d => {relatedIds.push(d.id)});
        _self.reqs.forEach(item => {
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

    relReqQuery() {
      let _self =  this;
      _self.$axios.post("/req/rel_query/" + _self.relId + "/1/500")
      .then(function(res) {
        let related = [];
        _self.relatedReqs.forEach(d => {related.push(d.id)});
        _self.reqs.splice(0, _self.reqs.length);
        eval(res.data.list).forEach(item => {
          _self.reqs.push({
            value: item.id,
            label: item.id + " - " + item.summary,
            disabled: related.indexOf(item.id) > -1
          });
        });
      })
    }
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
