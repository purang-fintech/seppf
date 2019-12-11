<template>
  <div>
    <div class="query-condition-pro"> 
      <el-form :inline="true" size="small">
        <el-form-item>
          <el-radio-group v-model="proAnaMode" size="small">
            <el-radio-button label="1">上报时间</el-radio-button>
            <el-radio-button label="2">解决时间</el-radio-button>
            <el-radio-button label="3">关闭时间</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-date-picker 
            v-model="proAnaPeriod" 
            type="daterange" 
            size="small"
            align="right" 
            unlink-panels 
            :value-format="datefmt" 
            range-separator="至" 
            start-placeholder="开始日期" 
            end-placeholder="结束日期"
            @change="checkProPeriod()"
            :clearable="false"
            :picker-options="pickOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="产品模块">
          <el-select v-model="proModule" size="small" @change="refreshProData()" style="width:140px" clearable>
            <el-option v-for="opt in appModules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="proResponser" size="small" @change="refreshProData()" style="width:200px" filterable clearable :filter-method="filterUsers" @visible-change="resetFilterText">
            <el-option-group
              v-for="group in userOptions"
              :key="group.label"
              :label="group.label">
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.name"
                :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div>
      <div class="bug-container">
        <v-pro-submitter :datas="proSubmitters" v-if="null != proSubmitters && proSubmitters.length > 0"></v-pro-submitter>
        <h1 v-if="proSubmitters == null || proSubmitters == ''" class="no-data">线上问题提交人分布<br><br>暂无数据</h1>
      </div>
      <div class="bug-container">
        <v-pro-responser :datas="proResponsers" v-if="null != proResponsers && proResponsers.length > 0"></v-pro-responser>
        <h1 v-if="proResponsers == null || proResponsers == ''" class="no-data">线上问题负责人分布<br><br>暂无数据</h1>
      </div>
    </div>

    <div>
      <div class="bug-container">
        <v-pro-module :datas="proModules" v-if="null != proModules && proModules.length > 0"></v-pro-module>
        <h1 v-if="proModules == null || proModules == ''" class="no-data">线上问题所属模块分布<br><br>暂无数据</h1>
      </div>
      <div class="bug-container">
        <v-pro-status :datas="proStatuss" v-if="null != proStatuss && proStatuss.length > 0"></v-pro-status>
        <h1 v-if="proStatuss == null || proStatuss == ''" class="no-data">线上问题状态分布<br><br>暂无数据</h1>
      </div>
    </div>

    <div>
      <div class="bug-container">
        <v-pro-priority :datas="proPriorities" v-if="null != proPriorities && proPriorities.length > 0"></v-pro-priority>
        <h1 v-if="proPriorities == null || proPriorities == ''" class="no-data">线上问题优先级分布<br><br>暂无数据</h1>
      </div>
      <div class="bug-container">
        <v-pro-influence :datas="proInfluences" v-if="null != proInfluences && proInfluences.length > 0"></v-pro-influence>
        <h1 v-if="proInfluences == null || proInfluences == ''" class="no-data">线上问题严重程度分布<br><br>暂无数据</h1>
      </div>
    </div> 

    <div>
      <div class="bug-container">
        <v-pro-resolve-cost :datas="proResolveCost" v-if="null != proResolveCost && proResolveCost.length > 0"></v-pro-resolve-cost>
        <h1 v-if="proResolveCost == null || proResolveCost == ''" class="no-data">线上问题解决时效分析<br><br>暂无数据</h1>
      </div>
      <div class="bug-container">
        <v-pro-close-cost :datas="proCloseCost" v-if="null != proCloseCost && proCloseCost.length > 0"></v-pro-close-cost>
        <h1 v-if="proCloseCost == null || proCloseCost == ''" class="no-data">线上问题关闭时效分析<br><br>暂无数据</h1>
      </div>
    </div> 

    <div>
      <div class="bug-container">
        <v-pro-type-one :datas="proTypeOne" v-if="null != proTypeOne && proTypeOne.length > 0"></v-pro-type-one>
        <h1 v-if="proTypeOne == null || proTypeOne == ''" class="no-data">线上问题一级分类分布<br><br>暂无数据</h1>
      </div>
      <div class="bug-container">
        <v-pro-type-two :datas="proTypeTwo" v-if="null != proTypeTwo && proTypeTwo.length > 0"></v-pro-type-two>
        <h1 v-if="proTypeTwo == null || proTypeTwo == ''" class="no-data">线上问题二级分类分布<br><br>暂无数据</h1>
      </div>
    </div> 

    <div>
      <div class="bug-container">
        <v-pro-improve-one :datas="proImproveOne" v-if="null != proImproveOne && proImproveOne.length > 0"></v-pro-improve-one>
        <h1 v-if="proImproveOne == null || proImproveOne == ''" class="no-data">线上问题改进措施一级分类<br><br>暂无数据</h1>
      </div>
      <div class="bug-container">
        <v-pro-improve-two :datas="proImproveTwo" v-if="null != proImproveTwo && proImproveTwo.length > 0"></v-pro-improve-two>
        <h1 v-if="proImproveTwo == null || proImproveTwo == ''" class="no-data">线上问题改进措施二级分类<br><br>暂无数据</h1>
      </div>
    </div> 
  </div>
