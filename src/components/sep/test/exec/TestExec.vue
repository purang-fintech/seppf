<template>
  <div id="root" style="width: 100%">

    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-bug"></i> 测试管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>测试执行</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog
      :close-on-click-modal="modalClose"
      title="用例基本信息"
      :visible.sync="showDetail"
      width="1024px"
      top="100px"
      :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">用例基本信息</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <case-info
        v-if="showDetail"
        :caseId="currentCase.id"
        :title="currentCase.name"
        :currentProd="productId"
        :readOnly="true"
        ref="caseInfo"></case-info>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDetail=false" size="small">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="modalClose"
      title="新建缺陷"
      :visible.sync="showDefectSubmit"
      width="1130px"
      class="submit-defect"
      :fullscreen="maximize1">
      <div slot="title">
        <span style="font-size:18px">新建缺陷</span>
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
        :model="defectForm"
        :rules="dFormRules"
        ref="ruledFormDefect"
        size="mini"
        :inline="true"
        label-width="110px">
        <el-form-item label="缺陷协调人" prop="conciliator" required>
          <el-select v-model="defectForm.conciliator" placeholder="请选择" clearable>
            <el-option-group v-for="group in testManagers" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="发现版本" required>
          <el-select v-model="release.checked" disabled>
            <el-option v-for="opt in release.opts" :value="opt.value" :key="opt.value" :label="opt.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属需求" prop="req.selected" required>
          <el-select v-model="defectForm.req.selected" class="ted-summary" @change="setDefaultModule()" placeholder="请选择" clearable>
            <el-option v-for="opt in defectForm.req.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority.selected" required>
          <el-select v-model="defectForm.priority.selected" placeholder="请选择" clearable>
            <el-option v-for="opt in defectForm.priority.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="严重程度" prop="influence.selected" required>
          <el-select v-model="defectForm.influence.selected" placeholder="请选择" clearable>
            <el-option v-for="opt in defectForm.influence.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缺陷摘要" prop="summary" required>
          <el-input v-model="defectForm.summary" placeholder="不超过50个字" class="ted-summary" clearable>需求摘要</el-input>
        </el-form-item>
        <el-form-item label="缺陷类型" prop="defectType.selected" required>
          <el-select v-model="defectForm.defectType.selected" placeholder="请选择" clearable>
            <el-option v-for="opt in defectForm.defectType.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发现阶段" prop="foundPeriod.selected" required>
          <el-select v-model="defectForm.foundPeriod.selected" placeholder="请选择" clearable>
            <el-option v-for="opt in defectForm.foundPeriod.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="植入阶段" prop="defectPeriod.selected">
          <el-select v-model="defectForm.defectPeriod.selected" placeholder="请选择" clearable>
            <el-option v-for="opt in defectForm.defectPeriod.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="应用模块" prop="prodModule.selected" required>
          <el-select v-model="defectForm.prodModule.selected" placeholder="请选择">
            <el-option v-for="opt in defectForm.prodModule.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item label="详细描述" prop="detail">
          <simple-mde v-model="defectForm.detail" :configs="configs" class="run-defect-d" ref="simpleMdeExecDefect"></simple-mde>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDefectSubmit=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="resetForm('ruledFormDefect')" size="small">重置</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="saveSubmitDefect('ruledFormDefect')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="新建测试集" :visible.sync="showDialog" width="40%">
      <el-form :model="newForm" size="small" class="scenario-fform">
        <el-form-item label="请输入名称" label-width="110px">
          <el-input v-model="newForm.name" clearable @keyup.enter.native="createScenario()" autofocus :maxlength="25"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="showDialog=false">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="createScenario()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showAddCase" width="50%">
      <div slot="title">
        <span style="font-size:18px">添加测试用例</span>
        <span style="font-size:18px;color:red">（须展开至待选目标节点方可有效勾选用例）</span>
      </div>
      <div class="case-menu">
        <el-tree
          class="tree-view"
          v-if="loadTree"
          ref="caseToSelect"
          style="height: 388px"
          node-key="id"
          highlight-current
          auto-expand-parent
          :show-checkbox="true"
          :expand-on-click-node="true"
          :props="defaultProps"
          lazy
          :load="loadNode"
          :default-expanded-keys="expanded"
          :render-content="renderContent">
        </el-tree>
      </div>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="showAddCase=false">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="addCases()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="测试用例历史运行记录" :visible.sync="showCaseRunHis" width="75%" :fullscreen="maximize2">
      <div slot="title">
        <span style="font-size:18px">测试用例历史运行记录</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize2=!maximize2">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize2==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize2==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-table
        :data="runHistory"
        size="mini"
        max-height="400"
        :border="showBorder"
        stripe
        empty-text="没有历史运行记录">
        <el-table-column prop="runId" label="RUN #" width="80" align="center">
        </el-table-column>
        <el-table-column prop="relCode" label="版本号" width="120" align="center">
        </el-table-column>
        <el-table-column label="计划类型" width="120" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.planType" size="mini" disabled>
              <el-option v-for="opt in allTypes" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="runBegin" label="运行开始" width="140" align="center">
        </el-table-column>
        <el-table-column prop="runEnd" label="运行结束" width="140" align="center">
        </el-table-column>
        <el-table-column prop="runDuration" label="运行时长" width="120" align="center">
        </el-table-column>
        <el-table-column prop="result" label="运行结果" width="120" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.result" size="mini" disabled>
              <el-option v-for="opt in testResultStatus" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="所属测试集" header-align="center">
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="showCaseRunHis=false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="修改测试集名称" :visible.sync="showDialogMod" width="40%">
      <el-form size="small" class="scenario-fform">
        <el-form-item label="请输入名称" label-width="110px">
          <el-input v-model="currentScenario.name" clearable @keyup.enter.native="updateScenario()" :maxlength="25"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="onCancelMod()">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="updateScenario()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="modalClose"
      title="新的测试步骤运行"
      :visible.sync="showRunStep"
      class="run-steps"
      width="75%"
      :fullscreen="maximize3">
      <div slot="title">
        <span style="font-size:18px">新建测试步骤运行</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize3=!maximize3">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize3==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize3==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-alert type="warning" :closable="false" title="此处为按步骤新建测试运行，历史记录查询请返回测试集用例列表查看" />
      <el-table :data="caseSteps" size="mini" max-height="400" stripe>
        <el-table-column prop="stepId" label="#" width="40" align="center">
        </el-table-column>
        <el-table-column prop="operation" label="操作描述" width="200" align="center">
        </el-table-column>
        <el-table-column prop="inputData" label="输入数据" width="200" align="center">
        </el-table-column>
        <el-table-column prop="expectResult" label="预期结果" width="200" align="center">
        </el-table-column>
        <el-table-column label="实际结果" header-align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.stepActual" size="mini" clearable :maxlength="100"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="运行结果" width="120" align="center">
          <template slot-scope="scope">
            <el-select v-model="scope.row.result" size="mini">
              <el-option v-for="opt in testResultStatus" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="cancelStepRun()">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="saveStepRun()">确定</el-button>
      </div>
    </el-dialog>

    <div class="release" v-bind:style="{height: baseHeight + 'px'}">
      <el-tooltip content="可输入未关闭来过滤已经关闭的版本" placement="bottom" effect="dark">
        <el-input v-model="filterText" size="small" placeholder="请输入过滤关键字" clearable></el-input>
      </el-tooltip>
      <el-radio-group v-model="release.checked" size="small" @change="testPlanQuery()">
        <el-radio-button v-for="opt in filteredRel" :label="opt.value" :key="opt.value" border>{{opt.label}}</el-radio-button>
      </el-radio-group>
    </div>

    <div class="scenario" :style="{ height: baseHeight + 'px' }">
      <el-form size="small" class="scenario-header" inline>
        <el-form-item class="selects">
          <el-select v-model="planType.selected" size="small" @change="scenarioQuery()" placeholder="请选择计划类型" no-data-text="该版本未创建测试计划">
            <el-option v-for="opt in planType.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="buttons">
          <el-button
            v-no-more-click
            type="primary"
            class="el-icon-circle-plus"
            size="small"
            plain
            @click="newScenarioCheck()"> 新建测试集</el-button>
        </el-form-item>
      </el-form>

      <v-contextmenu ref="contextmenu" v-show="menuDisplay">
        <v-contextmenu-item @click="refresh">刷新 (Ctrl+R)</v-contextmenu-item>
        <v-contextmenu-item @click="copy">复制 (Ctrl+C)</v-contextmenu-item>
        <v-contextmenu-item @click="paste">粘贴 (Ctrl+V)</v-contextmenu-item>
        <v-contextmenu-item @click="add">新建 (Ctrl+S)</v-contextmenu-item>
        <v-contextmenu-item @click="edit">修改 (Ctrl+E)</v-contextmenu-item>
        <v-contextmenu-item @click="del">删除 (Ctrl+D)</v-contextmenu-item>
      </v-contextmenu>
      <el-table
        :data="scenarios"
        ref="scenarioTable"
        :max-height="baseHeight - 36"
        size="small"
        stripe
        @row-contextmenu="showMenu"
        @current-change="casesQuery"
        highlight-current-row
        empty-text="该测试计划没有建立测试集">
        <el-table-column prop="name" head-align="center">
          <template slot="header" slot-scope="slot">
            <el-tooltip content="测试集名称双击可修改" placement="left" effect="dark">
              <span>测试集名称</span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <div @dblclick="beginEdit">
              <el-input size="mini" v-model="scope.row.name" class="scenario-row" readonly autofocus></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" width="80">
          <template slot="header" slot-scope="slot">
            <el-tooltip content="可操作：1、删除测试集  2、向测试集添加用例" placement="left" effect="dark">
              <span>操作</span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <el-button
              v-no-more-click
              type="danger"
              size="mini"
              class="iconfont icon-empty icon-btn"
              circle
              @click="delScenario(scope.row)"></el-button>
            <el-button
              v-no-more-click
              type="primary"
              size="mini"
              class="iconfont icon-addition icon-btn"
              circle
              @click="caseAddQuery()"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="case-list" :style="{ height: baseHeight + 'px' }">
      <el-form size="small" class="case-header" inline>
        <el-form-item class="selects">
          <el-select v-model="resFilter" size="small" placeholder="运行状态过滤" no-data-text="该版本未创建测试计划" clearable>
            <el-option v-for="opt in testResultStatus" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="buttons">
          <el-button
            v-no-more-click
            type="primary"
            class="el-icon-remove"
            size="small"
            plain
            @click="batchDelScenarioCase()"> 批量移除</el-button>
        </el-form-item>
        <el-form-item class="buttons">
          <el-button
            v-no-more-click
            type="success"
            class="el-icon-success"
            size="small"
            plain
            @click="runScenarioCheck(1)"> 批量通过</el-button>
        </el-form-item>
        <el-form-item class="buttons">
          <el-button
            v-no-more-click
            type="danger"
            class="el-icon-error"
            size="small"
            plain
            @click="runScenarioCheck(0)"> 批量失败</el-button>
        </el-form-item>
      </el-form>
      <el-table
        :data="filterResult"
        :max-height="baseHeight - 36"
        size="small"
        stripe
        empty-text="该测试集未纳入测试用例"
        @selection-change="selectCases">
        <el-table-column type="selection" align="center" width="35">
        </el-table-column>
        <el-table-column label="调序" align="center" width="50">
          <template slot-scope="scope">
            <i v-show="scope.$index>0" class="iconfont icon-arrowup" style="cursor:pointer;font-size:12px;margin-right:2px" @click="indexUp(scope.$index)" />
            <i v-show="scope.$index < cases.length - 1" class="iconfont icon-arrowdown" style="cursor:pointer;font-size:12px;" @click="indexDown(scope.$index)" />
          </template>
        </el-table-column>
        <el-table-column label="测试集用例名称" head-align="center">
          <template slot-scope="scope">
            <span style="cursor:pointer" @click="showCaseDetail(scope.row)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="运行状态" head-align="center" width="110" sortable>
          <template slot-scope="scope">
            <el-select v-model="scope.row.result" size="mini" @change="runCurrentCase(scope.row)">
              <el-option v-for="opt in testResultStatus" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column align="center" width="110">
          <template slot="header" slot-scope="slot">
            <el-tooltip content="可操作：1、移除场景用例，2、查看运行历史， 3、运行测试步骤" placement="left" effect="dark">
              <span>操作</span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <el-button
              v-no-more-click
              type="danger"
              size="mini"
              class="iconfont icon-empty icon-btn"
              plain
              circle
              @click="delScenarioCase(scope.row, scope.$index)"></el-button>
            <el-button
              v-no-more-click
              type="primary"
              size="mini"
              class="iconfont icon-history icon-btn"
              plain
              circle
              @click="showCaseRunHistory(scope.row.id)"></el-button>
            <el-button
              v-no-more-click
              type="success"
              v-if="scope.row.type=='case'"
              size="mini"
              class="iconfont icon-run icon-btn"
              plain
              circle
              @click="runCaseStep(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import CaseInfo from "@/components/sep/test/case/CaseInfo.vue";
