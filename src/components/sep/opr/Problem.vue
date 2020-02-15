<template>
  <div id="root" style="width: 100%">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-coding"></i> 基础设施
        </el-breadcrumb-item>
        <el-breadcrumb-item>线上问题</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showTips" width="750px" custom-class="problem-tips">
      <li class="problem-status-tip" style="color:orange;font-weight:500">线上问题计入开发、测试绩效测算，请谨慎操作</li>
      <li class="problem-status-tip">PIR = Problem Investigation Request，线上问题解决类需求</li>
      <li class="problem-status-tip">线上问题一级分类为【程序问题】，建议【转报PIR】，PIR发布之后方可解决和关闭</li>
      <li class="problem-status-tip">线上问题一级分类为【需求问题】，建议【修改产品特性】，可直接解决和关闭</li>
      <li class="problem-status-tip">线上问题一级分类为非需求、程序问题，可记直接记录为解决或其他，然后关闭</li>
      <li class="problem-status-tip">选择转报缺陷或需求时如未录入对应的【转报号】，保存之后会提示跳转提交需求</li>
      <li class="problem-status-tip">通过跳转提交产品需求或缺陷时，会将问题的信息自动作为对应需求或缺陷的主要信息</li>
      <li class="problem-status-tip">线上问题解决时必须填写【解决时间】，关闭之前必须补充【改进措施】信息</li>
      <li class="problem-status-tip">状态为【已转报PIR或产品特性】的线上问题，状态不可前向回溯，且必须等待【转报的需求或缺陷关闭之后】方可标记为解决或关闭（未完成）</li>
      <div slot="footer">
        <el-checkbox size="mini" v-model="hideTips" style='margin-top:-15px;float:right'>不再提示</el-checkbox>
      </div>
    </el-dialog>

    <el-dialog title="问题拒绝说明" :close-on-click-modal="modalClose" :visible.sync="showProRefuse" width="800px" :before-close="cancelRefuse">
      <el-form :model="refuseForm" size="small" :inline="false" label-width="120px" ref="refuseFormRef">
        <el-form-item label="拒绝说明" prop="refuseReason" required :rules="[{required: true, message: '请输入拒绝理由描述', trigger: 'blur'},
          {min: 5, max: 500, message: '长度在 5 到 500 个字', trigger: 'blur'}]">
          <el-input
            v-model="refuseForm.refuseReason"
            type="textarea"
            style="width:95%"
            :rows="8"
            :maxlength="500"
            show-word-limit
            clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="cancelRefuse()">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="checkRefuse()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="线上问题附件清单" :visible.sync="showAttachDialog" width="960px" top="100px">
      <el-table :data="currentProblem.attachs" size="mini" empty-text="当前线上问题没有上传附件" stripe max-height="500px">
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

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showImprove" width="750px" :before-close="cancelImprove">
      <el-form :model="currentProblem" size="mini" :inline="false" label-width="140px">
        <el-form-item label="改进措施一级" prop="improveOne" required>
          <el-select v-model="currentProblem.improveOne" clearable @change="getSecondImprove()" style="width:250px">
            <el-option v-for="opt in problemImprove" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="改进措施二级" prop="improveTwo.selected" required>
          <el-select v-model="currentProblem.improveTwo.selected" clearable style="width:250px">
            <el-option v-for="opt in currentProblem.improveTwo.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="改进计划完成日期" prop="improvePlanTo" required>
          <el-date-picker
            type="date"
            v-model="currentProblem.improvePlanTo"
            :value-format="datefmt"
            placeholder="请选择"
            clearable
            style="width:250px"></el-date-picker>
        </el-form-item>
        <el-form-item label="改进措施详情" prop="improveDetail" required :rules="[{ min: 0, max: 2000, message: '长度不可超过 2000 字，内容过多请上传附件', trigger: 'blur' }]">
          <el-input
            v-model="currentProblem.improveDetail"
            type="textarea"
            :rows="8"
            placeholder="请输入改进措施详情"
            :maxlength="2000"
            show-word-limit
            clearable>改进措施详情
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="cancelImprove()">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="showImprove=false" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="modalClose"
      title="提交线上问题"
      :visible.sync="showDialog"
      width="960px"
      :fullscreen="maximize"
      top="100px">
      <div slot="title">
        <span style="font-size:18px">提交线上问题</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form
        :model="pbform"
        size="mini"
        :rules="proFormRules"
        ref="ruledFormNew"
        :inline="true"
        label-width="115px"
        class="new-pform">
        <el-form-item label="问题摘要" prop="summary" required>
          <el-input v-model="pbform.summary" placeholder="请输入问题摘要" class="pro-summary" clearable>问题摘要</el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="responser" required>
          <el-select
            v-model="pbform.responser"
            placeholder="请选择"
            clearable
            filterable
            :filter-method="filterUsers2"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions2" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item label="所属模块" prop="moduleId" required>
          <el-select v-model="pbform.moduleId" placeholder="请选择" clearable>
            <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题优先级" prop="priority" required>
          <el-select v-model="pbform.priority" clearable>
            <el-option v-for="opt in problemPriority" :value="opt.priorityId" :key="opt.priorityId" :label="opt.priorityName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题严重程度" prop="influence" required>
          <el-select v-model="pbform.influence" clearable>
            <el-option v-for="opt in problemInfluence" :value="opt.influenceId" :key="opt.influenceId" :label="opt.influenceName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="须解决时间" prop="expectResolveTime" required>
          <el-date-picker type="datetime" :value-format="timefmt" :default-value="new Date()" v-model="pbform.expectResolveTime" placeholder="请选择须解决时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="问题一级分类" prop="typeFirst" required>
          <el-select v-model="pbform.typeFirst" clearable @change="getSecondNew()">
            <el-option v-for="opt in problemType" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题二级分类" prop="typeSecond.selected" required>
          <el-select v-model="pbform.typeSecond.selected" clearable>
            <el-option v-for="opt in pbform.typeSecond.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题处理方式" required>
          <el-select v-model="pbform.resolveMethod" prop="resolveMethod" required :disabled="currentProblem.resolveMethod<3">
            <el-option v-for="opt in resolveMethod" :value="opt.methodId" :key="opt.methodId" :label="opt.methodName"></el-option>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item label="问题详情" prop="detail">
          <el-input
            v-model="pbform.detail"
            type="textarea"
            :rows="2"
            placeholder="请输入问题详情"
            class="pro-attach-upload"
            :maxlength="2000"
            show-word-limit
            clearable>问题详情
          </el-input>
        </el-form-item>
        <br>
        <el-form-item label="附件上传">
          <el-upload
            class="pro-attach-upload"
            ref="upload"
            multiple
            drag
            :limit="5"
            :on-exceed="fileExceeded"
            :before-upload="beforeUpload"
            :on-success="uploadComplete"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="pbform.fileList"
            action=""
            :http-request="uploadAction">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">支持图片、Zip包、Office文档、pdf、txt、html等text文档，单个文件不超过50MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="resetForm('ruledFormNew')" size="small">重置</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkProblemCreate('ruledFormNew')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="modalClose"
      title="线上问题处理"
      :visible.sync="showDialogMod"
      width="960px"
      :fullscreen="maximize1"
      top="100px"
      :before-close="cancelView">
      <div slot="title">
        <span style="font-size:18px">线上问题处理</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize1=!maximize1">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize1==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize1==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form
        :model="currentProblem"
        size="mini"
        :rules="currentProblemRules"
        ref="ruledFormEdit"
        :inline="true"
        label-width="115px"
        class="new-pform">
        <el-form-item label="问题状态" prop="status" required>
          <el-select v-model="currentProblem.status" @change="checkStatus()" :disabled="currentProblem.disabled">
            <el-option v-for="opt in problemStatus" :value="opt.statusId" :key="opt.statusId" :label="opt.statusName" :disabled="opt.disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="须解决时间" prop="expectResolveTime" required>
          <el-date-picker :disabled="currentProblem.disabled" type="datetime" :value-format="timefmt" v-model="currentProblem.expectResolveTime" placeholder="请选择须解决时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="解决时间">
          <el-date-picker
            type="datetime"
            :value-format="timefmt"
            :default-value="new Date()"
            v-model="currentProblem.resolveTime"
            :disabled="currentProblem.disabled || (currentProblem.status<3 && currentProblem.status>0)"
            placeholder="请选择解决时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="问题摘要" prop="summary" required>
          <el-input v-model="currentProblem.summary" placeholder="请输入问题摘要" class="pro-summary" clearable :disabled="currentProblem.disabled">问题摘要</el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="responser" required>
          <el-select
            v-model="currentProblem.responser"
            placeholder="请选择"
            clearable
            filterable
            :filter-method="filterUsers3"
            :disabled="currentProblem.disabled"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions3" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="所属模块" prop="moduleId" required>
          <el-select v-model="currentProblem.moduleId" placeholder="请选择" clearable :disabled="currentProblem.disabled">
            <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题优先级" prop="priority" required>
          <el-select v-model="currentProblem.priority" clearable :disabled="currentProblem.disabled">
            <el-option v-for="opt in problemPriority" :value="opt.priorityId" :key="opt.priorityId" :label="opt.priorityName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题严重程度" prop="influence" required>
          <el-select v-model="currentProblem.influence" clearable :disabled="currentProblem.disabled">
            <el-option v-for="opt in problemInfluence" :value="opt.influenceId" :key="opt.influenceId" :label="opt.influenceName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题一级分类" prop="typeFirst" required>
          <el-select v-model="currentProblem.typeFirst" clearable @change="getSecondMod()" :disabled="currentProblem.disabled">
            <el-option v-for="opt in problemType" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题二级分类" prop="typeSecond.selected" required>
          <el-select v-model="currentProblem.typeSecond.selected" clearable :disabled="currentProblem.disabled">
            <el-option v-for="opt in currentProblem.typeSecond.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题处理方式" prop="resolveMethod" required>
          <el-select v-model="currentProblem.resolveMethod" :disabled="currentProblem.resolveMethod<3 || currentProblem.disabled">
            <el-option v-for="opt in resolveMethod" :value="opt.methodId" :key="opt.methodId" :label="opt.methodName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转报号" prop="transId">
          <el-input v-model="currentProblem.transId" placeholder="请输入转报号" disabled>转报号</el-input>
        </el-form-item>
        <br>
        <el-form-item label="问题详情" prop="detail">
          <el-input
            v-model="currentProblem.detail"
            type="textarea"
            :rows="2"
            placeholder="请输入问题详情"
            class="pro-attach-upload"
            :maxlength="2000"
            :disabled="currentProblem.disabled"
            show-word-limit
            clearable>问题详情
          </el-input>
        </el-form-item>
        <br>
        <el-form-item label="附件上传">
          <el-upload
            class="pro-attach-upload"
            ref="uploadMod"
            multiple
            drag
            :limit="5"
            :disabled="currentProblem.disabled"
            :on-exceed="fileExceeded"
            :before-upload="beforeUpload"
            :on-success="uploadComplete"
            :on-preview="handlePreview"
            :on-remove="handleRemoveMod"
            :file-list="currentProblem.fileList"
            action=""
            :http-request="uploadActionMod">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">支持图片、Zip包、Office文档、pdf、txt、html等text文档，单个文件不超过50MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="cancelView" size="small">取消</el-button>
        <el-button
          v-no-more-click
          type="primary"
          icon="el-icon-delete"
          :disabled="refuseDenined()"
          @click="refuseProblem()"
          size="small">拒绝</el-button>
        <el-button
          v-if="!currentProblem.disabled"
          v-no-more-click
          type="primary"
          icon="el-icon-edit"
          @click="showImprove=true"
          size="small">改进措施</el-button>
        <el-button
          v-if="!currentProblem.disabled"
          v-no-more-click
          type="primary"
          icon="el-icon-circle-check"
          @click="checkProblemEdit('ruledFormEdit')"
          size="small">确定</el-button>
      </div>
    </el-dialog>

    <div class="pro-form">
      <el-form ref="form" :inline="true" size="mini" label-width="100px" @keydown.native.enter="problemQuery()">
        <el-form-item label="上报人">
          <el-select v-model="form.submitter" clearable filterable :filter-method="filterUsers" @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="form.responser" clearable filterable :filter-method="filterUsers1" @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions1" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="form.priority" clearable>
            <el-option v-for="opt in problemPriority" :value="opt.priorityId" :key="opt.priorityId" :label="opt.priorityName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="严重程度">
          <el-select v-model="form.influence" clearable>
            <el-option v-for="opt in problemInfluence" :value="opt.influenceId" :key="opt.influenceId" :label="opt.influenceName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属模块">
          <el-select v-model="form.moduleId" clearable>
            <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题状态">
          <el-select v-model="form.status" clearable multiple collapse-tags>
            <el-option v-for="opt in problemStatus" :value="opt.statusId" :key="opt.statusId" :label="opt.statusName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="线上问题号">
          <el-input v-model="form.id" placeholder="请输入" clearable>线上问题号</el-input>
        </el-form-item>
        <el-form-item label="转报号">
          <el-input v-model="form.transId" placeholder="请输入" clearable>转报号</el-input>
        </el-form-item>
        <el-form-item label="一级分类">
          <el-select v-model="form.typeFirst" clearable @change="getSecond()">
            <el-option v-for="opt in problemType" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类">
          <el-select v-model="form.typeSecond.selected" clearable>
            <el-option v-for="opt in form.typeSecond.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上报日期">
          <el-date-picker
            v-model="form.submitTime"
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
        <el-form-item label="解决日期">
          <el-date-picker
            v-model="form.resolveTime"
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
        <el-form-item label="关闭日期">
          <el-date-picker
            v-model="form.closeTime"
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
        <el-form-item style="float:right">
          <el-button v-no-more-click type="text" @click="showTips=true">操作提示</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-circle-plus-outline" @click="benginSubmit()">线上问题上报</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="problemQuery()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="dataRevert"
        :max-height="tableHeight"
        size="mini"
        stripe
        ref="proTable"
        :expand-row-keys="expandedPros"
        row-key="id"
        @expand-change="manualExpand"
        :border="showBorder"
        v-loading="queryLoading"
        element-loading-text="查询中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column prop="id" label="线上问题号" align="center" width="110" sortable>
          <template slot-scope="scope">
            <el-button v-no-more-click type="text" size="mini" @click="showProDetail(scope.row)">{{scope.row.id}}</el-button>
            <i class="iconfont icon-attachment" v-if="countAttach(scope.row.attachment) > 0" @click="showAttachs(scope.row)"></i>
          </template>
        </el-table-column>
        <el-table-column prop="summary" label="问题摘要" header-align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="submitterName" label="上报人" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="submitTime" label="上报时间" width="140" align="center" sortable>
        </el-table-column>
        <el-table-column prop="expectResolveTime" label="须解决时间" width="140" align="center" sortable>
        </el-table-column>
        <el-table-column prop="responserName" label="负责人" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="statusName" label="问题状态" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="priorityName" label="优先级" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="influenceName" label="严重程度" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column type="expand" label="详情">
          <template slot-scope="scope">
            <el-form label-position="right" inline class="pro-table-expand" size="mini">
              <el-form-item label="所属模块">
                <el-input v-model="scope.row.moduleName" disabled></el-input>
              </el-form-item>
              <el-form-item label="问题一级分类">
                <el-input v-model="scope.row.typeFirstName" disabled></el-input>
              </el-form-item>
              <el-form-item label="问题二级分类">
                <el-input v-model="scope.row.typeSecondName" disabled></el-input>
              </el-form-item>
              <el-form-item label="问题处理方式">
                <el-input v-if="scope.row.resolveMethod!=5" v-model="scope.row.resolveMethodName" disabled></el-input>
                <div class="content-tips" v-else>
                  <el-popover placement="right-end" width="600" trigger="click">
                    <el-input type="textarea" v-model="scope.row.refuseReason" :rows="10" disabled resize="none"></el-input>
                    <span slot="reference" style="cursor:pointer">{{scope.row.resolveMethodName}}</span>
                  </el-popover>
                </div>
              </el-form-item>
              <el-form-item label="转报号">
                <el-input v-model="scope.row.transId" disabled></el-input>
              </el-form-item>
              <el-form-item label="解决时间">
                <el-input v-model="scope.row.resolveTime" disabled></el-input>
              </el-form-item>
              <el-form-item label="关闭时间">
                <el-input v-model="scope.row.closeTime" disabled></el-input>
              </el-form-item>
              <el-form-item label="解决耗时">
                <el-input v-model="scope.row.resolveCost" disabled></el-input>
              </el-form-item>
              <el-form-item label="改进措施一级">
                <el-input v-model="scope.row.improveOneName" disabled></el-input>
              </el-form-item>
              <el-form-item label="改进措施二级">
                <el-input v-model="scope.row.improveTwoName" disabled></el-input>
              </el-form-item>
              <el-form-item label="改进计划完成">
                <el-input v-model="scope.row.improvePlanTo" disabled></el-input>
              </el-form-item>
              <el-form-item label="改进措施详情">
                <div class="content-tips">
                  <el-popover placement="right-end" :disabled="!scope.row.improveDetail" width="600" trigger="click">
                    <el-input type="textarea" v-model="scope.row.improveDetail" :rows="10" disabled resize="none"></el-input>
                    <span slot="reference" style="cursor:pointer" v-if="null!=scope.row.improveDetail&&scope.row.improveDetail!=''">点此查看</span>
                  </el-popover>
                </div>
              </el-form-item>
              <br>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column width="65" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="primary" size="mini" :disabled="editDenined(scope.row)" @click="editProblemInfo(scope.row)">处理</el-button>
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
          @click="exportCSV('线上问题清单数据', 'proTable')">
          导出CSV
        </el-button>
        <div class="export-tips">导出CSV文件请使用<span>新版本</span>MS Office或者WPS表格工具打开</div>
      </div>
    </div>
  </div>
