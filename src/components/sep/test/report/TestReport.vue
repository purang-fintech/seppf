<template>
  <div id="root" class="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-bug"></i> 测试管理</el-breadcrumb-item>
        <el-breadcrumb-item>测试报告</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="tfrom-box">
      <el-form ref="form" :model="form" :inline="true" size="mini" label-width="110px" @keydown.native.enter="reportsQuery()">
        <el-form-item label="版本号" required>
          <el-select v-model="form.release.selected" placeholder="请选择" @change="testPlanQuery()" filterable>
            <el-option v-for="opt in form.release.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-checkbox size="mini" v-model="form.hideClosed" @change="releaseQuery()" border>隐藏已关闭版本</el-checkbox>
        </el-form-item>
        <el-form-item label="计划类型" required>
          <el-select v-model="form.createdTypes.selected" placeholder="请选择" clearable @change="setReportType()">
            <el-option v-for="opt in form.createdTypes.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="报告类型" required>
          <el-select v-model="form.rptType" placeholder="请选择" clearable>
            <el-option v-for="opt in reportTypes" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item style="float: right">
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="reportsQuery()">报告查询</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-printer" @click="createReport()">报告生成</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" :max-height="baseHeight" size="mini" class="report-table" stripe :border="showBorder">
        <el-table-column prop="relCode" label="版本号" width="140" align="center" sortable>
        </el-table-column>
        <el-table-column prop="planType" label="测试计划类型" width="120" align="center" sortable>
          <template slot-scope="scope">
            <el-select v-model="scope.row.planType" size="mini" disabled>
              <el-option v-for="opt in form.planType" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="reportType" label="报告类型" width="120" align="center" sortable>
          <template slot-scope="scope">
            <el-select v-model="scope.row.reportType" size="mini" disabled>
              <el-option v-for="opt in reportTypes" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="reportDate" label="生成时间" width="140" align="center" sortable>
        </el-table-column>
        <el-table-column prop="title" label="报告名称" header-align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column width="70" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="primary" size="mini" @click="viewReport(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page-set">
        <el-pagination 
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange" 
          :current-page="currentPage" 
          :page-sizes="[10, 20, 50, 100, 200]" 
          :page-size="pageSize" 
          layout="total, sizes, prev, pager, next, jumper" 
          :total="pageInfo.total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { dateFormat, dateDiff } from "@/util/date.js";
