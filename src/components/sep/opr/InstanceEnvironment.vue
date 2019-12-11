<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>环境配置</span>
        <router-link to="/instance" style="margin-right:50px">
          <el-button style="float:right; padding:3px 0" type="text" icon="el-icon-back">返回</el-button>
        </router-link>
      </div>

      <el-collapse v-model="activeName" :key="ins.envName" v-for="ins in instanceDetails" class="ins-collapse" accordion>
        <el-collapse-item :title="ins.envName" :name="ins.envName">
          <el-card shadow="always">
            <el-table :data="ins.instanceEnvs" class="tb-edit" highlight-current-row size="small" stripe>
              <el-table-column prop="branchId" label="分支" width="180" align="center">
                <template slot-scope="scope">
                  <el-select size="small" v-model="scope.row.branchId" placeholder="分支" @change="branchChange(scope.row.branchId, ins.instanceEnvs)">
                    <el-option v-for="branch in prodBranchs" :disabled="branch.disabled"
                               :value="branch.branchId" :key="branch.branchId"
                               :label="branch.branchName"></el-option>
                  </el-select>
                  <span style="color: #3ab4d7;cursor:pointer">{{displayedBranchName(scope.row.branchId)}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="jobName" label="JOB名称" width="300" align="center">
                <template slot-scope="scope">
                  <el-input size="small" v-model="scope.row.jobName" placeholder="请输入JOB名称"></el-input>
                  <span style="color: #3ab4d7;cursor:pointer">{{scope.row.jobName ? scope.row.jobName : "点此录入"}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createdDate" label="更新时间" align="center" min-width="10%">
                <template slot-scope="scope">
                  <span>{{scope.row.createdDate}}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template slot-scope="scope">
                  <el-button icon="el-icon-circle-check" @click="saveBranch(scope.row,ins.instanceEnvs)" type="text" class="env-oper-button" style="color:#6bbd6b"></el-button>
                  <el-button icon="el-icon-delete" @click="deleteBranchRow(scope.row,ins.instanceEnvs)" type="text" class="env-oper-button" style="color:#EE6F6F"></el-button>
                    <el-tooltip effect="dark" content="构建部署" placement="bottom">
                        <el-button icon="el-icon-position" type="text" @click="$router.push({ name: 'jenkins-build',
                  query: {'instance': scope.row.instance,'jobName':scope.row.jobName,'instanceType':instanceType,
                  'instance':scope.row.instance,'envType':scope.row.envType,'branchId':scope.row.branchId}})">
                        </el-button>
                    </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            <div class="el-table-add-row" style="width: 99.2%;"
                 @click="addBranchRow(ins.instanceEnvs, ins.envType)">
              <span>+ 添加新纪录</span>
            </div>
          </el-card>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!--选择环境-->
  </div>
</template>

