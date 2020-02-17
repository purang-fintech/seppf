<template>
  <div id="proTypeTwoAna" style="width: 100%; height: 300px;"></div>
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

    let typeOpts = _self.sortData(eval(localStorage.getItem("problemType")), "type", "typeDesc", "children");
    let problemType = [];
    typeOpts.forEach(item => {
      problemType.push({
        value: item.type,
        label: item.typeDesc,
        children: item.children
      });
    });

    let legendData = [];
    let typeData = [];
    _self.datas.forEach(data => {
      let typeAll = data.types.split(",");
      let typeOne = problemType.find(item => {
        return item.value == typeAll[0];
      });
      let typeTwo = typeOne.children.find(item => {
        return item.subType == typeAll[1];
      });
      legendData.push(typeTwo.subDesc);
      typeData.push({
        value: data.num,
        name: typeTwo.subDesc
      });
    });

    _self.chartsOptions = {
      title: {
        text: "问题二级分类分布",
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
        name: "二级分类",
        type: "pie",
        radius: "60%",
        center: ["40%", "50%"],
        data: typeData,
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
    let charts = document.getElementById("proTypeTwoAna");

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
      temp = temp.filter(function (element, index, array) {
        return array.indexOf(element) === index;
      });

      for (let k = 0; k < temp.length; k++) {
        let children = json.filter(function (d) {
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