</template>

<script>
import commonQuery from "@/components/util/CommonQuery.vue";
import {
  dateFormat,
  dateDiff,
  pickOptions
} from "@/util/date.js";
import TableExport from '@/util/TableExport.js'

export default {
  data: function () {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      showTips: !localStorage.hideTips || localStorage.hideTips == 'false',
      hideTips: localStorage.hideTips && localStorage.hideTips == 'true',
      tableData: [],
      pageInfo: {},
      maximize: false,
      maximize1: false,
      queryLoading: false,
      datefmt: defaultDateFormat,
      timefmt: defaultTimeFormat,
      modules: [],
      problemType: [],
      problemImprove: [],
      problemStatus: eval(localStorage.getItem("problemStatus")),
      problemPriority: eval(localStorage.getItem("defectPriority")),
      problemInfluence: eval(localStorage.getItem("defectInfluence")),
      resolveMethod: eval(localStorage.getItem("problemResolve")),
      tableHeight: 0,
      dialogWidth: document.body.clientWidth - 100,
      showDetail: false,
      showDialog: false,
      showImprove: false,
      showDialogMod: false,
      showAttachDialog: false,
      showProRefuse: false,
      members: [],
      memberFull: [],
      userOptions: [],
      userOptions1: [],
      userOptions2: [],
      userOptions3: [],
      pickOptions: pickOptions,
      form: {
        id: "",
        priority: "",
        influence: "",
        transId: "",
        moduleId: "",
        submitter: "",
        responser: "",
        typeFirst: "",
        typeSecond: {
          selected: "",
          opts: []
        },
        status: [1, 2, 3, 4],
        submitTime: [],
        resolveTime: [],
        closeTime: []
      },
      reqForm: {
        type: "",
        status: "",
        priority: "",
        moduleId: "",
        submitter: sessionStorage.userName,
        submitDate: "",
        expectDate: "",
        fileList: [],
        summary: "",
        detail: ""
      },
      attachIds: "",
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      pbform: {
        id: "",
        priority: "",
        influence: "",
        transId: "",
        moduleId: "",
        submitter: "",
        responser: "",
        typeFirst: "",
        typeSecond: {
          selected: "",
          opts: []
        },
        summary: "",
        detail: "",
        attachment: "",
        fileList: [],
        expectResolveTime: "",
        resolveMethod: ""
      },
      proFormRules: {
        priority: [{
          required: true,
          message: '请选择优先级',
          trigger: 'change'
        }],
        influence: [{
          required: true,
          message: '请选择严重程度',
          trigger: 'change'
        }],
        responser: [{
          required: true,
          message: '请选择负责人',
          trigger: 'change'
        }],
        typeFirst: [{
          required: true,
          message: '请选择一级分类',
          trigger: 'change'
        }],
        'typeSecond.selected': [{
          required: true,
          message: '请选择二级分类',
          trigger: 'change'
        }],
        resolveMethod: [{
          required: true,
          message: '请选择问题处理方式',
          trigger: 'change'
        }],
        moduleId: [{
          required: true,
          message: '请选择产品模块',
          trigger: 'change'
        }],
        expectResolveTime: [{
          required: true,
          message: '请提供须解决时间',
          trigger: 'change'
        }],
        summary: [{
            required: true,
            message: '请输入线上问题摘要',
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
      expandedPros: [],
      currentProblem: {
        priority: "",
        influence: "",
        transId: "",
        moduleId: "",
        submitter: "",
        responser: "",
        typeFirst: "",
        typeSecond: {
          selected: "",
          opts: []
        },
        orgStatus: "",
        status: "",
        improvePlanTo: "",
        improveDetail: "",
        improveOne: "",
        improveTwo: {
          selected: "",
          opts: []
        },
        summary: "",
        detail: "",
        attachment: "",
        fileList: [],
        attachs: [],
        expectResolveTime: "",
        resolveMethod: "",
        resolveTime: ""
      },
      currentProblemRules: {
        status: [{
          required: true,
          message: '请选择线上问题状态',
          trigger: 'change'
        }],
        priority: [{
          required: true,
          message: '请选择优先级',
          trigger: 'change'
        }],
        influence: [{
          required: true,
          message: '请选择严重程度',
          trigger: 'change'
        }],
        responser: [{
          required: true,
          message: '请选择负责人',
          trigger: 'change'
        }],
        typeFirst: [{
          required: true,
          message: '请选择一级分类',
          trigger: 'change'
        }],
        expectResolveTime: [{
          required: true,
          message: '请提供须解决时间',
          trigger: 'change'
        }],
        'typeSecond.selected': [{
          required: true,
          message: '请选择二级分类',
          trigger: 'change'
        }],
        resolveMethod: [{
          required: true,
          message: '请选择问题处理方式',
          trigger: 'change'
        }],
        moduleId: [{
          required: true,
          message: '请选择产品模块',
          trigger: 'change'
        }],
        summary: [{
            required: true,
            message: '请输入线上问题摘要',
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
      orgProblem: {},
      refuseForm: {
        refuseReason: ""
      }
    };
  },

  watch: {
    hideTips: function (val, old) {
      if (val != old) {
        localStorage.setItem("hideTips", val);
      }
    },

    'currentProblem.status': function (val, old) {
      if (val != 0) {
        this.currentProblem.improvePlanTo = "";
        this.currentProblem.improveDetail = "";
        this.currentProblem.improveOne = "";
        this.currentProblem.improveTwo.selected = "";
      }
    },

    form: {
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
        this.problemQuery();
      }
    }
  },

  computed: {
    dataRevert() {
      for (let i = 0, datas = this.tableData; i < datas.length; i++) {
        let day = parseInt(datas[i].resolveCost / 8);
        let hour = parseInt(datas[i].resolveCost - day * 8);
        let min = parseInt((datas[i].resolveCost - day * 8 - hour) * 60);
        this.$set(datas[i], "resolveCost", day + " 工作日" + hour + " 时" + min + " 分");
        this.tableData.splice(i, 1, datas[i]);
      }
      return this.tableData;
    }
  },

  created() {
    let _self = this;

    let typeOpts = _self.sortData(eval(localStorage.getItem("problemType")), "type", "typeDesc", "children");
    _self.problemType.splice(0, _self.problemType.length);
    typeOpts.forEach(item => {
      _self.problemType.push({
        value: item.type,
        label: item.typeDesc,
        disabled: item.type == 6,
        children: item.children
      });
    });

    let improveOpts = _self.sortData(eval(localStorage.getItem("problemImprove")), "type", "typeDesc", "children");
    _self.problemImprove.splice(0, _self.problemImprove.length);
    improveOpts.forEach(item => {
      _self.problemImprove.push({
        value: item.type,
        label: item.typeDesc,
        children: item.children
      });
    });

    _self.tableHeight = bodyAviHeightNTab - 150 - 45;
    let date = new Date();
    let oldDay = new Date();
    oldDay.setTime(oldDay.getTime() - 3600 * 1000 * 24 * 90);
    let dateBegin = dateFormat(oldDay, _self.datefmt);
    let dateEnd = dateFormat(date, _self.datefmt);
    _self.form.submitTime.push(dateBegin);
    _self.form.submitTime.push(dateEnd);
    _self.pbform.submitTime = dateEnd;

    _self.moduleQuery();

    if (_self.$route.params.id) {
      _self.form.id = _self.$route.params.id;
      _self.form.submitTime.splice(0, _self.form.submitTime.length);
    } else if (_self.$route.params.transId) {
      _self.form.transId = _self.$route.params.transId;
      _self.form.submitTime.splice(0, _self.form.submitTime.length);
    }
    _self.memberQuery(this.problemQuery);
  },

  methods: {
    resetFilterText() {
      let _self = this;
      _self.userOptions = _self.memberFull;
      _self.userOptions1 = _self.memberFull;
      _self.userOptions2 = _self.memberFull;
      _self.userOptions3 = _self.memberFull;
    },

    filterUsers(val) {
      let _self = this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers1(val) {
      let _self = this;
      _self.userOptions1 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers2(val) {
      let _self = this;
      _self.userOptions2 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers3(val) {
      let _self = this;
      _self.userOptions3 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.problemQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.problemQuery();
    },

    benginSubmit() {
      let _self = this;
      _self.showDialog = true;
      _self.pbform.fileList = [];
      _self.resetForm("ruledFormNew");
    },

    editDenined(row) {
      if (row.status == 0) {
        return true;
      }
      if (row.responser == sessionStorage.userId) {
        return false;
      }
      return !commonQuery.roleAllow([2, 3, 4, 8, 10]);
    },

    refuseDenined() {
      let _self = this;
      if (_self.currentProblem.status != 1) {
        return true;
      }
      if (commonQuery.isNull(_self.currentProblem.transId)) {
        return true;
      }
      return _self.currentProblem.responser != sessionStorage.userId && !commonQuery.roleAllow([2, 3, 4, 8, 10]);
    },

    showAttachs(row) {
      let _self = this;
      _self.showAttachDialog = true;
      _self.currentProblem.attachs = _self.getAttach(row.attachment);
    },

    countAttach(attach) {
      return null == attach || attach == "" ? 0 : attach.split(",").length;
    },

    sortData(json, idKey, labelKey, childKey) {
      let temp = [];
      let result = [];
      for (let i = 0; i < json.length; i++) {
        temp.push(json[i][idKey]);
      }
      temp = temp.filter(function (element, index, array) {
        return array.indexOf(element) === index;
      });

      for (let k = 0; k < temp.length; k++) {
        let children = json.filter(function (d) {
          return d[idKey] === temp[k];
        });
        result.push({
          [idKey]: temp[k],
          [labelKey]: children[0][labelKey],
          [childKey]: children
        });
      }
      return result;
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    openAttach(fileObject) {
      commonQuery.attachmentDownload(fileObject);
    },

    getSecond() {
      let _self = this;
      _self.form.typeSecond.selected = "";
      _self.form.typeSecond.opts.splice(0, _self.form.typeSecond.opts.length);
      if (!commonQuery.isNull(_self.form.typeFirst)) {
        let typeSencond = _self.problemType.find(item => {
          return item.value == _self.form.typeFirst;
        }).children || [];
        typeSencond.forEach(item => {
          _self.form.typeSecond.opts.push({
            value: item.subType,
            label: item.subDesc
          });
        });
      }
    },

    getSecondNew() {
      let _self = this;
      _self.pbform.typeSecond.selected = "";
      _self.pbform.typeSecond.opts.splice(0, _self.pbform.typeSecond.opts.length);
      if (!commonQuery.isNull(_self.pbform.typeFirst)) {
        const typeFirst = _self.pbform.typeFirst;
        if (typeFirst == 1) {
          _self.pbform.resolveMethod = 1;
        } else if (typeFirst == 4) {
          _self.pbform.resolveMethod = 2;
        } else {
          _self.pbform.resolveMethod = 3;
        }
        const typeSencond = _self.problemType.find(item => {
          return item.value == _self.pbform.typeFirst;
        }).children || [];
        typeSencond.forEach(item => {
          _self.pbform.typeSecond.opts.push({
            value: item.subType,
            label: item.subDesc
          });
        });
      }
    },

    getSecondMod() {
      let _self = this;
      _self.currentProblem.typeSecond.selected = "";
      _self.currentProblem.typeSecond.opts.splice(0, _self.currentProblem.typeSecond.opts.length);
      if (!commonQuery.isNull(_self.currentProblem.typeFirst)) {
        const typeFirst = _self.currentProblem.typeFirst;
        if (typeFirst == 1) {
          _self.currentProblem.resolveMethod = 1;
        } else if (typeFirst == 4) {
          _self.currentProblem.resolveMethod = 2;
        } else if (typeFirst == 6) {
          _self.currentProblem.resolveMethod = 5;
          _self.currentProblem.typeSecond.selected = 1;
        } else {
          _self.currentProblem.resolveMethod = 3;
        }
        const typeSencond = _self.problemType.find(item => {
          return item.value == _self.currentProblem.typeFirst;
        }).children || [];
        typeSencond.forEach(item => {
          _self.currentProblem.typeSecond.opts.push({
            value: item.subType,
            label: item.subDesc
          });
        });
      }
    },

    getSecondImprove() {
      let _self = this;
      _self.currentProblem.improveTwo.selected = "";
      _self.currentProblem.improveTwo.opts.splice(0, _self.currentProblem.improveTwo.opts.length);
      if (!commonQuery.isNull(_self.currentProblem.improveOne)) {
        const improveTwo = _self.problemImprove.find(item => {
          return item.value == _self.currentProblem.improveOne;
        }).children || [];
        improveTwo.forEach(item => {
          _self.currentProblem.improveTwo.opts.push({
            value: item.subType,
            label: item.subDesc
          });
        });
      }
    },

    cancelRefuse(done) {
      let _self = this;
      _self.showProRefuse = false;
      _self.refuseForm.refuseReason = "";
      _self.currentProblem.typeFirst = _self.orgProblem.typeFirst;
      _self.currentProblem.typeSecond.selected = _self.orgProblem.typeSecond;
      _self.currentProblem.resolveMethod = _self.orgProblem.resolveMethod;
      _self.$message.warning("已取消拒绝操作！");
      if (typeof done == "function") {
        done();
      }
    },

    refuseProblem() {
      let _self = this;
      _self.$confirm("您确定要拒绝本线上问题吗？", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        })
        .then(() => {
          if (commonQuery.isNull(_self.currentProblem.transId)) {
            _self.$message.warning("既非程序问题又非需求问题，请直接关闭！");
            return;
          }
          _self.judgeTransBeginDevelop(_self.currentProblem.transId, (cmCount) => {
            if (cmCount > 0) {
              _self.$message.warning("所转报需求已经进入开发流程，不可操作！");
              _self.currentProblem.typeFirst = _self.orgProblem.typeFirst;
              _self.currentProblem.typeSecond.selected = _self.orgProblem.typeSecond;
              _self.currentProblem.resolveMethod = _self.orgProblem.resolveMethod;
              _self.showProRefuse = false;
            } else {
              _self.currentProblem.typeFirst = 6;
              _self.currentProblem.typeSecond.selected = 1;
              _self.currentProblem.resolveMethod = 5;
              _self.showProRefuse = true;
            }
          });
        })
    },

    checkRefuse() {
      let _self = this;
      _self.$refs.refuseFormRef.validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交！");
          return;
        } else {
          _self.confirmRefuse();
        }
      });
    },

    confirmRefuse() {
      let _self = this;
      _self.$confirm("您确定要拒绝本线上问题吗？", "操作二次确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          _self.showProRefuse = false;
          _self.$axios.post("/problem/refuse", {
              id: _self.currentProblem.id,
              status: 0,
              typeFirst: 6,
              typeSecond: 1,
              resolveMethod: 5,
              refuseReason: _self.refuseForm.refuseReason,
              closeTime: dateFormat(new Date(), _self.timefmt)
            })
            .then(function (res) {
              if (res.data > 0) {
                _self.showDialogMod = false;
                _self.$message.success("线上问题已拒绝！");
                _self.problemQuery();
              } else {
                _self.$message.info("线上问题拒绝失败！");
                console.log(res);
              }
            })
        })
        .catch(() => {
          _self.currentProblem.typeFirst = _self.orgProblem.typeFirst;
          _self.currentProblem.typeSecond.selected = _self.orgProblem.typeSecond;
          _self.currentProblem.resolveMethod = _self.orgProblem.resolveMethod;
        })
    },

    judgeTransBeginDevelop(reqId, callback) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/cms/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            reqId: reqId
          }
        })
        .then(function (res) {
          let missions = eval(res.data.list);
          _self.$nextTick(() => {
            if (typeof callback == "function") {
              callback(missions.length);
            }
          })
        })
    },

    manualExpand(row, expandedRows) {
      let _self = this;
      if (_self.expandedPros.indexOf(row.id) >= 0) {
        _self.expandedPros.shift()
      } else {
        _self.expandedPros.shift();
        _self.expandedPros.push(row.id);
      }
      if (expandedRows.length > 1) {
        expandedRows.shift()
      }
    },

    cancelImprove(done) {
      let _self = this;
      _self.showImprove = false;
      _self.currentProblem.improvePlanTo = "";
      _self.currentProblem.improveDetail = "";
      _self.currentProblem.improveOne = "";
      _self.currentProblem.improveTwo.selected = "";
      _self.currentProblem.status = _self.currentProblem.orgStatus;
      _self.$message.warning("取消提供改进措施操作，数据已还原！");
      if (typeof done == "function") {
        done();
      }
    },

    reqCreate(proId, callback) {
      let _self = this;
      _self.$axios.post("/req/create", {
          summary: _self.reqForm.summary,
          submitDate: dateFormat(new Date(), _self.datefmt),
          expectDate: _self.reqForm.expectDate,
          type: _self.reqForm.type,
          moduleId: _self.reqForm.moduleId,
          sourceId: proId,
          status: 1,
          priority: _self.reqForm.priority,
          attachment: _self.attachIds,
          submitter: sessionStorage.userId,
          detail: commonQuery.isNull(_self.reqForm.detail) ? "" : _self.reqForm.detail
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.showReqSubmit = false;
            _self.$message.success("线上问题衍生需求提交成功！");
            _self.$confirm("现在是否立即前往查看需求？", "操作提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "success"
              })
              .then(() => {
                _self.$router.push({
                  name: "request",
                  params: {
                    id: res.data
                  }
                });
              })
              .catch(() => {
                if (typeof callback == "function") {
                  callback();
                }
              });
          } else {
            _self.$message.warning("线上问题衍生需求提交失败!");
            console.log(res);
          }
        })
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
      return true;
    },

    fileExceeded(files, fileList) {
      this.$message.info("文件个数超出限制！");
      return;
    },

    uploadComplete(res, file, fileList) {
      let _self = this;
      _self.pbform.fileList = fileList;
      _self.currentProblem.fileList = fileList;
    },

    handleRemoveMod(file, fileList) {
      let _self = this;
      _self.$message.success("文件删除成功！");
      _self.currentProblem.fileList = fileList;
    },

    handleRemove(file, fileList) {
      let _self = this;
      commonQuery.attachmentDelete(file, fileList, (res) => {
        _self.pbform.fileList = res;
      })
    },

    handlePreview(file) {
      commonQuery.attachmentDownload(file);
    },

    uploadAction(params) {
      let _self = this;
      let file = params.file;
      let fileList = _self.pbform.fileList || [];

      if (file.name.indexOf("_V") > -1) {
        _self.$message.warning("请去除文件名中包含的字符串： _V");
        _self.$refs.upload.uploadFiles = fileList.filter(item => {
          return item.status == 'success'
        }) || [];
        return;
      }
      commonQuery.attachmentUpload(file, fileList, (res) => {
        _self.pbform.fileList = res;
      })
    },

    uploadActionMod(params) {
      let _self = this;
      let file = params.file;
      let fileList = _self.currentProblem.fileList || [];

      if (file.name.indexOf("_V") > -1) {
        _self.$message.warning("请去除文件名中包含的字符串： _V");
        _self.$refs.uploadMod.uploadFiles = fileList.filter(item => {
          return item.status == 'success'
        }) || [];
        return;
      }
      commonQuery.attachmentUpload(file, fileList, (res) => {
        _self.currentProblem.fileList = res;
      })
    },

    showProDetail(data) {
      this.editProblemInfo(data);
      this.$set(this.currentProblem, "disabled", true);
    },

    cancelView() {
      this.showDialogMod = false;
      this.$set(this.currentProblem, "disabled", false);
    },

    editProblemInfo(data) {
      let _self = this;
      _self.orgProblem = JSON.parse(JSON.stringify(data));
      _self.problemStatus.forEach(item => {
        delete item["disabled"];
      });
      _self.showDialogMod = true;
      _self.currentProblem.typeFirst = data.typeFirst;
      _self.getSecondMod();
      _self.currentProblem.orgStatus = data.status;
      _self.currentProblem.status = data.status;
      _self.currentProblem.submitter = data.submitter;
      _self.currentProblem.responser = data.responser;
      _self.currentProblem.id = data.id;
      _self.currentProblem.transId = data.transId;
      _self.currentProblem.moduleId = data.moduleId;
      _self.currentProblem.priority = data.priority;
      _self.currentProblem.influence = data.influence;
      _self.currentProblem.summary = data.summary;
      _self.currentProblem.detail = data.detail;
      _self.currentProblem.fileList = _self.getAttach(data.attachment);
      _self.currentProblem.attachment = data.attachment;
      _self.currentProblem.submitTime = data.submitTime;
      _self.currentProblem.expectResolveTime = data.expectResolveTime;
      _self.currentProblem.resolveTime = data.resolveTime;
      _self.currentProblem.closeTime = data.closeTime;
      _self.currentProblem.resolveCost = data.resolveCost;
      _self.currentProblem.improveOne = data.improveOne;
      _self.getSecondImprove();
      _self.currentProblem.improvePlanTo = data.improvePlanTo;
      _self.currentProblem.improveDetail = data.improveDetail;
      _self.currentProblem.typeSecond.selected = data.typeSecond;
      _self.currentProblem.improveTwo.selected = data.improveTwo;
      _self.currentProblem.resolveMethod = data.resolveMethod;
      if ((data.status == 2 || data.status == 3) && !commonQuery.isNull(data.transId)) {
        for (let i = 0; i < _self.problemStatus.length; i++) {
          _self.$set(_self.problemStatus[i], "disabled", _self.problemStatus[i].value < 4);
        }
      }
    },

    resetForm(formName) {
      if (this.$refs[formName]) {
        this.$refs[formName].resetFields();
      }
    },

    checkProblemCreate(formName) {
      let _self = this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.saveProblemCreate();
        }
      });
    },

    checkStatus() {
      let _self = this;
      if (_self.currentProblem.status == 0) {
        _self.showImprove = true;
      }
      if (_self.currentProblem.status < 4 && _self.currentProblem.status > 0) {
        _self.currentProblem.resolveTime = "";
      }
    },

    checkProblemEdit(formName) {
      let _self = this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.saveProblemEdit();
        }
      });
    },

    getAttach(attachId, callback) {
      let result = commonQuery.attachmentQuery(attachId);
      if (typeof callback == "function") {
        callback && callback(result);
      }
      return result;
    },

    problemQuery() {
      let _self = this;
      let submitTimeBegin = "";
      let submitTimeEnd = "";
      let resolveTimeBegin = "";
      let resolveTimeEnd = "";
      let closeTimeBegin = "";
      let closeTimeEnd = "";
      if (_self.form.submitTime && _self.form.submitTime.length > 1) {
        submitTimeBegin = _self.form.submitTime[0];
        submitTimeEnd = _self.form.submitTime[1];
      }
      if (_self.form.resolveTime && _self.form.resolveTime.length > 1) {
        resolveTimeBegin = _self.form.resolveTime[0];
        resolveTimeEnd = _self.form.resolveTime[1];
      }
      if (_self.form.closeTime && _self.form.closeTime.length > 1) {
        closeTimeBegin = _self.form.closeTime[0];
        closeTimeEnd = _self.form.closeTime[1];
      }

      let param = {
        id: _self.form.id,
        transId: _self.form.transId,
        submitter: _self.form.submitter,
        responser: _self.form.responser,
        priority: _self.form.priority,
        influence: _self.form.influence,
        status: _self.form.status.toString(),
        moduleId: _self.form.moduleId,
        typeFirst: _self.form.typeFirst,
        typeSecond: _self.form.typeSecond.selected,
        submitTimeBegin: submitTimeBegin,
        submitTimeEnd: submitTimeEnd,
        resolveTimeBegin: resolveTimeBegin,
        resolveTimeEnd: resolveTimeEnd,
        closeTimeBegin: closeTimeBegin,
        closeTimeEnd: closeTimeEnd,
        pageNum: _self.currentPage,
        pageSize: _self.pageSize
      };

      if (_self.$route.params.transId) {
        param = {
          transId: _self.$route.params.transId,
          pageNum: _self.currentPage,
          pageSize: _self.pageSize
        }
      } else if (_self.$route.params.id) {
        param = {
          id: _self.$route.params.id,
          pageNum: _self.currentPage,
          pageSize: _self.pageSize
        }
      }

      _self.$axios({
          method: "post",
          url: "/problem/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: param
        })
        .then(function (res) {
          _self.tableData = eval(res.data.list);
          _self.pageInfo = res.data;
          _self.queryLoading = false;
          _self.$nextTick(() => {
            setTimeout(() => {
              _self.queryChanged = false;
            }, 200);
          });
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
          _self.queryLoading = false;
        });
    },

    onCancel() {
      this.showDialog = false;
    },

    saveProblemEdit() {
      let _self = this;
      if (_self.currentProblem.status == 3 && commonQuery.isNull(_self.currentProblem.resolveTime)) {
        _self.$message.warning("已解决问题请补充解决时间！");
        return;
      }
      if (_self.currentProblem.status == 0 && (commonQuery.isNull(_self.currentProblem.improvePlanTo) || commonQuery.isNull(_self.currentProblem.improveDetail) ||
          commonQuery.isNull(_self.currentProblem.improveOne) || commonQuery.isNull(_self.currentProblem.improveTwo))) {
        _self.$message.warning("问题关闭前请补充改进措施！");
        return;
      }
      let files = [];
      _self.currentProblem.fileList.forEach(function (fs, i) {
        if (fs.response) {
          files.push(fs.response[0].id);
        } else {
          files.push(fs.id);
        }
      });
      _self.attachIds = files.toString();

      let colseTime = _self.currentProblem.closeTime;
      if (commonQuery.isNull(colseTime) && _self.currentProblem.status == 0) {
        colseTime = dateFormat(new Date(), _self.timefmt);
      }
      _self.$axios.post("/problem/update", {
          id: _self.currentProblem.id,
          status: _self.currentProblem.status,
          priority: _self.currentProblem.priority,
          influence: _self.currentProblem.influence,
          responser: _self.currentProblem.responser,
          typeFirst: _self.currentProblem.typeFirst,
          typeSecond: _self.currentProblem.typeSecond.selected,
          resolveMethod: _self.currentProblem.resolveMethod,
          expectResolveTime: _self.currentProblem.expectResolveTime,
          transId: _self.currentProblem.transId,
          moduleId: _self.currentProblem.moduleId,
          summary: _self.currentProblem.summary,
          attachment: files.toString(),
          resolveTime: _self.currentProblem.resolveTime,
          closeTime: colseTime,
          resolveCost: !commonQuery.isNull(_self.currentProblem.resolveTime) ?
            dateDiff(new Date(_self.currentProblem.submitTime), new Date(_self.currentProblem.resolveTime)) : null,
          improveOne: _self.currentProblem.improveOne,
          improveTwo: _self.currentProblem.improveTwo.selected,
          improvePlanTo: _self.currentProblem.improvePlanTo,
          improveDetail: _self.currentProblem.improveDetail,
          detail: _self.currentProblem.detail
        })
        .then(function (res) {
          if (res.data == 1) {
            _self.$message.success("线上问题信息修改成功！");
            _self.showDialogMod = false;
            _self.currentProblem.attachment = files.toString();
            if (_self.currentProblem.resolveMethod == 2 && commonQuery.isNull(_self.currentProblem.transId)) {
              _self.reqForm.type = 1;
              _self.reqForm.status = 1;
              _self.reqForm.detail = _self.currentProblem.detail;
              _self.reqForm.priority = _self.currentProblem.priority;
              _self.reqForm.moduleId = _self.currentProblem.moduleId;
              _self.reqForm.expectDate = dateFormat(new Date(_self.currentProblem.expectResolveTime), _self.datefmt);
              _self.reqForm.summary = "线上问题【" + _self.currentProblem.summary + "】所转报需求";
              _self.reqCreate(_self.currentProblem.id, _self.problemQuery);
            } else if (_self.currentProblem.resolveMethod == 1 && commonQuery.isNull(_self.currentProblem.transId)) {
              _self.reqForm.type = 3;
              _self.reqForm.status = 1;
              _self.reqForm.detail = _self.currentProblem.detail;
              _self.reqForm.priority = _self.currentProblem.priority;
              _self.reqForm.moduleId = _self.currentProblem.moduleId;
              _self.reqForm.expectDate = dateFormat(new Date(_self.currentProblem.expectResolveTime), _self.datefmt);
              _self.reqForm.summary = "线上问题【" + _self.currentProblem.summary + "】所转报需求";
              _self.reqCreate(_self.currentProblem.id, _self.problemQuery);
            } else {
              _self.problemQuery();
            }
          } else {
            _self.$message.info("线上问题信息修改失败！");
            console.log(res);
          }
        })
    },

    saveProblemCreate() {
      let _self = this;
      let files = [];
      _self.pbform.fileList.forEach(item => {
        files.push(item.id);
      });
      _self.attachIds = files.toString();
      _self.$axios.post("/problem/create", {
          responser: _self.pbform.responser,
          priority: _self.pbform.priority,
          influence: _self.pbform.influence,
          status: 1,
          moduleId: _self.pbform.moduleId,
          typeFirst: _self.pbform.typeFirst,
          expectResolveTime: _self.pbform.expectResolveTime,
          typeSecond: _self.pbform.typeSecond.selected,
          resolveMethod: _self.pbform.resolveMethod,
          summary: _self.pbform.summary,
          attachment: files.toString(),
          submitTime: dateFormat(new Date(), defaultTimeFormat),
          submitter: sessionStorage.userId,
          detail: _self.pbform.detail
        })
        .then(function (res) {
          let proId = res.data;
          if (proId && proId > 0) {
            _self.showDialog = false;
            _self.$message.success("上报线上问题提交保存成功！");
            _self.pbform.id = res.data;
            _self.pbform.attachment = files.toString();
            if (_self.pbform.resolveMethod == 2 && commonQuery.isNull(_self.pbform.transId)) {
              _self.reqForm.type = 1;
              _self.reqForm.status = 1;
              _self.reqForm.detail = _self.pbform.detail;
              _self.reqForm.priority = _self.pbform.priority;
              _self.reqForm.moduleId = _self.pbform.moduleId;
              _self.reqForm.expectDate = dateFormat(new Date(_self.pbform.expectResolveTime), _self.datefmt);
              _self.reqForm.summary = "线上问题【" + _self.pbform.summary + "】所转报需求";
              _self.reqCreate(proId, _self.problemQuery);
            } else if (_self.pbform.resolveMethod == 1 && commonQuery.isNull(_self.pbform.transId)) {
              _self.reqForm.type = 3;
              _self.reqForm.status = 1;
              _self.reqForm.detail = _self.pbform.detail;
              _self.reqForm.priority = _self.pbform.priority;
              _self.reqForm.moduleId = _self.pbform.moduleId;
              _self.reqForm.expectDate = dateFormat(new Date(_self.pbform.expectResolveTime), _self.datefmt);
              _self.reqForm.summary = "线上问题【" + _self.pbform.summary + "】所转报需求";
              _self.reqCreate(proId, _self.problemQuery);
            } else {
              _self.problemQuery();
            }
          } else {
            _self.$message.info("上报线上问题提交保存失败！");
            console.log(res);
          }
        })
    },

    memberQuery(callback) {
      let _self = this;
      _self.queryLoading = true;
      commonQuery.memberQuery((result) => {
        _self.members = result.users;
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        _self.userOptions1 = result.usersFull;
        _self.userOptions2 = result.usersFull;
        _self.userOptions3 = result.usersFull;
        if (typeof callback == "function") {
          callback();
        }
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
            isValid: "Y"
          }
        })
        .then(function (res) {
          var json = eval(res.data.list);
          for (var i = 0; i < json.length; i++) {
            _self.modules.push({
              label: json[i].moduleName,
              value: json[i].moduleId
            });
          }
        })
    },
  }
};
</script>

