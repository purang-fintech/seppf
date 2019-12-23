<template>
  <div class="schedule-info">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item><i class="iconfont icon-workbench"></i> 项目开发</el-breadcrumb-item>
        <el-breadcrumb-item>进展分析</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-form :inline="true" size="mini">
      <el-form-item label="计划开始日期">
        <el-date-picker
          v-model="planBegin"
          type="daterange"
          align="right"
          unlink-panels
          :value-format="datefmt"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="计划结束日期" style="margin-left:10px">
        <el-date-picker
          v-model="planEnd"
          type="daterange"
          align="right"
          unlink-panels
          :value-format="datefmt"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-tooltip content="计划完成时间小于当前日期且状态为未完成和已关闭" placement="left" effect="dark">
          <el-button type="warning" class="el-icon-warning" @click="ganttMissionQuery(true)" style="margin-left:10px"> 展示异常</el-button>
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="el-icon-search" @click="ganttMissionQuery(false)" style="margin-left:10px"> 展示所有</el-button>
      </el-form-item>
    </el-form>

    <div v-if="loading">
      <gantt-elastic :options="options" :tasks="tasks">
        <gantt-header slot="header">
        </gantt-header>
      </gantt-elastic>
    </div>
  </div>
</template>

<script>
import GanttElastic from 'gantt-elastic';
import GanttHeader from "gantt-elastic-header";
import dayjs from "dayjs";
import {
  dateFormat,
  pickOptions
} from "@/util/date.js";
const dayfmt = "YYYY-MM-DD";
import router from "@/router";

function toRequest(id) {
  router.push({
    name: "request",
    params: {
      reqId: id
    }
  });
}

