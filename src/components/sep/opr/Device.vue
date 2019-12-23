<template>
  <div id="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-bug"></i> 基础设施
        </el-breadcrumb-item>
        <el-breadcrumb-item>测试设备管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog title="新增设备管理" :visible.sync="showDialog" width="1080px" class="new-device" :fullscreen="maximize1">
      <div slot="title">
        <span style="font-size:18px">新增设备管理</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize1=!maximize1">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize1==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize1==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form :model="cform" ref="ruledeviceForm" size="mini" :inline="true" label-width="110px">
        <el-form-item label="提交人" required>
          <el-input v-model="cform.userName" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="资产编码" prop="assetId" required>
          <el-input v-model="cform.assetId" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName" required>
          <el-input v-model="cform.deviceName" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="设备品牌" prop="brand" required>
          <el-input v-model="cform.brand" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="系统类型" prop="oprSys" required>
          <el-select v-model="cform.oprSys" placeholder="请选择" clearable>
            <el-option v-for="opt in oprSys" :value="opt.value" :key="opt.key" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备型号" prop="model">
          <el-input v-model="cform.model" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="设备颜色" prop="color">
          <el-input v-model="cform.color" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="系统版本" prop="versions">
          <el-input v-model="cform.versions" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="运行内存" prop="ram">
          <el-input v-model="cform.ram" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="存储内存" prop="rom">
          <el-input v-model="cform.rom" placeholder="请输入" clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="saveSubmitDevice('ruledeviceForm')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="设备信息更新" :visible.sync="editDialog" width="1080px" class="new-device" :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">设备信息更新</span>
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
        :model="eform"
        ref="ruledeviceFormEdit"
        size="mini"
        :inline="true"
        label-width="120px"
        class="edit-form">
        <el-form-item label="资产编码" prop="assetId" required>
          <el-input v-model="eform.assetId" placeholder="请输入" disabled></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName" required>
          <el-input v-model="eform.deviceName" placeholder="请输入" disabled></el-input>
        </el-form-item>
        <el-form-item label="设备品牌" prop="brand" required>
          <el-input v-model="eform.brand" placeholder="请输入" disabled></el-input>
        </el-form-item>
        <el-form-item label="系统类型" prop="oprSys" required>
          <el-input v-model="eform.oprSys" disabled></el-input>
        </el-form-item>
        <el-form-item label="设备型号" prop="model">
          <el-input v-model="eform.model" placeholder="请输入" disabled></el-input>
        </el-form-item>
        <el-form-item label="设备颜色" prop="color">
          <el-input v-model="eform.color" placeholder="请输入" disabled></el-input>
        </el-form-item>
        <el-form-item label="系统版本" prop="versions" required>
          <el-input v-model="eform.versions" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="运行内存" prop="ram">
          <el-input v-model="eform.ram" placeholder="请输入" disabled></el-input>
        </el-form-item>
        <el-form-item label="存储内存" prop="rom">
          <el-input v-model="eform.rom" placeholder="请输入" disabled></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="editDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="saveEditdevice('ruledeviceFormEdit')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <div class="device-form">
      <el-form v-model="deviceForm" :inline="true" size="mini" label-width="100px">
        <el-form-item label="资产编码" prop="assetId">
          <el-input v-model="deviceForm.assetId" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="deviceForm.deviceName" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="设备品牌" prop="brand">
          <el-input v-model="deviceForm.brand" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="系统类型" prop="oprSys">
          <el-select v-model="deviceForm.oprSys" placeholder="请选择" clearable>
            <el-option v-for="opt in oprSys" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="使用状态" prop="status">
          <el-select v-model="deviceForm.status" placeholder="请选择" clearable>
            <el-option v-for="opt in statuses" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="使用人">
          <el-input v-model="deviceForm.userName" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button v-no-more-click type="primary" icon="el-icon-circle-plus-outline" @click="showDialog=true" disabled>新增设备</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="queryDevice()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="tableDatas"
        :max-height="tableHeight"
        size="mini"
        stripe
        :border="showBorder"
        v-loading="queryLoading"
        element-loading-text="查询中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column prop="assetId" label="资产编码" min-width="15%" align="center" sortable></el-table-column>
        <el-table-column prop="deviceName" label="设备名称" min-width="15%" align="center" sortable></el-table-column>
        <el-table-column prop="brand" label="设备品牌" width="100" align="center" sortable></el-table-column>
        <el-table-column prop="versions" label="系统版本" min-width="15%" align="center" sortable></el-table-column>
        <el-table-column prop="color" label="设备颜色" width="90" align="center" sortable></el-table-column>
        <el-table-column prop="status" label="使用状态" width="90" align="center" sortable></el-table-column>
        <el-table-column prop="userName" label="现持有人" width="90" align="center" sortable></el-table-column>
        <el-table-column prop="rentDate" label="借用时间" width="140" align="center" sortable></el-table-column>
        <el-table-column type="expand" label="设备详情" width="80">
          <template slot-scope="scope">
            <el-form label-position="right" class="sepp-table-expand" inline size="mini">
              <el-form-item label="系统类型">
                <el-input v-model="scope.row.oprSys" disabled></el-input>
              </el-form-item>
              <el-form-item label="设备型号">
                <el-input v-model="scope.row.model" disabled></el-input>
              </el-form-item>
              <el-form-item label="运行内存">
                <el-input v-model="scope.row.ram + ' GB'" disabled></el-input>
              </el-form-item>
              <el-form-item label="存储内存">
                <el-input v-model="scope.row.rom + ' GB'" disabled></el-input>
              </el-form-item>
              <br>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="controllerName" label="管理员" width="80" align="center" sortable>
        </el-table-column>
        <el-table-column label="操作" width="190" align="center" sortable>
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="rentDevice(scope.row)" :disabled="checkRentDenied(scope.row)">借用</el-button>
            <el-button type="success" size="mini" @click="returnDevice(scope.row)" :disabled="checkReturnDenied(scope.row)">归还</el-button>
            <el-button type="warning" size="mini" @click="editDevice(scope.row)">编辑</el-button>
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
      </div>
    </div>
  </div>
