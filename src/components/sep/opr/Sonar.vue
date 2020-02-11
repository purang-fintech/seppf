<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-tech"></i> 基础设施
        </el-breadcrumb-item>
        <el-breadcrumb-item>代码扫描</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card shadow="hover">
      <div class="sonar-form" id="sonarList">
        <el-form v-model="qform" :inline="true" size="small" label-width="100px">
          <el-form-item label="实例项目名称" prop="projectKey">
            <el-input v-model="qform.projectKey" placeholder="请输入" clearable></el-input>
          </el-form-item>
          <el-form-item style="float:right">
            <el-button v-no-more-click size="mini" type="primary" icon="el-icon-search" @click="querySonarHistories()">查询</el-button>
            <el-button v-no-more-click size="mini" type="primary" icon="iconfont icon-radar" @click="listInstance(),dialogSonarVisible = true">立即扫描
            </el-button>
          </el-form-item>
        </el-form>

        <el-table
          :data="sonarScanResults"
          empty-text="暂无扫描记录"
          :max-height="tableHeight"
          size="small"
          stripe
          :border="showBorder"
          v-loading="queryLoading"
          element-loading-text="查询中..."
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)">
          <el-table-column prop="projectKey" label="实例名称" width="140" align="center">
          </el-table-column>
          <el-table-column prop="gitBranch" label="分支版本" align="center">
          </el-table-column>
          <el-table-column prop="submitter" label="触发人" width="90" align="center">
          </el-table-column>
          <el-table-column prop="startTime" label="提交时间" width="140" align="center">
          </el-table-column>
          <el-table-column prop="analysisStatus" label="扫描结果" width="90" align="center">
            <template slot-scope="scope">
              <el-tag type="danger" size="small" effect="dark" v-if="scope.row.analysisStatus==='ERROR'">质量欠佳</el-tag>
              <el-tag type="success" size="small" effect="dark" v-else-if="scope.row.analysisStatus==='OK'">质量良好</el-tag>
              <el-tag type="info" size="small" effect="dark" v-else>暂无数据</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ncloc" label="代码行数" width="80" align="center">
          </el-table-column>
          <el-table-column prop="coverage" label="单测覆盖率" width="90" align="center">
            <template slot-scope="scope">
              <span  class="breq-sum-tips" type="text" @click="viewDrawer(scope.row.projectKey,'coverage')">{{scope.row.coverage}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="duplicatedLinesDensity"   label="重复比例" width="80" align="center">
            <template slot-scope="scope">
              <span  class="breq-sum-tips" type="text" @click="viewDrawer(scope.row.projectKey,'duplicated_lines_density')">{{scope.row.duplicatedLinesDensity}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="codeSmells" label="坏味道" width="80" align="center">
            <template slot-scope="scope">
              <span  class="breq-sum-tips" type="text" @click="viewDrawer(scope.row.projectKey,'CODE_SMELL')">{{scope.row.codeSmells}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="bugs" label="缺陷数" width="80" align="center">
            <template slot-scope="scope">
              <span  class="breq-sum-tips" type="text" @click="viewDrawer(scope.row.projectKey,'BUG')">{{scope.row.bugs}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="vulnerabilities" label="安全漏洞" width="80" align="center">
            <template slot-scope="scope">
              <span  class="breq-sum-tips" type="text" @click="viewDrawer(scope.row.projectKey,'VULNERABILITY')">{{scope.row.vulnerabilities}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="hotspots" label="命中热点" width="80" align="center">
            <template slot-scope="scope">
              <span  class="breq-sum-tips" type="text" @click="viewDrawer(scope.row.projectKey,'SECURITY_HOTSPOT')">{{scope.row.hotspots}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="sqaleIndex" label="技术债(小时)" width="100" align="center">
          </el-table-column>
          <el-table-column label="详情" width="80" align="center">
            <template slot-scope="scope">
              <el-button v-no-more-click type="text" @click="viewDetail(scope.row)">结果总览</el-button>
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
        </div>
      </div>
    </el-card>

    <el-drawer
      title="最靓的标题" :visible.sync="drawer" size="70%" :with-header ="false" >
      <iframe :src="_self.draw.url"  style="margin-top:-110px; height: 100%;width:100%"  frameborder="0"></iframe>
    </el-drawer>

    <el-dialog :close-on-click-modal="modalClose" title="项目扫描" :visible.sync="dialogSonarVisible" width="50%">
      <el-form
        :rules="rules"
        ref="sonarProjects"
        class="demo-form-inline"
        :model="sonarScan"
        label-width="100px"
        size="medium">
        <el-form-item label="扫描实例:" prop="sonarProjectNames">
          <el-select v-model="sonarScan.instance" value-key="instance" placeholder="选择实例" style="width:95%" @change="listBranch" clearable>
            <el-option v-for="item in instances" :label="item.instance+' 【'+item.description+'】'" :value="item" :key="item.instance" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="GIT分支:" prop="gitBranch">
          <el-select v-model="sonarScan.gitBranch" placeholder="选择分支" style="width:95%"   clearable>
            <el-option v-for="item in branches" :label="item.name" :value="item.name" :key="item.name" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="主要语言:" prop="language">
          <el-radio-group v-model="sonarScan.language">
            <el-radio-button label="JAVA"></el-radio-button>
            <el-radio-button label="JS"></el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button v-no-more-click @click="dialogSonarVisible = false" size="small" type="primary" icon="el-icon-close">取消</el-button>
        <el-button v-no-more-click @click="validateAndBuild('sonarProjects')" size="small" type="primary" icon="el-icon-check">扫描</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import commonQuery from "@/components/util/CommonQuery.vue";

export default {
  name: "BuildDeployment",
  data() {
    return {
      tableHeight: bodyAviHeightNTab - 70 - 45,
      modalClose: sessionStorage.dialogAutoClose == 1,
      showBorder: localStorage.showBorder && localStorage.showBorder == "true",
      queryLoading: false,
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      pageInfo: {},
      checkAllInstance: false,
      isIndeterminate: true,
      productId: null,
      drawer: false,
      draw:{
        url:""
      },
      qform: {
        projectKey: ""
      },
      time: null,
      noteId: null,
      rel_code: null,
      sonarScanResults: [],
      releases: [],
      instances:[],
      branches:[],
      rel_code: null,
      sonarProjectNames: "",
      projectEntry: [{
        instance: "",
        paramValue: "",
        projectName: ""
      }],
      sonarScan: {
        gitBranch: this.rel_code,
        instance: {},
        language:'JAVA'
      },
      dialogSonarVisible: false,
      rules: {
        sonarProjectNames: [{
          required: true,
          message: "请选择扫描项目",
          trigger: "blur"
        }],
        gitBranch: [{
          required: true,
          message: "请选择项目分支",
          trigger: "blur"
        }],
        language: [{
          required: true,
          message: "请选择主要语言",
          trigger: "blur"
        }]
      }
    };
  },

  created() {
    this.querySonarHistories(this);
    this.productId = sessionStorage.productId;
    this.qform.projectKey = "";
    this.timer = setInterval(() => {
      if (document.getElementById("sonarList") === null) {
        clearInterval(this.timer);
        return;
      }
      this.querySonarHistories(this);
    }, 2000)
  },

  methods: {
    releaseQuery() {
      let _self = this;
      _self.releases.splice(0, _self.releases.length);
      commonQuery.openRelQuerySonar(result => {
        _self.releases = result.releases;
      });
    },
    querySonarHistories(self) {
      let _self = this;
      _self.$axios
        .get("/build/sonarAllScanHistory?projectKey=" + _self.qform.projectKey)
        .then(function (res) {
          _self.sonarScanResults = res.data;
        });
    },
    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.querySonarHistories();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.querySonarHistories();
    },

    buildRunSubmit: function () {
      let _self = this;
      _self.$axios
        .post("/build/start-sonarScan", {
          productId: sessionStorage.productId,
          noteId: _self.noteId,
          gitBranch: _self.sonarScan.gitBranch,
          language: _self.sonarScan.language,
          submitter: sessionStorage.userId,
          projectKeys: _self.sonarScan.instance.projectName.split(",")
        })
        .then(function (res) {
          _self.dialogSonarVisible = false;
          _self.$message({
            type: "success",
            message: "已触发构建"
          });
        })
        .catch(e => {});
    },
    listInstance() {
      let _self = this;
      _self.$axios.get("/listInstance", {
        productId: sessionStorage.productId
      })
        .then(res => {
          _self.instances = res.data;
        })
    },
    listBranch(data) {
      let _self = this;
      if (!data){
        return
      }
      console.log(data)
      let name =data.projectName;
      let url = data.repoUrl
      let space = data.namespace
      _self.$axios.post("/listBranch",{
        repoUrl:url,
        projectName:name,
        namespace:space
        }
      ).then(res => {
          _self.branches = res.data;
        })
    },

    validateAndBuild(sonarProjects) {
      let _self = this;
      _self.buildRunSubmit();
    },

    viewDetail(data) {
      let routeData = this.$router.resolve({
        name: "sonarDetail",
        query: {
          projectKey: data.projectKey
        }
      });
      window.open(routeData.href, "_blank");
    },

    viewDrawer(projectKey,point) {
      let _self = this;
      _self.drawer = true;

      if(point == 'CODE_SMELL' ||point == 'BUG'||point == 'VULNERABILITY'||point =='SECURITY_HOTSPOT'){
        _self.draw.url = "http://sonar.purang.com/project/issues?id="+projectKey+"&resolved=false&types="+point
      }
      if(point == 'duplicated_lines_density' ||point == 'coverage' ){
        _self.draw.url = "http://sonar.purang.com/component_measures?id="+projectKey+"&metric="+point+"&view=list"
      }

    }
  }
};
</script>

<style>
.demo-form-inline {
  padding: 10px 30px 10px 10px;
}
.breq-sum-tips {
  color: #3AB4D7 !important;
  cursor: pointer !important;
}
</style>
