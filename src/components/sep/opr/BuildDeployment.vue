<template>
  <div id="buildList">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-tech"></i> 基础设施
        </el-breadcrumb-item>
        <el-breadcrumb-item>发布清单</el-breadcrumb-item>
        <el-breadcrumb-item>构建部署</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card class="box-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span style="font-size: 15px">构建部署</span>
        <el-button v-no-more-click style="float:right; padding:3px 0;margin-left:12px" type="text" icon="el-icon-right"
                   @click="releaseQuery(),dialogBuildVisible = true">立即构建
        </el-button>
        <router-link to="/build" style="margin-right:50px">
          <el-button style="float:right; padding:3px 0" type="text" icon="el-icon-back">返回</el-button>
        </router-link>
      </div>
      <div v-if="buildResults.length > 0">
        <el-collapse v-model="activeNames" v-for="buildResult  in buildResults" :key="buildResult.tag">
          <el-collapse-item :title="'构建时间: '+buildResult.buildHistories[0].createdDate" :name="buildResult.tag">
            <el-table :data="buildResult.buildHistories"
                      empty-text="暂无构建记录">
              <el-table-column prop="jobName" label="job名称" width="180" align="center" show-overflow-tooltip>
              </el-table-column>
              <el-table-column prop="buildVersion" label="构建版本" width="80" align="center">
              </el-table-column>
              <el-table-column label="构建状态" width="150" align="center">
                <template slot-scope="scope">
                  <div v-if="scope.row.buildStatus == 'BUILDING' " style="text-align:center">
                    <el-progress :percentage="scope.row.status.percentage">
                    </el-progress>
                  </div>
                  <div v-else-if="scope.row.buildStatus== 'FAILURE'">
                    <el-button v-no-more-click type="text" @click="viewLog(scope.row)">
                      <i :class="scope.row.status.badge" :style="{color:scope.row.status.color}"></i>
                      <span :style="{color:scope.row.status.color}">{{scope.row.status.statusCh}}</span>
                    </el-button>
                  </div>
                  <div v-else>
                    <i :class="scope.row.status.badge" :style="{color:scope.row.status.color}"></i>
                    <span :style="{color:scope.row.status.color}">{{scope.row.status.statusCh}}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="submitter" label="构建人" width="80" align="center">
              </el-table-column>
              <el-table-column prop="instance" label="实例" width="100" align="center" show-overflow-tooltip>
              </el-table-column>
              <el-table-column prop="envName" label="构建环境" width="100" align="center">
              </el-table-column>
              <el-table-column prop="branchName" label="构建分支" width="100" align="center">
              </el-table-column>
              <el-table-column prop="buildInterval" label="构建耗时(秒)" width="90" align="center" :formatter="formatTime">
              </el-table-column>
              <el-table-column prop="codeChange" label="代码变更说明" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <div v-html="scope.row.codeChange"></div>
                </template>
              </el-table-column>
              <el-table-column prop="buildParams" label="构建参数" width="70" align="center">
                <template slot-scope="scope">
                  <el-button @click="handlerBuildParams(scope.row)" type="text">详情</el-button>
                </template>
              </el-table-column>
              <el-table-column label="Pipeline" width="80" align="center">
                <template slot-scope="scope">
                  <el-button @click="handlerPipeline(scope.row)" type="text">查看</el-button>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="100"
                align="center">
                <template slot-scope="scope">
                  <el-button v-no-more-click v-if="scope.row.buildStatus == 'FAILURE'" @click="handleRetry(scope.row)" type="text">重试</el-button>
                  <el-button v-no-more-click v-else :disabled="['QUEUE','START'].indexOf(scope.row.buildStatus) > -1"  type="text" @click="viewLog(scope.row)">查看日志</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div style="text-align:center;" v-else>
        暂无构建信息
      </div>
    </el-card>
    <el-dialog :close-on-click-modal="modalClose" title="选择构建" :visible.sync="dialogBuildVisible" width="1024px" top="100px">
      <el-form :inline="true" :model="buildEnv" :rules="rules" ref="buildEnv" label-width="130px">
        <el-form-item label="选择构建分支:" prop="prodBranch">
          <el-select v-model="buildEnv.prodBranch" clearable placeholder="请选择" @change="changeBranch" size="small">
            <el-option v-for="prodBranch in prodBranchs" :value="prodBranch.branchId" :key="prodBranch.branchId"
                       :label="prodBranch.branchName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择构建环境:" prop="envType">
          <el-select v-model="buildEnv.envType" placeholder="请选择" @change="changeEnv" size="small">
            <el-option v-for="item in envTypes" :value="item.typeId" :key="item.typeId"
                       :label="item.typeName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Git分支:" prop="gitBranch">
          <el-select v-model="buildEnv.gitBranch"    size="small" disabled>
            <el-option v-for="item in releases" :value="item.label" :key="item.value"
                       :label="item.label"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form :rules="rules" ref="buildEnvInstance" class="demo-form-inline" :model="buildEnv" label-width="100px" size="mini">
        <el-form-item label="选择实例:" prop="instances">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAllInstance" @change="handleCheckAllInstance">全选
          </el-checkbox>
          <div style="margin:10px 0"></div>
          <el-checkbox-group v-model="buildEnv.instances" @change="handleCheckedInstanceChange">
            <el-checkbox v-for="(buildFile,instance) in buildFiles" :label="instance" :key="instance">
              {{instance}}
              (
              <span style="color:#6bbd6b" v-if="jobNames[instance]">
                {{jobNames[instance]}}
              </span>
              <span style="color:#EE6F6F" v-else>
                job名称为空
              </span>
              )
              <span style="margin-left: 4px"></span>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="构建参数:">
          <el-tabs type="border-card" tab-position="left" class="build-tabs" v-if="buildEnv.instances.length>0">
            <el-tab-pane v-for="instance in buildEnv.instances" :key="instance" :label="instance">
              <el-tabs tab-position="top" type="card">
                <el-tab-pane v-for="buildFile in buildFiles[instance]" :label="buildFile.paramKey" :key="buildFile.id">
                  <el-switch
                    active-color="#13ce66"
                    active-text="增量" inactive-color="#3c7bdb"
                    inactive-text="全量"
                    v-model="buildMethod[instance]">
                  </el-switch>
                  <el-input disabled v-if="buildMethod[instance]" v-model="buildFile.paramValue" type="textarea" :rows="8" resize="none"></el-input>
                  <el-input disabled v-else v-model="buildFile.instance" type="textarea" :rows="8" resize="none"></el-input>
                </el-tab-pane>
              </el-tabs>
            </el-tab-pane>
          </el-tabs>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <span style="float:left;color:#EE6F6F;font-size:18px">{{showErrorMessage}}</span>
        <el-button v-no-more-click @click="dialogBuildVisible = false" size="mini" type="primary" icon="el-icon-close">取消</el-button>
        <el-button v-no-more-click @click="validateAndBuild('buildEnv','buildEnvInstance')" size="mini" type="primary" icon="el-icon-check">构建</el-button>
      </span>
    </el-dialog>

    <!--pipeline流水-->
    <el-dialog :close-on-click-modal="modalClose" title="Pipeline流水" :visible.sync="dialogBuildPipelineVisible" :before-close="closePipeline" top="100px">
      <build-pipeline display="none" :pipelineData="pipelineData"></build-pipeline>
      <span slot="footer">
        <el-button @click="dialogBuildPipelineVisible = false" type="primary" size="mini">关闭</el-button>
      </span>
    </el-dialog>

    <!--构建参数-->
    <el-dialog :close-on-click-modal="modalClose" title="构建参数" :visible.sync="dialogBuildParamsVisible" :before-close="closeBuildParams">
      <el-collapse accordion>
        <el-collapse-item v-for="(buildParam, index) in buildParams" :key="index" :title="'参数：'+buildParam.paramKey" :name="index">
          <el-input disabled v-model="buildParam.paramValue" type="textarea" :rows="8" resize="none"></el-input>
        </el-collapse-item>
      </el-collapse>
      <span slot="footer">
        <el-button @click="dialogBuildParamsVisible = false" type="primary" size="mini">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import BuildPipeline from '@/components/sep/opr/BuildPipeline.vue';
  import {dateFormat} from "@/util/date.js";
  import commonQuery from "@/components/util/CommonQuery.vue";

  export default {
    name: "BuildDeployment",
    data() {
      return {
        modalClose: sessionStorage.dialogAutoClose == 1,
        showErrorMessage: "",
        dialogBuildParamsVisible: false,
        buildParams: [],
        tabPosition: 'left',
        checkAllInstance: false,
        isIndeterminate: true,
        dialogBuildPipelineVisible: false,
        time: null,
        noteId: null,
        prodBranchs: [],
        rel_code: null,
        hideClosed: true,
        envTypes: [],
        releases:[],
        rel_code:null,
        buildEnv: {
          instances: [],
          envType: null,
          gitBranch:this.rel_code,
          prodBranch: null,
          buildType: ''
        },
        gitBranchSelected:"",
        nonJobNameCount: 0,
        buildFiles: {},
        buildMethod:{},
        buildMethods:[],
        dialogBuildVisible: false,
        activeNames: [],
        buildResults: [],
        pipelineData: {
          pipelineStep: {},
          jobName: "",
          buildVersion: null,
          buildStatus: null,
          instanceType:null,
        },
        changeBranchId: null,
        changeEnvType: null,
        jobNames: {},
        rules: {
          envType: [
            {required: true, message: '请选择环境', trigger: 'blur'},
          ],
          prodBranch: [
            {required: true, message: '请选择分支', trigger: 'change'}
          ],
          instances: [
            {type: 'array', required: true, message: '请至少选择一个构建实例', trigger: 'change'}
          ]
        }
      }
    },

    created() {
      this.noteId = this.$route.query.noteId;
      this.buildEnv.gitBranch = this.$route.query.relCode;
      this.buildEnv.buildType = this.$route.query.buildType;
      this.queryBuildHistories(this);
      //获取构建环境
      this.envTypes = JSON.parse(localStorage.getItem("environmentType"));
      //获取构建分支
      this.queryBranch(sessionStorage.productId);
      //获取该feature的构建实例
      this.queryInstances();
      this.timer = setInterval(() => {
        if (document.getElementById("buildList") === null) {
          clearInterval(this.timer);
          return;
        }
        this.queryBuildHistories(this);
      }, 8000)
    },

    methods: {
      releaseQuery() {
        let _self =  this;
         _self.releases.splice(0,  _self.releases.length);
        commonQuery.openRelQuery((result) => {
          _self.releases = result.releasesWithBranch;
        })
      },

      changeEnv(row) {
        this.changeEnvType = row;
        this.showErrorMessage = "";
        if (this.changeBranchId != null) {
          this.getJobName();
        }
      },

      changeBranch(row) {
        this.changeBranchId = row;
        this.showErrorMessage = "";
        if (this.changeEnvType != null) {
          this.getJobName();
        }
      },

      viewLog(data){
        let routeData = this.$router.resolve({
          name: 'buildLog', 
          query: {
            'jobName': data.jobName,
            'buildVersion': data.buildVersion, 
            'buildStatus': data.buildStatus, 
            'instanceType': data.type
          }
        });
        window.open(routeData.href, 'Blank');
      },

      getJobName() {
        let _self =  this;
        _self.$axios.get("/env/env-jobs?branchId=" + _self.changeBranchId + "&envType=" + _self.changeEnvType)
        .then(function (res) {
          _self.jobNames = res.data;
        })
      },

      handleRetry(row) {
        let _self =  this;
        _self.$axios.post("/build/retry-build/" + row.id, {})
        .then(function (res) {
          _self.queryBuildHistories(self);
          _self.$message({
            type: 'success',
            message: '重试构建成功'
          });
        })
      },

      returnBuildList() {
        let url = "/build";
        this.$router.push(url);
      },

      handlerBuildParams(row) {
        this.dialogBuildParamsVisible = true;
        if (row.buildParams) {
          this.buildParams = JSON.parse(row.buildParams);
        }
      },

      closePipeline() {
        this.dialogBuildPipelineVisible = false;
        this.pipelineStep = {}
      },

      closeBuildParams() {
        this.dialogBuildParamsVisible = false;
        this.buildParams = {}
      },

      buildRunSubmit: function () {
        let _self =  this;
        let selectedEnv = _self.envTypes.find(d => {return d.typeId == _self.buildEnv.envType});
        let nonJobName = false;
        let methods = [];
        _self.buildEnv.instances.forEach(instance => {
          if (_self.buildMethod[instance] == undefined) {
            _self.buildMethod[instance]=false
          }
          if (_self.jobNames[instance] == null) {
            nonJobName = true;
            _self.showErrorMessage = "请去环境配置页面配置相关实例的信息";
            return;
          }
        });
        if (nonJobName) {
          return;
        }
        _self.$axios.post("/build/start-build", {
          productId: sessionStorage.productId,
          branchId: _self.buildEnv.prodBranch,
          envType: _self.buildEnv.envType,
          envName: !selectedEnv ? ''  : selectedEnv.typeName,
          noteId: _self.noteId,
          gitVersion:_self.buildEnv.gitBranch,
          submitter: sessionStorage.userId,
          instances: _self.buildEnv.instances,
          buildMethod:_self.buildMethod,
          buildType: _self.buildEnv.buildType
        })
        .then(function (res) {
          _self.queryBuildHistories(self);
          _self.dialogBuildVisible = false;
          _self.$message({
            type: 'success',
            message: '已触发构建'
          });
        }).catch(e => {
      })
    },

      validateAndBuild(buildEnv, buildEnvInstance) {
        let _self =  this;
        _self.$refs[buildEnv].validate((valid) => {
          if (!valid) {
            return;
          } else {
            _self.$refs[buildEnvInstance].validate((valid) => {
              if (!valid) {
                return;
              } else {
                _self.buildRunSubmit();
              }
            });
          }
        });
      },

      handleCheckedInstanceChange(value) {
        let checkedCount = value.length;
        this.checkAllInstance = checkedCount === Object.keys(this.buildFiles).length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < Object.keys(this.buildFiles).length;
      },

      //全选
      handleCheckAllInstance(val) {
        this.buildEnv.instances = [];
        if (val) {
          Object.keys(this.buildFiles).forEach(key => {
            this.buildEnv.instances.push(key);
          });
        }
        this.isIndeterminate = false;
      },

      queryInstances() {
        let _self =  this;
        _self.$axios.get("/build/build-instances/" + this.noteId)
        .then(function (res) {
          _self.buildFiles = res.data;
        })
      },

      queryBranch(productId) {
        let _self =  this;
        _self.$axios.post("/env/branch_query/" + productId)
        .then(function (res) {
          _self.prodBranchs = res.data;
        })
      },

      handlerPipeline(row) {
        this.dialogBuildPipelineVisible = true;
        this.pipelineData.pipelineStep = JSON.parse(row.pipelineStep);
        this.pipelineData.jobName = row.jobName;
        this.pipelineData.buildStatus = row.buildStatus;
        this.pipelineData.buildVersion = row.buildVersion;
        this.pipelineData.instanceType = row.type;
      },

      formatTime(row) {
        return row.buildInterval / 1000;
      },

      queryBuildHistories(self) {
        let _self =  this;
        _self.$axios.get("/build/build-history?noteId=" + this.noteId+ "&pageSize=" + 10)
        .then(function (res) {
          _self.buildResults = res.data;
          _self.activeNames = [];
          _self.buildResults.forEach(buildResult => {
            _self.activeNames.push(buildResult.tag);
          });
        })
      }
    },

    components: {
      "build-pipeline": BuildPipeline
    }
  }
</script>

<style>
  .demo-form-inline .el-tabs__content {
    padding: 10px 30px 10px 10px;
  }

  .box-card {
    width: 100%;
  }

  .build-tabs {
    width: 98%;
  }

   .build-tabs .el-tabs__content {
     padding: 10px 0 0 0;
   }

   .build-tabs .el-tabs .el-tabs__content {
     padding: 10px;
   }

   .build-tabs .el-tabs--top>.el-tabs__header{
     margin: 0;
   }

   .build-tabs .el-tab-pane .el-tabs .el-tab-pane .el-textarea {
     width: 90%;
     float: right;
   }

  .build-tabs .el-switch {
    width: 9%;
    vertical-align: top;
  }

  .build-tabs .el-switch__label {
    position: absolute;
    display: none;
    color: #fff;
  }

  .build-tabs .el-switch__label--right {
    z-index: 1;
    left: -3px;
  }

  .build-tabs .el-switch__label--left {
    z-index: 1;
    left: 19px;
  }

  .build-tabs .el-switch__label.is-active {
    display: block;
  }
  .build-tabs .el-switch .el-switch__core,
  .build-tabs .el-switch .el-switch__label {
    width: 55px !important;
  }
</style>
