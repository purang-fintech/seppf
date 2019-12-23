<template>
  <div id="tmsStatus" style="width:100%; height:300px"></div>
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
    let statusData = [];
    for (let i = 0; i < _self.datas.length; i++) {
      let namedLabel = eval(localStorage.getItem("testMissionStatus")).find(item => {
        return item.statusId === _self.datas[i].status;
      }).statusName;
      legendData.push(namedLabel);
      statusData.push({
        value: _self.datas[i].num,
        name: namedLabel
      });
    }

    _self.chartsOptions = {
      title: {
        text: "测试任务状态",
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
        name: "测试任务状态",
        type: "pie",
        radius: "60%",
        center: ["40%", "50%"],
        data: statusData,
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
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
    let charts = document.getElementById("tmsStatus");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
