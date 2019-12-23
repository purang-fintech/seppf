<template>
  <div id="monthDefectCost" style="width: 100%" :style="{height: chartsHeight + 'px'}"></div>
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
  data: function () {
    return {
      chartsHeight: 200,
      chartsOptions: ""
    };
  },
  props: ["datas", "height"],

  created() {
    let _self = this;
    _self.chartsHeight = _self.height - 1;
    let productData = [];
    let defectCount = [];
    let defectCostSum = [];
    let defectCostAvg = [];
    let countMax = 0;
    let sumMax = 0;

    _self.datas.forEach(data => {
      productData.push(data.productName);
      defectCostAvg.push((data.defectCostSum / data.defectCount).toFixed(2));
      defectCount.push(data.defectCount);
      defectCostSum.push(data.defectCostSum);
    });

    countMax = Math.max.apply(null, defectCount);
    sumMax = Math.max.apply(null, defectCostSum);

    _self.chartsOptions = {
      grid: {
        top: 80,
        left: 50,
        right: 50,
        bottom: 50,
        show: true
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross"
        }
      },
      legend: {
        data: ["总需求数", "合计消耗天数", "平均消耗天数"],
        padding: 10
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
            type: ["line", "bar"]
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
      calculable: true,
      xAxis: {
        type: "category",
        axisPointer: {
          type: "shadow"
        },
        splitLine: {
          show: false
        },
        data: productData
      },
      yAxis: [{
          type: "value",
          name: "总需求数",
          axisLabel: {
            formatter: "{value}"
          },
          max: parseInt(countMax * 1.2),
          splitLine: {
            show: false
          }
        },
        {
          type: "value",
          name: "合计消耗天数",
          axisLabel: {
            formatter: "{value}"
          },
          max: parseInt(sumMax * 1.2),
          splitLine: {
            show: false
          }
        }
      ],
      series: [{
          name: "总需求数",
          type: "bar",
          barMaxWidth: "50",
          stack: "总需求数",
          yAxisIndex: 0,
          data: defectCount
        },
        {
          name: "合计消耗天数",
          type: "bar",
          barMaxWidth: "50",
          stack: "合计消耗天数",
          yAxisIndex: 1,
          data: defectCostSum
        },
        {
          name: "平均消耗天数",
          type: "line",
          smooth: true,
          yAxisIndex: 1,
          data: defectCostAvg
        }
      ]
    };
  },

  mounted() {
    let _self = this;
    let charts = document.getElementById("monthDefectCost");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