export default {
  name: "Gantt",
  components: {
    GanttElastic,
    GanttHeader
  },

  data() {
    return {
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      loading: true,
      planBegin: [],
      planEnd: [],
      tmsStyle: {
        base: {
          fill: "#1EBC61",
          stroke: "#0EAC51"
        }
      },
      cmsStyle: {
        base: {
          fill: "#0287D0",
          stroke: "#0077C0"
        }
      },
      tasks: [{
        id: 1,
        label: "样例数据",
        user: '路人甲',
        status: '进行中',
        start: new Date().getTime(),
        duration: 5 * 24 * 60 * 60 * 1000,
        percent: 85,
        type: "project"
      }, {
        id: 2,
        label: "仅作加载失败参考",
        user: '路人乙',
        parentId: 1,
        start: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).getTime(),
        duration: 4 * 24 * 60 * 60 * 1000,
        percent: 50,
        type: "task",
        style: {
          base: {
            fill: "#1EBC61",
            stroke: "#0EAC51"
          }
        }
      }],
      options: {
        taskMapping: {
          progress: "percent"
        },
        times: { // 时间刻度调整内容
          timeScale: 60 * 1000,
          timeZoom: 20,
          timePerPixel: 0,
          firstTime: null, // firstDate getTime()   new Date('2019-04-01').getTime()
          lastTime: null, // last date getTime()
          firstTaskTime: 0,
          lastTaskTime: 0,
          totalViewDurationMs: 0,
          totalViewDurationPx: 0,
          stepDuration: 'day', // hour, month
          steps: []
        },
        scope: { // 时间范围调整内容
          before: 15,
          after: 15
        },
        maxRows: 500,
        maxHeight: document.body.clientHeight - 300,
        title: {
          label: "",
          html: false
        },
        row: { // 行高调整内容
          height: 25
        },
        calendar: {
          workingDays: [1, 2, 3, 4, 5],
          hour: { // 日历每一天是否展示到小时
            display: true
          },
          month: {
            height: 20,
            display: true,
            widths: [],
            maxWidths: {
              short: 0,
              medium: 0,
              long: 0
            },
            format: {
              short(date) {
                return dayjs(date)
                  .locale("en")
                  .format('MM');
              },
              medium(date) {
                return dayjs(date)
                  .locale("en")
                  .format("MMM 'YY");
              },
              long(date) {
                return dayjs(date)
                  .locale("en")
                  .format('YYYY年 M月');
              }
            }
          }
        },
        chart: {
          progress: {
            bar: false
          },
          expander: {
            display: true
          }
        },
        taskList: {
          expander: {
            straight: false
          },
          columns: [{
              id: 1,
              label: "需求任务",
              value: "label",
              width: 250,
              html: true,
              expander: true,
              events: {
                click({
                  data,
                  column
                }) {
                  if (data.type == "project" && task.user != "/") {
                    toRequest(data.id);
                  }
                }
              }
            },
            {
              id: 2,
              label: "负责人",
              value: "user",
              width: 65,
              style: {
                "task-list-header-label": {
                  "text-align": "center",
                  width: "100%"
                },
                "task-list-item-value-container": {
                  "text-align": "center",
                  width: "100%"
                }
              }
            },
            {
              id: 3,
              label: "开始日期",
              value: task => dayjs(task.start).format(dayfmt),
              width: 80,
              style: {
                "task-list-header-label": {
                  "text-align": "center",
                  width: "100%"
                },
                "task-list-item-value-container": {
                  "text-align": "center",
                  width: "100%"
                }
              }
            },
            {
              id: 4,
              label: "类型",
              value: task => task.type == "project" && task.user == "/" ? "任务族" : (task.type == "project" ? "产品需求" : "任务"),
              width: 65,
              style: {
                "task-list-header-label": {
                  "text-align": "center",
                  width: "100%"
                },
                "task-list-item-value-container": {
                  "text-align": "center",
                  width: "100%"
                }
              }
            },
            {
              id: 5,
              label: "状态",
              value: "status",
              width: 55,
              style: {
                "task-list-header-label": {
                  "text-align": "center",
                  width: "100%"
                },
                "task-list-item-value-container": {
                  "text-align": "center",
                  width: "100%"
                }
              }
            },
            {
              id: 6,
              label: "进展",
              value: task => task.progress + "%",
              width: 65,
              style: {
                "task-list-header-label": {
                  "text-align": "center",
                  width: "100%"
                },
                "task-list-item-value-container": {
                  "text-align": "center",
                  width: "100%"
                }
              }
            }
          ]
        },
        locale: {
          name: "en",
          Now: "现在",
          "X-Scale": "时间刻度",
          "Y-Scale": "行高",
          "Task list width": "列表宽度",
          "Before/After": "时间范围",
          "Display task list": "展示列表",
          weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
          weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
          weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
          months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
          monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
          ordinal: (number, period) => {
            switch (period) {
              case 'W':
                return `${number}周`
              default:
                return `${number}日`
            }
          },
          weekStart: 1,
          formats: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'YYYY/MM/DD',
            LL: 'YYYY年M月D日',
            LLL: 'YYYY年M月D日Ah点mm分',
            LLLL: 'YYYY年M月D日ddddAh点mm分',
            l: 'YYYY/M/D',
            ll: 'YYYY年M月D日',
            lll: 'YYYY年M月D日 HH:mm',
            llll: 'YYYY年M月D日dddd HH:mm'
          },
          relativeTime: {
            future: '%s内',
            past: '%s前',
            s: '几秒',
            m: '1 分钟',
            mm: '%d 分钟',
            h: '1 小时',
            hh: '%d 小时',
            d: '1 天',
            dd: '%d 天',
            M: '1 个月',
            MM: '%d 个月',
            y: '1 年',
            yy: '%d 年'
          }
        }
      }
    };
  },

  created() {
    let _self = this;
    let dayS = new Date();
    dayS.setTime(dayS.getTime() - 3600 * 1000 * 24 * 7);
    _self.planEnd.push(dateFormat(dayS, _self.datefmt));
    dayS.setTime(dayS.getTime() - 3600 * 1000 * 24 * 7);
    _self.planBegin.push(dateFormat(dayS, _self.datefmt));
    dayS.setTime(dayS.getTime() + 3600 * 1000 * 24 * 7);
    _self.planBegin.push(dateFormat(dayS, _self.datefmt));
    let dayE = new Date();
    dayE.setTime(dayE.getTime() + 3600 * 1000 * 24 * 7);
    _self.planEnd.push(dateFormat(dayE, _self.datefmt));

    _self.ganttMissionQuery();
  },

  methods: {
    toRequest(id) {
      this.$router.push({
        name: "request",
        params: {
          reqId: id
        }
      });
    },

    ganttMissionQuery(onlyDelayed) {
      let _self = this;
      if (!_self.planBegin || _self.planBegin.length < 2) {
        _self.$message.warning("查询开始日期不能为空！");
        return;
      }
      if (!_self.planEnd || _self.planEnd.length < 2) {
        _self.$message.warning("查询结束日期不能为空！");
        return;
      }
      _self.loading = false;
      let planBeginBegin = _self.planBegin[0];
      let planBeginEnd = _self.planBegin[1];
      let planEndBegin = _self.planEnd[0];
      let planEndEnd = _self.planEnd[1];
      _self.$axios({
          method: "post",
          url: "/gantt/mission_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            planBeginBegin: planBeginBegin,
            planBeginEnd: planBeginEnd,
            planEndBegin: planEndBegin,
            planEndEnd: planEndEnd
          }
        })
        .then(function (res) {
          let result = eval(res.data);
          if (result.length == 0) {
            _self.$message.warning("查询无记录，请确认！");
            return;
          }
          if (result.length > 500) {
            _self.$message.warning("结果超过500条，请缩小时间范围！");
            return;
          }
          let missions = _self.resortData(result, onlyDelayed);
          if (missions.length > 0) {
            _self.tasks = missions;
            setTimeout(() => {
              _self.loading = true;
            }, 100);
          } else {
            _self.$message.warning("查询无记录，请确认！");
            return;
          }
        })
        .catch(function (response) {
          _self.$notify.error("查询任务信息时发生程序错误！");
          console.log(response);
        });
    },

    resortData(data, onlyDelayed) {
      let _self = this;
      let type_1 = [],
        type_2 = [],
        type_3 = [],
        type_4 = [];
      let reqs = data.filter(item => {
        return item.missionType == "产品需求";
      });
      reqs.forEach(item => {
        let reqCms = data.filter(d => {
          if (onlyDelayed) {
            return d.reqId == item.id && d.missionType == "开发任务" && d.missionEnd < dayjs(new Date()).format(dayfmt) && d.statusId > 0 && d.statusId <= 3;
          } else {
            return d.reqId == item.id && d.missionType == "开发任务";
          }
        });
        let reqCmsAll = reqCms.length;
        let reqCmsCompleted = 0;
        if (reqCmsAll > 0) {
          reqCms = _self.arrDateBeginort(reqCms, "missionBegin");
          let reqCmsEs = _self.arrDateBeginort(reqCms, "missionEnd");
          let reqCmsComp = reqCms.filter(d => {
            return d.statusId == 0 || d.statusId > 5;
          });
          if (reqCmsComp) {
            reqCmsCompleted = reqCmsComp.length;
          }
          let cmsParentId = item.id + '' + (new Date().getTime());
          type_2.push({
            id: parseInt(cmsParentId),
            label: "需求所属开发任务",
            user: "/",
            start: new Date(reqCms[0].missionBegin).getTime() - 8 * 60 * 60 * 1000, // YYYY-MM-DD默认从8点开始，而YYYY/MM/DD则是从0点开始
            type: "project",
            percent: (reqCmsCompleted * 100 / reqCmsAll).toFixed(2),
            duration: new Date(dayjs(reqCmsEs[reqCmsAll - 1].missionEnd).format(dayfmt)).getTime() - new Date(dayjs(reqCms[0].missionBegin).format(dayfmt)).getTime() + 24 * 60 * 60 * 1000,
            status: "/",
            parentId: item.id,
            collapsed: true,
            style: _self.cmsStyle
          });
          reqCms.forEach(d => {
            type_4.push({
              id: parseInt(d.id + '' + cmsParentId),
              label: d.id + ' - ' + d.missionTitle,
              user: d.missionResponser,
              start: new Date(d.missionBegin).getTime() - 8 * 60 * 60 * 1000, // YYYY-MM-DD默认从8点开始，而YYYY/MM/DD则是从0点开始
              type: 'task',
              percent: d.statusId == 0 || d.statusId > 5 ? '100.00' : '0.00',
              duration: new Date(d.missionDuration).getTime(),
              status: d.missionStatus,
              parentId: parseInt(cmsParentId),
              style: _self.cmsStyle
            });
          });
        }

        let reqTms = data.filter(d => {
          if (onlyDelayed) {
            return d.reqId == item.id && d.missionType == "测试任务" && d.missionEnd < dayjs(new Date()).format(dayfmt) && d.statusId > 0 && d.statusId <= 2;
          } else {
            return d.reqId == item.id && d.missionType == "测试任务";
          }
        });
        let reqTmsAll = reqTms.length;
        let reqTmsCompleted = 0;
        if (reqTmsAll > 0) {
          reqTms = _self.arrDateBeginort(reqTms, "missionBegin");
          let reqTmsEs = _self.arrDateBeginort(reqTms, "missionEnd");
          let reqTmsComp = reqTms.filter(d => {
            return d.statusId == 0 || d.statusId > 2;
          });
          if (reqTmsComp) {
            reqTmsCompleted = reqTmsComp.length;
          }
          let tmsParentId = item.id + '' + (new Date().getTime() + 100);
          type_2.push({
            id: parseInt(tmsParentId),
            label: "需求所属测试任务",
            user: "/",
            start: new Date(reqTms[0].missionBegin).getTime() - 8 * 60 * 60 * 1000, // YYYY-MM-DD默认从8点开始，而YYYY/MM/DD则是从0点开始
            type: "project",
            percent: (reqTmsCompleted * 100 / reqTmsAll).toFixed(2),
            duration: new Date(dayjs(reqTmsEs[reqTmsAll - 1].missionEnd).format(dayfmt)).getTime() - new Date(dayjs(reqTms[0].missionBegin).format(dayfmt)).getTime() + 24 * 60 * 60 * 1000,
            status: "/",
            parentId: item.id,
            collapsed: true,
            style: _self.tmsStyle
          });
          reqTms.forEach(d => {
            type_3.push({
              id: parseInt(d.id + '' + tmsParentId),
              label: d.missionTitle,
              user: d.missionResponser,
              start: new Date(d.missionBegin).getTime() - 8 * 60 * 60 * 1000, // YYYY-MM-DD默认从8点开始，而YYYY/MM/DD则是从0点开始
              type: 'task',
              percent: d.statusId == 0 || d.statusId > 2 ? '100.00' : '0.00',
              duration: new Date(d.missionDuration).getTime(),
              status: d.missionStatus,
              parentId: parseInt(tmsParentId),
              style: _self.tmsStyle
            });
          });
        }
        let totalMission = reqTmsAll + reqCmsAll;
        if (totalMission > 0) {
          let allMissions = reqCmsAll > 0 ? reqCms.concat(reqTms) : reqTms.concat(reqCms);
          allMissions = _self.arrDateBeginort(allMissions, "missionBegin");
          type_1.push({
            id: item.id,
            label: "<span class='table-content-tips'>" + item.id + ' - ' + item.missionTitle + "</span>",
            user: item.missionResponser,
            start: new Date(allMissions[0].missionBegin).getTime() - 8 * 60 * 60 * 1000, // YYYY-MM-DD默认从8点开始，而YYYY/MM/DD则是从0点开始
            type: 'project',
            percent: totalMission == 0 ? 0 : ((reqTmsCompleted + reqCmsCompleted) * 100 / totalMission).toFixed(2),
            duration: new Date(item.missionDuration).getTime(),
            status: item.missionStatus,
            collapsed: false
          });
        }
      });
      return type_1.length > 0 ? type_1.concat(type_2, type_3, type_4) : [];
    },

    arrDateBeginort(arr, keyName) {
      let len = arr.length;
      for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - 1 - i; j++) {
          if (dayjs(arr[j][keyName]).format(dayfmt) > dayjs(arr[j + 1][keyName]).format(dayfmt)) { //相邻元素两两对比
            let temp = arr[j + 1]; //元素交换
            arr[j + 1] = arr[j];
            arr[j] = temp;
          }
        }
      }
      return arr;
    }
  }
};
</script>

