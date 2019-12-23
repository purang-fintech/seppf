<template>
  <div>
    <el-card class="box-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span style="font-size: 16px">构建</span>
        <el-button style="float:right; padding:3px 0;margin-left:12px" type="text" @click="openBuildDeployDialog">构建部署
        </el-button>
        <el-button style="float:right; padding:3px 0;margin-left:12px" type="text" @click="openOnlyBuildDialog">仅构建
        </el-button>
        <router-link :to="'/instanceEnv?instance='+instance+'&instanceType='+instanceType" style="margin-right:50px">
          <el-button style="float:right; padding:3px 0" type="text">返回</el-button>
        </router-link>
      </div>
      <div v-if="buildHistories.length > 0">
        <el-table :data="buildHistories.slice((buildCurrentPage-1)*buildPagesize,buildCurrentPage*buildPagesize)" size="small" stripe empty-text="暂无构建记录">
          <el-table-column prop="buildVersion" label="构建版本" width="180" align="center">
            <template slot-scope="scope">
              #<span>{{scope.row.buildVersion}}</span>
              <span style="color: rgb(149, 174, 181)" v-if="scope.row.buildType == 'ONLY_BUILD'">
                (仅构建)
              </span>
              <span style="color: rgb(149, 174, 181)" v-else>
                (构建发布)
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="submitter" label="构建人" width="150" align="center">
          </el-table-column>
          <el-table-column prop="buildInterval" label="构建耗时(秒)" width="120" align="center" :formatter="formatTime">
          </el-table-column>
          <el-table-column label="构建状态" width="200" align="center">
            <template slot-scope="scope">
              <div v-if="scope.row.buildStatus == 'BUILDING' " style="text-align:center">
                <el-progress :percentage="scope.row.status.percentage">
                </el-progress>
              </div>
              <div v-else-if="scope.row.buildStatus== 'FAILURE'">
                <router-link target="_blank" :to="'/buildLog?jobName='+scope.row.jobName+'&buildVersion='+scope.row.buildVersion+'&buildStatus='+scope.row.buildStatus+'&instanceType='+instanceType">
                  <i :class="scope.row.status.badge" :style="{color:scope.row.status.color}"></i>
                  <span :style="{color:scope.row.status.color}">{{scope.row.status.statusCh}}</span>
                </router-link>
              </div>
              <div v-else>
                <i :class="scope.row.status.badge" :style="{color:scope.row.status.color}"></i>
                <span :style="{color:scope.row.status.color}">{{scope.row.status.statusCh}}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="codeChange" label="代码变更说明" align="center">
          </el-table-column>
          <el-table-column prop="createdDate" label="构建日期" align="center">
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
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="scope">
              <el-button type="text" @click="viewLog(scope.row)">查看日志</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div style="text-align:center;" v-else>
        暂无构建信息
      </div>

      <div class="paging" style="float: right;margin-top: 5px">
        <el-pagination
          @size-change="handleBuildSizeChange"
          @current-change="handleBuildCurrentChange"
          :current-page="buildCurrentPage"
          :page-sizes="[1, 2, 3, 4]"
          :page-size="buildPagesize"
          background
          layout=" prev, pager, next"
          :total="buildTotal">
        </el-pagination>
      </div>
    </el-card>
    <el-card class="box-card" style="margin-top: 10px">
      <div slot="header" class="clearfix">
        <span style="font-size: 16px;">部署流水</span>
      </div>
      <el-steps :active="pipelineStages.length" align-center>
        <el-step :title="stage.name" v-for="stage in pipelineStages" :description="stage.status+' 耗时:'+stage.durationMillis/1000+'秒'" :key="stage.id"></el-step>
      </el-steps>
    </el-card>
    <el-card class="box-card" style="margin-top: 10px">
      <div slot="header" class="clearfix">
        <span style="font-size: 16px;">部署</span>
        <el-button style="float: right; padding: 3px 3px" type="text" @click="selectDeployVersion">选择部署</el-button>
        <el-button style="float: right; padding: 3px 3px" type="text" @click="resetDeployStatusConfirm">部署状态同步</el-button>
      </div>
      <div>
        <el-table :data="deploymentHistories.slice((deployCurrentPage-1)*deployPagesize,deployCurrentPage*deployPagesize)" style="width: 100%">
          <el-table-column prop="id" label="部署版本" width="180" align="center">
          </el-table-column>
          <el-table-column prop="buildVersion" label="构建物版本号" width="180" align="center">
          </el-table-column>
          <el-table-column prop="deployStatus" label="部署结果" align="center">
            <template slot-scope="scope">
              <i :class="scope.row.status.badge" :style="{color:scope.row.status.color}"></i>
              <span :style="{color:scope.row.status.color}">{{scope.row.status.value}}</span>
              <i class="el-icon-loading" v-if="scope.row.deployStatus == 'DEPLOYING'"></i>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="部署人" align="center">
          </el-table-column>
          <el-table-column prop="createdDate" label="部署时间" align="center">
          </el-table-column>
        </el-table>
      </div>
      <div class="paging" style="float: right;margin-top: 5px">
        <el-pagination
          @size-change="handleDeploySizeChange"
          @current-change="handleDeployCurrentChange"
          :current-page="deployCurrentPage"
          :page-sizes="[1, 2, 3, 4]"
          :page-size="deployPagesize"
          background
          layout=" prev, pager, next"
          :total="deployTotal">
        </el-pagination>
      </div>
    </el-card>
    <!--选择版本-->
    <el-dialog :close-on-click-modal="modalClose" title="选择部署版本" size="small" :visible.sync="dialogDeployVisible" width="30%">
      <el-table highlight-current-row @current-change="handleDeployVersionChange" ref="deployTable" :data="deployData" style="padding: 10px 20px;">
        <el-table-column prop="buildVersion" label="构建物版本" width="150" align="center"></el-table-column>
        <el-table-column prop="" label="选择" min-width="10%" align="center">
          <template slot-scope="scope">
            <div v-show="scope.row.showSelect">
              <i style="font-size: 30px;color: green" class="el-icon-check"></i>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogDeployVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="deploy">部 署</el-button>
      </span>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :title="buildTitle" :visible.sync="dialogBuildVisible" width="40%">
      <el-form :label-position="labelPosition" label-width="20%" :model="formLabelAlign" v-for="buildParam in buildParams" :key="buildParam.paramName">
        <el-form-item :label="buildParam.name" v-if="buildParam.type === 'StringParameterDefinition'">
          <el-input v-model="buildParam.defaultParameterValue.value">{{buildParam.defaultParameterValue.value}}
          </el-input>
          <span>{{buildParam.description}}</span>
        </el-form-item>
        <el-form-item :label="buildParam.name" v-if="buildParam.type === 'BooleanParameterDefinition'">
          <el-switch v-model="buildParam.defaultParameterValue.value"></el-switch>
          <span>{{buildParam.description}}</span>
        </el-form-item>
        <el-form-item :label="buildParam.name" v-if="buildParam.type === 'ChoiceParameterDefinition'">
          <el-input v-model="buildTypeValue" disabled v-if="buildParam.name == 'buildType'">
            <span>{{buildParam.description}}</span>
          </el-input>
          <el-select v-model="buildParam.defaultParameterValue.value" v-else>
            <el-option v-for="choice in buildParam.choices" :label="choice" :value="choice" :key="choice"></el-option>
          </el-select>
          <span>{{buildParam.description}}</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogBuildVisible = false">取 消</el-button>
        <el-button type="primary" @click="startBuild">确 定</el-button>
      </span>
    </el-dialog>

    <!--构建参数-->
    <el-dialog :close-on-click-modal="modalClose" title="构建参数" :visible.sync="dialogBuildParamsVisible">
      <el-collapse v-for="buildParam in queryBuildParams" :key="buildParam.id">
        <el-collapse-item :title="buildParam.paramKey" name="1">
          <el-input disabled v-model="buildParam.paramValue" type="textarea" :rows="8"></el-input>
        </el-collapse-item>
      </el-collapse>
      <span slot="footer">
        <el-button @click="dialogBuildParamsVisible = false" type="primary" size="mini">关闭</el-button>
      </span>
    </el-dialog>

    <!--pipeline流水-->
    <el-dialog :close-on-click-modal="modalClose" title="Pipeline流水" :visible.sync="dialogBuildPipelineVisible" :before-close="closePipeline" top="100px">
      <build-pipeline display="none" :pipelineData="pipelineData"></build-pipeline>
      <span slot="footer">
        <el-button @click="dialogBuildPipelineVisible = false" type="primary" size="mini">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import BuildPipeline from '@/components/sep/opr/BuildPipeline.vue';

