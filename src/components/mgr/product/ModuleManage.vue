<template>
  <div class="root">

    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-icon-product"></i> 产品配置</el-breadcrumb-item>
        <el-breadcrumb-item>产品模块</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog :close-on-click-modal="modalClose" title="新建模块" :visible.sync="showDialog" width="900px" :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">新建模块</span>
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
        class="module-form">
        <el-form-item label="模块名称" required prop="moduleName">
          <el-input v-model="modform.moduleName" placeholder="模块名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="是否有效" prop="isValid.selected">
          <el-select v-model="modform.isValid.selected" placeholder="请选择" disabled>
            <el-option v-for="opt in modform.isValid.opts" :value="opt" :key="opt" :label="opt"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品负责人" prop="pdResponser" required>
          <el-select
            v-model="modform.pdResponser"
            placeholder="请选择"
            filterable
            clearable
            class="config-short"
            :filter-method="filterUsers1"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions1" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="开发负责人" prop="devResponser" required>
          <el-select
            v-model="modform.devResponser"
            placeholder="请选择"
            filterable
            clearable
            class="config-short"
            :filter-method="filterUsers2"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions2" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="测试负责人" prop="testResponser" required>
          <el-select
            v-model="modform.testResponser"
            placeholder="请选择"
            filterable
            clearable
            class="config-short"
            :filter-method="filterUsers3"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions3" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item label="模块描述" prop="moduleDesc">
          <el-input
            v-model="modform.moduleDesc"
            class="summary"
            type="textarea"
            :rows="4"
            :maxlength="2000"
            show-word-limit></el-input>
        </el-form-item>
        <br>
        <el-form-item label="模块代码包" prop="codePackage">
          <el-input
            v-model="modform.codePackage"
            class="summary"
            type="textarea"
            :rows="6"
            :maxlength="2000"
            show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="resetForm('ruledForm')" size="small">重置</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkModuleCreate('ruledForm')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="修改模块" :visible.sync="showDialogMod" width="900px" :fullscreen="maximize1">
      <div slot="title">
        <span style="font-size:18px">修改模块信息</span>
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
        class="module-form">
        <el-form-item label="模块名称" required prop="moduleName">
          <el-input v-model="modform.moduleName" placeholder="模块名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="是否有效" prop="isValid.selected">
          <el-select v-model="modform.isValid.selected" placeholder="请选择" :disabled="modform.isValid.selected==='Y'">
            <el-option v-for="opt in modform.isValid.opts" :value="opt" :key="opt" :label="opt"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品负责人" prop="pdResponser" required>
          <el-select
            v-model="modform.pdResponser"
            placeholder="请选择"
            filterable
            clearable
            class="config-short"
            :filter-method="filterUsers4"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions4" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="开发负责人" prop="devResponser" required>
          <el-select
            v-model="modform.devResponser"
            placeholder="请选择"
            filterable
            clearable
            class="config-short"
            :filter-method="filterUsers5"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions5" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="测试负责人" prop="testResponser" required>
          <el-select
            v-model="modform.testResponser"
            placeholder="请选择"
            filterable
            clearable
            class="config-short"
            :filter-method="filterUsers6"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions6" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item label="模块描述" prop="moduleDesc">
          <el-input
            v-model="modform.moduleDesc"
            class="summary"
            type="textarea"
            :rows="4"
            :maxlength="2000"
            show-word-limit></el-input>
        </el-form-item>
        <br>
        <el-form-item label="模块代码包" prop="codePackage">
          <el-input
            v-model="modform.codePackage"
            class="summary"
            type="textarea"
            :rows="6"
            :maxlength="2000"
            show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialogMod=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkSaveModuleEdit('ruledFormMod')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <div class="module-main">
      <el-form
        ref="form"
        :model="form"
        :inline="true"
        size="mini"
        label-width="110px"
        @keydown.native.enter="moduleQuery()">
        <el-form-item label="模块名称" clearable>
          <el-input v-model="form.moduleName" placeholder="至少3个字，右模糊" clearable></el-input>
        </el-form-item>
        <el-form-item label="是否有效">
          <el-select v-model="form.isValid.selected" placeholder="请选择" filterable clearable>
            <el-option v-for="opt in form.isValid.opts" :value="opt" :key="opt" :label="opt"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="float:right;">
          <el-button v-no-more-click type="primary" icon="el-icon-circle-plus-outline" @click="showDialog = true">新建模块</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="moduleQuery()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="tableData"
        class="module-table"
        :max-height="tableHeight"
        size="mini"
        stripe
        :border="showBorder"
        ref="moduleTable"
        v-loading="queryLoading"
        element-loading-text="查询中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column type="index" width="50" label="序号" align="center">
        </el-table-column>
        <el-table-column
          prop="productCode"
          label="产品编号"
          width="120"
          align="center"
          sortable
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="moduleName" label="模块名称" width="120" align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="proderName" label="产品负责人" width="80" align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="deverName" label="开发负责人" width="80" align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="testerName" label="测试负责人" width="80" align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="isValid" label="是否有效" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="moduleDesc" label="模块描述" header-align="center" min-width="40%">
          <template slot-scope="scope">
            <el-input type="textarea" v-model="scope.row.moduleDesc" disabled class="module-desc" :rows="getLines(scope.row.moduleDesc)"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="codePackage" label="模块代码包" header-align="center">
          <template slot-scope="scope">
            <el-input type="textarea" v-model="scope.row.codePackage" disabled class="module-desc" :rows="getLines(scope.row.codePackage)"></el-input>
          </template>
        </el-table-column>
        <el-table-column width="120" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="warning" size="mini" @click="editModule(scope.row)">编辑</el-button>
            <el-button v-no-more-click type="danger" size="mini" @click="deleteModule(scope.row)" :disabled="scope.row.isValid=='N'">禁用</el-button>
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
          @click="exportCSV('产品模块清单数据', 'moduleTable')">
          导出CSV
        </el-button>
        <div class="export-tips">导出CSV文件请使用<span>新版本</span>MS Office或者WPS表格工具打开</div>
      </div>
    </div>
  </div>
