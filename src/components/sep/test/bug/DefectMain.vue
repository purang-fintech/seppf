<template>
  <div id="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-bug"></i> 测试管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>缺陷管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showDefectTips" width="860px">
      <el-table :data="defectTips" size="mini" stripe max-height="500" :border="showBorder">
        <el-table-column property="statusName" label="旧状态" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column property="newStatusName" label="新状态" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column property="statusTips" label="说明" header-align="center">
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-checkbox size="mini" v-model="hideDefectTips" style='margin-top:-15px;float:right'>不再提示</el-checkbox>
      </div>
    </el-dialog>

    <el-dialog title="缺陷拒绝说明" :close-on-click-modal="modalClose" :visible.sync="showBugRefuse" width="800px" :before-close="cancelRefuse">
      <el-form
        :model="refuseForm"
        size="small"
        :inline="false"
        label-width="120px"
        ref="refuseFormRef"
        :rules="refuseFormRules">
        <el-form-item label="拒绝原因" prop="refuseReason" required>
          <el-select v-model="refuseForm.refuseReason" placeholder="请选择" style="width:33%" @change="querySameCodeDefect()">
            <el-option v-for="opt in refuseReasons" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="重复缺陷号" prop="sameCodeDefect" v-if="refuseForm.refuseReason==1" required>
          <el-select v-model="refuseForm.sameCodeDefect" placeholder="请选择缺陷：只能选择到相同版本、需求号下的缺陷" style="width:95%">
            <el-option v-for="opt in sameCodeDefects" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="同源缺陷号" prop="sameCodeDefect" v-if="refuseForm.refuseReason==2" required>
          <el-select v-model="refuseForm.sameCodeDefect" placeholder="请选择缺陷：只能选择到相同版本、需求号下的缺陷" style="width:95%">
            <el-option v-for="opt in sameCodeDefects" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="拒绝说明" prop="refuseDetail" required>
          <el-input
            v-model="refuseForm.refuseDetail"
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

    <el-dialog title="选择修复负责人" :close-on-click-modal="modalClose" :visible.sync="showAssigin" width="600px">
      <el-select
        v-model="dfform.responser"
        placeholder="请选择"
        filterable
        :filter-method="filterUsers2"
        @visible-change="resetFilterText"
        style="margin-left:40px;width:85%">
        <el-option-group v-for="group in userOptions2" :key="group.label" :label="group.label">
          <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
            <span style="float:left">{{ item.name }}</span>
            <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
          </el-option>
        </el-option-group>
      </el-select>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="showAssigin=false">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="showDescription=true" size="small">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="缺陷处理说明" :visible.sync="showDescription" width="1024px" :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">缺陷处理说明</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <simple-mde v-model="description" :configs="configs" class="defect-desc" ref="simpleMdeDesc"></simple-mde>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDescription=false" size="small">取消</el-button>
        <el-button
          v-no-more-click
          type="primary"
          v-if="quickOperation"
          icon="el-icon-circle-check"
          @click="updateDefectStatus()"
          size="small">保存</el-button>
        <el-button
          v-no-more-click
          type="primary"
          v-else
          icon="el-icon-circle-check"
          @click="updateDefect()"
          size="small">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="modalClose"
      title="提交新缺陷"
      :visible.sync="showDialog"
      width="1130px"
      class="new-defect"
      :fullscreen="maximize1">
      <div slot="title">
        <span style="font-size:18px">提交新缺陷</span>
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
        :model="dfform"
        :rules="dFormRules"
        ref="ruledForm"
        size="mini"
        :inline="true"
        label-width="110px">
        <el-form-item label="提交人" required>
          <el-select v-model="dfform.submitter" placeholder="请选择" disabled>
            <el-option v-for="opt in users" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发现版本" prop="relId" required>
          <el-select v-model="dfform.relId" placeholder="请选择" @change="relReqQuery(dfform.relId)">
            <el-option v-for="opt in openReleases" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属产品需求" prop="reqId" required>
          <el-select v-model="dfform.reqId" class="defect-summary" @change="setDefaultModule()" placeholder="请选择">
            <el-option v-for="opt in reqs" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority" required>
          <el-select v-model="dfform.priority" placeholder="请选择">
            <el-option v-for="opt in defectPriorities" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="严重程度" prop="influence" required>
          <el-select v-model="dfform.influence" placeholder="请选择">
            <el-option v-for="opt in defectInfluences" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缺陷摘要" prop="summary" required>
          <el-input v-model="dfform.summary" placeholder="不超过50个字" class="defect-summary" clearable>需求摘要</el-input>
        </el-form-item>
        <el-form-item label="缺陷协调人" prop="conciliator" required>
          <el-select v-model="dfform.conciliator" placeholder="请选择">
            <el-option-group v-for="group in testManagers" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="修复责任人" prop="responser">
          <el-select
            v-model="dfform.responser"
            placeholder="请选择"
            :disabled="!roleAllow(isManager)"
            filterable
            :filter-method="filterUsers1"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions1" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="缺陷类型" prop="defectType" required>
          <el-select v-model="dfform.defectType" placeholder="请选择">
            <el-option v-for="opt in defectTypes" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发现阶段" prop="foundPeriod" required>
          <el-select v-model="dfform.foundPeriod" placeholder="请选择">
            <el-option v-for="opt in foundPeriods" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="植入阶段" prop="defectPeriod">
          <el-select v-model="dfform.defectPeriod" placeholder="请选择">
            <el-option v-for="opt in defectPeriods" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发现手段" prop="foundMeans">
          <el-select v-model="dfform.foundMeans" placeholder="请选择">
            <el-option v-for="opt in foundMeans" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="应用模块" prop="prodModule" required>
          <el-select v-model="dfform.prodModule" placeholder="请选择">
            <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item label="详细描述" prop="detail">
          <simple-mde v-model="dfform.detail" :configs="configs" class="defect-desc" ref="simpleMdeNew"></simple-mde>
        </el-form-item>
      </el-form>
      <div slot="footer" style="padding:0 35px 10px 0">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="resetForm('ruledForm')" size="small">重置</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="saveSubmitDefect('ruledForm')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="modalClose"
      title="缺陷处理与修改"
      :visible.sync="showDialogMod"
      width="1130px"
      class="new-defect"
      :fullscreen="maximize2"
      @closed="dialogClosed">
      <div slot="title">
        <span style="font-size:18px">缺陷明细修改</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize2=!maximize2">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize2==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize2==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form
        :model="dfform"
        size="mini"
        :rules="dFormRules"
        ref="ruledFormMod"
        :inline="true"
        label-width="110px">
        <el-form-item label="提交人" required>
          <el-select v-model="dfform.submitter" disabled>
            <el-option v-for="opt in users" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发现版本" prop="relId" required>
          <el-select v-model="dfform.relId" placeholder="请选择" @change="relReqQuery(dfform.relId)" :disabled="currentRow.disabled">
            <el-option v-for="opt in openReleases" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属产品需求" prop="reqId" required>
          <el-select v-model="dfform.reqId" class="defect-summary" @change="setDefaultModule()" placeholder="请选择" :disabled="currentRow.disabled">
            <el-option v-for="opt in reqs" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority" required>
          <el-select v-model="dfform.priority" placeholder="请选择" :disabled="currentRow.disabled">
            <el-option v-for="opt in defectPriorities" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="严重程度" prop="influence" required>
          <el-select v-model="dfform.influence" placeholder="请选择" :disabled="currentRow.disabled">
            <el-option v-for="opt in defectInfluences" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缺陷摘要" prop="summary" required>
          <el-input v-model="dfform.summary" placeholder="不超过25个字" class="defect-summary" :disabled="currentRow.disabled">需求摘要</el-input>
        </el-form-item>
        <el-form-item label="缺陷状态" prop="status" required>
          <el-select v-model="dfform.status" placeholder="请选择" :disabled="currentRow.disabled">
            <el-option v-for="opt in defectStatuses" :value="opt.value" :key="opt.value" :disabled="opt.disabled" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缺陷类型" prop="defectType" required>
          <el-select v-model="dfform.defectType" placeholder="请选择" :disabled="currentRow.disabled">
            <el-option v-for="opt in defectTypes" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发现阶段" prop="foundPeriod" required>
          <el-select v-model="dfform.foundPeriod" placeholder="请选择" :disabled="currentRow.disabled">
            <el-option v-for="opt in foundPeriods" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="植入阶段" prop="defectPeriod">
          <el-select v-model="dfform.defectPeriod" placeholder="请选择" :disabled="currentRow.disabled">
            <el-option v-for="opt in defectPeriods" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缺陷协调人" prop="conciliator" required>
          <el-select v-model="dfform.conciliator" placeholder="请选择" :disabled="currentRow.disabled">
            <el-option-group v-for="group in testManagers" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="修复责任人" prop="responser">
          <el-select
            v-model="dfform.responser"
            placeholder="请选择"
            :disabled="currentRow.disabled || !roleAllow(isManager)"
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
        <el-form-item label="发现手段" prop="foundMeans">
          <el-select v-model="dfform.foundMeans" placeholder="请选择" :disabled="currentRow.disabled">
            <el-option v-for="opt in foundMeans" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="应用模块" prop="prodModule" required>
          <el-select v-model="dfform.prodModule" placeholder="请选择" :disabled="currentRow.disabled">
            <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item prop="detail">
          <template slot="label">
            <el-tooltip content="编辑时此处仅供展示，编辑请点【添加操作说明和附件】" placement="right" effect="dark">
              <span>详细描述</span>
            </el-tooltip>
          </template>
          <simple-mde v-model="dfform.detail" :configs="configsMod" class="defect-desc" ref='simpleMdeMod'></simple-mde>
        </el-form-item>
      </el-form>
      <div slot="footer" style="padding:0 35px 10px 0">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialogMod=false" size="small">取消</el-button>
        <el-button
          v-no-more-click
          type="primary"
          icon="el-icon-circle-check"
          @click="saveUpdateDefect('ruledFormMod')"
          size="small"
          v-if="!currentRow.disabled">添加操作说明和附件
        </el-button>
      </div>
    </el-dialog>

    <div class="dform-box">
      <el-form
        ref="dform"
        :model="dform"
        :inline="true"
        size="mini"
        label-width="100px"
        @keydown.native.enter="queryDefect()">
        <el-form-item label="严重程度">
          <el-select v-model="dform.influence" placeholder="请选择" clearable>
            <el-option v-for="opt in defectInfluences" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="dform.priority" placeholder="请选择" clearable>
            <el-option v-for="opt in defectPriorities" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发现阶段">
          <el-select v-model="dform.foundPeriod" placeholder="请选择" clearable>
            <el-option v-for="opt in foundPeriods" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="植入阶段">
          <el-select v-model="dform.defectPeriod" placeholder="请选择" clearable>
            <el-option v-for="opt in defectPeriods" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缺陷类型">
          <el-select v-model="dform.defectType" placeholder="请选择" clearable>
            <el-option v-for="opt in defectTypes" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发现版本">
          <el-select v-model="dform.release" placeholder="请选择" clearable>
            <el-option v-for="opt in releases" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属模块">
          <el-select v-model="dform.prodModule" placeholder="请选择" clearable>
            <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提交人">
          <el-select
            v-model="dform.submitter"
            placeholder="请选择"
            clearable
            filterable
            :filter-method="filterUsers3"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions3" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="修复责任人">
          <el-select
            v-model="dform.responser"
            placeholder="请选择"
            clearable
            filterable
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
        <el-form-item label="缺陷状态">
          <el-select v-model="dform.status" placeholder="请选择" multiple collapse-tags clearable>
            <el-option v-for="opt in defectStatuses" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缺陷编号">
          <el-input v-model="dform.id" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="产品需求号">
          <el-input v-model="dform.reqId" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="发现时间">
          <el-date-picker
            v-model="dform.foundTime"
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
          <el-button v-no-more-click type="text" @click="$router.push('/refused')">被拒绝缺陷</el-button>
          <el-button v-no-more-click type="text" @click="showDefectTips=true">缺陷流转说明</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-circle-plus-outline" @click="showDialog=true">提交缺陷</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="queryDefect()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="dataRevert"
        :max-height="baseHeight"
        size="mini"
        stripe
        :border="showBorder"
        ref="defectTable"
        :expand-row-keys="expandedBugs"
        row-key="id"
        @row-dblclick="showDetail"
        @expand-change="manualExpand"
        v-loading="queryLoading"
        element-loading-text="查询中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column prop="id" label="缺陷编号" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column
          prop="relCode"
          label="发现版本"
          width="120"
          align="center"
          sortable
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="statusName" label="缺陷状态" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="submitterName" label="提交人" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="conciliatorName" label="缺陷协调人" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="responserName" label="修复责任人" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="productorName" label="产品经理" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="defectPeriodName" label="植入阶段" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="influenceName" label="严重程度" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="summary" label="缺陷摘要" header-align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="summary-tips" @click="showDetail(scope.row)">{{scope.row.summary}}</span>
          </template>
        </el-table-column>
        <el-table-column type="expand" label="详情">
          <template slot-scope="scope">
            <el-form label-position="right" inline class="defect-table-expand" size="mini">
              <el-form-item label="优先级">
                <el-input v-model="scope.row.priorityName" disabled></el-input>
              </el-form-item>
              <el-form-item label="所属模块">
                <el-input v-model="scope.row.prodModuleName" disabled></el-input>
              </el-form-item>
              <el-form-item label="缺陷类型">
                <el-input v-model="scope.row.defectTypeName" disabled></el-input>
              </el-form-item>
              <el-form-item label="发现手段">
                <el-input v-model="scope.row.foundMeansName" disabled></el-input>
              </el-form-item>
              <el-form-item label="发现阶段">
                <el-input v-model="scope.row.foundPeriodName" disabled></el-input>
              </el-form-item>
              <el-form-item label="发现时间">
                <el-input v-model="scope.row.foundTime" disabled></el-input>
              </el-form-item>
              <el-form-item label="最近响应时间">
                <el-input v-model="scope.row.responseTime" disabled></el-input>
              </el-form-item>
              <el-form-item label="最近修复时间">
                <el-input v-model="scope.row.fixedTime" disabled></el-input>
              </el-form-item>
              <el-form-item label="最近部署时间">
                <el-input v-model="scope.row.deployedTime" disabled></el-input>
              </el-form-item>
              <el-form-item label="最近关闭时间">
                <el-input v-model="scope.row.closedTime" disabled></el-input>
              </el-form-item>
              <el-form-item label="已耗时">
                <el-input v-model="scope.row.timeCost" disabled></el-input>
              </el-form-item>
              <br>
              <el-form-item label="拒绝原因">
                <el-select v-model="scope.row.refuseReason" placeholder="未被拒绝" disabled>
                  <el-option v-for="opt in refuseReasons" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="拒绝描述">
                <div class="content-tips">
                  <el-popover :disabled="!scope.row.refuseDetail" placement="right-end" width="600" trigger="click">
                    <el-input type="textarea" v-model="scope.row.refuseDetail" :rows="10" disabled resize="none"></el-input>
                    <span slot="reference">{{getDisplayedRefuseReason(scope.row.refuseReason)}}</span>
                  </el-popover>
                </div>
              </el-form-item>
              <el-form-item label="重复/同源缺陷号">
                <el-input v-model="scope.row.sameCodeDefect" disabled></el-input>
              </el-form-item>
              <br>
              <el-form-item v-if="scope.row.imgList.length > 0">
                <template slot="label">
                  <p>共有{{scope.row.imgList.length}}张图片</p>
                  <p>可点击依次预览</p>
                </template>
                <el-image :src="bugIconSrc" :preview-src-list="scope.row.imgList">
                </el-image>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="65" align="center">
          <template slot-scope="scope">
            <el-dropdown trigger="click" @command="handleCommand">
              <el-button type="text" size="small" @click="setCurrentRow(scope.row)">处理</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="edit" v-if="checkEdit(scope.row)"><i class="el-icon-edit-outline"></i>信息编辑</el-dropdown-item>
                <el-dropdown-item command="toAssigned" v-if="scope.row.showAssign">
                  <i class="el-icon-user"></i>分配修复人</el-dropdown-item>
                <el-dropdown-item command="toFixed" v-if="scope.row.showFix" style="color:#6BBD6B">
                  <i class="el-icon-document-checked"></i>置为修复</el-dropdown-item>
                <el-dropdown-item command="toRefused" v-if="scope.row.showRefuse" style="color:#EE6F6F">
                  <i class="el-icon-document-delete"></i>置为拒绝</el-dropdown-item>
                <el-dropdown-item command="toClosed" v-if="scope.row.showClose">
                  <i class="el-icon-circle-close"></i>置为关闭</el-dropdown-item>
                <el-dropdown-item command="toOpen" v-if="scope.row.showOpen">
                  <i class="el-icon-refresh"></i>复现/未修复</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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
          @click="exportCSV('缺陷清单数据', 'defectTable')">
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
  pickOptions
} from "@/util/date.js";
import simpleMde from "vue-simplemde/src/markdown-editor";
import TableExport from '@/util/TableExport.js'

