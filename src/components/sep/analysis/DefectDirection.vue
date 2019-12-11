<template>
  <div id="directionCharts" style="width: 99%; height: 300px;"></div>
</template>
<script>
let echarts = require("echarts/lib/echarts");
require("echarts/lib/chart/bar");
require("echarts/lib/chart/line");
require("echarts/lib/component/tooltip");
require("echarts/lib/component/toolbox");
require("echarts/lib/component/grid");
require("echarts/lib/component/title");
require("echarts/lib/component/dataZoom");
require("echarts/lib/component/legend");
import sepp from "@/assets/theme/charts/sepp";
export default {
  data: function() {
    return {
      chartsOptions: ""
    };
  },
  props: ["ddirection"],

  created() {
    let _self =  this;
    let dates = [];
    let dailyFound = [];
    let totalFound = [];
    let dailyResponsed = [];
    let totalResponsed = [];
    let dailyFixed = [];
    let totalFixed = [];
    let dailyClosed = [];
    let totalClosed = [];
    for (let i = 0; i < _self.ddirection.length; i++) {
      let current = _self.ddirection[i];
      dates.push(current.date);
      dailyFound.push(current.dailyFound);
      totalFound.push(current.totalFound);
      dailyResponsed.push(current.dailyResponse);
      totalResponsed.push(current.totalResponse);
      dailyFixed.push(current.dailyFixed);
      totalFixed.push(current.totalFixed);
      dailyClosed.push(current.dailyClosed);
      totalClosed.push(current.totalClosed);
    }
    let maxDaily = [];
    let maxTotal = [];
    maxDaily.push(Math.max.apply(null, dailyFound));
    maxDaily.push(Math.max.apply(null, dailyResponsed));
    maxDaily.push(Math.max.apply(null, dailyFixed));
    maxDaily.push(Math.max.apply(null, dailyClosed));
    maxTotal.push(Math.max.apply(null, totalFound));
    maxTotal.push(Math.max.apply(null, totalResponsed));
    maxTotal.push(Math.max.apply(null, totalFixed));
    maxTotal.push(Math.max.apply(null, totalClosed));

    _self.chartsOptions = {
      title: {
        text: "缺陷趋势总览",
        top: '5px',
        left: '10px'
      },
      grid: {
        top: 80,
        left: 30,
        right: 30,
        bottom: 30,
        show: true,
        containLabel: true
      },
      dataZoom: {
        show: true,
        bottom: 10,
        backgroundColor: '#000',
        showDetail: false,
        fillerColor: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
          offset: 0,
          color: '#3AB4D7'
        }, {
          offset: 1,
          color: '#8FBC8F'
        }]),
        realtime: true,
        type: 'slider',
        handleSize: 15,
        handleStyle: {
          borderColor: "#cacaca",
          borderWidth: "1",
          shadowBlur: 2,
          background: "#ddd",
          shadowColor: "#ddd",
        },
        handleIcon: 'M-292,322.2c-3.2,0-6.4-0.6-9.3-1.9c-2.9-1.2-5.4-2.9-7.6-5.1s-3.9-4.8-5.1-7.6c-1.3-3-1.9-6.1-1.9-9.3c0-3.2,0.6-6.4,1.9-9.3c1.2-2.9,2.9-5.4,5.1-7.6s4.8-3.9,7.6-5.1c3-1.3,6.1-1.9,9.3-1.9c3.2,0,6.4,0.6,9.3,1.9c2.9,1.2,5.4,2.9,7.6,5.1s3.9,4.8,5.1,7.6c1.3,3,1.9,6.1,1.9,9.3c0,3.2-0.6,6.4-1.9,9.3c-1.2,2.9-2.9,5.4-5.1,7.6s-4.8,3.9-7.6,5.1C-285.6,321.5-288.8,322.2-292,322.2z',
        height: 10
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          crossStyle: {
            color: "#999"
          }
        }
      },
      legend: {
        data: [
          "当日发现",
          "累计发现",
          "当日响应",
          "累计响应",
          "当日修复",
          "累计修复",
          "当日关闭",
          "累计关闭"
        ],
        padding: 10
      },
      toolbox: {
        right: 0,
        top: 0,
        show: true,
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar"] },
          restore: { show: true },
          saveAsImage: { show: true }
        },
        padding: 10
      },
      calculable: true,
      xAxis: {
        type: "category",
        axisPointer: {
          type: "shadow"
        },
        data: dates
      },
      yAxis: [
        {
          type: "value",
          name: "累计数",
          min: 0,
          max: parseInt(Math.max.apply(null, maxTotal) * 1.5),
          axisLabel: {
            formatter: "{value}"
          },
          splitLine: {
            show: false
          }
        },
        {
          type: "value",
          name: "当日数",
          min: 0,
          max: parseInt(Math.max.apply(null, maxDaily) * 1.5),
          axisLabel: {
            formatter: "{value}"
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: "当日发现",
          type: "bar",
          barMaxWidth: '50',
          yAxisIndex: 1,
          data: dailyFound
        },
        {
          name: "当日响应",
          type: "bar",
          barMaxWidth: '50',
          yAxisIndex: 1,
          data: dailyResponsed
        },
        {
          name: "当日修复",
          type: "bar",
          barMaxWidth: '50',
          yAxisIndex: 1,
          data: dailyFixed
        },
        {
          name: "当日关闭",
          type: "bar",
          barMaxWidth: '50',
          yAxisIndex: 1,
          data: dailyClosed
        },
        {
          name: "累计发现",
          type: "line",
          data: totalFound
        },
        {
          name: "累计响应",
          type: "line",
          data: totalResponsed
        },
        {
          name: "累计修复",
          type: "line",
          data: totalFixed
        },
        {
          name: "累计关闭",
          type: "line",
          data: totalClosed
        }
      ]
    };
  },

  mounted() {
    let _self =  this;
    let charts = document.getElementById("directionCharts");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