</template>

<script>
import {
  dateFormat,
  pickOptions
} from "@/util/date.js";
export default {
  data: function () {
    return {
      tableHeight: bodyAviHeightNTab - 70 - 45,
      style: "",
      maximize: false,
      maximize1: false,
      tableDatas: [],
      pageInfo: {},
      baseHeight: "",
      userName: "",
      controller: "",
      showBorder: localStorage.showBorder && localStorage.showBorder == "true",
      queryLoading: false,
      showDialog: false,
      editDialog: false,
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      oprSys: [{
          value: "IOS",
          label: "IOS"
        },
        {
          value: "Android",
          label: "Android"
        }
      ],
      statuses: [{
          value: "已归还",
          label: "已归还"
        },
        {
          value: "已借出",
          label: "已借出"
        }
      ],

      deviceForm: {
        id: "",
        userName: "",
        assetId: "",
        oprSys: "",
        brand: "",
        deviceName: "",
        model: "",
        color: "",
        status: ""
      },
      cform: {
        id: "",
        userName: "",
        assetId: "",
        deviceName: "",
        brand: "",
        oprSys: "",
        model: "",
        versions: "",
        ram: "",
        rom: "",
        color: ""
      },
      eform: {
        id: "",
        assetId: "",
        model: "",
        color: "",
        versions: ""
      },
      returnform: {
        userName: ""
      }
    };
  },

  created() {
    let _self = this;
    _self.queryDevice();
  },

  watch: {
    deviceForm: {
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
        this.queryDevice();
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
      this.queryDevice();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.queryDevice();
    },

    checkRentDenied(data) {
      return data.status == "已借出";
    },

    checkReturnDenied(data) {
      return data.status == "已归还" || data.controllerName != sessionStorage.userName;
    },

    queryDevice() {
      let _self = this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/device/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            assetId: _self.deviceForm.assetId,
            oprSys: _self.deviceForm.oprSys,
            status: _self.deviceForm.status,
            brand: _self.deviceForm.brand,
            deviceName: _self.deviceForm.deviceName,
            userName: _self.deviceForm.userName,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function (res) {
          _self.tableDatas = eval(res.data.list);
          _self.pageInfo = res.data;
          _self.$nextTick(_ => {
            _self.queryChanged = false;
            setTimeout(() => {
              _self.queryLoading = false;
            }, 200);
          });
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    saveSubmitDevice(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.submitDevice();
        }
      });
    },

    submitDevice() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/device/create",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            userName: _self.cform.userName,
            assetId: _self.cform.assetId,
            deviceName: _self.cform.deviceName,
            brand: _self.cform.brand,
            oprSys: _self.cform.oprSys.selected,
            model: _self.cform.model,
            color: _self.cform.color,
            versions: _self.cform.versions,
            ram: _self.cform.ram,
            rom: _self.cform.rom
          }
        })
        .then(function (res) {
          _self.showDialog = false;
          if (res.data > 0) {
            _self.$notify.success("保存设备信息成功！");
          } else {
            _self.$notify.warning("保存设备信息失败！");
          }
          _self.queryDevice();
        })
        .catch(function (response) {
          _self.$notify.error("保存设备信息时发生程序错误！");
          console.log(response);
        });
    },

    rentDevice(data) {
      this.$confirm("确定借用当前设备吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info"
        })
        .then(() => {
          this.commitRentDevice(data);
        })
        .catch(() => {});
    },

    commitRentDevice(data) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/device/rent",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            userName: sessionStorage.userName,
            rentDate: dateFormat(new Date(), _self.datefmt),
            id: data.id
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$notify.success("设备借用成功！");
          } else {
            _self.$notify.warning("设备借用失败！");
          }
          _self.queryDevice();
        })
        .catch(function (response) {
          _self.$notify.error("设备借用时发生程序错误！");
          console.log(response);
        });
    },

    returnDevice(data) {
      this.$confirm("确定归还当前设备吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info"
        })
        .then(() => {
          this.saveReturnDevice(data);
        })
        .catch(() => {});
    },

    saveReturnDevice(data) {
      let _self = this;
      if (sessionStorage.userName != data.controllerName) {
        _self.$notify.error("您不是管理员，请不要随意操作！");
        return;
      }
      _self.$axios({
          method: "post",
          url: "/device/return",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            returnDate: dateFormat(new Date(), _self.datefmt),
            id: data.id
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$notify.success("设备归还成功！");
          } else {
            _self.$notify.warning("设备归还失败！");
          }
          _self.queryDevice();
        })
        .catch(function (response) {
          _self.$notify.error("设备归还时发生程序错误！");
          console.log(response);
        });
    },

    editDevice(data) {
      let _self = this;
      _self.editDialog = true;
      _self.eform = data;
    },

    saveEditdevice(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.updateDevice();
        }
      });
    },

    updateDevice() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/device/update",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            versions: _self.eform.versions,
            id: _self.eform.id
          }
        })
        .then(function (res) {
          _self.editDialog = false;
          if (res.data > 0) {
            _self.$notify.success("保存成功！");
          } else {
            _self.$notify.warning("保存失败！");
          }
          _self.queryDevice();
        })
        .catch(function (response) {
          _self.$notify.error("保存设备信息时发生程序错误！");
          console.log(response);
        });
    }
  }
};
</script>

<style>
.device-form {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.edit-form .el-input {
  width: 180px;
}
</style>