export default {
  data: function () {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      showDefectTips: !localStorage.hideDefectTips || localStorage.hideDefectTips == 'false',
      hideDefectTips: localStorage.hideDefectTips && localStorage.hideDefectTips == 'true',
      bugIconSrc: "static/img/bug.jpg",
      tableData: [],
      pageInfo: {},
      maximize: false,
      maximize1: false,
      maximize2: false,
      queryLoading: false,
      users: [],
      isManager: [3, 4, 10],
      expandedBugs: [],
      testManagers: [],
      memberFull: [],
      userOptions: [],
      userOptions1: [],
      userOptions2: [],
      userOptions3: [],
      baseHeight: "",
      showDialog: false,
      showBugRefuse: false,
      currentRow: {},
      showDialogMod: false,
      datefmt: defaultDateFormat,
      timefmt: defaultTimeFormat,
      pickOptions: pickOptions,
      openReleases: [],
      releases: [],
      modules: [],
      defectTips: [],
      defectTypes: [],
      defectPriorities: [],
      defectInfluences: [],
      foundPeriods: [],
      defectPeriods: [],
      defectStatuses: [],
      foundMeans: [],
      reqs: [],
      dform: {
        id: "",
        reqId: "",
        foundTime: [],
        release: "",
        prodModule: "",
        defectType: "",
        submitter: "",
        conciliator: "",
        responser: "",
        priority: "",
        influence: "",
        foundPeriod: "",
        defectPeriod: "",
        status: []
      },
      quickOperation: false,
      targetStatus: "",
      showAssigin: false,
      currentPage: 1,
      sameCodeDefects: [],
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      dfform: {
        id: "",
        foundPeriod: "",
        relId: "",
        reqId: "",
        priority: 2,
        status: "",
        defectType: 1,
        defectPeriod: 3,
        foundMeans: 1,
        influence: 3,
        submitter: parseInt(sessionStorage.userId),
        responser: "",
        conciliator: "",
        prodModule: "",
        foundTime: "",
        responseTime: "",
        fixedTime: "",
        deployedTime: "",
        closedTime: "",
        responseCost: "",
        fixCost: "",
        deployCost: "",
        verifyCost: "",
        detail: "",
        summary: ""
      },
      refuseForm: {
        refuseReason: "",
        refuseDetail: "",
        sameCodeDefect: ""
      },
      refuseFormRules: {
        'refuseReason': [{
          required: true,
          message: '请选择拒绝原因',
          trigger: 'change'
        }],
        'sameCodeDefect': [{
          required: true,
          message: '请选择目标合并缺陷',
          trigger: 'change'
        }],
        'refuseDetail': [{
            required: true,
            message: '请输入拒绝理由描述',
            trigger: 'blur'
          },
          {
            min: 5,
            max: 500,
            message: '长度在 5 到 500 个字',
            trigger: 'blur'
          }
        ]
      },
      refuseReasons: [],
      dFormRules: {
        'relId': [{
          required: true,
          message: '请选择所属版本',
          trigger: 'change'
        }],
        'reqId': [{
          required: true,
          message: '请选择所属需求',
          trigger: 'change'
        }],
        'priority': [{
          required: true,
          message: '请选择优先级',
          trigger: 'change'
        }],
        'conciliator': [{
          required: true,
          message: '请选择缺陷协调人',
          trigger: 'change'
        }],
        'influence': [{
          required: true,
          message: '请选择严重程度',
          trigger: 'change'
        }],
        'defectType': [{
          required: true,
          message: '请选择缺陷类型',
          trigger: 'change'
        }],
        'foundPeriod': [{
          required: true,
          message: '请选择发现阶段',
          trigger: 'change'
        }],
        'status': [{
          required: true,
          message: '请选择缺陷状态',
          trigger: 'change'
        }],
        summary: [{
            required: true,
            message: '请输入缺陷摘要',
            trigger: 'blur'
          },
          {
            min: 10,
            max: 50,
            message: '长度在 10 到 50 个字',
            trigger: 'blur'
          }
        ]
      },
      configs: {
        status: false, // 禁用底部状态栏
        autofocus: false, //务必禁用，因为自动聚焦markdown-editor.vue会自动toggleFullScreen，而此时很可能vde组件尚未加载
        spellChecker: false, // 禁用拼写检查,
        showIcons: [
          "code",
          "table",
          "strikethrough"
        ],
        hideIcons: ["fullscreen", "side-by-side"],
        placeholder: "此处可通过粘贴板或者拖拽进行快捷图片上传，仅限图片",
        renderingConfig: {
          codeSyntaxHighlighting: true,
          highlightingTheme: "atom-one-light"
        },
      },
      configsMod: {
        status: false, // 禁用底部状态栏
        autofocus: true,
        toolbar: false,
        spellChecker: false, // 禁用拼写检查,
        placeholder: "此处可通过粘贴板或者拖拽进行快捷图片上传，仅限图片",
        renderingConfig: {
          codeSyntaxHighlighting: true,
          highlightingTheme: "atom-one-light"
        },
      },
      previewed: false,
      updated: false,
      showDescription: false,
      description: ""
    };
  },

  watch: {
    showDialog: function () {
      if (this.showDialog) {
        this.dfform.summary = "";
        this.dfform.relId = "";
        this.dfform.reqId = "";
        this.dfform.status = "";
        this.dfform.priority = 2;
        this.dfform.influence = 3;
        this.dfform.foundPeriod = this.roleAllow([1, 16]) ? 5 : 4;
        this.dfform.defectPeriod = 3;
        this.dfform.responser = "";
        this.dfform.conciliator = commonQuery.roleAllow([4]) ? parseInt(sessionStorage.userId) : "";
        this.dfform.defectType = 1;
        this.dfform.submitter = parseInt(sessionStorage.userId);
        this.dfform.foundTime = dateFormat(new Date(), this.timefmt);
        this.dfform.foundMeans = 1;
        this.dfform.prodModule = "";
        this.dfform.detail = "";
        this.openRelQuery();

        this.mdeIMGHandler('simpleMdeNew');
      } else { // 移除非当前markdown编辑器中的监听
        if (this.$refs["simpleMdeNew"]) {
          [this.$refs["simpleMdeNew"]].map(({
            simplemde
          }) => {
            if (simplemde.codemirror) {
              simplemde.codemirror.on("drop", false);
              simplemde.codemirror.on("paste", false);
            }
          });
        }
      }
    },

    hideDefectTips: function (val, old) {
      if (val != old) {
        localStorage.setItem("hideDefectTips", val);
      }
    },

    showDescription: function () {
      if (this.showDescription) {
        this.mdeIMGHandler('simpleMdeDesc');
        this.description = "";
      } else { // 移除非当前markdown编辑器中的监听
        if (this.$refs["simpleMdeDesc"]) {
          [this.$refs["simpleMdeDesc"]].map(({
            simplemde
          }) => {
            if (simplemde.codemirror) {
              simplemde.codemirror.on("drop", false);
              simplemde.codemirror.on("paste", false);
            }
          });
        }
      }
    },

    'dfform.status': function (val, old) {
      if (val == 6 && this.currentRow.status != 6) {
        this.showBugRefuse = true;
      }
      if (val != 6 && !(old == 6 && val == 0)) {
        this.refuseForm.refuseReason = "";
        this.refuseForm.refuseDetail = "";
        this.refuseForm.sameCodeDefect = "";
      }
    },

    'tableData.length': function (val) {
      if (val == 0) {
        this.currentPage = 1;
        this.queryDefect();
      }
    },

    dform: {
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
        this.queryDefect();
      }
    }
  },

  computed: {
    dataRevert() {
      let _self = this;
      _self.tableData.forEach(row => {
        let dateE = commonQuery.isNull(row.closedTime) ? new Date() : new Date(row.closedTime);
        let timeCost = _self.dateDiff(new Date(row.foundTime), dateE);
        let day = parseInt(timeCost / 24);
        let hour = parseInt(timeCost - day * 24);
        let min = parseInt((timeCost - day * 24 - hour) * 60);

        if (commonQuery.isNull(row.relId) || row.relId == 0) {
          _self.$set(row, "relCode", sessionStorage.productName);
        }

        _self.$set(row, "disabled", !_self.checkEdit(row));
        _self.$set(row, "timeCost", day + " 天" + hour + " 时" + min + " 分");
        _self.$set(row, "showAssign", _self.menuShown(row, 2));
        _self.$set(row, "showFix", _self.menuShown(row, 4));
        _self.$set(row, "showRefuse", _self.menuShown(row, 6));
        _self.$set(row, "showClose", _self.menuShown(row, 0));
        _self.$set(row, "showOpen", _self.menuShown(row, 1));
        let urlList = [];
        _self.parseText(row.detail).forEach(item => {
          _self.imgExists(item.url, (imgObject) => {
            if (imgObject.width > 0 && imgObject.height > 0) {
              urlList.push(item.url);
            }
          })
        });
        _self.$set(row, "imgList", urlList);
      });
      return _self.tableData;
    }
  },

  components: {
    simpleMde
  },

  created() {
    let _self = this;
    _self.baseHeight = bodyAviHeightNTab - 110 - 45;

    _self.releaseQuery();
    _self.moduleQuery();
    _self.testManagerQuery();

    let params = [];
    for (let p in _self.$route.params) {
      params.push(p);
    }

    _self.defectTips.splice(0, _self.defectTips.length);
    let defectStatus = localStorage.getItem("defectStatus");
    eval(defectStatus).forEach(item => {
      _self.defectTips.push({
        statusName: item.statusName,
        newStatusName: item.newStatusName,
        statusTips: item.statusTips
      });
    });

    let statusOpts = _self.sortData(eval(defectStatus), "statusId", "statusName", "children");
    _self.defectStatuses.splice(0, _self.defectStatuses.length);
    statusOpts.forEach(item => {
      let newStatuses = [];
      let current = item.children;
      current.forEach(d => {
        newStatuses.push(d.newStatusId);
      });
      _self.defectStatuses.push({
        value: item.statusId,
        label: item.statusName,
        newVal: newStatuses
      });
    });

    _self.defectInfluences.splice(0, _self.defectInfluences.length);
    let defectInfluence = localStorage.getItem("defectInfluence");
    eval(defectInfluence).forEach(item => {
      _self.defectInfluences.push({
        value: item.influenceId,
        label: item.influenceName
      });
    });

    _self.refuseReasons.splice(0, _self.refuseReasons.length);
    let defectRefuseReason = localStorage.getItem("defectRefuseReason");
    eval(defectRefuseReason).forEach(item => {
      _self.refuseReasons.push({
        value: item.reasonId,
        label: item.reasonName
      });
    });

    _self.defectPriorities.splice(0, _self.defectPriorities.length);
    let defectPriority = localStorage.getItem("defectPriority");
    eval(defectPriority).forEach(item => {
      _self.defectPriorities.push({
        value: item.priorityId,
        label: item.priorityName
      });
    });

    _self.foundMeans.splice(0, _self.foundMeans.length);
    let defectFoundMeans = localStorage.getItem("defectFoundMeans");
    eval(defectFoundMeans).forEach(item => {
      _self.foundMeans.push({
        value: item.meansId,
        label: item.meansName
      });
    });

    _self.foundPeriods.splice(0, _self.foundPeriods.length);
    let defectFoundPeriod = localStorage.getItem("defectFoundPeriod");
    eval(defectFoundPeriod).forEach(item => {
      _self.foundPeriods.push({
        value: item.periodId,
        label: item.periodName
      });
    });

    _self.defectPeriods.splice(0, _self.defectPeriods.length);
    let defectPeriod = localStorage.getItem("defectPeriod");
    eval(defectPeriod).forEach(item => {
      _self.defectPeriods.push({
        value: item.periodId,
        label: item.periodName
      });
    });

    _self.defectTypes.splice(0, _self.defectTypes.length);
    let defectType = localStorage.getItem("defectType");
    eval(defectType).forEach(item => {
      _self.defectTypes.push({
        value: item.typeId,
        label: item.typeName
      });
    });

    if (params.length > 0) {
      if (null != _self.$route.params.id && _self.$route.params.id != "") {
        _self.dform.id = _self.$route.params.id;
        _self.memberQuery(_self.queryDefect);
      } else if (null != _self.$route.params.relId && _self.$route.params.relId != "") {
        _self.dform.release = parseInt(_self.$route.params.relId);
        if (null != _self.$route.params.status && _self.$route.params.status != "") {
          let sts = _self.$route.params.status.split(",");
          _self.dform.status.splice(0, _self.dform.status.length);
          sts.forEach(d => {
            _self.dform.status.push(parseInt(d));
          });
        }
        _self.memberQuery(_self.queryDefect);
      }
    } else {
      _self.dform.id = "";
      if (_self.roleAllow([5])) {
        _self.dform.submitter = "";
        _self.dform.responser = parseInt(sessionStorage.userId);
      } else if (_self.roleAllow([6])) {
        _self.dform.submitter = parseInt(sessionStorage.userId);
        _self.dform.responser = "";
      } else {
        let date = new Date();
        let oldDay = new Date();
        let today = dateFormat(date, _self.datefmt);
        let now = dateFormat(date, _self.timefmt);
        oldDay.setTime(oldDay.getTime() - 3600 * 1000 * 24 * 180);
        let yesterday = dateFormat(oldDay, _self.datefmt);
        _self.dfform.foundTime = now;
        _self.dform.foundTime.push(yesterday);
        _self.dform.foundTime.push(today);
        _self.dform.submitter = "";
        _self.dform.responser = "";
      }
      //根据不同角色给予不同的默认缺陷状态查询条件
      if (_self.roleAllow([4, 6])) {
        _self.dform.status = [1, 2, 3, 4, 5, 6];
      } else if (_self.roleAllow([3, 5])) {
        _self.dform.status = [1, 2, 3, 4];
      } else {
        _self.dform.status = [1, 2, 3, 4, 5, 6];
      }
      _self.memberQuery(_self.queryDefect);
    }
  },

  methods: {
    roleAllow(roles) {
      return commonQuery.roleAllow(roles);
    },

    handleCommand(command) {
      let _self = this;
      if (command == "edit") {
        _self.quickOperation = false;
        _self.editDetail(_self.currentRow);
      } else if (command == "toAssigned") {
        _self.quickOperation = true;
        _self.targetStatus = 2;
        _self.dfform.status = _self.targetStatus;
        _self.showAssigin = true;
      } else if (command == "toFixed") {
        _self.quickOperation = true;
        _self.targetStatus = 4;
        _self.dfform.status = _self.targetStatus;
        _self.showDescription = true;
      } else if (command == "toRefused") {
        _self.quickOperation = true;
        _self.targetStatus = 6;
        _self.dfform.status = _self.targetStatus;
        _self.showBugRefuse = true;
        _self.refuseForm.refuseReason = "";
        _self.refuseForm.refuseDetail = "";
        _self.refuseForm.sameCodeDefect = "";
      } else if (command == "toClosed") {
        _self.quickOperation = true;
        _self.targetStatus = 0;
        _self.dfform.status = _self.targetStatus;
        _self.showDescription = true;
      } else if (command == "toOpen") {
        _self.quickOperation = true;
        _self.dfform.status = 1;
        _self.targetStatus = 1;
        _self.showDescription = true;
      }
    },

    updateDefectStatus() {
      let _self = this;
      _self.dfform.status = _self.targetStatus;
      let newDetail = _self.description;
      if (!_self.loadFixRules()) {
        return;
      }
      if (commonQuery.isNull(_self.description)) {
        _self.$message.warning("请输入修改操作说明！");
        return;
      }
      let descArray = _self.description.split(/\n/g);
      let descResult = "";
      const pattern = /!\[(.*?)\]\((.*?)\)/gm;

      for (let i = 0; i < descArray.length; i++) {
        if (commonQuery.isNull(descArray[i])) {
          continue;
        }
        descResult += ((pattern.exec(descArray[i])) == null ? "\t\t" : "") + descArray[i] + ((i == descArray.length - 1) ? "" : "\n");
      }
      newDetail = "### " + dateFormat(new Date(), _self.timefmt) + "，由 " + sessionStorage.userName + " 操作：\n" +
        descResult + "\n" + (commonQuery.isNull(_self.currentRow.detail) ? "" : _self.currentRow.detail);

      _self.quickOperation = false;
      let toStatus = _self.targetStatus;
      if (_self.targetStatus == 1) {
        toStatus = commonQuery.isNull(_self.currentRow.responser) ? 1 : 2;
      }
      _self.$axios.post("/defect/status_update", {
          status: toStatus,
          id: _self.dfform.id,
          detail: newDetail,
          responseTime: _self.dfform.responseTime,
          fixedTime: _self.dfform.fixedTime,
          deployedTime: _self.dfform.deployedTime,
          closedTime: _self.dfform.closedTime,
          responseCost: _self.dfform.responseCost,
          fixCost: _self.dfform.fixCost,
          deployCost: _self.dfform.deployCost,
          verifyCost: _self.dfform.verifyCost,
          responser: commonQuery.isNull(_self.dfform.responser) ? _self.dfform.submitter : _self.dfform.responser,
          refuseReason: _self.refuseForm.refuseReason,
          refuseDetail: _self.refuseForm.refuseDetail,
          sameCodeDefect: _self.refuseForm.sameCodeDefect
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("缺陷状态修改成功！");
            _self.showDescription = false;
            _self.showBugRefuse = false;
            _self.showAssigin = false;
          } else {
            _self.$message.warning("缺陷状态修改失败，请检查服务！");
          }
          _self.queryDefect();
        })
    },

    menuShown(row, newStatus) {
      let _self = this;
      let originalStatus = row.status;
      if (newStatus == originalStatus && newStatus != 2) {
        return false;
      }
      if (newStatus == 2) {
        if (originalStatus == 0 || originalStatus > 2) {
          return false;
        } else {
          if (originalStatus == 2 && row.responser != sessionStorage.userId && row.conciliator != sessionStorage.userId) {
            return false;
          } else if (originalStatus == 1 && row.conciliator != sessionStorage.userId) {
            return false;
          }
        }
      }
      if (newStatus == 4 && row.responser != sessionStorage.userId) {
        return false;
      }
      if (newStatus == 6 && row.conciliator != sessionStorage.userId && row.responser != sessionStorage.userId) {
        return false;
      }
      return _self.statusFlowCheck(originalStatus, newStatus) && _self.checkEdit(row);
    },

    statusFlowCheck(originalStatus, targetStatus) {
      if (originalStatus == targetStatus) {
        return true;
      }
      let _self = this;
      //校验每个状态可以流转到的下一状态
      for (let i = 0; i < _self.defectStatuses.length; i++) {
        let state = _self.defectStatuses[i];
        if (originalStatus == state.value && state.newVal.indexOf(targetStatus) > -1) {
          return true;
        }
      }
      return false;
    },

    setCurrentRow(data) {
      let _self = this;
      _self.relReqQuery(data.relId);
      _self.openRelQuery();

      _self.currentRow = JSON.parse(JSON.stringify(data));
      _self.dfform = JSON.parse(JSON.stringify(data));

      _self.refuseForm.refuseReason = data.refuseReason;
      _self.refuseForm.refuseDetail = data.refuseDetail;
      _self.refuseForm.sameCodeDefect = data.sameCodeDefect;
    },

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

    memberQuery(callback) {
      let _self = this;
      commonQuery.memberQuery((result) => {
        _self.users = result.users;
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

    testManagerQuery(callback) {
      let _self = this;
      commonQuery.roleMemberQuery(sessionStorage.productId, 4, (result) => {
        _self.testManagers = result.usersFull;
      });
    },

    getDisplayedRefuseReason(data) {
      if (commonQuery.isNull(data)) {
        return "";
      }
      return this.refuseReasons.find(d => {
        return d.value == data
      }).label;
    },

    manualExpand(row, expandedRows) {
      let _self = this;
      if (_self.expandedBugs.indexOf(row.id) >= 0) {
        _self.expandedBugs.shift()
      } else {
        _self.expandedBugs.shift();
        _self.expandedBugs.push(row.id);
      }
      if (expandedRows.length > 1) {
        expandedRows.shift()
      }
    },

    checkRefuse() {
      let _self = this;
      _self.$refs.refuseFormRef.validate((valid) => {
        if (!valid) {
          _self.$message.warning("表单校验不通过，无法提交！");
        } else {
          if (_self.quickOperation == false) {
            _self.showBugRefuse = false;
          } else {
            _self.showDescription = true;
          }
        }
      });
    },

    cancelRefuse(done) {
      let _self = this;
      _self.showBugRefuse = false;
      _self.refuseForm.refuseDetail = "";
      _self.refuseForm.refuseReason = "";
      _self.dfform.status = _self.currentRow.status;
      _self.$message.warning("取消拒绝操作，缺陷状态已还原！");
      if (typeof done == "function") {
        done();
      }
    },

    querySameCodeDefect() {
      let _self = this;
      _self.sameCodeDefects.splice(0, _self.sameCodeDefects.length);
      _self.dfform.relId = _self.currentRow.relId;
      _self.dfform.reqId = _self.currentRow.reqId;
      _self.dfform.id = _self.currentRow.id;
      if (_self.dfform.relId == 0 || _self.dfform.reqId == 0) {
        return;
      }
      _self.refuseForm.sameCodeDefect = "";
      if (_self.refuseForm.refuseReason > 2) {
        return;
      }
      _self.$axios({
          method: "post",
          url: "/defect/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.dfform.relId,
            reqId: _self.dfform.reqId,
            status: "1,2,3,4,5,6",
          }
        })
        .then(function (res) {
          let arr = eval(res.data.list);
          arr.forEach(element => {
            if (element.id == _self.dfform.id) {
              return;
            }
            _self.sameCodeDefects.push({
              value: element.id,
              label: "#" + element.id + " - " + element.summary
            });
          });
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    dialogClosed() {
      this.$set(this.currentRow, "disabled", !this.checkEdit(this.currentRow));
    },

    dateDiff(date1, date2) {
      return ((date2.getTime() - date1.getTime()) / 1000 / 3600);
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null);
      TableExport(this.tableData, columns, fileName)
    },

    setDefaultModule() {
      let _self = this;
      if (commonQuery.isNull(_self.dfform.reqId) || _self.dfform.reqId == 0) {
        if (_self.dfform.prodModule) {
          _self.dfform.prodModule = "";
        }
      } else {
        _self.dfform.prodModule = _self.reqs.find(d => {
          return d.value == _self.dfform.reqId;
        }).moduleId;
      }
    },

    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.$nextTick(_ => {
        setTimeout(() => {
          this.queryDefect();
        }, 200);
      });
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.$nextTick(_ => {
        setTimeout(() => {
          this.queryDefect();
        }, 200);
      });
    },

    checkEdit(data) {
      let crtUser = parseInt(sessionStorage.userId);
      if (data.responser == crtUser || data.submitter == crtUser || crtUser == data.conciliator) {
        return true;
      } else {
        return commonQuery.roleAllow(this.isManager);
      }
    },

    parseText(text) {
      if (!text) {
        return [];
      }
      const pattern = /!\[(.*?)\]\((.*?)\)/gm;
      let result = [];
      let matcher;
      let index = 0;

      while ((matcher = pattern.exec(text)) !== null) {
        let name = matcher[1];
        let url = matcher[2];

        if (commonQuery.isNull(url)) {
          continue;
        }

        if (!name) {
          index++;
          name = "缺陷附件图片 " + index;
        }

        result.push({
          name: name,
          url: url
        });

      }
      return result;
    },

    imgExists(imgurl, success, err) {
      let imgObj = new Image();
      imgObj.onload = function () {
        if (this.complete == true) {
          success && success(imgObj)
        }
      };
      imgObj.onerror = function () {
        err && err(imgObj)
      };
      imgObj.src = imgurl;
    },

    showDetail(data) {
      this.editDetail(data);
      this.currentRow.disabled = true;
      this.$nextTick(() => {
        [this.$refs.simpleMdeMod].map(({
          simplemde
        }) => {
          simplemde.codemirror.setOption("fullScreen", false);
          // 由于详情只读展示和编辑共用表单窗体，所以必须重新preview，防止markdown数据不刷新
          if (simplemde && this.previewed) {
            simplemde.togglePreview();
            this.previewed = false;
          }
          if (simplemde && !this.previewed) {
            simplemde.togglePreview();
            this.previewed = true;
          }
        });
      });
    },

    editDetail(data) {
      this.showDialogMod = true;
      this.currentRow = JSON.parse(JSON.stringify(data));
      this.openRelQuery();
      this.relReqQuery(data.relId);
      this.dfform = JSON.parse(JSON.stringify(data));

      this.refuseForm.refuseReason = data.refuseReason;
      this.refuseForm.refuseDetail = data.refuseDetail;
      this.refuseForm.sameCodeDefect = data.sameCodeDefect;
      this.$nextTick(() => {
        [this.$refs.simpleMdeMod].map(({
          simplemde
        }) => {
          // 由于详情只读展示和编辑共用表单窗体，所以必须重新preview，防止markdown数据不刷新
          if (simplemde && this.previewed) {
            simplemde.togglePreview();
            this.previewed = false;
          }
          if (simplemde && !this.previewed) {
            simplemde.togglePreview();
            this.previewed = true;
          }
        });
      });
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

    loadFixRules() {
      let _self = this;
      let checked = false;
      let now = dateFormat(new Date(), _self.timefmt);

      if (!_self.statusFlowCheck(_self.currentRow.status, _self.dfform.status)) {
        _self.$message.info("不允许的状态修改操作");
        return false;
      }

      //缺陷状态为已提交并且修复责任人已确定，记录缺陷状态为已分配
      if (null != _self.dfform.responser && _self.dfform.responser != '') {
        if (_self.dfform.status == 1) {
          _self.dfform.status = 2;
          _self.dfform.responseTime = now;
          _self.dfform.responseCost = 0;
        }
      }
      if (_self.dfform.status == 2 && (null == _self.dfform.responseTime || _self.dfform.responseTime == 0)) {
        _self.dfform.responseTime = now;
        _self.dfform.responseCost = 0;
      }

      //校验已分配是否指定了处理人
      if (commonQuery.isNull(_self.dfform.responser) && _self.dfform.status === 2) {
        _self.$message.info("分配缺陷请指定修复责任人");
        return false;
      }

      //记录修复时间
      if (_self.dfform.status == 4) {
        _self.dfform.fixedTime = now;
        _self.dfform.fixCost = _self.dateDiff(
          new Date(_self.dfform.responseTime ? _self.dfform.responseTime : _self.dfform.foundTime), new Date(now)
        );
      }

      //记录部署时间
      if (_self.dfform.status == 5) {
        _self.dfform.deployedTime = now;
        _self.dfform.deployCost = _self.dateDiff(
          new Date(_self.dfform.fixedTime),
          new Date(now)
        );
      }

      //记录关闭时间
      if (_self.dfform.status == 0) {
        _self.dfform.closedTime = now;
        // 验证时间计算起点：已拒绝为响应时间，已部署为部署时间
        if (_self.currentRow.status == 6) {
          _self.dfform.verifyCost = _self.dateDiff(new Date(_self.dfform.responseTime), new Date(now));
          if (commonQuery.isNull(_self.dfform.responser)) {
            _self.dfform.responser = _self.dfform.submitter;
          }
        } else if (_self.currentRow.status == 5) {
          _self.dfform.verifyCost = _self.dateDiff(new Date(_self.dfform.deployedTime), new Date(now));
        } else if (_self.currentRow.status == 4) {
          _self.dfform.verifyCost = _self.dateDiff(new Date(_self.dfform.fixedTime), new Date(now));
        }
      }

      //验证不通过的情况
      if ((_self.dfform.status == 2 || _self.dfform.status == 1) && _self.currentRow.status === 5) {
        _self.dfform.verifyCost = _self.dateDiff(new Date(_self.dfform.deployedTime), new Date(now));
      }

      //原状态为已提交，新状态为已分配或已拒绝，记录为响应时间
      if (_self.currentRow.status == 1) {
        if (_self.dfform.status == 2 || _self.dfform.status == 6) {
          _self.dfform.responseTime = now;
          //原响应时间为空，计算起点为发现时间，否则为原响应时间
          if (null === _self.dfform.responseCost || _self.dfform.responseCost === 0) {
            _self.dfform.responseCost = _self.dateDiff(new Date(_self.dfform.foundTime), new Date(now));
          } else if (commonQuery.isNull(_self.currentRow.status)) {
            //新建直接分配的缺陷，响应时间为当前，响应时长为0
            _self.dfform.responseTime = now;
            _self.dfform.responseCost = 0;
          } else {
            _self.dfform.responseCost = _self.dfform.responseCost + _self.dateDiff(new Date(_self.dfform.responseTime), new Date(now));
          }
        }
      }

      // 已分配-->已拒绝
      if (_self.currentRow.status == 2 && _self.dfform.status == 6) {
        _self.dfform.fixCost = 0;
      }

      // 已提交-->已拒绝
      if (_self.currentRow.status == 1 && _self.dfform.status == 6) {
        _self.dfform.responseTime = now;
        _self.dfform.responseCost = 0;
        _self.dfform.fixCost = 0;
        if (commonQuery.isNull(_self.dfform.responser)) {
          _self.dfform.responser = _self.dfform.submitter;
        }
      }

      //重新打开且直接分配，响应时长增加0，也就是同原有
      if (_self.currentRow.status == 0 && _self.dfform.status == 2) {
        _self.dfform.responseTime = now;
      }
      return true;
    },

    saveUpdateDefect(formName) {
      let _self = this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
        } else {
          _self.showDescription = true;
        }
      });
    },

    saveSubmitDefect(formName) {
      let _self = this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
        } else {
          _self.submitDefect();
        }
      });
    },

    updateDefect() {
      let _self = this;
      if (!_self.loadFixRules()) {
        return;
      }
      let newDetail = _self.description;
      if (_self.showDescription == true) {
        if (!_self.description || _self.description.length === 0) {
          _self.$message.warning("请输入修改说明！");
          return;
        }
        let descArray = _self.description.split(/\n/g);
        let descResult = "";
        const pattern = /!\[(.*?)\]\((.*?)\)/gm;

        for (let i = 0; i < descArray.length; i++) {
          if (commonQuery.isNull(descArray[i])) {
            continue;
          }
          descResult += ((pattern.exec(descArray[i])) == null ? "\t\t" : "") + descArray[i] + ((i == descArray.length - 1) ? "" : "\n");
        }
        newDetail = "### " + dateFormat(new Date(), _self.timefmt) + "，由 " + sessionStorage.userName + " 操作：\n" +
          descResult + "\n" + (commonQuery.isNull(_self.currentRow.detail) ? "" : _self.currentRow.detail);
      }
      _self.$axios.post("/defect/update", {
          id: _self.dfform.id,
          relId: _self.dfform.relId,
          reqId: _self.dfform.reqId,
          submitter: sessionStorage.userId,
          status: _self.dfform.status,
          priority: _self.dfform.priority,
          influence: _self.dfform.influence,
          responser: _self.dfform.responser,
          conciliator: _self.dfform.conciliator,
          defectType: _self.dfform.defectType,
          foundPeriod: _self.dfform.foundPeriod,
          defectPeriod: _self.dfform.defectPeriod,
          foundMeans: _self.dfform.foundMeans,
          prodModule: _self.dfform.prodModule,
          summary: _self.dfform.summary,
          foundTime: _self.dfform.foundTime,
          responseTime: _self.dfform.responseTime,
          fixedTime: _self.dfform.fixedTime,
          deployedTime: _self.dfform.deployedTime,
          closedTime: _self.dfform.closedTime,
          responseCost: _self.dfform.responseCost,
          fixCost: _self.dfform.fixCost,
          deployCost: _self.dfform.deployCost,
          verifyCost: _self.dfform.verifyCost,
          detail: newDetail,
          refuseReason: _self.refuseForm.refuseReason,
          refuseDetail: commonQuery.isNull(_self.refuseForm.refuseDetail) ? "" : _self.refuseForm.refuseDetail,
          sameCodeDefect: _self.refuseForm.sameCodeDefect
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("缺陷修改成功");
            _self.showDescription = false;
            _self.showDialogMod = false;
          } else {
            _self.$message.warning("缺陷修改失败，请检查服务");
          }
          _self.queryDefect();
        })
    },

    viewDefectAttach(file) {
      let _self = this;
      let img = new Image();
      img.src = file.url;
      if (img.complete) {
        if (img.fileSize === 0 || (img.width === 0 && img.height === 0)) {
          _self.$message.info("文件丢失，请联系运维管理！");
          _self.$set(file, "name", "文件丢失");

        } else {
          commonQuery.attachmentDownload(file);
        }
      } else { // 再尝试一次，设置超时时间0.5秒
        setTimeout(() => {
          let img1 = new Image();
          img1.src = file.url;
          if (img1.fileSize === 0 || (img1.width === 0 && img1.height === 0)) {
            _self.$message.info("文件丢失，请联系运维管理！");
            _self.$set(file, "name", "文件丢失");

          } else {
            commonQuery.attachmentDownload(file);
          }
        }, 200);
      }
    },

    releaseQuery() {
      let _self = this;
      _self.releases.splice(0, _self.releases.length);
      commonQuery.releaseQuery((result) => {
        _self.releases = result.releasesWithBranch;
      })
    },

    openRelQuery() {
      let _self = this;
      _self.openReleases.splice(0, _self.openReleases.length);
      commonQuery.openRelQuery((result) => {
        _self.openReleases = result.releasesWithBranch;
      })
    },

    relReqQuery(relId) {
      let _self = this;
      if (!relId) {
        return;
      }
      _self.$axios.post("/req/rel_query/" + relId + "/1/500")
        .then(function (res) {
          let req = (res.data.list);
          let currentRel = _self.releases.find(d => {
            return d.value == relId
          });
          _self.reqs.splice(0, _self.reqs.length);
          _self.reqs.push({
            label: "历史遗留问题，记入当前版本：" + currentRel.label,
            value: 0,
            moduleId: 0
          });
          for (var i = 0; i < req.length; i++) {
            _self.reqs.push({
              label: "#" + req[i].id + " - " + req[i].summary,
              value: req[i].id,
              moduleId: req[i].moduleId
            });
          }
        })
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
          let modules = eval(res.data.list);
          _self.modules.splice(0, _self.modules.length);
          for (var i = 0; i < modules.length; i++) {
            if (modules[i].moduleId != 0) {
              _self.modules.push({
                label: modules[i].moduleName,
                value: modules[i].moduleId
              });
            }
          }
          _self.modules.push({
            label: '未定义',
            value: 0
          });
        })
    },

    defectFuzzQuery() {
      let _self = this;
      _self.queryLoading = true;
      const searchText = sessionStorage.searchText;
      _self.$axios({
          method: "post",
          url: "/fuzz/defect_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            searchText: searchText,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function (res) {
          _self.tableData = eval(res.data.list);
          _self.pageInfo = res.data;
          setTimeout(() => {
            _self.queryLoading = false;
            sessionStorage.removeItem("searchText");
          }, 200);
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          _self.queryLoading = false;
          sessionStorage.removeItem("searchText");
          console.log(response);
        });
    },

    queryDefect() {
      let _self = this;
      _self.queryLoading = true;
      let foundTimeBegin = "",
        foundTimeEnd = "";
      if (_self.dform.foundTime && _self.dform.foundTime.length > 1) {
        foundTimeBegin = _self.dform.foundTime[0];
        foundTimeEnd = _self.dform.foundTime[1];
      }
      _self.$axios({
          method: "post",
          url: "/defect/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.dform.release,
            submitter: _self.dform.submitter,
            id: _self.dform.id,
            reqId: _self.dform.reqId,
            responser: _self.dform.responser,
            priority: _self.dform.priority,
            influence: _self.dform.influence,
            foundPeriod: _self.dform.foundPeriod,
            defectPeriod: _self.dform.defectPeriod,
            prodModule: _self.dform.prodModule,
            defectType: _self.dform.defectType,
            status: _self.dform.status.toString(),
            foundTimeBegin: foundTimeBegin,
            foundTimeEnd: foundTimeEnd,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function (res) {
          _self.tableData = eval(res.data.list);
          _self.pageInfo = res.data;
          setTimeout(() => {
            _self.queryLoading = false;
            _self.queryChanged = false;
          }, 200);
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          _self.queryLoading = false;
          console.log(response);
        });
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    submitDefect() {
      let _self = this;
      let bugDetail = "";
      if (_self.dfform.detail.length > 0) {
        let description = _self.dfform.detail.split(/\n/g);
        let descResult = "";
        const pattern = /!\[(.*?)\]\((.*?)\)/gm;

        for (let i = 0; i < description.length; i++) {
          if (commonQuery.isNull(description[i])) {
            continue;
          }
          descResult += ((pattern.exec(description[i])) == null ? "\t\t" : "") + description[i] + ((i == description.length - 1) ? "" : "\n");
        }
        bugDetail = "### " + dateFormat(new Date(), _self.timefmt) + "，由 " + sessionStorage.userName + " 操作：\n" + descResult;
      }
      _self.$axios.post("/defect/create", {
          relId: _self.dfform.relId,
          reqId: _self.dfform.reqId,
          submitter: sessionStorage.userId,
          status: !_self.dfform.responser ? 1 : 2,
          priority: _self.dfform.priority,
          influence: _self.dfform.influence,
          conciliator: _self.dfform.conciliator,
          responser: _self.dfform.responser,
          defectType: _self.dfform.defectType,
          foundPeriod: _self.dfform.foundPeriod,
          defectPeriod: _self.dfform.defectPeriod,
          foundMeans: _self.dfform.foundMeans,
          prodModule: _self.dfform.prodModule,
          summary: _self.dfform.summary,
          detail: bugDetail,
          foundTime: _self.dfform.foundTime,
          responseTime: commonQuery.isNull(_self.dfform.responser) ? null : _self.dfform.foundTime,
          responseCost: commonQuery.isNull(_self.dfform.responser) ? null : 0
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("缺陷提交成功！");
            _self.showDialog = false;
          } else {
            _self.$message.warning("缺陷提交失败，请检查服务！");
          }
          _self.queryDefect();
        })
    },

    multiDragUpload(editor, e, simplemde) {
      if (!(e.dataTransfer && e.dataTransfer.files)) {
        this.$notify.error("该浏览器不支持操作");
        return;
      }
      let dataList = e.dataTransfer.files;
      let imageFiles = [];
      for (let i = 0; i < dataList.length; i++) {
        if (dataList[i].type.indexOf("image") === -1) {
          this.$message.info("仅支持图片拖拽");
          continue;
        }
        imageFiles.push(dataList[i]);
      }
      this.mdeIMGUpload(simplemde.codemirror, imageFiles);
      e.preventDefault();
    },

    singleCopyUpload(editor, e, simplemde) {
      // 粘贴图片的触发函数
      if (!(e.clipboardData && e.clipboardData.items)) {
        this.$notify.error("该浏览器不支持操作");
        return;
      }
      try {
        let dataList = e.clipboardData.items;
        if (
          dataList[0].kind === "file" &&
          dataList[0].getAsFile().type.indexOf("image") !== -1
        ) {
          this.mdeIMGUpload(simplemde.codemirror, [dataList[0].getAsFile()]);
        }
      } catch (e) {
        this.$notify.error("只能通过粘贴板来上传图片，而不是文件");
      }
    },

    mdeIMGHandler(objectRef) {
      this.$nextTick(() => {
        [this.$refs[objectRef]].map(({
          simplemde
        }) => {
          simplemde.codemirror.on("drop", (editor, e) => {
            this.multiDragUpload(editor, e, simplemde);
          });
          simplemde.codemirror.on("paste", (editor, e) => {
            this.singleCopyUpload(editor, e, simplemde);
          });
        });
      });
    },

    mdeIMGUpload(simplemde, files) {
      let params = files.map((file, index) => {
        let param = new FormData();
        param.append("file", file, '【' + sessionStorage.userName + '】缺陷附件图片' + (index + 1) + '.png');
        return param;
      });
      let makeRequest = params => {
        return this.$axios.post("/vuemde/img_upload", params, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      };
      let requests = params.map(makeRequest);
      this.$axios.spread = callback => {
        return arr => {
          return callback.apply(null, arr);
        };
      };
      this.$axios.all(requests).then(
        this.$axios.spread((...resps) => {
          for (let i = 0; i < resps.length; i++) {
            let result = resps[i].data;
            let url = `![${result.name}](${result.url})`; // 拼接成markdown语法
            let content = simplemde.getValue();
            simplemde.setValue(content + url + "\n"); // 和编辑框之前的内容进行拼接
          }
          this.$message.success("文件上传成功!");
        })
      );
    }
  }
};
</script>

