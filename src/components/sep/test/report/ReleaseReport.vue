<template>
  <div class="report-main" ref="reporter">
    <div class="report-header" id="report-header">{{ baseInfo.title }}</div>
    <div class="report-content">
      <div style="float: right">
        <el-dialog
          title="发送中..."
          custom-class="emali-class"
          :visible.sync="isSendEmail"
          width="20%"
          :modal="modal"
          :show-close="showClose">
          <span>
            <el-progress :percentage="process"></el-progress>
          </span>
        </el-dialog>
      </div>

      <div class="sum-info">
        <a class="confirm-send" @click="sendEmail" v-if="img && img != '' && isDisplayed" ref="confirmSend">
          <i class="el-icon-message"></i> 一键发送邮件
        </a>
        <a class="confirm-send" :href="emailSet" v-if="img && img != '' && isDisplayed" ref="confirmSend">
          <i class="el-icon-message"></i> 发送邮件
        </a>
        <!-- <el-button v-no-more-click class="confirm-send" @click="confirmRelease" v-if="img && img != '' && isDisplayed">
          <i class="iconfont icon-release"></i> 发布生产
        </el-button> -->
      </div>
      <div class="titles top-target">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>
            <i class="iconfont icon-homepage_fill"></i> 测试情况概览</el-breadcrumb-item>
          <el-breadcrumb-item>出口标准及结论</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-table
        :data="reportSum"
        size="mini"
        :border="showBorder"
        stripe
        class="sum-info"
        :cell-class-name="standardCheck"
        v-loading.fullscreen.lock="sumLoading"
        element-loading-text="数据较多，请耐心等待..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column type="index" label="序号" width="100" align="center">
        </el-table-column>
        <el-table-column prop="standard" label="标准定义" min-width="35%" align="right" header-align="center">
        </el-table-column>
        <el-table-column prop="actData" label="实际数据" min-width="30%" align="center">
        </el-table-column>
        <el-table-column prop="result" label="结论" min-width="30%" align="center">
        </el-table-column>
      </el-table>
      <div class="titles">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>
            <i class="iconfont icon-homepage_fill"></i> 测试情况概览</el-breadcrumb-item>
          <el-breadcrumb-item>应急预案说明</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="sum-info">
        <el-input type="textarea" :rows="2" v-model="emergencyPlan" :placeholder="emergency"></el-input>
      </div>
      <div class="titles">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>
            <i class="iconfont icon-homepage_fill"></i> 测试情况概览</el-breadcrumb-item>
          <el-breadcrumb-item>综合结论</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="sum-info">
        <el-radio-group v-model="result">
          <el-radio label=1 key=1 border :disabled="majorFail || miniFail">测试通过，同意发布生产</el-radio>
          <el-radio label=2 key=2 border>测试不通过，不同意发布生产</el-radio>
          <el-radio label=3 key=3 border :disabled="majorFail">测试不通过，但应急预案经确认可行，同意发布</el-radio>
        </el-radio-group>
      </div>

      <el-collapse v-model="activeName" accordion>
        <el-collapse-item name="releaseReq">
          <template slot="title">
            <i class="el-icon-info"></i>
            <span v-if="activeName=='releaseReq'"> 版本产品需求</span>
            <span v-else> 版本产品需求( 共 {{reqs.length}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="reqs" size="mini" stripe class="sum-info">
            <el-table-column type="index" label="序号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="id" label="产品需求号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="summary" label="需求摘要" header-align="center">
            </el-table-column>
            <el-table-column prop="priorityName" label="紧急程度" width="100" align="center">
            </el-table-column>
            <el-table-column prop="moduleName" label="所属模块" width="100" align="center">
            </el-table-column>
            <el-table-column prop="statusName" label="需求状态" width="100" align="center">
            </el-table-column>
            <el-table-column prop="submitterName" label="需求提交人" width="100" align="center">
            </el-table-column>
            <el-table-column prop="submitDate" label="提交日期" width="100" align="center">
            </el-table-column>
            <el-table-column prop="expectDate" label="期望完成日期" width="100" align="center">
            </el-table-column>
          </el-table>
        </el-collapse-item>

        <el-collapse-item name="releaseCms">
          <template slot="title">
            <i class="el-icon-info"></i>
            <span v-if="activeName=='releaseCms'"> 版本开发任务</span>
            <span v-else> 版本开发任务( 共 {{cms.length}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="cms" stripe size="mini" class="sum-info">
            <el-table-column type="index" label="序号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="id" label="任务编号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="summary" label="任务标题" min-width="40%" header-align="center">
            </el-table-column>
            <el-table-column prop="statusName" label="任务状态" width="100" align="center">
            </el-table-column>
            <el-table-column prop="spliterName" label="任务拆分人" width="100" align="center">
            </el-table-column>
            <el-table-column prop="responserName" label="任务负责人" width="100" align="center">
            </el-table-column>
            <el-table-column prop="manpower" label="人力(人日)" width="100" align="center">
            </el-table-column>
            <el-table-column prop="planBegin" label="计划开始日期" width="100" align="center">
            </el-table-column>
            <el-table-column prop="planTo" label="计划完成日期" width="100" align="center">
            </el-table-column>
          </el-table>
        </el-collapse-item>

        <el-collapse-item name="releaseTms">
          <template slot="title">
            <i class="el-icon-info"></i>
            <span v-if="activeName=='releaseTms'"> 版本测试任务</span>
            <span v-else> 版本测试任务( 共 {{tms.length}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="tms" stripe size="mini" class="sum-info">
            <el-table-column type="index" label="序号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="id" label="任务编号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="reqId" label="所属需求" min-width="40%" header-align="center">
              <template slot-scope="scope">
                <span>{{scope.row.reqId}} - {{scope.row.reqSummary}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="statusName" label="任务状态" width="100" align="center">
            </el-table-column>
            <el-table-column prop="typeName" label="任务类型" width="100" align="center">
            </el-table-column>
            <el-table-column prop="responserName" label="任务负责人" width="100" align="center">
            </el-table-column>
            <el-table-column prop="manpower" label="人力(人日)" width="100" align="center">
            </el-table-column>
            <el-table-column prop="planBegin" label="计划开始" width="100" align="center">
            </el-table-column>
            <el-table-column prop="planTo" label="计划完成" width="100" align="center">
            </el-table-column>
          </el-table>
        </el-collapse-item>

        <el-collapse-item name="releaseCase">
          <template slot="title">
            <i class="el-icon-info"></i>
            <span v-if="activeName=='releaseCase'"> 版本测试集用例</span>
            <span v-else> 版本测试集用例( 共 {{cases.length}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="cases" size="mini" stripe class="sum-info">
            <el-table-column type="index" label="序号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="caseId" label="用例编号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="name" label="用例标题" header-align="center">
            </el-table-column>
            <el-table-column prop="statusName" label="用例状态" width="100" align="center">
            </el-table-column>
            <el-table-column prop="moduleName" label="所属模块" width="100" align="center">
            </el-table-column>
            <el-table-column prop="typeName" label="用例类型" width="100" align="center">
            </el-table-column>
            <el-table-column prop="priorityName" label="用例优先级" width="100" align="center">
            </el-table-column>
            <el-table-column prop="periodName" label="用例阶段" width="100" align="center">
            </el-table-column>
            <el-table-column prop="designerName" label="用例设计人" width="100" align="center">
            </el-table-column>
          </el-table>
        </el-collapse-item>

        <el-collapse-item name="releaseBug">
          <template slot="title">
            <i class="el-icon-info"></i>
            <span v-if="activeName=='releaseBug'"> 版本测试缺陷</span>
            <span v-else> 版本测试缺陷( 共 {{defects.length}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="defects" size="mini" stripe class="sum-info">
            <el-table-column type="index" label="序号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="id" label="缺陷编号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="summary" label="缺陷摘要" header-align="center">
            </el-table-column>
            <el-table-column prop="statusName" label="缺陷状态" width="100" align="center">
            </el-table-column>
            <el-table-column prop="submitterName" label="提交人" width="100" align="center">
            </el-table-column>
            <el-table-column prop="responserName" label="修复责任人" width="100" align="center">
            </el-table-column>
            <el-table-column prop="productorName" label="产品经理" width="100" align="center">
            </el-table-column>
            <el-table-column prop="foundPeriodName" label="发现阶段" width="100" align="center">
            </el-table-column>
            <el-table-column prop="defectPeriodName" label="植入阶段" width="100" align="center">
            </el-table-column>
            <el-table-column prop="influenceName" label="严重程度" width="100" align="center">
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>

      <div class="titles">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>
            <i class="iconfont icon-analyze"></i> 版本分析</el-breadcrumb-item>
          <el-breadcrumb-item>数据透视</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="sum-info">
        <div class="rel-charts-big">
          <v-direction :ddirection="defectDirection" v-if="defectDirection != null && defectDirection!=''"></v-direction>
        </div>
      </div>
      <div class="sum-info">
        <div class="rel-charts">
          <v-module :dmodules="defectDistribute.defectModule" v-if="hasData(defectDistribute.defectModule)"></v-module>
          <h1 v-if="!hasData(defectDistribute.defectModule)" class="no-data">缺陷模块分布<br><br>暂无数据</h1>
        </div>
        <div class="rel-charts" style="float: right">
          <v-requirements :drequirements="defectDistribute.defectReqirements" v-if="hasData(defectDistribute.defectReqirements)"></v-requirements>
          <h1 v-if="!hasData(defectDistribute.defectReqirements)" class="no-data">缺陷需求分布<br><br>暂无数据</h1>
        </div>
      </div>
      <div class="sum-info">
        <div class="rel-charts">
          <v-founder :dfounders="defectDistribute.defectFounder" v-if="hasData(defectDistribute.defectFounder)"></v-founder>
          <h1 v-if="!hasData(defectDistribute.defectFounder)" class="no-data">缺陷提交人<br><br>暂无数据</h1>
        </div>
        <div class="rel-charts" style="float: right">
          <v-responser :dresponsers="defectDistribute.defectResponser" v-if="hasData(defectDistribute.defectResponser)"></v-responser>
          <h1 v-if="!hasData(defectDistribute.defectResponser)" class="no-data">缺陷负责人<br><br>暂无数据</h1>
        </div>
      </div>
      <div class="sum-info">
        <div class="rel-charts">
          <v-influence :dinfluences="defectDistribute.defectInfluence" v-if="hasData(defectDistribute.defectInfluence)"></v-influence>
          <h1 v-if="!hasData(defectDistribute.defectInfluence)" class="no-data">缺陷严重程度<br><br>暂无数据</h1>
        </div>
        <div class="rel-charts" style="float: right">
          <v-fix-times :dftimes="defectDistribute.defectFixTimes" v-if="hasData(defectDistribute.defectFixTimes)"></v-fix-times>
          <h1 v-if="!hasData(defectDistribute.defectFixTimes)" class="no-data">缺陷修复次数<br><br>暂无数据</h1>
        </div>
      </div>
      <div class="sum-info">
        <div class="rel-charts">
          <v-fix-cost :dfcosts="defectDistribute.defectFixCost" v-if="hasData(defectDistribute.defectFixCost)"></v-fix-cost>
          <h1 v-if="!hasData(defectDistribute.defectFixCost)" class="no-data">缺陷修复时效<br><br>暂无数据</h1>
        </div>
        <div class="rel-charts" style="float: right">
          <v-verify-cost :dvcosts="defectDistribute.defectVerifyCost" v-if="hasData(defectDistribute.defectVerifyCost)"></v-verify-cost>
          <h1 v-if="!hasData(defectDistribute.defectVerifyCost)" class="no-data">缺陷验证时效<br><br>暂无数据</h1>
        </div>
      </div>
      <div class="titles">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>
            <i class="iconfont icon-analyze"></i> 版本分析</el-breadcrumb-item>
          <el-breadcrumb-item>过程优化建议</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="sum-info">
        <el-input type="textarea" :rows="2" v-model="sqaSuggestion" :placeholder="suggestion"></el-input>
      </div>
      <div class="titles" v-show="isDisplayed">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>
            <i class="iconfont icon-mail_fill"></i> 报告发送确认</el-breadcrumb-item>
          <el-breadcrumb-item>计划收件人列表</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-table :data="emails" size="small" stripe class="sum-info" v-show="isDisplayed">
        <el-table-column prop="to" label="主送人" min-width="50%" align="center">
        </el-table-column>
        <el-table-column prop="cc" label="抄送人" min-width="50%" align="center">
        </el-table-column>
      </el-table>
      <div class="titles" v-show="isDisplayed">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>
            <i class="iconfont icon-mail_fill"></i> 报告发送确认</el-breadcrumb-item>
          <el-breadcrumb-item>临时补充收件人</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="sum-info" v-show="isDisplayed">
        <el-form v-model="emailForm" inline>
          <el-form-item label="主送人">
            <el-input type="textarea" :rows="2" v-model="emailForm.to" placeholder="多个收件人使用逗号分隔"></el-input>
          </el-form-item>
          <el-form-item label="抄送人" style="float: right">
            <el-input type="textarea" :rows="2" v-model="emailForm.cc" placeholder="多个收件人使用逗号分隔"></el-input>
          </el-form-item>
        </el-form>
        <el-button v-no-more-click type="primary" @click="campture()" style="float:right;margin-right:5px;margin-bottom:20px">
          <i class="el-icon-success"></i> 信息确认
        </el-button>
      </div>
    </div>
    <img v-show="false" ref="hiddenSrc" :src="img" />
  </div>
</template>

<script>
import defectDirection from "@/components/sep/analysis/DefectDirection.vue";
import defectModule from "@/components/sep/analysis/DefectModule.vue";
import defectReqirements from "@/components/sep/analysis/DefectReqirements.vue";
import defectFounder from "@/components/sep/analysis/DefectFounder.vue";
import defectResponser from "@/components/sep/analysis/DefectResponser.vue";
import defectFixTimes from "@/components/sep/analysis/DefectFixTimes.vue";
import defectInfluence from "@/components/sep/analysis/DefectInfluence.vue";
import defectFixCost from "@/components/sep/analysis/DefectFixCost.vue";
import defectVerifyCost from "@/components/sep/analysis/DefectVerifyCost.vue";
import html2canvas from "html2canvas/dist/html2canvas.min.js";
import commonQuery from "@/components/util/CommonQuery.vue";
export default {
  data: function () {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      urlParams: {},
      reportSum: [],
      defectDirection: [],
      defectDistribute: [],
      result: "",
      activeName: "",
      majorFail: false,
      miniFail: false,
      sumLoading: false,
      emergencyPlan: "",
      emergency: "1、未关闭缺陷的应急处理方式，必须经产品、运维、开发、测试共同认可，该方案仅适用于上表标准5、6\n2、版本全量或者部分回滚的处理方案",
      sqaSuggestion: "",
      suggestion: "1、产品需求与设计角度\n2、版本管理、开发、测试等环节",
      reportId: "",
      users: [],
      baseInfo: {},
      reportTypes: [],
      testPeriod: [],
      reqs: [],
      cms: [],
      tms: [],
      cases: [],
      defects: [],
      emails: [],
      img: "",
      isDisplayed: true,
      emailSet: "",
      tos: [],
      ccs: [],
      imgUrl: "",
      subject: "",
      emailTo: "",
      emailCc: "",
      modal: false,
      showClose: false,
      isSendEmail: false,
      process: 0,
      timer: "",
      emailForm: {
        to: "",
        cc: ""
      }
    };
  },

  components: {
    vDirection: defectDirection,
    vModule: defectModule,
    vRequirements: defectReqirements,
    vFounder: defectFounder,
    vResponser: defectResponser,
    vInfluence: defectInfluence,
    vFixTimes: defectFixTimes,
    vFixCost: defectFixCost,
    vVerifyCost: defectVerifyCost
  },

  created() {
    let _self = this;

    _self.reportTypes.splice(0, _self.reportTypes.length);
    let reportType = localStorage.getItem("reportType");
    eval(reportType).forEach(item => {
      _self.reportTypes.push({
        value: item.typeId,
        label: item.typeName
      });
    });

    _self.testPeriod.splice(0, _self.testPeriod.length);
    let testPeriod = localStorage.getItem("testPeriod");
    eval(testPeriod).forEach(item => {
      _self.testPeriod.push({
        value: item.periodId,
        label: item.periodName
      });
    });

    _self.reportId = this.$route.query.reportId;
    _self.$nextTick(function () {
      _self.reportQuery();
    });
  },

  methods: {
    sendEmail() {
      let _self = this;
      if (commonQuery.isNull(_self.emailTo) && commonQuery.isNull(_self.emailCc)) {
        _self.$message.warning("收件人列表为空，请补充信息！");
        return;
      }
      _self.process = 0;
      _self.$axios.post("/file/attach/email::send", {
        imgUrl: _self.imgUrl,
        subject: _self.subject,
        body: _self.body,
        to: _self.emailTo,
        cc: _self.emailCc
      }).then((response) => {
        _self.isSendEmail = true;
        let i = 0;
        _self.timer = setInterval(() => {
          i++;
          _self.process = i * 10;
          if (i >= 11) {
            clearInterval(_self.timer);
            _self.process = 100;
            _self.isSendEmail = false,
              _self.$message.success("邮件发送成功");
            return;
          }
        }, 100);
      }).catch((e) => {
        _self.isSendEmail = true;
        let i = 0;
        _self.timer = setInterval(() => {
          i++;
          if (i >= 9) {
            clearInterval(_self.timer);
            _self.isSendEmail = false,
              _self.$notify.error("邮件发送失败");
            return;
          }
          _self.process = i * 10;
        }, 100);
      })
    },

    hasData(data) {
      return data != null && (data.length > 1 || (data.length === 1 && data[0].num != 0))
    },

    getDefectDirection() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/analysis/defect_direction",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.baseInfo.relId,
            planType: _self.baseInfo.planType
          }
        })
        .then(function (res) {
          _self.defectDirection = eval(res.data);
        })
        .catch(function (response) {
          console.log(response);
        });
    },

    getDefectDistribution() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/analysis/defect_distribution",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.baseInfo.relId,
            planType: _self.baseInfo.planType
          }
        })
        .then(function (res) {
          _self.defectDistribute = res.data;
        })
        .catch(function (response) {
          console.log(response);
        });
    },

    getSummary() {
      let _self = this;
      _self.sumLoading = true;
      let params =
        _self.baseInfo.reportType == 1 ?
        {
          relId: _self.baseInfo.relId,
          reportId: _self.reportId,
          reportDate: _self.baseInfo.reportDate,
          planType: _self.baseInfo.planType
        } :
        {
          relId: _self.baseInfo.relId,
          reportId: _self.reportId,
          planType: _self.baseInfo.planType
        };
      _self.$axios({
          method: "post",
          url: "/report/sum_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: params
        })
        .then(function (res) {
          let json = res.data;
          let tableData = [];
          tableData.push({
            standard: "需求测试用例覆盖率100%",
            actData: (json.coveredReq * 100 / json.totalReq).toFixed(2) +
              "% (" +
              json.coveredReq +
              "/" +
              json.totalReq +
              ")",
            result: json.coveredReq / json.totalReq < 1 ? "不通过" : "通过"
          });
          tableData.push({
            standard: "测试用例执行率100%",
            actData: (json.runedCase * 100 / json.totalCase).toFixed(2) +
              "% (" +
              json.runedCase +
              "/" +
              json.totalCase +
              ")",
            result: json.runedCase / json.totalCase < 1 ? "不通过" : "通过"
          });
          tableData.push({
            standard: "测试用例执行通过率95%",
            actData: (json.passedCase * 100 / json.totalCase).toFixed(2) +
              "% (" +
              json.passedCase +
              "/" +
              json.totalCase +
              ")",
            result: json.passedCase / json.totalCase < 0.95 ? "不通过" : "通过"
          });
          tableData.push({
            standard: "致命、严重级别的未关闭缺陷数为0",
            actData: json.lTopNc,
            result: json.lTopNc > 0 ? "不通过" : "通过"
          });
          tableData.push({
            standard: "一般级别的遗留缺陷率应低于总缺陷数的5%",
            actData: (json.lMidNc * 100 / json.totalDefect).toFixed(2) +
              "% (" +
              json.lMidNc +
              "/" +
              json.totalDefect +
              ")",
            result: json.lMidNc / json.totalDefect > 0.05 ? "不通过" : "通过"
          });
          tableData.push({
            standard: "建议类遗留缺陷率总和应低于10%",
            actData: (json.lLowNc * 100 / json.totalDefect).toFixed(2) +
              "% (" +
              json.lLowNc +
              "/" +
              json.totalDefect +
              ")",
            result: json.lLowNc / json.totalDefect > 0.1 ? "不通过" : "通过"
          });
          for (let i = 0; i < tableData.length - 2; i++) {
            if (tableData[i].result.indexOf("不通过") > -1) {
              _self.majorFail = true;
              break;
            }
          }
          for (let i = 4; i < tableData.length; i++) {
            if (tableData[i].result.indexOf("不通过") > -1) {
              _self.miniFail = true;
              break;
            }
          }
          _self.reportSum = tableData;
          _self.reqs = json.relReq;
          _self.cases = json.relCase;
          _self.defects = json.relDefect;
          _self.$nextTick(function () {
            _self.sumLoading = false;
          });
        })
        .catch(function (response) {
          _self.sumLoading = false;
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    standardCheck({
      row,
      column,
      rowIndex,
      columnIndex
    }) {
      if (row.result && columnIndex === 3) {
        if (row.result.indexOf("不通过") > -1) {
          return "failed-items";
        } else {
          return "passed-items";
        }
      }
    },

    campture() {
      let _self = this;

      if (!sessionStorage.userId) {
        _self.$message.warning("您未登录，不可操作该功能！");
        return;
      }
      if (!_self.result || _self.result == "") {
        _self.$message.info("请选择测试结论！");
        return;
      }
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      _self.isDisplayed = false;
      _self.$nextTick(function () {
        setTimeout(() => {
          html2canvas(document.body).then(function (canvas) {
            let base64img = canvas.toDataURL("image/png");
            let data = window.atob(base64img.split(",")[1]);
            var ia = new Uint8Array(data.length);
            for (var i = 0; i < data.length; i++) {
              ia[i] = data.charCodeAt(i);
            }
            let blob = new Blob([ia], {
              type: "image/png"
            });
            _self.upload(blob);
          });
        }, 200);
      });
    },

    confirmRelease() {
      this
        .$confirm("是否提交生产环境发布？", "操作提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
        })
        .catch(() => {
        });
    },

    updateTestReport(url) {
      let _self = this;
      _self.$axios.post("/report/update", {
        id: _self.reportId,
        emergencyPlan: _self.emergencyPlan,
        sqaSuggestion: _self.sqaSuggestion,
        url: url
      })
    },

    reportQuery() {
      let _self = this;
      _self.$axios.post("/report/info_query/" + _self.reportId)
        .then(function (res) {
          let json = eval(res.data);
          if (json.length === 0) {
            _self.$message.info("数据异常，无法查询报告信息");
            return;
          } else {
            _self.baseInfo = json[0];
          }
          _self.baseInfo.namedType = _self.reportTypes.find(item => {
            return item.value == json[0].reportType;
          }).label;
          _self.baseInfo.namedPlan =
            json[0].planType == 0 ?
            "" :
            _self.testPeriod.find(item => {
              return item.value == json[0].planType;
            }).label;
          if (json[0].emailTo && json[0].emailTo != "") {
            _self.tos = Array.from(new Set(json[0].emailTo.split(",")));
          }
          if (json[0].emailCc && json[0].emailCc != "") {
            _self.ccs = Array.from(new Set(json[0].emailCc.split(",")));
          }
          let len =
            _self.tos.length > _self.ccs.length ?
            _self.tos.length :
            _self.ccs.length;
          for (let z = 0; z < len; z++) {
            let to = z > _self.tos.length ? "" : _self.tos[z];
            let cc = z > _self.ccs.length ? "" : _self.ccs[z];
            _self.emails.push({
              to: to,
              cc: cc
            });
          }
          _self.$nextTick(function () {
            _self.memberQuery();
            _self.missionQuery();
            _self.testMissionQuery();
          });
          _self.getSummary();
          _self.getDefectDirection();
          _self.getDefectDistribution();
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    missionQuery() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/cms/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.baseInfo.relId
          }
        })
        .then(function (res) {
          _self.cms = eval(res.data.list);
        })
        .catch(function (response) {
          console.log(response);
        });
    },

    testMissionQuery() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/tms/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.baseInfo.relId
          }
        })
        .then(function (res) {
          _self.tms = eval(res.data.list);
        })
        .catch(function (response) {
          console.log(response);
        });
    },

    memberQuery() {
      let result = commonQuery.memberQueryProduct(this.baseInfo.productId);
      this.users = result.users;
    },

    upload(data) {
      let _self = this;
      let resStr = "";
      if (_self.result == "1") {
        resStr = "测试通过，同意发布生产";
      } else if (_self.result == "2") {
        resStr = "测试不通过，不同意发布生产";
      } else if (_self.result == "3") {
        resStr = "测试不通过，但应急预案经确认可行，同意发布";
      }
      let datas = new FormData();
      datas.append("file", data, data.name || "");
      _self.$axios({
          method: "post",
          url: "/file/base64img_upload",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          data: datas
        })
        .then(function (res) {
          _self.img = res.data.url;
          _self.imgUrl = res.data.url;
          _self.$nextTick(function () {
            let _self = this;
            _self.updateTestReport(_self.img);
            let maxWidth = document.body.clientWidth * 4 / 5;
            let to = _self.tos;
            let cc = _self.ccs;
            let newtos = _self.emailForm.to;
            let newccs = _self.emailForm.cc;
            if (newtos && newtos != "") {
              to = _self.tos.concat(newtos.split(","));
            }
            if (newccs && newccs != "") {
              cc = _self.ccs.concat(newccs.split(","));
            }
            _self.emailTo = to;
            _self.emailCc = cc;
            let subject =
              "【" +
              _self.baseInfo.productName +
              "】【" +
              _self.baseInfo.relCode +
              "】" +
              _self.baseInfo.namedPlan +
              _self.baseInfo.namedType;
            let body =
              "各位领导，同事：<br>" +
              "<span style='margin-left:20px'>【" +
              _self.baseInfo.productName +
              "】【" +
              _self.baseInfo.relCode +
              "】" +
              _self.baseInfo.namedPlan +
              "工作结束。</span><br><br><span style='margin-left:20px'>本次测试结论为： " +
              "</span><br><span style='margin-left:40px'>" + resStr + "！</span><br><br>" +
              "<span style='margin-left:20px'>附测试报告：</span><br>" +
              "<span style='margin-left:40px'><a href='" +
              window.location.href +
              "'><img style='width:" +
              maxWidth +
              "px' src='" +
              _self.img +
              "' /></a></span>";
            _self.subject = subject;
            _self.body = body;
            _self.emailSet =
              "mailto:" +
              to +
              "?cc=" +
              cc +
              "&subject=" +
              subject +
              "&body=" +
              body;
            _self.$message.success("确认报告信息完成！");
            _self.isDisplayed = true;
          });
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    }
  }
};
</script>

<style>
body {
  background: none;
  overflow-y: auto;
  position: absolute;
  margin: 0;
  padding: 0;
}

.titles {
  font-size: 16px;
  margin: 20px 0 10px 0;
}

.titles .el-icon-info {
  font-size: 14px;
}

.report-main {
  height: 100%;
  width: 91%;
  position: absolute;
  left: 4%;
}

.report-main img {
  position: absolute;
  left: -4%;
}

.report-header {
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding-top: 30px;
}

.report-content {
  padding: 30px;
  border-radius: 2px;
  background-color: #fff;
}

.report-content .el-table .cell {
  text-overflow: normal !important;
  white-space: normal !important;
}

.sum-info {
  margin: 1.5%;
  padding: 0;
  width: 96.5%;
  display: block;
}

.sum-info .el-table {
  width: 100%;
}

.sum-info * {
  font-size: 13px;
}

.rel-charts-big {
  width: 100%;
  height: 300px;
  border-radius: 2px;
  background-color: #3b434e;
  display: inline-block;
  border: 1px solid #e4edf3;
}

.rel-charts {
  width: 49%;
  height: 300px;
  border-radius: 2px;
  background-color: #3b434e;
  display: inline-block;
  border: 1px solid #e4edf3;
}

.table-expand {
  font-size: 0;
}

.table-expand label {
  width: 110px;
  color: #31394a;
}

.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}

.sum-info .el-form-item {
  width: 50%;
  margin-right: 0;
}

.sum-info .cell {
  line-height: 20px;
}

.sum-info .el-form-item+.sum-info .el-form-item {
  margin-left: 1%;
}

.sum-info .el-form-item__label {
  width: 10%;
}

.sum-info .el-form-item__content {
  width: 90%;
}

.confirm-send {
  float: right;
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  padding: 12px 20px;
  margin-left: 10px;
  border-radius: 2px;
  display: block;
}

.confirm-send:hover {
  color: #fff;
  border-color: #66b1ff;
  background-color: #66b1ff;
}

.passed-items {
  background-color: #90ee90 !important;
  color: #000;
  font-weight: 700;
}

.failed-items {
  background-color: #ffa07a !important;
  color: #000;
  font-weight: 700;
}

.no-data {
  font-size: 20px;
  text-align: center;
  margin-top: 15%;
  font-weight: 700;
  color: #fff;
}

.emali-class {
  color: #EE6F6F !important;
  margin-top: 0 !important;
  float: right !important;
}
</style>
