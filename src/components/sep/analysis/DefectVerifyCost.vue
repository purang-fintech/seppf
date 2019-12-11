<template>
  <div id="vcostCharts" style="width: 99%; height: 300px;"></div>
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
  data: function() {
    return {
      chartsOptions: ""
    };
  },
  props: ["dvcosts"],

  created() {
    let _self =  this;
    let legendData = [];
    let vcostData = [];
    for (let i = 0; i < _self.dvcosts.length; i++) {
      legendData.push(_self.dvcosts[i].verifyCosts); 
      vcostData.push({
        value: _self.dvcosts[i].num,
        name: _self.dvcosts[i].verifyCosts
      });
    }

    _self.chartsOptions = {
      title: {
        text: "已关闭缺陷验证时效分析",
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
          dataView: { show: true, readOnly: false },
          restore: { show: true },
          saveAsImage: { show: true }
        },
        padding: 10
      },
      series: [
        {
          name: "验证耗时",
          type: "pie",
          radius: "60%",
          center: ["40%", "50%"],
          data: vcostData,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ]
    };
  },

  mounted() {
    let _self =  this;
    let charts = document.getElementById("vcostCharts");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
