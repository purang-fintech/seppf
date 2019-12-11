<template>
  <div class="root">

    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="el-icon-search"></i> 综合查询</el-breadcrumb-item>
        <el-breadcrumb-item>月度报表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-form :inline="true" size="mini" label-width="100px">
      <el-form-item label="查询月份">
        <el-date-picker v-model="month" type="month" placeholder="请选择统计月份" @change="setQueryPeriod()" :default-value="new Date()">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button v-no-more-click size="mini" type="primary" @click="refreshData()" style="margin-left:10px"> 查询</el-button>
      </el-form-item>
    </el-form>

    <div class="reports-module" :style="{height: formHeight + 'px'}">
      <div class="reports-title">
        <span>月度需求计量数据</span>
        <el-button v-no-more-click size="mini" type="primary" @click="monthReqCount.showCharts=true" v-if="!monthReqCount.showCharts">图形视图</el-button>
        <el-button v-no-more-click size="mini" type="primary" @click="monthReqCount.showCharts=false" v-if="monthReqCount.showCharts">数据视图</el-button>
      </div>
      <v-req-count :datas="monthReqCount.chartsData" :height="tableHeight" v-if="monthReqCount.showCharts && hasData(monthReqCount.chartsData)"></v-req-count>
      <h1 v-if="monthReqCount.showCharts && !hasData(monthReqCount.chartsData)" class="no-data">月度需求计量数据图表生成失败</h1>

      <el-table :data="monthReqCount.data" :max-height="tableHeight" size="mini" stripe :border="showBorder" v-if="!monthReqCount.showCharts" show-summary>
        <el-table-column prop="productName" label="产品名称" min-width="50%" align="center">
        </el-table-column>
        <el-table-column prop="reqStatus" label="需求状态" min-width="25%" align="center">
        </el-table-column>
        <el-table-column prop="reqCount" label="需求数" min-width="25%" align="center">
        </el-table-column>
      </el-table>
    </div>

    <div class="reports-module" :style="{height: formHeight + 'px'}">
      <div class="reports-title">
        <span>月度需求生命周期数据</span>
        <el-button v-no-more-click size="mini" type="primary" @click="monthReqCost.showCharts=true" v-if="!monthReqCost.showCharts">图形视图</el-button>
        <el-button v-no-more-click size="mini" type="primary" @click="monthReqCost.showCharts=false" v-if="monthReqCost.showCharts">数据视图</el-button>
      </div>
      <v-req-cost :datas="monthReqCost.chartsData" :height="tableHeight" v-if="monthReqCost.showCharts && hasData(monthReqCost.chartsData)"></v-req-cost>
      <h1 v-if="monthReqCost.showCharts && !hasData(monthReqCost.chartsData)" class="no-data">月度需求时效数据图表生成失败</h1>

      <el-table 
        :data="monthReqCost.data"
        :max-height="tableHeight" 
        size="mini" 
        stripe 
        :border="showBorder" 
        v-if="!monthReqCost.showCharts" 
        show-summary
        :summary-method="getSummariesReq">
        <el-table-column prop="productName" label="产品名称" min-width="30%" align="center">
        </el-table-column>
        <el-table-column prop="reqCount" label="总需求数" min-width="20%" align="center">
        </el-table-column>
        <el-table-column prop="reqCostSum" label="合计消耗天数" min-width="25%" align="center">
        </el-table-column>
        <el-table-column prop="avgCost" label="平均消耗天数" min-width="25%" align="center">
        </el-table-column>
      </el-table>
    </div>

    <div class="reports-module" :style="{height: formHeight + 'px'}">
      <div class="reports-title">
        <span>月度缺陷计量数据</span>
        <el-button v-no-more-click size="mini" type="primary" @click="monthDefectCount.showCharts=true" v-if="!monthDefectCount.showCharts">图形视图</el-button>
        <el-button v-no-more-click size="mini" type="primary" @click="monthDefectCount.showCharts=false" v-if="monthDefectCount.showCharts">数据视图</el-button>
      </div>
      <v-d-count :datas="monthDefectCount.chartsData" :height="tableHeight" v-if="monthDefectCount.showCharts && hasData(monthDefectCount.chartsData)"></v-d-count>
      <h1 v-if="monthDefectCount.showCharts && !hasData(monthDefectCount.chartsData)" class="no-data">月度缺陷计量数据图表生成失败</h1>

      <el-table :data="monthDefectCount.data" :max-height="tableHeight" size="mini" stripe :border="showBorder" v-if="!monthDefectCount.showCharts" show-summary>
        <el-table-column prop="productName" label="产品名称" min-width="50%" align="center">
        </el-table-column>
        <el-table-column prop="defectStatus" label="缺陷状态" min-width="25%" align="center">
        </el-table-column>
        <el-table-column prop="defectCount" label="缺陷数" min-width="25%" align="center">
        </el-table-column>
      </el-table>
    </div>

    <div class="reports-module" :style="{height: formHeight + 'px'}">
      <div class="reports-title">
        <span>月度缺陷生命周期数据</span>
        <el-button v-no-more-click size="mini" type="primary" @click="monthDefectCost.showCharts=true" v-if="!monthDefectCost.showCharts">图形视图</el-button>
        <el-button v-no-more-click size="mini" type="primary" @click="monthDefectCost.showCharts=false" v-if="monthDefectCost.showCharts">数据视图</el-button>
      </div>
      <v-d-cost :datas="monthDefectCost.chartsData" :height="tableHeight" v-if="monthDefectCost.showCharts && hasData(monthDefectCost.chartsData)"></v-d-cost>
      <h1 v-if="monthDefectCost.showCharts && !hasData(monthDefectCost.chartsData)" class="no-data">月度缺陷时效数据图表生成失败</h1>

      <el-table 
        :data="monthDefectCost.data" 
        :max-height="tableHeight" 
        size="mini" 
        stripe 
        :border="showBorder" 
        v-if="!monthDefectCost.showCharts" 
        show-summary
        :summary-method="getSummariesDefect">
        <el-table-column prop="productName" label="产品名称" min-width="30%" align="center">
        </el-table-column>
        <el-table-column prop="defectCount" label="总缺陷数" min-width="20%" align="center">
        </el-table-column>
        <el-table-column prop="defectCostSum" label="合计消耗天数" min-width="25%" align="center">
        </el-table-column>
        <el-table-column prop="avgCost" label="平均消耗天数" min-width="25%" align="center">
        </el-table-column>
      </el-table>
    </div>  
  </div>
