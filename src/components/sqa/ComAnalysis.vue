<template>
  <div id="root" class="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-analyze"></i> 度量分析</el-breadcrumb-item>
        <el-breadcrumb-item>综合分析</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="query-condition-com">
      <div class="ana-mode">
        <el-radio-group v-model="anaMode" size="small">
          <el-tooltip content="需求或缺陷的提交日期以及其他数据的创建日期" effect="dark" placement="right">
            <el-radio-button label="1">统计日期范围</el-radio-button>
          </el-tooltip>
        </el-radio-group>
      </div>

      <div class="main-filter">
        <el-date-picker 
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

    <div class="wid-container">
      <r-cost :datas="reqCosts" v-if="null != reqCosts && reqCosts.length > 0"></r-cost>
      <h1 v-if="reqCosts == null || reqCosts == ''" class="no-data">需求消耗天数趋势<br><br>暂无数据</h1>
    </div>

    <div class="wid-container">
      <r-change-t :datas="reqChangesT" v-if="null != reqChangesT && reqChangesT.length > 0"></r-change-t>
      <h1 v-if="reqChangesT == null || reqChangesT == ''" class="no-data">需求变更情况趋势(按次数)<br><br>暂无数据</h1>
    </div>

    <div class="wid-container">
      <r-change-r :datas="reqChangesR" v-if="null != reqChangesR && reqChangesR.length > 0"></r-change-r>
      <h1 v-if="reqChangesR == null || reqChangesR == ''" class="no-data">需求变更情况趋势(按比例)<br><br>暂无数据</h1>
    </div>

    <div class="wid-container">
      <d-cost-m :datas="defectCostm" v-if="null != defectCostm && defectCostm.length > 0"></d-cost-m>
      <h1 v-if="defectCostm == null || defectCostm == ''" class="no-data">缺陷消耗天数趋势(按月份)<br><br>暂无数据</h1>
    </div>

    <div class="wid-container">
      <d-cost-r :datas="defectCostr" v-if="null != defectCostr && defectCostr.length > 0"></d-cost-r>
      <h1 v-if="defectCostr == null || defectCostr == ''" class="no-data">缺陷消耗天数趋势(按版本)<br><br>暂无数据</h1>
    </div>

  </div>
</template>

<script>
import { dateFormat, pickOptions } from "@/util/date.js";
import reqCostTrend from "./com/ReqCostTrend.vue";
import reqChangeTrendT from "./com/ReqChangeTrendTime.vue";
import reqChangeTrendR from "./com/ReqChangeTrendRatio.vue";
import defectCostTrendM from "./com/DefectCostTrendM.vue";
import defectCostTrendR from "./com/DefectCostTrendR.vue";
let versions = [];
export default {
  data: function() {
    return {
      anaMode: "1",
      anaPeriod: [],
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      reqCosts: [],
      defectCostm: [],
      defectCostr: [],
      reqChangesT: [],
      reqChangesR: []
    }
  },

  components: {
    rCost: reqCostTrend,
    rChangeT: reqChangeTrendT,
    rChangeR: reqChangeTrendR,
    dCostM: defectCostTrendM,
    dCostR: defectCostTrendR
  },

  created() {
    this.setDefaultPeriod();
    this.refreshData();
  },

  methods: {
    refreshData(){
      this.reqCosts.splice(0, this.reqCosts.length);
      this.reqCostTrend();
      this.reqChangesT.splice(0, this.reqChangesT.length);
      this.reqChangesR.splice(0, this.reqChangesR.length);
      this.reqChangeTrend();
      this.defectCostm.splice(0, this.defectCostm.length);
      this.defectCostTrendM();
      this.defectCostr.splice(0, this.defectCostr.length);
      this.defectCostTrendR();
    },

    setDefaultPeriod(){
      let date = new Date();
      let oldDay = new Date();
      let qTimeEnd = dateFormat(date, this.datefmt);
      oldDay.setTime(oldDay.getTime() - 3600 * 1000 * 24 * 365);
      let qTimeBegin = dateFormat(oldDay, this.datefmt);
      this.anaPeriod.splice(0, this.anaPeriod.length);
      this.anaPeriod.push(qTimeBegin);
      this.anaPeriod.push(qTimeEnd);
    },

    checkPeriod(){
      let start = this.anaPeriod[0];
      let end = this.anaPeriod[1];
      let period = (Date.parse(end.replace('/-/g','/')) - Date.parse(start.replace('/-/g','/'))) / (3600 * 1000 * 24);
      if (period > 365) {
        this.$message.info("请查询12个月以内的数据！");
        this.setDefaultPeriod();
        return;
      }
      this.refreshData();
    },

    sortData(json, idKey, childKey) {
      let temp = [];
      let result = [];
      for (let i = 0; i < json.length; i++) {
        temp.push(json[i][idKey]);
      }
      temp = temp.filter(function(element, index, array) {
        return array.indexOf(element) === index;
      });

      for (let k = 0; k < temp.length; k++) {
        let children = json.filter(function(d) {
          return d[idKey] === temp[k];
        });
        result.push({
          [idKey]: temp[k],
          [childKey]: children
        });
      }
      return result;
    },

    reqCostTrend(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/reports/reqCostTrend",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.reqCosts = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    reqChangeTrend(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/reports/reqChangeTrend",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.reqChangesT = eval(res.data);
          _self.reqChangesR = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    defectCostTrendM(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/reports/defectCostTrendMonth",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.defectCostm = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    defectCostTrendR(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/reports/defectCostTrendRel",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.defectCostr = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    }
  }
};
</script>

<style>
.query-condition-com {
  display: block;
  margin: 30px 0 1.5% 0;
}

.query-condition-com .ana-mode {
  display: inline-block;
  margin-right: 20px;
}

.query-condition-com .ana-mode .el-radio-button span {
  font-size: 13px;
}

.query-condition-com .main-filter {
  display: inline-block;
  margin-right: 20px;
  vertical-align: middle;
}

.wid-container{
  width: 99.2%;
  height: 300px;
  margin-bottom: 1%;
  display: inline-block;
  border-radius: 2px;
  border: 1px solid #e4edf3;
  background-color: #3b434e;
}

.wid-container .no-data {
  font-size: 20px;
  width: 100%;
  display: table;
  text-align: center;
  margin-top: 10%;
  font-weight: 700;
  color: #fff;
}
</style>
