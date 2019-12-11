<template>
  <div class="release-main">
    <div class="crumbs">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item>
                <i class="iconfont icon-release"></i> 发布管理</el-breadcrumb-item>
            <el-breadcrumb-item>版本计划</el-breadcrumb-item>
        </el-breadcrumb>
    </div>

    <el-dialog :close-on-click-modal="modalClose" title="新建版本计划" :visible.sync="showDialog" width="960px":fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">新建版本计划</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form :model="relform" size="small" :rules="rFormRules" ref="ruledForm" :inline="true" label-width="110px" 
        v-loading="checking" 
        element-loading-text="校验中..." 
        element-loading-spinner="el-icon-loading" 
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-form-item label="版本分支" prop="productBranch" required>
          <el-select v-model="relform.productBranch" placeholder="请选择">
            <el-option v-for="opt in productBranchs" :value="opt.value" :key="opt.value" :label="opt.label" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本编号" prop="relCode" required>
          <el-input v-model="relform.relCode" placeholder="例如： 1.11.0" clearable>
            <template slot="prepend">{{relform.productCode}}</template>
          </el-input>
        </el-form-item>
        <br>
        <el-form-item label="负责人" prop="responser" required>
          <el-select v-model="relform.responser" placeholder="请选择" filterable clearable :filter-method="filterUsers2" @visible-change="resetFilterText">
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
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="需求确认日期" prop="reqConfirmDate">
          <el-date-picker type="date" v-model="relform.reqConfirmDate" :value-format="datefmt" placeholder="请选择" style="width: 100%;" clearable></el-date-picker>
        </el-form-item>
        <el-form-item label="计划发布日期" prop="relDate" required>
          <el-date-picker type="date" v-model="relform.relDate" :value-format="datefmt" placeholder="请选择" style="width: 100%;" clearable></el-date-picker>
        </el-form-item>
        <br>
        <el-form-item label="SIT开始日期" prop="sitBeginDate" required>
        <el-date-picker type="date" v-model="relform.sitBeginDate" :value-format="datefmt" placeholder="请选择" style="width: 100%;" clearable></el-date-picker>
        </el-form-item>
        <el-form-item label="UAT开始日期" prop="uatBeginDate" required>
          <el-date-picker type="date" v-model="relform.uatBeginDate" :value-format="datefmt" placeholder="请选择" style="width: 100%;" clearable></el-date-picker>
        </el-form-item>
        <el-form-item label="计划封版日期" prop="readyDate" required>
          <el-date-picker type="date" v-model="relform.readyDate" :value-format="datefmt" placeholder="请选择" style="width: 100%;" clearable></el-date-picker>
        </el-form-item>
        <br>
        <el-form-item label="部署环境" prop="environment" required>
          <el-checkbox-group v-model="relform.environment" :min="1">
            <el-checkbox v-for="opt in envType" :label="opt.value" :key="opt.value" border>{{opt.label}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="saveRelCreate('ruledForm')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="修改版本计划" :visible.sync="showDialogMod" width="960px" :fullscreen="maximize1">
      <div slot="title">
        <span style="font-size:18px">修改版本计划</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize1=!maximize1">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize1==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize1==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form :model="currentRel" size="small" :rules="rFormRulesMod" ref="ruledFormMod" :inline="true" label-width="110px">
        <el-form-item label="版本状态" prop="status" required>
          <el-select v-model="currentRel.status">
            <el-option v-for="opt in relStatus" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本分支">
          <el-select v-model="currentRel.productBranch">
            <el-option v-for="opt in productBranchs" :value="opt.value" :key="opt.value" :label="opt.label" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本编号" prop="relCode" required>
          <el-input v-model="currentRel.relCode" disabled></el-input>
        </el-form-item>
        <el-form-item label="实际发布日期" prop="relDateAct">
          <el-date-picker type="date" v-model="currentRel.relDateAct" :value-format="datefmt" placeholder="请选择" style="width: 100%;" clearable></el-date-picker>
        </el-form-item>
        <br>
        <el-form-item label="负责人" prop="responser" required>
          <el-select v-model="currentRel.responser" placeholder="请选择" filterable :filter-method="filterUsers3" @visible-change="resetFilterText">
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
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="需求确认日期" prop="reqConfirmDate">
          <el-date-picker type="date" v-model="currentRel.reqConfirmDate" :value-format="datefmt" placeholder="请选择" style="width: 100%;" clearable></el-date-picker>
        </el-form-item>
        <el-form-item label="计划发布日期" prop="relDate" required>
          <el-date-picker type="date" v-model="currentRel.relDate" :value-format="datefmt" placeholder="请选择" style="width: 100%;" clearable></el-date-picker>
        </el-form-item>
        <br>
        <el-form-item label="SIT开始日期" prop="sitBeginDate" required>
        <el-date-picker type="date" v-model="currentRel.sitBeginDate" :value-format="datefmt" placeholder="请选择" style="width: 100%;" clearable></el-date-picker>
        </el-form-item>
        <el-form-item label="UAT开始日期" prop="uatBeginDate" required>
          <el-date-picker type="date" v-model="currentRel.uatBeginDate" :value-format="datefmt" placeholder="请选择" style="width: 100%;" clearable></el-date-picker>
        </el-form-item>
        <el-form-item label="计划封版日期" prop="readyDate" required>
          <el-date-picker type="date" v-model="currentRel.readyDate" :value-format="datefmt" placeholder="请选择" style="width: 100%;" clearable></el-date-picker>
        </el-form-item>
        <br>
        <el-form-item label="部署环境" prop="environment" required>
          <el-checkbox-group v-model="currentRel.environment" :min="1">
            <el-checkbox v-for="opt in envType" :label="opt.value" :key="opt.value" border>{{opt.label}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialogMod=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkReleaseMod('ruledFormMod')" size="small">确定</el-button>
      </div>
    </el-dialog>
    
    <el-dialog :close-on-click-modal="modalClose" title="版本需求纳入" :visible.sync="showNotReleasedReq" width="1280px":fullscreen="maximize3">
      <div slot="title">
        <span style="font-size:18px">版本需求任务纳入</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize3=!maximize3">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize3==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize3==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-input 
        v-model="notReleasedReq.filterReqId" 
        @keydown.native.enter="filterOpenReqs()" 
        size="mini" 
        placeholder="请输入产品需求ID" 
        prefix-icon="el-icon-search"
        clearable
        style="display:inline-block;width:200px;margin-bottom:5px">
      </el-input>
      <el-checkbox size="small" v-model="notReleasedReq.olnyNotReleased" border  style="margin-bottom:5px">只查询未纳入版本需求</el-checkbox>
      <el-button v-no-more-click type="primary" size="small" @click="filterOpenReqs()" icon="el-icon-search"> 查询</el-button>
      <div v-loading.lock="openLoading"
        element-loading-text="加载中..." 
        element-loading-spinner="el-icon-loading" 
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table 
          :data="notReleasedReq.reqs" 
          max-height="400" 
          @selection-change="selectionChangeAdd" 
          ref="requirementTableAdd" 
          size="mini" 
          :border="showBorder">
          <el-table-column type="selection" width="40" align="center"></el-table-column>
          <el-table-column label="产品需求" header-align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{scope.row.id}} - {{scope.row.summary}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="relCode" label="所属版本" width="140" align="center">
          </el-table-column>
          <el-table-column label="SIT计划日期" width="130" align="center">
            <template slot-scope="scope">
              <el-date-picker size="mini" v-model="scope.row.sitDate" type="date" :value-format="datefmt" :clearable="false">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="UAT计划日期" width="130" align="center">
            <template slot-scope="scope">
              <el-date-picker size="mini" v-model="scope.row.uatDate" type="date" :value-format="datefmt" :clearable="false">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column prop="submitDate" label="提交日期" width="100" align="center">
          </el-table-column>
          <el-table-column prop="expectDate" label="期望完成日期" width="110" align="center">
          </el-table-column>
          <el-table-column prop="proderName" label="产品负责人" width="80" align="center">
          </el-table-column>
          <el-table-column prop="priorityName" label="紧急程度" width="80" align="center">
          </el-table-column>
        </el-table>
      </div>
      <div class="page-set">
        <el-pagination 
          @size-change="handleSizeChangeOpen" 
          @current-change="handleCurrentChangeOpen" 
          :current-page="notReleasedReq.pageNum" 
          :page-sizes="[10, 20, 50, 100, 200]" 
          :page-size="notReleasedReq.pageSize" 
          layout="total, sizes, prev, pager, next, jumper" 
          :total="notReleasedReq.pageInfo.total">
        </el-pagination>
      </div>
      
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showNotReleasedReq=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="releaseRequirement()" size="small" :disabled="openLoading">纳入版本</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="版本排期内容" :visible.sync="showReleasedReq" width="1280px" :fullscreen="maximize2">
      <div slot="title">
        <span style="font-size:18px">版本内容排期</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize2=!maximize2">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize2==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize2==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-button v-no-more-click type="primary" size="small" icon="el-icon-refresh" @click="relReqQuery(currentRelease.id)">刷新数据</el-button>
      <el-button v-no-more-click type="primary" size="small" icon="el-icon-circle-plus-outline" @click="notReleasedReqQuery()" 
        :disabled="currentRelease.planDisabled">纳入需求</el-button>
      
      <el-alert title="若需求已拆分开发任务或已关闭，则只能够挪入其他版本（通过其他版本的需求纳入操作），不可直接移出当前版本！" 
        type="warning" effect="dark" center show-icon :closable="false" style="margin:10px 0">
      </el-alert>

      <div v-loading.lock="reledLoading" style="margin-top:5px"
        element-loading-text="加载中..." 
        element-loading-spinner="el-icon-loading" 
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table :data="releasedReq.reqs" max-height="400" size="mini" stripe :border="showBorder" ref="reqTable" @selection-change="selectionChangeDel" >
          <el-table-column type="selection" width="40" align="center"></el-table-column>
          <el-table-column label="产品需求" header-align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{scope.row.id}} - {{scope.row.summary}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="submitDate" label="提交日期" width="100" align="center">
          </el-table-column>
          <el-table-column prop="expectDate" label="期望完成日期" width="110" align="center">
          </el-table-column>
          <el-table-column prop="sitDate" label="SIT计划日期" width="110" align="center">
          </el-table-column>
          <el-table-column prop="uatDate" label="UAT计划日期" width="110" align="center">
          </el-table-column>
          <el-table-column prop="proderName" label="产品负责人" width="80" align="center">
          </el-table-column>
          <el-table-column prop="statusName" label="需求状态" width="80" align="center">
          </el-table-column>
          <el-table-column prop="typeName" label="需求类型" width="80" align="center">
          </el-table-column>
          <el-table-column prop="priorityName" label="紧急程度" width="80" align="center">
          </el-table-column>
          <el-table-column prop="cmCount" label="任务数" width="50" align="center">
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template slot-scope="scope">
              <el-dropdown trigger="click" @command="handleCommand">
                <el-button type="text" size="small" @click="setCurrentRow(scope.row)">处理</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="toComplete" v-if="scope.row.showComplete" style="color:#6BBD6B">
                    <i class="el-icon-circle-check"></i>置为完成</el-dropdown-item>
                  <el-dropdown-item command="toClose" v-if="scope.row.showClose" style="color:#3AB4D7">
                    <i class="el-icon-circle-close"></i>置为关闭</el-dropdown-item>
                  <el-dropdown-item command="toRemove" v-if="scope.row.showRemove" style="color:#DEAF6C">
                    <i class="el-icon-document-remove"></i>移出版本</el-dropdown-item>
                  <el-dropdown-item command="toCopy" v-if="scope.row.showCopy" style="color:#EE6F6F">
                    <i class="el-icon-document-copy"></i>延期复制</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <div class="page-set">
          <el-pagination 
            @size-change="handleSizeChangeRelReq" 
            @current-change="handleCurrentChangeRelReq" 
            :current-page="releasedReq.pageNum" 
            :page-sizes="[10, 20, 50, 100, 200]" 
            :page-size="releasedReq.pageSize" 
            layout="total, sizes, prev, pager, next, jumper" 
            :total="releasedReq.pageInfo.total">
          </el-pagination>
        </div>
      </div>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showReleasedReq=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="unReleaseRequirement()" size="small" 
          :disabled="currentRelease.planDisabled">移出版本</el-button>
      </div>
    </el-dialog>

    <div class="release-from">
      <el-form :model="form" :inline="true" size="mini" label-width="110px" @keydown.native.enter="releaseQuery()">
        <el-form-item label="提交人">
          <el-select v-model="form.creator" placeholder="请选择" filterable clearable :disabled="form.queryDisabled" :filter-method="filterUsers" @visible-change="resetFilterText">
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
        <el-form-item label="负责人">
          <el-select v-model="form.responser" placeholder="请选择" filterable clearable :disabled="form.queryDisabled" :filter-method="filterUsers1" @visible-change="resetFilterText">
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
        <el-form-item label="版本编号">
          <el-input v-model="form.relCode" placeholder="版本编号" @blur="setQuery()" clearable></el-input>
        </el-form-item>
        <br>
        <el-form-item label="版本状态">
          <el-select v-model="form.status" placeholder="请选择" multiple collapse-tags filterable clearable :disabled="form.queryDisabled">
            <el-option v-for="opt in relStatus" :value="opt.value" :key="opt.value" :label="opt.label" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本分支">
          <el-select v-model="form.productBranch" placeholder="请选择" clearable :disabled="form.queryDisabled">
            <el-option v-for="opt in productBranchs" :value="opt.value" :key="opt.value" :label="opt.label" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发布日期">
          <el-date-picker 
            v-model="form.relDate" 
            type="daterange" 
            align="right" 
            unlink-panels 
            :value-format="datefmt" 
            range-separator="至" 
            start-placeholder="开始日期" 
            end-placeholder="结束日期" 
            :picker-options="pickOptions"
            :disabled="form.queryDisabled">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="float:right;">
          <el-button v-no-more-click type="primary"  icon="el-icon-circle-plus-outline" @click="showDialog=true">新建版本</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="releaseQuery()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" :max-height="tableHeight" size="mini" stripe :border="showBorder" ref="relTable"
          v-loading="queryLoading" 
          element-loading-text="查询中..." 
          element-loading-spinner="el-icon-loading" 
          element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column type="index" width="50" label="序号" align="center"></el-table-column>
        <el-table-column prop="relCode" label="版本编号" align="center" sortable>
        </el-table-column>
        <el-table-column prop="branchName" label="版本分支" width="110" align="center" sortable>
        </el-table-column>
        <el-table-column prop="creatorName" label="提交人" width="110" align="center" sortable>
        </el-table-column>
        <el-table-column prop="responserName" label="负责人" width="110" align="center" sortable>
        </el-table-column>
        <el-table-column prop="statusName" label="版本状态" width="110" align="center" sortable>
        </el-table-column>
        <el-table-column prop="createDate" label="创建日期" width="120" align="center" sortable>
        </el-table-column>
        <el-table-column prop="readyDate" label="计划封版日期" width="130" align="center" sortable>
        </el-table-column>
        <el-table-column prop="relDate" label="计划发布日期" width="130" align="center" sortable>
        </el-table-column>
        <el-table-column type="expand" label="更多信息" width="70">
          <template slot-scope="scope">
            <el-form label-position="right" inline class="sepp-table-expand" size="mini" label-width="120px">
              <el-form-item label="SIT开始日期">
                <el-input v-model="scope.row.sitBeginDate" disabled></el-input>
              </el-form-item>
              <el-form-item label="UAT开始日期">
                <el-input v-model="scope.row.uatBeginDate" disabled></el-input>
              </el-form-item>
              <el-form-item label="需求确认日期">
                <el-input v-model="scope.row.reqConfirmDate" disabled></el-input>
              </el-form-item>
              <br>
              <el-form-item label="实际发布日期">
                <el-input v-model="scope.row.relDateAct" disabled></el-input>
              </el-form-item>
              <el-form-item label="发布环境">
                <div class="env-formed">{{getEnvName(scope.row.environment)}} </div>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column  width="120px" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="warning" size="mini" @click="editRelease(scope.row)">编辑</el-button>
            <el-button v-no-more-click type="primary" size="mini" @click="toRContent(scope.row)">排期</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page-set">
        <el-pagination 
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange" 
          :current-page="pageNum" 
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
          @click="exportCSV('版本计划清单数据', 'relTable')">
          导出CSV
        </el-button>
        <div class="export-tips">导出CSV文件请使用<span>新版本</span>MS Office或者WPS表格工具打开</div>
      </div>
    </div>
  </div>
</template>

<script>
import commonQuery from "@/components/util/CommonQuery.vue";
import { dateFormat, pickOptions } from "@/util/date.js";
import TableExport from '@/util/TableExport.js'
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
      timefmt: defaultTimeFormat,
      datefmt: defaultDateFormat,
      queryLoading: false,
      checking: false,
      tableHeight: 0,
      member: [],
      memberFull: [],
      userOptions: [],
      userOptions1: [],
      userOptions2: [],
      userOptions3: [],
      form: {
        relCode: "",
        relDate: [],
        creator: "",
        productBranch: "",
        responser: "",
        status: [1,2,3,4,5,6],
        queryDisabled: false
      },
      pageNum: 1,
      relStatus: [],
      envType: [],
      reportTypes: [],
      testPeriod: [],
      productBranchs: [],
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      showDialog: false,
      showDialogMod: false,
      pickOptions: pickOptions,
      relform: {
        productCode: sessionStorage.productCode,
        relCode: "",
        productBranch: "",
        responser: "",
        status: 1,
        environment: [2, 3],
        creator: sessionStorage.userName,
        relDate: "",
        reqConfirmDate: null,
        sitBeginDate: null,
        uatBeginDate: null,
        readyDate: ""
      },
      releaseExists: false,
      rFormRules: {
        'responser': [{ required: true, message: '请选择负责人', trigger: 'change' }],
        'productBranch': [{ required: true, message: '请选择版本分支', trigger: 'change' }],
        'environment': [{ required: true, type: 'array', message: '请选择发布环境', trigger: 'change' }],
        'status': [{ required: true, message: '请选择版本状态', trigger: 'change' }],
        relCode: [
          { required: true, message: '请输入版本数字编号', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字', trigger: 'blur' }
        ],
        sitBeginDate: [{ type: 'string', required: true, message: '请选择SIT计划开始日期', trigger: 'change' }],
        uatBeginDate: [{ type: 'string', required: true, message: '请选择UAT计划开始日期', trigger: 'change' }],
        relDate: [{ type: 'string', required: true, message: '请选择计划发布日期', trigger: 'change' }],
        readyDate: [{ type: 'string', required: true, message: '请选择计划封版日期', trigger: 'change' }]
      },
      currentRel : {
        id: "",
        productCode: sessionStorage.productCode,
        relCode: "",
        productBranch: "",
        responser: "",
        status: "",
        environment: [],
        creator: sessionStorage.userName,
        relDate: "",
        reqConfirmDate: "",
        sitBeginDate: "",
        uatBeginDate: "",
        readyDate: "",
        relDateAct: ""
      },
      currentRelease: {
        id: "",
        status: "",
        environment: [],
        planDisabled: false
      },
      rFormRulesMod: {
        'environment': [{ required: true, type: 'array', message: '请选择发布环境', trigger: 'change' }],
        sitBeginDate: [{ type: 'string', required: true, message: '请选择SIT计划开始日期', trigger: 'change' }],
        uatBeginDate: [{ type: 'string', required: true, message: '请选择UAT计划开始日期', trigger: 'change' }],
        relDate: [{ type: 'string', required: true, message: '请选择计划发布日期', trigger: 'change' }],
        readyDate: [{ type: 'string', required: true, message: '请选择计划封版日期', trigger: 'change' }]
      },
      latestSitPlan: {},
      latestUatPlan: {},
      configedTesterResponser: "",
      configedProderResponser: "",

      planDisabled: false,
      showReleasedReq: false,
      reledLoading: false,
      releasedReq: {
        pageSize: parseInt(sessionStorage.tablePageSize) || 10,
        pageNum: 1,
        currentRow: {},
        reqs: [],
        selected: [],
        pageInfo: {}
      },

      showNotReleasedReq: false,
      openLoading: false,
      notReleasedReq: {
        pageSize: parseInt(sessionStorage.tablePageSize) || 10,
        pageNum: 1,
        filterReqId: "",
        olnyNotReleased: true,
        reqs: [],
        selected: [],
        pageInfo: {}
      }
    };
  },

  watch: {
    form: {
      handler() {
        this.pageNum = 1;
        this.queryChanged = true;
      },
      deep: true,
      immediate: true
    },

    'tableData.length': function (val) {
      if (val == 0) {
        this.pageNum = 1;
        this.releaseQuery();
      }
    }
  },

  created() {
    let _self =  this;
    _self.tableHeight = bodyAviHeightNTab - 70 - 45;
    
    let params = [];
    for (let p in _self.$route.params) {
      params.push(p);
    }

    _self.relStatus.splice(0, _self.relStatus.length);
    let releaseStatus = localStorage.getItem("releaseStatus");
    eval(releaseStatus).forEach(item => {
      _self.relStatus.push({
        value: item.statusId,
        label: item.statusName
      });
    });

    _self.productBranchs.splice(0, _self.productBranchs.length);
    let productBranch = localStorage.getItem("productBranch");
    eval(productBranch).forEach(item => {
      _self.productBranchs.push({
        value: item.branchId,
        label: item.branchName
      });
    });

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

    _self.envType.splice(0, _self.envType.length);
    let environmentType = localStorage.getItem("environmentType");
    eval(environmentType).forEach(item => {
      _self.envType.push({
        value: item.typeId,
        label: item.typeName
      });
    });
    
    if (params.length > 0) {
      _self.form.relCode = _self.$route.params.relCode;
      _self.form.status = _self.$route.params.status;
      _self.form.creator = _self.$route.params.creator;
      _self.form.responser = _self.$route.params.responser;
      _self.memberQuery(_self.releaseQuery);
    } else {
      let dayS = new Date();
      dayS.setTime(dayS.getTime() - 3600 * 1000 * 24 * 90);
      let dayE = new Date();
      dayE.setTime(dayE.getTime() + 3600 * 1000 * 24 * 90);
      _self.form.relDate.push(dateFormat(new Date(dayS), _self.datefmt));
      _self.form.relDate.push(dateFormat(new Date(dayE), _self.datefmt));
      _self.memberQuery(_self.releaseQuery);
    }

    _self.queryProductConfig();
    _self.latestSitPlanQuery();
    _self.latestUatPlanQuery();
  },

  methods: {
    resetFilterText(){
      let _self =  this;
      _self.userOptions = _self.memberFull;
      _self.userOptions1 = _self.memberFull;
      _self.userOptions2 = _self.memberFull;
      _self.userOptions3 = _self.memberFull;
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
    
    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.pageNum = 1;
      } else {
        this.pageNum = current;
      }
      this.releaseQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.pageNum = 1;
      this.releaseQuery();
    },

    handleCurrentChangeRelReq(current) {
      this.releasedReq.pageNum = current;
      this.relReqQuery(this.currentRelease.id);
    },

    handleSizeChangeRelReq(size) {
      this.releasedReq.pageSize = size;
      this.releasedReq.pageNum = 1;
      this.relReqQuery(this.currentRelease.id);
    },

    selectionChangeAdd(val) {
      this.notReleasedReq.selected = val;
    },

    selectionChangeDel(val) {
      this.releasedReq.selected = val;
    },

    setCurrentRow(data){
      let _self =  this;
      _self.currentRow = JSON.parse(JSON.stringify(data));
    },

    handleCommand(command) {
      let _self =  this;
      if (command == "toComplete") {
        _self.reqStatusUpdate(_self.currentRow.id, 6);
      } else if (command == "toClose") {
        _self.reqStatusUpdate(_self.currentRow.id, 0, 1);
      } else if (command == "toRemove") {
        _self.$axios.post("/req/unrelease", {
          reqs: _self.currentRow.id
        })
        .then(function(res) {
          if (res.data = 1) {
            _self.$message.success("需求移出版本成功！");
          } else {
            _self.$message.warning("需求移出版本失败！");
          }
          _self.relReqQuery(_self.currentRelease.id);
        })
      } else if (command == "toCopy") {
        _self.changeOnWay(_self.currentRow.id, (changeCount) => {
          if (changeCount > 0) {
            _self.$confirm("是否前往变更页面查看？", "需求变更未完成，请暂勿操作", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
            .then(() => {
              _self.showReleasedReq = false;
              _self.$router.push({
                name: "change",
                params: {
                  reqId: _self.currentRow.id
                }
              });
            })
          } else {
            _self.$axios.post("/req/copy/" + _self.currentRow.id)
            .then(function(res) {
              if (res.data = 1) {
                _self.$message.success("需求延期复制成功！");
              } else {
                _self.$message.warning("需求延期复制失败！");
              }
              _self.relReqQuery(_self.currentRelease.id);
            })
          }
        });
      }
    },

    changeOnWay(reqId, callback) {
      let _self =  this;
      _self.$axios({
        method: "post",
        url: "/change/on_way",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        params: {
          reqId: reqId
        }
      })
      .then(function (res) {
        let changes = res.data;
        _self.$nextTick(() => {
          if (typeof callback == "function") {
            callback(changes);
          }
        })
      })
    },

    reqStatusUpdate(reqId, targetStatus, closeStyle){
      let _self =  this;
      _self.changeOnWay(reqId, (changeCount) => {
        if (changeCount > 0) {
          _self.$confirm("是否前往变更页面查看？", "需求变更未完成，请暂勿操作", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            _self.showReleasedReq = false;
            _self.$router.push({
              name: "change",
              params: {
                reqId: reqId
              }
            });
          })
        } else {
          _self.$axios.post("/req/status_update", {
            id: reqId,
            status: targetStatus,
            closeStyle: closeStyle
          })
          .then(function(res) {
            if (res.data = 1) {
              _self.$message.success("操作成功！");
              _self.$confirm("是否需要同步开发任务状态？", "操作确认", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "info"
                })
                .then(() => {
                  _self.reqCmsStatusSync(reqId, targetStatus);
                })
            } else {
              _self.$message.warning("操作失败！");
              console.log(res);
            }
            _self.relReqQuery(_self.currentRelease.id);
          })
        }
      });
    },

    reqCmsStatusSync(reqId, targetStatus){
      let _self =  this;
      _self.$axios.post("/cms/req_cms_sync/" + reqId + "/" + targetStatus)
      .then(function(res) {
        if (res.data = 1) {
          _self.$message.success("同步开发任务状态成功！");
        } else {
          _self.$message.warning("同步开发任务状态失败！");
        }
      })
    },

    relReqQuery(relId){
      let _self =  this;
      _self.reledLoading = true;
      _self.$axios.post("/req/rel_query/" + relId + "/" + _self.releasedReq.pageNum + "/" + _self.releasedReq.pageSize)
      .then(function(res) {
        _self.releasedReq.reqs  = eval(res.data.list);
        _self.releasedReq.pageInfo = res.data;
        _self.releasedReq.reqs.forEach(item => {
          _self.$set(item, "showComplete", _self.isManager() && item.status > 2 && item.status != 6 && _self.currentRelease.status>0);
          _self.$set(item, "showClose", _self.isManager() && item.status > 2 && _self.currentRelease.status>0);
          _self.$set(item, "showRemove", _self.isManager() && item.status <= 2 && item.status > 0 &&  item.cmCount == 0 && _self.currentRelease.status>0);
          _self.$set(item, "showCopy", _self.isManager() && item.status > 2 && _self.currentRelease.status>0);
        });
        _self.$nextTick(() => {
          _self.reledLoading = false;
        });
      })
      .catch(function(response) {
        _self.reledLoading = false;
        console.log(response);
      });
    },

    notReleasedReqQuery() {
      this.showNotReleasedReq = true;
      this.openLoading = true;
      this.openReqQuery();
    },

    isManager(){
      return commonQuery.roleAllow([0, 2, 10]);
    },

    filterOpenReqs(){
      let _self =  this;
      if (commonQuery.isNull(_self.notReleasedReq.filterReqId)) {
        _self.openReqQuery();
        return;
      }
      _self.filterReqQuery(_self.notReleasedReq.filterReqId);
    },

    handleCurrentChangeOpen(current) {
      this.notReleasedReq.pageNum = current;
      this.openReqQuery();
    },

    handleSizeChangeOpen(size) {
      this.notReleasedReq.pageSize = size;
      this.notReleasedReq.pageNum = 1;
      this.openReqQuery();
    },

    filterReqQuery(id) {
      let _self =  this;
      _self.openLoading = true;
      _self.$axios({
        method: "post",
        url: "/req/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        params: {
          id: id
        }
      })
      .then(function(res) {
        _self.notReleasedReq.reqs = eval(res.data.list);
        _self.openLoading = false;
      })
      .catch(function(response) {
        _self.openLoading = false;
        console.log(response);
      });
    },

    openReqQuery() {
      let _self =  this;
      _self.$axios({
        method: "post",
        url: "/req/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        params: {
          pageNum: _self.notReleasedReq.pageNum,
          pageSize: _self.notReleasedReq.pageSize,
          status: [1, 2, 3, 4, 5, 6].toString(),
          relId: _self.notReleasedReq.olnyNotReleased ? "NOTHING" : null
        }
      })
      .then(function(res) {
        _self.notReleasedReq.reqs = eval(res.data.list);
        _self.notReleasedReq.pageInfo = res.data;
        _self.openLoading = false;
      })
      .catch(function(response) {
        _self.openLoading = false;
        console.log(response);
      });
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    toRContent(data){
      let _self =  this;
      _self.currentRelease.id = data.id;
      _self.currentRelease.status = data.status;
      data.environment.split(",").forEach(item => {
        _self.currentRelease.environment.push(parseInt(item));
      });
      _self.showReleasedReq = true;
      _self.currentRelease.planDisabled = data.status > 4 || data.status == 0 || !_self.isManager();
      _self.relReqQuery(data.id);
    },

    releaseRequirement(){
      let _self =  this;
      if (!_self.notReleasedReq.selected || _self.notReleasedReq.selected.length == 0) {
        _self.$message.warning("请选择需求！");
        return;
      }
      let postData = [];
      _self.notReleasedReq.selected.forEach(item => {
        postData.push({
          id: item.id,
          relId: _self.currentRelease.id,
          sitDate: item.sitDate,
          uatDate: item.uatDate
        });
      });
      for (let i = 0; i < postData.length; i ++) {
        if (commonQuery.isNull(postData[i].sitDate) || commonQuery.isNull(postData[i].uatDate)) {
          _self.$message.warning("请补充需求 #" + postData[i].id + " 的SIT、UAT计划开始日期！");
          return;
        }
      }
      
      _self.$axios.post("/req/release", {
        releasing: JSON.stringify(postData)
      })
      .then(function(res) {
        if (res.data = 1) {
          _self.$message.success("需求纳入版本成功！");
        } else {
          _self.$message.warning("需求纳入版本失败！");
          console.log(res);
        }
        _self.showNotReleasedReq = false;
        _self.relReqQuery(_self.currentRelease.id);
      })
    },

    unReleaseRequirement(){
      let _self =  this;
      if (!_self.releasedReq.selected || _self.releasedReq.selected.length == 0) {
        _self.$message.warning("请选择需求！");
        return;
      }
      let reqIds = [];
      for (let i = 0, rows = _self.releasedReq.selected; i < rows.length; i ++) {
        if (rows[i].cmCount > 0) {
          _self.$message.warning("需求 #" + rows[i].id + " 已拆分开发任务，不可操作！");
          return;         
        }
        if (rows[i].status == 0) {
          _self.$message.warning("需求 #" + rows[i].id + " 已关闭，不可操作！");
          return;         
        }
        reqIds.push(rows[i].id);
      }
      
      _self.$axios.post("/req/unrelease", {
        reqs: reqIds.toString()
      })
      .then(function(res) {
        if (res.data = 1) {
          _self.$message.success("需求移出版本成功！");
        } else {
          _self.$message.warning("需求移出版本失败！");
          console.log(res);
        }
        _self.relReqQuery(_self.currentRelease.id);
      })
    },

    getEnvName(envs) {
      let result = [];
      let filterd = "";
      envs.split(",").forEach(item => {
        filterd = eval(localStorage.getItem("environmentType")).find(d => { 
          return parseInt(item) === d.typeId;
        });
        if (filterd) {
          result.push(filterd.typeName);
        }
      });
      if (result.length > 1) {
        return result.toString().replace(/,/g ,"，");
      } else {
        return result.toString();
      }
    },

    editRelease(data){
      let _self =  this;
      _self.currentRel.id = data.id;
      _self.currentRel.productBranch = data.branchId;
      _self.currentRel.productCode = sessionStorage.productCode;
      _self.currentRel.relCode = data.relCode;
      _self.currentRel.responser = data.responser;
      _self.currentRel.status = data.status;
      _self.currentRel.environment = [];
      data.environment.split(",").forEach(item => {
        _self.currentRel.environment.push(parseInt(item));
      });
      _self.currentRel.creator = data.creator,
      _self.currentRel.relDate = data.relDate;
      _self.currentRel.reqConfirmDate = data.reqConfirmDate;
      _self.currentRel.sitBeginDate = data.sitBeginDate;
      _self.currentRel.uatBeginDate = data.uatBeginDate;
      _self.currentRel.readyDate = data.readyDate;
      _self.currentRel.relDateAct = data.relDateAct;

      _self.showDialogMod = true;
      _self.relReqQuery(data.id);
    },

    setQuery(){
      if (this.form.relCode && this.form.relCode != '') {
        this.form.queryDisabled = true;
        this.form.relDate.splice(0, this.form.relDate.length);
        this.form.creator = "";
        this.form.responser = "";
        this.form.status = "";
      } else {
        this.form.queryDisabled = false;
        let dayE = new Date();
        dayE.setTime(dayE.getTime() + 3600 * 1000 * 24 * 30);
        this.form.relDate.push(dateFormat(new Date(),this.datefmt));
        this.form.relDate.push(dateFormat(new Date(dayE), this.datefmt));
      }
    },

    saveRelCreate(formName) {
      let _self =  this;
      _self.checking = true;
      _self.releaseExist();
      setTimeout(() => {
        _self.$refs[formName].validate((valid) => {
          if (!valid) {
            _self.$notify.error("表单校验不通过，无法提交");
            _self.checking = false;
            return;
          } else {
            let reg = /^\d+\.\d+\.\d+$/;
            if (! reg.test(_self.relform.relCode)) {
              _self.$message.warning("版本号格式校验不通过，请参照提示！");
              _self.relform.relCode = "";
              _self.checking = false;
              return;
            }
              if (_self.releaseExists == true) {
                _self.$message.warning("版本【" + _self.relform.productCode + _self.relform.relCode + "】已存在！");
                _self.checking = false;
                return;
              }
              _self.checking = false;
              _self.relCreate();    
          }
        });
      }, 500);
    },

    checkReleaseMod(formName) {
      let _self =  this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          if (_self.currentRel.status === 0 || _self.currentRel.status >= 6) {
            if (!_self.currentRel.relDateAct || _self.currentRel.relDateAct === '') {
              _self.$message.info("版本已发布请选择实际发布日期");
              return;
            }
          }
          if (_self.currentRel.relDateAct && _self.currentRel.relDateAct != '') {
            if (_self.currentRel.status != 0 && _self.currentRel.status < 6) {
              _self.$message.info("版本已发布请修改版本状态");
              return;
            }
          }
          if (_self.currentRel.status === 0) {
            let notCompletedReqs = [];
            _self.releasedReq.reqs.forEach(item => {
              if (item.status > 0 && item.status < 6) {
                notCompletedReqs.push(item.id);
              }
            });
            if (notCompletedReqs.length > 0) {
              _self.$message.warning("版本中如下需求未完成或未关闭：" + notCompletedReqs.toString());
              return;
            }
          }
          _self.saveReleaseMod();
        }
      });
    },

    saveReleaseMod(){
      let _self =  this;
      _self.$axios.post("/release/update", {
        id: _self.currentRel.id,
        branchId: _self.currentRel.productBranch,
        relDate: _self.currentRel.relDate,
        reqConfirmDate: _self.currentRel.reqConfirmDate,
        sitBeginDate: _self.currentRel.sitBeginDate,
        uatBeginDate: _self.currentRel.uatBeginDate,
        readyDate: _self.currentRel.readyDate,
        relDateAct: _self.currentRel.relDateAct,
        responser: _self.currentRel.responser,
        status: _self.currentRel.status,
        environment: _self.currentRel.environment.toString()
      })
      .then(function(res) {
        if (res.data == 1) {
          _self.showDialogMod = false;
          _self.$message.success("版本信息修改成功！");
          _self.releaseQuery();
        } else {
          _self.$message.warning("保存失败");
          console.log(res);
        }
      })
    },

    latestSitPlanQuery() {
      let _self =  this;
      _self.$axios.post("/plan/latest/4")
      .then(function(res) {
        _self.latestSitPlan = res.data;
      })
    },

    latestUatPlanQuery() {
      let _self =  this;
      _self.$axios.post("/plan/latest/5")
      .then(function(res) {
        _self.latestUatPlan = res.data;
      })
    },

    createTestPlan(relId, planType, planBegin, planEnd, testPlan) {
      let _self =  this;
      let typeName = planType == 4 ? "系统测试" : "验收测试";
      _self.$axios.post("/plan/create", {
        relId: relId,
        planType: planType,
        submitter: sessionStorage.userId,
        planStatus: 1,
        responser: planType == 4 ? _self.configedTesterResponser : _self.configedProderResponser,
        planBegin: planBegin,
        planEnd: planEnd,
        reportDates: "",
        emailTo: !testPlan ? "" : testPlan.emailTo,
        emailCc: !testPlan ? "" : testPlan.emailCc
      })
      .then(function(res) {
        let planId = res.data;
        if (planId > 0) {
          setTimeout(() => {
            _self.$message.success("自动创建" + typeName + "计划成功！");
            _self.$confirm("是否自动创建" + typeName + "报告？", "自动操作提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "success"
            })
            .then(() => {
              _self.createTestReport(relId, 2, planType);
            })
          }, 500);
        }
      })
    },

    queryProductConfig(){
      let _self =  this;
      _self.$axios.post("/product/config_query/" + sessionStorage.productId)
      .then(function(res) {
        let json = res.data;
        if (!json) {
          _self.configedTesterResponser = null;
          _self.configedProderResponser = null;
          return;
        }
        if (json.memberConfig) {
          _self.configedTesterResponser = json.memberConfig.testResponser;
          _self.configedProderResponser = json.memberConfig.pdResponser;
        }
      })
    },

    createTestReport(relId, reportType, testPeriod) {
      let _self =  this;
      let branchName = _self.productBranchs.find(d=>{return _self.relform.productBranch == d.value}).label;
      let relName = "[" + branchName + "] " + _self.relform.productCode + _self.relform.relCode;
      let reportTime = new Date(dateFormat(new Date(), _self.timefmt));
      let periodName = _self.testPeriod.find(item => {
        return item.value == testPeriod;
      }).label;
      let reportTypeName = _self.reportTypes.find(item => {
        return item.value == reportType;
      }).label;
      let reportMark =  (reportType == 3 ? "" : "【" + periodName + "】") + reportTypeName;
      let reportTitle ="【" + sessionStorage.productName + "】【" + relName + "】" + reportMark;

      _self.$axios.post("/report/create", {
        reportType: reportType,
        planType: reportType == 3 ? 0 : testPeriod,
        relId: relId,
        reportDate: dateFormat(reportTime, _self.timefmt),
        url: "",
        title: reportTitle
      })
      .then(function(res) {
        setTimeout(() => {
          _self.$message.success("自动创建" + reportMark + "成功！");
        }, 500);
      })
    },

    relCreate() {
      let _self =  this;
      _self.$axios.post("/release/create", {
        relCode: _self.relform.productCode + _self.relform.relCode,
        branchId: _self.relform.productBranch,
        relDate: _self.relform.relDate,
        reqConfirmDate: _self.relform.reqConfirmDate,
        sitBeginDate: _self.relform.sitBeginDate,
        uatBeginDate: _self.relform.uatBeginDate,
        readyDate: _self.relform.readyDate,
        responser: _self.relform.responser,
        creator: sessionStorage.userId,
        status: 1,
        environment: _self.relform.environment.toString()
      })
      .then(function(res) {
        let relId = res.data;
        if (relId > 0) {
          _self.showDialog = false;
          _self.$message.success("创建版本计划成功！");
          _self.$nextTick(_=> {
            if (!_self.latestSitPlan && !_self.configedTesterResponser) {
              _self.$message.warning("未配置测试负责人，无法创建系统测试计划！");
            } else {
              _self.createTestPlan(relId, 4, _self.relform.sitBeginDate, _self.relform.readyDate, _self.latestSitPlan);
            }
            if (!_self.latestUatPlan && !_self.configedProderResponser) {
              _self.$message.warning("未配置产品负责人，无法创建验收测试计划！");
            } else {
              _self.createTestPlan(relId, 5, _self.relform.uatBeginDate, _self.relform.readyDate, _self.latestUatPlan);
            }
            _self.$nextTick(_=> {
              _self.createTestReport(relId, 3, 4);
            });
          });
          _self.releaseQuery();
        } else {
          _self.$message.warning("创建版本计划失败");
          console.log(res);
        }
      })
    },

    memberQuery(callback){
      let _self =  this;
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

    releaseExist() {
      let _self =  this;
      _self.$axios({
        method: "post",
        url: "/release/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        params: {
          relCode: _self.relform.productCode + _self.relform.relCode
        }
      })
      .then(function(res) {
        _self.releaseExists = eval(res.data.list).length > 0;
      })
    },

    releaseQuery() {
      let _self =  this;
      let prodMembers = _self.member;
      let relDateBegin = "",
        relDateEnd = "";
      if (_self.form.relDate && _self.form.relDate.length > 1) {
        relDateBegin = _self.form.relDate[0];
        relDateEnd = _self.form.relDate[1];
      }
      _self.$axios({
        method: "post",
        url: "/release/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        params: {
          relCode: _self.form.relCode,
          relDateBegin: relDateBegin,
          relDateEnd: relDateEnd,
          branchId: _self.form.productBranch,
          responser: _self.form.responser,
          status: _self.form.status.toString(),
          creator: _self.form.creator,
          pageNum: _self.pageNum,
          pageSize: _self.pageSize
        }
      })
      .then(function(res) {
        let datas = eval(res.data.list);
        _self.queryLoading = false;
        _self.tableData = datas;
        _self.pageInfo = res.data;
        setTimeout(() => {
          _self.queryChanged = false;
        }, 200);
      })
      .catch(function(response) {
        _self.queryLoading = false;
        _self.$notify.error("发生错误");
        console.log(response);
      });
    }
  }
};
</script>

<style>
.release-from {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.release-from .env-formed {
  background-color: #f5f7fa;
  border: none;
  border-bottom: 1px solid #DCDFE6;
  color: #4d535f;
  cursor: not-allowed;
  height: 28px;
  line-height: 28px;
  border-radius: 2px;
  padding: 0 15px;
  font-size: 13px;
  width: 350px;
}

.release-main .el-form-item .el-input input {
  width: 180px !important;
}

.el-table .el-date-editor input {
  padding-right: 5px; 
}
</style>
