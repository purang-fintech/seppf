<template>
  <div class="instance-root" style="width: 100%">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-tech"></i> 基础设施
        </el-breadcrumb-item>
        <el-breadcrumb-item>实例列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>实例列表</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="addInstanceDialog">添加实例</el-button>
      </div>
      <el-table :data="instances" size="mini" class="instances" :max-height="tableHeight" stripe>
        <el-table-column label="实例名" width="180" align="center">
          <template slot-scope="scope">
            <span style="color: #3ab4d7;font-weight: 600;cursor:pointer">{{scope.row.instance}}</span>
          </template>
        </el-table-column>
        <el-table-column label="实例类型" width="70" align="center">
          <template slot-scope="scope">
            <div v-for="type in instanceTypes">
              <span v-if="type.name == scope.row.type">
                {{type.value}}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="创建人" align="center">
        </el-table-column>
        <el-table-column prop="projectName"  label="项目名称" align="center">
        </el-table-column>
        <el-table-column prop="repoUrl"  label="仓库地址" align="center">
        </el-table-column>
        <el-table-column prop="namespace"  label="命名空间" align="center">
        </el-table-column>
        <el-table-column prop="description" label="描述" align="center">
        </el-table-column>
        <el-table-column prop="updatedDate" label="修改时间" align="center">
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" @click="editInstance(scope.row)" type="text" class="oper-button" style="color:#DEAF6C"></el-button>
            <el-tooltip effect="dark" content="环境配置" placement="bottom">
              <el-button icon="el-icon-tickets" @click="$router.push({ name: 'instanceEnv', query: { 'instance': scope.row.instance ,'instanceType':scope.row.type} })" type="text" class="oper-button" style="color:#3AB4D7"></el-button>
            </el-tooltip>
            <el-button icon="el-icon-delete" @click="deleteInstanceConfirm(scope.row)" type="text" class="oper-button" style="color:#EE6F6F"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加或修改-->
    <el-dialog width="40%" :title="instanceFormTitle" :visible.sync="dialogInstanceVisible" :close-on-click-modal="modalClose" @close="clearForm('instanceForm')">
      <el-form label-width="100px" :model="instanceForm" ref="instanceForm" :rules="rules" class="demo-ruleForm">
        <el-form-item label="实例名" prop="instance" required>
          <el-input v-if="updateInstanceProp" disabled v-model="instanceForm.instance" placeholder="实例名" style="width:95%"></el-input>
          <el-input v-if="!updateInstanceProp" v-model="instanceForm.instance" placeholder="实例名" style="width:95%"></el-input>
        </el-form-item>
        <el-form-item label="实例类型" prop="type" required>
          <el-select v-model="instanceForm.type" placeholder="实例类型" style="width:95%">
            <el-option v-for="type in instanceTypes" :label="type.value" :value="type.name" :key="type.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称" prop="description" >
          <el-input   v-model="instanceForm.projectName"  placeholder="项目的名称"  style="width:95%"></el-input>
        </el-form-item>
        <el-form-item label="仓库地址" prop="repoUrl"  >
          <el-select v-model="instanceForm.repoUrl" placeholder="实例类型" style="width:95%">
            <el-option v-for="item in repoUrls" :label="item.repoUrl" :value="item.repoUrl" :key="item.repoUrl"></el-option>
          </el-select>
        </el-form-item>
          <el-form-item label="命名空间" prop="namespace"  >
            <el-input   v-model="instanceForm.namespace"  placeholder="请填写项目命名空间（项目路径）"  style="width:95%"></el-input>
          </el-form-item>

        <el-form-item label="构建参数" prop="params" required>
          <el-input v-model="instanceForm.params" placeholder="多参数请用逗号,隔开" style="width:95%"></el-input>
        </el-form-item>
        <el-form-item label="实例描述" prop="description" >
          <el-input type="textarea" v-model="instanceForm.description" :maxlength="2000" :rows="4" style="width:95%"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogInstanceVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveInstanceAndValid('instanceForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Instance",
  data() {
    var checkInstance = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('实例名称不能为空'));
      }
      let reg = /^[a-zA-Z]+$/;
      if (!reg.test(value)) {
        return callback(new Error('实例名称必须为英文'));
      }
      if (value.length > 100) {
        return callback(new Error('字符数超过了100个字符'));
      }
      this.checkInstanceRepeat(value).then(res => {
        if (res.data && this.addInstanceProp) return callback(new Error('实例名称不能重复'));
        return callback();
      });
    };

    return {
      modalClose: sessionStorage.dialogAutoClose == 1,
      instanceForm: {
        id: null,
        instance: null,
        type: null,
        repoUrl:null,
        projectName: null,
        namespace:null,
        description: null,
        params: null
      },
      tableHeight: "",
      addInstanceProp: false,
      updateInstanceProp: false,
      instanceTypes: [],
      projectName:'',
      namespace:'',
      instanceFormTitle: '',
      dialogInstanceVisible: false,
      instances: [],
      repoUrls:[],
      rules: {
        instance: [{
          validator: checkInstance,
          trigger: 'blur'
        }],
        type: [{
          required: true,
          message: '请选择实例类型',
          trigger: 'change'
        }]
      },
    };
  },

  created() {
    this.tableHeight = bodyAviHeightNTab - 55;
    this.listInstances();
    this.listInstanceTypes();

  },

  methods: {
    deleteInstanceConfirm(row) {
      this.$confirm('此操作将永久删除该实例, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.deleteInstance(row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    deleteInstance(row) {
      let _self = this;
      _self.$axios.delete("/instances/" + row.instance).then(resp => {
        _self.$message({
          type: 'success',
          message: '删除成功'
        });
        _self.listInstances();
      })
    },

    clearForm(form) {
      this.dialogInstanceVisible = false;
      this.$refs[form].resetFields(); //将form表单重置
      this.instanceForm = {
        id: null,
        instance: null,
        description: null,
        type: null,
        params: null,
      };
    },

    editInstance(row) {
      this.listGitInfo();
      this.updateInstanceProp = true;
      this.addInstanceProp = false;
      this.instanceFormTitle = '修改实例';
      this.dialogInstanceVisible = true;
      this.instanceForm.description = row.description;
      this.instanceForm.instance = row.instance;
      this.instanceForm.projectName = row.projectName;
      this.instanceForm.namespace = row.namespace;
      this.instanceForm.repoUrl = row.repoUrl;
      this.instanceForm.type = row.type;
      this.instanceForm.id = row.id;
      this.instanceForm.params = row.params;
    },

    checkInstanceRepeat(value) {
      return this.$axios.get("/instances/validator/" + value)
    },

    listInstanceTypes() {
      let _self = this;
      _self.$axios.get("/instances/types", {})
        .then(res => {
          _self.instanceTypes = res.data;
        })
    },

    listGitInfo() {
      let _self = this;
      _self.$axios.get("/gitInfo", {})
        .then(res => {
          _self.repoUrls = res.data;
        })
    },

    addInstanceDialog() {
      this.updateInstanceProp = false;
      this.addInstanceProp = true;
      this.instanceFormTitle = '添加实例';
      this.dialogInstanceVisible = true;
      this.listGitInfo();
    },

    saveInstanceAndValid(instanceForm) {
      let _self = this;
      _self.$refs[instanceForm].validate((valid) => {
        if (!valid) {
          return;
        } else {
          if (_self.addInstanceProp) {
            _self.saveInstance();
          } else {
            _self.updateInstance();
          }
        }
      });
    },

    saveInstance() {
      let _self = this;
      _self.$axios.post("/instances/create", {
          instance: _self.instanceForm.instance,
          description: _self.instanceForm.description,
          projectName:_self.instanceForm.projectName,
          repoUrl:_self.instanceForm.repoUrl,
          namespace:_self.instanceForm.namespace,
          type: _self.instanceForm.type,
          params: _self.instanceForm.params
        })
        .then(res => {
          _self.$message({
            type: 'success',
            message: '添加实例成功'
          });
          _self.dialogInstanceVisible = false;
          _self.listInstances();
        })
    },

    updateInstance() {
      let _self = this;
      _self.$axios.post("/instances/update", {
          instance: _self.instanceForm.instance,
          description: _self.instanceForm.description,
          projectName:_self.instanceForm.projectName,
          repoUrl:_self.instanceForm.repoUrl,
          namespace:_self.instanceForm.namespace,
          type: _self.instanceForm.type,
          id: _self.instanceForm.id,
          params: _self.instanceForm.params
        })
        .then(res => {
          _self.$message({
            type: 'success',
            message: '修改实例成功'
          });
          _self.dialogInstanceVisible = false;
          _self.listInstances();
        })
    },

    listInstances() {
      let _self = this;
      _self.$axios.get("/instances", {})
        .then(res => {
          _self.instances = res.data;
        })
    },
  }
}
</script>

<style>
.instances .el-table__body td .cell {
  height: 40px;
  line-height: 40px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.oper-button+.oper-button {
  margin-left: 5px;
}

.oper-button {
  padding: 0;
  background-color: transparent !important;
  border: none;
  font-size: 16px;
}

.oper-button:hover {
  color: #000;
  background-color: transparent !important;
}

.clearfix:after {
  clear: both
}

  .box-card {
    width: 100%;
  }
</style>
