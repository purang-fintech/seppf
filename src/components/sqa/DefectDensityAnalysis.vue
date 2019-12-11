<template>
  <div id="root" class="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-analyze"></i> 度量分析</el-breadcrumb-item>
        <el-breadcrumb-item>缺陷密度</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-form size="small" :inline="true" class="query-condition-com">
      <el-form-item>
        <el-radio-group v-model="anaMode" size="small" @change="setQueryMode()">
          <el-radio-button label="1">按版本趋势</el-radio-button>
          <el-radio-button label="2">按月份趋势</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="版本计划发布日期" v-if="anaMode == '1'" label-width="140px">
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
      </el-form-item>
      <el-form-item label="统计对象创建时间" v-if="anaMode == '2'" label-width="140px">
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
      </el-form-item>
    </el-form>

    <div class="wid-container" v-if="anaMode == '1'">
      <v-req-density :datas="reqDensities" v-if="null != reqDensities && reqDensities.length > 0"></v-req-density>
      <h1 v-if="reqDensities == null || reqDensities == ''" class="no-data">缺陷需求密度趋势<br><br>暂无数据</h1>
    </div>

    <div class="wid-container" v-if="anaMode == '1'">
      <v-cms-density :datas="cmsDensities" v-if="null != cmsDensities && cmsDensities.length > 0"></v-cms-density>
      <h1 v-if="cmsDensities == null || cmsDensities == ''" class="no-data">缺陷开发任务密度趋势<br><br>暂无数据</h1>
    </div>

    <div class="wid-container" v-if="anaMode == '1'">
      <v-tms-density :datas="tmsDensities" v-if="null != tmsDensities && tmsDensities.length > 0"></v-tms-density>
      <h1 v-if="tmsDensities == null || tmsDensities == ''" class="no-data">缺陷测试任务密度趋势<br><br>暂无数据</h1>
    </div>

    <div class="wid-container" v-if="anaMode == '1'">
      <v-man-density :datas="manDensities" v-if="null != manDensities && manDensities.length > 0"></v-man-density>
      <h1 v-if="manDensities == null || manDensities == ''" class="no-data">缺陷人力密度趋势<br><br>暂无数据</h1>
    </div>

    <div class="wid-container" v-if="anaMode == '1'">
      <v-case-density :datas="caseDensities" v-if="null != caseDensities && caseDensities.length > 0"></v-case-density>
      <h1 v-if="caseDensities == null || caseDensities == ''" class="no-data">缺陷测试用例密度趋势<br><br>暂无数据</h1>
    </div>

    <div class="wid-container" v-if="anaMode == '2'">
      <v-req-density-m :datas="reqDensitiesM" v-if="null != reqDensitiesM && reqDensitiesM.length > 0"></v-req-density-m>
      <h1 v-if="reqDensitiesM == null || reqDensitiesM == ''" class="no-data">缺陷需求密度趋势<br><br>暂无数据</h1>
    </div>

    <div class="wid-container" v-if="anaMode == '2'">
      <v-cms-density-m :datas="cmsDensitiesM" v-if="null != cmsDensitiesM && cmsDensitiesM.length > 0"></v-cms-density-m>
      <h1 v-if="cmsDensitiesM == null || cmsDensitiesM == ''" class="no-data">缺陷开发任务密度趋势<br><br>暂无数据</h1>
    </div>

    <div class="wid-container" v-if="anaMode == '2'">
      <v-tms-density-m :datas="tmsDensitiesM" v-if="null != tmsDensitiesM && tmsDensitiesM.length > 0"></v-tms-density-m>
      <h1 v-if="tmsDensitiesM == null || tmsDensitiesM == ''" class="no-data">缺陷测试任务密度趋势<br><br>暂无数据</h1>
    </div>

    <div class="wid-container" v-if="anaMode == '2'">
      <v-man-density-m :datas="manDensitiesM" v-if="null != manDensitiesM && manDensitiesM.length > 0"></v-man-density-m>
      <h1 v-if="manDensitiesM == null || manDensitiesM == ''" class="no-data">缺陷人力密度趋势<br><br>暂无数据</h1>
    </div>
  </div>
