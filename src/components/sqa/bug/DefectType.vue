<template>
  <div id="typeAna" style="width: 100%; height: 300px;"></div>
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
  props: ["datas"],

  created() {
    let _self =  this;
    let legendData = [];
    let typeData = [];
    _self.datas.forEach(data => {
      let defectType = eval(localStorage.getItem("defectType")).find(item => {
        return item.typeId === data.defectType;
      }).typeName;
      legendData.push(defectType); 
      typeData.push({
        value: data.num,
        name: defectType
      });
    });

    _self.chartsOptions = {
      title: {
        text: "缺陷类型分布",
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
          name: "缺陷类型",
          type: "pie",
          radius: "60%",
          center: ["40%", "50%"],
          data: typeData,
          label: {
            normal: {
              formatter: '{b} ({d}%)',
            }
          }
        }
      ]
    };
  },

  mounted() {
    let _self =  this;
    let charts = document.getElementById("typeAna");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  }
};
</script>