import {
  dateFormat
} from "@/util/date.js";
import simpleMde from "vue-simplemde/src/markdown-editor";
import contextmenu from 'v-contextmenu/src/components/Contextmenu';
import contextmenuitem from 'v-contextmenu/src/components/ContextmenuItem';
import commonQuery from "@/components/util/CommonQuery.vue";

const rootId = 1;
let relReqOpts = [];

export default {
  data() {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      scenarios: [],
      cases: [],
      maximize: false,
      maximize1: false,
      maximize2: false,
      maximize3: false,
      relStatus: [],
      release: {
        checked: "",
        opts: []
      },
      filterText: "未关闭",
      filteredRel: [],
      baseHeight: "",
      showDialog: false,
      showAddCase: false,
      showRunStep: false,
      caseSteps: [],
      newRun: {
        runId: "",
        beginTime: ""
      },
      showCaseRunHis: false,
      planType: {
        selected: "",
        opts: []
      },
      allTypes: [],
      planId: "",
      showDialogMod: false,
      newForm: {
        name: ""
      },
      testResultStatus: [],
      currentScenario: {},
      originName: "",
      resFilter: "",
      currentCase: {
        id: "",
        name: "",
        result: ""
      },
      showDefectSubmit: false,
      defectForm: {
        req: {
          selected: "",
          opts: relReqOpts
        },
        priority: {
          selected: 2,
          opts: []
        },
        defectType: {
          selected: 1,
          opts: []
        },
        foundPeriod: {
          selected: 4,
          opts: []
        },
        defectPeriod: {
          selected: 4,
          opts: []
        },
        influence: {
          selected: 3,
          opts: []
        },
        conciliator: "",
        prodModule: {
          selected: "",
          opts: []
        },
        detail: "",
        summary: ""
      },
      timefmt: defaultTimeFormat,
      testManagers: [],
      defectDefaultSummary: "",
      failedCaseId: "",
      dFormRules: {
        'conciliator': [{
          required: true,
          message: '请选择缺陷协调人',
          trigger: 'change'
        }],
        'req.selected': [{
          required: true,
          message: '请选择所属需求',
          trigger: 'change'
        }],
        'prodModule.selected': [{
          required: true,
          message: '请选择所属模块',
          trigger: 'change'
        }],
        'defectType.selected': [{
          required: true,
          message: '请选择缺陷类型',
          trigger: 'change'
        }],
        'foundPeriod.selected': [{
          required: true,
          message: '请选择发现阶段',
          trigger: 'change'
        }],
        'priority.selected': [{
          required: true,
          message: '请选择优先级',
          trigger: 'change'
        }],
        'influence.selected': [{
          required: true,
          message: '请选择严重程度',
          trigger: 'change'
        }],
        summary: [{
            required: true,
            message: '缺陷摘要',
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
          "heading-smaller",
          "heading-bigger",
          "strikethrough"
        ],
        hideIcons: ["fullscreen", "side-by-side"],
        placeholder: "此处可通过粘贴板或者拖拽进行快捷图片上传，仅限图片",
        renderingConfig: {
          codeSyntaxHighlighting: true,
          highlightingTheme: "atom-one-light"
        }
      },
      batchCases: [],
      runHistory: [],
      showDetail: false,
      productId: -1,
      expanded: [],
      loadTree: false,
      defaultProps: {
        children: "children",
        label: "name",
        isLeaf: 'leaf'
      },
      menuDisplay: false,
      index: 0,
      currnetMenu: {},
      copiedMenus: [],
      eventKeys: [],
      permitKeys: [17, 67, 68, 69, 82, 83, 86]
    };
  },

  components: {
    vContextmenu: contextmenu,
    vContextmenuItem: contextmenuitem,
    simpleMde,
    CaseInfo
  },

  watch: {
    filterText: function () {
      this.filterRelease();
    },

    currnetMenu: function () {
      this.index = 0;
    },

    showDefectSubmit: function () {
      if (this.showDefectSubmit) {
        this.defectForm.summary = this.defectDefaultSummary;
        this.defectForm.req.selected = "";
        this.defectForm.priority.selected = 2;
        this.defectForm.influence.selected = 3;
        this.defectForm.conciliator = commonQuery.roleAllow([4]) ? parseInt(sessionStorage.userId) : "";
        this.defectForm.foundPeriod.selected = this.planType.selected;
        this.defectForm.defectPeriod.selected = 3;
        this.defectForm.defectType.selected = 1;
        this.defectForm.prodModule.selected = "";
        this.defectForm.detail = "";

        this.mdeIMGHandler();
        this.memberQuery();
        this.moduleQuery();
        this.relReqQuery(this.release.checked);
      } else {
        if (this.$refs["simpleMdeExecDefect"]) {
          [this.$refs["simpleMdeExecDefect"]].map(({
            simplemde
          }) => {
            if (simplemde.codemirror) {
              simplemde.codemirror.on("drop", false);
              simplemde.codemirror.on("paste", false);
            }
          });
        }
      }
    }
  },

  created() {
    let _self = this;

    _self.allTypes.splice(0, _self.allTypes.length);
    let testPeriod = localStorage.getItem("testPeriod");
    eval(testPeriod).forEach(item => {
      _self.allTypes.push({
        value: item.periodId,
        label: item.periodName
      });
    });

    _self.relStatus.splice(0, _self.relStatus.length);
    let releaseStatus = localStorage.getItem("releaseStatus");
    eval(releaseStatus).forEach(item => {
      _self.relStatus.push({
        value: item.statusId,
        label: item.statusName
      });
    });

    _self.testResultStatus.splice(0, _self.testResultStatus.length);
    let testResultStatus = localStorage.getItem("testResultStatus");
    eval(testResultStatus).forEach(item => {
      _self.testResultStatus.push({
        value: item.statusId,
        label: item.statusName
      });
    });

    _self.defectForm.influence.opts.splice(0, _self.defectForm.influence.opts.length);
    let defectInfluence = localStorage.getItem("defectInfluence");
    eval(defectInfluence).forEach(item => {
      _self.defectForm.influence.opts.push({
        value: item.influenceId,
        label: item.influenceName
      });
    });

    _self.defectForm.priority.opts.splice(0, _self.defectForm.priority.opts.length);
    let defectPriority = localStorage.getItem("defectPriority");
    eval(defectPriority).forEach(item => {
      _self.defectForm.priority.opts.push({
        value: item.priorityId,
        label: item.priorityName
      });
    });

    _self.defectForm.foundPeriod.opts.splice(0, _self.defectForm.foundPeriod.opts.length);
    let defectFoundPeriod = localStorage.getItem("defectFoundPeriod");
    eval(defectFoundPeriod).forEach(item => {
      _self.defectForm.foundPeriod.opts.push({
        value: item.periodId,
        label: item.periodName
      });
    });

    _self.defectForm.defectPeriod.opts.splice(0, _self.defectForm.defectPeriod.opts.length);
    let defectPeriod = localStorage.getItem("defectPeriod");
    eval(defectPeriod).forEach(item => {
      _self.defectForm.defectPeriod.opts.push({
        value: item.periodId,
        label: item.periodName
      });
    });

    _self.defectForm.defectType.opts.splice(0, _self.defectForm.defectType.opts.length);
    let defectType = localStorage.getItem("defectType");
    eval(defectType).forEach(item => {
      _self.defectForm.defectType.opts.push({
        value: item.typeId,
        label: item.typeName
      });
    });

    _self.baseHeight = bodyAviHeightNTab + 45;
    _self.releaseQuery();
  },

  computed: {
    filterResult() {
      let _self = this;
      if (!_self.cases || _self.cases.length == 0) {
        return [];
      }
      return _self.cases.filter(function (d) {
        if (_self.resFilter) {
          return d.result == _self.resFilter;
        } else {
          return _self.cases;
        }
      });
    }
  },

  methods: {
    filterRelease() {
      let _self = this;
      if (!_self.filterText || _self.filterText == "") {
        _self.filteredRel = _self.release.opts;
      } else {
        if (_self.filterText == "未关闭") {
          _self.filteredRel = _self.release.opts.filter(function (d) {
            return d.status != 0;
          });
        } else {
          _self.filteredRel = _self.release.opts.filter(function (d) {
            return d.label.indexOf(_self.filterText) > -1;
          });
        }
      }
      if (_self.$route.params && _self.$route.params.relId != null) {
        _self.release.checked = parseInt(_self.$route.params.relId);
      } else {
        if (_self.filteredRel.length > 0) {
          _self.release.checked = _self.filteredRel[0].value;
        } else {
          _self.release.checked = [];
        }
      }
    },

    setDefaultModule() {
      let _self = this;
      if (_self.defectForm.req.selected) {
        _self.defectForm.prodModule.selected = _self.defectForm.req.opts.find(d => {
          return d.value == _self.defectForm.req.selected;
        }).moduleId;
      } else {
        if (_self.defectForm.prodModule.selected) {
          _self.defectForm.prodModule.selected = "";
        }
      }
    },

    showCaseDetail(data) {
      this.currentCase.id = data.id;
      this.currentCase.name = data.name;
      this.showDetail = true;
      // this.$refs.caseInfo.queryCaseInfo(caseId);
    },

    selectCases(val) {
      this.batchCases = val;
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    saveSubmitDefect(formName) {
      let _self = this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.submitDefect();
        }
      });
    },

    submitDefect() {
      let _self = this;
      let now = dateFormat(new Date(), _self.timefmt);
      _self.$axios.post("/defect/create", {
          reqId: _self.defectForm.req.selected,
          relId: _self.release.checked,
          submitter: sessionStorage.userId,
          status: 1,
          priority: _self.defectForm.priority.selected,
          influence: _self.defectForm.influence.selected,
          conciliator: _self.defectForm.conciliator,
          defectType: _self.defectForm.defectType.selected,
          foundPeriod: _self.defectForm.foundPeriod.selected,
          defectPeriod: _self.defectForm.defectPeriod.selected,
          prodModule: _self.defectForm.prodModule.selected,
          summary: _self.defectForm.summary,
          foundMeans: 1,
          detail: _self.defectForm.detail,
          foundTime: now
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("缺陷提交成功");
            _self.showDefectSubmit = false;
            _self.defectRelate(_self.failedCaseId, res.data);
          } else {
            _self.$message.warning("缺陷提交失败，请检查服务");
          }
        })
    },

    defectRelate(caseId, defectId) {
      let _self = this;
      _self.$axios.post("/case/relate_save", {
        caseId: caseId,
        ids: defectId,
        relateType: 1
      })
    },

    beginEdit(data) {
      this.originName = this.currentScenario.name;
      this.showDialogMod = true;
    },

    onCancelMod() {
      this.showDialogMod = false;
      this.currentScenario.name = this.originName;
    },

    caseAddQuery() {
      this.showAddCase = true;
      this.loadTree = true;
      this.$nextTick(() => {
        this.$refs.caseToSelect.setCheckedNodes([]);
        this.expanded.splice(0, this.expanded.length);
        this.expanded.push(rootId);
      });
    },

    bindHotKeys(elements) {
      let _self = this;

      Array.from(_self.$el.querySelectorAll(".scenario-row")).forEach(function (el, index) {
        el.addEventListener(
          "keydown",
          function (ev) {
            if (_self.permitKeys.indexOf(ev.keyCode) > -1) {
              ev.preventDefault();
              if (_self.eventKeys.length == 0 || _self.eventKeys.indexOf(ev.keyCode) == -1) {
                _self.eventKeys.push(ev.keyCode);
              }
              _self.eventKeys = Array.from(new Set(_self.eventKeys)); //多余，但可确保万无一失
            }
          },
          false
        );

        el.addEventListener(
          "keyup",
          function (ev) {
            _self.combineHotKeys();
            _self.eventKeys.splice(0, _self.eventKeys.length);
          },
          false
        );
      });
    },

    combineHotKeys() {
      let _self = this;
      _self.currnetMenu.data = _self.currentScenario;
      if (
        !_self.eventKeys ||
        _self.eventKeys.length < 2 ||
        _self.eventKeys[0] != 17
      ) {
        return;
      }
      let actKey = _self.eventKeys[1];

      if (actKey == 67) {
        _self.copy();
      } else if (actKey == 68) {
        _self.del();
      } else if (actKey == 69) {
        _self.edit();
      } else if (actKey == 82) {
        _self.refresh();
      } else if (actKey == 83) {
        _self.add();
      } else if (actKey == 86) {
        _self.paste();
      }
    },

    copy(vm, event) {
      this.itemClicked();
      let arr = [];
      arr.push(this.currnetMenu);
      this.copiedMenus.splice(0, this.copiedMenus.length);
      this.copiedMenus = arr.concat(); //粗暴深拷贝，以便多次粘贴
    },

    paste(vm, event) {
      this.itemClicked();
      if (this.copiedMenus.length == 0) {
        this.$message.info("粘贴板内容为空，请重试");
      }
      this.index += 1;
      this.createScenario(this.copiedMenus[0].data);
    },

    add(vm, event) {
      this.itemClicked();
      this.newScenarioCheck();
    },

    refresh(vm, event) {
      this.scenarioQuery(this.currnetMenu.data);
    },

    edit(vm, event) {
      this.itemClicked();
      this.beginEdit(this.currnetMenu.data);
    },

    del(vm, event) {
      this.itemClicked();
      this.delScenario(this.currnetMenu.data);
    },

    itemClicked() {
      this.menuDisplay = false;
      document.body.removeEventListener("click", this.bodyClick);
    },

    showMenu(row, column, event) {
      event.preventDefault();
      this.menuDisplay = true;
      this.$refs.contextmenu.style =
        "position:absolute; left: " +
        event.pageX +
        "px;top: " +
        event.pageY +
        "px";
      document.body.addEventListener("click", this.bodyClick);
      this.currnetMenu.data = row;
    },

    bodyClick(e) {
      this.menuDisplay = false;
    },

    indexUp(index) {
      if (index == 0) {
        return;
      }
      if (!this.resFilter || null == this.resFilter || this.resFilter == "") {
        this.transIndex(this.cases, index, index - 1);
      } else {
        this.$message.info("请先清空运行结果筛选条件");
      }
    },

    indexDown(index) {
      if (index == this.cases.length - 1) {
        return;
      }
      if (!this.resFilter || null == this.resFilter || this.resFilter == "") {
        this.transIndex(this.cases, index, index + 1);
      } else {
        this.$message.info("请先清空运行结果筛选条件");
      }
    },

    transIndex(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
      let temp = [];
      for (let i = 0; i < arr.length; i++) {
        temp.push(arr[i].id);
      }
      this.currentScenario.cases = temp.toString();
      this.updateScenario();
    },

    addCases() {
      let checkedNodes = this.$refs.caseToSelect.getCheckedNodes(true);
      if (!checkedNodes || checkedNodes.length == 0) {
        this.$message.info("请选择测试用例");
        return;
      }
      let checkedCases = [];
      for (let k = 0; k < checkedNodes.length; k++) {
        if (checkedNodes[k].type == "case" || checkedNodes[k].type == "mind") {
          checkedCases.push(checkedNodes[k].id + "");
        }
      }
      let originCases = [];
      if (this.currentScenario.cases && this.currentScenario.cases != "") {
        originCases = this.currentScenario.cases.split(",");
      }
      let newCases = [];
      if (originCases.length == 0) {
        newCases = checkedCases;
      } else {
        let restCases = checkedCases.filter(function (d) {
          return originCases.indexOf(d) == -1;
        });
        newCases = originCases.concat(restCases);
      }

      if (newCases.length > originCases.length) {
        this.currentScenario.cases = newCases.toString();
        this.updateScenario();
      } else {
        this.$message.info("没有新的测试用例添加");
      }
      this.showAddCase = false;
    },

    runCaseStep(row) {
      let _self = this;
      _self.currentCase = row;
      _self.$axios.post("/case/step_query/" + row.id)
        .then(function (res) {
          _self.caseSteps = eval(res.data);
          if (!_self.caseSteps || _self.caseSteps.length == 0) {
            _self.$message.info("该用例未设计测试步骤");
            _self.showRunStep = false;
            return;
          }
          _self.startStepRun();
        })
    },

    startStepRun() {
      let _self = this;
      _self.showRunStep = true;
      _self.newRun.beginTime = dateFormat(new Date(), defaultTimeFormat);
      _self.$axios.post("/exec/begin", {
          scenarioId: _self.currentScenario.id,
          runBeginTime: _self.newRun.beginTime
        })
        .then(function (res) {
          _self.newRun.runId = res.data;
        })
    },

    cancelStepRun() {
      let _self = this;
      _self.showRunStep = false;
      _self.$axios.post("/exec/cancel", {
          runId: _self.newRun.runId,
          runEndTime: dateFormat(new Date(), defaultTimeFormat)
        })
        .then(function (res) {
          _self.caseCancelStatusRecord();
        })
    },

    caseCancelStatusRecord() {
      let _self = this;
      _self.$axios.post("/exec/record_case_cancel", {
          scenarioId: _self.currentScenario.id,
          caseId: _self.currentCase.id,
          runId: _self.newRun.runId,
          runEndTime: dateFormat(new Date(), defaultTimeFormat),
          result: 4
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.info("取消运行测试集用例");
          } else {
            _self.$message.warning("取消运行测试集用例失败");
          }
          _self.casesQuery(_self.currentScenario);
        })
    },

    saveStepRun() {
      let _self = this;
      let fixedResult = [];
      let currentResult = null;
      let containsFail = false;
      let failed = "";
      for (let i = 0; i < _self.caseSteps.length; i++) {
        currentResult = _self.caseSteps[i];
        if (currentResult.result == 2) {
          containsFail = true;
          failed = currentResult.caseId;
        }
        fixedResult.push({
          "caseId": currentResult.caseId,
          "stepId": currentResult.stepId,
          "stepActual": currentResult.stepActual,
          "result": commonQuery.isNull(currentResult.result) ? 4 : currentResult.result
        });
      }
      _self.$axios.post("/exec/record_step_result", {
          scenarioId: _self.currentScenario.id,
          runEndTime: dateFormat(new Date(), defaultTimeFormat),
          runId: _self.newRun.runId,
          stepResults: JSON.stringify(fixedResult)
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("运行测试步骤成功");
            if (containsFail) {
              _self.$confirm("步骤结果包含失败，是否需要提交缺陷？", "操作确认", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning"
                })
                .then(() => {
                  _self.showDefectSubmit = true;
                  _self.defectDefaultSummary = "运行测试用例【" + _self.currentCase.name + "】步骤失败";
                  _self.failedCaseId = failed;
                })
                .catch(() => {});
            }
          } else {
            _self.$message.info("运行测试步骤失败");
          }
          _self.casesQuery(_self.currentScenario);
          _self.showRunStep = false;
        })
    },

    runScenarioCheck(passed) {
      let _self = this;
      let mark = passed == 0 ? "失败" : "通过";
      if (_self.batchCases.length == 0) {
        _self.$message.info("没有选中任何记录");
        return;
      }
      _self.$confirm("确定将选中测试用例标注为运行" + mark + "吗？", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          let cases = [];
          for (let i = 0; i < _self.batchCases.length; i++) {
            cases.push({
              caseId: _self.batchCases[i].id,
              result: !passed || passed == 0 ? 2 : 1
            });
          }
          _self.runScenario(cases);
          if (passed == 0) {
            _self.$confirm("是否需要提交缺陷？", "操作确认", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
              })
              .then(() => {
                _self.showDefectSubmit = true;
                _self.defectDefaultSummary = "运行测试集【" + _self.currentScenario.name + "】失败";
                _self.failedCaseId = _self.batchCases[0].id;
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    },

    runScenario(caseArr) {
      let _self = this;
      _self.$axios.post("/exec/record_case_result", {
          scenarioId: _self.currentScenario.id,
          runBeginTime: dateFormat(new Date(), defaultTimeFormat),
          runEndTime: dateFormat(new Date(), defaultTimeFormat),
          caseResults: JSON.stringify(caseArr)
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("运行测试集用例成功");
          } else {
            _self.$message.info("运行测试集用例失败");
          }
          _self.casesQuery(_self.currentScenario);
        })
    },

    runCurrentCase(row) {
      let _self = this;
      let cases = [];
      cases.push({
        caseId: row.id,
        result: row.result
      });
      _self.runScenario(cases);
      if (row.result == 2) {
        _self.$confirm("是否需要提交缺陷？", "操作确认", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            _self.showDefectSubmit = true;
            _self.defectDefaultSummary = "运行测试用例【" + row.name + "】失败";
            _self.failedCaseId = row.id;
          })
          .catch(() => {});
      }
    },

    newScenarioCheck() {
      if (null == this.release.checked || this.release.checked == "") {
        this.$message.info("请先选择版本号");
        return;
      }
      if (null == this.planType.selected || this.planType.selected == "") {
        this.$message.info("请先选择测试计划类型");
        return;
      }
      this.showDialog = true;
    },

    createScenario(data) {
      let _self = this;
      let name, cases;
      if (!data) {
        name = _self.newForm.name;
        cases = "";
      } else {
        name = data.name + "-" + _self.index;
        cases = data.cases;
      }

      if (!name || "" == name) {
        _self.$message.info("测试集名称不能为空！");
        return;
      }

      if (name.length > 20) {
        _self.$message.info("测试集名称不能超过20字符！");
        return;
      }

      if (_self.scenarios) {
        for (let i = 0; i < _self.scenarios.length; i++) {
          if (_self.scenarios[i].name == name) {
            if (!data) {
              _self.$message.info("存在相同标题的测试集");
              return;
            } else {
              name = name + "-" + _self.index;
            }
          }
        }
      }

      _self.$axios.post("/scenario/create", {
          planId: _self.planId,
          name: name,
          cases: cases
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("新建测试集成功");
          } else {
            _self.$message.info("新建测试集失败");
          }
          _self.showDialog = false;
          let current = {
            id: res.data,
            name: name,
            planId: _self.planId,
            cases: cases
          };
          _self.scenarioQuery(current);
        })
    },

    updateScenario(row) {
      let _self = this;

      if (!_self.currentScenario.name || "" == _self.currentScenario.name) {
        _self.$message.info("测试集名称不能为空！");
        return;
      }

      if (_self.currentScenario.name.length > 20) {
        _self.$message.info("测试集名称不能超过20字符！");
        return;
      }

      _self.$axios.post("/scenario/update", {
          id: _self.currentScenario.id,
          planId: _self.planId,
          name: _self.currentScenario.name,
          cases: _self.currentScenario.cases
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("修改测试集成功");
          } else {
            _self.$message.info("修改测试集失败");
          }
          _self.showDialogMod = false;
          _self.scenarioQuery(_self.currentScenario);
        })
    },

    delScenario(row) {
      let _self = this;
      _self.$confirm("确定要删除当前记录吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        })
        .then(() => {
          _self.$axios.post("/scenario/delete/" + row.id)
            .then(function (res) {
              if (res.data > 0) {
                _self.$message.success("删除测试集成功");
              } else {
                _self.$message.info("删除测试集失败");
              }
              _self.scenarioQuery();
            })
        })
        .catch(() => {});
    },

    batchDelScenarioCase() {
      let _self = this;
      if (!_self.currentScenario.cases) {
        return;
      }
      if (_self.batchCases.length == 0) {
        _self.$message.info("没有选中任何记录");
        return;
      }
      _self.$confirm("确定将选中测试移出当前测试集吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          let delCases = [];
          let originCases = _self.currentScenario.cases.split(",");
          for (let i = 0; i < _self.batchCases.length; i++) {
            delCases.push("" + _self.batchCases[i].id);
          }
          let restCases = originCases.filter(function (d) {
            return delCases.indexOf(d) == -1;
          });
          let dataParam = new URLSearchParams();
          dataParam.append("cases", restCases.toString());
          _self.$axios.post("/scenario/update", {
              id: _self.currentScenario.id,
              planId: _self.planId,
              name: _self.currentScenario.name,
              cases: restCases.toString()
            })
            .then(function (res) {
              if (res.data > 0) {
                _self.$message.success("批量移出测试集用例成功");
                _self.currentScenario.cases = restCases.toString();
                _self.casesQuery(_self.currentScenario);
              } else {
                _self.$message.info("批量移出测试集用例失败");
              }
            })
        })
        .catch(() => {});
    },

    delScenarioCase(row, index) {
      let _self = this;
      let caseIds = _self.currentScenario.cases.split(",");
      caseIds.splice(index, 1);
      let dataParam = new URLSearchParams();
      dataParam.append("cases", caseIds.toString());
      _self.$confirm("确定要删除当前记录吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        })
        .then(() => {
          _self.$axios.post("/scenario/update", {
              id: _self.currentScenario.id,
              planId: _self.planId,
              name: _self.currentScenario.name,
              cases: caseIds.toString()
            })
            .then(function (res) {
              if (res.data > 0) {
                _self.$message.success("移除测试集用例成功");
                _self.currentScenario.cases = caseIds.toString();
                _self.casesQuery(_self.currentScenario);
              } else {
                _self.$message.info("移除测试集用例失败");
              }
            })
        })
        .catch(() => {});
    },

    releaseQuery(row, event, column) {
      let _self = this;
      _self.release.opts.splice(0, _self.release.opts.length);
      commonQuery.releaseQuery((result) => {
        if (result.original.length == 0) {
          _self.$message.info("当前产品/项目尚未建立版本计划！");
          return;
        }
        result.original.forEach(item => {
          _self.release.opts.push({
            value: item.id,
            label: "[" + item.branchName + "] " + item.relCode + " -- " + item.statusName,
            code: item.relCode,
            status: item.status
          });
        });
        _self.filterRelease();
        _self.testPlanQuery();
      })
    },

    testPlanQuery() {
      let _self = this;
      _self.planType.selected = "";
      _self.scenarios = [];
      _self.cases = [];
      _self.$axios({
          method: "post",
          url: "/plan/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.release.checked
          }
        })
        .then(function (res) {
          let json = eval(res.data.list);
          _self.planType.opts.splice(0, _self.planType.opts.length);
          if (json.length == 0) {
            _self.$message.info("该版本未建立测试计划");
            return;
          }
          for (let i = 0; i < json.length; i++) {
            for (let j = 0; j < _self.allTypes.length; j++) {
              if (_self.allTypes[j].value == json[i].planType) {
                _self.planType.opts.push({
                  value: _self.allTypes[j].value,
                  label: _self.allTypes[j].label,
                  planId: json[i].id
                });
              }
            }
          }
          if (_self.planType.opts.length == 0) {
            _self.$message.info("该版本未正确地建立测试计划");
            return;
          }
          _self.planType.selected = _self.planType.opts[0].value;
          _self.$refs.scenarioTable.setCurrentRow();
          _self.scenarioQuery();
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    scenarioQuery(current) {
      let _self = this;
      for (let i = 0; i < _self.planType.opts.length; i++) {
        if (_self.planType.opts[i].value == _self.planType.selected) {
          _self.planId = _self.planType.opts[i].planId;
          break;
        }
      }
      _self.cases = [];
      if (null == _self.release.checked || _self.release.checked == "") {
        _self.$message.info("请先选择版本号");
        return;
      }
      _self.$axios({
          method: "post",
          url: "/scenario/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            planId: _self.planId
          }
        })
        .then(function (res) {
          _self.scenarios = eval(res.data);
          if (_self.scenarios.length == 0) {
            return;
          }
          _self.$nextTick(function (d) {
            if (!current || null == current) {
              _self.$refs.scenarioTable.setCurrentRow(_self.scenarios[0]);
              _self.currentScenario = _self.scenarios[0];
            } else {
              for (let i = 0; i < _self.scenarios.length; i++) {
                if (_self.scenarios[i].id == current.id) {
                  _self.$refs.scenarioTable.setCurrentRow(_self.scenarios[i]);
                  _self.currentScenario = _self.scenarios[i];
                }
              }
            }
            _self.bindHotKeys();
          });
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    casesQuery(row, event, column) {
      let _self = this;
      if (!row) {
        return;
      }
      _self.menuDisplay = false;
      _self.currentScenario = row;
      _self.cases.splice(0, _self.cases.length);
      _self.$axios.post("/scenario/case_query/" + _self.currentScenario.id)
        .then(function (res) {
          let json = eval(res.data);
          if (!json || json.length == 0) {
            return;
          }
          let currentSenCases = [];
          for (let i = 0; i < json.length; i++) {
            _self.cases.push({
              id: json[i].id,
              name: json[i].name,
              type: json[i].type,
              result: null == json[i].result || json[i].result == 0 ? 5 : json[i].result
            });
            currentSenCases.push(json[i].id);
          }
          _self.currentScenario.cases = currentSenCases.toString();
        })
    },

    showCaseRunHistory(caseId) {
      this.showCaseRunHis = true;
      let _self = this;
      _self.$axios.post("/exec/history/" + caseId)
        .then(function (res) {
          _self.runHistory = eval(res.data);
        })
    },

    renderContent(h, {node, data, store}) {
      if (data.type == 'folder') {
        return (
          <span>
            <i class = "iconfont icon-folder" style = "margin-right: 4px" />
            {node.label}
          </span>
        );
      } else if (data.type == 'case') {
        return (
          <span>
            <i class = "el-icon-document" style = "margin-right: 4px" />
            {node.label}
          </span>
        );
      } else if (data.type == 'mind') {
        return (
          <span>
            <i class = "iconfont icon-minder" style = "margin-right: 4px" />
            {node.label}
          </span>
        );
      }
    },

    loadNode(node, resolve) {
      if (node.level == 0) {
        this.folderQuery(0, resolve);
      }

      if (node.level >= 1) {
        this.folderQuery(node.data.id, resolve);
      }
    },

    folderQuery(parentId, resolve) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/case/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            parentId: parentId,
            isDesc: 'Y',
            qryProduct: sessionStorage.productId
          }
        })
        .then(function (res) {
          let json = eval(res.data);
          if (parentId > 0) {
            let node = _self.$refs.caseToSelect.getNode(parentId);
            _self.$set(node.data, "children", []);
            json = json.filter(item => {
              return item.productId == parseInt(sessionStorage.productId);
            });
            json.forEach(item => {
              item.leaf = (item.type != 'folder');
              node.data.children.push(item);
            });
          }
          resolve(json);
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    relReqQuery(relId) {
      let _self = this;
      _self.$axios.post("/req/rel_query/" + relId + "/1/500")
        .then(function (res) {
          var req = eval(res.data.list);
          relReqOpts.splice(0, relReqOpts.length);
          let currentRel = _self.release.opts.find(d => {
            return d.value == relId
          });
          relReqOpts.push({
            label: "历史遗留问题，记入当前版本：" + currentRel.code,
            value: 0
          });
          for (var i = 0; i < req.length; i++) {
            relReqOpts.push({
              label: "#" + req[i].id + " - " + req[i].summary,
              value: req[i].id,
              moduleId: req[i].moduleId
            });
          }
        })
    },

    memberQuery() {
      let _self = this;
      commonQuery.roleMemberQuery(sessionStorage.productId, 4, (result) => {
        _self.testManagers = result.usersFull;
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
          let modules = eval(res.data.list);
          _self.defectForm.prodModule.opts.splice(
            0,
            _self.defectForm.prodModule.opts.length
          );
          for (var i = 0; i < modules.length; i++) {
            _self.defectForm.prodModule.opts.push({
              label: modules[i].moduleName,
              value: modules[i].moduleId
            });
          }
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    transData(json, idKey, pidKey, childrenKey) {
      let result = [];
      let hash = {};
      for (let i = 0; i < json.length; i++) {
        hash[json[i][idKey]] = json[i];
      }
      for (let j = 0; j < json.length; j++) {
        var aVal = json[j],
          hashVP = hash[aVal[pidKey]];
        if (hashVP) {
          !hashVP[childrenKey] && (hashVP[childrenKey] = []);
          hashVP[childrenKey].push(aVal);
        } else {
          result.push(aVal);
        }
      }
      return result;
    },

    mdeIMGHandler() {
      if (!this.showDefectSubmit) {
        return;
      }
      this.$nextTick(() => {
        [this.$refs.simpleMdeExecDefect].map(({
          simplemde
        }) => {
          simplemde.codemirror.on("drop", (editor, e) => {
            if (!(e.dataTransfer && e.dataTransfer.files)) {
              this.$notify.error("该浏览器不支持操作");
              return;
            }
            let dataList = e.dataTransfer.files;
            let imageFiles = [];
            for (let i = 0; i < dataList.length; i++) {
              if (dataList[i].type.indexOf("image") == -1) {
                this.$message.info("仅支持图片拖拽");
                continue;
              }
              imageFiles.push(dataList[i]);
            }
            this.mdeIMGUpload(simplemde.codemirror, imageFiles);
            e.preventDefault();
          });
          simplemde.codemirror.on("paste", (editor, e) => {
            if (!(e.clipboardData && e.clipboardData.items)) {
              this.$notify.error("该浏览器不支持操作");
              return;
            }
            try {
              let dataList = e.clipboardData.items;
              if (
                dataList[0].kind == "file" &&
                dataList[0].getAsFile().type.indexOf("image") !== -1
              ) {
                this.mdeIMGUpload(simplemde.codemirror, [
                  dataList[0].getAsFile()
                ]);
              }
            } catch (e) {
              this.$notify.error("只能通过粘贴板来上传图片，而不是文件");
            }
          });
        });
      });
    },

    mdeIMGUpload(simplemde, files) {
      let params = files.map(file => {
        let param = new FormData();
        param.append("file", file, '【' + sessionStorage.userName + '】缺陷附件图片.png');
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
            let url = `![](${result.url})`; // 拼接成markdown语法
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
@import "~v-contextmenu/dist/index.css";
@import "~simplemde/dist/simplemde.min.css";

.release {
  width: 16%;
  float: left;
  border: 1px solid #e4edf3;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 2px;
  overflow-y: auto;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.release .el-input>input {
  border-left: 0;
  border-right: 0;
  border-top: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-bottom: 2px;
}

.release .el-radio-group {
  width: 100%;
}

.release .el-radio-button,
.release .el-radio-button span {
  margin-bottom: 1px;
  margin-left: 0 !important;
  width: 100%;
  text-align: left;
  border-radius: 0;
  border-left: 0;
  border-right: 0;
}

.release .el-radio-button:first-child .el-radio-button__inner {
  border-left: 0;
  border-right: 0;
  border-radius: 0;
}

.release .el-radio-button:last-child .el-radio-button__inner {
  border-left: 0;
  border-right: 0;
  border-radius: 0;
}

.scenario {
  width: 33%;
  float: left;
  border: 1px solid #e4edf3;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 2px;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.scenario .current-row,
.scenario .current-row * {
  background-color: #909399 !important;
  color: #fff !important;
}

.case-list {
  width: 49%;
  float: left;
  border: 1px solid #e4edf3;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 2px;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.case-list .cell .el-select .el-input__suffix {
  display: block !important;
}

.case-list .cell .el-select .el-input .el-input__inner {
  background-color: transparent;
  border-color: #e4edf3;
  color: #000;
  cursor: pointer;
  border: none;
}

.release+.scenario,
.scenario+.case-list {
  margin-left: 1%;
}

.scenario-fform .el-input {
  width: 95% !important;
}

.scenario-fform .el-input input {
  width: 100%;
}

.scenario .el-table .cell .icon-btn,
.case-list .el-table .cell .icon-btn {
  margin-left: 0;
  padding: 5px;
}

.case-list .el-table,
.scenario .el-table {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.scenario .el-table .cell,
.case-list .el-table .cell {
  padding-right: 0px;
}

.scenario-header,
.case-header {
  height: 35px;
  width: 100%;
}

.scenario-header .selects {
  height: 35px;
  width: 60%;
  margin: 0;
}

.case-header .selects {
  height: 35px;
  width: 37%;
  margin: 0;
}

.scenario-header .selects .el-form-item__content,
.scenario-header .buttons .el-form-item__content,
.case-header .selects .el-form-item__content,
.case-header .buttons .el-form-item__content {
  width: 100%;
}

.scenario-header .selects .el-select,
.case-header .selects .el-select {
  height: 35px;
  width: 100%;
}

.scenario-header .buttons {
  height: 35px;
  width: 40%;
  margin: 0;
  margin-left: -4px;
}

.case-header .buttons {
  height: 35px;
  width: 21%;
  margin: 0;
  margin-left: -4px;
}

.scenario-header .buttons .el-button,
.case-header .buttons .el-button {
  height: 35px;
  width: 100%;
  font-size: 13px;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  border-bottom-right-radius: 0;
  border-top: 0;
  border-right: 0;
  border-bottom: 1px solid #e4edf3;
  border-left: 1px solid #e4edf3;
}

.scenario-header .el-select input,
.case-header .el-select input {
  width: 100%;
  height: 35px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
  border: 0;
  border-bottom: 1px solid #e4edf3;
}

.step-result .el-radio+.el-radio {
  margin-left: 5px !important;
}

.step-result .el-radio__label {
  padding-left: 0;
}

.case-menu {
  width: 100%;
  height: 400px;
  overflow-y: auto;
  border: 1px solid #e4edf3;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 2px;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.tree-view {
  overflow-y: scroll;
  font-size: 13px;
}

.v-contextmenu {
  padding: 5px;
}

.v-contextmenu .v-contextmenu-item {
  padding: 8px 15px;
}

.scenario-row,
.scenario-row input {
  width: 100%;
  border: transparent;
  background-color: transparent;
}

.run-steps .el-table .cell .el-select .el-input__suffix {
  display: inline-block !important;
}

.run-steps .el-table .cell .el-select input {
  background-color: #fff;
  border-color: #e4edf3;
  color: #000;
}

.run-steps .el-alert {
  margin-bottom: 10px;
}

.submit-defect .el-form-item input {
  width: 150px;
}

.run-defect-d {
  width: 945px;
}

.run-defect-d .CodeMirror,
.run-defect-d textarea {
  min-height: 150px;
  max-height: 170px;
}

.run-defect-d .CodeMirror .CodeMirror-scroll {
  min-height: 150px;
  max-height: 170px;
  overflow: auto;
}

.ted-summary input {
  width: 415px !important;
}
</style>