let baseUrl = process.env.ROOT_URL;

export default {
  name: "JenkinsBuild",
  data() {
    return {
      modalClose: sessionStorage.dialogAutoClose == 1,
      pipelineData: {
        pipelineStep: {},
        jobName: "",
        buildVersion: null,
        buildStatus: null,
        instanceType: null,
      },
      dialogBuildPipelineVisible: false,
      pipelineStages: [],
      dialogBuildParamsVisible: false,
      deployTotal: 0,
      deployCurrentPage: 1,
      deployPagesize: 5,
      buildTotal: 0,
      buildCurrentPage: 1,
      buildPagesize: 5,
      timeout: 6000,
      websock: null,
      buildTitle: "",
      jobName: "redeployDemo",
      instance: null,
      instanceType: "ORDINARY",
      branchId: null,
      envType: null,
      branchName: "普兰",
      envName: "系统测试",
      labelPosition: 'right',
      buildTypeValue: null,
      formLabelAlign: {
        name: '',
        region: '',
        type: ''
      },
      dialogBuildVisible: false,
      dialogDeployVisible: false,
      buildVersion: null,
      deployData: [],
      deploymentHistories: [],
      buildResults: [],
      buildParams: [],
      queryBuildParams: [],
      buildHistories: []
    }
  },

  created() {
    this.initWebSocket();
    let _self = this;
    _self.jobName = this.$route.query.jobName;
    _self.instanceType = this.$route.query.instanceType;
    _self.instance = this.$route.query.instance;
    _self.envType = this.$route.query.envType;
    _self.branchId = this.$route.query.branchId;
    this
      .$axios.get("/build/params/jobs?jobName=" + _self.jobName + "&instanceType=" + _self.instanceType)
      .then(function (res) {
        _self.buildParams = res.data
      });
  },

  methods: {
    handlerPipeline(row) {
      this.dialogBuildPipelineVisible = true;
      this.pipelineData.pipelineStep = JSON.parse(row.pipelineStep);
      this.pipelineData.jobName = row.jobName;
      this.pipelineData.buildStatus = row.buildStatus;
      this.pipelineData.buildVersion = row.buildVersion;
      this.pipelineData.instanceType = row.type;
    },

    closePipeline() {
      this.dialogBuildPipelineVisible = false;
      this.pipelineStep = {}
    },

    resetDeployStatusConfirm() {
      this.$confirm('该操作会同步最新的部署状态，是否确认？', '操作提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.resetDeployStatus();
      }).catch(() => {});
    },

    resetDeployStatus() {
      let _self = this;
      this
        .$axios.post("/deployment/status-reset", {
          jobName: _self.jobName,
          instanceType: _self.instanceType,
          branchId: _self.branchId,
          envType: _self.envType,
          instance: _self.instance,
        })
        .then(resp => {
          this.$message({
            type: 'success',
            message: '重置状态成功!'
          });
        })
    },

    viewLog(data) {
      let routeData = this.$router.resolve({
        name: 'buildLog',
        query: {
          'jobName': data.jobName,
          'buildVersion': data.buildVersion,
          'buildStatus': data.buildStatus,
          'instanceType': this.instanceType
        }
      });
      window.open(routeData.href, '_blank');
    },

    deploy() {
      let _self = this;
      this
        .$axios.post("/deployment/auto-deploy", {
          jobName: _self.jobName,
          instanceType: _self.instanceType,
          branchId: _self.branchId,
          envType: _self.envType,
          instance: _self.instance,
          buildVersion: _self.buildVersion
        })
        .then(resp => {
          _self.dialogDeployVisible = false;
        })
    },

    selectDeployVersion() {
      let _self = this;
      this.dialogDeployVisible = true;
      this
        .$axios.get("/deployment/deploy-versions?jobName=" + _self.jobName + "&instanceType=" + _self.instanceType)
        .then(function (res) {
          _self.deployData = res.data
        });
    },

    handlerBuildParams(row) {
      this.dialogBuildParamsVisible = true;
      if (row.buildParams) {
        this.queryBuildParams = JSON.parse(row.buildParams);
      }
    },

    handleDeployCurrentChange(val) {
      this.deployCurrentPage = val;
    },

    handleDeploySizeChange(val) {
      this.deployPagesize = val;
    },

    handleBuildSizeChange(val) {
      this.buildPagesize = val;
    },

    handleBuildCurrentChange(val) {
      this.buildCurrentPage = val;
    },

    startBuild() {
      let _self = this;
      let env = eval(JSON.parse(localStorage.getItem("environmentType")));
      let selectedEnv = env.find(d => {
        return d.typeId == _self.envType
      });

      _self.$axios.post("/build/start-build/jobs", {
          jobName: _self.jobName,
          instanceType: _self.instanceType,
          parameterDefinitions: _self.buildParams,
          branchId: _self.branchId,
          branchName: _self.branchName,
          envType: _self.envType,
          envName: !selectedEnv ? '' : selectedEnv.typeName,
          buildType: _self.buildTypeValue,
          instance: _self.instance
        })
        .then(function (res) {
          _self.dialogBuildVisible = false;
        })
    },

    openOnlyBuildDialog() {
      this.buildTitle = "仅构建";
      this.buildTypeValue = "ONLY_BUILD";
      this.dialogBuildVisible = true;
    },

    openBuildDeployDialog() {
      this.buildTitle = "构建部署";
      this.buildTypeValue = "BUILD_DEPLOY";
      this.dialogBuildVisible = true;
    },

    handleDeployVersionChange(val) {
      if (!val) {
        return;
      }
      this.buildVersion = val.buildVersion;
      this.deployData.forEach(function (value, index) {
        value.showSelect = false;
      });
      val.showSelect = true;
    },

    formatTime(row) {
      return row.buildInterval / 1000;
    },

    initWebSocket() {
      //初始化weosocket
      const wsuri = "ws://" + baseUrl.substr(7, baseUrl.length) + "deployment-build";
      this.websock = new WebSocket(wsuri);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },

    start() {
      let _self = this;
      _self.timeoutObj = setInterval(function () {
        if (_self.websock.readyState == 1) {
          _self.websock.send("HeartBeat");
        } else {
          clearTimeout(_self.timeoutObj)
          _self.reconnect()
        }
      }, this.timeout)
    },

    reconnect() { //重新连接
      let _self = this;
      if (_self.lockReconnect) {
        return;
      };
      _self.lockReconnect = true;
      //没连接上会一直重连，设置延迟避免请求过多
      _self.timeoutnum && clearTimeout(_self.timeoutnum);
      _self.timeoutnum = setTimeout(function () {
        //新连接
        _self.initWebSocket();
        _self.lockReconnect = false;
      }, 5000);
    },

    websocketonopen() {
      this.start();
      //连接建立之后执行send方法发送数据
      let params = {
        jobName: this.jobName,
        envType: this.envType,
        branchId: this.branchId
      };
      this.websocketsend(JSON.stringify(params));
    },

    websocketonerror(w) { //连接建立失败重连
      this.initWebSocket();
    },

    websocketonmessage(e) { //数据接收
      let data = JSON.parse(e.data);
      if (data) {
        this.buildHistories = data.buildHistories;
        this.deploymentHistories = data.deploymentHistories;
        this.deployTotal = this.deploymentHistories.length;
        this.buildTotal = this.buildHistories.length;
        let pipelines = JSON.parse(data.deploymentPipelines);
        if (pipelines) {
          this.pipelineStages = pipelines.stages;
        } else {
          this.pipelineStages = [];
        }
      }
    },

    websocketsend(Data) { //数据发送
      this.websock.send(Data);
    },

    websocketclose(e) { //关闭
    },
  },

  components: {
    "build-pipeline": BuildPipeline
  }
}
</script>

<style scoped>

</style>
