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

    <el-card class="box-card" shadow="hover">
      <div class="sonar-form" id="sonarList">
        <el-form v-model="qform" :inline="true" size="small" label-width="100px">
          <el-form-item label="实例项目名称" prop="projectKey">
            <el-input v-model="qform.projectKey" placeholder="请输入" clearable></el-input>
          </el-form-item>
          <el-form-item style="float:right">
            <el-button v-no-more-click type="primary" icon="el-icon-search" @click="querySonarHistories()">查询</el-button>
            <el-button v-no-more-click type="primary" icon="el-icon-data-analysis" @click="dialogSonarVisible = true">立即扫描
            </el-button>
          </el-form-item>
        </el-form>

        <el-table
          :data="sonarScanResults"
          empty-text="暂无扫描记录"
          :max-height="tableHeight"
          size="medium"
          stripe
          :border="showBorder"
          v-loading="queryLoading"
          element-loading-text="查询中..."
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)">
          <el-table-column prop="projectKey" label="实例项目名称" align="center">
          </el-table-column>
          <el-table-column prop="gitBranch" label="分支版本" align="center">
          </el-table-column>
          <el-table-column prop="submitter" label="触发人" width="80" align="center">
          </el-table-column>
          <el-table-column prop="startTime" label="提交时间" width="150" align="center">
          </el-table-column>
          <el-table-column prop="analysisStatus" label="扫描结果" width="80" align="center">
            <template slot-scope="scope">
              <span class="red" v-if="scope.row.analysisStatus==='ERROR'"><b> {{"未通过"}} </b></span>
              <span class="green" v-else-if="scope.row.analysisStatus==='OK'"><b> {{"通过"}} </b></span>
              <span class="wait" v-else><b> {{"暂无数据"}} </b></span>
            </template>
          </el-table-column>
          <el-table-column prop="ncloc" label="代码行数" width="100" align="center">
          </el-table-column>
          <el-table-column prop="coverage" label="单元测试覆盖率" width="110" align="center">
            <template slot-scope="scope">
              <span class="red" v-if="scope.row.coverage===0"><b> {{0}} </b></span>
              <span v-else-if="scope.row.coverage===null"><b> {{""}} </b></span>
              <span class="wait" v-else><b> {{scope.row.coverage+"%"}} </b></span>
            </template>
          </el-table-column>
          <el-table-column prop="duplicatedLinesDensity" label="重复比例" width="100" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.duplicatedLinesDensity===null"><b> {{""}} </b></span>
              <span class="green" v-else-if="scope.row.duplicatedLinesDensity<25"><b> {{scope.row.duplicatedLinesDensity+"%"}} </b></span>
              <span class="common" v-else-if="scope.row.duplicatedLinesDensity>=25 && scope.row.duplicatedLinesDensity<=40"><b> {{scope.row.duplicatedLinesDensity+"%"}} </b></span>
              <span class="red" v-else-if="scope.row.duplicatedLinesDensity>=40"><b> {{scope.row.duplicatedLinesDensity+"%"}} </b></span>
            </template>
          </el-table-column>
          <el-table-column prop="codeSmells" label="潜在问题" width="100" align="center">
          </el-table-column>
          <el-table-column prop="bugs" label="缺陷数(bug)" width="100" align="center">
          </el-table-column>
          <el-table-column prop="vulnerabilities" label="安全威胁" width="100" align="center">
          </el-table-column>
          <el-table-column prop="sqaleIndex" label="技术债(小时)" width="110px" align="center">
          </el-table-column>
          <el-table-column label="详情" width="80px" align="center">
            <template slot-scope="scope">
              <el-button v-no-more-click type="text" @click="viewDetail(scope.row)">查看详情</el-button>
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

    <el-dialog :close-on-click-modal="modalClose" title="项目扫描" :visible.sync="dialogSonarVisible" width="50%">
      <el-form
        :rules="rules"
        ref="sonarProjects"
        class="demo-form-inline"
        :model="sonarScan"
        label-width="100px"
        size="medium">
        <el-form-item label="填写项目:" prop="sonarProjectNames">
          <el-input v-model=" sonarScan.sonarProjectNames" style="width:98%" placeholder="项目名称之间请用逗号分隔,例：project1,project2" clearable></el-input>
        </el-form-item>
        <el-form-item label="Git分支:" prop="gitBranch">
          <el-input v-model="sonarScan.gitBranch" style="width:98%" placeholder="例：release/JRC1.2.1或master或feature1123" filterable clearable>
          </el-input>
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
      qform: {
        projectKey: ""
      },
      time: null,
      noteId: null,
      rel_code: null,
      sonarScanResults: [],
      releases: [],
      rel_code: null,
      sonarProjectNames: [],
      projectEntry: [{
        instance: "",
        paramValue: "",
        projectName: ""
      }],
      sonarScan: {
        gitBranch: this.rel_code,
        sonarProjectNames: ""
      },
      dialogSonarVisible: false,
      rules: {
        sonarProjectNames: [{
          required: true,
          message: "请填写扫描项目",
          trigger: "blur"
        }],
        gitBranch: [{
          required: true,
          message: "请填写项目分支",
          trigger: "blur"
        }]
      }
    };
  },

  created() {
    this.querySonarHistories(this);
    this.productId = sessionStorage.productId;
    this.qform.projectKey = "";
    // this.timer = setInterval(() => {
    //   if (document.getElementById("sonarList") === null) {
    //     clearInterval(this.timer);
    //     return;
    //   }
    //   this.querySonarHistories(this);
    // }, 2000)
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
          submitter: sessionStorage.userId,
          projectKeys: _self.sonarScan.sonarProjectNames.split(",")
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
    }
  }
};
</script>

<style>
.demo-form-inline {
  padding: 10px 30px 10px 10px;
}

.box-card {
  width: 100%;
}

.red {
  color: #a70f27;
}

.green {
  color: #4ca720;
}

.wait {
  color: #1671a7;
}

.common {
  color: #3799a7;
}
</style>
