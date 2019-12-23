<template>
  <div id="monthReqCount" style="width: 100%" :style="{height: chartsHeight + 'px'}"></div>
</template>

<script>
let echarts = require("echarts/lib/echarts");
require("echarts/lib/chart/bar");
require("echarts/lib/component/tooltip");
require("echarts/lib/component/toolbox");
require("echarts/lib/component/title");
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
    let legendData = [];
    let seriesData = [];

    _self.datas.forEach(data => {
      productData.push(data.productName);
    });

    eval(localStorage.getItem("requirementStatus")).forEach(item => {
      let numsData = [];
      _self.datas.forEach(data => {
        let numValue = 0;
        data.children.forEach(child => {
          if (child.reqStatus == item.statusName) {
            numValue = child.reqCount;
          }
        });
        numsData.push(numValue);
      });

      legendData.push(item.statusName);
      seriesData.push({
        name: item.statusName,
        type: "bar",
        barMaxWidth: '50',
        stack: "数量",
        data: numsData
      });
    });

    _self.chartsOptions = {
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
      legend: {
        data: legendData
      },
      grid: {
        top: 60,
        left: 50,
        right: 40,
        bottom: 40,
        show: true
      },
      xAxis: {
        type: "category",
        data: productData
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
    let charts = document.getElementById("monthReqCount");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
