<template>
  <div>
    <div class="query-condition-bug">
      <div class="ana-mode">
        <el-radio-group v-model="anaMode" size="small" @change="transQueryMode()">
          <el-radio-button label="1">按版本分析</el-radio-button>
          <el-radio-button label="2">按缺陷发现日期分析</el-radio-button>
        </el-radio-group>
      </div>

      <div class="main-filter">
        <el-select
          v-if="anaMode==='1'"
          v-model="releases.selected"
          size="small"
          @change="relReqQuery();refreshData()"
          style="width:180px"
          placeholder="请选择版本号">
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

      <div class="ana-mode">
        <el-radio-group v-model="userFilter" size="small" @change="userFilterChange()">
          <el-radio-button label="1">全部数据</el-radio-button>
          <el-radio-button label="2">按提交人</el-radio-button>
          <el-radio-button label="3">按负责人</el-radio-button>
          <el-radio-button label="4" v-if="anaMode==='1'">按产品需求</el-radio-button>
        </el-radio-group>
      </div>

      <el-select
        v-if="userFilter === '2'"
        v-model="submitter"
        size="small"
        @change="refreshData()"
        :filter-method="filterUsers"
        @visible-change="resetFilterText"
        filterable>
        <el-option-group v-for="group in userOptions" :key="group.label" :label="group.label">
          <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
            <span style="float:left">{{ item.name }}</span>
            <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
          </el-option>
        </el-option-group>
      </el-select>
      <el-select
        v-if="userFilter === '3'"
        v-model="responser"
        size="small"
        @change="refreshData()"
        :filter-method="filterUsers1"
        @visible-change="resetFilterText"
        filterable>
        <el-option-group v-for="group in userOptions1" :key="group.label" :label="group.label">
          <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
            <span style="float:left">{{ item.name }}</span>
            <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
          </el-option>
        </el-option-group>
      </el-select>
      <el-select
        v-if="userFilter === '4'"
        v-model="req.selected"
        size="small"
        placeholder="请选择"
        @change="refreshData()"
        style="width:300px">
        <el-option v-for="opt in req.opts" :label="opt.label" :key="opt.value" :value="opt.value"></el-option>
      </el-select>
    </div>

    <div class="wid-container">
      <v-direction :datas="defects" v-if="null != defects && defects.length > 0"></v-direction>
      <h1 v-if="defects == null || defects == ''" class="no-data">缺陷生长趋势<br><br>暂无数据</h1>
    </div>

    <div>
      <div class="bug-container" v-if="userFilter === '1' || userFilter === '4'">
        <v-founder :datas="submitters" v-if="null != submitters && submitters.length > 0"></v-founder>
        <h1 v-if="submitters == null || submitters == ''" class="no-data">缺陷提交人分布<br><br>暂无数据</h1>
      </div>
      <div class="bug-container" v-if="userFilter === '1' || userFilter === '4'">
        <v-responser :datas="responsers" v-if="null != responsers && responsers.length > 0"></v-responser>
        <h1 v-if="responsers == null || responsers == ''" class="no-data">缺陷负责人分布<br><br>暂无数据</h1>
      </div>
    </div>

    <div>
      <div class="bug-container">
        <v-module :datas="modules" v-if="null != modules && modules.length > 0"></v-module>
        <h1 v-if="modules == null || modules == ''" class="no-data">缺陷所属模块分布<br><br>暂无数据</h1>
      </div>
      <div class="bug-container">
        <v-req :datas="reqs" v-if="null != reqs && reqs.length > 0"></v-req>
        <h1 v-if="reqs == null || reqs == ''" class="no-data">缺陷所属需求分布<br><br>暂无数据</h1>
      </div>
    </div>

    <div>
      <div class="bug-container">
        <v-priority :datas="priorities" v-if="null != priorities && priorities.length > 0"></v-priority>
        <h1 v-if="priorities == null || priorities == ''" class="no-data">缺陷优先级分布<br><br>暂无数据</h1>
      </div>
      <div class="bug-container">
        <v-influence :datas="influences" v-if="null != influences && influences.length > 0"></v-influence>
        <h1 v-if="influences == null || influences == ''" class="no-data">缺陷严重程度分布<br><br>暂无数据</h1>
      </div>
    </div>

    <div>
      <div class="bug-container">
        <v-found-period :datas="foundPeriods" v-if="null != foundPeriods && foundPeriods.length > 0"></v-found-period>
        <h1 v-if="foundPeriods == null || foundPeriods == ''" class="no-data">缺陷发现阶段分布<br><br>暂无数据</h1>
      </div>
      <div class="bug-container">
        <v-period :datas="periods" v-if="null != periods && periods.length > 0"></v-period>
        <h1 v-if="periods == null || periods == ''" class="no-data">缺陷植入阶段分布<br><br>暂无数据</h1>
      </div>
    </div>

    <div>
      <div class="bug-container">
        <v-fix-cost :datas="fixCosts" v-if="null != fixCosts && fixCosts.length > 0"></v-fix-cost>
        <h1 v-if="fixCosts == null || fixCosts == ''" class="no-data">缺陷修复时效分析（已关闭）<br><br>暂无数据</h1>
      </div>
      <div class="bug-container">
        <v-fix-times :datas="fixTimes" v-if="null != fixTimes && fixTimes.length > 0"></v-fix-times>
        <h1 v-if="fixTimes == null || fixTimes == ''" class="no-data">缺陷修复次数分析（已关闭）<br><br>暂无数据</h1>
      </div>
    </div>

    <div>
      <div class="bug-container">
        <v-verify-cost :datas="verifyCosts" v-if="null != verifyCosts && verifyCosts.length > 0"></v-verify-cost>
        <h1 v-if="verifyCosts == null || verifyCosts == ''" class="no-data">缺陷验证时效分析（已关闭）<br><br>暂无数据</h1>
      </div>
      <div class="bug-container">
        <v-type :datas="types" v-if="null != types && types.length > 0"></v-type>
        <h1 v-if="types == null || types == ''" class="no-data">缺陷类型分布<br><br>暂无数据</h1>
      </div>
    </div>
  </div>