</template>

<script>
import { dateFormat, pickOptions } from "@/util/date.js";
import reqDensity from "./density/DefectDensityReq.vue";
import manDensity from "./density/DefectDensityMan.vue";
import caseDensity from "./density/DefectDensityCase.vue";
import cmsDensity from "./density/DefectDensityCms.vue";
import tmsDensity from "./density/DefectDensityTms.vue";
import reqDensityMonth from "./density/DefectDensityReqMonth.vue";
import manDensityMonth from "./density/DefectDensityManMonth.vue";
import cmsDensityMonth from "./density/DefectDensityCmsMonth.vue";
import tmsDensityMonth from "./density/DefectDensityTmsMonth.vue";
let versions = [];
export default {
  data: function() {
    return {
      anaMode: "1",
      anaPeriod: [],
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      reqDensities: [],
      manDensities: [],
      caseDensities: [],
      cmsDensities: [],
      tmsDensities: [],
      reqDensitiesM: [],
      manDensitiesM: [],
      cmsDensitiesM: [],
      tmsDensitiesM: []
    }
  },

  components: {
    vReqDensity: reqDensity,
    vManDensity: manDensity,
    vCaseDensity: caseDensity,
    vCmsDensity: cmsDensity,
    vTmsDensity: tmsDensity,
    vReqDensityM: reqDensityMonth,
    vManDensityM: manDensityMonth,
    vCmsDensityM: cmsDensityMonth,
    vTmsDensityM: tmsDensityMonth
  },

  created() {
    this.setDefaultPeriod();
    this.refreshDataRelease();
  },

  methods: {
    setQueryMode(){
      if (this.anaMode == "1") {
        this.refreshDataRelease();
      } else if(this.anaMode == "2") {
        this.refreshDataMonth();
      }
    },

    refreshDataRelease(){
      this.reqDensities.splice(0, this.reqDensities.length);
      this.defectReqDensity();
      this.cmsDensities.splice(0, this.cmsDensities.length);
      this.defectCmsDensity();
      this.tmsDensities.splice(0, this.tmsDensities.length);
      this.defectTmsDensity();
      this.manDensities.splice(0, this.manDensities.length);
      this.defectManDensity();
      this.caseDensities.splice(0, this.caseDensities.length);
      this.defectCaseDensity();
    },

    refreshDataMonth(){
      this.reqDensitiesM.splice(0, this.reqDensitiesM.length);
      this.defectReqDensityM();
      this.cmsDensitiesM.splice(0, this.cmsDensitiesM.length);
      this.defectCmsDensityM();
      this.tmsDensitiesM.splice(0, this.tmsDensitiesM.length);
      this.defectTmsDensityM();
      this.manDensitiesM.splice(0, this.manDensitiesM.length);
      this.defectManDensityM();
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
      this.setQueryMode();
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

    defectReqDensity(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugReqDensity",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.reqDensities = _self.sortData(eval(res.data), "relCode", "children");
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    defectManDensity(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugManDensity",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.manDensities = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    defectCaseDensity(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugCaseDensity",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.caseDensities = _self.sortData(eval(res.data), "relCode", "children");
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    defectCmsDensity(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugCmsDensity",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.cmsDensities = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    defectTmsDensity(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugTmsDensity",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.tmsDensities = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    defectReqDensityM(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugReqDensityM",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.reqDensitiesM = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    defectManDensityM(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugManDensityM",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.manDensitiesM = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    defectCmsDensityM(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugCmsDensityM",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.cmsDensitiesM = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    defectTmsDensityM(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/bugTmsDensityM",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.anaPeriod[0],
            qTimeEnd: _self.anaPeriod[1]
          }
        })
        .then(function(res) {
          _self.tmsDensitiesM = eval(res.data);
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
  margin: 30px 0 1% 0;
}

.query-condition-com .el-radio-button span {
  font-size: 13px;
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
