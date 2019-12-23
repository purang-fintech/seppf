<template>
  <div id="root" class="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-analyze"></i> 度量分析</el-breadcrumb-item>
        <el-breadcrumb-item>产品需求</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="query-condition-req">
      <div class="ana-mode">
        <el-radio-group v-model="anaMode" size="small" @change="transQueryMode()">
          <el-radio-button label="1">按版本分析</el-radio-button>
          <el-radio-button label="2">按需求提交日期分析</el-radio-button>
        </el-radio-group>
      </div>

      <div style="display:inline-block">
        <el-select v-if="anaMode==='1'" v-model="relId" size="small" @change="refreshData()" placeholder="请选择版本号">
          <el-option v-for="opt in releases" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
        </el-select>

        <el-date-picker
          v-if="anaMode==='2'"
          v-model="anaPeriod"
          style="vertical-align:middle"
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
      <div class="req-container">
        <v-type :datas="types" v-if="null != types && types != ''"></v-type>
        <h1 v-if="types == null || types == ''" class="no-data">产品需求类型分布<br><br>暂无数据</h1>
      </div>
      <div class="req-container">
        <v-priority :datas="prioritys" v-if="null != prioritys && prioritys != ''"></v-priority>
        <h1 v-if="prioritys == null || prioritys == ''" class="no-data">产品需求紧急程度分布<br><br>暂无数据</h1>
      </div>
    </div>
    <div>
      <div class="req-container">
        <v-status :datas="statuss" v-if="null != statuss && statuss != ''"></v-status>
        <h1 v-if="statuss == null || statuss == ''" class="no-data">产品需求状态分布<br><br>暂无数据</h1>
      </div>
      <div class="req-container">
        <v-module :datas="modules" v-if="null != modules && modules != ''"></v-module>
        <h1 v-if="modules == null || modules == ''" class="no-data">产品需求模块分布<br><br>暂无数据</h1>
      </div>
    </div>
    <div>
      <div class="req-container">
        <v-close :datas="closes" v-if="null != closes && closes != ''"></v-close>
        <h1 v-if="closes == null || closes == ''" class="no-data">产品需求关闭方式分布<br><br>暂无数据</h1>
      </div>
      <div class="req-container">
        <v-change :datas="changes" v-if="null != changes && changes != ''"></v-change>
        <h1 v-if="changes == null || changes == ''" class="no-data">产品需求变更次数分布<br><br>暂无数据</h1>
      </div>
    </div>
    <div>
      <div class="req-container">
        <v-submitter :datas="submitters" v-if="null != submitters && submitters.length > 0"></v-submitter>
        <h1 v-if="submitters == null || submitters == ''" class="no-data">产品需求完提出人分布<br><br>暂无数据</h1>
      </div>
      <div class="req-container">
        <v-offset :datas="offsets" v-if="null != offsets && offsets != ''"></v-offset>
        <h1 v-if="offsets == null || offsets == ''" class="no-data">产品需求完成偏差分布<br><br>暂无数据</h1>
      </div>
    </div>
  </div>
</template>

