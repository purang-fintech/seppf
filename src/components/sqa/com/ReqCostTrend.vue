<template>
  <div id="reqCostTrend" style="width: 100%; height: 300px;"></div>
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
      chartsOptions: ""
    };
  },
  props: ["datas"],

  created() {
    let _self =  this;
    let monthsData = [];
    let seriesData = [];
    let legendData = [];
    let reqCount = [];
    let reqCost = [];
    let trendData = [];

    _self.datas.forEach(data => {
      monthsData.push(data.groupKey);
      trendData.push(data.reqCostAvg);
      reqCount.push(data.reqCount);
      reqCost.push(data.reqCost);
    });

    legendData.push('需求数');
    seriesData.push({
      name: '需求数',
      type: "bar",
      barMaxWidth: "50",
      stack: "需求数",
      yAxisIndex: 0,
      data: reqCount
    });
    legendData.push('消耗天数');
    seriesData.push({
      name: '消耗天数',
      type: "bar",
      barMaxWidth: "50",
      stack: "消耗天数",
      yAxisIndex: 0,
      data: reqCost
    });

    legendData.push('平均消耗天数');
    seriesData.push({
      name: '平均消耗天数',
      type: "line",
      yAxisIndex: 1,
      smooth: true,
      data: trendData
    });

    _self.chartsOptions = {
      title: {
        text: "需求消耗天数趋势",
        top: "5px",
        left: "10px"
      },
      grid: {
        top: 80,
        left: 50,
        right: 50,
        bottom: 50,
        show: true
      },
      dataZoom: {
        show: true,
        bottom: 10,
        backgroundColor: '#000',
        showDetail: false,
        fillerColor: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
          offset: 0,
          color: '#89ca89'
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
          type: "cross"
        }
      },
      legend: [{
        data: legendData,
        top: 10
      }],
      toolbox: {
        right: 0,
        top: 0,
        show: true,
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
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
        splitLine: {
          show: false
        },
        data: monthsData
      },
      yAxis: [{
        type: "value",
        name: "需求数/消耗天数",
        axisLabel: {
          formatter: "{value}"
        },
        splitLine: {
          show: false
        }
      },{
        type: "value",
        name: "平均消耗天数",
        axisLabel: {
          formatter: "{value}"
        },
        splitLine: {
          show: false
        }
      }],
      series: seriesData
    };
  },

  mounted() {
    let _self =  this;
    let charts = document.getElementById("reqCostTrend");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
