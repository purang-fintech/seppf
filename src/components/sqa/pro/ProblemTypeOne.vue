<template>
  <div id="proTypeOneAna" style="width: 100%; height: 300px;"></div>
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
      chartsOptions: "",
      problemType: []
    };
  },
  props: ["datas"],

  created() {
    let _self =  this;

    let typeOpts = _self.sortData(eval(localStorage.getItem("problemType")), "type", "typeDesc", "children");
    _self.problemType.splice(0, _self.problemType.length);
    typeOpts.forEach(item => {
      _self.problemType.push({
        value: item.type,
        label: item.typeDesc,
        children: item.children
      });
    });
    let legendData = [];
    let typeData = [];
    _self.datas.forEach(data => {
      let typeOne = _self.problemType.find(item => {
        return item.value === data.typeOne;
      }).label;
      legendData.push(typeOne); 
      typeData.push({
        value: data.num,
        name: typeOne
      });
    });

    _self.chartsOptions = {
      title: {
        text: "问题一级分类分布",
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
          name: "一级分类",
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
    let charts = document.getElementById("proTypeOneAna");

    let dataCharts = echarts.init(charts, sepp);
    dataCharts.setOption(_self.chartsOptions);
  },

  methods: {
    sortData(json, idKey, labelKey, childKey) {
      let temp = [];
      let result = [];
      for (let i = 0; i < json.length; i++) {
        temp.push(json[i][idKey]);
      }
      temp = temp.filter(function(element, index, array) {
        return array.indexOf(element) === index;
      });

      for (let k = 0; k < temp.length; k++) {
        let children = json.filter(function(d) {
          return d[idKey] === temp[k];
        });
        result.push({
          [idKey]: temp[k],
          [labelKey]: children[0][labelKey],
          [childKey]: children
        });
      }
      return result;
    }
  }
};
</script>
