<template>
  <div class="root">

    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="el-icon-setting"></i> 系统配置</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog :close-on-click-modal="modalClose" title="用户授权" :visible.sync="showDialog" width="600px">
      <el-form :model="grfrom" size="small" :inline="false" label-width="100px" class="grant-form">
        <el-form-item label="角色" required>
          <el-select
            v-model="grfrom.roles"
            placeholder="支持多选"
            style="width:400px"
            filterable
            clearable
            multiple
            collapse-tags>
            <el-option v-for="opt in roles" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="roleGrant()" size="small">授权确认</el-button>
      </div>
    </el-dialog>

    <div class="priv-main">
      <el-form
        ref="form"
        :model="roleform"
        :inline="true"
        size="mini"
        @keydown.native.enter="userPrivQuery()"
        label-width="120px">
        <el-form-item label="用户账户/ 姓名">
          <el-select
            v-model="roleform.users.selected"
            @change="setGrantEditable()"
            placeholder="可输入过滤"
            filterable
            clearable
            :filter-method="filterUsers"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;marginleft:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="用户是否有效">
          <el-select v-model="roleform.isValid.selected" placeholder="请选择" clearable>
            <el-option v-for="opt in roleform.isValid.options" :value="opt" :key="opt" :label="opt"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色代码 / 名称">
          <el-select v-model="roleform.role" placeholder="请选择" filterable clearable>
            <el-option v-for="opt in roles" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="float:right;">
          <el-tooltip content="需要先选择用户" placement="bottom" effect="dark">
            <div class="priv-tips">
              <el-button v-no-more-click type="primary" icon="el-icon-circle-plus-outline" @click="beginGrant()" :disabled="grantDisabled">授权</el-button>
            </div>
          </el-tooltip>
          <el-tooltip content="需要先选择表单记录" placement="bottom" effect="dark">
            <div class="priv-tips">
              <el-button v-no-more-click type="primary" icon="el-icon-delete" @click="privBatchDelete()" :disabled="roleform.privs.length == 0">批量取消授权</el-button>
            </div>
          </el-tooltip>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="userPrivQuery()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="tableData"
        class="priv-table"
        :max-height="tableHeight"
        size="mini"
        @selection-change="selectionChange"
        stripe
        :border="showBorder"
        ref="privTable"
        v-loading="queryLoading"
        element-loading-text="查询中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column type="selection" width="80" align="center">
        </el-table-column>
        <el-table-column prop="productCode" label="产品代码" width="150" align="center" sortable>
        </el-table-column>
        <el-table-column prop="productName" label="产品名称" align="center" sortable>
        </el-table-column>
        <el-table-column prop="userAccount" label="用户账户" width="150" align="center" sortable>
        </el-table-column>
        <el-table-column prop="userName" label="用户姓名" align="center" sortable>
        </el-table-column>
        <el-table-column prop="roleCode" label="角色代码" width="150" align="center" sortable>
        </el-table-column>
        <el-table-column prop="roleName" label="角色名称" align="center" sortable>
        </el-table-column>
        <el-table-column width="70" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="danger" size="mini" @click="deletePriv(scope.row)">删除</el-button>
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
          @click="exportCSV('用户权限清单数据', 'privTable')">
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
import TableExport from '@/util/TableExport.js'
import commonQuery from "@/components/util/CommonQuery.vue";
export default {
  data: function () {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      tableData: [],
      queryLoading: false,
      memberFull: [],
      userOptions: [],
      pageInfo: {},
      tableHeight: bodyAviHeightNTab - 30 - 45,
      grantDisabled: true,
      roles: [],
      roleform: {
        users: {
          selected: "",
          options: []
        },
        isValid: {
          selected: "Y",
          options: ["Y", "N"]
        },
        role: "",
        privs: []
      },
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      grfrom: {
        roles: []
      },
      showDialog: false
    };
  },

  watch: {
    roleform: {
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
        this.userPrivQuery();
      }
    }
  },

  created() {
    let _self = this;
    _self.roles.splice(0, _self.roles.length);
    let userRoles = localStorage.getItem("userRoles");
    eval(userRoles).forEach(item => {
      _self.roles.push({
        value: item.roleId,
        label: item.roleCode + " - " + item.roleName
      });
    });
    _self.memberQuery(_self.userPrivQuery);
  },

  mounted() {
    this.queryChanged = false;
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
      let _self = this;
      if (_self.queryChanged == true) {
        _self.currentPage = 1;
      } else {
        _self.currentPage = current;
      }
      _self.userPrivQuery();
    },

    handleSizeChange(size) {
      let _self = this;
      _self.pageSize = size;
      _self.currentPage = 1;
      _self.userPrivQuery();
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    selectionChange(rows) {
      let _self = this;
      _self.roleform.privs = rows;
    },

    setGrantEditable() {
      let _self = this;
      if (null === _self.roleform.users.selected || _self.roleform.users.selected === "") {
        _self.grantDisabled = true;
      } else {
        _self.grantDisabled = false;
      }
    },

    beginGrant() {
      let _self = this;
      _self.showDialog = true;
      _self.grfrom.roles = [];
    },

    privBatchDelete() {
      let _self = this;
      _self.$confirm("确定要删除全部选中权限吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        })
        .then(() => {
          _self.savePrivBatchDelete();
        })
        .catch(() => {});
    },

    savePrivBatchDelete() {
      let _self = this;
      let privilleges = [];
      for (let i = 0; i < _self.roleform.privs.length; i++) {
        privilleges.push(_self.roleform.privs[i].privId);
      }
      _self.$axios({
          method: "post",
          url: "/priv/delete",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            privId: privilleges.toString()
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("权限移除成功！");
            _self.userPrivQuery();
          } else {
            _self.$notify.error("权限移除失败");
            console.log(response);
          }
        })
    },

    roleGrant() {
      let _self = this;
      if (_self.grfrom.roles.length === 0) {
        _self.$message.info("请选择角色！");
        return;
      }
      _self.$axios({
          method: "post",
          url: "/priv/update",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            roles: _self.grfrom.roles.toString(),
            operUser: _self.roleform.users.selected
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.showDialog = false;
            _self.$message.success("授权保存成功！");
            _self.userPrivQuery();
          } else {
            _self.$notify.error("授权保存失败");
            console.log(response);
          }
        })
    },

    deletePriv(data) {
      this.$confirm("确定要删除当前权限吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        })
        .then(() => {
          this.savePrivDelete(data.privId);
        })
    },

    savePrivDelete(privId) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/priv/delete",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            privId: privId
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("权限移除成功！");
            _self.userPrivQuery();
          } else {
            _self.$notify.error("权限移除失败");
            console.log(res);
          }
        })
    },

    memberQuery(callback) {
      let _self = this;
      commonQuery.memberQueryAll((result) => {
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        if (typeof callback == "function") {
          callback();
        }
      });
    },

    userPrivQuery() {
      let _self = this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/priv/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            productId: sessionStorage.productId,
            userId: _self.roleform.users.selected,
            roleId: _self.roleform.role,
            isValid: _self.roleform.isValid.selected,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function (res) {
          _self.tableData = eval(res.data.list);
          _self.pageInfo = res.data;
          setTimeout(() => {
            _self.queryChanged = false;
            _self.queryLoading = false;
          }, 200);
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          _self.queryChanged = false;
          _self.queryLoading = false;
          console.log(response);
        });
    }
  }
};
</script>

<style scoped>
.priv-main {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.root {
  width: 100% !important;
}

.priv-main .el-form-item .el-select,
.priv-main .el-form-item .el-input {
  width: 150px;
}

.priv-table {
  width: 100%;
}

.priv-tips {
  display: inline-block;
  margin-right: 10px;
}

.grant-form {
  height: 200px;
}
</style>
