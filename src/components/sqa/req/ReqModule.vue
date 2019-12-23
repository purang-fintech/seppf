<template>
  <div id="reqModule" style="width:100%; height:300px"></div>
</template>

<script>
let echarts = require("echarts/lib/echarts");
require("echarts/lib/chart/bar");
require("echarts/lib/component/tooltip");
require("echarts/lib/component/toolbox");
require("echarts/lib/component/title");
require("echarts/lib/component/grid");
require("echarts/lib/component/legend");
import sepp from "@/assets/theme/charts/sepp";
export default {
  data: function () {
    return {
      chartsOptions: ""
    };
  },

  props: ["datas"],

  created() {
    let _self = this;

    let legendData = [];
    let seriesData = [];
    let moduleData = [];

    _self.datas.forEach(data => {
      moduleData.push(data.moduleName);
    });

    eval(localStorage.getItem("requirementPriority")).forEach(item => {
      let priority = item.priorityId;
      let numsData = [];
      _self.datas.forEach(data => {
        let numValue = 0;
        data.children.forEach(child => {
          if (child.priority == priority) {
            numValue = child.num;
          }
        });
        numsData.push(numValue);
      });

      legendData.push(item.priorityName);
      seriesData.push({
        name: item.priorityName,
        type: "bar",
        barMaxWidth: '50',
        stack: "数量",
        data: numsData
      });
    });

    _self.chartsOptions = {
      title: {
        text: "产品需求模块",
        top: "5px",
        left: "10px"
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      toolbox: {
        right: 0,
        top: 0,
        show: true,
        feature: {
          dataView: {
            show: true,
            readOnly: false
          },
          restore: {
            show: true
          },
          saveAsImage: {
            show: true
          }
        },
        padding: 10
      },
      grid: {
        top: 60,
        left: 40,
        right: 40,
        bottom: 40,
        show: true
      },
      legend: {
        top: 10,
        data: legendData
      },
      xAxis: {
        type: "category",
        data: moduleData
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: "{value}"
        }
      },
      series: seriesData
    };
  },

  mounted() {
    let _self = this;
    let charts = document.getElementById("reqModule");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }

};
</script>
