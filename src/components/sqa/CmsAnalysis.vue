<template>
  <div id="root" class="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-analyze"></i> 度量分析</el-breadcrumb-item>
        <el-breadcrumb-item>开发任务</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="query-condition-cms">
      <div class="ana-mode">
        <el-radio-group v-model="anaMode" size="small" @change="transQueryMode()">
          <el-radio-button label="1">按版本分析</el-radio-button>
          <el-radio-button label="2">按任务拆分日期分析</el-radio-button>
        </el-radio-group>
      </div>

      <div style="display:inline-block">
        <el-select v-if="anaMode==='1'" v-model="releases.selected" size="small" @change="refreshData()" placeholder="请选择版本号">
          <el-option v-for="opt in releases.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
        </el-select>

        <el-date-picker
          v-if="anaMode==='2'"
          v-model="anaPeriod"
          type="daterange"
          size="small"
          align="right"
          unlink-panels
          :value-format="datefmt"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="checkPeriod()"
          :clearable="false"
          :picker-options="pickOptions">
        </el-date-picker>
      </div>
    </div>

    <div>
      <div class="cms-container">
        <v-spliter :datas="spliters" v-if="null != spliters && spliters.length > 0"></v-spliter>
        <h1 v-if="spliters == null || spliters == ''" class="no-data">开发任务拆分人分布<br><br>暂无数据</h1>
      </div>
      <div class="cms-container">
        <v-responser :datas="responsers" v-if="null != responsers && responsers.length > 0"></v-responser>
        <h1 v-if="responsers == null || responsers == ''" class="no-data">开发任务负责人分布<br><br>暂无数据</h1>
      </div>
    </div>
    <div>
      <div class="cms-container">
        <v-status :datas="statuss" v-if="null != statuss && statuss != ''"></v-status>
        <h1 v-if="statuss == null || statuss == ''" class="no-data">开发任务状态分布<br><br>暂无数据</h1>
      </div>
      <div class="cms-container">
        <v-module :datas="modules" v-if="null != modules && modules != ''"></v-module>
        <h1 v-if="modules == null || modules == ''" class="no-data">开发任务模块分布<br><br>暂无数据</h1>
      </div>
    </div>
    <div>
      <div class="cms-container">
        <v-cost :datas="cmsCosts" v-if="null != cmsCosts && cmsCosts != ''"></v-cost>
        <h1 v-if="cmsCosts == null || cmsCosts == ''" class="no-data">开发任务消耗人力分布<br><br>暂无数据</h1>
      </div>
      <div class="cms-container">
        <v-offset :datas="offsets" v-if="null != offsets && offsets != ''"></v-offset>
        <h1 v-if="offsets == null || offsets == ''" class="no-data">开发任务完成偏差分布<br><br>暂无数据</h1>
      </div>
    </div>
  </div>
</template>

<script>
import {
  dateFormat,
  pickOptions
} from "@/util/date.js";
import cmsSpliter from "./cms/CmsSpliter.vue";
import cmsResponser from "./cms/CmsResponser.vue";
import cmsModule from "./cms/CmsModule.vue";
import cmsStatus from "./cms/CmsStatus.vue";
import cmsCost from "./cms/CmsManpower.vue";
import cmsOffset from "./cms/CmsOffset.vue";
import commonQuery from "@/components/util/CommonQuery.vue";
let versions = [];
export default {
  data: function () {
    return {
      anaMode: "1",
      releases: {
        selected: "",
        opts: []
      },
      anaPeriod: [],
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      spliters: [],
      responsers: [],
      modules: [],
      statuss: [],
      cmsCosts: [],
      cmNums: [],
      offsets: []
    }
  },

  components: {
    vSpliter: cmsSpliter,
    vResponser: cmsResponser,
    vModule: cmsModule,
    vStatus: cmsStatus,
    vCost: cmsCost,
    vOffset: cmsOffset
  },

  created() {
    this.setDefaultPeriod();
    this.releaseQuery(this.refreshData);
  },

  methods: {
    setDefaultPeriod() {
      let date = new Date();
      let oldDay = new Date();
      let qTimeEnd = dateFormat(date, this.datefmt);
      oldDay.setTime(oldDay.getTime() - 3600 * 1000 * 24 * 90);
      let qTimeBegin = dateFormat(oldDay, this.datefmt);
      this.anaPeriod.splice(0, this.anaPeriod.length);
      this.anaPeriod.push(qTimeBegin);
      this.anaPeriod.push(qTimeEnd);
    },

    transQueryMode() {
      if (this.anaMode == 1) {
        this.releaseQuery(this.refreshData);
      } else {
        this.releases.selected = "";
        this.setDefaultPeriod();
        this.refreshData();
      }
    },

    checkPeriod() {
      let start = this.anaPeriod[0];
      let end = this.anaPeriod[1];
      let period = (Date.parse(end.replace('/-/g', '/')) - Date.parse(start.replace('/-/g', '/'))) / (3600 * 1000 * 24);
      if (period > 183) {
        this.$message.info("请查询六个月以内的数据！");
        this.setDefaultPeriod();
        return;
      }
      this.refreshData();
    },

    refreshData() {
      this.spliters.splice(0, this.spliters.length);
      this.cmsSpliter();
      this.responsers.splice(0, this.responsers.length);
      this.cmsResponser();
      this.cmsCosts.splice(0, this.cmsCosts.length);
      this.cmsCost();
      this.modules.splice(0, this.modules.length);
      this.cmsModule();
      this.statuss.splice(0, this.statuss.length);
      this.cmsStatus();
      this.offsets.splice(0, this.offsets.length);
      this.cmsDevOffset();
    },

    cmsSpliter() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/cmsSpliter",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.spliters = eval(res.data);
        })
    },

    cmsResponser() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/cmsResponser",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.responsers = eval(res.data);
        })
    },

    cmsStatus() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/cmsStatus",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.statuss = eval(res.data);
        })
    },

    cmsModule() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/cmsModule",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.modules = eval(res.data);
        })
    },

    cmsCost() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/cmsManpower",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.cmsCosts = eval(res.data);
        })
    },

    cmsDevOffset() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/cmsOffset",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.offsets = eval(res.data);
        })
    },

    releaseQuery(callback) {
      let _self = this;
      _self.releases.opts.splice(0, _self.releases.opts.length);
      commonQuery.releaseQuery((result) => {
        if (result.releasesWithBranch.length === 0) {
          _self.$message.info("该产品未建立版本计划！");
          return;
        }
        _self.releases.opts = result.releasesWithBranch;
        _self.releases.selected = result.releasesWithBranch[0].value;
        if (typeof callback === "function") {
          callback();
        }
      })
    },
  }
};
</script>

<style>
.query-condition-cms {
  display: block;
  margin: 30px 0 0.5% 0;
}

.query-condition-cms .ana-mode {
  display: inline-block;
  margin-right: 20px;
}

.query-condition-cms .ana-mode .el-radio-button span {
  font-size: 13px;
}

.cms-container {
  width: 49%;
  height: 300px;
  display: inline-block;
  border-radius: 2px;
  margin-top: 1%;
  border: 1px solid #e4edf3;
  background-color: #3b434e;
}

.cms-container+.cms-container {
  margin-left: 1%;
}

.cms-container .no-data {
  font-size: 20px;
  width: 100%;
  display: table;
  text-align: center;
  margin-top: 20%;
  font-weight: 700;
  color: #fff;
}
</style>
