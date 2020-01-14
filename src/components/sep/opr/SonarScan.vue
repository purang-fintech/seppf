<template>
  <div id="sonarList">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-tech"></i> 发布构建
        </el-breadcrumb-item>
        <el-breadcrumb-item>发布清单</el-breadcrumb-item>
        <el-breadcrumb-item>代码扫描</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span style="font-size: 15px">代码扫描</span>
        <el-button v-no-more-click style="float:right; padding:3px 0;margin-left:12px" type="text" icon="el-icon-right" @click="releaseQuery(),dialogSonarVisible = true">立即扫描
        </el-button>
        <router-link to="/build" style="margin-right:50px">
          <el-button style="float:right; padding:3px 0" type="text" icon="el-icon-back">返回</el-button>
        </router-link>
      </div>
      <div v-if="sonarScanResults.length > 0">
        <el-collapse v-model="activeNames" v-for="sonarScanResult  in sonarScanResults" :key="sonarScanResult.id">
          <el-collapse-item :title="'Sonar扫描版本: '+sonarScanResult.projectVersion" :name="sonarScanResult.projectVersion">
            <el-table :data="sonarScanResult.sonarScanHistorys" size="small" empty-text="暂无扫描记录" :highlight-current-row="false">
              <el-table-column prop="projectKey" label="实例项目名称" align="center">
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
              </el-table-column>
              <el-table-column prop="duplicatedLinesDensity" label="重复比例" width="80" align="center">
              </el-table-column>
              <el-table-column prop="codeSmells" label="坏味道" width="80" align="center">
              </el-table-column>
              <el-table-column prop="bugs" label="缺陷数" width="80" align="center">
              </el-table-column>
              <el-table-column prop="vulnerabilities" label="安全漏洞" width="80" align="center">
              </el-table-column>
              <el-table-column prop="hotspots" label="命中热点" width="80" align="center">
              </el-table-column>
              <el-table-column prop="sqaleIndex" label="技术债(小时)" width="100" align="center">
              </el-table-column>
              <el-table-column label="详情" width="80" align="center">
                <template slot-scope="scope">
                  <el-button v-no-more-click type="text" @click="viewDetail(scope.row)">查看详情</el-button>
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

    <el-dialog :close-on-click-modal="modalClose" title="选择扫描" :visible.sync="dialogSonarVisible" width="60%">
      <el-form
        :rules="rules"
        ref="sonarProjects"
        class="demo-form-inline"
        :model="sonarScan"
        label-width="100px"
        size="mini">
        <el-form-item label="选择项目:" prop="sonarProjectNames">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAllInstance" @change="handleCheckAllInstance">全选
          </el-checkbox>
          <div style="margin:10px 0"></div>
          <el-checkbox-group v-model="sonarScan.sonarProjectNames" @change="handleCheckedInstanceChange">
            <el-checkbox v-for="project in sonarProjectNames" :label="project" :key="project">
              {{project}}
              <span style="margin-left: 4px"></span>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="Git分支:" prop="gitBranch">
          <el-select v-model="sonarScan.gitBranch" size="small" placeholder="选择或输入" filterable clearable>
            <el-option v-for="item in releases" :value="item.value" :key="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button v-no-more-click @click="dialogSonarVisible = false" size="mini" type="primary" icon="el-icon-close">取消</el-button>
        <el-button v-no-more-click @click="validateAndBuild('sonarProjects')" size="mini" type="primary" icon="el-icon-check">扫描</el-button>
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
      modalClose: sessionStorage.dialogAutoClose == 1,
      checkAllInstance: false,
      isIndeterminate: true,
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
        sonarProjectNames: []
      },
      dialogSonarVisible: false,
      rules: {
        sonarProjectNames: [{
          required: true,
          message: '请选择扫描项目',
          trigger: 'blur'
        }, ],
        gitBranch: [{
          required: true,
          message: '请选择项目分支',
          trigger: 'change'
        }]
      }
    }
  },

  created() {
    this.noteId = this.$route.query.noteId;
    this.sonarScan.gitBranch = "master";

    this.queryProjectNames();
    this.timer = setInterval(() => {
      if (document.getElementById("sonarList") === null) {
        clearInterval(this.timer);
        return;
      }
      this.querySonarHistories(this);
    }, 5000)
  },

  methods: {
    releaseQuery() {
      let _self = this;
      _self.releases.splice(0, _self.releases.length);
      commonQuery.openRelQuerySonar((result) => {
        _self.releases = result.releases;
      })
    },
    querySonarHistories(self) {
      let _self = this;
      _self.$axios.get("/build/sonarScanHistory?noteId=" + this.noteId + "&pageSize=" + 10)
        .then(function (res) {
          _self.sonarScanResults = res.data;
          _self.activeNames = [];
          _self.sonarScanResults.forEach(sonarScanResult => {
            _self.activeNames.push(sonarScanResult.projectVersion);
          });
        })
    },

    buildRunSubmit: function () {
      let _self = this;
      _self.$axios.post("/build/start-sonarScan", {
          productId: sessionStorage.productId,
          noteId: _self.noteId,
          gitBranch: _self.sonarScan.gitBranch,
          submitter: sessionStorage.userId,
          projectKeys: _self.sonarScan.sonarProjectNames,
        })
        .then(function (res) {
          _self.dialogSonarVisible = false;
          _self.$message({
            type: 'success',
            message: '已触发构建'
          });
        }).catch(e => {})
    },

    validateAndBuild(sonarProjects) {
      let _self = this;
      _self.buildRunSubmit();
    },

    handleCheckedInstanceChange(value) {
      let checkedCount = value.length;
      this.checkAllInstance = checkedCount === Object.keys(this.sonarProjectNames).length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < Object.keys(this.sonarProjectNames).length;
    },

    viewDetail(data) {
      let routeData = this.$router.resolve({
        name: 'sonarDetail',
        query: {
          'projectKey': data.projectKey
        }
      });
      window.open(routeData.href, '_blank');
    },

    //全选
    handleCheckAllInstance(value) {
      this.sonarScan.sonarProjectNames = [];
      if (value) {
        Object.values(this.sonarProjectNames).forEach(value => {
          this.sonarScan.sonarProjectNames.push(value);
        });
      }
      this.isIndeterminate = false;
    },

    queryProjectNames() {
      let _self = this;
      var str = "";
      _self.$axios.get("/build/sonarProjectNames/" + this.noteId)

        .then(function (res) {
          if (res.data) {
            _self.projectEntry = res.data;
            _self.projectEntry.forEach(a => {
              if (a.instance == 'subPbq') {
                str = str + "\n" + (a.paramValue)
              } else {
                str = str + "\n" + a.projectName
              }
            })
            _self.sonarProjectNames = str.replace(" ", "\n").trim().split("\n")
          }
        })
    },

  }
}
</script>

<style>
.demo-form-inline {
  padding: 10px 30px 10px 10px;
}
</style>
