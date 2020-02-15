<template>
  <div id="vcostCharts" style="width: 100%; height: 300px;"></div>
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
  props: ["datas"],

  created() {
    let _self = this;
    let legendData = [];
    let vcostData = [];
    _self.datas.forEach(data => {
      legendData.push(data.verifyCosts);
      vcostData.push({
        value: data.num,
        name: data.verifyCosts
      });
    });

    _self.chartsOptions = {
      title: {
        text: "缺陷验证时效分析（已关闭）",
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
        name: "验证耗时",
        type: "pie",
        radius: "60%",
        center: ["40%", "50%"],
        data: vcostData,
        label: {
          normal: {
            formatter: '{b} ({d}%)',
          }
        }
      }]
    };
  },

  mounted() {
    let _self = this;
    let charts = document.getElementById("vcostCharts");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