<script>
  export default {
    name: "InstanceEnvironment",
    data() {
      let checkBranchId = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('分支不能为空不能为空'));
        }
        this.checkBranchRepeat(value).then(res => {
          if (res.data) return callback(new Error('分支不能重复'));
        });
        return callback();
      };
      return {
        dialogEnvVisible: false,
        instanceType: null,
        activeName: "",
        prodBranchs: [],
        envTypes: null,
        tmpBranchIds: new Map(),
        instanceDetails: [],
        envRow: {
          envType: null,
        },
        branchRow: {
          branchId: null,
          jobName: null,
          envType: null,
        },
        instance: null,
        envType: null,
        rules: {
          branchId: [
            {validator: checkBranchId, trigger: 'blur'}
          ]
        },
      }
    },

    methods: {
      checkBranchRepeat(value) {
        return this.$axios.get("/instances/branch/validator?branchId=" + value)
      },

      displayedBranchName(id){
        if (!id) {
          return "点此选择分支";
        }
        let branch = this.prodBranchs.find(d => {return id == d.branchId});
        return branch ? branch.branchName : '';
      },

      saveBranch(detail,instanceEnvs) {
        for (let instanceEnv of instanceEnvs) {
          if (detail.createdDate == null && instanceEnv.branchId == detail.branchId && instanceEnv.createdDate) {
            this.$notify.error("请勿重复添加相同分支的环境配置");
            return;
          }
        }
        let _self =  this;
        _self.$axios.post("/instances/envs", {
          id: detail.id,
          jobName: detail.jobName,
          branchId: detail.branchId,
          instance: _self.instance,
          envType: detail.envType
        })
          .then(function (res) {
            _self.$message({
              type: 'success',
              message: '操作成功'
            });
            _self.getAllInstanceEnvs();
          })
      },

      deleteBranchRow(value, instanceEnvs) {
        if (value && value.id) {
          let message = "将永久删除该配置项，确定删除吗?";
          this.$confirm(message, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'danger'
          }).then(() => {
            this.deleteBranch(value, instanceEnvs)
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        } else {
          let index = instanceEnvs.indexOf(value);
          if (index !== -1) {
            instanceEnvs.splice(index, 1)
          }
          this.$message.info('已删除未保存记录！');
        }
      },

      deleteBranch(value, instanceEnvs) {
        let _self =  this;
        _self.$axios.delete("/instances/envs/" + value.id)
          .then(() => {
            let index = instanceEnvs.indexOf(value);
            if (index !== -1) {
              instanceEnvs.splice(index, 1)
            }
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          });
      },

      branchChange(value,instanceEnvs) {
      },

      addBranchRow(instanceEnvs, envType) {
        let firstRow = instanceEnvs[0];
        let newRow = {
          branchId: "",
          jobName: "",
          createdDate: "",
          productId: firstRow ? firstRow.productId : sessionStorage.productId,
          id: null,
          instance: firstRow? firstRow.instance : null,
          envType: envType
        };
        instanceEnvs.push(newRow);
      },

      getAllInstanceEnvs() {
        let _self =  this;
        _self.$axios.get("/instances/envs/" + _self.instance).then(resp => {
          _self.instanceDetails = resp.data;
        })
      },

      addEnv() {
        let _self =  this;
        _self.$axios.post("/instances/envs", {
          instance: _self.instance,
          envType: _self.envRow.envType,
        }).then(resp => {
          _self.getAllInstanceEnvs();
          _self.dialogEnvVisible = false;
        })
      },

      queryBranch(productId) {
        let _self =  this;
        _self.$axios.post("/env/branch_query/" + productId)
        .then(function (res) {
          _self.prodBranchs = res.data;
        })
      },
    },

    created() {
      this.instanceType = this.$route.query.instanceType;
      this.instance = this.$route.query.instance;
      this.envTypes = JSON.parse(localStorage.getItem("environmentType"));
      this.queryBranch(sessionStorage.productId);
      this.getAllInstanceEnvs();
    }
  }
</script>

<style scoped>
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .ins-collapse .el-collapse-item__content {
    padding: 20px;
  }

  .clearfix:after {
    clear: both
  }

  .tb-edit .el-table__body td .cell {
    height: 40px;
    line-height: 40px;
  }

  .tb-edit .el-select,
  .tb-edit .el-input {
    display: none
  }

  .tb-edit .current-row .el-select,
  .tb-edit .current-row .el-input {
    display: block
  }

  .tb-edit .current-row .el-select + span,
  .tb-edit .current-row .el-input + span {
    display: none
  }

  .env-oper-button+.env-oper-button {
    margin-left: 5px;
  }

  .env-oper-button {
    padding: 0;
    background-color: transparent !important;
    border: none;
    font-size: 16px;
  }

  .el-table-add-row {
    margin-top: 10px;
    width: 100%;
    height: 34px;
    border: 1px dashed #c1c1cd;
    border-radius: 2px;
    cursor: pointer;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    line-height: 34px;
  }
</style>
