<template>
  <div id="root" class="require-main">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-coding"></i> 需求管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>需求开发</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showTips" width="600px" top="10vh">
      <li class="req-status-tip">产品需求创建之后默认状态为【已创建】</li>
      <li class="req-status-tip">产品需求未纳入版本，开发、测试任务不可拆分，需求可无限编辑</li>
      <li class="req-status-tip">产品需求已纳入版本，开始进入变更控制流程</li>
      <li class="req-status-tip">产品需求未拆分开发任务时产品经理可以选择直接关闭，关闭时必须补充详情说明</li>
      <li class="req-status-tip">产品需求拆分开发任务之后状态为【已拆分】</li>
      <li class="req-status-tip">产品需求已拆分出开发任务之后，开发任务未全部关闭，产品需求状态不可手动更改</li>
      <li class="req-status-tip">产品需求处于变更流程之中（未完成变更确认），需求操作全部暂停</li>
      <div slot="footer">
        <el-checkbox size="mini" v-model="hideTips" style='margin-top:-15px;float:right'>不再提示</el-checkbox>
      </div>
    </el-dialog>

    <el-dialog title="产品需求生命周期历史" :close-on-click-modal="modalClose" :visible.sync="showReqHistory" width="800px" top="100px">
      <div class="req-history" v-if="reqHistories.length>0">
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in reqHistories"
            :key="index">
            <el-card>
              <h4 style="margin-bottom:10px">{{item.operTime}}</h4>
              <p>{{item.content}}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <h1 v-else style="text-align:center">查询无结果，请联系管理员！</h1>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="showReqHistory=false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="产品需求关闭说明" :close-on-click-modal="modalClose" :visible.sync="showReqClose" width="400px" :before-close="cancelClose">
      <el-form :model="closeForm" size="small" :inline="false" label-width="120px" :rules="closeFormRules" ref="reqCloseForm">
        <el-form-item label="关闭原因" prop="closeStyle" required>
          <el-select v-model="closeForm.closeStyle" placeholder="请选择" @change="setDefaultCloseReason()">
            <el-option v-for="opt in closeStyles" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="cancelClose()">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="checkCloseRequestSave()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showReleteCase" width="680px">
      <div slot="title">
        <span style="font-size:18px">关联测试用例</span>
        <span style="font-size:18px;color:red">（须展开至待选目标节点方可有效勾选用例）</span>
      </div>
      <div class="case-menu">
        <el-tree
          class="tree-view"
          v-if="loadTree"
          ref="caseToSelect"
          style="height: 398px"
          node-key="id"
          highlight-current
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
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="showReleteCase=false">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="relateCases()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="需求变更说明" :visible.sync="showDescription" width="720px">
      <el-input type="textarea" v-model="currentRequest.changeDetail" :rows="10" disabled resize="none" style="margin-bottom:10px"></el-input>
      <el-input type="textarea" v-model="currentRequest.changeDesc" :rows="10" placeholder="请填写补充说明" resize="none" :maxlength="500"
                show-word-limit></el-input>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDescription=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="saveEditRequest()" size="small">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="产品需求附件清单" :visible.sync="showAttachDialog" width="960px" top="100px">
      <el-table :data="currentReqDetail.attachs" size="mini" class="detail-table" empty-text="当前需求没有上传附件" stripe max-height="500px">
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

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showDetail" width="1260px" top="40px" :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">产品需求详细信息</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>

      <el-collapse v-model="activeName" accordion class="req-detail-collapse">
        <el-collapse-item name="reqDetail">
          <template slot="title">
            <i class="el-icon-info"></i>
            <span> 需求明细</span>
          </template>
          <el-form v-model="currentReqDetail.data" size="mini" inline label-width="120px">
            <el-form-item label="需求编号">
              <el-input v-model="currentReqDetail.data.id" disabled></el-input>
            </el-form-item>
            <el-form-item>
              <template slot="label">
                <el-tooltip content="点击查看产品需求详情" placement="left" effect="dark">
                  <span>需求摘要</span>
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <div class="req-sum-tips">
                  <el-popover
                    placement="left-end"
                    width="600"
                    trigger="click">
                    <el-input type="textarea" v-model="currentReqDetail.data.detail" :rows="10" disabled resize="none" placeholder="未录入产品需求详情"></el-input>
                    <span slot="reference">{{currentReqDetail.data.summary}}</span>
                  </el-popover>
                </div>
              </template>
            </el-form-item>
            <el-form-item label="需求类型">
              <el-input v-model="currentReqDetail.data.typeName" disabled></el-input>
            </el-form-item>
            <el-form-item label="所属版本">
              <el-input v-model="currentReqDetail.data.relCode" placeholder="尚未排期" disabled></el-input>
            </el-form-item>
            <el-form-item label="所属模块">
              <el-input v-model="currentReqDetail.data.moduleName" disabled></el-input>
            </el-form-item>
            <el-form-item label="紧急程度">
              <el-input v-model="currentReqDetail.data.priorityName" disabled></el-input>
            </el-form-item>
            <el-form-item label="需求状态">
              <el-input v-model="currentReqDetail.data.statusName" disabled></el-input>
            </el-form-item>
            <el-form-item label="提交人">
              <el-input v-model="currentReqDetail.data.submitterName" disabled></el-input>
            </el-form-item>
            <el-form-item label="提交日期">
              <el-input v-model="currentReqDetail.data.submitDate" disabled></el-input>
            </el-form-item>
            <el-form-item label="期望完成日期">
              <el-input v-model="currentReqDetail.data.expectDate" disabled></el-input>
            </el-form-item>
            <el-form-item label="SIT计划开始">
              <el-input v-model="currentReqDetail.data.sitDate" disabled></el-input>
            </el-form-item>
            <el-form-item label="UAT计划开始">
              <el-input v-model="currentReqDetail.data.uatDate" disabled></el-input>
            </el-form-item>
            <el-form-item label="产品负责人">
              <el-input v-model="currentReqDetail.data.proderName" disabled></el-input>
            </el-form-item>
            <el-form-item label="开发负责人">
              <el-input v-model="currentReqDetail.data.deverName" disabled></el-input>
            </el-form-item>
            <el-form-item label="测试负责人">
              <el-input v-model="currentReqDetail.data.testerName" disabled></el-input>
            </el-form-item>
            <el-form-item label="原型链接" prop="uiResource">
              <el-input v-model="currentReqDetail.data.uiResource" style="width:465px" disabled></el-input>
            </el-form-item>
            <el-form-item label="链接预览" v-if="checkUrl(currentReqDetail.data.uiResource)">
              <el-link type="success" :href="currentReqDetail.data.uiResource" :underline="false" target="_blank">原型链接</el-link>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item name="reqAttach">
          <template slot="title">
            <i class="el-icon-upload"></i>
            <span v-if="activeName=='reqAttach'"> 附件清单</span>
            <span v-else> 附件清单({{currentReqDetail.attachs.length}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="currentReqDetail.attachs" size="mini" class="detail-table" empty-text="当前需求没有上传附件" stripe>
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
                <el-button v-no-more-click type="success" icon="el-icon-download" @click="openAttach(scope.row)" size="mini">下载附件
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>

        <el-collapse-item name="reqChange">
          <template slot="title">
            <i class="el-icon-sort"></i>
            <span v-if="activeName=='reqChange'"> 变更记录</span>
            <span v-else> 变更记录({{currentReqChange.length}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="currentReqChange" size="mini" class="detail-table" empty-text="当前需求没有变更记录" stripe>
            <el-table-column type="index" label="序号" width="50" align="center">
            </el-table-column>
            <el-table-column prop="changeTime" label="变更时间" width="145" align="center">
            </el-table-column>
            <el-table-column prop="changeUserName" label="变更用户" width="100" align="center">
            </el-table-column>
            <el-table-column label="变更说明" min-width="30%" header-align="center">
              <template slot-scope="scope">
                <el-popover
                  placement="left-start"
                  width="600"
                  trigger="click">
                  <el-input type="textarea" v-model="scope.row.changeDetail" :rows="10" disabled resize="none"></el-input>
                  <el-button v-no-more-click type="text" slot="reference">{{scope.row.changeDesc}}</el-button>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column label="应确认用户" min-width="20%" align="center">
              <template slot-scope="scope">
                <span>{{namedUser(scope.row.auditUser)}}</span>
              </template>
            </el-table-column>
            <el-table-column label="已确认用户" min-width="20%" align="center">
              <template slot-scope="scope">
                <span>{{namedUser(scope.row.audittedUser)}}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>

        <el-collapse-item name="reqCms">
          <template slot="title">
            <i class="iconfont icon-coding"></i>
            <span v-if="activeName=='reqCms'"> 开发任务</span>
            <span v-else> 开发任务({{currentReqCms.pageInfo.total}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="currentReqCms.data" size="mini" class="detail-table" empty-text="该产品需求尚未拆分开发任务" stripe>
            <el-table-column type="index" label="序号" width="50" align="center">
            </el-table-column>
            <el-table-column prop="id" label="任务编号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="statusName" label="状态" width="70" align="center">
            </el-table-column>
            <el-table-column prop="spliterName" label="拆分人" width="100" align="center">
            </el-table-column>
            <el-table-column prop="splitDate" label="拆分日期" width="100" align="center">
            </el-table-column>
            <el-table-column prop="responserName" label="负责人" width="100" align="center">
            </el-table-column>
            <el-table-column prop="planTo" label="计划完成" width="100" align="center">
            </el-table-column>
            <el-table-column prop="manpower" label="人力(人日)" width="80" align="center">
            </el-table-column>
            <el-table-column prop="summary" label="任务摘要" header-align="center" show-overflow-tooltip>
            </el-table-column>
          </el-table>
          <div class="page-set">
            <el-pagination
              @size-change="handleSizeChangeCms"
              @current-change="handleCurrentChangeCms"
              :current-page="currentReqCms.currentPage"
              :page-sizes="[5, 10]"
              :page-size="currentReqCms.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="currentReqCms.pageInfo.total">
            </el-pagination>
          </div>
        </el-collapse-item>

        <el-collapse-item name="reqBug">
          <template slot="title">
            <i class="iconfont icon-bug"></i>
            <span v-if="activeName=='reqBug'"> 关联缺陷</span>
            <span v-else> 关联缺陷({{currentReqBug.pageInfo.total}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="currentReqBug.data" size="mini" class="detail-table" empty-text="该产品需求尚未发现或上报缺陷" stripe>
            <el-table-column type="index" label="序号" width="50" align="center">
            </el-table-column>
            <el-table-column prop="foundTime" label="发现时间" width="140" align="center">
            </el-table-column>
            <el-table-column prop="relCode" label="发现版本" width="140" align="center">
            </el-table-column>
            <el-table-column prop="statusName" label="缺陷状态" width="90" align="center">
            </el-table-column>
            <el-table-column prop="submitterName" label="提交人" width="100" align="center">
            </el-table-column>
            <el-table-column prop="responserName" label="负责人" width="100" align="center">
            </el-table-column>
            <el-table-column prop="priorityName" label="优先级" width="70" align="center">
            </el-table-column>
            <el-table-column prop="influenceName" label="严重程度" width="80" align="center">
            </el-table-column>
            <el-table-column prop="summary" label="缺陷摘要" header-align="center" show-overflow-tooltip>
            </el-table-column>
          </el-table>
          <div class="page-set">
            <el-pagination
              @size-change="handleSizeChangeBug"
              @current-change="handleCurrentChangeBug"
              :current-page="currentReqBug.currentPage"
              :page-sizes="[5, 10]"
              :page-size="currentReqBug.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="currentReqBug.pageInfo.total">
            </el-pagination>
          </div>
        </el-collapse-item>
      </el-collapse>

      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDetail=false" size="small">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="产品需求内容变更" :visible.sync="showDialogMod" width="960px" :fullscreen="maximize2">
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

      <div v-loading.lock="checking"
           element-loading-text="校验中..."
           element-loading-spinner="el-icon-loading"
           element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-form :model="qform" size="mini" :rules="qFormRules" ref="ruledFormMod" :inline="true" label-width="110px" class="req-form">
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
            <el-select v-model="qform.status" filterable :disabled="statusForbidden()">
              <el-option v-for="opt in reqStatus" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>
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
          <el-form-item label="所属模块" prop="moduleId" required>
            <el-select v-model="qform.moduleId" clearable>
              <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="原型链接" prop="uiResource">
            <el-input v-model="qform.uiResource" placeholder="请输入UED原型图链接" style="width:474px" clearable>原型链接</el-input>
          </el-form-item>
          <el-form-item label="链接预览" v-if="checkUrl(qform.uiResource)">
            <el-link type="success" :href="qform.uiResource" :underline="false" target="_blank">原型链接</el-link>
          </el-form-item>
          <el-form-item label="需求详情" prop="detail">
            <el-input v-model="qform.detail" type="textarea" :rows="3" placeholder="请输入产品需求详情" class="req-attach-upload" :maxlength="2000"
                      show-word-limit clearable>需求详情
            </el-input>
          </el-form-item>
          <el-form-item label="附件上传">
            <el-upload
              class="req-attach-upload"
              ref="uploadMod"
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
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialogMod=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkReqUpdate('ruledFormMod')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <div class="rform-box">
      <el-form ref="form" :model="form" :inline="true" size="mini" label-width="110px" @keydown.native.enter="reqQuery()">
        <el-form-item label="需求类型">
          <el-select v-model="form.type" placeholder="请选择" clearable :disabled="form.combineDisabled" multiple collapse-tags>
            <el-option v-for="opt in reqType" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="需求状态">
          <el-select v-model="form.status" placeholder="请选择" multiple collapse-tags clearable :disabled="form.combineDisabled">
            <el-option v-for="opt in reqStatus" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属版本">
          <el-select v-model="form.relId" placeholder="请选择" clearable :disabled="form.combineDisabled">
            <el-option v-for="opt in releases" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提交人">
          <el-select v-model="form.submitter" placeholder="请选择" filterable clearable :disabled="form.combineDisabled" :filter-method="filterUsers"
                     @visible-change="resetFilterText">
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
        <el-form-item label="紧急程度">
          <el-select v-model="form.priority" placeholder="请选择" clearable :disabled="form.combineDisabled">
            <el-option v-for="opt in reqPriority" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="需求编号">
          <el-input v-model="form.id" placeholder="需求编号" @change="inputCheck()" clearable>需求编号</el-input>
        </el-form-item>
        <el-form-item label="所属模块">
          <el-select v-model="form.moduleIds" clearable multiple collapse-tags :disabled="form.combineDisabled" class="muti-select">
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
            :picker-options="pickOptions"
            :disabled="form.combineDisabled">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="float:right;">
          <el-button v-no-more-click type="text" @click="showTips=true">状态提示</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="reqQuery()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="dataRevert" :max-height="tableHeight" size="mini" stripe :border="showBorder" ref="reqTable"
          :expand-row-keys="expandedReqs"
          row-key="id"
          @expand-change="manualExpand"
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
        <el-table-column prop="changeTimes" label="变更次数" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column label="所属模块" prop="moduleName" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column label="排期版本" prop="relCode" width="120" align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="priorityName" label="紧急程度" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="submitterName" label="提交人" width="80" align="center" sortable>
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
        </el-table-column>
        <el-table-column type="expand" label="更多信息" width="70">
          <template slot-scope="scope">
            <el-form label-position="right" inline class="sepp-table-expand" size="mini" label-width="150px">
              <el-form-item label="需求类型">
                <el-input v-model="scope.row.typeName" disabled></el-input>
              </el-form-item>
              <el-form-item label="产品负责人">
                <el-input v-model="scope.row.proderName" disabled></el-input>
              </el-form-item>
              <el-form-item label="开发负责人">
                <el-input v-model="scope.row.deverName" disabled></el-input>
              </el-form-item>
              <el-form-item label="测试负责人">
                <el-input v-model="scope.row.testerName" disabled></el-input>
              </el-form-item>
              <el-form-item label="SIT计划开始日期">
                <el-input v-model="scope.row.sitDate" disabled></el-input>
              </el-form-item>
              <el-form-item label="UAT计划开始日期">
                <el-input v-model="scope.row.uatDate" disabled></el-input>
              </el-form-item>
              <el-form-item label="生命周期记录">
                <div class="content-tips" @click="showReqTimeLine(scope.row)">点我查看</div>
              </el-form-item>
              <el-form-item label="关闭原因" v-if="scope.row.status == 0">
                <el-input v-model="scope.row.closeReason" disabled></el-input>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="65" align="center">
          <template slot-scope="scope">
            <el-dropdown trigger="click" @command="handleCommand">
              <el-button type="text" size="small" @click="setCurrentRow(scope.row)">处理</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="relate" v-if="scope.row.testable" style="color:lightseagreen"><i class="el-icon-collection-tag"/>关联测试用例</el-dropdown-item>
                <el-dropdown-item command="tms" v-if="scope.row.testable" style="color:#6BBD6B"><i class="el-icon-copy-document"/>拆分测试任务</el-dropdown-item>
                <el-dropdown-item command="change" v-if="scope.row.relId && scope.row.editable" style="color:#EE6F6F"><i class="el-icon-edit-outline"/>产品需求变更</el-dropdown-item>
                <el-dropdown-item command="edit" v-if="!scope.row.relId && scope.row.editable" style="color:#DEAF6C"><i class="el-icon-edit-outline"/>产品需求编辑</el-dropdown-item>
                <el-dropdown-item command="cms" v-if="scope.row.splitable" style="color:#3AB4D7"><i class="el-icon-document-copy"/>拆分开发任务</el-dropdown-item>
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
        <el-button type="primary"
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
  import {dateFormat, pickOptions} from "@/util/date.js";
  import commonQuery from "@/components/util/CommonQuery.vue";
  import TableExport from '@/util/TableExport.js'

  const rootId = 1;
  const proder = [1, 14, 16];
  export default {
    data: function () {
      return {
        showBorder: sessionStorage.tableShowBorder == 1,
        modalClose: sessionStorage.dialogAutoClose == 1,
        tableData: [],
        pageInfo: {},
        maximize: false,
        maximize2: false,
        queryLoading: false,
        checking: false,
        showRelease: false,
        showReqClose: false,
        showReqHistory: false,
        createCommited: false,
        showTips: !localStorage.hideTips || localStorage.hideTips == 'false',
        hideTips: localStorage.hideTips && localStorage.hideTips == 'true',
        datefmt: defaultDateFormat,
        showDetail: false,
        dialogWidth: document.body.clientWidth - 100,
        currentReqDetail: {
          attachs: [],
          data: {}
        },
        showReleteCase: false,
        loadTree: false,
        defaultProps: {
          children: "children",
          label: "name",
          isLeaf: 'leaf'
        },
        expanded: [],
        expandedReqs: [],
        showAttachDialog: false,
        currentReqCms: {
          data: [],
          pageInfo: {},
          currentPage: 1,
          pageSize: 5
        },
        currentReqBug: {
          data: [],
          pageInfo: {},
          currentPage: 1,
          pageSize: 5
        },
        currentReqChange: [],
        activeName: "reqDetail",
        releases: [],
        modules: [],
        memberFull: [],
        userOptions: [],
        members: [],
        tableHeight: bodyAviHeightNTab - 70 - 45,
        form: {
          combineDisabled: false,
          id: "",
          relId: "",
          submitDate: [],
          type: [],
          status: [1, 2, 3, 4, 5],
          priority: "",
          moduleIds: [],
          submitter: ""
        },
        currentPage: 1,
        pageSize: parseInt(sessionStorage.tablePageSize) || 10,
        queryChanged: false,
        reqType: [],
        reqStatus: [],
        reqPriority: [],
        showDialogMod: false,
        showDescription: false,
        productors: [],
        currentRow: {},
        currentRequest: {
          changeDetail: "",
          changeDesc: "",
          attachments: [],
          id: "",
          uiResource: "",
          type: "",
          status: "",
          priority: "",
          moduleId: "",
          expectDate: "",
          summary: "",
          detail: "",
          refusedTimes: ""
        },
        reqHistories: [],
        pickOptions: pickOptions,
        qform: {
          type: "",
          status: "",
          priority: "",
          moduleId: "",
          moduleIds: [],
          uiResource: "",
          submitter: sessionStorage.userName,
          submitDate: "",
          expectDate: "",
          fileList: [],
          summary: "",
          detail: "",
          placeholder: ""
        },
        closeForm: {
          closeStyle: 1,
          refusedTimes: ""
        },
        closeStyles: [],
        closeFormRules: {
          closeStyle: [{required: true, message: '请选择关闭/回退原因', trigger: 'change'}],
        },
        qFormRules: {
          type: [{required: true, message: '请选择需求类型', trigger: 'change'}],
          priority: [{required: true, message: '请选择需求紧急程度', trigger: 'change'}],
          moduleIds: [{required: true, message: '请选择需求所属模块', trigger: 'change'}],
          expectDate: [{type: 'string', required: true, message: '请选择期望完成日期', trigger: 'blur'}],
          summary: [
            {required: true, message: '请输入产品需求摘要', trigger: 'blur'},
            {min: 5, max: 50, message: '长度在 5 到 50 个字', trigger: 'blur'}
          ],
          detail: [
            {min: 0, max: 2000, message: '长度不可超过 2000 字，内容过多请上传附件', trigger: 'blur'}
          ]
        }
      };
    },

    watch: {
      hideTips: function (val, old) {
        if (val != old) {
          localStorage.setItem("hideTips", val);
        }
      },

      'qform.status': function (val, old) {
        if (val == 0 && this.currentRequest.status > 0) {
          this.showReqClose = true;
          this.closeStyles.forEach(item => {
            this.$set(item, 'disabled', item.value == 4 || (this.currentRequest.status < 3 && item.value == 1));
          });
          this.closeForm.closeStyle = "";
          this.setDefaultCloseReason();
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
          this.reqQuery();
        }
      }
    },

    created() {
      let _self =  this;
      _self.releaseQuery();
      let params = [];
      for (let p in _self.$route.params) {
        params.push(p);
      }

      _self.reqType.splice(0, _self.reqType.length);
      let requirementType = localStorage.getItem("requirementType");
      eval(requirementType).forEach(item => {
        if (item.typeId == 4) {
          return;
        }
        _self.reqType.push({
          value: item.typeId,
          label: item.typeName
        });
      });

      _self.reqStatus.splice(0, _self.reqStatus.length);
      let requirementStatus = localStorage.getItem("requirementStatus");
      eval(requirementStatus).forEach(item => {
        _self.reqStatus.push({
          value: item.statusId,
          label: item.statusName,
          disabled: false
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

      _self.closeStyles.splice(0, _self.closeStyles.length);
      let requirementClose = localStorage.getItem("requirementClose");
      eval(requirementClose).forEach(item => {
        _self.closeStyles.push({
          value: item.styleId,
          label: item.styleName,
          tips: item.tips
        });
      });

      _self.showRelease = false;
      if (params.length > 0) {
        if (null != _self.$route.params.relId && _self.$route.params.relId != "") {
          _self.memberQuery();
          _self.moduleQuery(_self.relReqQuery);
          _self.showRelease = true;
        } else {
          _self.form.id = _self.$route.params.id;
          _self.form.type = [];
          if (_self.$route.params.type) {
            _self.form.type.push(parseInt(_self.$route.params.type));
          }
          _self.form.priority = _self.$route.params.priority;
          if (_self.$route.params.status) {
            _self.form.status.push(parseInt(_self.$route.params.status));
          }
          _self.form.submitter = _self.$route.params.submitter;
          _self.memberQuery();
          _self.moduleQuery(_self.reqQuery);
        }
      } else {
        let dayS = new Date();
        dayS.setTime(dayS.getTime() - 3600 * 1000 * 24 * 90);
        _self.form.submitDate.push(dateFormat(new Date(dayS), _self.datefmt));
        _self.form.submitDate.push(dateFormat(new Date(), _self.datefmt));
        _self.memberQuery();
        _self.moduleQuery(_self.reqQuery);
      }
    },

    computed: {
      dataRevert() {
        this.tableData.forEach(item => {
          let now = new Date(dateFormat(new Date(), this.datefmt) + " 00:00:00").getTime();
          let expect = new Date(item.expectDate + " 00:00:00").getTime();
          if ((expect - now) < 5 * 24 * 60 * 60 * 1000 && item.status < 5 && item.status > 0) {
            this.$set(item, "expectHtml", "<span style='color:orange'>" + item.expectDate + "</span>");
          } else {
            this.$set(item, "expectHtml", "<span style='color:#606266'>" + item.expectDate + "</span>");
          }
          this.$set(item, "closeReason", this.getDisplayedCloseReason(item.closeStyle));
          if (item.status == 0) {
            this.$set(item, "editable", this.reqEditable(item));
            this.$set(item, "splitable", false);
            this.$set(item, "testable", false);
          } else {
            this.$set(item, "editable", this.reqEditable(item));
            this.$set(item, "splitable", this.isManager() && !commonQuery.isNull(item.relId));
            this.$set(item, "testable", this.isTester() && !commonQuery.isNull(item.relId));
          }          
        });
        return this.tableData;
      }
    },

    methods: {
      roleAllow(roles) {
        return commonQuery.roleAllow(roles);
      },

      roleAllowStrict(roles) {
        return commonQuery.roleAllowStrict(roles);
      },

      setCurrentRow(data){
        this.currentRow = JSON.parse(JSON.stringify(data));
      },

      handleCommand(command) {
        let _self =  this;
        if (command == "relate") {
          _self.beginRelate(_self.currentRow);
        } else if (command == "edit") {
          _self.editRequest(_self.currentRow);
        } else if (command == "change") {
          _self.editRequest(_self.currentRow);
        } else if (command == "cms") {
          _self.toMissions(_self.currentRow, 'coding')
        } else if (command == "tms") {
          _self.toMissions(_self.currentRow, 'testing')
        }
      },

      resetFilterText() {
        let _self =  this;
        _self.userOptions = _self.memberFull;
      },

      filterUsers(val) {
        let _self =  this;
        _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
      },

      handleCurrentChange(current) {
        if (this.queryChanged == true) {
          this.currentPage = 1;
        } else {
          this.currentPage = current;
        }
        this.reqQuery();
      },

      handleSizeChange(size) {
        this.pageSize = size;
        this.currentPage = 1;
        this.reqQuery();
      },

      handleCurrentChangeCms(current) {
        this.currentReqCms.currentPage = current;
        this.reqCmsQuery(this.currentReqDetail.data.id);
      },

      handleSizeChangeCms(size) {
        this.currentReqCms.pageSize = size;
        this.currentReqCms.currentPage = 1;
        this.reqCmsQuery(this.currentReqDetail.data.id);
      },

      handleCurrentChangeBug(current) {
        this.currentReqBug.currentPage = current;
        this.defectQuery(this.currentReqDetail.data.id);
      },

      handleSizeChangeBug(size) {
        this.currentReqBug.pageSize = size;
        this.currentReqBug.currentPage = 1;
        this.defectQuery(this.currentReqDetail.data.id);
      },

      setDefaultCloseReason() {
        this.qform.placeholder = this.closeStyles.find(d => {
          return this.closeForm.closeStyle == d.value
        }).tips;
      },

      reqEditable(data) {
        if (data.status == 0) {
          if (this.roleAllowStrict(proder)) {
            return false;
          }
          return data.submitter == sessionStorage.userId || sessionStorage.userId == data.pdResponser;
        } else {
          if (this.roleAllowStrict([4, 6, 14])) {
            return false;
          }
          return data.submitter == sessionStorage.userId || sessionStorage.userId == data.pdResponser;
        }
      },

      checkUrl(url) {
        return commonQuery.checkUrl(url);
      },

      isManager() {
        return this.roleAllow([2, 3, 10]);
      },

      isTester() {
        return this.roleAllow([4, 6]);
      },

      getDisplayedCloseReason(data) {
        if (commonQuery.isNull(data)) {
          return "";
        }
        return this.closeStyles.find(d => {
          return d.value == data
        }).label;
      },

      exportCSV(fileName = 'result', tableRef = 'table') {
        const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
        TableExport(this.tableData, columns, fileName)
      },

      manualExpand(row, expandedRows) {
        let _self =  this;
        if (_self.expandedReqs.indexOf(row.id) >= 0) {
          _self.expandedReqs.shift()
        } else {
          _self.expandedReqs.shift();
          _self.expandedReqs.push(row.id);
        }
        if (expandedRows.length > 1) {
          expandedRows.shift()
        }
      },

      showReqTimeLine(data) {
        let _self =  this;
        _self.showReqHistory = true;

        _self.$axios.post("/req/history/" + data.id)
        .then(function (res) {
          _self.reqHistories = eval(res.data);
        })
      },

      showAttachs(row) {
        let _self =  this;
        _self.showAttachDialog = true;
        _self.currentReqDetail.attachs = _self.getAttach(row.attachment);
      },

      showReqDetail(row) {
        let _self =  this;
        _self.showDetail = true;
        _self.activeName = "reqDetail";
        _self.currentReqDetail.data = row
        _self.currentReqDetail.attachs = _self.getAttach(row.attachment);
        _self.currentReqChange = [];
        _self.currentReqCms.data = [];
        _self.currentReqBug.data = [];
        _self.changeQuery(row.id);
        _self.reqCmsQuery(row.id);
        _self.defectQuery(row.id);
      },

      beginRelate(data) {
        let _self =  this;
        _self.showReleteCase = true;
        _self.currentReqDetail.data = data;
        _self.loadTree = true;
        _self.expanded.splice(0, _self.expanded.length);
        _self.expanded.push(rootId);
        if (_self.$refs.caseToSelect) {
          _self.$refs.caseToSelect.setCheckedNodes([]);
        }
      },

      relateCases() {
        let _self =  this;
        let checkedNodes = _self.$refs.caseToSelect.getCheckedNodes(true);
        if (!checkedNodes || checkedNodes.length == 0) {
          _self.$message.info("请选择测试用例");
          return;
        }
        let checkedCases = [];
        for (let k = 0; k < checkedNodes.length; k++) {
          if (checkedNodes[k].type == "case") {
            checkedCases.push(checkedNodes[k].id + "");
          }
        }

        _self.$axios.post("/case/relate_save", {
          reqId: _self.currentReqDetail.data.id,
          caseIds: checkedCases.toString(),
          relateType: 2
        })
        .then(function (res) {
          if (res.data >= 0) {
            _self.$message.success("模块需求关联测试用例成功！");
            _self.showReleteCase = false;
            _self.reqQuery();
          } else {
            _self.$message.info("模块需求关联测试用例失败！");
          }
        })
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
        let _self =  this;
        _self.$axios({
            method: "post",
            url: "/case/query",
            headers: {
              "Content-type": "application/x-www-form-urlencoded"
            },
            params: {
              parentId: parentId
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

      renderContent(h, { node, data, store }) {
        if (data.type == 'folder') {
          return (
            <span>
            <i class="iconfont icon-folder" style="margin-right: 4px" />
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

      countAttach(attach) {
        return null == attach || attach == "" ? 0 : attach.split(",").length;
      },

      openAttach(file) {
        commonQuery.attachmentDownload(file);
      },

      statusForbidden() {
        let _self =  this;
        let cmsNotClosed = _self.currentReqCms.data.filter(item => {
          return item.status > 0;
        });
        return cmsNotClosed.length > 0;
      },

      namedUser(users) {
        let _self =  this;
        let named = [];
        if (!users || users == null || users == '') {
          return '';
        }
        users.split(",").forEach(item => {
          let user = _self.members.find(d => {
            return d.value == parseInt(item);
          });
          if (user) {
            named.push(user.label);
          }
        });
        return named.toString().replace(",", ", ");
      },

      changeQuery(reqId) {
        let _self =  this;
        _self.$axios({
          method: "post",
          url: "/change/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            reqId: reqId,
          }
        })
        .then(function (res) {
          _self.currentReqChange = eval(res.data);
        })
      },

      uploadAction(params) {
        let _self =  this;
        _self.checking = true;
        let file = params.file;
        let fileList = _self.qform.fileList || [];

        if (file.name.indexOf("_V") > -1) {
          _self.$message.warning("请去除文件名中包含的字符串： _V");
          _self.$refs.uploadMod.uploadFiles = fileList.filter(item => {
            return item.status == 'success'
          }) || [];
          return;
        }
        commonQuery.attachmentUpload(file, fileList, (res) => {
          _self.qform.fileList = res;
          _self.checking = false;
        })
      },

      inputCheck() {
        let _self =  this;
        if (_self.form.id && _self.form.id != '') {
          _self.form.type = [];
          _self.form.priority = '';
          _self.form.status = [];
          _self.form.submitter = '';
          _self.form.moduleId = '';
          _self.form.submitDate.splice(0, _self.form.submitDate.length);
          _self.form.combineDisabled = true;
        } else {
          let dayS = new Date();
          dayS.setTime(dayS.getTime() - 3600 * 1000 * 24 * 90);
          _self.form.submitDate.push(dateFormat(new Date(dayS), _self.datefmt));
          _self.form.submitDate.push(dateFormat(new Date(), _self.datefmt));
          _self.form.combineDisabled = false;
        }
      },

      toMissions(data, taskType) {
        let _self =  this;
        _self.changeOnWay(data.id, (changeCount) => {
          if (changeCount > 0) {
            _self.$confirm("是否前往变更页面查看？", "需求变更未完成，请暂勿操作", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
              .then(() => {
                _self.$router.push({
                  name: "change",
                  params: {
                    reqId: data.id
                  }
                });
              })
              .catch(() => {
              });
          } else {
            _self.$router.push({
              name: "missions",
              params: {
                reqId: data.id,
                type: taskType
              }
            });
          }
        });
      },

      resetForm(formName) {
        this.$refs[formName].resetFields();
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
            reqId: reqId,
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

      cancelClose(done) {
        let _self =  this;
        _self.showReqClose = false;
        _self.closeForm.closeStyle = "";
        _self.qform.status = _self.currentRequest.status;
        _self.$message.warning("取消关闭操作，需求状态已还原！");
        if (typeof done == "function") {
          done();
        }
      },

      checkCloseRequestSave() {
        let _self =  this;
        _self.$refs.reqCloseForm.validate((valid) => {
          if (!valid) {
            _self.$message.warning("表单校验不通过，无法提交！");
            return;
          } else {
            _self.showReqClose = false;
          }
        });
      },

      editRequest(data) {
        let _self =  this;
        _self.changeOnWay(data.id, (changeCount) => {
          if (changeCount > 0) {
            _self.$confirm("是否前往变更页面查看？", "变更确认未完成，禁止再次变更", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
              .then(() => {
                _self.$router.push({
                  name: "change",
                  params: {
                    reqId: data.id
                  }
                });
              })
              .catch(() => {
              });
          } else {
            _self.reqCmsQuery(data.id, _ => {
              let cmsNotClosed = _self.currentReqCms.data.filter(item => {
                return item.status > 0;
              });
              _self.reqStatus.forEach(item => {
                _self.$set(item, "disabled", cmsNotClosed.length == 0 && item.value > 1);
              });
            });
            _self.showDialogMod = true;
            _self.currentRequest = data;
            _self.currentRequest.attachments = _self.getAttach(data.attachment);
            _self.qform.type = data.type;
            _self.qform.relId = data.relId;
            _self.qform.priority = data.priority;
            _self.qform.moduleId = data.moduleId;
            _self.qform.expectDate = data.expectDate;
            _self.qform.status = data.status;
            _self.qform.uiResource = data.uiResource;
            _self.qform.sourceId = data.sourceId;
            _self.qform.submitter = data.submitter;
            _self.closeForm.closeStyle = data.closeStyle;
            _self.qform.submitDate = data.submitDate;
            _self.qform.summary = data.summary;
            _self.qform.detail = data.detail;
            _self.qform.fileList = _self.getAttach(data.attachment);
            this.$nextTick(_ => {
              if (_self.$refs.ruledFormMod) {
                _self.$refs.ruledFormMod.clearValidate();
              }
            });
          }
        });
      },

      checkReqUpdate(formName) {
        let _self =  this;
        _self.$refs[formName].validate((valid) => {
          if (!valid) {
            _self.$notify.error("表单校验不通过，无法提交！");
            return;
          } else {
            _self.saveRequestChange();
          }
        });
      },

      saveRequestChange() {
        let _self =  this;
        _self.currentRequest.changeDetail = "";
        let changed = [];
        if (commonQuery.isNull(_self.currentRequest.relId)) {
          _self.showDescription = false;
          _self.saveEditRequest();
          return;
        }
        if (_self.qform.type != _self.currentRequest.type) {
          let newLabel = _self.reqType.find(item => {
            return item.value == _self.qform.type
          }).label;
          let oldLabel = _self.reqType.find(item => {
            return item.value == _self.currentRequest.type
          }).label;
          changed.push("需求类型由【" + oldLabel + "】变更为【" + newLabel + "】");
        }

        if (_self.qform.priority != _self.currentRequest.priority) {
          let newLabel = _self.reqPriority.find(item => {
            return item.value == _self.qform.priority
          }).label;
          let oldLabel = _self.reqPriority.find(item => {
            return item.value == _self.currentRequest.priority
          }).label;
          changed.push("需求优先级由【" + oldLabel + "】变更为【" + newLabel + "】");
        }

        if (_self.qform.moduleId != _self.currentRequest.moduleId) {
          let newLabel = !_self.qform.moduleId ? "空" : _self.modules.find(item => {
            return item.value == _self.qform.moduleId
          }).label;
          let oldLabel = !_self.currentRequest.moduleId ? "空" : _self.modules.find(item => {
            return item.value == _self.currentRequest.moduleId
          }).label;
          changed.push("所属模块由【" + oldLabel + "】变更为【" + newLabel + "】");
        }

        if (_self.qform.uiResource != _self.currentRequest.uiResource) {
          changed.push("圆形连接由【" + _self.currentRequest.uiResource + "】变更为【" + _self.qform.uiResource + "】");
        }

        if (_self.qform.expectDate != _self.currentRequest.expectDate) {
          changed.push("需求期望完成日期由【" + _self.currentRequest.expectDate + "】变更为【" + _self.qform.expectDate + "】");
        }

        if (_self.qform.summary != _self.currentRequest.summary) {
          changed.push("需求摘要由【" + _self.currentRequest.summary + "】变更为【" + _self.qform.summary + "】");
        }

        let oldFiles = [];
        let newFiles = [];
        _self.currentRequest.attachments.forEach(f => {
          oldFiles.push(f.name);
        });
        _self.qform.fileList.forEach(f => {
          newFiles.push(f.name);
        });

        let added = [];
        let removed = [];
        oldFiles.forEach(item => {
          if (newFiles.length == 0) {
            removed = oldFiles;
            return;
          } else if (newFiles.indexOf(item) == -1) {
            removed.push(item);
          }
        });
        newFiles.forEach(item => {
          if (oldFiles.length == 0) {
            added = newFiles;
            return;
          } else if (oldFiles.indexOf(item) == -1) {
            added.push(item);
          }
        });
        if (added.length > 0 || removed.length > 0) {
          changed.push("需求附件变更：");
        }

        if (changed.length > 0) {
          _self.showDescription = true;
          changed.forEach((item, index) => {
            if (index == changed.length - 1) {
              _self.currentRequest.changeDetail += (index + 1) + "、" + item;
            } else {
              _self.currentRequest.changeDetail += (index + 1) + "、" + item + "；\n";
            }
          });
          if (added.length > 0) {
            _self.currentRequest.changeDetail += "新增需求附件《" + added.toString().replace(/,/g, "》、《") + "》";
          }
          if (removed.length > 0) {
            _self.currentRequest.changeDetail += "删除需求附件《" + removed.toString().replace(/,/g, "》、《") + "》";
          }
        } else {
          _self.showDescription = false;
          _self.saveEditRequest();
        }
      },

      saveEditRequest() {
        let _self =  this;
        const reqChanged = _self.showDescription;
        const reqClosed = _self.qform.status == 0 && _self.currentRequest.status > 0;

        if (reqChanged == true && (!_self.currentRequest.changeDesc || _self.currentRequest.changeDesc == "")) {
          _self.$message.warning("请填写需求变更操作说明！");
          return;
        }
        let fileIds = [];
        _self.qform.fileList.forEach(function (fs, i) {
          if (fs.response) {
            fileIds.push(fs.response[0].id);
          } else {
            fileIds.push(fs.id);
          }
        });
        _self.checking = true;
        _self.showDescription = false;
        _self.$axios.post("/req/update/" + (reqChanged == true ? 1 : 0), {
          id: _self.currentRequest.id,
          summary: _self.qform.summary,
          expectDate: _self.qform.expectDate,
          type: _self.qform.type,
          relId: _self.qform.relId,
          moduleId: _self.qform.moduleId,
          priority: _self.qform.priority,
          uiResource: _self.qform.uiResource,
          status: _self.qform.status,
          closeStyle: reqClosed ? _self.closeForm.closeStyle : null,
          attachment: fileIds.toString(),
          detail: _self.qform.detail,
          changeDesc: _self.currentRequest.changeDesc,
          changeDetail: _self.currentRequest.changeDetail
        })
        .then(function (res) {
          if (res.data == 1) {
            _self.$message.success("需求信息修改成功！");
            _self.showDialogMod = false;
            _self.reqQuery();
            setTimeout(() => {
              _self.checking = false;
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

      fileExceeded(files, fileList) {
        this.$message.info("文件个数超出限制！");
        return;
      },

      uploadComplete(res, file, fileList) {
        let _self =  this;
        _self.qform.fileList = fileList;
      },

      handleRemoveMod(file, fileList) {
        let _self =  this;
        _self.$message.success("文件删除成功！");
        _self.qform.fileList = fileList;
      },

      handlePreview(file) {
        commonQuery.attachmentDownload(file);
      },

      getAttach(attachId) {
        return commonQuery.attachmentQuery(attachId);
      },

      releaseQuery() {
        let _self =  this;
        _self.releases.splice(0, _self.releases.length);
        commonQuery.releaseQuery((result) => {
          _self.releases = result.releasesWithBranch;
        })
      },

      memberQuery() {
        let _self =  this;
        commonQuery.memberQuery((result) => {
          _self.members = result.users;
          _self.memberFull = result.usersFull;
          _self.userOptions = result.usersFull;
        });
      },

      moduleQuery(callback) {
        let _self =  this;
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
          _self.form.moduleIds.splice(0, _self.form.moduleIds.length);
          for (var i = 0; i < moduleList.length; i++) {
            _self.modules.push({
              label: moduleList[i].moduleName,
              value: moduleList[i].moduleId
            });
            if (_self.roleAllow([1, 16]) && moduleList[i].pdResponser == sessionStorage.userId) {
              _self.form.moduleIds.push(moduleList[i].moduleId);
            }
            if (_self.roleAllow([3, 5]) && moduleList[i].devResponser == sessionStorage.userId) {
              _self.form.moduleIds.push(moduleList[i].moduleId);
            }
            if (_self.roleAllow([4, 6]) && moduleList[i].testResponser == sessionStorage.userId) {
              _self.form.moduleIds.push(moduleList[i].moduleId);
            }
          }
          if (typeof callback == "function") {
            callback();
          }
        })
      },

      reqQuery() {
        let _self =  this;
        _self.queryLoading = true;
        let submitDateBegin = "",
          submitDateEnd = "";
        if (_self.form.submitDate && _self.form.submitDate.length > 1) {
          submitDateBegin = _self.form.submitDate[0];
          submitDateEnd = _self.form.submitDate[1];
        }
        _self.$axios({
            method: "post",
            url: "/req/query",
            headers: {
              "Content-type": "application/x-www-form-urlencoded"
            },
            params: {
              reqId: _self.form.id,
              relId: _self.form.relId,
              moduleIds: _self.form.moduleIds.toString(),
              submitDateBegin: submitDateBegin,
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

      relReqQuery() {
        let _self =  this;
        _self.queryLoading = true;
        _self.$axios.post("/req/rel_query/" + _self.params.relId + "/" + _self.currentPage + "/" + _self.pageSize)
        .then(function (res) {
          _self.tableData = eval(res.data.list);
          _self.pageInfo = res.data;
          setTimeout(() => {
            _self.queryLoading = false;
          }, 200);
        })
        .catch(function (response) {
          _self.queryLoading = false;
          console.log(response);
        });
      },

      reqCmsQuery(reqId, callback) {
        let _self =  this;
        _self.$axios({
            method: "post",
            url: "/cms/query",
            headers: {
              "Content-type": "application/x-www-form-urlencoded"
            },
            params: {
              reqId: reqId,
              pageNum: _self.currentReqCms.currentPage,
              pageSize: _self.currentReqCms.pageSize
            }
          })
          .then(function (res) {
            _self.currentReqCms.pageInfo = res.data;
            _self.currentReqCms.data = eval(res.data.list);
            if (typeof callback == "function") {
              callback();
            }
          })
          .catch(function (response) {
            _self.$notify.error("开发任务信息查询时发生程序错误！");
            console.log(response);
          });
      },

      defectQuery(reqId) {
        let _self =  this;
        if (null == reqId || reqId == "") {
          _self.currentReqBug.data = [];
          return;
        }
        _self.$axios({
            method: "post",
            url: "/defect/query",
            headers: {
              "Content-type": "application/x-www-form-urlencoded"
            },
            params: {
              reqId: reqId,
              pageNum: _self.currentReqBug.currentPage,
              pageSize: _self.currentReqBug.pageSize
            }
          })
          .then(function (res) {
            _self.currentReqBug.data = eval(res.data.list);
            _self.currentReqBug.pageInfo = res.data;
          })
          .catch(function (response) {
            _self.$notify.error("缺陷信息查询时发生程序错误！");
            console.log(response);
          });
      }
    },
  };
</script>

<style>
  .rform-box {
    width: 97% !important;
    border: 1px solid #e4edf3;
    border-radius: 2px;
    padding: 1.5%;
    -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
  }

  .rform-box .el-form-item .el-input {
    width: 150px;
  }

  .req-form .el-form-item .el-input {
    width: 180px;
  }

  .rform-box .el-form-item .muti-select .el-input {
    width: 180px;
  }

  .rform-box .el-table .cell {
    padding: 0 5px;
  }

  .detail-table,
  .detail-table + .page-set {
    margin-left: 3% !important;
    width: 96.5% !important;
  }

  .req-detail-collapse .el-input, .req-detail-collapse .el-select {
    width: 170px;
  }

  .req-detail-collapse i {
    font-size: 15px;
  }

  .req-detail-collapse .el-input input, .req-detail-collapse .el-select input {
    cursor: initial;
  }

  .req-detail-collapse .el-select .el-input__suffix {
    display: none;
  }

  .req-detail-collapse .el-collapse-item__arrow {
    font-weight: 600;
    line-height: 45px;
  }

  .req-sum-tips {
    -webkit-appearance: none;
    color: #3AB4D7;
    background-color: #F5F7FA;
    height: 28px;
    line-height: 28px;
    padding: 0 15px;
    border: none;
    border-bottom: 1px solid #DCDFE6;
    border-radius: 2px;
    background-image: none;
    box-sizing: border-box;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    font-size: 12px;
    width: 758px !important;
  }

  .req-sum-tips span {
    color: #3AB4D7 !important;
    cursor: pointer !important;
  }

  .req-sum-tips input:hover {
    color: #61c3df;
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

  .req-status-tip {
    margin-bottom: 10px;
    color: #61c3df;
  }

  .rform-box .el-table i {
    font-size: 14px;
    cursor: pointer;
    color: #3AB4D7;
  }

  .sepp-table-expand .content-tips {
    -webkit-appearance: none;
    color: #3AB4D7;
    cursor: pointer;
    background-color: #F5F7FA;
    height: 28px;
    line-height: 28px;
    width: 150px;
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

  .req-history {
    max-height: 600px;
    padding: 0 30px;
    overflow-y: auto;
  }

  .req-history .el-timeline-item {
    padding-bottom: 10px;
  }

  .req-history .el-timeline-item__content {
    padding: 5px;
  }

  .require-main .case-menu {
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
</style>
