<template>
  <div id="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item><i class="iconfont icon-coding"></i> 需求管理</el-breadcrumb-item>
        <el-breadcrumb-item>变更确认</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="change-form">
      <el-form
        ref="form"
        :model="changeForm"
        :inline="true"
        size="mini"
        class="plan-form"
        label-width="110px"
        @keydown.native.enter="changeAuditQuery()">
        <el-form-item label="产品需求号">
          <el-input v-model="changeForm.reqId" placeholder="需求编号" clearable>需求编号</el-input>
        </el-form-item>
        <el-form-item label="变更用户">
          <el-select
            v-model="changeForm.changeUser"
            placeholder="请选择"
            filterable
            clearable
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
        <el-form-item label="变更状态">
          <el-select v-model="changeForm.changeStatus" placeholder="请选择" filterable clearable>
            <el-option v-for="opt in statuses" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="变更操作日期">
          <el-date-picker
            v-model="changeForm.changeTime"
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
        <el-form-item style="float:right;">
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="changeAuditQuery()">变更查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="tableData"
        size="mini"
        :max-height="tableHeight"
        stripe
        :border="showBorder"
        ref="changeTable"
        v-loading="queryLoading"
        element-loading-text="查询中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column prop="id" label="产品需求号" width="110" align="center" sortable>
          <template slot-scope="scope">
            <el-button type="text" @click="toRquest(scope.row.reqId)">{{scope.row.reqId}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="changeTime" label="变更时间" width="140px" align="center" sortable>
        </el-table-column>
        <el-table-column prop="changeUserName" label="变更用户" width="100px" align="center" sortable>
        </el-table-column>
        <el-table-column prop="changeDesc" label="变更说明" min-width="30%" header-align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-popover placement="right-end" width="600" trigger="click">
              <el-input type="textarea" v-model="scope.row.changeDetail" :rows="10" disabled resize="none"></el-input>
              <span class="table-content-tips" slot="reference">{{scope.row.changeDesc}}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          prop="auditUserName"
          label="应确认用户"
          min-width="20%"
          align="center"
          sortable
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="audittedUserName"
          label="已确认用户"
          min-width="20%"
          align="center"
          sortable
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="statusName" label="变更状态" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center">
          <template slot-scope="scope">
            <el-button v-no-more-click type="primary" size="mini" @click="auditConfirm(scope.row)" :disabled="checkDisabled(scope.row)">确认变更</el-button>
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
        <el-button
          type="primary"
          class="el-icon-download export-btn"
          size="mini"
          :disabled="tableData.length == 0"
          plain
          @click="exportCSV('需求变更清单数据', 'changeTable')">
          导出CSV
        </el-button>
        <div class="export-tips">导出CSV文件请使用<span>新版本</span>MS Office或者WPS表格工具打开</div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  dateFormat,
  pickOptions
} from "@/util/date.js";
import commonQuery from "@/components/util/CommonQuery.vue";
import TableExport from '@/util/TableExport.js'
export default {
  data: function () {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      tableData: [],
      queryLoading: false,
      pageInfo: {},
      datefmt: defaultDateFormat,
      tableHeight: "",
      pickOptions: pickOptions,
      statuses: [{
          value: 1,
          label: "确认中"
        },
        {
          value: 0,
          label: "已完成"
        }
      ],
      changeForm: {
        reqId: "",
        changeTime: [],
        changeStatus: 1,
        changeUser: ""
      },
      queryParams: {},
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      showDialog: false,
      members: [],
      memberFull: [],
      userOptions: [],
      params: []
    };
  },

  watch: {
    changeForm: {
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
        this.changeAuditQuery();
      }
    }
  },

  created() {
    let _self = this;

    for (let p in _self.$route.params) {
      _self.params.push({
        [p]: _self.$route.params[p]
      });
    }

    _self.tableHeight = bodyAviHeightNTab - 70 - 45;
    let dayS = new Date();
    dayS.setTime(dayS.getTime() - 3600 * 1000 * 24 * 90);
    _self.changeForm.changeTime.push(dateFormat(new Date(dayS), _self.datefmt));
    _self.changeForm.changeTime.push(dateFormat(new Date(), _self.datefmt));

    _self.memberQuery(_self.changeAuditQuery);
  },

  methods: {
    resetFilterText() {
      let _self = this;
      _self.userOptions = _self.memberFull;
    },

    filterUsers(val) {
      let _self = this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },

    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.changeAuditQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.changeAuditQuery();
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    toRquest(reqId) {
      this.$router.push({
        name: "request",
        params: {
          reqId: reqId
        }
      });
    },

    checkDisabled(row) {
      if (row.changeStatus == 0) {
        return true;
      }
      let toAudit = row.auditUser;
      let auditted = row.audittedUser;
      if (!toAudit || toAudit == null || toAudit == "") {
        return true;
      }
      if (toAudit.split(",").indexOf(sessionStorage.userId) == -1) {
        return true;
      }
      if (!auditted || auditted == null || auditted == "") {
        return false;
      }
      if (auditted.split(",").indexOf(sessionStorage.userId) != -1) {
        return true;
      }
      return false;
    },

    saveChangeAudit(data) {
      let _self = this;
      if (!data.auditUser || data.auditUser.split(",").indexOf(sessionStorage.userId) < 0) {
        _self.$message.warning("本记录无需您确认，请重新查询！");
        return;
      }
      _self.$axios.post("/change/update/" + data.id)
        .then(function (res) {
          if ((res.data = 1)) {
            _self.showDialog = false;
            _self.$message.success("确认需求变更成功！");
            _self.changeAuditQuery();
          } else {
            _self.$message.warning("确认需求变更失败！");
            console.log(res);
          }
        })
        .catch(function (response) {
          _self.$notify.error("确认需求变更时发生程序错误！");
          console.log(response);
        });
    },

    auditConfirm(data) {
      this.$confirm("确定已知悉变更详情吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.saveChangeAudit(data);
        })
        .catch(() => {});
    },

    memberQuery(callback) {
      let _self = this;
      _self.queryLoading = true;
      commonQuery.memberQuery((result) => {
        _self.members = result.users;
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        if (typeof callback == "function") {
          callback();
        }
      });
    },

    namedUser(users) {
      let _self = this;
      let named = [];
      if (!users || users == null || users == '') {
        return '';
      }
      users.split(",").forEach(item => {
        let user = _self.members.find(d => {
          return d.value == parseInt(item);
        });
        if (user) {
          named.push(user.label);
        } else {
          named.push("已无权限");
        }
      });
      return named.toString().replace(/,/g, "，");
    },

    changeAuditQuery() {
      let _self = this;
      let changeTimeBegin = "",
        changeTimeEnd = "";
      if (_self.changeForm.changeTime && _self.changeForm.changeTime.length > 1) {
        changeTimeBegin = _self.changeForm.changeTime[0];
        changeTimeEnd = _self.changeForm.changeTime[1];
      }

      let queryParams = {
        changeStatus: _self.changeForm.changeStatus,
        changeUser: _self.changeForm.changeUser,
        changeTimeBegin: changeTimeBegin,
        changeTimeEnd: changeTimeEnd,
        pageNum: _self.currentPage,
        pageSize: _self.pageSize
      };
      if (_self.params.length == 0) {
        queryParams = {
          ...queryParams,
          reqId: _self.changeForm.reqId
        }
      } else {
        let parsedParam = _self.params[0]; //只支持单参数进入
        for (let prop in parsedParam) {
          queryParams = {
            ...queryParams,
            [prop]: parsedParam[prop]
          }
        }
        if (_self.$route.params.reqId) {
          _self.changeForm.reqId = _self.$route.params.reqId;
        }
      }
      _self.$axios({
          method: "post",
          url: "/change/audit_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: queryParams
        })
        .then(function (res) {
          _self.params.splice(0, _self.params.length);
          _self.tableData = eval(res.data.list);
          _self.tableData.forEach(item => {
            _self.$set(item, "statusName", item.changeStatus == 0 ? '已完成' : '确认中');
            _self.$set(item, "auditUserName", _self.namedUser(item.auditUser));
            _self.$set(item, "audittedUserName", _self.namedUser(item.audittedUser));
          });
          _self.pageInfo = res.data;
          setTimeout(() => {
            _self.queryChanged = false;
            _self.queryLoading = false;
          }, 200);
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          _self.queryLoading = false;
          console.log(response);
        });
    }
  }
};
</script>

<style>
.change-form {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.change-form .el-form-item .el-input,
.change-form .el-form-item .el-select {
  width: 180px;
}
</style>