</template>

<script>
import { dateFormat, pickOptions } from "@/util/date.js";
import problemSubmitter from "./pro/ProblemSubmitter.vue";
import problemResponser from "./pro/ProblemResponser.vue";
import problemPriority from "./pro/ProblemPriority.vue";
import problemInfluence from "./pro/ProblemInfluence.vue";
import problemStatus from "./pro/ProblemStatus.vue";
import problemModule from "./pro/ProblemModule.vue";
import problemTypeOne from "./pro/ProblemTypeOne.vue";
import problemTypeTwo from "./pro/ProblemTypeTwo.vue";
import problemImproveOne from "./pro/ProblemImproveOne.vue";
import problemImproveTwo from "./pro/ProblemImproveTwo.vue";
import problemResolveCost from "./pro/ProblemResolveCost.vue";
import problemCloseCost from "./pro/ProblemCloseCost.vue";
import commonQuery from "@/components/util/CommonQuery.vue";
export default {
  data: function() {
    return {
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      memberFull: [],
      userOptions: [],
      proAnaMode: "1",
      proAnaPeriod: [],
      proModule: "",
      appModules: [],
      proResponser: "",
      proSubmitters: [],
      proResponsers: [],
      proModules: [],
      proStatuss: [],
      proPriorities:[],
      proInfluences:[],
      proTypeOne:[],
      proTypeTwo:[],
      proImproveOne:[],
      proImproveTwo:[],
      proResolveCost:[],
      proCloseCost:[]
    }
  },

  components: {
    vProSubmitter: problemSubmitter,
    vProResponser: problemResponser,
    vProModule: problemModule,
    vProStatus: problemStatus,
    vProPriority: problemPriority,
    vProInfluence: problemInfluence,
    vProTypeOne: problemTypeOne,
    vProTypeTwo: problemTypeTwo,
    vProImproveOne: problemImproveOne,
    vProImproveTwo: problemImproveTwo,
    vProResolveCost: problemResolveCost,
    vProCloseCost: problemCloseCost
  },

  created() {
    this.setDefaultPeriod();
    this.memberQuery();
    this.moduleQuery();
    this.refreshProData();
  },

  methods: {
    resetFilterText(){
      let _self =  this;
      _self.userOptions = _self.memberFull;
    },

    filterUsers(val) {
      let _self =  this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },
    
    setDefaultPeriod(){
      let date = new Date();
      let oldDay = new Date();
      let qTimeEnd = dateFormat(date, this.datefmt);
      oldDay.setTime(oldDay.getTime() - 3600 * 1000 * 24 * 90);
      let qTimeBegin = dateFormat(oldDay, this.datefmt);
      this.proAnaPeriod.splice(0, this.proAnaPeriod.length);
      this.proAnaPeriod.push(qTimeBegin);
      this.proAnaPeriod.push(qTimeEnd);
    },

    refreshProData(){
      let _self =  this;
      _self.proSubmitters.splice(0, _self.proSubmitters.length);
      _self.problemSubmitter();
      _self.proResponsers.splice(0, _self.proResponsers.length);
      _self.problemResponser();
      _self.proModules.splice(0, _self.proModules.length);
      _self.problemModule();
      _self.proStatuss.splice(0, _self.proStatuss.length);
      _self.problemStatus();
      _self.proPriorities.splice(0, _self.proPriorities.length);
      _self.problemPriority();
      _self.proInfluences.splice(0, _self.proInfluences.length);
      _self.problemInfluence();
      _self.proTypeOne.splice(0, _self.proTypeOne.length);
      _self.problemTypeOne();
      _self.proTypeTwo.splice(0, _self.proTypeTwo.length);
      _self.problemTypeTwo();
      _self.proImproveOne.splice(0, _self.proImproveOne.length);
      _self.problemImproveOne();
      _self.proImproveTwo.splice(0, _self.proImproveTwo.length);
      _self.problemImproveTwo();
      _self.proResolveCost.splice(0, _self.proResolveCost.length);
      _self.problemResolveCost();
      _self.proCloseCost.splice(0, _self.proCloseCost.length);
      _self.problemCloseCost();
    },

    checkProPeriod(){
      let start = this.proAnaPeriod[0];
      let end = this.proAnaPeriod[1];
      let period = (Date.parse(end.replace('/-/g','/')) - Date.parse(start.replace('/-/g','/'))) / (3600 * 1000 * 24);
      if (period > 183) {
        this.$message.info("请查询六个月以内的数据！");
        this.setDefaultPeriod();
        return;
      }
      this.refreshProData();
    },

    problemSubmitter(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proSubmitter",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proSubmitters = _self.sortData(eval(res.data), "submitter", "children");
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    problemResponser(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proResponser",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proResponsers = _self.sortData(eval(res.data), "responser", "children");
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    problemModule(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proModule",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proModules = _self.sortData(eval(res.data), "moduleName", "children");
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    problemStatus(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proStatus",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proStatuss = _self.sortData(eval(res.data), "status", "children");
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    problemPriority(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proPriority",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proPriorities = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    problemInfluence(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proInfluence",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proInfluences = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    problemTypeOne(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proTypeOne",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proTypeOne = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    problemTypeTwo(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proTypeTwo",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proTypeTwo = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    problemImproveOne(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proImproveOne",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proImproveOne = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    problemImproveTwo(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proImproveTwo",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proImproveTwo = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    problemResolveCost(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proResolveCost",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proResolveCost = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    problemCloseCost(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/sqa/proCloseCost",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            timeType: _self.proAnaMode,
            qTimeBegin: _self.proAnaPeriod[0],
            qTimeEnd: _self.proAnaPeriod[1],
            moduleId: _self.proModule,
            responser: _self.proResponser
          }
        })
        .then(function(res) {
          _self.proCloseCost = eval(res.data);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
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

    memberQuery(){
      let _self =  this;
      commonQuery.memberQuery((result) => {
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
      });
    },

    moduleQuery() {
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/module/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          }
        })
        .then(function(res) {
          var json = eval(res.data.list);
          for (var i = 0; i < json.length; i++) {
            _self.appModules.push({
              label: json[i].moduleName,
              value: json[i].moduleId
            });
          }
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
.query-condition-pro {
  display: block;
  margin: 0;
}

.query-condition-pro .el-form-item__label {
  margin-left: 10px;
}

.query-condition-pro .el-radio-button span {
  font-size: 13px;
}

.query-condition-pro .el-select {
  vertical-align: middle;
}

.bug-container{
  width: 49%;
  height: 300px;
  display: inline-block;
  border-radius: 2px;
  margin-top: 1%;
  border: 1px solid #e4edf3;
  background-color: #3b434e;
}

.bug-container+.bug-container{
  margin-left: 1%;
}

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
