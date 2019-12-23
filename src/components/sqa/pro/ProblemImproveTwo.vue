<template>
  <div id="proImproveTwoAna" style="width: 100%; height: 300px;"></div>
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

    let improveOpts = _self.sortData(eval(localStorage.getItem("problemImprove")), "type", "typeDesc", "children");
    let problemImprove = [];
    improveOpts.forEach(item => {
      problemImprove.push({
        value: item.type,
        label: item.typeDesc,
        children: item.children
      });
    });
    let legendData = [];
    let improveData = [];
    _self.datas.forEach(data => {
      let improveAll = data.improves == '尚未明确' ? [] : data.improves.split(",");
      if (improveAll.length == 0) {
        legendData.push('尚未明确');
        improveData.push({
          value: data.num,
          name: '尚未明确'
        });
      } else {
        let improveOne = problemImprove.find(item => {
          return item.value == improveAll[0];
        });
        let improveTwo = improveOne.children.find(item => {
          return item.subType == improveAll[1];
        });
        legendData.push(improveTwo.subDesc);
        improveData.push({
          value: data.num,
          name: improveTwo.subDesc
        });
      }
    });

    _self.chartsOptions = {
      title: {
        text: "改进措施二级分类分布",
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
        name: "改进措施二级分类",
        type: "pie",
        radius: "60%",
        center: ["40%", "50%"],
        data: improveData,
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
    let charts = document.getElementById("proImproveTwoAna");

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