</template>

<script>
import {
  dateFormat,
  pickOptions
} from "@/util/date.js";
import defectDirection from "./bug/DefectDirection.vue";
import defectFounder from "./bug/DefectFounder.vue";
import defectResponser from "./bug/DefectResponser.vue";
import defectModule from "./bug/DefectModule.vue";
import defectReqirements from "./bug/DefectReqirements.vue";
import defectPriority from "./bug/DefectPriority.vue";
import defectInfluence from "./bug/DefectInfluence.vue";
import defectType from "./bug/DefectType.vue";
import defectFixTimes from "./bug/DefectFixTimes.vue";
import defectFixCost from "./bug/DefectFixCost.vue";
import defectVerifyCost from "./bug/DefectVerifyCost.vue";
import defectFoundPeriod from "./bug/DefectFoundPeriod.vue";
import defectProducePeriod from "./bug/DefectProducePeriod.vue";
import commonQuery from "@/components/util/CommonQuery.vue";
let versions = [];
export default {
  data: function () {
    return {
      activeName: "defect",
      anaMode: "1",
      userFilter: "1",
      releases: {
        selected: "",
        opts: []
      },
      req: {
        selected: [],
        opts: []
      },
      anaPeriod: [],
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      defects: [],
      memberFull: [],
      userOptions: [],
      userOptions1: [],
      submitter: "",
      responser: "",
      submitters: [],
      responsers: [],
      modules: [],
      reqs: [],
      priorities: [],
      influences: [],
      types: [],
      foundPeriods: [],
      periods: [],
      fixTimes: [],
      fixCosts: [],
      verifyCosts: []
    }
  },

  components: {
    vDirection: defectDirection,
    vFounder: defectFounder,
    vResponser: defectResponser,
    vReq: defectReqirements,
    vModule: defectModule,
    vPriority: defectPriority,
    vInfluence: defectInfluence,
    vType: defectType,
    vFixTimes: defectFixTimes,
    vFixCost: defectFixCost,
    vVerifyCost: defectVerifyCost,
    vFoundPeriod: defectFoundPeriod,
    vPeriod: defectProducePeriod
  },

  created() {
    this.setDefaultPeriod();
    this.memberQuery();
    this.releaseQuery(this.refreshData);
  },

  methods: {
    resetFilterText() {
      let _self = this;
      _self.userOptions = _self.memberFull;
      _self.userOptions1 = _self.memberFull;
    },

    filterUsers(val) {
      let _self = this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers1(val) {
      let _self = this;
      _self.userOptions1 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    refreshData() {
      this.defects.splice(0, this.defects.length);
      this.defectDirection();
      if (this.userFilter === '1' || this.userFilter === '4') {
        this.submitters.splice(0, this.submitters.length);
        this.defectFounder();
        this.responsers.splice(0, this.responsers.length);
        this.defectResponser();
      }
      this.modules.splice(0, this.modules.length);
      this.defectModule();
      this.reqs.splice(0, this.reqs.length);
      this.defectReqirements();
      this.priorities.splice(0, this.priorities.length);
      this.defectPriority();
      this.influences.splice(0, this.influences.length);
      this.defectInfluence();
      this.types.splice(0, this.types.length);
      this.defectType();
      this.foundPeriods.splice(0, this.foundPeriods.length);
      this.defectFoundPeriod();
      this.periods.splice(0, this.periods.length);
      this.defectProducePeriod();
      this.fixTimes.splice(0, this.fixTimes.length);
      this.defectFixTimes();
      this.fixCosts.splice(0, this.fixCosts.length);
      this.defectFixCost();
      this.verifyCosts.splice(0, this.verifyCosts.length);
      this.defectVerifyCost();
    },

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
      this.userFilter = "1";
      this.submitter = "";
      this.responser = "";
      if (this.anaMode === '1') {
        this.releaseQuery(this.refreshData);
      } else {
        this.releases.selected = "";
        this.setDefaultPeriod();
        this.refreshData();
      }
    },

    relReqQuery() {
      let _self = this;
      _self.req.selected = "";
      _self.$axios.post("/req/rel_query/" + _self.releases.selected + "/1/500")
        .then(function (res) {
          let json = eval(res.data.list);
          if (json.length == 0) {
            _self.$message.warning("该版本尚未纳入开发任务！");
            return;
          }
          _self.req.opts.splice(0, _self.req.opts.length);
          for (let i = 0; i < json.length; i++) {
            _self.req.opts.push({
              value: json[i].id,
              label: json[i].id + " - " + json[i].summary
            });
          }
        })
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

    userFilterChange() {
      if (this.userFilter == "1") {
        this.submitter = "";
        this.responser = "";
        this.refreshData();
      } else if (this.userFilter == "2") {
        this.responser = "";
        this.req.selected = "";
      } else if (this.userFilter == "3") {
        this.submitter = "";
        this.req.selected = "";
      } else if (this.userFilter == "4") {
        this.submitter = "";
        this.responser = "";
        this.req.selected = "";
        this.relReqQuery();
      }
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

    defectDirection() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugDirection",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.defects = eval(res.data);
        })
    },

    defectFounder() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugFounder",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.submitters = _self.sortData(eval(res.data), "founder", "children");
        })
    },

    defectResponser() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugResponser",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.responsers = _self.sortData(eval(res.data), "responser", "children");
        })
    },

    defectModule() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugModule",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.modules = _self.sortData(eval(res.data), "moduleName", "children");
        })
    },

    defectReqirements() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugReq",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.reqs = _self.sortData(eval(res.data), "reqSummary", "children");
        })
    },

    defectPriority() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugPriority",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.priorities = eval(res.data);
        })
    },

    defectInfluence() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugInfluence",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.influences = eval(res.data);
        })
    },

    defectType() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugType",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.types = eval(res.data);
        })
    },

    defectFoundPeriod() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugFoundPeriod",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.foundPeriods = eval(res.data);
        })
    },

    defectProducePeriod() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugPeriod",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.periods = eval(res.data);
        })
    },

    defectFixTimes() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugFixtImes",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.fixTimes = eval(res.data);
        })
    },

    defectFixCost() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugFixCost",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.fixCosts = eval(res.data);
        })
    },

    defectVerifyCost() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugVerifyCost",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.releases.selected,
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1],
            submitter: _self.submitter,
            responser: _self.responser,
            reqId: _self.req.selected
          }
        })
        .then(function (res) {
          _self.verifyCosts = eval(res.data);
        })
    },

    memberQuery() {
      let _self = this;
      commonQuery.memberQuery((result) => {
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        _self.userOptions1 = result.usersFull;
      });
    },

    releaseQuery(callback) {
      let _self = this;
      _self.req.selected = "";
      _self.submitter = "";
      _self.responser = "";
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
    }
  }
}
</script>

<style>
.query-condition-bug {
  display: block;
  margin: 0 0 1.5% 0;
}

.query-condition-bug .ana-mode {
  display: inline-block;
  margin-right: 20px;
}

.query-condition-bug .ana-mode .el-radio-button span {
  font-size: 13px;
}

.query-condition-bug .main-filter {
  display: inline-block;
  margin-right: 20px;
}

.query-condition-bug .el-select {
  vertical-align: middle;
}

.wid-container {
  width: 99.2%;
  height: 300px;
  display: inline-block;
  border-radius: 2px;
  border: 1px solid #e4edf3;
  background-color: #3b434e;
}

.bug-container {
  width: 49%;
  height: 300px;
  display: inline-block;
  border-radius: 2px;
  margin-top: 1%;
  border: 1px solid #e4edf3;
  background-color: #3b434e;
}

.bug-container+.bug-container {
  margin-left: 1%;
}

.wid-container .no-data,
.bug-container .no-data {
  font-size: 20px;
  width: 100%;
  display: table;
  text-align: center;
  margin-top: 15%;
  font-weight: 700;
  color: #fff;
}
</style>
