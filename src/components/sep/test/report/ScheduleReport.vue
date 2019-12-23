<template>
  <div class="report-main" ref="reporter">
    <div class="report-header">{{ baseInfo.title }}</div>
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
      </div>
      <div class="titles">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>
            <i class="iconfont icon-calendar"></i> 测试进度情况</el-breadcrumb-item>
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
        <el-table-column type="index" label="序号" width="50" align="center">
        </el-table-column>
        <el-table-column prop="standard" label="进度指标" min-width="25%" align="right" header-align="center">
        </el-table-column>
        <el-table-column prop="planData" label="计划数据" min-width="20%" align="center">
        </el-table-column>
        <el-table-column prop="actData" label="实际数据" min-width="20%" align="center">
        </el-table-column>
        <el-table-column prop="result" label="进度情况" min-width="20%" align="center">
        </el-table-column>
      </el-table>

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
            <el-table-column prop="id" label="所属需求" min-width="40%" header-align="center">
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
import html2canvas from "html2canvas/dist/html2canvas.min.js";
import {
  dateFormat
} from "@/util/date.js";
import commonQuery from "@/components/util/CommonQuery.vue";
export default {
  data: function () {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      urlParams: {},
      reportSum: [],
      result: "",
      activeName: "",
      sumLoading: false,
      reportId: "",
      users: [],
      periods: [],
      datefmt: defaultDateFormat,
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

    getSummary() {
      let _self = this;
      let begin = _self.baseInfo.planBegin.split("-");
      let end = _self.baseInfo.planEnd.split("-");

      let dateS = new Date(begin[0], begin[1] - 1, begin[2]);
      let dateE = new Date(end[0], end[1] - 1, end[2]);
      let date = dateS;
      let strDate;
      _self.periods.splice(0, _self.periods.length);
      while (date <= dateE) {
        strDate = dateFormat(date, _self.datefmt);
        if (date.getDay() != 0 && date.getDay() != 6) {
          _self.periods.push({
            planDate: strDate
          });
        }
        date.setTime(date.getTime() + 3600 * 1000 * 24);
      }
      let daily = (100 / _self.periods.length).toFixed(2);
      for (let zz = 0; zz < _self.periods.length; zz++) {
        let current = _self.periods[zz];
        _self.$set(current, "planRatio", daily * (zz + 1));
        _self.periods.splice(zz, 1, current);
      }

      _self.sumLoading = true;
      let params =
        _self.baseInfo.reportType === 1 ?
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
            standard: "需求测试用例覆盖率",
            planData: "100%",
            actData: (json.coveredReq * 100 / json.totalReq).toFixed(2) +
              "% (" +
              json.coveredReq +
              "/" +
              json.totalReq +
              ")",
            result: json.coveredReq / json.totalReq < 1 ? "异常" : "正常"
          });
          let planRatio = _self.periods.find(item => {
            return item.planDate === dateFormat(new Date(_self.baseInfo.reportDate), _self.datefmt);
          }).planRatio;
          tableData.push({
            standard: "测试用例执行率",
            planData: planRatio + "%",
            actData: (json.runedCase * 100 / json.totalCase).toFixed(2) +
              "% (" +
              json.runedCase +
              "/" +
              json.totalCase +
              ")",
            result: json.runedCase / json.totalCase < planRatio / 100 ? "异常" : "正常"
          });
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
      if (row.result && columnIndex === 4) {
        if (row.result.indexOf("异常") > -1) {
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
            return item.value === json[0].reportType;
          }).label;
          _self.baseInfo.namedPlan =
            json[0].planType === 0 ?
            "" :
            _self.testPeriod.find(item => {
              return item.value === json[0].planType;
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

            let subject = _self.baseInfo.title;
            let resulting = _self.reportSum.find(d => {
              return d.result === "异常";
            });
            let namedRes = "异常";
            if (!resulting || resulting === null || resulting === '') {
              namedRes = "正常";
            }
            let body =
              "各位领导，同事：<br>" +
              "<span style='margin-left:20px'>截至 " + _self.baseInfo.reportDate + "，【" +
              _self.baseInfo.productName +
              "】【" +
              _self.baseInfo.relCode +
              "】" +
              _self.baseInfo.namedPlan +
              "工作进度： " + namedRes +
              "</span><br><br>" +
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
  margin-left: 10px;
  padding: 12px 20px;
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

.emali-class {
  color: #EE6F6F !important;
  margin-top: 0 !important;
  float: right !important;
}
</style>