<script>
import {
  dateFormat,
  pickOptions
} from "@/util/date.js";
import reqType from "./req/ReqType.vue";
import reqPriority from "./req/ReqPriority.vue";
import reqStatus from "./req/ReqStatus.vue";
import reqChange from "./req/ReqChange.vue";
import reqModule from "./req/ReqModule.vue";
import reqClose from "./req/ReqClose.vue";
import reqSubmitter from "./req/ReqSubmitter.vue";
import reqOffset from "./req/ReqOffset.vue";
import commonQuery from "@/components/util/CommonQuery.vue";
export default {
  data: function () {
    return {
      anaMode: "1",
      anaPeriod: [],
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      releases: [],
      relId: "",
      types: [],
      prioritys: [],
      submitters: [],
      offsets: [],
      statuss: [],
      changes: [],
      modules: [],
      closes: []
    }
  },

  components: {
    vType: reqType,
    vPriority: reqPriority,
    vStatus: reqStatus,
    vChange: reqChange,
    vModule: reqModule,
    vClose: reqClose,
    vSubmitter: reqSubmitter,
    vOffset: reqOffset
  },

  created() {
    this.setDefaultPeriod();
    this.releaseQuery(this.refreshData);
  },

  methods: {
    setDefaultPeriod() {
      let date = new Date();
      let qTimeEnd = dateFormat(date, this.datefmt);
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 90);
      let qTimeBegin = dateFormat(date, this.datefmt);
      this.anaPeriod.splice(0, this.anaPeriod.length);
      this.anaPeriod.push(qTimeBegin);
      this.anaPeriod.push(qTimeEnd);
    },

    transQueryMode() {
      if (this.anaMode == 1) {
        this.releaseQuery(this.refreshData);
      } else {
        this.relId = "";
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
        this.anaPeriod.splice(0, this.anaPeriod.length);
        this.setDefaultPeriod();
        return;
      }
      this.refreshData();
    },

    refreshData() {
      this.types.splice(0, this.types.length);
      this.reqType();
      this.prioritys.splice(0, this.prioritys.length);
      this.reqPriority();
      this.statuss.splice(0, this.statuss.length);
      this.reqStatus();
      this.changes.splice(0, this.changes.length);
      this.reqChange();
      this.modules.splice(0, this.modules.length);
      this.reqModule();
      this.closes.splice(0, this.closes.length);
      this.reqClose();
      this.submitters.splice(0, this.submitters.length);
      this.reqSubmitter();
      this.offsets.splice(0, this.offsets.length);
      this.reqDevOffset();
    },

    sortData(json, idKey, childKey) {
      let temp = [];
      let result = [];
      for (let i = 0; i < json.length; i++) {
        temp.push(json[i][idKey]);
      }
      temp = temp.filter(function (element, index, array) {
        return array.indexOf(element) === index;
      });

      for (let k = 0; k < temp.length; k++) {
        let children = json.filter(function (d) {
          return d[idKey] === temp[k];
        });
        result.push({
          [idKey]: temp[k],
          [childKey]: children
        });
      }
      return result;
    },

    reqType() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/reqType",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.relId,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.types = eval(res.data);
        })
    },

    reqPriority() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/reqPriority",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.relId,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.prioritys = eval(res.data);
        })
    },

    reqModule() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/reqModule",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.relId,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.modules = _self.sortData(eval(res.data), "moduleName", "children");
        })
    },

    reqClose() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/reqClose",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.relId,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.closes = eval(res.data);
        })
    },

    reqStatus() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/reqStatus",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.relId,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.statuss = eval(res.data);
        })
    },

    reqChange() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/reqChange",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.relId,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.changes = eval(res.data);
        })
    },

    reqSubmitter() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/reqSubmitter",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.relId,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function (res) {
          _self.submitters = _self.sortData(eval(res.data), "submitter", "children");
        })
    },

    reqDevOffset() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/reqOffset",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.relId,
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
      _self.releases.splice(0, _self.releases.length);
      commonQuery.releaseQuery((result) => {
        if (result.releasesWithBranch.length === 0) {
          _self.$message.info("该产品未建立版本计划！");
          return;
        }
        _self.releases = result.releasesWithBranch;
        _self.relId = result.releasesWithBranch[0].value;
        if (typeof callback === "function") {
          callback();
        }
      })
    }
  }
};
</script>

<style>
.query-condition-req {
  display: block;
  margin: 30px 0 0.5% 0;
}

.query-condition-req .ana-mode {
  display: inline-block;
  margin-right: 20px;
}

.query-condition-req .ana-mode .el-radio-button span {
  font-size: 13px;
}

.req-container {
  width: 49%;
  height: 300px;
  display: inline-block;
  border-radius: 2px;
  margin-top: 1%;
  border: 1px solid #e4edf3;
  background-color: #3b434e;
}

.req-container+.req-container {
  margin-left: 1%;
}

.req-container .no-data {
  font-size: 20px;
  width: 100%;
  display: table;
  text-align: center;
  margin-top: 20%;
  font-weight: 700;
  color: #fff;
}
</style>
