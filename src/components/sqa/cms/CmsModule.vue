<template>
  <div id="cmsModuleAna" style="width: 100%; height: 300px;"></div>
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
    let seriesData = [];

    _self.datas.forEach(data => {
      usersData.push(data.moduleName);
      seriesData.push({
        value: data.num
      });
    });

    _self.chartsOptions = {
      title: {
        text: "开发任务模块分布",
        top: "5px",
        left: "10px"
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" }
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
      grid: {
        top: 60,
        left: 50,
        right: 40,
        bottom: 40,
        show: true
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
          name: "模块名称",
          type: "bar",
          barMaxWidth: '50',
          stack: "数量",
          data: seriesData
        }
      ]
    };
  },

  mounted() {
    let _self =  this;
    let charts = document.getElementById("cmsModuleAna");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
