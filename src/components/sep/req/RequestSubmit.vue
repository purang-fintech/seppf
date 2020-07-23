<template>
  <div id="root" class="require-main">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-coding"></i> 需求管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>需求提交</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog :close-on-click-modal="modalClose" title="产品需求附件清单" :visible.sync="showAttachDialog" width="960px" top="100px">
      <el-table
        :data="currentRequest.attachments"
        size="mini"
        class="detail-table"
        empty-text="当前需求没有上传附件"
        stripe
        max-height="500px">
        <el-table-column type="index" label="序号" width="50" align="center">
        </el-table-column>
        <el-table-column prop="name" label="文件名" min-width="50%" header-align="center">
        </el-table-column>
        <el-table-column prop="uploadDate" label="上传时间" min-width="15%" align="center">
        </el-table-column>
        <el-table-column prop="uploadUserName" label="上传用户" min-width="10%" align="center">
        </el-table-column>
        <el-table-column label="操作" width="110px" align="center">
          <template slot-scope="scope">
            <el-button v-no-more-click type="success" icon="el-icon-download" @click="openAttach(scope.row)" size="mini">下载附件</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showAttachDialog=false" size="small">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="需求审批情况" :visible.sync="showAuditHistory" width="910px" top="100px">
      <div class="audit-history" v-if="auditHistories.length>0">
        <el-timeline reverse>
          <el-timeline-item v-for="(item, index) in auditHistories" :timestamp="'由用户 ' + item.submitterName +' 于 ' + item.submitTime + ' 提交送审'" placement="top" :key="index">
            <el-tabs v-model="activeName" type="border-card">
              <el-tab-pane :name="'base' + index" label="基础审核">
                <div v-if="null != item.baseAuditResult && item.baseAuditResult.length > 0">
                  <el-card v-for="(base, index) in item.baseAuditResult" :key="index">
                    <h4 style="margin-bottom:10px">用户 {{base.auditName}} 于 {{base.auditTime}} 审批</h4>
                    <span>审批结论：</span>
                    <span v-if="base.passed == 1" style="color:#6bbd6b;font-weight:600">审核通过</span>
                    <span v-else style="color:#EE6F6F;font-weight:600">审核拒绝</span>
                    <p style="margin-top:5px">审批意见： {{base.auditComment}}</p>
                  </el-card>
                </div>
                <h3 v-else style="text-align:center;margin:20px 0">无基础审批纪录</h3>
              </el-tab-pane>
              <el-tab-pane :name="'leader' + index" label="主管/总监审核">
                <div v-if="null != item.leaderAuditResult && item.leaderAuditResult.length > 0">
                  <el-card v-for="(leader, index) in item.leaderAuditResult" :key="index">
                    <h4 style="margin-bottom:10px">用户 {{leader.auditName}} 于 {{leader.auditTime}} 审批</h4>
                    <span>审批结论：</span>
                    <span v-if="leader.passed == 1" style="color:#6bbd6b;font-weight:600">审核通过</span>
                    <span v-else style="color:#EE6F6F;font-weight:600">审核拒绝</span>
                    <p style="margin-top:5px">审批意见： {{leader.auditComment}}</p>
                  </el-card>
                </div>
                <h3 v-else style="text-align:center;margin:20px 0">无主管/总监审批纪录</h3>
              </el-tab-pane>
              <el-tab-pane :name="'chief' + index" label="高管审核">
                <div v-if="null != item.chiefAuditResult && item.chiefAuditResult.length > 0">
                  <el-card v-for="(chief, index) in item.chiefAuditResult" :key="index">
                    <h4 style="margin-bottom:10px">用户 {{chief.auditName}} 于 {{chief.auditTime}} 审批</h4>
                    <span>审批结论：</span>
                    <span v-if="chief.passed == 1" style="color:#6bbd6b;font-weight:600">审核通过</span>
                    <span v-else style="color:#EE6F6F;font-weight:600">审核拒绝</span>
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
      <div v-if="formal.id" class="formal-req">已审批通过，生成正式需求，请将需求号
        <el-link type="success" @click="toRequest(formal.id)">#{{formal.id}} </el-link> 提交项目经理安排开发
      </div>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="showAuditHistory=false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="需求送审" :close-on-click-modal="modalClose" :visible.sync="showSendAudit" width="600px">
      <el-form :model="auditForm" size="small" :inline="false" label-width="120px" ref="sendAuditForm">
        <el-form-item label="基础审批人" v-if="currentRequest.type==4">
          <el-select v-model="auditForm.baseAuditor" placeholder="请选择" style="width:92%">
            <el-option :value="auditForm.pdAuditor.value" :key="auditForm.pdAuditor.value" :label="auditForm.pdAuditor.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="主管审批人" required prop="leaderAuditor" :rules="[{ required: true, message: '主管审批人必选', trigger: 'change' }]">
          <template slot="label">
            <el-tooltip content="产品总监、产品部负责人皆共此权限" placement="right" effect="dark">
              <span>主管审批人</span>
            </el-tooltip>
          </template>
          <el-select
            v-if="currentRequest.type==2"
            v-model="auditForm.leaderAuditor"
            placeholder="请选择"
            multiple
            clearable
            style="width:92%">
            <el-option v-for="item in auditForm.devManagers" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-select
            v-else
            v-model="auditForm.leaderAuditor"
            placeholder="请选择"
            multiple
            clearable
            style="width:92%">
            <el-option v-for="item in auditForm.directors" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="高管审批人">
          <el-select
            v-if="currentRequest.type==2"
            v-model="auditForm.chiefAuditor"
            placeholder="请选择"
            multiple
            clearable
            style="width:92%">
            <el-option v-for="item in auditForm.itChiefs" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-select
            v-else
            v-model="auditForm.chiefAuditor"
            placeholder="请选择"
            multiple
            clearable
            style="width:92%">
            <el-option v-for="item in auditForm.chiefs" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审批截止时间" prop="auditDeadline" required :rules="[{required: true, message: '请提供审批截止时间', trigger: 'blur'}]">
          <el-date-picker
            type="datetime"
            :value-format="timefmt"
            :default-value="new Date()"
            style="width:92%"
            v-model="auditForm.auditDeadline"
            placeholder="请选择审批截止时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="showSendAudit=false">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="checkSendAuditRequest()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showDialog" width="960px" :fullscreen="maximize1" top="100px">
      <div slot="title">
        <span style="font-size:18px">提交产品需求</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize1=!maximize1">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize1==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize1==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <div v-loading.lock="checking" element-loading-text="提交中..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-form
          :model="qform"
          :rules="qFormRules"
          ref="ruledForm"
          size="mini"
          :inline="true"
          label-width="110px"
          class="request-form">
          <el-form-item label="需求类型" prop="type" required>
            <el-select v-model="qform.type" filterable>
              <el-option v-for="opt in reqType" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="紧急程度" prop="priority" required>
            <el-select v-model="qform.priority" filterable>
              <el-option v-for="opt in reqPriority" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="期望完成日期" prop="expectDate" required>
            <el-date-picker type="date" v-model="qform.expectDate" :value-format="datefmt" placeholder="请选择" clearable></el-date-picker>
          </el-form-item>
          <el-form-item label="需求摘要" prop="summary" required>
            <el-input v-model="qform.summary" placeholder="请输入需求摘要" style="width:474px" clearable>需求摘要</el-input>
          </el-form-item>
          <el-form-item label="所属模块" prop="moduleIds" required>
            <el-select v-model="qform.moduleIds" clearable multiple collapse-tags :multiple-limit="$route.params.problemInfo?1:0">
              <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="原型链接" prop="uiResource">
            <el-input v-model="qform.uiResource" placeholder="请输入UED原型图链接" style="width:474px" clearable>原型链接</el-input>
          </el-form-item>
          <el-form-item label="链接预览" v-if="checkUrl(qform.uiResource)">
            <el-link type="success" :href="qform.uiResource" :underline="false" target="_blank">原型链接</el-link>
          </el-form-item>
          <el-form-item label="需求详情" prop="detail" required>
            <el-input
              v-model="qform.detail"
              type="textarea"
              :rows="3"
              placeholder="请输入产品需求详情"
              class="req-attach-upload"
              :maxlength="2000"
              show-word-limit
              clearable>需求详情
            </el-input>
          </el-form-item>
          <el-form-item label="附件上传">
            <el-upload
              class="req-attach-upload"
              ref="upload"
              multiple
              drag
              :limit="5"
              :on-exceed="fileExceeded"
              :before-upload="beforeUpload"
              :on-success="uploadComplete"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :file-list="qform.fileList"
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
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="resetForm('ruledForm')" size="small">重置</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="saveReqCreate('ruledForm')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="modalClose"
      :visible.sync="showDialogMod"
      width="960px"
      :fullscreen="maximize2"
      top="100px"
      :before-close="cancelView">
      <div slot="title">
        <span style="font-size:18px">修改产品需求</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize2=!maximize2">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize2==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize2==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-alert
        title="本需求为审核拒绝需求，编辑之后状态将自动变为已提交，之后可再次送审"
        type="info"
        effect="dark"
        v-if="currentRequest.status==4"
        style="width:94%;margin:10px 3%"
        center
        :closable="false">
      </el-alert>

      <div v-loading.lock="checking" element-loading-text="校验中..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-form
          :model="qform"
          size="mini"
          :rules="qFormRules"
          ref="ruledFormMod"
          :inline="true"
          label-width="110px"
          class="request-form">
          <el-form-item label="需求类型" prop="type" required>
            <el-select v-model="qform.type" disabled>
              <el-option v-for="opt in reqType" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="提交人" prop="submitter" required>
            <el-select v-model="qform.submitter" disabled>
              <el-option v-for="opt in members" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="提交日期" prop="submitDate" required>
            <el-input v-model="qform.submitDate" placeholder="请输入需求摘要" disabled>提交日期</el-input>
          </el-form-item>
          <el-form-item label="需求状态" prop="status" required>
            <el-select v-model="qform.status" disabled>
              <el-option v-for="opt in reqStatus" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="紧急程度" prop="priority" required>
            <el-select v-model="qform.priority" filterable :disabled="qform.disabled">
              <el-option v-for="opt in reqPriority" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="期望完成日期" prop="expectDate" required>
            <el-date-picker
              type="date"
              v-model="qform.expectDate"
              :value-format="datefmt"
              placeholder="请选择"
              clearable
              :disabled="qform.disabled"></el-date-picker>
          </el-form-item>
          <el-form-item label="需求摘要" prop="summary" required>
            <el-input v-model="qform.summary" placeholder="请输入需求摘要" style="width:474px" clearable :disabled="qform.disabled">需求摘要</el-input>
          </el-form-item>
          <el-form-item label="所属模块" prop="moduleId" required>
            <el-select v-model="qform.moduleId" :disabled="qform.disabled">
              <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="原型链接" prop="uiResource">
            <el-input v-model="qform.uiResource" placeholder="请输入UED原型图链接" style="width:474px" clearable :disabled="qform.disabled">原型链接</el-input>
          </el-form-item>
          <el-form-item label="链接预览" v-if="checkUrl(qform.uiResource)">
            <el-link type="success" :href="qform.uiResource" :underline="false" target="_blank">原型链接</el-link>
          </el-form-item>
          <el-form-item label="需求详情" prop="detail">
            <el-input
              v-model="qform.detail"
              type="textarea"
              :rows="3"
              placeholder="请输入产品需求详情"
              class="req-attach-upload"
              :maxlength="2000"
              :disabled="qform.disabled"
              show-word-limit
              clearable>需求详情
            </el-input>
          </el-form-item>
          <el-form-item label="附件上传">
            <el-upload
              class="req-attach-upload"
              ref="uploadMod"
              :disabled="qform.disabled"
              multiple
              drag
              :before-upload="beforeUpload"
              :on-exceed="fileExceeded"
              :on-success="uploadComplete"
              :on-preview="handlePreview"
              :on-remove="handleRemoveMod"
              :file-list="qform.fileList"
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
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="cancelView" size="small">取消</el-button>
        <el-button
          v-no-more-click
          v-if="!qform.disabled"
          type="primary"
          icon="el-icon-circle-check"
          @click="checkReqUpdate('ruledFormMod')"
          size="small">确定</el-button>
      </div>
    </el-dialog>

    <div class="request-main">
      <el-form
        ref="form"
        :model="form"
        :inline="true"
        size="mini"
        label-width="110px"
        @keydown.native.enter="requestQuery()">
        <el-form-item label="需求类型">
          <el-select
            v-model="form.type"
            placeholder="请选择"
            clearable
            multiple
            collapse-tags
            class="muti-select">
            <el-option v-for="opt in reqType" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="紧急程度">
          <el-select v-model="form.priority" placeholder="请选择" clearable>
            <el-option v-for="opt in reqPriority" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="需求状态">
          <el-select v-model="form.status" placeholder="请选择" multiple collapse-tags clearable>
            <el-option v-for="opt in reqStatus" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提交人">
          <el-select
            v-model="form.submitter"
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
        <el-form-item label="需求编号">
          <el-input v-model="form.id" placeholder="需求编号" clearable>需求编号</el-input>
        </el-form-item>
        <el-form-item label="所属模块">
          <el-select v-model="form.moduleIds" clearable multiple collapse-tags>
            <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提交日期">
          <el-date-picker
            v-model="form.submitDate"
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
          <el-button v-no-more-click type="primary" icon="el-icon-circle-plus-outline" @click="createRequest()">提交产品需求</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="requestQuery()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="dataRevert"
        :max-height="tableHeight"
        size="mini"
        stripe
        :border="showBorder"
        ref="reqTable"
        v-loading="queryLoading"
        element-loading-text="查询中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column prop="id" label="产品需求号" width="110" align="center" sortable>
          <template slot-scope="scope">
            <el-button v-no-more-click type="text" size="mini" @click="showReqDetail(scope.row)">{{scope.row.id}}</el-button>
            <i class="iconfont icon-attachment" v-if="countAttach(scope.row.attachment) > 0" @click="showAttachs(scope.row)"></i>
          </template>
        </el-table-column>
        <el-table-column prop="summary" label="需求摘要" header-align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="typeName" label="需求类型" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="moduleName" label="所属模块" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="priorityName" label="紧急程度" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="submitterName" label="提交人" width="80" align="center" sortable>
        </el-table-column>
        <el-table-column prop="refuseTimes" label="驳回次数" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="submitDate" label="提交日期" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="expectDate" label="期望完成日期" width="120" align="center" sortable>
          <template slot="header" slot-scope="slot">
            <el-tooltip content="距期望完成日期5日之内，数据为橙色" placement="left" effect="dark">
              <span>期望完成日期</span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <div v-html="scope.row.expectHtml"></div>
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="需求状态" width="90" align="center" sortable>
          <template slot-scope="scope">
            <el-button v-if="scope.row.refuseTimes > 0 || scope.row.status!=1" type="text" size="mini" @click="queryAuditHistory(scope.row)">{{scope.row.statusName}}</el-button>
            <span v-else>{{scope.row.statusName}}</span>
          </template>
        </el-table-column>
        <el-table-column width="180" align="center" label="操作">
          <template slot-scope="scope">
            <el-button :disabled="!scope.row.modialed" type="danger" size="mini" @click="dropRequest(scope.row)">作废</el-button>
            <el-button :disabled="!scope.row.modialed" type="primary" size="mini" @click="editRequest(scope.row)">编辑</el-button>
            <el-button :disabled="!scope.row.sendable" type="success" size="mini" @click="sendAuditRequest(scope.row)">送审</el-button>
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
          pm
          run
          dev
          :total="pageInfo.total">
        </el-pagination>
        <el-button
          type="primary"
          class="el-icon-download export-btn"
          size="mini"
          :disabled="tableData.length == 0"
          plain
          @click="exportCSV('产品需求清单数据', 'reqTable')">
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
      maximize1: false,
      maximize2: false,
      queryLoading: false,
      checking: false,
      createCommited: false,
      auditHistories: [],
      showAuditHistory: false,
      datefmt: defaultDateFormat,
      timefmt: defaultTimeFormat,
      dialogWidth: document.body.clientWidth - 100,
      showAttachDialog: false,
      showSendAudit: false,
      modules: [],
      members: [],
      memberFull: [],
      userOptions: [],
      activeName: "base0",
      tableHeight: bodyAviHeightNTab - 70 - 45,
      form: {
        id: "",
        submitDate: [],
        type: [],
        status: [1, 2, 3, 4],
        priority: "",
        moduleIds: [],
        submitter: ""
      },
      currentPage: 1,
      currentUser: parseInt(sessionStorage.userId),
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      reqType: [],
      reqStatus: [],
      reqPriority: [],
      showDialog: false,
      showDialogMod: false,
      currentRequest: {
        attachments: [],
        id: "",
        type: "",
        status: "",
        uiResource: "",
        priority: "",
        moduleId: "",
        expectDate: "",
        summary: "",
        detail: ""
      },
      pickOptions: pickOptions,
      qform: {
        type: "",
        status: "",
        priority: "",
        moduleId: "",
        uiResource: "",
        moduleIds: [],
        submitter: sessionStorage.userName,
        submitDate: "",
        expectDate: "",
        fileList: [],
        summary: "",
        detail: ""
      },
      qFormRules: {
        type: [{
          required: true,
          message: '请选择需求类型',
          trigger: 'change'
        }],
        priority: [{
          required: true,
          message: '请选择需求紧急程度',
          trigger: 'change'
        }],
        moduleIds: [{
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
            required: true,
            message: '请输入产品需求详情',
            trigger: 'blur'
          },
          {
            min: 0,
            max: 2000,
            message: '长度不可超过 2000 字，内容过多请上传附件',
            trigger: 'blur'
          }
        ]
      },
      formal: {
        id: "",
        summary: ""
      },
      auditForm: {
        pdAuditor: {},
        directors: [],
        devManagers: [],
        chiefs: [],
        itChiefs: [],
        baseAuditor: "",
        leaderAuditor: [],
        chiefAuditor: [],
        auditDeadline: ""
      }
    };
  },

  watch: {
    showDialog: function (val) {
      let _self = this;
      if (!val && !_self.createCommited && _self.qform.fileList.length > 0) {
        _self.$message.warning("您上传了附件，但未提交保存数据！");
      }
    },

    'tableData.length': function (val) {
      if (val == 0) {
        this.currentPage = 1;
        this.requestQuery();
      }
    },

    form: {
      handler() {
        this.currentPage = 1;
        this.queryChanged = true;
      },
      deep: true,
      immediate: true
    }
  },

  created() {
    let _self = this;
    _self.moduleQuery();
    let params = [];
    for (let p in _self.$route.params) {
      params.push(p);
    }

    _self.reqType.splice(0, _self.reqType.length);
    let requirementType = localStorage.getItem("requirementType");
    eval(requirementType).forEach(item => {
      if (item.typeId == 3 || item.typeId == 5) {
        return;
      }
      _self.reqType.push({
        value: item.typeId,
        label: item.typeName,
        disabled: (commonQuery.roleAllowStrict([14]) && item.typeId != 4) || (!commonQuery.roleAllow([14]) && item.typeId == 4)
      });
    });

    _self.reqStatus.splice(0, _self.reqStatus.length);
    let prStatus = localStorage.getItem("prStatus");
    eval(prStatus).forEach(item => {
      _self.reqStatus.push({
        value: item.statusId,
        label: item.statusName
      });
    });

    _self.reqPriority.splice(0, _self.reqPriority.length);
    let requirementPriority = localStorage.getItem("requirementPriority");
    eval(requirementPriority).forEach(item => {
      _self.reqPriority.push({
        value: item.priorityId,
        label: item.priorityName
      });
    });

    if (params.length > 0) {
      _self.form.id = _self.$route.params.id;
      _self.form.type = [];
      if (_self.$route.params.type) {
        _self.form.type.push(parseInt(_self.$route.params.type));
      }
      _self.form.status = [];
      if (_self.$route.params.status) {
        _self.form.status.push(parseInt(_self.$route.params.status));
      }
      _self.form.priority = _self.$route.params.priority;
      _self.form.submitter = _self.$route.params.submitter;
    } else {
      let dayS = new Date();
      dayS.setTime(dayS.getTime() - 3600 * 1000 * 24 * 90);
      _self.form.submitDate.push(dateFormat(new Date(dayS), _self.datefmt));
      _self.form.submitDate.push(dateFormat(new Date(), _self.datefmt));
      _self.form.type = [];
    }
    _self.memberQuery();
    _self.queryDirectors();
    _self.queryChiefs();
    _self.queryITChiefs();
    _self.queryDevManagers();
    _self.moduleQuery(_self.requestQuery);
  },

  computed: {
    dataRevert() {
      for (let i = 0, datas = this.tableData; i < datas.length; i++) {
        let now = new Date(dateFormat(new Date(), this.datefmt) + " 00:00:00").getTime();
        let expect = new Date(datas[i].expectDate + " 00:00:00").getTime();
        if ((expect - now) < 5 * 24 * 60 * 60 * 1000 && datas[i].status < 5 && datas[i].status > 0) {
          this.$set(datas[i], "expectHtml", "<span style='color:orange'>" + datas[i].expectDate + "</span>");
        } else {
          this.$set(datas[i], "expectHtml", "<span style='color:#606266'>" + datas[i].expectDate + "</span>");
        }
        this.$set(datas[i], "modialed", datas[i].submitter == this.currentUser && (datas[i].status == 1 || datas[i].status == 4));
        this.$set(datas[i], "sendable", datas[i].status == 1 && datas[i].submitter == this.currentUser);
        this.tableData.splice(i, 1, datas[i]);
      }
      return this.tableData;
    }
  },

  methods: {
    toRequest(id) {
      this.showAuditHistory = false;
      this.$router.push({
        name: "request",
        params: {
          id: id
        }
      });
    },

    resetFilterText() {
      let _self = this;
      _self.userOptions = _self.memberFull;
    },

    filterUsers(val) {
      let _self = this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },

    checkSendAuditRequest() {
      let _self = this;
      _self.$refs.sendAuditForm.validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交！");
          return;
        } else {
          _self.commitSendAuditRequest();
        }
      });
    },

    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.requestQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.requestQuery();
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

    queryAuditHistory(data) {
      let _self = this;
      _self.showAuditHistory = true;
      _self.activeName = "base0";
      _self.formal.id = "";
      _self.formal.summary = "";

      _self.$axios({
          method: "post",
          url: "/request/audit_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            prId: data.id
          }
        })
        .then(function (res) {
          _self.auditHistories = eval(res.data.list);
          _self.auditHistories.forEach(item => {
            if (!commonQuery.isNull(item.formalId)) {
              _self.formal.id = item.formalId;
              _self.formal.summary = data.summary;
              return;
            }
          })
        })
    },

    dropRequest(data) {
      let _self = this;
      _self.$confirm("操作不可逆，是否确认作废本需求？", "操作提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        })
        .then(() => {
          _self.$axios.post("/request/close/" + data.id)
            .then(function (res) {
              if (res.data == 1) {
                _self.$message.success("需求作废操作成功！");
                _self.requestQuery();
              } else {
                _self.$message.warning("需求作废操作失败！");
                console.log(res);
              }
            })
            .catch(function (response) {
              _self.$notify.error("作废操作时发生程序错误！");
              console.log(response);
            });
        })
        .catch(() => {
          _self.$message.info("需求作废操作已取消");
        });
    },

    sendAuditRequest(data) {
      let _self = this;
      const crtModule = _self.modules.find(d => {
        return d.value == data.moduleId
      });
      _self.$nextTick(() => {
        _self.auditForm.pdAuditor = {
          value: crtModule.pduid,
          label: crtModule.pdname
        };
        _self.auditForm.baseAuditor = _self.currentRequest.type == 4 ? crtModule.pduid : "";
      });
      _self.auditForm.leaderAuditor = [];
      _self.auditForm.chiefAuditor = [];
      _self.auditForm.prId = data.id;
      _self.auditForm.auditDeadline = "";
      _self.showSendAudit = true;
      _self.currentRequest = data;
    },

    commitSendAuditRequest() {
      let _self = this;
      if (new Date(_self.auditForm.auditDeadline).getTime() < new Date().getTime()) {
        _self.$message.warning("审批截止时间不能小于当前时间！");
        return;
      }
      _self.$confirm("审批流程不可中断，请确认需求信息是否已完备？", "操作提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          let baseAuditor = parseInt(_self.auditForm.baseAuditor);

          // 主管审批人如果包含基础审批人，则只在基础审批中体现
          let bindex1 = _self.auditForm.leaderAuditor.indexOf(baseAuditor);
          if (bindex1 > -1) {
            _self.auditForm.leaderAuditor.splice(bindex1, 1);
          }
          // 高管审批人如果包含基础审批人，则只在基础审批中体现
          let bindex2 = _self.auditForm.chiefAuditor.indexOf(baseAuditor);
          if (bindex2 > -1) {
            _self.auditForm.chiefAuditor.splice(bindex2, 1);
          }
          // 高管审批人如果包含主管审批人，则只在主管审批中体现
          _self.auditForm.leaderAuditor.forEach(d => {
            let index = _self.auditForm.chiefAuditor.indexOf(d);
            if (index > -1) {
              _self.auditForm.chiefAuditor.splice(index, 1);
            }
          });

          if (_self.auditForm.leaderAuditor.length == 0 && _self.auditForm.chiefAuditor.length == 0) {
            _self.$message.warning("审批必须至少两人或两人以上参与！");
            return;
          }

          _self.$axios.post("/request/send_audit", {
              prId: _self.auditForm.prId,
              submitter: _self.currentUser,
              submitTime: dateFormat(new Date(), _self.timefmt),
              baseAuditor: commonQuery.isNull(_self.auditForm.baseAuditor) ? null : _self.auditForm.baseAuditor,
              leaderAuditor: _self.auditForm.leaderAuditor.length == 0 ? null : _self.auditForm.leaderAuditor.toString(),
              chiefAuditor: _self.auditForm.chiefAuditor.length == 0 ? null : _self.auditForm.chiefAuditor.toString(),
              auditDeadline: _self.auditForm.auditDeadline
            })
            .then(function (res) {
              if (res.data == 1) {
                _self.$message.success("需求送审操作成功！");
                _self.showSendAudit = false;
                _self.requestQuery();
              } else {
                _self.$message.warning("需求送审操作失败！");
                console.log(res);
              }
            })
        })
        .catch(() => {
          _self.$message.info("送审作废操作已取消");
        });
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    showAttachs(data) {
      let _self = this;
      _self.showAttachDialog = true;
      _self.currentRequest.attachments = _self.getAttach(data.attachment);
    },

    countAttach(attach) {
      return null == attach || attach == "" ? 0 : attach.split(",").length;
    },

    openAttach(fileObject) {
      commonQuery.attachmentDownload(fileObject);
    },

    uploadAction(params) {
      let _self = this;
      let file = params.file;
      let fileList = _self.qform.fileList || [];
      let refedUpload = _self.showDialog ? _self.$refs.upload : _self.$refs.uploadMod;

      if (file.name.indexOf("_V") > -1) {
        _self.$message.warning("请去除文件名中包含的字符串： _V");
        refedUpload.uploadFiles = fileList.filter(item => {
          return item.status == 'success'
        }) || [];
        return;
      }

      _self.checking = true;
      commonQuery.attachmentUpload(file, fileList, (res) => {
        _self.qform.fileList = res;
        _self.checking = false;
      })
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    requestQuery() {
      let _self = this;
      _self.queryLoading = true;
      let submitDateBegintart = "",
        submitDateEnd = "";
      if (_self.form.submitDate && _self.form.submitDate.length > 1) {
        submitDateBegintart = _self.form.submitDate[0];
        submitDateEnd = _self.form.submitDate[1];
      }
      _self.$axios({
          method: "post",
          url: "/request/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            id: _self.form.id,
            moduleIds: _self.form.moduleIds.toString(),
            submitDateBegintart: submitDateBegintart,
            submitDateEnd: submitDateEnd,
            type: _self.form.type.toString(),
            priority: _self.form.priority,
            status: _self.form.status.toString(),
            submitter: _self.form.submitter,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function (res) {
          _self.tableData = eval(res.data.list);
          _self.pageInfo = res.data;
          setTimeout(() => {
            _self.queryChanged = false;
            _self.queryLoading = false;
          }, 200);
        })
        .catch(function (response) {
          _self.$notify.error("产品需求信息查询时发生程序错误！");
          console.log(response);
          _self.queryLoading = false;
        });
    },

    createRequest() {
      this.showDialog = true;
      this.createCommited = false;
      if (commonQuery.roleAllowStrict([14])) {
        this.qform.type = 4;
      } else if (commonQuery.roleAllow([1, 16])) {
        this.qform.type = 1;
      } else {
        this.qform.type = 2;
      }
      this.qform.status = 1;
      this.qform.priority = 3;
      this.qform.moduleIds = [];
      this.qform.summary = "";
      this.qform.uiResource = "";
      this.qform.detail = "";
      this.qform.expectDate = "";
      this.qform.submitDate = dateFormat(new Date(), this.datefmt);
      this.qform.fileList.splice(0, this.qform.fileList.length);
      this.$nextTick(() => {
        if (this.$refs.ruledForm) {
          this.$refs.ruledForm.clearValidate();
        }
      });
    },

    saveReqCreate(formName) {
      let _self = this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交！");
          return;
        } else {
          if (_self.qform.expectDate != _self.qform.submitDate && _self.qform.priority == 1) {
            _self.$message.warning("0-Day需求必须为当天下发，请确认!");
            return;
          }
          if (_self.qform.moduleIds.length > 1) {
            _self.$confirm("您提交了多个模块的产品需求，是否确认提交？", "操作提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
              })
              .then(() => {
                _self.requestCreate();
              })
              .catch(() => {});
          } else {
            _self.requestCreate();
          }
        }
      });
    },

    requestCreate() {
      let _self = this;
      _self.checking = true;
      _self.createCommited = true;
      let fileIds = [];
      _self.qform.fileList.forEach(item => {
        fileIds.push(item.id);
      });
      _self.$axios.post("/request/create/" + _self.qform.moduleIds.toString(), {
          summary: _self.qform.summary,
          submitDate: _self.qform.submitDate,
          expectDate: _self.qform.expectDate,
          type: _self.qform.type,
          status: 1,
          uiResource: _self.qform.uiResource,
          priority: _self.qform.priority,
          attachment: fileIds.toString(),
          submitter: _self.currentUser,
          detail: _self.qform.detail
        })
        .then(function (res) {
          let result = eval(res.data);
          if (result.length == _self.qform.moduleIds.length) {
            _self.$message.success("需求提交成功！");
          } else {
            _self.$message.warning("需求提交部分失败!");
            console.log(res);
          }
          _self.showDialog = false;
          _self.checking = false;
          _self.requestQuery();
        })
        .catch(function (response) {
          _self.$notify.error("需求提交时发生程序错误！");
          _self.checking = false;
          console.log(response);
        });
    },

    editRequest(data) {
      let _self = this;
      _self.showDialogMod = true;
      _self.currentRequest = data;
      _self.currentRequest.attachments = _self.getAttach(data.attachment);
      _self.qform.type = data.type;
      _self.qform.priority = data.priority;
      _self.qform.moduleId = data.moduleId;
      _self.qform.expectDate = data.expectDate;
      _self.qform.status = 1; //只有1-已提交、4-审核拒绝两种状态可编辑，编辑之后皆为1-已提交
      _self.qform.submitter = data.submitter;
      _self.qform.uiResource = data.uiResource;
      _self.qform.submitDate = data.submitDate;
      _self.qform.refuseTimes = data.refuseTimes;
      _self.qform.summary = data.summary;
      _self.qform.detail = data.detail;
      _self.qform.fileList = _self.getAttach(data.attachment);
      this.$nextTick(_ => {
        if (_self.$refs.ruledFormMod) {
          _self.$refs.ruledFormMod.clearValidate();
        }
      });
    },

    checkReqUpdate(formName) {
      let _self = this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交！");
          return;
        } else {
          if (new Date(_self.qform.expectDate).getTime() > new Date(_self.qform.submitDate).getTime() && _self.qform.priority == 1) {
            _self.$message.warning("0-Day需求必须为当天下发，请确认!");
            return;
          }
          _self.saveEditRequest();
        }
      });
    },

    saveEditRequest() {
      let _self = this;
      let fileIds = [];
      _self.qform.fileList.forEach(function (fs, i) {
        if (fs.response) {
          fileIds.push(fs.response[0].id);
        } else {
          fileIds.push(fs.id);
        }
      });
      _self.checking = true;
      _self.$axios.post("/request/update", {
          id: _self.currentRequest.id,
          summary: _self.qform.summary,
          expectDate: _self.qform.expectDate,
          type: _self.qform.type,
          moduleId: _self.qform.moduleId,
          priority: _self.qform.priority,
          refuseTimes: _self.qform.refuseTimes,
          uiResource: _self.qform.uiResource,
          status: _self.qform.status,
          attachment: fileIds.toString(),
          detail: _self.qform.detail
        })
        .then(function (res) {
          if (res.data == 1) {
            _self.$message.success("需求信息修改成功！");
            _self.requestQuery();
            setTimeout(() => {
              _self.checking = false;
              _self.showDialogMod = false;
            }, 500);
          } else {
            _self.$message.warning("需求信息修改失败！");
            _self.checking = false;
            console.log(res);
          }
        })
        .catch(function (response) {
          _self.$notify.error("需求信息修改时发生程序错误！");
          _self.checking = false;
          console.log(response);
        });
    },

    showReqDetail(data) {
      let _self = this;
      _self.showDialogMod = true;
      _self.qform.type = data.type;
      _self.qform.priority = data.priority;
      _self.qform.moduleId = data.moduleId;
      _self.qform.expectDate = data.expectDate;
      _self.qform.status = data.status; //只有1-已提交、4-审核拒绝两种状态可编辑，编辑之后皆为1-已提交
      _self.qform.submitter = data.submitter;
      _self.qform.uiResource = data.uiResource;
      _self.qform.submitDate = data.submitDate;
      _self.qform.summary = data.summary;
      _self.qform.detail = data.detail;
      _self.qform.fileList = _self.getAttach(data.attachment);
      _self.qform.disabled = true;
    },

    cancelView() {
      this.showDialogMod = false;
      this.$set(this.qform, "disabled", false);
    },

    beforeUpload(file) {
      if (file.size / 1024 / 1024 > 1024) {
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

    fileExceeded() {
      this.$message.warning("文件个数超出限制！");
      return;
    },

    uploadComplete(res, file, fileList) {
      let _self = this;
      _self.qform.fileList = fileList;
    },

    handleRemoveMod(file, fileList) {
      let _self = this;
      _self.$message.success("文件删除成功！");
      _self.qform.fileList = fileList;
    },

    handleRemove(file, fileList) {
      let _self = this;
      commonQuery.attachmentDelete(file, fileList, (res) => {
        _self.qform.fileList = res;
      })
    },

    handlePreview(file) {
      commonQuery.attachmentDownload(file);
    },

    getAttach(attachId) {
      return commonQuery.attachmentQuery(attachId);
    },

    memberQuery() {
      let _self = this;
      commonQuery.memberQuery((result) => {
        _self.members = result.users;
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
      });
    },

    queryDirectors() {
      let _self = this;
      commonQuery.roleMemberQuery(sessionStorage.productId, 16, (result) => {
        _self.auditForm.directors = result.users;
      });
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

    queryDevManagers() {
      let _self = this;
      commonQuery.roleMemberQuery(sessionStorage.productId, 3, (result) => {
        _self.auditForm.devManagers = result.users.filter(d => {
          return [8249, 8445].indexOf(d.value) == -1
        });
      });
    },

    moduleQuery(callback) {
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
          var modules = eval(res.data.list);
          _self.modules.splice(0, _self.modules.length);
          _self.form.moduleIds.splice(0, _self.form.moduleIds.length);
          for (var i = 0; i < modules.length; i++) {
            _self.modules.push({
              label: modules[i].moduleName,
              value: modules[i].moduleId,
              pduid: modules[i].pdResponser,
              pdname: modules[i].proderName
            });
            if (commonQuery.roleAllow([1, 16]) && modules[i].pdResponser == sessionStorage.userId) {
              _self.form.moduleIds.push(modules[i].moduleId);
            }
            if (commonQuery.roleAllow([3, 5]) && modules[i].devResponser == sessionStorage.userId) {
              _self.form.moduleIds.push(modules[i].moduleId);
            }
            if (commonQuery.roleAllow([4, 6]) && modules[i].testResponser == sessionStorage.userId) {
              _self.form.moduleIds.push(modules[i].moduleId);
            }
          }
          if (typeof callback == "function") {
            callback();
          }
        })
    }
  }
};
</script>

