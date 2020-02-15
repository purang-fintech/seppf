<template>
  <div id="root" class="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-mine"></i> 个人中心
        </el-breadcrumb-item>
        <el-breadcrumb-item>告警中心</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog title="告警重算" :visible.sync="showRecal" width="680px">
      <el-form :inline="true" class="warning-form" size="small" v-model="calculate" label-width="100px">
        <el-form-item label="计算方式">
          <el-select clearable v-model="calculate.releaseCal" @change="resetRelease()" placeholder="计算方式">
            <el-option key="1" label="按项目计算" value="1"></el-option>
            <el-option key="2" label="按版本计算" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计算版本" v-if="calculate.releaseCal==2">
          <el-select clearable v-model="calculate.relId" filterable placeholder="计算版本">
            <el-option v-for="item in calReleases" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" icon="el-icon-close" @click="showRecal=false" size="small">取消</el-button>
        <el-button type="primary" icon="iconfont icon-run" @click="warningCalculate()" size="small">提交重算</el-button>
      </div>
    </el-dialog>

    <div class="warning-main">
      <el-form :inline="true" class="warning-form" size="mini" v-model="warning" label-width="100px">
        <el-form-item label="告警类型">
          <el-select clearable v-model="warning.type" filterable placeholder="告警类型" @change="getSubType()">
            <el-option v-for="item in warningTypes" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="告警子类型">
          <el-select clearable v-model="warning.subType" filterable placeholder="告警子类型">
            <el-option v-for="item in warningSubTypes" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="告警级别">
          <el-select clearable v-model="warning.level" filterable placeholder="告警级别">
            <el-option v-for="item in warninglevels" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属版本">
          <el-select clearable v-model="warning.category" filterable placeholder="所属版本">
            <el-option v-for="item in releases" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-checkbox size="mini" v-model="warning.hideClosed" @change="releaseQuery()" border>隐藏已关闭版本</el-checkbox>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select
            v-model="warning.responser"
            clearable
            placeholder="负责人"
            filterable
            :filter-method="filterUsers"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="告警日期">
          <el-date-picker v-model="warning.warningDate" type="date" :value-format="datefmt" placeholder="告警日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="已邮件通知">
          <el-select v-model="warning.isSent">
            <el-option v-for="item in sendStatuses" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button v-no-more-click type="primary" @click="warningQuery()" icon="el-icon-search" style="float:right">查询</el-button>
          <el-button
            v-no-more-click
            v-if="isManager()"
            type="warning"
            @click="showRecal=true"
            icon="iconfont icon-run"
            style="float:right;margin-right:10px">告警重算</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="warnings"
        size="mini"
        stripe
        empty-text="暂无告警数据"
        :max-height="maxHeight"
        ref="warningTable"
        class="warning-table">
        <el-table-column type="index" label="序号" width="50" align="center" sortable>
        </el-table-column>
        <el-table-column prop="warningDate" label="告警日期" width="120" align="center" sortable>
        </el-table-column>
        <el-table-column prop="batchNo" label="告警生成时间" width="160" align="center" sortable>
          <template slot-scope="scope">
            <span>{{batchNoToTime(scope.row.batchNo)}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="所属版本" width="180" align="center" sortable>
        </el-table-column>
        <el-table-column prop="toName" label="负责人" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="typeName" label="告警类型" width="100" align="center">
        </el-table-column>
        <el-table-column prop="subTypeName" label="告警子类型" width="150" align="center">
        </el-table-column>
        <el-table-column prop="levelName" label="告警级别" width="100" align="center">
          <template slot-scope="scope">
            <el-tag effect="dark" size="mini" v-if="scope.row.level==1">{{scope.row.levelName}}</el-tag>
            <el-tag effect="dark" size="mini" type="info" v-if="scope.row.level==2">{{scope.row.levelName}}</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="scope.row.level==3">{{scope.row.levelName}}</el-tag>
            <el-tag effect="dark" size="mini" type="danger" v-if="scope.row.level==4">{{scope.row.levelName}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="告警摘要" header-align="center">
          <template slot-scope="scope">
            <el-popover placement="top" width="500" trigger="click">
              <el-alert title="计算规则说明" type="warning" :closable="false" :description="scope.row.summary + '，表达式：' + scope.row.content">
              </el-alert>
              <el-button slot="reference" type="text" size="small" style="margin-left:5px">{{ scope.row.summary }}</el-button>
            </el-popover>
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
          :total="total">
        </el-pagination>
        <el-button
          type="primary"
          class="el-icon-download export-btn"
          size="mini"
          :disabled="warnings.length == 0"
          plain
          @click="exportCSV('告警清单数据', 'warningTable')">
          导出CSV
        </el-button>
        <div class="export-tips">导出CSV文件请使用<span>新版本</span>MS Office或者WPS表格工具打开</div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  dateFormat
} from "@/util/date.js";
import commonQuery from "@/components/util/CommonQuery.vue";
import TableExport from '@/util/TableExport.js'
export default {
  data: function () {
    return {
      datefmt: defaultDateFormat,
      timefmt: defaultTimeFormat,
      maxHeight: bodyAviHeightTab - 50 - 40,
      queryChanged: false,
      warnings: [],
      total: 0,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      currentPage: 1,
      warning: {
        responser: "",
        warningDate: "",
        category: "",
        type: "",
        subType: "",
        level: "",
        isSent: 1,
        hideClosed: true
      },
      releases: [],
      sendStatuses: [{
          value: 0,
          label: "否"
        },
        {
          value: 1,
          label: "是"
        }
      ],
      warninglevels: [],
      warningTypes: [],
      warningSubTypes: [],
      memberFull: [],
      userOptions: [],
      showRecal: false,
      calReleases: [],
      calculate: {
        releaseCal: "1",
        relId: ""
      }
    };
  },

  watch: {
    warning: {
      handler() {
        this.currentPage = 1;
        this.queryChanged = true;
      },
      deep: true,
      immediate: true
    }
  },

  created() {
    let _self = this;
    _self.warning.warningDate = dateFormat(new Date(), _self.datefmt);

    _self.warninglevels.splice(0, _self.warninglevels.length);
    eval(localStorage.getItem("warningLevel")).forEach(item => {
      _self.warninglevels.push({
        value: item.levelId,
        label: item.levelName
      });
    });

    let typeOpts = _self.sortData(eval(localStorage.getItem("warningType")), "type", "typeDesc", "children");
    _self.warningTypes.splice(0, _self.warningTypes.length);
    typeOpts.forEach(item => {
      _self.warningTypes.push({
        value: item.type,
        label: item.typeDesc,
        children: item.children
      });
    });

    _self.openRelQuery();
    _self.memberQuery();
    _self.warningQuery();
  },

  methods: {
    memberQuery() {
      let _self = this;
      commonQuery.memberQuery(result => {
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
      });
    },

    isManager() {
      return commonQuery.roleAllow([0, 2, 10]);
    },

    resetRelease() {
      let _self = this;
      if (_self.calculate.releaseCal == 1) {
        _self.calculate.relId = "";
      }
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.warnings, columns, fileName)
    },

    batchNoToTime(batchNo) {
      return dateFormat(new Date(batchNo), this.timefmt);
    },

    getSubType() {
      let _self = this;
      _self.warning.subType = "";
      _self.warningSubTypes.splice(0, _self.warningSubTypes.length);
      if (!commonQuery.isNull(_self.warning.type)) {
        let subType = _self.warningTypes.find(item => {
          return item.value == _self.warning.type;
        }).children || [];
        subType.forEach(item => {
          _self.warningSubTypes.push({
            value: item.subType,
            label: item.subDesc
          });
        });
      }
    },

    openRelQuery() {
      let _self = this;
      _self.calReleases.splice(0, _self.calReleases.length);
      _self.releases.splice(0, _self.releases.length);

      commonQuery.openRelQuery((result) => {
        if (result.original.length == 0) {
          _self.$message.info("当前产品/项目尚未建立版本计划！");
          return;
        }
        result.original.forEach(item => {
          _self.calReleases.push({
            value: item.id,
            label: "[" + item.branchName + "] " + item.relCode
          });
          _self.releases.push({
            value: item.id,
            label: "[" + item.branchName + "] " + item.relCode,
            code: item.relCode
          });
        });
      })
    },

    releaseQuery(row, event, column) {
      let _self = this;
      _self.releases.splice(0, _self.releases.length);

      if (_self.warning.hideClosed == true) {
        commonQuery.openRelQuery((result) => {
          if (result.original.length == 0) {
            _self.$message.info("当前产品/项目尚未建立版本计划！");
            return;
          }
          result.original.forEach(item => {
            _self.releases.push({
              value: item.id,
              label: "[" + item.branchName + "] " + item.relCode,
              code: item.relCode
            });
          });
        })
      } else {
        commonQuery.releaseQuery((result) => {
          if (result.original.length == 0) {
            _self.$message.info("当前产品/项目尚未建立版本计划！");
            return;
          }
          result.original.forEach(item => {
            _self.releases.push({
              value: item.id,
              label: "[" + item.branchName + "] " + item.relCode + " -- " + item.statusName,
              code: item.relCode
            });
          });
        })
      }
    },

    resetFilterText() {
      let _self = this;
      _self.userOptions = _self.memberFull;
    },

    filterUsers(val) {
      let _self = this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },

    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.warningQuery();
    },

    handleCurrentChange(val) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = val;
      }
      this.warningQuery();
    },

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
    },

    warningCalculate() {
      let _self = this;
      if (_self.calculate.releaseCal == 2 && _self.calculate.relId == "") {
        _self.$message.warning("按版本计算，版本不能为空！");
        _self.showRecal = false;
        return;
      }
      if (_self.calculate.releaseCal == 1) {
        _self.$axios
          .post("/warning/product_cal/" + sessionStorage.productId).then(res => {
            _self.$message({
              message: res.data.message,
              type: res.data.code == 1 ? "success" : "warning"
            });
          });
      } else {
        _self.$axios
          .post("/warning/release_cal/" + _self.calculate.relId).then(res => {
            _self.$message({
              message: res.data.message,
              type: res.data.code == 1 ? "success" : "warning"
            });
          });
      }
      _self.showRecal = false;
    },

    warningQuery() {
      let _self = this;
      _self.$axios
        .post("/warning/query", {
          type: _self.warning.type,
          subType: _self.warning.subType,
          to: _self.warning.responser,
          level: _self.warning.level,
          warningDate: _self.warning.warningDate,
          category: commonQuery.isNull(_self.warning.category) ? "" : _self.releases.find(d => {
            return _self.warning.category == d.value
          }).code,
          isSent: _self.warning.isSent,
          pageSize: _self.pageSize,
          pageNum: _self.currentPage
        })
        .then(resp => {
          _self.warnings = resp.data.list;
          _self.total = resp.data.total;
          setTimeout(() => {
            _self.queryChanged = false;
          }, 200);
        });
    }
  }
};
</script>

<style>
.warning-main {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.warning-form .el-input,
.warning-form .el-input__inner {
  width: 180px;
}

.warning-table th {
  background-color: #fff;
  font-size: 14px;
  color: #788288;
}
</style>
