<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>资源配置</span>
        <el-button v-has="['SEPP']" style="float: right; padding: 3px 0" type="text" @click="addResource">添加
        </el-button>
      </div>
      <el-table :data="resources" style="width: 100%">
        <el-table-column prop="resourceDesc" label="资源名" width="180" align="center">
        </el-table-column>
        <el-table-column prop="componentName" label="组件名" width="180" align="center">
        </el-table-column>
        <el-table-column prop="authId" label="组件id" align="center">
        </el-table-column>
        <el-table-column prop="requestUrl" label="接口" align="center">
        </el-table-column>
        <el-table-column prop="requestMethod" label="接口类型" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.requestMethod == 'POST' " style="text-align:center">
              <el-tag type="success">{{scope.row.requestMethod}}</el-tag>
            </div>
            <div v-if="scope.row.requestMethod == 'DELETE' " style="text-align:center">
              <el-tag type="danger">{{scope.row.requestMethod}}</el-tag>
            </div>
            <div v-if="scope.row.requestMethod == 'GET' " style="text-align:center">
              <el-tag>{{scope.row.requestMethod}}</el-tag>
            </div>
            <div v-if="scope.row.requestMethod == 'PUT' " style="text-align:center">
              <el-tag type="warning">{{scope.row.requestMethod}}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="roles" label="角色" align="center">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.roles" placement="bottom" effect="light">
              <span>{{scope.row.roles}}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="修改人" align="center">
        </el-table-column>
        <el-table-column prop="isValid" label="是否生效" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.isValid" style="text-align:center">
              <el-tag type="success">有效</el-tag>
            </div>
            <div v-else style="text-align:center">
              <el-tag type="info">无效</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="updatedDate" label="修改日期" align="center">
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              v-has="['SEPP']"
              icon="el-icon-edit"
              @click="editResourceConfig(scope.row)"
              type="text"
              class="oper-button"
              style="color:#DEAF6C"></el-button>
            <el-button
              v-auth="{id:'deleteResource',component:'ResourceConfig'}"
              icon="el-icon-delete"
              @click="deleteResourceConfig(scope.row)"
              type="text"
              class="oper-button"
              style="color:#EE6F6F"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page-set" style="margin: 10px 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[1, 20, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>

    <!--资源添加修改-->
    <el-dialog title="资源配置" :visible.sync="dialogResourceVisible" width="30%">
      <el-form ref="form" :model="resourceConfig" label-width="80px">
        <el-form-item label="资源描述">
          <el-input v-model="resourceConfig.resourceDesc"></el-input>
        </el-form-item>
        <el-form-item label="组件名">
          <el-input v-model="resourceConfig.componentName"></el-input>
        </el-form-item>
        <el-form-item label="组件id">
          <el-input v-model="resourceConfig.authId"></el-input>
        </el-form-item>
        <el-form-item label="接口">
          <el-input v-model="resourceConfig.requestUrl"></el-input>
        </el-form-item>
        <el-form-item label="接口类型">
          <el-select v-model="resourceConfig.requestMethod" placeholder="请选择接口类型">
            <el-option label="POST" value="POST"></el-option>
            <el-option label="GET" value="GET"></el-option>
            <el-option label="DELETE" value="DELETE"></el-option>
            <el-option label="PUT" value="PUT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="resourceConfig.roles" multiple placeholder="请选择">
            <el-option v-for="role in roles" :key="role.roleId" :label="role.roleName" :value="role.roleId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否生效">
          <el-switch v-model="resourceConfig.isValid"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogResourceVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveResourceConfig">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "ResourceConfig",
  data() {
    return {
      roles: [],
      resourceConfig: {
        id: "",
        resourceDesc: '',
        componentName: '',
        authId: '',
        requestUrl: '',
        requestMethod: null,
        roles: [],
        isValid: true,
        accessFrequency: false
      },
      dialogResourceVisible: false,
      resources: [],
      saveResource: true,
      total: 0,
      pageSize: 10,
      currentPage: 1,
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val;
      this.getResourceConfigs();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getResourceConfigs();
    },
    editResourceConfig(row) {
      this.saveResource = false;
      this.dialogResourceVisible = true;
      this.resourceConfig.resourceDesc = row.resourceDesc;
      this.resourceConfig.componentName = row.componentName;
      this.resourceConfig.authId = row.authId;
      this.resourceConfig.requestUrl = row.requestUrl;
      this.resourceConfig.requestMethod = row.requestMethod;
      this.resourceConfig.roles = row.roleIds;
      this.resourceConfig.isValid = row.isValid;
      this.resourceConfig.accessFrequency = row.accessFrequency;
    },
    deleteResourceConfig(row) {
      let _self = this;
      this.$confirm('此操作将永久删除该资源配置吗？, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.$axios.delete("/resources/configs?componentName=" + row.componentName + "&authId=" + row.authId).then(resp => {
          this.$message({
            type: 'success',
            message: '删除成功'
          });
          _self.getResourceConfigs();
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    addResource() {
      this.dialogResourceVisible = true;
      this.saveResource = true;
    },
    getResourceConfigs() {
      let _self = this;
      this.$axios.post("/resources/configs/query", {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
      }).then(resp => {
        _self.resources = resp.data.list;
        _self.total = resp.data.total;
      });
    },
    queryRoles() {
      let _self = this;
      this.$axios.get("/user/all-roles", {}).then(resp => {
        _self.roles = resp.data;
      });
    },
    saveResourceConfig() {
      this.dialogResourceVisible = true;
      if (this.saveResource) {
        this.addResourceConfig();
      } else {
        this.updateResourceConfig();
      }
    },
    addResourceConfig() {
      this.$axios.post("/resources/configs", {
        resourceDesc: this.resourceConfig.resourceDesc,
        componentName: this.resourceConfig.componentName,
        authId: this.resourceConfig.authId,
        requestUrl: this.resourceConfig.requestUrl,
        requestMethod: this.resourceConfig.requestMethod,
        roles: this.resourceConfig.roles,
        isValid: this.resourceConfig.isValid,

      }).then(resp => {
        this.dialogResourceVisible = false;
        this.getResourceConfigs();
      });
    },
    updateResourceConfig() {
      this.$axios.post("/resources/configs::update", {
        resourceDesc: this.resourceConfig.resourceDesc,
        componentName: this.resourceConfig.componentName,
        authId: this.resourceConfig.authId,
        requestUrl: this.resourceConfig.requestUrl,
        requestMethod: this.resourceConfig.requestMethod,
        roles: this.resourceConfig.roles,
        isValid: this.resourceConfig.isValid,

      }).then(resp => {
        this.dialogResourceVisible = false;
        this.getResourceConfigs();
      });
    }
  },
  created() {
    this.getResourceConfigs();
    this.queryRoles();
    this.$auth();
  },
  updated() {}

}
</script>

<style scoped>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}

.box-card {
  width: 100%;
}
</style>