</template>

<script>
import TableExport from '@/util/TableExport.js'
import commonQuery from "@/components/util/CommonQuery.vue";
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
      products: [],
      memberFull: [],
      userOptions1: [],
      userOptions2: [],
      userOptions3: [],
      userOptions4: [],
      userOptions5: [],
      userOptions6: [],
      form: {
        moduleName: "",
        isValid: {
          selected: "Y",
          opts: ["Y", "N"]
        }
      },
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      showDialog: false,
      showDialogMod: false,
      currentModuleId: "",
      modform: {
        moduleName: "",
        pdResponser: "",
        devResponser: "",
        testResponser: "",
        moduleDesc: "",
        codePackage: "",
        isValid: {
          selected: "Y",
          opts: ["Y", "N"]
        }
      },
      modformRules: {
        "pdResponser": [{
          required: true,
          message: "请选择产品负责人",
          trigger: "change"
        }],
        "devResponser": [{
          required: true,
          message: "请选择开发负责人",
          trigger: "change"
        }],
        "testResponser": [{
          required: true,
          message: "请选择测试负责人",
          trigger: "change"
        }],
        moduleName: [{
            required: true,
            message: "请输入模块名称",
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
    eval(localStorage.getItem("products")).forEach(e => {
      _self.products.push({
        value: e.productId,
        code: e.productCode,
        label: e.productCode + " - " + e.productName
      });
    });
    _self.memberQuery();
    _self.moduleQuery();
  },

  watch: {
    showDialog: function () {
      if (this.showDialog) {
        if (this.$refs.ruledForm) {
          this.$refs.ruledForm.clearValidate();
        }
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
        this.moduleQuery();
      }
    }
  },

  methods: {
    resetFilterText() {
      let _self = this;
      _self.userOptions1 = _self.memberFull;
      _self.userOptions2 = _self.memberFull;
      _self.userOptions3 = _self.memberFull;
      _self.userOptions4 = _self.memberFull;
      _self.userOptions5 = _self.memberFull;
      _self.userOptions6 = _self.memberFull;
    },

    filterUsers1(val) {
      let _self = this;
      _self.userOptions1 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers2(val) {
      let _self = this;
      _self.userOptions2 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers3(val) {
      let _self = this;
      _self.userOptions3 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers4(val) {
      let _self = this;
      _self.userOptions4 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers5(val) {
      let _self = this;
      _self.userOptions5 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers6(val) {
      let _self = this;
      _self.userOptions6 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    memberQuery(callback) {
      let _self = this;
      commonQuery.memberQuery((result) => {
        _self.user = result.users;
        _self.memberFull = result.usersFull;
        _self.userOptions1 = result.usersFull;
        _self.userOptions2 = result.usersFull;
        _self.userOptions3 = result.usersFull;
        _self.userOptions4 = result.usersFull;
        _self.userOptions5 = result.usersFull;
        _self.userOptions6 = result.usersFull;
        if (typeof callback == "function") {
          callback();
        }
      });
    },

    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.moduleQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.moduleQuery();
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    getLines(data) {
      if (!data) {
        return 1;
      }
      let lines = data.split(/\n/).length;
      return lines > 5 ? 5 : lines;
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    checkModuleCreate(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.moduleCreate();
        }
      });
    },

    checkSaveModuleEdit(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.saveModuleEdit();
        }
      });
    },

    moduleCreate() {
      let _self = this;
      _self.$axios.post("/module/create", {
          productId: sessionStorage.productId,
          moduleName: _self.modform.moduleName,
          pdResponser: _self.modform.pdResponser,
          devResponser: _self.modform.devResponser,
          testResponser: _self.modform.testResponser,
          moduleDesc: _self.modform.moduleDesc,
          codePackage: _self.modform.codePackage
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.showDialog = false;
            _self.$message.success("保存成功！");
            _self.moduleQuery();
          } else {
            _self.$notify.error("保存失败");
            console.log(response);
          }
        })
    },

    moduleQuery() {
      let _self = this;
      _self.queryLoading = true;
      if (_self.form.moduleName != "" && _self.form.moduleName.length < 3) {
        _self.$message.info("至少输入3个字或者不输入！");
        _self.queryLoading = false;
        return;
      }
      _self.$axios({
          method: "post",
          url: "/module/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            moduleName: _self.form.moduleName,
            isValid: _self.form.isValid.selected,
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

    editModule(data) {
      this.showDialogMod = true;
      this.currentModuleId = data.moduleId;
      this.modform.moduleName = data.moduleName;
      this.modform.pdResponser = data.pdResponser;
      this.modform.devResponser = data.devResponser;
      this.modform.testResponser = data.testResponser;
      this.modform.isValid.selected = data.isValid;
      this.modform.moduleDesc = data.moduleDesc;
      this.modform.codePackage = data.codePackage;
      if (this.$refs.ruledFormMod) {
        this.$refs.ruledFormMod.clearValidate();
      }
    },

    saveModuleEdit() {
      let _self = this;
      _self.$axios.post("/module/update", {
          productId: sessionStorage.productId,
          pdResponser: _self.modform.pdResponser,
          devResponser: _self.modform.devResponser,
          testResponser: _self.modform.testResponser,
          moduleId: _self.currentModuleId,
          moduleName: _self.modform.moduleName,
          isValid: _self.modform.isValid.selected,
          moduleDesc: _self.modform.moduleDesc,
          codePackage: _self.modform.codePackage
        })
        .then(function (res) {
          if ((res.data = 1)) {
            _self.showDialogMod = false;
            _self.$message.success("修改成功！");
            _self.moduleQuery();
          } else {
            _self.$notify.error("修改失败");
            console.log(response);
          }
        })
    },

    deleteModule(data) {
      this.$confirm("确定要删除当前记录吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        })
        .then(() => {
          this.saveModuleDelete(data.moduleId);
        })
    },

    saveModuleDelete(moduleId) {
      let _self = this;
      _self.$axios.post("/module/delete/" + moduleId)
        .then(function (res) {
          if ((res.data = 1)) {
            _self.$message.success("删除成功！");
            _self.moduleQuery();
          } else {
            _self.$notify.error("删除失败");
            console.log(response);
          }
        })
    }
  }
};
</script>

<style>
.module-main {
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

.module-main .el-form .el-input input,
.module-main .el-form .el-select input {
  width: 180px;
}

.module-form .el-input,
.module-form .el-select {
  width: 300px;
}

.module-form .summary,
.module-form .summary input {
  width: 710px;
}

.module-table {
  width: 100%;
}

.module-table .cell .el-button {
  margin-left: 0;
}

.module-table .cell {
  padding-left: 0;
}

.module-desc .el-textarea__inner,
.module-desc.is-disabled .el-textarea__inner {
  resize: none;
  border: none;
  color: #000;
  background-color: transparent;
  cursor: initial;
}
</style>
