<template>
  <div id="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item><i class="iconfont icon-coding"></i> 需求管理</el-breadcrumb-item>
        <el-breadcrumb-item>需求初审</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog title="需求审批处理" :close-on-click-modal="modalClose" :visible.sync="showAuditDialog" width="600px" :before-close="cancelAudit">
      <el-form
        :model="auditResult"
        size="small"
        :inline="false"
        label-width="110px"
        :rules="auditResultRules"
        ref="auditResultForm">
        <el-form-item label="增加审批人" v-if="isCurrentLeader()">
          <el-checkbox size="mini" v-model="auditResult.appendChiefs" @change="setChiefAuditors()" border>增加高管审批人</el-checkbox>
        </el-form-item>
        <el-form-item label="高管审批人" v-if="auditResult.appendChiefs">
          <el-select
            v-if="currentRequest.type==2"
            v-model="auditResult.chiefAuditor"
            placeholder="请选择"
            multiple
            clearable
            style="width:92%">
            <el-option v-for="item in auditResult.itChiefs" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-select
            v-else
            v-model="auditResult.chiefAuditor"
            placeholder="请选择"
            multiple
            clearable
            style="width:92%">
            <el-option v-for="item in auditResult.chiefs" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审批结论" prop="passed" required>
          <el-select v-model="auditResult.passed" placeholder="请选择" style="width:92%" required>
            <el-option v-for="opt in auditResults" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审批意见" prop="auditComment" required>
          <el-input
            v-model="auditResult.auditComment"
            type="textarea"
            style="width:92%"
            :rows="8"
            :maxlength="500"
            show-word-limit
            clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="cancelAudit()">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="checkAuditConfirm()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showReqDetail" width="960px" :fullscreen="maximize" top="100px">
      <div slot="title">
        <span style="font-size:18px">产品需求明细</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>

      <div v-loading.lock="checking" element-loading-text="校验中..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-form
          :model="currentRequest"
          size="mini"
          :inline="true"
          label-width="110px"
          class="req-detail"
          :rules="qFormRules"
          ref="ruledFormMod">
          <el-form-item label="需求类型">
            <el-input v-model="currentRequest.typeName" disabled></el-input>
          </el-form-item>
          <el-form-item label="提交人">
            <el-input v-model="currentRequest.submitterName" disabled></el-input>
          </el-form-item>
          <el-form-item label="提交日期">
            <el-input v-model="currentRequest.submitDate" disabled></el-input>
          </el-form-item>
          <el-form-item label="需求状态">
            <el-input v-model="currentRequest.statusName" disabled></el-input>
          </el-form-item>
          <el-form-item label="紧急程度" prop="priority">
            <el-select v-model="currentRequest.priority" filterable :disabled="currentRequest.disabled">
              <el-option v-for="opt in reqPriority" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="期望完成日期" prop="expectDate">
            <el-date-picker
              type="date"
              v-model="currentRequest.expectDate"
              :value-format="datefmt"
              placeholder="请选择"
              clearable
              :disabled="currentRequest.disabled"></el-date-picker>
          </el-form-item>
          <el-form-item label="需求摘要" prop="summary">
            <el-input v-model="currentRequest.summary" style="width:474px" clearable :disabled="currentRequest.disabled"></el-input>
          </el-form-item>
          <el-form-item label="所属模块" prop="moduleId">
            <el-select v-model="currentRequest.moduleId" clearable :disabled="currentRequest.disabled">
              <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="原型链接">
            <el-input v-model="currentRequest.uiResource" style="width:474px" clearable :disabled="currentRequest.disabled"></el-input>
          </el-form-item>
          <el-form-item label="链接预览" v-if="checkUrl(currentRequest.uiResource)">
            <el-link type="success" :href="currentRequest.uiResource" :underline="false" target="_blank">原型链接</el-link>
          </el-form-item>
          <el-form-item label="需求详情" prop="detail">
            <el-input
              v-model="currentRequest.detail"
              type="textarea"
              :rows="3"
              class="reqaudit-attach"
              clearable
              :maxlength="2000"
              show-word-limit
              :disabled="currentRequest.disabled"></el-input>
          </el-form-item>
          <el-form-item label="附件上传">
            <el-upload
              :disabled="currentRequest.disabled"
              class="reqaudit-attach"
              ref="uploadMod"
              multiple
              drag
              :before-upload="beforeUpload"
              :on-exceed="fileExceeded"
              :on-success="uploadComplete"
              :on-preview="handlePreview"
              :on-remove="handleRemoveMod"
              :file-list="currentRequest.fileList"
              action=""
              :http-request="uploadAction">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或
                <em>点击上传</em>
              </div>
              <div class="el-upload__tip" slot="tip">支持图片、Zip包、Office文档、pdf、html文档，单个文件不超过50MB</div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showReqDetail=false" size="small">关闭</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkReqUpdate('ruledFormMod')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="需求审批情况" :visible.sync="showAuditDetail" width="910px" top="100px">
      <div class="audit-detail" v-if="auditDetails.length>0">
        <el-timeline>
          <el-timeline-item v-for="(item, index) in auditDetails" :timestamp="'由用户 ' + item.submitterName +' 于 ' + item.submitTime + ' 提交送审'" placement="top" :key="index">
            <el-tabs v-model="activeName" type="border-card">
              <el-tab-pane :name="'base' + index" label="基础审批">
                <div v-if="null != item.baseAuditResult && item.baseAuditResult.length > 0">
                  <el-card v-for="(base,index) in item.baseAuditResult" :key="index">
                    <h4 style="margin-bottom:10px">用户 {{base.auditName}} 于 {{base.auditTime}} 审批</h4>
                    <span>审批结论：</span>
                    <span v-if="base.passed == 1" style="color:#6bbd6b;font-weight:600">审批通过</span>
                    <span v-else style="color:#EE6F6F;font-weight:600">审批拒绝</span>
                    <p style="margin-top:5px">审批意见： {{base.auditComment}}</p>
                  </el-card>
                </div>
                <h3 v-else style="text-align:center;margin:20px 0">无基础审批纪录</h3>
              </el-tab-pane>
              <el-tab-pane :name="'leader' + index" label="主管/总监审批">
                <div v-if="null != item.leaderAuditResult && item.leaderAuditResult.length > 0">
                  <el-card v-for="(leader,index) in item.leaderAuditResult" :key="index">
                    <h4 style="margin-bottom:10px">用户 {{leader.auditName}} 于 {{leader.auditTime}} 审批</h4>
                    <span>审批结论：</span>
                    <span v-if="leader.passed == 1" style="color:#6bbd6b;font-weight:600">审批通过</span>
                    <span v-else style="color:#EE6F6F;font-weight:600">审批拒绝</span>
                    <p style="margin-top:5px">审批意见： {{leader.auditComment}}</p>
                  </el-card>
                </div>
                <h3 v-else style="text-align:center;margin:20px 0">无主管/总监审批纪录</h3>
              </el-tab-pane>
              <el-tab-pane :name="'chief' + index" label="高管审批">
                <div v-if="null != item.chiefAuditResult && item.chiefAuditResult.length > 0">
                  <el-card v-for="(chief,index) in item.chiefAuditResult" :key="index">
                    <h4 style="margin-bottom:10px">用户 {{chief.auditName}} 于 {{chief.auditTime}} 审批</h4>
                    <span>审批结论：</span>
                    <span v-if="chief.passed == 1" style="color:#6bbd6b;font-weight:600">审批通过</span>
                    <span v-else style="color:#EE6F6F;font-weight:600">审批拒绝</span>
                    <p style="margin-top:5px">审批意见： {{chief.auditComment}}</p>
                  </el-card>
                </div>
                <h3 v-else style="text-align:center;margin:20px 0">无高管审批纪录</h3>
              </el-tab-pane>
            </el-tabs>
          </el-timeline-item>
        </el-timeline>
      </div>
      <h2 v-else style="text-align:center">尚无审批结论，如需加速审批请线下沟通督促！</h2>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="showAuditDetail=false">关闭</el-button>
      </div>
    </el-dialog>

    <div class="audit-form">
      <el-form
        ref="form"
        :model="auditForm"
        :inline="true"
        size="mini"
        label-width="100px"
        @keydown.native.enter="auditListQuery()">
        <el-form-item label="产品需求号">
          <el-input v-model="auditForm.prId" placeholder="需求编号" clearable>需求编号</el-input>
        </el-form-item>
        <el-form-item label="送审用户">
          <el-select
            v-model="auditForm.submitter"
            placeholder="请选择"
            filterable
            clearable
            :filter-method="filterUsers"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="送审状态">
          <el-select v-model="auditForm.auditStatus" placeholder="请选择" filterable clearable>
            <el-option v-for="opt in auditStatuses" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="送审日期">
          <el-date-picker
            v-model="auditForm.submitTime"
            type="daterange"
            align="right"
            unlink-panels
            :value-format="datefmt"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="float:right;">
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="auditListQuery()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="dataRevert"
        size="mini"
        :max-height="tableHeight"
        stripe
        :border="showBorder"
        ref="auditTable"
        v-loading="queryLoading"
        element-loading-text="查询中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column prop="prId" label="产品需求" min-width="50%" header-align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span @click="showRequestDetail(scope.row)" class="summary-tips">{{scope.row.prId}} - {{scope.row.reqSummary}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="送审时间" width="140px" align="center" sortable>
        </el-table-column>
        <el-table-column prop="auditDeadline" label="审批截止时间" width="140px" align="center" sortable>
          <template slot-scope="scope">
            <div v-html="scope.row.deadLineHtml"></div>
          </template>
        </el-table-column>
        <el-table-column prop="submitterName" label="送审用户" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column
          prop="baseAuditorName"
          label="基础审批人"
          width="100"
          align="center"
          sortable
          show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-html="scope.row.baseAuditorHtml"></div>
          </template>
        </el-table-column>
        <el-table-column
          prop="leaderAuditorName"
          label="主管审批人"
          min-width="35%"
          align="center"
          sortable
          show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-html="scope.row.leaderAuditorHtml"></div>
          </template>
        </el-table-column>
        <el-table-column
          prop="chiefAuditorName"
          label="高管审批人"
          min-width="15%"
          align="center"
          sortable
          show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-html="scope.row.chiefAuditorHtml"></div>
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审批状态" width="90" align="center" sortable>
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="showAuditHistory(scope.row)">{{scope.row.auditStatus}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60" align="center">
          <template slot-scope="scope">
            <el-button v-no-more-click type="primary" size="mini" @click="beginAudit(scope.row)" :disabled="!scope.row.auditable">审批</el-button>
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
        <el-button
          type="primary"
          class="el-icon-download export-btn"
          size="mini"
          :disabled="tableData.length == 0"
          plain
          @click="exportCSV('需求送审清单数据', 'auditTable')">
          导出CSV
        </el-button>
        <div class="export-tips">导出CSV文件请使用<span>新版本</span>MS Office或者WPS表格工具打开</div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  dateFormat,
  pickOptions
} from "@/util/date.js";
import commonQuery from "@/components/util/CommonQuery.vue";
import TableExport from '@/util/TableExport.js'
export default {
  data: function () {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      tableData: [],
      pageInfo: {},
      maximize: false,
      queryLoading: false,
      datefmt: defaultDateFormat,
      timefmt: defaultTimeFormat,
      tableHeight: "",
      pickOptions: pickOptions,
      auditForm: {
        id: "",
        prId: "",
        submitTime: [],
        auditStatus: 1,
        submitter: ""
      },
      auditStatuses: [{
          value: 1,
          label: "审批中"
        },
        {
          value: 0,
          label: "已完成"
        }
      ],
      auditResults: [{
          value: 1,
          label: "审批通过"
        },
        {
          value: 0,
          label: "审批拒绝"
        }
      ],

      showAuditDialog: false,
      showReqDetail: false,
      currentRequest: {},
      currentAudit: {},
      auditResult: {
        id: "",
        auditor: parseInt(sessionStorage.userId),
        auditTime: "",
        passed: 1,
        auditComment: "",
        chiefAuditor: [],
        appendChiefs: false,
        chiefs: [],
        itChiefs: []
      },
      auditResultRules: {
        passed: {
          required: true,
          message: '请选择审批结论',
          trigger: 'change'
        },
        auditComment: {
          required: true,
          message: '请提供审批意见',
          trigger: 'blur'
        }
      },

      showAuditDetail: false,
      auditDetails: [],
      activeName: "base0",

      currentRequestAttaches: [],
      reqPriority: [],
      modules: [],
      checking: false,
      qFormRules: {
        priority: [{
          required: true,
          message: '请选择需求紧急程度',
          trigger: 'change'
        }],
        moduleId: [{
          required: true,
          message: '请选择需求所属模块',
          trigger: 'change'
        }],
        expectDate: [{
          type: 'string',
          required: true,
          message: '请选择期望完成日期',
          trigger: 'blur'
        }],
        summary: [{
            required: true,
            message: '请输入产品需求摘要',
            trigger: 'blur'
          },
          {
            min: 5,
            max: 50,
            message: '长度在 5 到 50 个字',
            trigger: 'blur'
          }
        ],
        detail: [{
          min: 0,
          max: 2000,
          message: '长度不可超过 2000 字，内容过多请上传附件',
          trigger: 'blur'
        }]
      },

      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      members: [],
      memberFull: [],
      userOptions: [],
      params: []
    };
  },

  watch: {
    auditForm: {
      handler() {
        this.currentPage = 1;
        this.queryChanged = true;
      },
      deep: true,
      immediate: true
    },

    'tableData.length': function (val) {
      if (val == 0) {
        this.currentPage = 1;
        this.auditListQuery();
      }
    }
  },

  computed: {
    dataRevert() {
      this.tableData.forEach(row => {
        let passHtml = "<span style='color:#6bbd6b;font-weight:600;font-family:cursive'>√</span>";
        let failHtml = "<span style='color:#ee6f6f;font-weight:600;font-family:cursive'>×</span>";
        this.$set(row, "auditStatus", row.completeTime ? "已完成" : "审批中");
        this.$set(row, "auditable", this.checkAuditable(row));
        if (!commonQuery.isNull(row.baseAuditor) && row.baseAuditResult && row.baseAuditResult[0].passed == 1) {
          this.$set(row, "baseAuditorHtml", row.baseAuditorName + passHtml);
        } else if (!commonQuery.isNull(row.baseAuditor) && row.baseAuditResult && row.baseAuditResult[0].passed == 0) {
          this.$set(row, "baseAuditorHtml", row.baseAuditorName + failHtml);
        } else {
          this.$set(row, "baseAuditorHtml", row.baseAuditorName);
        }
        let now = new Date().getTime();
        let deadLine = new Date(row.auditDeadline).getTime();
        if ((deadLine - now) < 24 * 60 * 60 * 1000 && commonQuery.isNull(row.completeTime)) {
          this.$set(row, "deadLineHtml", "<span style='color:#EE6F6F'>" + row.auditDeadline + "</span>");
        } else {
          this.$set(row, "deadLineHtml", "<span style='color:#606266'>" + row.auditDeadline + "</span>");
        }

        if (!commonQuery.isNull(row.leaderAuditorName) && row.leaderAuditResult) {
          let newLeader = "";
          let leaderNames = row.leaderAuditorName.split("，");
          let auditedNames = [];
          row.leaderAuditResult.forEach(d => {
            auditedNames.push(d.auditName);
          });
          let notAudited = leaderNames.filter(d => {
            return auditedNames.indexOf(d) == -1
          });

          for (let i = 0; i < row.leaderAuditResult.length; i++) {
            let ar = row.leaderAuditResult[i];

            leaderNames.forEach(item => {
              if (item == ar.auditName && ar.passed == 1) {
                newLeader += item + passHtml + (i == row.leaderAuditResult.length - 1 ? "" : "，");
                return;
              } else if (item == ar.auditName && ar.passed == 0) {
                newLeader += item + failHtml + (i == row.leaderAuditResult.length - 1 ? "" : "，");
                return;
              }
            });
          }
          this.$set(row, "leaderAuditorHtml", newLeader + (notAudited.length == 0 ? "" : "，" + notAudited.join("，")));
        } else if (!commonQuery.isNull(row.leaderAuditorName) && !row.leaderAuditResult) {
          this.$set(row, "leaderAuditorHtml", row.leaderAuditorName);
        } else {
          this.$set(row, "leaderAuditorHtml", row.leaderAuditorName);
        }

        if (!commonQuery.isNull(row.chiefAuditorName) && row.chiefAuditResult) {
          let newChief = "";
          let chiefNames = row.chiefAuditorName.split("，");
          let auditedNames = [];
          row.chiefAuditResult.forEach(d => {
            auditedNames.push(d.auditName);
          });
          let notAudited = chiefNames.filter(d => {
            return auditedNames.indexOf(d) == -1
          });

          for (let i = 0; i < row.chiefAuditResult.length; i++) {
            let ar = row.chiefAuditResult[i];

            chiefNames.forEach(item => {
              if (item == ar.auditName && ar.passed == 1) {
                newChief += item + passHtml + (i == row.chiefAuditResult.length - 1 ? "" : "，");
                return;
              } else if (item == ar.auditName && ar.passed == 0) {
                newChief += item + failHtml + (i == row.chiefAuditResult.length - 1 ? "" : "，");
                return;
              }
            });
          }
          this.$set(row, "chiefAuditorHtml", newChief + (notAudited.length == 0 ? "" : "，" + notAudited.join("，")));
        } else if (!commonQuery.isNull(row.chiefAuditorName) && !row.chiefAuditResult) {
          this.$set(row, "chiefAuditorHtml", row.chiefAuditorName);
        } else {
          this.$set(row, "chiefAuditorHtml", row.chiefAuditorName);
        }
      })
      return this.tableData;
    }
  },

  created() {
    let _self = this;
    let params = [];
    for (let p in _self.$route.params) {
      params.push(p);
    }
    if (params.length > 0) {
      _self.auditForm.prId = _self.$route.params.id;
      _self.auditForm.submitTime.splice(0, _self.auditForm.submitTime.length);
    } else {
      let dayS = new Date();
      dayS.setTime(dayS.getTime() - 3600 * 1000 * 24 * 90);
      _self.auditForm.submitTime.push(dateFormat(new Date(dayS), _self.datefmt));
      _self.auditForm.submitTime.push(dateFormat(new Date(), _self.datefmt));
    }

    _self.reqPriority.splice(0, _self.reqPriority.length);
    let requirementPriority = localStorage.getItem("requirementPriority");
    eval(requirementPriority).forEach(item => {
      _self.reqPriority.push({
        value: item.priorityId,
        label: item.priorityName
      });
    }); 

    _self.tableHeight = bodyAviHeightNTab - 70;

    _self.queryChiefs();
    _self.queryITChiefs();
    _self.memberQuery();
    _self.moduleQuery();
    _self.auditListQuery();
  },

  methods: {
    resetFilterText() {
      let _self = this;
      _self.userOptions = _self.memberFull;
    },

    filterUsers(val) {
      let _self = this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },

    queryChiefs() {
      let _self = this;
      commonQuery.roleMemberQuery(sessionStorage.productId, 26, (result) => {
        _self.auditForm.chiefs = result.users;
      });
    },

    queryITChiefs() {
      let _self = this;
      commonQuery.roleMemberQuery(sessionStorage.productId, 30, (result) => {
        _self.auditForm.itChiefs = result.users;
      });
    },

    checkUrl(url) {
      const strRegex = '^((https|http|ftp)?://)';
      let re = new RegExp(strRegex);
      if (re.test(url)) {
        return (true);
      } else {
        return (false);
      }
    },

    showRequestDetail(row) {
      let _self = this;
      _self.showReqDetail = true;
      _self.$axios({
          method: "post",
          url: "/request/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            id: row.prId
          }
        })
        .then(function (res) {
          _self.currentRequest = eval(res.data.list)[0];
          let base = row.baseAuditor ? row.baseAuditor.split(",") : [];
          let isBaseAuditor = base.indexOf(sessionStorage.userId) > -1;
          _self.$set(_self.currentRequest, "disabled", !isBaseAuditor || !_self.checkAuditable(row));

          if (!_self.currentRequest.fileList) {
            _self.$set(_self.currentRequest, "fileList", _self.getAttach(_self.currentRequest.attachment));
          } else {
            _self.currentRequest.fileList = _self.getAttach(_self.currentRequest.attachment);
          }
        })
    },

    checkReqUpdate(formName) {
      let _self = this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交！");
          return;
        } else {
          _self.saveEditRequest();
        }
      });
    },

    saveEditRequest() {
      let _self = this;
      let fileIds = [];
      _self.currentRequest.fileList.forEach(function (fs, i) {
        if (fs.response) {
          fileIds.push(fs.response[0].id);
        } else {
          fileIds.push(fs.id);
        }
      });
      _self.checking = true;
      _self.$axios.post("/request/update", {
          id: _self.currentRequest.id,
          summary: _self.currentRequest.summary,
          expectDate: _self.currentRequest.expectDate,
          type: _self.currentRequest.type,
          moduleId: _self.currentRequest.moduleId,
          priority: _self.currentRequest.priority,
          refuseTimes: _self.currentRequest.refuseTimes,
          uiResource: _self.currentRequest.uiResource,
          status: _self.currentRequest.status,
          attachment: fileIds.toString(),
          detail: _self.currentRequest.detail
        })
        .then(function (res) {
          if (res.data == 1) {
            _self.$message.success("需求信息修改成功！");
            _self.showReqDetail = false;
            _self.auditListQuery();
            setTimeout(() => {
              _self.checking = false;
            }, 500);
          } else {
            _self.$message.warning("需求信息修改失败！");
            _self.checking = false;
          }
        })
        .catch(function (response) {
          _self.$notify.error("需求信息修改时发生程序错误！");
          _self.checking = false;
          console.log(response);
        });
    },

    moduleQuery() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/module/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            isValid: 'Y'
          }
        })
        .then(function (res) {
          var moduleList = eval(res.data.list);
          _self.modules.splice(0, _self.modules.length);
          for (var i = 0; i < moduleList.length; i++) {
            _self.modules.push({
              label: moduleList[i].moduleName,
              value: moduleList[i].moduleId
            });
          }
        })
    },

    handlePreview(file) {
      commonQuery.attachmentDownload(file);
    },

    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.auditListQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.auditListQuery();
    },

    isCurrentLeader() {
      return this.currentAudit.leaderAuditor ? this.currentAudit.leaderAuditor.split(",").indexOf(sessionStorage.userId) > -1 : false;
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    beforeUpload(file) {
      if (file.size / 1024 / 1024 > 50) {
        this.$message.info("单个文件不能超过 50MB！");
        return false;
      }
      if (file.name == "") {
        this.$message.info("文件名不能为空，请重命名！");
        return false;
      }
      const fileType = file.name.split(".");
      const forbidden = ['exe', 'msi', 'sh', 'bat', 'avi', 'bmp', 'jar', 'war', 'ear'];
      if (forbidden.indexOf(fileType[fileType.length - 1]) > -1) {
        this.$message.info("不支持exe等危险文件类型！");
        return false;
      }
    },

    uploadAction(params) {
      let _self = this;
      _self.checking = true;
      let file = params.file;
      let fileList = _self.currentRequest.fileList || [];

      if (file.name.indexOf("_V") > -1) {
        _self.$message.warning("请去除文件名中包含的字符串： _V");
        _self.$refs.uploadMod.uploadFiles = fileList.filter(item => {
          return item.status == 'success'
        }) || [];
        return;
      }
      commonQuery.attachmentUpload(file, fileList, (res) => {
        _self.currentRequest.fileList = res;
        _self.checking = false;
      })
    },

    fileExceeded(files, fileList) {
      this.$message.info("文件个数超出限制！");
      return;
    },

    uploadComplete(res, file, fileList) {
      let _self = this;
      _self.currentRequest.fileList = fileList;
    },

    handleRemoveMod(file, fileList) {
      let _self = this;
      _self.$message.success("文件删除成功！");
      _self.currentRequest.fileList = fileList;
    },

    handlePreview(file) {
      commonQuery.attachmentDownload(file);
    },

    getAttach(attachId) {
      return commonQuery.attachmentQuery(attachId);
    },

    showAuditHistory(data) {
      let _self = this;
      _self.showAuditDetail = true;
      _self.activeName = "base0";

      _self.$axios({
          method: "post",
          url: "/request/audit_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            id: data.id
          }
        })
        .then(function (res) {
          _self.auditDetails = eval(res.data.list);
        })
        .catch(function (response) {
          _self.$notify.error("需求审批历史查询时发生程序错误！");
          console.log(response);
        });
    },

    checkAuditable(row) {
      let currentUser = sessionStorage.userId;
      if (!commonQuery.isNull(row.completeTime)) {
        return false;
      }
      let base = row.baseAuditor ? row.baseAuditor.split(",") : [];
      let leader = row.leaderAuditor ? row.leaderAuditor.split(",") : [];
      let chief = row.chiefAuditor ? row.chiefAuditor.split(",") : [];
      let isBaseAuditor = base.indexOf(currentUser) > -1;
      let isLeaderAuditor = leader.indexOf(currentUser) > -1;
      let isChiefAuditor = chief.indexOf(currentUser) > -1;

      // 当前用户不在审批人列表中
      if (!isBaseAuditor && !isLeaderAuditor && !isChiefAuditor) {
        return false;
      }

      let baseComplete = null != row.baseAuditResult || base.length == 0;
      // 基础审批已完成，且当前用户是基础审批人
      if (baseComplete && isBaseAuditor) {
        return false;
      }

      let leaderComplete = null == row.leaderAuditResult && leader.length == 0;
      let leaderAuditResultMine;
      if (null != row.leaderAuditResult) {
        leaderComplete = row.leaderAuditResult.length == leader.length;
        leaderAuditResultMine = row.leaderAuditResult.find(d => {
          return d.auditor == currentUser
        });
      }
      // 基础审批已完成，主管审批未完成，且当前用户是主管审批人，且尚未执行审批
      if ((!baseComplete || leaderAuditResultMine) && isLeaderAuditor) {
        return false;
      }

      let chiefComplete = false;
      let chiefAuditResultMine;
      if (null != row.chiefAuditResult) {
        chiefComplete = row.chiefAuditResult.length == chief.length;
        chiefAuditResultMine = row.chiefAuditResult.find(d => {
          return d.auditor == currentUser
        });
      }
      // 主管审批已完成，高管审批未完成，且当前用户是高管审批人，且尚未执行审批
      if ((!baseComplete || !leaderComplete || chiefAuditResultMine) && isChiefAuditor) {
        return false;
      }

      return true;
    },

    beginAudit(data) {
      let _self = this;
      if (_self.currentRequest.id != data.prId) {
        _self.$axios({
            method: "post",
            url: "/request/query",
            headers: {
              "Content-type": "application/x-www-form-urlencoded"
            },
            params: {
              id: data.prId
            }
          })
          .then(function (res) {
            _self.currentRequest = eval(res.data.list)[0];
          })
      }

      _self.currentAudit = data;
      _self.auditResult.id = data.id;
      _self.auditResult.passed = "";
      _self.auditResult.auditComment = "";
      _self.showAuditDialog = true;
      _self.auditResult.appendChiefs = false;
      _self.auditResult.chiefAuditor = [];
    },

    checkAuditConfirm() {
      let _self = this;
      _self.$refs.auditResultForm.validate((valid) => {
        if (!valid) {
          _self.$message.warning("表单校验不通过，无法提交！");
          return;
        } else {
          this.$confirm("确定已知悉需求详情吗?", "操作确认", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
            .then(() => {
              this.saveRequestAudit();
            })
            .catch(() => {});
        }
      });
    },

    cancelAudit(done) {
      let _self = this;
      _self.showAuditDialog = false;
      _self.resetAuditResults();
      _self.$message.warning("您已取消审核操作！");
      if (typeof done == "function") {
        done();
      }
    },

    resetAuditResults() {
      let _self = this;
      _self.auditResults.forEach(item => {
        delete item.disabled;
      });
    },

    setChiefAuditors() {
      let _self = this;
      if (_self.auditResult.appendChiefs == false) {
        _self.auditResult.chiefAuditor = [];
        _self.resetAuditResults();
        return;
      } else {
        _self.auditResult.passed = 1;
      }
      let existChiefs = _self.currentAudit.chiefAuditor;
      _self.auditResult.chiefs.forEach(item => {
        _self.$set(item, "disabled", existChiefs ? existChiefs.split(",").indexOf(item.value + '') > -1 : false);
      });
      _self.auditResults.forEach(item => {
        _self.$set(item, "disabled", _self.auditResult.appendChiefs == true && item.value == 0);
      });
    },

    saveRequestAudit() {
      let _self = this;
      let newChiefAuditors = [];
      if (_self.auditResult.appendChiefs == true && _self.auditResult.chiefAuditor.length == 0) {
        _self.$message.warning("未选择高管审批人！");
        return;
      }

      if (_self.currentAudit.chiefAuditor && _self.auditResult.chiefAuditor.length > 0) {
        newChiefAuditors = _self.currentAudit.chiefAuditor.split(",").concat(_self.auditResult.chiefAuditor);
      } else if (!_self.currentAudit.chiefAuditor && _self.auditResult.chiefAuditor.length > 0) {
        newChiefAuditors = _self.auditResult.chiefAuditor;
      } else if (_self.currentAudit.chiefAuditor && _self.auditResult.chiefAuditor.length == 0) {
        newChiefAuditors = _self.currentAudit.chiefAuditor.split(",");
      }

      _self.$axios.post("/request/audit/" + _self.auditResult.id, {
          auditor: _self.auditResult.auditor,
          passed: _self.auditResult.passed,
          auditComment: _self.auditResult.auditComment,
          auditTime: dateFormat(new Date(), _self.timefmt),
          newChiefAuditor: newChiefAuditors.toString() //必须包含原审批人
        })
        .then(function (res) {
          if (res.data = 1) {
            _self.$message.success("审批操作成功！");
            _self.showAuditDialog = false;
            _self.auditListQuery();
          } else if (res.data = -1) {
            _self.$message.warning("数据已过期，请重新查询！");
          } else {
            _self.$message.error("审批操作失败，请联系管理员！");
            console.log(res);
          }
        });
    },

    memberQuery(callback) {
      let _self = this;
      _self.queryLoading = true;
      commonQuery.memberQuery((result) => {
        _self.members = result.users;
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        if (typeof callback == "function") {
          callback();
        }
      });
    },

    auditListQuery() {
      let _self = this;
      _self.queryLoading = true;
      let submitTimeStart = "",
        submitTimeEnd = "";
      if (_self.auditForm.submitTime && _self.auditForm.submitTime.length > 1) {
        submitTimeStart = _self.auditForm.submitTime[0];
        submitTimeEnd = _self.auditForm.submitTime[1];
      }

      _self.$axios({
          method: "post",
          url: "/request/audit_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            submitTimeStart: submitTimeStart,
            submitTimeEnd: submitTimeEnd,
            submitter: _self.auditForm.submitter,
            prId: _self.auditForm.prId,
            auditStatus: _self.auditForm.auditStatus,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function (res) {
          _self.tableData = eval(res.data.list);
          _self.pageInfo = res.data;
          _self.$nextTick(() => {
            setTimeout(() => {
              _self.queryLoading = false;
              _self.queryChanged = false;
            }, 200);
          });
        })
        .catch(function (response) {
          _self.$notify.error("产品需求信息查询时发生程序错误！");
          console.log(response);
        });
    }
  }
};
</script>

<style>
.audit-form {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.audit-form .el-form-item .el-input,
.audit-form .el-form-item .el-select {
  width: 150px;
}

.audit-form .summary-tips {
  color: #3AB4D7 !important;
  cursor: pointer !important;
}

.audit-form .summary-tips:hover {
  color: #61c3df !important;
}

.req-detail .el-form-item .el-input,
.req-detail .el-form-item .el-select {
  width: 180px;
}

.audit-detail {
  max-height: 600px;
  padding: 0 30px;
  overflow-y: auto;
}

.audit-detail .el-timeline-item {
  padding-bottom: 10px;
}

.audit-detail .el-timeline-item__content {
  padding: 5px;
}

.audit-detail .el-tabs--border-card>.el-tabs__content {
  padding: 0;
}

.audit-detail .el-card {
  border-radius: 0;
}

.reqaudit-attach,
.reqaudit-attach input {
  width: 768px !important;
}

.reqaudit-attach .el-upload--text {
  width: 100%;
  height: 80px;
}

.reqaudit-attach .el-upload-dragger {
  width: 100%;
  height: 80px;
}

.reqaudit-attach .el-upload-dragger .el-icon-upload {
  margin: 0;
  font-size: 40px;
}
</style>
