<template>
  <div id="ftimeCharts" style="width: 99%; height: 300px;"></div>
</template>

<script>
let echarts = require("echarts/lib/echarts");
require("echarts/lib/chart/pie");
require("echarts/lib/component/tooltip");
require("echarts/lib/component/toolbox");
require("echarts/lib/component/title");
require("echarts/lib/component/legend");
import sepp from "@/assets/theme/charts/sepp";
export default {
  data: function () {
    return {
      chartsOptions: ""
    };
  },
  props: ["dftimes"],

  created() {
    let _self = this;
    let legendData = [];
    let ftimeData = [];
    for (let i = 0; i < _self.dftimes.length; i++) {
      legendData.push(_self.dftimes[i].fixedTimes);
      ftimeData.push({
        value: _self.dftimes[i].num,
        name: _self.dftimes[i].fixedTimes
      });
    }

    _self.chartsOptions = {
      title: {
        text: "缺陷修复次数分析",
        top: "5px",
        left: "10px"
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: "vertical",
        right: 10,
        bottom: 10,
        data: legendData
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
      series: [{
        name: "修复次数",
        type: "pie",
        radius: "60%",
        center: ["40%", "50%"],
        data: ftimeData
      }]
    };
  },

  mounted() {
    let _self = this;
    let charts = document.getElementById("ftimeCharts");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
