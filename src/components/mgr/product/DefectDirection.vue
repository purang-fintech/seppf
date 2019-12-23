<template>
  <div id='directionPreview' style='width: 100%; height: 400px'></div>
</template>

<script>
let echarts = require("echarts/lib/echarts");
require("echarts/lib/chart/line");
require("echarts/lib/component/tooltip");
require("echarts/lib/component/toolbox");
require("echarts/lib/component/grid");
require("echarts/lib/component/title");
require("echarts/lib/component/dataZoom");
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
    let summaryDates = [];
    let expectFounds = [];

    _self.datas.forEach(element => {
      summaryDates.push(element.summaryDate);
      expectFounds.push(element.expectFound);
    });

    _self.chartsOptions = {
      title: {
        text: "缺陷趋势预测",
        top: "10px",
        left: "10px"
      },
      tooltip: {
        trigger: "axis"
      },
      grid: {
        top: 80,
        left: 30,
        right: 30,
        bottom: 30,
        shadowColor: "red",
        containLabel: true
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
          magicType: {
            show: true,
            type: ["line"]
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
      legend: {
        top: 10,
        data: ['理论发现']
      },
      xAxis: {
        type: "category",
        axisPointer: {
          type: "shadow"
        },
        splitLine: {
          show: false
        },
        data: summaryDates
      },
      yAxis: [{
        type: "value",
        name: "缺陷数(虚拟数)",
        axisLabel: {
          formatter: "{value}"
        },
        splitLine: {
          show: false
        }
      }],
      series: {
        name: "理论发现",
        type: "line",
        stack: "理论发现",
        data: expectFounds
      }
    };
  },

  mounted() {
    let _self = this;
    let charts = document.getElementById("directionPreview");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
