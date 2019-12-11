<template>
  <div id="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item><i class="iconfont icon-bug"></i> 测试管理</el-breadcrumb-item>
        <el-breadcrumb-item>测试计划</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <el-dialog :close-on-click-modal="modalClose" title="测试任务纳入" :visible.sync="showTestMissionAdd" width="1070px"  :fullscreen="maximize1">
      <div slot="title">
        <span style="font-size:18px">测试任务纳入</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize1=!maximize1">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize1==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize1==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-checkbox size="mini" v-model="notPlanMissions.olnyCurrentRelease" border style="margin-bottom:5px">只展示当前版本相关需求的测试任务</el-checkbox>
      <div v-loading.lock="notPlanMissions.missionLoading" 
        element-loading-text="加载中..." 
        element-loading-spinner="el-icon-loading" 
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table :data="notPlanMissions.testMissions" max-height="400" stripe @selection-change="selectionChange" size="mini" :border="showBorder">
          <el-table-column type="selection" width="40" align="center">
          </el-table-column>
          <el-table-column prop="id" label="任务编号" width="80" align="center" sortable>
            <template slot-scope="scope">
              <el-tooltip content="点此产看更多测试任务信息" placement="right-end" effect="dark">
                <el-popover
                  placement="right-end"
                  width="400"
                  trigger="click">
                  <el-form size="mini" label-width="100px">
                    <el-form-item label="人力(人日)">
                      <el-input v-model="scope.row.manpower" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="拆分人">
                      <el-input v-model="scope.row.spliterName" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="任务参与人">
                      <span style="color:#3AB4D7;padding-left:15px">{{ getAssistant(scope.row.assistant) }}</span>
                    </el-form-item>
                  </el-form>
                    <span class="table-content-tips" slot="reference">{{scope.row.id}}</span>
                </el-popover>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="产品需求" header-align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <span class="table-content-tips" slot="reference" @click="toRequest(scope.row.reqId)">{{scope.row.reqId + " - " + scope.row.reqSummary}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="typeName" label="任务类型" width="110" align="center" sortable>
          </el-table-column>
          <el-table-column prop="statusName" label="任务状态" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="responserName" label="负责人" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="planBegin" label="计划开始" width="100" align="center" sortable>
          </el-table-column>
          <el-table-column prop="planTo" label="计划完成" width="100" align="center" sortable>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-set">
        <el-pagination 
          @size-change="handleSizeChange2" 
          @current-change="handleCurrentChange2" 
          :current-page="notPlanMissions.currentPage" 
          :page-sizes="[10, 20, 50, 100, 200]" 
          :page-size="notPlanMissions.pageSize" 
          layout="total, sizes, prev, pager, next, jumper" 
          :total="notPlanMissions.pageInfo.total">
        </el-pagination>
      </div>
      
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showTestMissionAdd=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="commitTestMissionAdd()" size="small">纳入计划</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="已纳入测试任务" :visible.sync="showMission" width="1070px" :fullscreen="maximize2">
      <div slot="title">
        <span style="font-size:18px">已纳入测试任务</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize2=!maximize2">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize2==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize2==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <div class="rcontent-form">
        <el-form :inline="true" size="mini" label-width="110px">
          <el-form-item style="float:right">
            <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="testMissionQuery()">刷新数据</el-button>
            <el-button v-no-more-click type="primary" icon="el-icon-circle-plus-outline" @click="testMissionAdd()">纳入测试任务</el-button>
          </el-form-item>
        </el-form>

        <div v-loading.lock="missionQuery.missionLoading" 
          element-loading-text="加载中..." 
          element-loading-spinner="el-icon-loading" 
          element-loading-background="rgba(0, 0, 0, 0.8)">
          <el-table :data="missionQuery.testMissions" max-height="400" stripe size="mini" :border="showBorder">
            <el-table-column prop="id" label="任务编号" width="80" align="center" sortable>
              <template slot-scope="scope">
                <el-tooltip content="点此产看更多测试任务信息" placement="right-end" effect="dark">
                  <el-popover
                    placement="right-end"
                    width="400"
                    trigger="click">
                    <el-form size="mini" label-width="100px">
                      <el-form-item label="人力(人日)">
                        <el-input v-model="scope.row.manpower" disabled></el-input>
                      </el-form-item>
                      <el-form-item label="拆分人">
                        <el-input v-model="scope.row.spliterName" disabled></el-input>
                      </el-form-item>
                      <el-form-item label="任务参与人">
                        <span style="color:#3AB4D7;padding-left:15px">{{ getAssistant(scope.row.assistant) }}</span>
                      </el-form-item>
                    </el-form>
                      <span class="table-content-tips" slot="reference">{{scope.row.id}}</span>
                  </el-popover>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="产品需求" header-align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                <span class="table-content-tips" slot="reference" @click="toRequest(scope.row.reqId)">{{scope.row.reqId + " - " + scope.row.reqSummary}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="typeName" label="任务类型" width="110" align="center" sortable>
            </el-table-column>
            <el-table-column prop="statusName" label="任务状态" width="90" align="center" sortable>
            </el-table-column>
            <el-table-column prop="responserName" label="负责人" width="90" align="center" sortable>
            </el-table-column>
            <el-table-column prop="planBegin" label="计划开始" width="100" align="center" sortable>
            </el-table-column>
            <el-table-column prop="planTo" label="计划完成" width="100" align="center" sortable>
            </el-table-column>
            <el-table-column width="60" align="center" label="操作">
              <template slot-scope="scope">
                <el-button v-no-more-click type="danger" size="mini" @click="removePlanMission(scope.row.id)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="page-set">
          <el-pagination 
            @size-change="handleSizeChange1" 
            @current-change="handleCurrentChange1" 
            :current-page="missionQuery.currentPage" 
            :page-sizes="[10, 20, 50, 100, 200]" 
            :page-size="missionQuery.pageSize" 
            layout="total, sizes, prev, pager, next, jumper" 
            :total="missionQuery.pageInfo.total">
          </el-pagination>
        </div>
      </div>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showMission=false" size="small">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="新建测试计划" :visible.sync="showDialog" width="1150px" :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">新建测试计划</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>

      <el-form :model="fmain" size="mini" :inline="true" :rules="fmainRules" ref="ruledFMain" class="plan-fform" label-width="110px">
        <el-form-item label="版本号" required class="normal" prop="release.selected">
          <el-select v-model="fmain.release.selected" placeholder="请选择" @change="checkUnique()" clearable>
            <el-option v-for="opt in fmain.release.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划类型" required class="normal" prop="planType">
          <el-select v-model="fmain.planType" placeholder="请选择" @change="checkUnique()" clearable>
            <el-option v-for="opt in planTypes" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划负责人" required class="normal" prop="responser">
          <el-select v-model="fmain.responser" placeholder="请选择" clearable filterable :filter-method="filterUsers1" @visible-change="resetFilterText">
            <el-option-group
              v-for="group in userOptions1"
              :key="group.label"
              :label="group.label">
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.name"
                :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="计划状态" required class="normal" prop="planStatus">
          <el-select v-model="fmain.planStatus" placeholder="请选择" disabled>
            <el-option v-for="opt in planStatus" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划开始日期" required class="normal" prop="planBegin">
          <el-date-picker type="date" @change="setPeriodDates(fmain)" v-model="fmain.planBegin" :value-format="datefmt" placeholder="请选择" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="计划结束日期" required class="normal" prop="planEnd">
          <el-date-picker type="date" @change="setPeriodDates(fmain)" v-model="fmain.planEnd" :value-format="datefmt" placeholder="请选择" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="进度报告点" class="lined" prop="rdates.resultStr">
          <el-input v-model="fmain.rdates.resultStr" placeholder="请先选择计划开始、结束日期" clearable @clear="clearSelect(fmain.rdates.selected)">
            <el-select v-model="fmain.rdates.selected" @change="setText(fmain)" slot="prepend" placeholder="请选择" clearable multiple collapse-tags>
              <el-option v-for="opt in fmain.rdates.opts" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>                
            </el-select>
            <el-button v-no-more-click slot="append" v-popover:dates>已选择</el-button>
          </el-input>
          <el-popover
            placement="top-start"
            title="进度报告日期点"
            ref="dates"
            width="200"
            trigger="click"
            :content="fmain.rdates.resultStr.replace(/,/g, '\n')">
          </el-popover>
        </el-form-item>
        <el-form-item label="邮件主送" required class="lined" prop="to.resultStr">
          <el-input v-model="fmain.to.resultStr" placeholder="多个收件人以英文半角逗号分隔" clearable @clear="clearSelect(fmain.to.selected)">
            <el-select v-model="fmain.to.selected" slot="prepend" @change="handleEmail(fmain.to);multiOptionsHandler2()" placeholder="请选择" clearable filterable multiple collapse-tags :filter-method="filterUsers2">
              <el-option-group
                v-for="group in userOptions2"
                :key="group.label"
                :label="group.label">
                <el-option
                  v-for="item in group.options"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value">
                  <span style="float:left">{{ item.name }}</span>
                  <span style="float:right;margin:0 10px;color:#9ca9c4">{{ item.account }}</span>
                </el-option>
              </el-option-group>
            </el-select>
            <el-button v-no-more-click slot="append" v-popover:emailto>已选择</el-button>
          </el-input>
          <el-popover
            placement="top-start"
            title="邮件主送人"
            ref="emailto"
            width="200"
            trigger="click"
            :content="fmain.to.resultStr.replace(/,/g, '\n')">
          </el-popover>
        </el-form-item>
        <el-form-item label="邮件抄送" class="lined" prop="cc.resultStr">
          <el-input v-model="fmain.cc.resultStr" placeholder="多个收件人以英文半角逗号分隔" clearable @clear="clearSelect(fmain.cc.selected)">
            <el-select v-model="fmain.cc.selected" slot="prepend" @change="handleEmail(fmain.cc);multiOptionsHandler3()" placeholder="请选择" clearable filterable multiple collapse-tags :filter-method="filterUsers3">
              <el-option-group
                v-for="group in userOptions3"
                :key="group.label"
                :label="group.label">
                <el-option
                  v-for="item in group.options"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value">
                  <span style="float:left">{{ item.name }}</span>
                  <span style="float:right;margin:0 10px;color:#9ca9c4">{{ item.account }}</span>
                </el-option>
              </el-option-group>
            </el-select>
            <el-button v-no-more-click slot="append" v-popover:emailcc>已选择</el-button>
          </el-input>
          <el-popover
            placement="top-start"
            title="邮件抄送人"
            ref="emailcc"
            width="200"
            trigger="click"
            :content="fmain.cc.resultStr.replace(/,/g, '\n')">
          </el-popover>
        </el-form-item>
        <br>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="resetForm('ruledFMain')" size="small">重置</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkSaveTestPlan('ruledFMain', fmain)" size="small" :disabled="btnDisabled">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="修改测试计划" :visible.sync="showDialogMod" width="1150px" :fullscreen="maximize3">
      <div slot="title">
        <span style="font-size:18px">修改测试计划</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize3=!maximize3">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize3==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize3==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form :model="cntRow" size="mini" :inline="true" :rules="fmainRules" ref="ruledCurrent" class="plan-fform" label-width="110px">
        <el-form-item label="版本号" required class="normal" prop="release.selected">
          <el-select v-model="cntRow.release.selected" placeholder="请选择" @change="checkUniqueMod(cntRow)" disabled>
            <el-option v-for="opt in fmain.release.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划类型" required class="normal" prop="planType">
          <el-select v-model="cntRow.planType" placeholder="请选择" @change="checkUniqueMod(cntRow)" disabled>
            <el-option v-for="opt in planTypes" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划负责人" required class="normal" prop="responser">
          <el-select v-model="cntRow.responser" placeholder="请选择" clearable filterable :filter-method="filterUsers4" @visible-change="resetFilterText">
            <el-option-group
              v-for="group in userOptions4"
              :key="group.label"
              :label="group.label">
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.name"
                :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="计划状态" required class="normal" prop="planStatus">
          <el-select v-model="cntRow.planStatus" placeholder="请选择">
            <el-option v-for="opt in planStatus" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划开始日期" required class="normal" prop="planBegin">
          <el-date-picker type="date" 
            @change="setPeriodDates(cntRow)" 
            v-model="cntRow.planBegin" 
            :value-format="datefmt" 
            placeholder="请选择" 
            style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="计划结束日期" required class="normal" prop="planEnd">
          <el-date-picker type="date" 
            @change="setPeriodDates(cntRow)" 
            v-model="cntRow.planEnd" 
            :value-format="datefmt" 
            placeholder="请选择" 
            style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="进度报告点" class="lined" prop="rdates.resultStr">
          <el-input v-model="cntRow.rdates.resultStr" placeholder="请先选择计划开始、结束日期" clearable @clear="clearSelect(cntRow.rdates.selected)">
            <el-select v-model="cntRow.rdates.selected" @change="setText(cntRow)" slot="prepend" placeholder="请选择" clearable multiple collapse-tags>
              <el-option v-for="opt in cntRow.rdates.opts" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>                
            </el-select>
            <el-button v-no-more-click slot="append" v-popover:datese>已选择</el-button>
          </el-input>
          <el-popover
            placement="top-start"
            title="进度报告日期点"
            ref="datese"
            width="200"
            trigger="click"
            :content="isEmpty(cntRow.rdates.resultStr.resultStr) ? '' : cntRow.rdates.resultStr.replace(/,/g, '/')">
          </el-popover>
        </el-form-item>
        <el-form-item label="邮件主送" required class="lined" prop="to.resultStr">
          <el-input v-model="cntRow.to.resultStr" placeholder="多个收件人以英文半角逗号分隔" clearable @clear="clearSelect(cntRow.to.selected)">
            <el-select v-model="cntRow.to.selected" slot="prepend" @change="handleEmail(cntRow.to);multiOptionsHandler5()" placeholder="请选择" clearable filterable multiple collapse-tags :filter-method="filterUsers5">
              <el-option-group
                v-for="group in userOptions5"
                :key="group.label"
                :label="group.label">
                <el-option
                  v-for="item in group.options"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value">
                  <span style="float:left">{{ item.name }}</span>
                  <span style="float:right;margin:0 10px;color:#9ca9c4">{{ item.account }}</span>
                </el-option>
              </el-option-group>
            </el-select>
            <el-button v-no-more-click slot="append" v-popover:emailtoe>已选择</el-button>
          </el-input>
          <el-popover
            placement="top-start"
            title="邮件主送人"
            ref="emailtoe"
            width="200"
            trigger="click"
            :content="isEmpty(cntRow.to.resultStr) ? '' : cntRow.to.resultStr.replace(/,/g, '\n')">
          </el-popover>
        </el-form-item>
        <el-form-item label="邮件抄送" class="lined" prop="cc.resultStr">
          <el-input v-model="cntRow.cc.resultStr" placeholder="多个收件人以英文半角逗号分隔" clearable @clear="clearSelect(cntRow.cc.selected)">
            <el-select v-model="cntRow.cc.selected" slot="prepend" @change="handleEmail(cntRow.cc);multiOptionsHandler6()" placeholder="请选择" clearable filterable multiple collapse-tags :filter-method="filterUsers6">
              <el-option-group
                v-for="group in userOptions6"
                :key="group.label"
                :label="group.label">
                <el-option
                  v-for="item in group.options"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value">
                  <span style="float:left">{{ item.name }}</span>
                  <span style="float:right;margin:0 10px;color:#9ca9c4">{{ item.account }}</span>
                </el-option>
              </el-option-group>     
            </el-select>
            <el-button v-no-more-click slot="append" v-popover:emailcce>已选择</el-button>
          </el-input>
          <el-popover
            placement="top-start"
            title="邮件抄送人"
            ref="emailcce"
            width="200"
            trigger="click"
            :content="isEmpty(cntRow.cc.resultStr) ? '' : cntRow.cc.resultStr.replace(/,/g, '\n')">
          </el-popover>
        </el-form-item>
        <br>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialogMod=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkSaveTestPlanEdit('ruledCurrent', cntRow)" size="small" :disabled="btnDisabledMod">保存</el-button>
      </div>
    </el-dialog>

    <div class="plan-main">
      <el-form ref="form" :model="pmain" :inline="true" size="mini" class="plan-form" label-width="120px" @keydown.native.enter="testPlanQuery()">
        <el-form-item label="计划版本">
          <el-select v-model="pmain.release.selected" placeholder="请选择" clearable>
            <el-option v-for="opt in pmain.release.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-checkbox size="mini" v-model="pmain.hideClosed" @change="releaseQuery()" border>隐藏已关闭版本</el-checkbox>
        </el-form-item>
        <el-form-item label="计划类型">
          <el-select v-model="pmain.planType" placeholder="请选择" filterable clearable>
            <el-option v-for="opt in planTypes" :value="opt.value" :key="opt.value" :label="opt.label" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划负责人">
          <el-select v-model="pmain.responser" placeholder="请选择" filterable clearable :filter-method="filterUsers" @visible-change="resetFilterText">
            <el-option-group
              v-for="group in userOptions"
              :key="group.label"
              :label="group.label">
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.name"
                :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item label="计划状态">
          <el-select v-model="pmain.planStatus" placeholder="请选择" filterable clearable>
            <el-option v-for="opt in planStatus" :value="opt.value" :key="opt.value" :label="opt.label" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划起止日期">
          <el-date-picker 
            v-model="pmain.planedDate" 
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
          <el-button v-no-more-click type="primary"  icon="el-icon-circle-plus-outline" @click="showDialog=true">新建测试计划</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="testPlanQuery()">计划查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="dataRevert" :max-height="baseHeight" size="mini" stripe :border="showBorder" ref="tplanTable">
        <el-table-column prop="relCode" label="版本号" min-width="140" align="center" sortable>
        </el-table-column>
        <el-table-column prop="typeName" label="计划类型" min-width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="statusName" label="计划状态" min-width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="planBegin" label="计划开始日期" align="center" min-width="120" sortable>
        </el-table-column>
        <el-table-column prop="planEnd" label="计划结束日期" align="center" min-width="120" sortable>
          <template slot="header" slot-scope="slot">
            <el-tooltip content="计划结束日期小于当日且未关闭，数据为橙色" placement="left" effect="dark">
              <span>计划结束日期</span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <div v-html="scope.row.planEndHtml"></div>
          </template>
        </el-table-column>
        <el-table-column label="报告日期点" min-width="90" align="center">
          <template slot-scope="scope">
            <el-popover trigger="click" 
              placement="top-start" 
              title="测试进度报告发送日期点" 
              :content="(null === scope.row.reportDates) ? '' : scope.row.reportDates.replace(/,/g, '/')" 
              width="200">
              <el-button v-no-more-click type="text" size="mini" slot="reference">点击查看</el-button>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="报告主送" min-width="90" align="center">
          <template slot-scope="scope">
            <el-popover trigger="click" 
              placement="top-start" 
              title="测试报告邮件主送清单" 
              :content="(null === scope.row.emailTo) ? '' : scope.row.emailTo.replace(/,/g, '\n')" 
              width="200">
              <el-button v-no-more-click type="text" size="mini" slot="reference">点击查看</el-button>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="报告抄送" min-width="90" align="center">
          <template slot-scope="scope">
            <el-popover trigger="click" 
              placement="top-start" 
              title="测试报告邮件抄送清单" 
              :content="(null === scope.row.emailCc) ? '' : scope.row.emailCc.replace(/,/g, '\n')" 
              ref="cc" 
              width="200">
              <el-button v-no-more-click type="text" size="mini" slot="reference">点击查看</el-button>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column type="expand" label="更多" width="60">
          <template slot-scope="scope">
            <el-form label-position="right" inline class="sepp-table-expand" size="mini">
              <el-form-item label="计划创建人">
                <el-input v-model="scope.row.submitterName" disabled></el-input>
              </el-form-item>
              <el-form-item label="计划负责人">
                <el-input v-model="scope.row.responserName" disabled></el-input>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column width="200" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="primary" size="mini" @click="showMissions(scope.row)">测试任务</el-button>
            <el-button v-no-more-click type="warning" size="mini" @click="editDetail(scope.row)" >编辑</el-button>
            <el-button v-no-more-click type="danger" size="mini" @click="deteleConfirm(scope.row.id)">删除</el-button>
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
        <el-button type="primary" 
          class="el-icon-download export-btn" 
          size="mini"
          :disabled="tableData.length == 0"
          plain
          @click="exportCSV('测试计划清单数据', 'tplanTable')">
          导出CSV
        </el-button>
        <div class="export-tips">导出CSV文件请使用<span>新版本</span>MS Office或者WPS表格工具打开</div>
      </div>
    </div>
  </div>
</template>

<script>
import { dateFormat, pickOptions } from "@/util/date.js";
import commonQuery from "@/components/util/CommonQuery.vue";
import TableExport from '@/util/TableExport.js'
const emailPartern = /^((([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6}\,))*(([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})))$/;
export default {
  data: function() {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      tableData: [],
      pageInfo: {},
      maximize: false,
      maximize1: false,
      maximize2: false,
      maximize3: false,
      showMission: false,
      showTestMissionAdd: false,
      missionQuery: {
        testMissions: [],
        missionLoading: false,
        pageInfo: {},
        planId: "",
        tmType: "",
        currentPage: 1,
        pageSize: parseInt(sessionStorage.tablePageSize) || 10
      },
      notPlanMissions: {
        testMissions: [],
        missionLoading: false,
        olnyCurrentRelease: true,
        currentRelReqs: [],
        pageInfo: {},
        planId: "",
        tmType: "",
        tms: [],
        currentPage: 1,
        pageSize: parseInt(sessionStorage.tablePageSize) || 10
      },
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      btnDisabled: false,
      btnDisabledMod: false,
      baseHeight: "",
      planTypes: [],
      pmain: {
        planType: "",
        hideClosed: true,
        release: {
          selected: "",
          opts: []
        },
        planedDate: [],
        responser: "",
        planStatus: 1
      },
      planStatus:  [
        { value: 0, label: "关闭" },
        { value: 1, label: "打开" }
      ],
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false, 
      showDialog: false,
      showDialogMod: false,
      memberFull: [],
      userOptions: [],
      userOptions1: [],
      userOptions2: [],
      userOptions3: [],
      userOptions4: [],
      userOptions5: [],
      userOptions6: [],
      members: [],
      fmain: {
        id: "",
        planType: "",
        release: {
          selected: "",
          opts: []
        },
        submitter: "",
        responser: "",
        planStatus: 1,
        planBegin: "",
        planEnd: "",
        rdates: {
          selected: [],
          resultStr: "",
          opts: []
        },
        reportDates: "",
        to: {
          resultStr: "",
          selected: [],
          opts: []
        },
        cc: {
          resultStr: "",
          selected: [],
          opts: []
        }
      },
      fmainRules:{
        'release.selected': [{ required: true, message: '请选择版本号', trigger: 'change' }],
        'planType': [{ required: true, message: '请选择测试计划类型', trigger: 'change' }],
        responser: [{ required: true, message: '请选择测试计划负责人', trigger: 'change'}],
        planBegin: [{ type: 'string', required: true, message: '请选择计划开始日期', trigger: 'blur' }],
        planEnd: [{ type: 'string', required: true, message: '请选择计划结束日期', trigger: 'blur' }],
        'to.resultStr': [{ type: 'string', required: true, message: '请输入正确的邮件地址，以英文半角逗号分隔', trigger: 'blur' }]
      },
      cntRow: {
        planType: "",
        release: {
          selected: "",
          opts: []
        },
        submitter: "",
        responser: "",
        planStatus: "",
        planBegin: "",
        planEnd: "",
        rdates: {
          selected: [],
          resultStr: "",
          opts: []
        },
        reportDates: "",
        to: {
          resultStr: "",
          selected: [],
          opts: []
        },
        cc: {
          resultStr: "",
          selected: [],
          opts: []
        }
      }
    };
  },

  watch: {
    showDialog: function() {
      if (this.showDialog) {
        this.fmain.rdates.opts.splice(0, this.fmain.rdates.opts.length);
        this.fmain.to.selected.splice(0, this.fmain.to.selected.length);
        this.fmain.cc.selected.splice(0, this.fmain.cc.selected.length);
        this.fmain.rdates.selected.splice(0, this.fmain.rdates.selected.length);
        this.fmain.planType = "";
        this.fmain.release.selected = "";
        this.fmain.responser = "";
        this.fmain.planStatus = 1;
        this.fmain.rdates.resultStr = "";
        this.fmain.planBegin = "";
        this.fmain.planEnd = "";
        this.fmain.to.resultStr = "";
        this.fmain.cc.resultStr = "";
      }
    },

    'notPlanMissions.olnyCurrentRelease': function() {
      if (this.notPlanMissions.olnyCurrentRelease == true) {
        this.relReqQuery();
      } else {
        this.notPlanMissionsQuery();
      }
    },
    
    pmain: {
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
        this.testPlanQuery();
      }
    }
  },

  created() {
    let dayS = new Date();
    dayS.setTime(dayS.getTime() - 3600 * 1000 * 24 * 90);
    this.pmain.planedDate.push(dateFormat(new Date(dayS),this.datefmt));
    let dayE = new Date();
    dayE.setTime(dayE.getTime() + 3600 * 1000 * 24 * 90);
    this.pmain.planedDate.push(dateFormat(new Date(dayE), this.datefmt));

    this.planTypes.splice(0, this.planTypes.length);
    let testPeriod = localStorage.getItem("testPeriod");
    eval(testPeriod).forEach(item => {
      this.planTypes.push({
        value: item.periodId,
        label: item.periodName
      });
    });

    this.releaseQuery();
    this.memberQuery(this.testPlanQuery);

    this.baseHeight = bodyAviHeightNTab - 70 - 45;
  },

  computed: {
    dataRevert() {
      for (let i = 0, datas = this.tableData; i < datas.length; i++) {
        let now = new Date(dateFormat(new Date(), this.datefmt) + " 00:00:00").getTime();
        let planEnd = new Date(datas[i].planEnd + " 00:00:00").getTime();
        if ((planEnd - now) < 0  && datas[i].planStatus > 0) {
          this.$set(datas[i], "planEndHtml", "<span style='color:orange;font-weight:500'>"+ datas[i].planEnd + "</span>");
        } else {
          this.$set(datas[i], "planEndHtml", "<span style='color:#606266'>"+ datas[i].planEnd + "</span>");
        }
        this.tableData.splice(i, 1, datas[i]);
      }
      return this.tableData;
    }
  },

  methods: {
    resetFilterText(){
      let _self =  this;
      _self.userOptions = _self.memberFull;
      _self.userOptions1 = _self.memberFull;
      _self.userOptions4 = _self.memberFull;
    },

    multiOptionsHandler6(){
      let _self =  this;
      const selected = _self.cntRow.cc.selected.concat([]);
      _self.cntRow.cc.selected.splice(0, _self.cntRow.cc.selected.length);
      _self.$nextTick(_ => {
        _self.userOptions6 = _self.memberFull;
        selected.forEach(d => {
          _self.cntRow.cc.selected.push(d);
        });
      });
    },

    multiOptionsHandler5(){
      let _self =  this;
      const selected = _self.cntRow.to.selected.concat([]);
      _self.cntRow.to.selected.splice(0, _self.cntRow.to.selected.length);
      _self.$nextTick(_ => {
        _self.userOptions5 = _self.memberFull;
        selected.forEach(d => {
          _self.cntRow.to.selected.push(d);
        });
      });
    },

    multiOptionsHandler3(){
      let _self =  this;
      const selected = _self.fmain.cc.selected.concat([]);
      _self.fmain.cc.selected.splice(0, _self.fmain.cc.selected.length);
      _self.$nextTick(_ => {
        _self.userOptions3 = _self.memberFull;
        selected.forEach(d => {
          _self.fmain.cc.selected.push(d);
        });
      });
    },

    multiOptionsHandler2(){
      let _self =  this;
      const selected = _self.fmain.to.selected.concat([]);
      _self.fmain.to.selected.splice(0, _self.fmain.to.selected.length);
      _self.$nextTick(_ => {
        _self.userOptions2 = _self.memberFull;
        selected.forEach(d => {
          _self.fmain.to.selected.push(d);
        });
      });
    },

    filterUsers(val) {
      let _self =  this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers1(val) {
      let _self =  this;
      _self.userOptions1 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers2(val) {
      let _self =  this;
      _self.userOptions2 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers3(val) {
      let _self =  this;
      _self.userOptions3 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers4(val) {
      let _self =  this;
      _self.userOptions4 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers5(val) {
      let _self =  this;
      _self.userOptions5 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers6(val) {
      let _self =  this;
      _self.userOptions6 = commonQuery.pickListFilter(val, _self.memberFull);
    },
    
    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.testPlanQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.testPlanQuery();
    },

    handleCurrentChange1(current) {
      this.missionQuery.currentPage = current;
      this.testMissionQuery();
    },

    handleSizeChange1(size) {
      this.missionQuery.pageSize = size;
      this.testMissionQuery();
    },

    handleCurrentChange2(current) {
      this.notPlanMissions.currentPage = current;
      this.notPlanMissionsQuery();
    },

    handleSizeChange2(size) {
      this.notPlanMissions.pageSize = size;
      this.notPlanMissionsQuery();
    },

    selectionChange(val) {
      this.notPlanMissions.tms = val;
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    showMissions(data){
      let _self =  this;
      _self.showMission = true;
      _self.missionQuery.relId = data.relId;
      _self.missionQuery.planId = data.id;
      _self.missionQuery.type = data.planType;
      _self.testMissionQuery();
    },

    testMissionAdd(){
      let _self =  this;
      _self.showTestMissionAdd = true;
      _self.notPlanMissions.olnyCurrentRelease = true;
      _self.relReqQuery();
    },

    toRequest(id){
      this.showTestMissionAdd = false;
      this.showMission = false;
      this.$router.push({
        name: "request",        
        params: {
          id: id
        }
      });
    },

    commitTestMissionAdd(){
      let _self =  this;
      if (!_self.notPlanMissions.tms || _self.notPlanMissions.tms.length == 0) {
        _self.$message.warning("没有选中任何记录！");
        return;
      }
      let ids = [];
      _self.notPlanMissions.tms.forEach(item => {
        ids.push(item.id);
      });
      _self.testMissionPlanUpdate(ids, _self.missionQuery.planId, _self.missionQuery.type);
      _self.showTestMissionAdd = false;
    },

    testMissionQuery() {
      let _self =  this;
      _self.missionQuery.missionLoading = true;
      _self.$axios({
          method: "post",
          url: "/tms/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            planId: _self.missionQuery.planId,
            type: _self.missionQuery.type,
            pageNum: _self.missionQuery.currentPage,
            pageSize: _self.missionQuery.pageSize
          }
        })
        .then(function(res) {
          _self.missionQuery.testMissions = eval(res.data.list);
          _self.missionQuery.pageInfo = res.data;
          setTimeout(() => {
            _self.missionQuery.missionLoading = false;
          }, 200);
        })
        .catch(function(response) {
          console.log(response);
          _self.missionQuery.missionLoading = false;
        });
    },

    notPlanMissionsQuery() {
      let _self =  this;
      let qryParams = {
        type: _self.missionQuery.type,
        pageNum: _self.notPlanMissions.currentPage,
        pageSize: _self.notPlanMissions.pageSize
      };
      if (_self.notPlanMissions.olnyCurrentRelease == true) {
        qryParams = {
          relId: _self.missionQuery.relId,
          type: _self.missionQuery.type,
          pageNum: _self.notPlanMissions.currentPage,
          pageSize: _self.notPlanMissions.pageSize
        };
      }
      _self.notPlanMissions.missionLoading = true;
      _self.$axios({
          method: "post",
          url: "/tms/nrel_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: qryParams
        })
        .then(function(res) {
          _self.notPlanMissions.testMissions = eval(res.data.list);
          _self.notPlanMissions.pageInfo = res.data;
          setTimeout(() => {
            _self.notPlanMissions.missionLoading = false;
          }, 200);
        })
        .catch(function(response) {
          console.log(response);
          _self.notPlanMissions.missionLoading = false;
        });
    },

    testMissionPlanUpdate(ids, planId, type){
      let _self =  this;
      _self.$axios.post("/tms/plan_update", {
        ids: ids.toString(),
        planId: planId,
        type: type
      })
      .then(function(res) {
        let operMark = -1 == planId ? "移除" : "纳入";
        if (res.data > 0) {
          _self.$message.success(operMark + "测试任务成功！");
          _self.testMissionQuery();
        } else {
          _self.$message.warning(operMark + "测试任务失败！");
        }
      })
    },

    removePlanMission(id){
      let _self =  this;
      _self.$confirm("移除该测试任务吗?", "操作确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
      .then(() => {
        _self.testMissionPlanUpdate(id, -1, -1);
      })
      .catch(() => {});
    },

    relReqQuery(){
      let _self =  this;
      _self.$axios.post("/req/rel_query/" + _self.missionQuery.relId + "/1/500")
      .then(function(res) {
        _self.notPlanMissions.currentRelReqs  = eval(res.data.list);
        _self.$nextTick(() => {
          _self.notPlanMissionsQuery();
        });
      })
    },

    getAssistant(tmAssistant) {
      let _self =  this;
      let result = [];
      if (null == tmAssistant || tmAssistant == "") {
        return "无";
      }
      let tmAssists = tmAssistant.split(",");
      tmAssists.forEach(item => {
        let assistant = _self.members.find(d => {
          return d.value == item;
        });
        if (assistant) {
          result.push(assistant.label);
        }
      });
      if (result.length > 1) {
        return result.toString().replace(/,/g ,"，");
      } else {
        return result.toString();
      }
    },

    editDetail(data) {
      let _self =  this;
      _self.showDialogMod = true;
      _self.cntRow.id = data.id;

      _self.cntRow.planStatus = data.planStatus;
      _self.cntRow.planType = data.planType;
      _self.cntRow.responser = data.responser;
      _self.cntRow.release.selected = data.relId;
      _self.cntRow.rdates.resultStr = data.reportDates;
      _self.cntRow.planBegin = data.planBegin;
      _self.cntRow.planEnd = data.planEnd;
      _self.cntRow.to.resultStr = data.emailTo;
      _self.cntRow.cc.resultStr = data.emailCc;

      _self.cntRow.rdates.opts.splice(0, _self.cntRow.rdates.opts.length);
      _self.setPeriodDates(_self.cntRow);
      
      _self.cntRow.rdates.selected.splice(0, _self.cntRow.rdates.selected.length);
      if (null != data.reportDates && data.reportDates != "") {
        let reportDatesArr = data.reportDates.split(",");
        reportDatesArr.forEach(item => {
          _self.cntRow.rdates.selected.push(item);
        });
      }

      let all = _self.memberFull;
      _self.cntRow.to.selected.splice(0, _self.cntRow.to.selected.length);
      if (null != data.emailTo && data.emailTo != "") {
        let toArr = data.emailTo.split(",");
        toArr.forEach(item => {
          for (let j = 0; j < all.length; j++) {
            for (let k = 0, option = all[j].options; k < option.length; k++) {
              if (item.toLowerCase() == option[k].email.toLowerCase()) {
                _self.cntRow.to.selected.push(option[k].value);
              }
            }
          }
        });
      }

      _self.cntRow.cc.selected.splice(0, _self.cntRow.cc.selected.length);
      if (null != data.emailCc && data.emailCc != "") {
        let ccArr = data.emailCc.split(",");
        ccArr.forEach(item => {
          for (let j = 0; j < all.length; j++) {
            for (let k = 0, option = all[j].options; k < option.length; k++) {
              if (item.toLowerCase() == option[k].email.toLowerCase()) {
                _self.cntRow.cc.selected.push(option[k].value);
              }
            }
          }
        });
      }
    },

     clearSelect(selected){
       selected.splice(0, selected.length);
     },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    checkSaveTestPlan(formName, objName){
      let _self =  this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          if (
            !emailPartern.test(objName.to.resultStr) ||
            (objName.cc.resultStr &&
              !emailPartern.test(objName.cc.resultStr))
          ) {
            _self.$message.warning("邮件地址格式校验不通过！");
            return;
          }
          _self.saveTestPlan();
        }
      });
    },

    checkSaveTestPlanEdit(formName, objName){
      let _self =  this;
      if (!emailPartern.test(objName.to.resultStr) || (objName.cc.resultStr && !emailPartern.test(objName.cc.resultStr))) {
        _self.$message.warning("邮件地址格式校验不通过！");
        return;
      }

      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.saveTestPlanEdit();
        }
      });
    },

    checkUnique() {
      for (let i = 0; i < this.tableData.length; i++) {
        if (
          this.tableData[i].relId === this.fmain.release.selected &&
          this.tableData[i].planType === this.fmain.planType
        ) {
          this.btnDisabled = true;
          this.$message.info("已存在该版本和计划数据");
          break;
        } else {
          this.btnDisabled = false;
        }
      }
    },

    checkUniqueMod(d) {
      for (let i = 0; i < this.tableData.length; i++) {
        if (
          this.tableData[i].relId === d.release.selected &&
          this.tableData[i].planType === d.planType && 
          this.tableData[i].id != d.id
        ) {
          this.$message.info("已存在该版本和计划数据");
          this.btnDisabledMod = true;
          return;
        } else {
          this.btnDisabledMod = false;
        }
      }
    },

    isEmpty(d) {
      return commonQuery.isNull(d);
    },

    setText(objName) {
      objName.rdates.resultStr = objName.rdates.selected.toString();
    },

    setPeriodDates(objName) {
      let _self =  this;
      let strDateBegin = [];
      let strDateEnd = [];

      if (
        commonQuery.isNull(objName.planBegin) &&
        commonQuery.isNull(objName.planEnd)
      ) {
        this.$message.info("请先选择计划开始、结束日期");
        return;
      } else if (
        commonQuery.isNull(objName.planBegin) &&
        !commonQuery.isNull(objName.planEnd)
      ) {
        strDateEnd = objName.planEnd.split("-");
        strDateBegin = strDateEnd;
      } else if (
        !commonQuery.isNull(objName.planBegin) &&
        commonQuery.isNull(objName.planEnd)
      ) {
        strDateBegin = objName.planBegin.split("-");
        strDateEnd = strDateBegin;
      } else {
        strDateBegin = objName.planBegin.split("-");
        strDateEnd = objName.planEnd.split("-");
      }

      let dateS = new Date(strDateBegin[0], strDateBegin[1] - 1, strDateBegin[2]);
      let dateE = new Date(strDateEnd[0], strDateEnd[1] - 1, strDateEnd[2]);
      if (dateE < dateS) {
        this.$message.info("【开始日期】不能大于【结束日期】");
        return;
      }
      let date = dateS;
      let strDate;
      objName.rdates.opts.splice(0, objName.rdates.opts.length);
      while (date <= dateE) {
        strDate = dateFormat(date, _self.datefmt);
        objName.rdates.opts.push({
          value: strDate,
          label: strDate,
          disabled: date.getDay() === 0 || date.getDay() === 6
        });
        date.setTime(date.getTime() + 3600 * 1000 * 24);
      }
    },

    handleEmail(data) {
      let _self =  this;
      let all = _self.memberFull;
      let selected = data.selected || [];
      let result = [];
      result.splice(0, result.length);
      for (let i = 0; i < selected.length; i++) {
        for (let j = 0; j < all.length; j++) {
          for (let k = 0, option = all[j].options; k < option.length; k++) {
            if (selected[i] === option[k].value) {
              result.push(option[k].email.toLowerCase());
            }
          }
        }
      }
      data.resultStr = result.toString();
    },

    saveTestPlan() {
      let _self =  this;
      _self.$axios.post("/plan/create", {
        relId: _self.fmain.release.selected,
        planType: _self.fmain.planType,
        submitter: sessionStorage.userId,
        planStatus: _self.fmain.planStatus,
        responser: _self.fmain.responser,
        planBegin: _self.fmain.planBegin,
        planEnd: _self.fmain.planEnd,
        reportDates: _self.fmain.rdates.selected.toString(),
        emailTo: _self.fmain.to.resultStr,
        emailCc: _self.fmain.cc.resultStr
      })
      .then(function(res) {
        if (res.data > 0) {
          _self.showDialog = false;
          _self.$message.success("保存成功！");
          _self.testPlanQuery();
        } else {
          _self.$notify.error("保存失败！");
          console.log(res);
        }
      })
    },

    saveTestPlanEdit() {
      let _self =  this;
      _self.$axios.post("/plan/update", {
        id: _self.cntRow.id,
        relId: _self.cntRow.release.selected,
        planType: _self.cntRow.planType,
        submitter: sessionStorage.userId,
        planStatus: _self.cntRow.planStatus,
        responser: _self.cntRow.responser,
        planBegin: _self.cntRow.planBegin,
        planEnd: _self.cntRow.planEnd,
        reportDates: _self.cntRow.rdates.resultStr,
        emailTo: _self.cntRow.to.resultStr,
        emailCc: _self.cntRow.cc.resultStr
      })
      .then(function(res) {
        if ((res.data = 1)) {
          _self.showDialogMod = false;
          _self.$message.success("修改成功！");
          _self.testPlanQuery();
          
          if (_self.cntRow.planStatus == 0 && commonQuery.roleAllow([0, 4, 6])) {
            _self.$confirm("是否同步关闭所有下属测试任务？", "请谨慎操作！", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
            .then(() => {
              _self.closePlanMission(_self.cntRow.id);
            })
          }
        } else {
          _self.$notify.error("修改失败");
          console.log(res);
        }
      })
    },

    closePlanMission(planId) {
      let _self =  this;
      _self.$axios.post("/plan/tms_close/" + planId)
      .then(function(res) {
        if (res.data > 0) {
          _self.$message.success("同步关闭计划下测试任务成功！");
        } else {
          _self.$message.info("未纳入任务或任务已被提前关闭！");
        }
      })
    },

    deteleConfirm(id) {
      this.$confirm("确定要删除当前记录吗?", "操作确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      })
        .then(() => {
          this.deleteTestPlan(id);
        })
        .catch(() => {});
    },

    deleteTestPlan(id) {
      let _self =  this;
      _self.$axios.post("/plan/delete/" + id)
      .then(function(res) {
        if ((res.data = 1)) {
          _self.$message.success("删除成功！");
          _self.testPlanQuery();
        } else {
          _self.$notify.error("删除失败");
          console.log(res);
        }
      })
    },

    releaseQuery() {
      let _self =  this;
      _self.pmain.release.opts.splice(0, _self.pmain.release.opts.length);
      _self.fmain.release.opts.splice(0, _self.fmain.release.opts.length);
      if (_self.pmain.hideClosed == true) {
        commonQuery.openRelQuery((result) => {
          _self.pmain.release.opts = result.releasesWithBranch;
          _self.fmain.release.opts = result.releasesWithBranch;

          if (_self.$route.params.relId) {
            _self.pmain.release.selected = parseInt(_self.$route.params.relId);
            _self.pmain.planType = "";
            _self.pmain.responser = "";
            _self.pmain.planStatus = "";
          }
        })
      } else {
        commonQuery.releaseQuery((result) => {
          _self.pmain.release.opts = result.releasesWithBranch;
          _self.fmain.release.opts = result.releasesWithBranch;

          if (_self.$route.params.relId) {
            _self.pmain.release.selected = parseInt(_self.$route.params.relId);
            _self.pmain.planType = "";
            _self.pmain.responser = "";
            _self.pmain.planStatus = "";
          }
        })
      }
    },

    memberQuery(callback){
      let _self =  this;
      commonQuery.memberQuery((result) => {
        _self.members = result.users;
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        _self.userOptions1 = result.usersFull;
        _self.userOptions2 = result.usersFull;
        _self.userOptions3 = result.usersFull;
        _self.userOptions4 = result.usersFull;
        _self.userOptions5 = result.usersFull;
        _self.userOptions6 = result.usersFull;
        if (typeof callback == "function") {
          callback();
        }
      });
    },

    testPlanQuery() {
      let _self =  this;
      let planedDateBegin = "",
        planedDateEnd = "";
      if (_self.pmain.planedDate && _self.pmain.planedDate.length > 1) {
        planedDateBegin = _self.pmain.planedDate[0];
        planedDateEnd = _self.pmain.planedDate[1];
      }
      _self.$axios({
        method: "post",
        url: "/plan/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        params: {
          relId: _self.pmain.release.selected,
          planStatus: _self.pmain.planStatus,
          planType: _self.pmain.planType,
          responser: _self.pmain.responser,
          planedDateBegin: planedDateBegin,
          planedDateEnd: planedDateEnd,
          pageNum: _self.currentPage,
          pageSize: _self.pageSize
        }
      })
      .then(function(res) {
        _self.tableData = eval(res.data.list);
        _self.pageInfo = res.data;
        setTimeout(() => {
          _self.queryChanged = false;
        }, 200);
      })
    }
  }
};
</script>

<style>
.plan-main {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.plan-form .el-form-item .el-input,
.plan-form .el-form-item .el-select {
  width: 150px !important;
}

.plan-fform .el-select,
.plan-fform .normal .el-input {
  width: 250px !important;
}

.plan-fform .lined .el-input-group__prepend .el-select__tags{
  max-width: 228px !important;
}

.plan-fform .lined .el-input-group__prepend .el-select__tags input{
  max-width: 20px !important;
}

.plan-fform .lined .el-form-item__content>.el-input>input {
  width: 658px;
}

.plan-fform .lined .el-input-group__prepend {
  width: 208px !important;
}
</style>
