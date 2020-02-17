<template>
  <div class="root">

    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-icon-product"></i> 产品配置</el-breadcrumb-item>
        <el-breadcrumb-item>产品分支</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showDialog" width="900px" :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">新建产品分支</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form
        :model="modform"
        size="small"
        :inline="true"
        :rules="modformRules"
        ref="ruledForm"
        label-width="110px"
        class="branch-form">
        <el-form-item label="分支名称" required prop="branchName">
          <el-input v-model="modform.branchName" placeholder="分支名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="是否有效" prop="isValid">
          <el-select v-model="modform.isValid" placeholder="请选择" disabled>
            <el-option v-for="opt in valids" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="resetForm('ruledForm')" size="small">重置</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkBranchCreate('ruledForm')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showDialogMod" width="900px" :fullscreen="maximize1">
      <div slot="title">
        <span style="font-size:18px">修改分支信息</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize1=!maximize1">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize1==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize1==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form
        :model="modform"
        size="small"
        :inline="true"
        :rules="modformRules"
        ref="ruledFormMod"
        label-width="110px"
        class="branch-form">
        <el-form-item label="分支名称" required prop="branchName">
          <el-input v-model="modform.branchName" placeholder="分支名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="是否有效" prop="isValid.selected">
          <el-select v-model="modform.isValid" placeholder="请选择" :disabled="modform.isValid == 1">
            <el-option v-for="opt in valids" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialogMod=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkSaveBranchEdit('ruledFormMod')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <div class="branch-main">
      <el-form
        ref="form"
        :model="form"
        :inline="true"
        size="mini"
        label-width="110px"
        @keydown.native.enter="branchQuery()">
        <el-form-item label="是否有效">
          <el-select v-model="form.isValid" placeholder="请选择" filterable clearable>
            <el-option v-for="opt in valids" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="float:right;">
          <el-button v-no-more-click type="primary" icon="el-icon-circle-plus-outline" @click="showDialog = true">新建分支</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="branchQuery()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="tableData"
        class="branch-table"
        :max-height="tableHeight"
        size="mini"
        stripe
        :border="showBorder"
        ref="branchTable"
        v-loading="queryLoading"
        element-loading-text="查询中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column prop="branchId" label="分支ID" align="center" sortable>
        </el-table-column>
        <el-table-column prop="branchName" label="分支名称" align="center" sortable>
        </el-table-column>
        <el-table-column label="是否有效" align="center" sortable>
          <template slot-scope="scope">
            <el-select v-model="scope.row.isValid" disabled>
              <el-option v-for="opt in valids" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column width="120" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="warning" size="mini" @click="editBranch(scope.row)">编辑</el-button>
            <el-button v-no-more-click type="danger" size="mini" @click="deleteBranch(scope.row)" :disabled="scope.row.isValid==0">禁用</el-button>
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
          @click="exportCSV('产品分支清单数据', 'branchTable')">
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
export default {
  data: function () {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      tableData: [],
      pageInfo: {},
      maximize: false,
      maximize1: false,
      queryLoading: false,
      tableHeight: bodyAviHeightNTab - 30 - 45,
      valids: [{
          value: 0,
          label: "否"
        },
        {
          value: 1,
          label: "是"
        }
      ],
      form: {
        isValid: 1
      },
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      showDialog: false,
      showDialogMod: false,
      currentBranchId: "",
      modform: {
        branchName: "",
        isValid: 1
      },
      modformRules: {
        branchName: [{
            required: true,
            message: "请输入分支名称",
            trigger: "blur"
          },
          {
            min: 2,
            max: 20,
            message: "长度在 2 到 20 个字",
            trigger: "blur"
          }
        ]
      }
    };
  },

  created() {
    let _self = this;
    _self.branchQuery();
  },

  watch: {
    showDialog: function () {
      if (this.showDialog) {
        this.modform.product = parseInt(sessionStorage.productId);
        this.$nextTick(_ => {
          if (this.$refs.ruledForm) {
            this.$refs.ruledForm.clearValidate();
          }
        });
      }
    },

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
        this.branchQuery();
      }
    }
  },

  methods: {
    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.branchQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.branchQuery();
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    checkBranchCreate(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.branchCreate();
        }
      });
    },

    checkSaveBranchEdit(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.saveBranchEdit();
        }
      });
    },

    branchCreate() {
      let _self = this;
      _self.$axios.post("/branch/create", {
          branchName: _self.modform.branchName,
          isValid: _self.modform.isValid
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.showDialog = false;
            _self.$message.success("创建产品分支保存成功！");
            _self.baseBranchesReQuery();
          } else {
            _self.$notify.error("创建产品分支保存失败");
            console.log(response);
          }
        })
    },

    baseBranchesReQuery(){
      let _self = this;
      _self.$axios.post("/base/branch/" + sessionStorage.productId)
        .then(function (res) {
          localStorage.setItem("productBranch", JSON.stringify(res.data));
          setTimeout(() => {
            window.location.reload();
          }, 500);
        })
    },

    branchQuery() {
      let _self = this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/branch/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            isValid: _self.form.isValid,
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
    },

    editBranch(data) {
      this.showDialogMod = true;
      this.currentBranchId = data.branchId;
      this.modform.branchName = data.branchName;
      this.modform.isValid = data.isValid;
      this.$nextTick(_ => {
        if (this.$refs.ruledFormMod) {
          this.$refs.ruledFormMod.clearValidate();
        }
      });
    },

    saveBranchEdit() {
      let _self = this;
      _self.$axios.post("/branch/update", {
          branchId: _self.currentBranchId,
          branchName: _self.modform.branchName,
          isValid: _self.modform.isValid
        })
        .then(function (res) {
          if ((res.data = 1)) {
            _self.showDialogMod = false;
            _self.$message.success("修改产品分支成功！");
            _self.baseBranchesReQuery();
          } else {
            _self.$notify.error("修改产品分支失败");
            console.log(response);
          }
        })
    },

    deleteBranch(data) {
      this.$confirm("确定要禁用当前记录吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        })
        .then(() => {
          this.saveBranchDelete(data.branchId);
        })
        .catch(() => {});
    },

    saveBranchDelete(branchId) {
      let _self = this;
      _self.$axios.post("/branch/delete/" + branchId)
        .then(function (res) {
          if ((res.data = 1)) {
            _self.$message.success("禁用成功！");
            _self.baseBranchesReQuery();
          } else {
            _self.$notify.error("禁用失败");
            console.log(response);
          }
        })
    }
  }
};
</script>

<style>
.branch-main {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  background-color: #fff;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.root {
  width: 100% !important;
}

.branch-main .el-form .el-input input,
.branch-main .el-form .el-select input {
  width: 180px;
}

.branch-form .el-form input,
.branch-main .el-form .long-select .el-input input {
  width: 300px;
}

.branch-form .summary,
.branch-form .summary input {
  width: 710px;
}

.branch-table {
  width: 100%;
}

.branch-table .cell .el-button {
  margin-left: 0;
}

.branch-table .cell {
  padding-left: 0;
}

.branch-desc .el-textarea__inner,
.branch-desc.is-disabled .el-textarea__inner {
  resize: none;
  border: none;
  color: #000;
  background-color: transparent;
  cursor: initial;
}
</style>