import commonQuery from "@/components/util/CommonQuery.vue";
let versions = [];
export default {
  data: function() {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      tableData: [],
      pageInfo: {},
      timefmt: defaultTimeFormat,
      datefmt: defaultDateFormat,
      baseHeight: "",
      reportInterval: 10,
      form: {
        release: {
          selected: "",
          opts: []
        },
        hideClosed: true,
        planType: [],
        createdTypes: {
          selected: "",
          opts: []
        },
        rptType: ""
      },
      reportTypes: [],
      testPeriod: [],
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false
    };
  },

  watch: {
    form: {
      handler() {
        this.currentPage = 1;
        this.queryChanged = true;
      },
      deep: true,
      immediate: true
    },

    'tableData.length': function (val) {
      if (val == 0) {
        this.currentPage = 1;
        this.releaseQuery();
      }
    }
  },

  created() {
    let _self =  this;

    _self.reportTypes.splice(0, _self.reportTypes.length);
    let reportType = localStorage.getItem("reportType");
    eval(reportType).forEach(item => {
      _self.reportTypes.push({
        value: item.typeId,
        label: item.typeName
      });
    });

    _self.testPeriod.splice(0, _self.testPeriod.length);
    let testPeriod = localStorage.getItem("testPeriod");
    eval(testPeriod).forEach(item => {
      _self.testPeriod.push({
        value: item.periodId,
        label: item.periodName
      });
    });

    _self.baseHeight = bodyAviHeightNTab - 110 - 45;
    // 数据表展示封版报告用
    _self.testPeriod.forEach(item => {
      _self.form.planType.push(item);  
    });
    _self.form.planType.push({
      value: 0,
      label: "整版编制"
    });
    
    _self.releaseQuery();
  },

  methods: {
    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.testPlanQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.testPlanQuery();
    },

    setReportType(){
      let _self =  this;
      let val = _self.form.createdTypes.selected;
      _self.form.rptType = "";
      _self.reportTypes.forEach(item => {
        if (val === "") {
          _self.$set(item, "disabled", false);
        } else {
          _self.$set(item, "disabled", val === 0 ? item.value != 3 : item.value === 3);
        }
      });
    },

    viewReport(row) {
      let routeName = "reporter";
      if (row.reportType === 1) {
        routeName = "schedule";
      } else if (row.reportType === 2) {
        routeName = "exitus";
      }
      let routeData = this.$router.resolve({
        name: routeName,
        query: {
          reportId: row.id
        }
      });
      window.open(routeData.href, "_blank");
    },

    timeDiff(begin, end) {
      return (end.getTime() - begin.getTime()) / 60000;
    },

    createReport() {
      this.reportsQuery();
      setTimeout(() => {
        this.$nextTick(function() {
          this.createTestReport();
        });
      }, 200);
    },

    createTestReport() {
      let _self =  this;

      let reportTime = new Date(dateFormat(new Date(), _self.timefmt));
      let sRel = _self.form.release.selected;
      let sType = _self.form.createdTypes.selected;
      let reportType = _self.form.rptType;

      let needed = 0;
      let selectedPlan;
      _self.form.createdTypes.opts.forEach(item => {
        if (item.value === 4 || item.value === 5) {
          needed++;
        }
        if (item.value === sType) {
          selectedPlan = item;
        }
      });

      if (null === sRel || sRel === "") {
        _self.$message.info("请选择版本号");
        return;
      }
      if (null === sType || sType === "") {
        _self.$message.info("请选择计划类型");
        return;
      }
      if (null === reportType || reportType === "") {
        _self.$message.info("请选择报告类型");
        return;
      }

      let planBegin, planEnd;
      if (sType === 0) {
        if (needed < 2) {
          _self.$message.info("请先创建系统测试和验收测试计划！");
          return;
        }
        let selectedRel = _self.form.release.opts.find(item => {
          return item.value === _self.form.release.selected;
        });
        planBegin = new Date(
          dateFormat(new Date(selectedRel.begin), _self.datefmt) + " 00:00:00"
        );
        planEnd = new Date(
          dateFormat(new Date(selectedRel.end), _self.datefmt) + " 23:59:59"
        );
      } else {
        planBegin = new Date(
          dateFormat(new Date(selectedPlan.planBegin), _self.datefmt) +
            " 00:00:00"
        );
        planEnd = new Date(
          dateFormat(new Date(selectedPlan.planEnd), _self.datefmt) +
            " 23:59:59"
        );
      }

      if (reportTime < planBegin || reportTime > planEnd) {
        _self.$message.info("计划周期已过，不可生成！");
        return;
      }

      let namedType = _self.reportTypes.find(item => {
        return item.value === reportType;
      }).label;
      for (let i = 0; i < _self.tableData.length; i++) {
        let tDate = _self.tableData[i].reportDate;
        let tType = _self.tableData[i].planType;
        let tRtype = _self.tableData[i].reportType;
        let tRel = _self.tableData[i].relId;

        if (reportType === 1) {
          if (
            _self.timeDiff(new Date(tDate), reportTime) <
              _self.reportInterval &&
            tRel === sRel &&
            tType === sType
          ) {
            _self.$message.info(
              _self.reportInterval + "分钟之内请不要重复生成！"
            );
            return;
          }
        } else {
          if (tRel === sRel && tType === sType && tRtype === reportType) {
            _self.$message.info("请不要重复生成！");
            return;
          }
        }
      }

      let reportTitle =
        "【" +
        sessionStorage.productName +
        "】【" +
        _self.form.release.opts.find(d => {
          return d.value === sRel;
        }).label +
        "】" +
        (reportType === 3 ? "" : "【" + selectedPlan.label + "】") +
        namedType +
        (reportType === 1 ? dateFormat(reportTime, "yyyyMMddHhmmss") : "");

      let dataParam = new URLSearchParams();
      dataParam.append("title", reportTitle);
      _self.$axios({
          method: "post",
          url: "/report/create",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            planType: sType,
            relId: sRel,
            reportDate: dateFormat(reportTime, _self.timefmt),
            reportType: reportType,
            url: ""
          },
           data: dataParam
        })
        .then(function(res) {
          if (res.data > 0) {
            _self.$message.success("测试报告生成成功");
          } else {
            _self.$message.info("测试报告生成失败");
          }
          _self.$nextTick(function() {
            _self.reportsQuery();
          });
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    reportsQuery() {
      let _self =  this;
      if (
        null === _self.form.release.selected ||
        _self.form.release.selected === ""
      ) {
        _self.$message.info("请选择版本号");
        return;
      }
      _self.$axios({
          method: "post",
          url: "/report/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.form.release.selected,
            reportType: _self.form.rptType,
            planType: _self.form.createdTypes.selected,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function(res) {
          _self.tableData = eval(res.data.list);
          _self.pageInfo = res.data;
          setTimeout(() => {
            _self.queryChanged = false;
          }, 200);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    releaseQuery() {
      let _self =  this;
      _self.form.release.opts.splice(0, _self.form.release.opts.length);
      versions.splice(0, versions.length);
      if (_self.form.hideClosed == true) {
        commonQuery.openRelQuery((result) => {
          if (result.original.length === 0) {
            _self.$message.info("查询无记录");
            return;
          }
          result.original.forEach(item => {
            versions.push({
              label: "[" + item.branchName + "] " + item.relCode,
              value: item.id,
              begin: item.sitBeginDate,
              end: item.relDate
            });
            _self.form.release.opts.push({
              label: "[" + item.branchName + "] " + item.relCode,
              value: item.id,
              begin: item.sitBeginDate,
              end: item.relDate
            });
          });
          if (null != _self.$route.params.relId) {
            _self.form.release.selected = parseInt(_self.$route.params.relId);
          } else {
            _self.form.release.selected = result.original[0].id;
          }
          _self.$nextTick(function() {
            _self.testPlanQuery();
          });
        })
      } else {
        commonQuery.releaseQuery((result) => {
          if (result.releasesWithBranch.length === 0) {
            _self.$message.info("查询无记录");
            return;
          }
          result.original.forEach(item => {
            versions.push({
              label: "[" + item.branchName + "] " + item.relCode,
              value: item.id,
              begin: item.sitBeginDate,
              end: item.relDate
            });
            _self.form.release.opts.push({
              label: "[" + item.branchName + "] " + item.relCode,
              value: item.id,
              begin: item.sitBeginDate,
              end: item.relDate
            });
          });
          if (null != _self.$route.params.relId) {
            _self.form.release.selected = parseInt(_self.$route.params.relId);
          } else {
            _self.form.release.selected = result.original[0].id;
          }
          _self.$nextTick(function() {
            _self.testPlanQuery();
          });
        })
      }
    },

    testPlanQuery() {
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/plan/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.form.release.selected
          }
        })
        .then(function(res) {
          let json = eval(res.data.list);
          let types = _self.testPeriod;
          _self.form.createdTypes.opts.splice(
            0,
            _self.form.createdTypes.opts.length
          );
          if (json.length === 0) {
            _self.$message.info("该版本未建立测试计划");
            _self.form.createdTypes.selected = "";
            _self.tableData.splice(0, _self.tableData.length);
            return;
          }
          let relInfo = versions.find(d => {
            return (d.value = _self.form.release.selected);
          });
          _self.form.createdTypes.opts.push({
            value: 0,
            label: "整版编制",
            planBegin: relInfo.begin,
            planEnd: relInfo.end
          });
          for (let j = 0; j < types.length; j++) {
            for (let i = 0; i < json.length; i++) {
              if (types[j].value === json[i].planType) {
                _self.form.createdTypes.opts.push({
                  value: types[j].value,
                  label: types[j].label,
                  planBegin: json[i].planBegin,
                  planEnd: json[i].planEnd
                });
              }
            }
          }
          _self.$nextTick(function() {
            _self.reportsQuery();
          });
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    }
  }
};
</script>

<style>
.tfrom-box {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.tfrom-box .el-form-item {
  margin-right: 0;
  margin-top: 10px;
}

.tfrom-box .el-form-item input {
  width: 150px !important;
}

.tfrom-box .el-form-item .el-button {
  margin-bottom: 10px;
}

.report-table {
  margin-top: 20px;
}
</style>