<style>
.pro-form {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.pro-form .el-form-item .el-input {
  width: 160px;
}

.new-pform .el-form-item .el-input {
  width: 180px;
}

.pro-form .el-form-item .el-date-editor--daterange {
  width: 424px;
}

.pro-form .el-table i {
  font-size: 14px;
  cursor: pointer;
  color: #3AB4D7;
}

.pro-form .el-table .cell {
  padding-right: 0px;
}

.problem-tips .el-dialog__header {
  padding: 0;
}

.pro-attach-upload {
  width: 776px;
}

.pro-attach-upload .el-upload--text {
  width: 100%;
  height: 80px;
}

.pro-attach-upload .el-upload-dragger {
  width: 100%;
  height: 80px;
}

.pro-attach-upload .el-upload-dragger .el-icon-upload {
  margin: 0;
  font-size: 40px;
}

.pro-summary,
.pro-summary input {
  width: 479px !important;
}

.problem-status-tip {
  margin-top: 10px;
  color: #61c3df;
}

.pro-table-expand {
  font-size: 0;
}

.pro-table-expand label {
  width: 110px;
  color: #31394a;
}

.pro-table-expand .el-form-item {
  margin-right: 10px;
  margin-bottom: 5px;
}

.pro-table-expand .content-tips {
  -webkit-appearance: none;
  color: #3AB4D7;
  background-color: #F5F7FA;
  height: 28px;
  line-height: 28px;
  width: 180px;
  padding: 0 15px;
  border: none;
  border-bottom: 1px solid #DCDFE6;
  border-radius: 2px;
  background-image: none;
  box-sizing: border-box;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  font-size: 12px;
}

.pro-table-expand .content-tips:hover {
  color: #61c3df;
}

.pro-table-expand .el-input,
.pro-table-expand .el-select {
  width: 180px !important;
}

.pro-table-expand .el-select .el-input__suffix {
  display: none !important;
}

.pro-table-expand .el-input input,
.pro-table-expand .el-select input {
  color: #4d535f !important;
  cursor: default !important;
}
</style>