<style>
@import "~simplemde/dist/simplemde.min.css";

.dform-box .el-form-item .el-input,
.new-defect .el-form-item input,
td .el-form-item .el-select,
td .el-form-item .el-input {
  width: 150px;
}

.img-preview .el-dialog__body {
  padding: 0 20px;
}

.defect-summary input {
  width: 415px !important;
}

.defect-desc textarea {
  min-height: 150px;
  max-height: 250px;
}

.defect-desc .CodeMirror {
  min-height: 150px;
  max-height: 170px;
}

.defect-desc .CodeMirror .CodeMirror-scroll {
  min-height: 150px;
  max-height: 170px;
  overflow: auto;
}

.dform-box .el-table .el-upload-list--picture .el-upload-list__item-thumbnail {
  width: 50px;
}

.defect-table-expand {
  font-size: 0;
}

.defect-table-expand label {
  width: 120px;
  color: #31394a;
}

.defect-table-expand .el-form-item {
  margin-right: 10px;
  margin-bottom: 5px;
}

.defect-table-expand .el-form-item__content {
  line-height: 20px;
}

.defect-table-expand .el-input,
.defect-table-expand .el-select {
  width: 180px !important;
}

.defect-table-expand .el-select .el-input__suffix {
  display: none !important;
}

.defect-table-expand .el-input input,
.defect-table-expand .el-select input {
  color: #4d535f !important;
  cursor: default !important;
  font-size: 12px !important;
}

.defect-table-expand .content-tips {
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

.sepp-table-expand .content-tips:hover {
  color: #61c3df;
}

.dform-box .el-table .cell .el-select,
.dform-box .el-table .cell .el-input {
  width: 100%;
}

.defect-table-expand .el-image {
  width: 120px;
  height: 100px;
}

.defect-table-expand .el-image__error {
  border: 1px dashed #e0e0e0;
  border-radius: 2px;
}

.defect-table-expand .el-image+.el-image {
  margin-left: 10px;
}

.dform-box {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.dform-box .summary-tips {
  color: #3AB4D7 !important;
  cursor: pointer !important;
}

.dform-box .summary-tips:hover {
  color: #61c3df !important;
}

.dform-box .el-table i {
  cursor: pointer;
  color: #3AB4D7;
}

.defect-desc {
  width: 945px;
}
</style>