</template>

<script>
import defectCount from "./monthly/DefectCount.vue";
import defectCost from "./monthly/DefectCost.vue";
import reqCount from "./monthly/ReqCount.vue";
import reqCost from "./monthly/ReqCost.vue";
import { dateFormat } from "@/util/date.js";
export default {
  data: function() {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      tableData: [],
      queryLoading: false,
      datafmt: defaultDateFormat,
      formHeight: (bodyAviHeightNTab - 10) / 2,
      tableHeight: "",
      month: "",
      queryPeriod: [],
      monthReqCount: {
        data: [],
        showCharts: false,
        chartsData: []
      },
      monthReqCost: {
        data: [],
        showCharts: false,
        chartsData: []
      },
      monthDefectCount: {
        data: [],
        showCharts: false,
        chartsData: []
      },
      monthDefectCost: {
        data: [],
        showCharts: false,
        chartsData: []
      }
    }
  },

  components: {
    vDCount: defectCount,
    vDCost: defectCost,
    vReqCount: reqCount,
    vReqCost: reqCost
  },

  created() {
    let _self =  this;
    let current = new Date();
    let lastMonth = new Date(current.getFullYear() + "-" + current.getMonth());
    _self.month = dateFormat(lastMonth, "yyyy-MM");
    _self.setQueryPeriod();
    _self.refreshData();
    _self.tableHeight = _self.formHeight - 30;
  },

  methods: {
    refreshData(){
      let _self =  this;
      _self.monthDefectCount.data.splice(0, _self.monthDefectCount.data.length);
      _self.monthDefectCost.data.splice(0, _self.monthDefectCost.data.length);
      _self.monthReqCount.data.splice(0, _self.monthReqCount.data.length);
      _self.monthReqCost.data.splice(0, _self.monthReqCost.data.length);
      _self.monthDefectCountQuery();
      _self.monthReqCountQuery();
      _self.monthDefectCostQuery();
      _self.monthReqCostQuery();
    },

    hasData(data) {
      return (
        data != null &&
        (data.length > 1 || (data.length === 1 && data[0].num != 0))
      );
    },

    setQueryPeriod(){
      let _self =  this;
      _self.queryPeriod.splice(0, _self.queryPeriod.length);
      let start = new Date(_self.month);
      let end = new Date(start.getFullYear() + "-" + (start.getMonth() + 2));
      _self.queryPeriod.push(dateFormat(start, _self.datafmt));
      _self.queryPeriod.push(dateFormat(end, _self.datafmt));
    },

    groupBy(array, func) {
      let groups = {};
      array.forEach(function(o) {
        let group = JSON.stringify(func(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
      });
      return Object.keys(groups).map(function(group) {
        return groups[group];
      });
    },

    chartsDataSort(array, sortKey) {
      let firstSorted = this.groupBy(array, item => {
        return [item[sortKey]];
      });
      let secondSorted = [];
      for (let i = 0; i < firstSorted.length; i++) {
        secondSorted.push({
          [sortKey]: firstSorted[i][0][sortKey],
          children: firstSorted[i]
        });
      }
      return secondSorted;
    },

    getSummariesReq({columns, data}){
      let sums = [];
      let counter = 0;
      let sumer = 0;
      data.forEach(item => {
        counter += item.reqCount;
        sumer += item.reqCostSum;
      });
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计';
          return;
        } else if (index === 1) {
          sums[index] = counter;
          return;
        } else if (index === 2) {
          sums[index] = sumer;
          return;
        } else if (index === 3) {
          sums[index] = (sumer / counter).toFixed(2);
          return;
        }
      });
      return sums;
    },

    getSummariesDefect({columns, data}){
      let sums = [];
      let counter = 0;
      let sumer = 0;
      data.forEach(item => {
        counter += item.defectCount;
        sumer += item.defectCostSum;
      });
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计';
          return;
        } else if (index === 1) {
          sums[index] = counter;
          return;
        } else if (index === 2) {
          sums[index] = sumer.toFixed(2);
          return;
        } else if (index === 3) {
          sums[index] = (sumer / counter).toFixed(2);
          return;
        }
      });
      return sums;
    },

    monthDefectCountQuery() {
      let _self =  this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/reports/monthDefectCount",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.queryPeriod[0],
            qTimeEnd: _self.queryPeriod[1]
          }
        })
        .then(function(res) {
          _self.monthDefectCount.data = eval(res.data);
          _self.monthDefectCount.chartsData = _self.chartsDataSort(_self.monthDefectCount.data, "productName");
        })
        .catch(function(response) {
          _self.$notify.error("线上问题信息查询时发生程序错误！");
          console.log(response);
          _self.queryLoading = false;
        });
    },

    monthReqCountQuery() {
      let _self =  this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/reports/monthReqCount",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.queryPeriod[0],
            qTimeEnd: _self.queryPeriod[1]
          }
        })
        .then(function(res) {
          _self.monthReqCount.data = eval(res.data);
          _self.monthReqCount.chartsData = _self.chartsDataSort(_self.monthReqCount.data, "productName");
        })
        .catch(function(response) {
          _self.$notify.error("线上问题信息查询时发生程序错误！");
          console.log(response);
          _self.queryLoading = false;
        });
    },

    monthDefectCostQuery() {
      let _self =  this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/reports/monthDefectCost",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.queryPeriod[0],
            qTimeEnd: _self.queryPeriod[1]
          }
        })
        .then(function(res) {
          _self.monthDefectCost.data = eval(res.data);
          _self.monthDefectCost.data.forEach(item => {
            _self.$set(item, "avgCost", (item.defectCostSum / item.defectCount).toFixed(2))
          });
          _self.monthDefectCost.chartsData = _self.monthDefectCost.data;
        })
        .catch(function(response) {
          _self.$notify.error("线上问题信息查询时发生程序错误！");
          console.log(response);
          _self.queryLoading = false;
        });
    },

    monthReqCostQuery() {
      let _self =  this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/reports/monthReqCost",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            qTimeBegin: _self.queryPeriod[0],
            qTimeEnd: _self.queryPeriod[1]
          }
        })
        .then(function(res) {
          _self.monthReqCost.data = eval(res.data);
          _self.monthReqCost.data.forEach(item => {
            _self.$set(item, "avgCost", (item.reqCostSum / item.reqCount).toFixed(2))
          });
          _self.monthReqCost.chartsData = _self.monthReqCost.data;
        })
        .catch(function(response) {
          _self.$notify.error("线上问题信息查询时发生程序错误！");
          console.log(response);
          _self.queryLoading = false;
        });
    }
  }
};
</script>

<style>
.reports-module {
  width: 49.5%;
  display: inline-block;
  vertical-align: top;
  margin-top: 5px;
}

.reports-title {
  width: 100%;
  height: 30px;
  line-height: 30px;
  background-color: #485f7d;
  color: #fff;
  border-radius: 2px 3px 0 0;
  display: block;
}

.reports-title>span{
  margin-left: 8px;
  font-size: 18px;
  font-weight: 600;
}

.reports-title + div{
  background-color: #485f7d;
}

.reports-module .el-button {
  float: right;
  height: 30px;
  border-radius: 0 3px 0 0;
}

.reports-module .no-data {
  font-size: 20px;
  text-align: center;
  margin-top: 30%;
  font-weight: 700;
  color: #fff;
}
</style>