<style>
.schedule-info .el-form {
  margin-top: 10px;
}

.schedule-info .gantt-elastic__header-label {
  margin-left: 10px;
}

.schedule-info .gantt-elastic__header-slider {
  width: 80px !important;
  margin-left: 5px;
}

.schedule-info .gantt-elastic__main-container-wrapper {
  height: 100%;
}

.schedule-info .gantt-elastic__header-btn-recenter {
  font-size: 13px !important;
  border-radius: 2px !important;
  padding: 6px 12px !important;
  color: #fff !important;
  background-color: #3AB4D7 !important;
  border-color: #3AB4D7 !important;
  display: inline-block !important;
  line-height: 1 !important;
  white-space: nowrap !important;
  border: 1px solid #3AB4D7 !important;
  -webkit-appearance: none !important;
  cursor: pointer !important;
  text-align: center !important;
  outline: 0 !important;
  margin: 0 !important;
  transition: 0.1s !important;
  font-weight: 500 !important;
}

.schedule-info .gantt-elastic__header {
  padding: 0 !important;
  padding-bottom: 10px !important;
}

.schedule-info .gantt-elastic__header-title--text {
  padding-left: 0 !important;
}

.schedule-info .gantt-elastic__header-slider {
  height: 10px !important;
}

.schedule-info .vue-slider-rail {
  height: 10px !important;
  background-color: #3AB4D7 !important;
}

.schedule-info .vue-slider-dot {
  height: 15px !important;
  width: 15px !important;
}

.schedule-info .vue-slider-process {
  background-color: #61c3df !important;
}

.schedule-info .vue-switcher-color--default div {
  background-color: #3AB4D7 !important;
}

.schedule-info .vue-switcher-theme--default.vue-switcher-color--default div:after {
  background-color: #fff !important;
  border: 1px solid gray !important;
}

.schedule-info .vue-slider-dot-handle {
  border: 1px solid gray !important;
  box-shadow: none !important;
}
</style>
