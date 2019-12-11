<template>
  <div
    id='directionCharts'
    style='width: 100%; height: 300px;'
  ></div>
</template>
<script>
let echarts = require("echarts/lib/echarts");
require("echarts/lib/chart/line");
require("echarts/lib/chart/bar");
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
      chartsOptions: "",
      anaRelease: true
    };
  },
  props: ["datas"],

  created() {
    let _self =  this;
    _self.anaRelease = _self.datas[0].expectFound;
    let dates = [];
    let dailyFound = [];
    let totalFound = [];
    let expectFound = [];
    let dailyResponsed = [];
    let totalResponsed = [];
    let dailyFixed = [];
    let totalFixed = [];
    let dailyClosed = [];
    let totalClosed = [];
    let seriesData = [];
    let legendData = [];
    for (let i = 0; i < _self.datas.length; i++) {
      let current = _self.datas[i];
      dates.push(current.date);
      dailyFound.push(current.dailyFound);
      totalFound.push(current.totalFound);
      if (_self.anaRelease) {
        expectFound.push(current.expectFound);
      }
      dailyResponsed.push(current.dailyResponse);
      totalResponsed.push(current.totalResponse);
      dailyFixed.push(current.dailyFixed);
      totalFixed.push(current.totalFixed);
      dailyClosed.push(current.dailyClosed);
      totalClosed.push(current.totalClosed);
    }

    legendData = _self.anaRelease
      ? [
          "累计发现",
          "理论应发现",
          "累计响应",
          "累计修复",
          "累计关闭",
          "当日发现",
          "当日响应",
          "当日修复",
          "当日关闭"
        ]
      : [
          "累计发现",
          "累计响应",
          "累计修复",
          "累计关闭",
          "当日发现",
          "当日响应",
          "当日修复",
          "当日关闭"
        ];

    seriesData.push({
      name: "当日发现",
      type: "bar",
      barMaxWidth: "20",
      yAxisIndex: 1,
      stack: "堆叠",
      data: dailyFound
    });
    seriesData.push({
      name: "当日响应",
      type: "bar",
      barMaxWidth: "20",
      yAxisIndex: 1,
      stack: "堆叠",
      data: dailyResponsed
    });
    seriesData.push({
      name: "当日修复",
      type: "bar",
      barMaxWidth: "20",
      yAxisIndex: 1,
      stack: "堆叠",
      data: dailyFixed
    });
    seriesData.push({
      name: "当日关闭",
      type: "bar",
      barMaxWidth: "20",
      yAxisIndex: 1,
      stack: "堆叠",
      data: dailyClosed
    });
    seriesData.push({
      name: "累计发现",
      type: "line",
      stack: "累计发现",
      data: totalFound
    });
    if (_self.anaRelease) {
      seriesData.push({
        name: "理论应发现",
        type: "line",
        itemStyle:{
          normal:{
            color:'#ef6060'
          }
        },
        stack: "理论应发现",
        data: expectFound
      });
    }
    seriesData.push({
      name: "累计响应",
      type: "line",
      stack: "累计响应",
      data: totalResponsed
    });
    seriesData.push({
      name: "累计修复",
      type: "line",
      stack: "累计修复",
      data: totalFixed
    });
    seriesData.push({
      name: "累计关闭",
      type: "line",
      stack: "累计关闭",
      data: totalClosed
    });

    _self.chartsOptions = {
      title: {
        text: "缺陷趋势分析",
        top: "5px",
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
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar"] },
          restore: { show: true },
          saveAsImage: { show: true }
        },
        padding: 10
      },
      legend: {
        data: legendData
      },
      dataZoom: {
        show: true,
        bottom: 10,
        backgroundColor: "#000",
        showDetail: false,
        fillerColor: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          {
            offset: 0,
            color: "#89ca89"
          },
          {
            offset: 1,
            color: "#8FBC8F"
          }
        ]),
        realtime: true,
        type: "slider",
        handleSize: 15,
        handleStyle: {
          borderColor: "#cacaca",
          borderWidth: "1",
          shadowBlur: 2,
          background: "#ddd",
          shadowColor: "#ddd"
        },
        handleIcon:
          "M-292,322.2c-3.2,0-6.4-0.6-9.3-1.9c-2.9-1.2-5.4-2.9-7.6-5.1s-3.9-4.8-5.1-7.6c-1.3-3-1.9-6.1-1.9-9.3c0-3.2,0.6-6.4,1.9-9.3c1.2-2.9,2.9-5.4,5.1-7.6s4.8-3.9,7.6-5.1c3-1.3,6.1-1.9,9.3-1.9c3.2,0,6.4,0.6,9.3,1.9c2.9,1.2,5.4,2.9,7.6,5.1s3.9,4.8,5.1,7.6c1.3,3,1.9,6.1,1.9,9.3c0,3.2-0.6,6.4-1.9,9.3c-1.2,2.9-2.9,5.4-5.1,7.6s-4.8,3.9-7.6,5.1C-285.6,321.5-288.8,322.2-292,322.2z",
        height: 10
      },
      xAxis: {
        type: "category",
        axisPointer: {
          type: "shadow"
        },
        splitLine: {
          show: false
        },
        data: dates
      },
      yAxis: [
        {
          type: "value",
          name: "累计数",
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
          axisLabel: {
            formatter: "{value}"
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: seriesData
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
