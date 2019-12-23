<template>
  <div class="env-root" style="width: 100%">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-tech"></i> 基础设施</el-breadcrumb-item>
        <el-breadcrumb-item>环境信息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog :close-on-click-modal="modalClose" title="录入新环境信息" :visible.sync="showDialog" width="960px" :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">录入新环境信息</span>
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
        :model="editform"
        :rules="nFormRules"
        ref="ruledForm"
        size="mini"
        :inline="true"
        label-width="110px"
        class="env-eform">
        <el-form-item label="产品分支" prop="branchId" required>
          <el-select v-model="editform.branchId" placeholder="请选择产品分支">
            <el-option v-for="opt in prodBranchs" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="环境类型" prop="envType" required>
          <el-select v-model="editform.envType" placeholder="请选择环境类型">
            <el-option v-for="opt in envTypes" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="环境地址" prop="envUrl" required>
          <el-input v-model="editform.envUrl" placeholder="请输入环境地址" class="urls" clearable>环境地址</el-input>
        </el-form-item>
        <el-form-item label="组件实例" prop="instance" required>
          <el-select v-model="editform.instance" placeholder="请选择组件实例">
            <el-option v-for="opt in instances" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="job名称" prop="jobName">
          <el-input v-model="editform.jobName" placeholder="请输入job名称" class="urls" clearable>需求摘要</el-input>
        </el-form-item>
        <el-form-item label="JOB参数列表" prop="jobParams">
          <el-input v-model="editform.jobParams" placeholder="以逗号分隔" clearable>组件实例</el-input>
        </el-form-item>
        <br>
        <el-form-item label="二维码上传">
          <el-upload
            class="env-upload"
            ref="upload"
            :accept="editform.permitType"
            multiple
            drag
            :limit="1"
            :before-upload="beforeUpload"
            :on-exceed="fileExceeded"
            :on-success="uploadComplete"
            :on-remove="handleRemove"
            :file-list="editform.fileList"
            action=""
            :http-request="uploadAction">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">只支持jpeg/jpg/png格式图片，单个文件不超过2MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="resetForm('ruledForm')" size="small">重置</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkEnvCreate('ruledForm')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="修改环境信息" :visible.sync="showDialogMod" width="960px">
      <div slot="title">
        <span style="font-size:18px">修改环境信息</span>
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
        :model="editform"
        :rules="nFormRules"
        ref="ruledFormMod"
        size="mini"
        :inline="true"
        label-width="110px"
        class="env-eform"
        :fullscreen="maximize1">
        <el-form-item label="产品分支" prop="branchId" required>
          <el-select v-model="editform.branchId" placeholder="请选择产品分支">
            <el-option v-for="opt in prodBranchs" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="环境类型" prop="envType" required>
          <el-select v-model="editform.envType" placeholder="请选择环境类型">
            <el-option v-for="opt in envTypes" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="环境地址" prop="envUrl" required>
          <el-input v-model="editform.envUrl" placeholder="请输入环境地址" class="urls" clearable>环境地址</el-input>
        </el-form-item>
        <el-form-item label="组件实例" prop="instance" required>
          <el-select v-model="editform.instance" placeholder="请选择组件实例">
            <el-option v-for="opt in instances" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="job名称" prop="jobName">
          <el-input v-model="editform.jobName" placeholder="请输入job名称" class="urls" clearable>job名称</el-input>
        </el-form-item>
        <el-form-item label="JOB参数列表" prop="jobParams">
          <el-input v-model="editform.jobParams" placeholder="以逗号分隔" clearable>JOB参数列表</el-input>
        </el-form-item>
        <br>
        <el-form-item label="附件上传">
          <el-upload
            class="env-upload"
            ref="uploadMod"
            :accept="editform.permitType"
            multiple
            drag
            :limit="1"
            :before-upload="beforeUpload"
            :on-exceed="fileExceeded"
            :on-success="uploadComplete"
            :on-remove="handleRemoveMod"
            :file-list="editform.fileList"
            action=""
            :http-request="uploadAction">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">只支持jpeg/jpg/png格式图片，单个文件不超过2MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialogMod=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="saveEnvUpdate('ruledFormMod')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <div class="env-main">
      <el-form :model="qryform" :inline="true" size="mini" class="qry-form" @keydown.native.enter="envInfoQuery()">
        <el-form-item label="分支">
          <el-select v-model="qryform.branchId" placeholder="请选择" @change="queryInstance()" filterable clearable>
            <el-option v-for="opt in prodBranchs" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="环境类型">
          <el-select v-model="qryform.envType" placeholder="请选择" filterable clearable>
            <el-option v-for="opt in envTypes" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组件实例">
          <el-select v-model="qryform.instance" placeholder="请选择" filterable clearable>
            <el-option v-for="opt in instances" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item style="float:right">
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="envInfoQuery()">查询</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-circle-plus-outline" @click="createEnvInfo(),queryInstance()">录入新环境</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="tableData"
        :max-height="tableHeight"
        size="mini"
        stripe
        :border="showBorder"
        ref="envTable">
        <el-table-column prop="branchName" label="产品分支" width="140" align="center" sortable>
        </el-table-column>
        <el-table-column prop="envTypeName" label="环境类型" width="140" align="center" sortable>
        </el-table-column>
        <el-table-column prop="instance" label="组件实例" width="140" align="center" sortable>
        </el-table-column>
        <el-table-column prop="envUrl" label="环境地址" header-align="center">
        </el-table-column>
        <el-table-column type="expand" label="更多信息" width="80">
          <template slot-scope="scope">
            <el-form label-position="right" inline class="sepp-table-expand" size="mini">
              <el-form-item label="JOB链接">
                <el-input v-model="scope.row.jobName" class="urls" size="mini" disabled></el-input>
              </el-form-item>
              <el-form-item label="JOB参数列表">
                <el-input v-model="scope.row.jobParams" disabled></el-input>
              </el-form-item>
              <br>
              <el-form-item label="二维码">
                <el-upload
                  action="#"
                  v-if="!scope.row.noAttach"
                  class="env-imgs"
                  disabled
                  :file-list="scope.row.attachs"
                  list-type="picture-card">
                </el-upload>
                <span v-show="scope.row.noAttach">当前环境没有上传二维码</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column width="120" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="warning" size="mini" @click="editEnvInfo(scope.row),queryInstance()">编辑</el-button>
            <el-button v-no-more-click type="danger" size="mini" @click="delEnvinfo(scope.row)">删除</el-button>
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
          :total="pageInfo.total"></el-pagination>
        <el-button
          type="primary"
          class="el-icon-download export-btn"
          size="mini"
          :disabled="tableData.length == 0"
          plain
          @click="exportCSV('环境信息清单数据', 'envTable')">
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
      tableHeight: "",
      queryChanged: false,
      tableData: [],
      maximize: false,
      maximize1: false,
      pageInfo: "",
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      envTypes: [],
      prodBranchs: [],
      instances: [],
      qryform: {
        branchId: "",
        envType: "",
        instance: ""
      },
      showDialog: false,
      showDialogMod: false,
      currentEnvId: "",
      editform: {
        branchId: "",
        envType: "",
        instance: "",
        envUrl: "",
        jobName: "",
        jobParams: "",
        permitType: "image/*",
        fileList: [],
        attachs: [],
      },
      nFormRules: {
        'branchId': [{
          required: true,
          message: '请输入产品分支',
          trigger: 'blur'
        }, ],
        'envType': [{
          required: true,
          message: '请选择环境类型',
          trigger: 'change'
        }],
        'instance': [{
            required: true,
            message: '请选输入组件实例',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字',
            trigger: 'blur'
          }
        ]
      }
    };
  },

  watch: {
    qryform: {
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
        this.envInfoQuery();
      }
    }
  },

  created() {
    this.tableHeight = bodyAviHeightNTab - 70 - 45;

    this.envTypes.splice(0, this.envTypes.length);
    let environmentType = localStorage.getItem("environmentType");
    eval(environmentType).forEach(item => {
      this.envTypes.push({
        value: item.typeId,
        label: item.typeName
      });
    });

    this.prodBranchs.splice(0, this.prodBranchs.length);
    let productBranch = localStorage.getItem("productBranch");
    eval(productBranch).forEach(item => {
      this.prodBranchs.push({
        value: item.branchId,
        label: item.branchName
      });
    });
    this.envInfoQuery();
  },

  methods: {
    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.envInfoQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.envInfoQuery();
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    createEnvInfo() {
      this.showDialog = true;
      this.editform.envType = "";
      this.editform.branchId = "";
      this.editform.instance = "";
      this.editform.envUrl = "";
      this.editform.jobName = "";
      this.editform.jobParams = "";
      this.editform.fileList.splice(0, this.editform.fileList.length);
      this.$nextTick(_ => {
        if (this.$refs.ruledForm) {
          this.$refs.ruledForm.clearValidate();
        }
      });
    },

    checkEnvCreate(formName) {
      let _self = this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.saveEnvCreate();
        }
      });
    },

    uploadAction(params) {
      let _self = this;
      let file = params.file;
      let fileList = _self.editform.fileList || [];
      let refedUpload = _self.showDialog ? _self.$refs.upload : _self.$refs.uploadMod;

      if (file.name.indexOf("_V") > -1) {
        _self.$message.warning("请去除文件名中包含的字符串： _V");
        refedUpload.uploadFiles = fileList.filter(item => {
          return item.status == 'success'
        }) || [];
        return;
      }
      commonQuery.attachmentUpload(file, fileList, (res) => {
        _self.editform.fileList = res;
        _self.editform.attachs = res;
      })
    },

    saveEnvCreate() {
      let _self = this;
      let files = [];
      _self.editform.attachs.forEach(function (fs, i) {
        files.push(fs.response[0].id);
      });
      _self.$axios.post("/env/create", {
          branchId: _self.editform.branchId,
          envType: _self.editform.envType,
          instance: _self.editform.instance,
          envUrl: _self.editform.envUrl,
          jobName: _self.editform.jobName,
          jobParams: _self.editform.jobParams,
          qrCode: files.toString()
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.showDialog = false;
            _self.$message.success("保存成功！");
            _self.envInfoQuery();
          } else {
            _self.$message.warning("保存失败");
            console.log(res);
          }
        })
    },

    editEnvInfo(data) {
      this.showDialogMod = true;
      this.currentEnvId = data.id;
      this.editform.envType = data.envType;
      this.editform.branchId = data.branchId;
      this.editform.instance = data.instance;
      this.editform.envUrl = data.envUrl;
      this.editform.jobName = data.jobName;
      this.editform.jobParams = data.jobParams;
      this.editform.fileList = this.getAttach(data.qrCode).attachs;
      this.$nextTick(_ => {
        if (this.$refs.ruledFormMod) {
          this.$refs.ruledFormMod.clearValidate();
        }
      });
    },

    saveEnvUpdate(formName) {
      let _self = this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.saveEditRequest();
        }
      });
    },

    saveEditRequest() {
      let _self = this;
      let files = [];
      _self.editform.attachs.forEach(function (fs, i) {
        if (fs.response) {
          files.push(fs.response[0].id);
        } else {
          files.push(fs.id);
        }
      });
      _self.$axios.post("/env/update", {
          id: _self.currentEnvId,
          branchId: _self.editform.branchId,
          envType: _self.editform.envType,
          instance: _self.editform.instance,
          envUrl: _self.editform.envUrl,
          jobName: _self.editform.jobName,
          jobParams: _self.editform.jobParams,
          qrCode: files.toString()
        })
        .then(function (res) {
          if (res.data == 1) {
            _self.$message.success("环境信息修改成功！");
            _self.showDialogMod = false;
            _self.envInfoQuery();
          } else {
            _self.$message.info("保存失败");
            console.log(res);
          }
        })
    },

    delEnvinfo(row) {
      this.$confirm("确定要删除当前记录吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        })
        .then(() => {
          this.saveDelEnvinfo(row.id);
        })
        .catch(() => {});
    },

    saveDelEnvinfo(id) {
      let _self = this;
      _self.$axios.post("/env/delete/" + id)
        .then(function (res) {
          if ((res.data = 1)) {
            _self.$message.success("删除成功！");
            _self.envInfoQuery();
          } else {
            _self.$notify.error("删除失败");
            console.log(res);
          }
        })
    },

    queryInstance() {
      let _self = this;
      _self.$axios.post("/env/instance_query/" + sessionStorage.productId)
        .then(function (res) {
          let json = eval(res.data);
          _self.instances.splice(0, _self.instances.length);
          for (let i = 0; i < json.length; i++) {
            _self.instances.push({
              value: json[i],
              label: json[i]
            });
          }
        })
    },

    envInfoQuery() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/env/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            branchId: _self.qryform.branchId,
            envType: _self.qryform.envType,
            instance: _self.qryform.instance,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function (res) {
          let json = eval(res.data.list);
          _self.pageInfo = res.data;
          let attach = {};
          let result = [];
          for (let i = 0; i < json.length; i++) {
            attach = _self.getAttach(json[i].qrCode);
            if (!json[i].noAttach) {
              _self.$set(json[i], "noAttach", attach.noAttach);
            }
            if (!json[i].attachs) {
              _self.$set(json[i], "attachs", attach.attachs);
            }
            result.push(json[i]);
          }
          _self.queryChanged = false;
          _self.tableData = result;
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    sortGroup(json, idKey, childKey) {
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
          [childKey]: children
        });
      }
      return result;
    },

    beforeUpload(file) {
      const permitSize = file.size / 1024 / 1024 < 2;
      const permitType =
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png";

      if (!permitSize) {
        this.$message.info("图片大小不能超过 2MB！");
        return false;
      }
      if (!permitType) {
        this.$message.info("请上传 JPG、JPEG、PNG 格式！");
        return false;
      }
    },

    fileExceeded(files, fileList) {
      this.$message.info("文件个数超出限制！");
      return;
    },

    uploadComplete(res, file, fileList) {
      let _self = this;
      _self.editform.attachs = fileList;
      _self.editform.fileList = fileList;
    },

    handleRemoveMod(file, fileList) {
      let _self = this;
      _self.$message.success("文件删除成功！");
      _self.editform.attachs = fileList;
      _self.editform.fileList = fileList;
    },

    handleRemove(file, fileList) {
      let _self = this;
      commonQuery.attachmentDelete(file, fileList, (res) => {
        _self.editform.fileList = res;
      })
    },

    getAttach(attachId) {
      if (commonQuery.isNull(attachId)) {
        return {
          attachs: [],
          noAttach: true
        };
      }

      return {
        attachs: commonQuery.attachmentQuery(attachId),
        noAttach: false
      };
    }
  }
};
</script>

<style>
.env-main {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.env-root .qry-form .el-form-item {
  margin-left: 30px;
}

.env-eform .el-form-item .el-input input,
.env-root .qry-form .el-form-item .el-input input {
  width: 155px;
  vertical-align: middle;
}

.urls,
.urls input {
  width: 425px !important;
}

.env-upload {
  width: 425px;
}

.env-upload .el-upload--text {
  width: 100%;
  height: 120px;
}

.env-upload .el-upload-dragger {
  width: 100%;
  height: 120px;
}

.env-upload .el-upload-dragger .el-icon-upload {
  margin: 15px 0 15px;
  font-size: 55px;
}

.env-imgs {
  width: 90%;
}

.env-imgs .el-upload-list__item {
  width: 200px;
  height: 200px;
}

.env-imgs .el-upload--picture-card,
.env-imgs .el-upload-list__item-status-label {
  display: none !important;
}
</style>