<style>
.request-main {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.formal-req {
  width: auto;
  border: 1px solid #e4edf3;
  color: #EE6F6F;
  font-size: 15px;
  font-weight: 600;
  border-radius: 2px;
  padding: 10px 20px;
  height: 20px;
  line-height: 20px;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
  margin: 10px 35px 0 60px;
}

.formal-req .el-link {
  font-size: 15px;
  font-weight: 600;
}

.request-main .el-form-item .el-input {
  width: 180px;
}

.request-main .el-table .cell {
  padding: 0 5px;
}

.request-main .el-table i {
  font-size: 14px;
  cursor: pointer;
  color: #3AB4D7;
}

.request-main .detail-table,
.request-main .detail-table+.page-set {
  margin-left: 3% !important;
  width: 96.5% !important;
}

.request-form .el-form-item .el-input {
  width: 180px;
}

.audit-history {
  max-height: 600px;
  padding: 0 30px;
  overflow-y: auto;
}

.audit-history .el-timeline-item {
  padding-bottom: 10px;
}

.audit-history .el-timeline-item__content {
  padding: 5px;
}

.audit-history .el-tabs--border-card>.el-tabs__content {
  padding: 0;
}

.audit-history .el-card {
  border-radius: 0;
}

.audit-history .el-card__body {
  padding: 10px 20px;
}

.req-attach-upload,
.req-attach-upload input {
  width: 768px !important;
}

.req-attach-upload .el-upload--text {
  width: 100%;
  height: 80px;
}

.req-attach-upload .el-upload-dragger {
  width: 100%;
  height: 80px;
}

.req-attach-upload .el-upload-dragger .el-icon-upload {
  margin: 0;
  font-size: 40px;
}
</style>
