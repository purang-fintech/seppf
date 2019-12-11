<template>
  <div id="cmsSpliter" style="width:100%; height:300px"></div>
</template>
<script>
let echarts = require("echarts/lib/echarts");
require("echarts/lib/chart/bar");
require("echarts/lib/component/tooltip");
require("echarts/lib/component/toolbox");
require("echarts/lib/component/title");
import sepp from "@/assets/theme/charts/sepp";
export default {
  data: function() {
    return {
      chartsOptions: ""
    };
  },

  props: ["datas"],

  created() {
    let _self =  this;
    let usersData = [];
    let spliterData = [];
    _self.datas.forEach(item => {
      usersData.push(item.spliter); 
      spliterData.push({
        value: item.num
      });
    });

    _self.chartsOptions = {
      title: {
        text: "开发任务拆分人",
        top: "5px",
        left: "10px"
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" }
      },
      grid: {
        top: 60,
        left: 40,
        right: 40,
        bottom: 40,
        show: true
      },
      toolbox: {
        right: 0,
        top: 0,
        show: true,
        feature: {
          dataView: { show: true, readOnly: false },
          restore: { show: true },
          saveAsImage: { show: true }
        },
        padding: 10
      },
      xAxis: {
        type: "category",
        data: usersData
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: "{value}"
        }
      },
      series: [
        {
          name: "任务数",
          type: "bar",
          barMaxWidth: '50',
          data: spliterData
        }
      ]
    };
  },

  mounted() {
    let _self =  this;
    let charts = document.getElementById("cmsSpliter");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
