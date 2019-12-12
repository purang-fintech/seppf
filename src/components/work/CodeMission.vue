<template>
  <div id="root" style="width: 100%">
    <el-dialog :close-on-click-modal="modalClose" title="开发任务附件清单" :visible.sync="showAttachDialog" width="960px">
      <el-table :data="currentCmsAttachs" size="mini" class="cms-detail-table" empty-text="当前需求没有上传附件" stripe>
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
        <span style="font-size:18px">开发任务详细信息</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>

      <el-collapse v-model="activeName" accordion class="cms-detail-collapse">
        <el-collapse-item name="cmsDetail">
          <template slot="title">
            <i class="el-icon-info"></i>
            <span> 开发任务明细</span>
          </template>
          <el-form :model="currentCms" size="mini" :inline="true" label-width="120px">
            <el-form-item label="任务编号">
              <el-input v-model="currentCms.id" disabled>任务编号</el-input>
            </el-form-item>
            <el-form-item label="拆分人">
              <el-input v-model="currentCms.spliterName" disabled>拆分人</el-input>
            </el-form-item>
            <el-form-item label="拆分日期">
              <el-input v-model="currentCms.splitDate" disabled>拆分日期</el-input>
            </el-form-item>
            <el-form-item label="负责人">
              <el-input v-model="currentCms.responserName" disabled>负责人</el-input>
            </el-form-item>
            <el-form-item label="所需人日">
              <el-input v-model="currentCms.manpower" disabled>所需人日</el-input>
            </el-form-item>
            <el-form-item label="计划完成日期">
              <el-input v-model="currentCms.planTo" disabled>计划完成日期</el-input>
              </el-date-picker>
            </el-form-item>
            <el-form-item label="任务状态">
              <el-input v-model="currentCms.statusName" disabled>任务状态</el-input>
            </el-form-item>
            <br>
            <el-form-item>
              <template slot="label">
                <el-tooltip content="点击查看产品需求详情" placement="left" effect="dark">
                  <span>任务摘要</span>
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <el-popover
                  placement="left-start"
                  width="600"
                  trigger="click">
                  <el-input type="textarea" v-model="currentCms.detail" :rows="10" disabled resize="none" placeholder="未录入开发任务详情"></el-input>
                  <el-input class="cms-sum-tips" v-model="currentCms.summary" disabled slot="reference">
                  </el-input>
                </el-popover>
              </template>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item name="cmsAttach">
          <template slot="title">
            <i class="el-icon-upload"></i>
            <span v-if="activeName=='cmsAttach'"> 开发任务附件</span>
            <span v-else> 开发任务附件({{currentCmsAttachs.length}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="currentCmsAttachs" size="mini" class="cms-detail-table" empty-text="本开发任务没有上传附件" stripe>
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
        </el-collapse-item>

        <el-collapse-item name="parentReqDetail">
          <template slot="title">
            <i class="el-icon-info"></i>
            <span> 所属产品需求明细</span>
          </template>
          <el-form v-model="parentReq" size="mini" inline label-width="120px">
            <el-form-item label="需求编号">
              <el-input v-model="parentReq.id" disabled></el-input>
            </el-form-item>
            <el-form-item label="需求类型">
              <el-input v-model="parentReq.typeName" disabled></el-input>
            </el-form-item>
            <el-form-item label="所属模块">
              <el-input v-model="parentReq.moduleName" disabled></el-input>
            </el-form-item>
            <el-form-item label="紧急程度">
              <el-input v-model="parentReq.priorityName" disabled></el-input>
            </el-form-item>
            <el-form-item label="需求状态">
              <el-input v-model="parentReq.statusName" disabled></el-input>
            </el-form-item>
            <el-form-item label="提交人">
              <el-input v-model="parentReq.submitterName" disabled></el-input>
            </el-form-item>
            <el-form-item label="提交日期">
              <el-input v-model="parentReq.submitDate" disabled></el-input>
            </el-form-item>
            <el-form-item label="期望完成日期">
              <el-input v-model="parentReq.expectDate" disabled></el-input>
            </el-form-item>
            <el-form-item label="产品负责人">
              <el-input v-model="parentReq.proderName" disabled></el-input>
            </el-form-item>
            <el-form-item label="开发负责人">
              <el-input v-model="parentReq.deverName" disabled></el-input>
            </el-form-item>
            <el-form-item label="测试负责人">
              <el-input v-model="parentReq.testerName" disabled></el-input>
            </el-form-item>
            <el-form-item label="所属版本">
              <el-input v-model="parentReq.relCode" disabled></el-input>
            </el-form-item>
            <el-form-item label="原型链接" prop="uiResource">
              <el-input v-model="parentReq.uiResource" style="width:465px" disabled></el-input>
            </el-form-item>
            <el-form-item label="链接预览" v-if="checkUrl(parentReq.uiResource)">
              <el-link type="success" :href="parentReq.uiResource" :underline="false" target="_blank">原型链接</el-link>
            </el-form-item>
            <el-form-item>
              <template slot="label">
                <el-tooltip content="点击查看产品需求详情" placement="left" effect="dark">
                  <span>需求摘要</span>
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <el-popover
                  placement="left-start"
                  width="600"
                  trigger="click">
                  <el-input type="textarea" v-model="parentReq.detail" :rows="10" disabled resize="none"
                            placeholder="未录入产品需求详情"></el-input>
                  <el-input class="cms-sum-tips" v-model="parentReq.summary" disabled slot="reference">
                  </el-input>
                </el-popover>
              </template>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item name="reqAttach">
          <template slot="title">
            <i class="el-icon-upload"></i>
            <span v-if="activeName=='reqAttach'"> 所属产品需求附件</span>
            <span v-else> 所属产品需求附件({{parentReqAttachs.length}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="parentReqAttachs" size="mini" class="cms-detail-table" empty-text="所属产品需求没有上传附件" stripe>
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
        </el-collapse-item>

        <el-collapse-item name="brotherCms">
          <template slot="title">
            <i class="iconfont icon-label"></i>
            <span v-if="activeName=='brotherCms'"> 所属产品需求下全部开发任务</span>
            <span v-else> 所属产品需求下全部开发任务({{brotherCms.pageInfo.total}} 条记录，展开可查看)</span>
          </template>
          <el-table :data="brotherCms.data" size="mini" class="cms-detail-table" :row-class-name="isCurrentRow" empty-text="所属产品需求下无其他开发任务" stripe>
            <el-table-column type="index" label="序号" width="40" align="center">
            </el-table-column>
            <el-table-column prop="id" label="任务编号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="statusName" label="任务状态" width="80" align="center">
            </el-table-column>
            <el-table-column prop="spliterName" label="拆分人" width="90" align="center">
            </el-table-column>
            <el-table-column prop="splitDate" label="拆分日期" width="90" align="center">
            </el-table-column>
            <el-table-column prop="responserName" label="负责人" width="90" align="center">
            </el-table-column>
            <el-table-column prop="planTo" label="计划完成" width="90" align="center">
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
              :current-page="brotherCms.currentPage"
              :page-sizes="[5, 10]"
              :page-size="brotherCms.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="brotherCms.pageInfo.total">
            </el-pagination>
          </div>
        </el-collapse-item>

        <el-collapse-item name="parentReqBug">
          <template slot="title">
            <i class="iconfont icon-bug"></i>
            <span v-if="activeName=='parentReqBug'"> 所属产品需求关联产品缺陷</span>
            <span v-else> 所属产品需求关联产品缺陷({{parentReqBug.pageInfo.total}} 条记录，展开可查看)</span>
          </template>

          <el-table :data="parentReqBug.data" size="mini" class="cms-detail-table" empty-text="所属产品需求尚未发现或上报缺陷" stripe>
            <el-table-column prop="id" label="缺陷编号" width="100" align="center">
            </el-table-column>
            <el-table-column prop="foundTime" label="发现时间" width="140" align="center">
            </el-table-column>
            <el-table-column prop="statusName" label="缺陷状态" width="80" align="center">
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
              :current-page="parentReqBug.currentPage"
              :page-sizes="[5, 10]"
              :page-size="parentReqBug.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="parentReqBug.pageInfo.total">
            </el-pagination>
          </div>
        </el-collapse-item>
      </el-collapse>

      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDetail=false" size="small">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="产品需求拆分开发任务" :visible.sync="showDialog" width="960px" :fullscreen="maximize1">
      <div slot="title">
        <span style="font-size:18px">产品需求拆分开发任务</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize1=!maximize1">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize1==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize1==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form :model="nform" size="mini" :rules="nformRules" ref="ruledFromN" :inline="true" label-width="110px" class="mission-form">
        <el-form-item label="计划开始日期" prop="planBegin" required>
          <el-date-picker type="date" v-model="nform.planBegin" placeholder="请选择" :value-format="datefmt" clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="计划完成日期" prop="planTo" required>
          <el-date-picker type="date" v-model="nform.planTo" placeholder="请选择" :value-format="datefmt" clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="所需人日" prop="manpower" required>
          <el-input v-model="nform.manpower" placeholder="请输入（人日）" clearable>所需人日</el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="responser" required>
          <el-select v-model="nform.responser" placeholder="请选择" clearable filterable :filter-method="filterUsers2" @visible-change="resetFilterText">
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
        <el-form-item label="所属模块" prop="moduleId" required>
          <el-select v-model="nform.moduleId" placeholder="请选择" disabled>
            <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务摘要" prop="summary" required>
          <el-input v-model="nform.summary" placeholder="请输入工作任务摘要" class="cm-summary" clearable>任务摘要</el-input>
        </el-form-item>
        <el-form-item label="任务详情" prop="detail">
          <el-input v-model="nform.detail" type="textarea" :rows="2" placeholder="请输入任务详情" class="cms-attach-upload" :maxlength="2000" show-word-limit clearable>任务详情</el-input>
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload
            class="cms-attach-upload"
            ref="upload"
            multiple drag
            :limit="5"
            :on-exceed="fileExceeded"
            :before-upload="beforeUpload"
            :on-success="uploadComplete"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="nform.fileList"
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
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="resetForm('ruledFromN')" size="small">重置</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkSaveCmsCreate('ruledFromN')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="开发任务信息修改" :visible.sync="showDialogMod" width="960px" :fullscreen="maximize2">
      <div slot="title">
        <span style="font-size:18px">开发任务信息修改</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize2=!maximize2">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize2==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize2==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form :model="nform" size="mini" :rules="nformRules" ref="ruledFromC" :inline="true" label-width="110px" class="mission-form">
        <el-form-item label="任务状态" prop="status" required>
          <el-select v-model="nform.status" placeholder="请选择" clearable>
            <el-option v-for="opt in permitStatus" :value="opt.value" :key="opt.value" :label="opt.label" :disabled="opt.disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="responser" required>
          <el-select v-model="nform.responser" placeholder="请选择" clearable filterable :filter-method="filterUsers3" @visible-change="resetFilterText">
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
        <el-form-item label="计划开始日期" prop="planBegin" required>
          <el-date-picker type="date" v-model="nform.planBegin" placeholder="请选择" :value-format="datefmt" clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="计划完成日期" prop="planTo" required>
          <el-date-picker type="date" v-model="nform.planTo" placeholder="请选择" :value-format="datefmt" clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="所需人日" prop="manpower" required>
          <el-input v-model="nform.manpower" placeholder="请输入（人日）" clearable>所需人日</el-input>
        </el-form-item>
        <el-form-item label="所属模块" prop="moduleId" required>
          <el-select v-model="nform.moduleId" placeholder="请选择" disabled>
            <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务摘要" prop="summary" required>
          <el-input v-model="nform.summary" placeholder="请输入任务摘要" class="cm-summary" clearable>任务摘要</el-input>
        </el-form-item>
        <el-form-item label="任务详情" prop="detail">
          <el-input v-model="nform.detail" type="textarea" :rows="2" placeholder="请输入任务详情" class="cms-attach-upload" :maxlength="2000" show-word-limit clearable>任务详情</el-input>
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload
            class="cms-attach-upload"
            ref="upload"
            multiple drag
            :limit="5"
            :on-exceed="fileExceeded"
            :before-upload="beforeUpload"
            :on-success="uploadComplete"
            :on-preview="handlePreview"
            :on-remove="handleRemoveMod"
            :file-list="nform.fileList"
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
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialogMod=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkSaveCmsMod('ruledFromC')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <div class="cmform-box">
      <el-form ref="form" :inline="true" size="mini" label-width="110px" @keydown.native.enter="missionQuery()">
        <el-form-item label="任务拆分人">
          <el-select v-model="mform.spliter" clearable filterable :filter-method="filterUsers" @visible-change="resetFilterText">
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
        <el-form-item label="任务负责人">
          <el-select v-model="mform.responser" clearable filterable :filter-method="filterUsers1" @visible-change="resetFilterText">
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
        <el-form-item label="所属模块">
          <el-select v-model="mform.moduleId" clearable>
            <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="版本号">
          <el-select v-model="mform.relId" clearable placeholder="请选择版本">
            <el-option v-for="opt in releases" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品需求号">
          <el-input v-model="mform.reqId" placeholder="请输入" clearable>产品需求号</el-input>
        </el-form-item>
        <el-form-item label="任务号">
          <el-input v-model="mform.id" placeholder="请输入" clearable>任务号</el-input>
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select v-model="mform.status" clearable filterable multiple collapse-tags class="muti-select">
            <el-option v-for="opt in cmsStatus" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划完成日期">
          <el-date-picker v-model="mform.planTo" type="daterange" align="right" unlink-panels :value-format="datefmt" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button v-no-more-click type="primary" icon="el-icon-share" @click="beginSplit(mform.reqId)" :disabled="btnDisabled || !isManage()">任务拆分</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="missionQuery()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="dataRevert" :max-height="tableHeight" size="mini" stripe :border="showBorder" ref="cmsTable"
          v-loading="queryLoading"
          element-loading-text="查询中..."
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column label="产品需求号" width="100" align="center" prop="id" sortable>
          <template slot-scope="scope">
            <el-tooltip content="点此，产品需求拆分开发任务" placement="right-end" effect="dark">
              <el-button v-no-more-click size="mini" type="text" @click="beginSplit(scope.row.reqId)" :disabled="!isManage()">{{scope.row.reqId}}</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="任务编号" width="100" align="center" sortable>
          <template slot-scope="scope">
            <el-button v-no-more-click type="text" size="mini" @click="showCmsDetail(scope.row)">{{scope.row.id}}</el-button>
            <i class="iconfont icon-attachment" v-if="countAttach(scope.row.attachment) > 0" @click="showAttachs(scope.row)"></i>
          </template>
        </el-table-column>
        <el-table-column prop="summary" label="任务摘要" header-align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="moduleName" label="所属模块" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="statusName" label="任务状态" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="responserName" label="负责人" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="planBegin" label="计划开始" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="planTo" label="计划完成" width="100" align="center" sortable>
          <template slot="header" slot-scope="slot">
            <el-tooltip content="计划完成日期小于当日且未达成【提测】或之后状态，数据为橙色" placement="left" effect="dark">
              <span>计划完成</span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <div v-html="scope.row.planToHtml"></div>
          </template>
        </el-table-column>
        <el-table-column prop="manpower" label="人力(人日)" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="spliterName" label="拆分人" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="splitDate" label="拆分日期" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column width="120" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="warning" size="mini" @click="beginEdit(scope.row)">编辑</el-button>
            <el-button v-no-more-click type="primary" size="mini" @click="missionDeal(scope.row)">跟踪</el-button>
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
          @click="exportCSV('开发任务数据', 'cmsTable')">
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

const validateManpower = (rule, value, callback) => {
  if (!value) {
    callback(new Error('必须输入所需人力'))
  }
  value = Number(value);
  if (typeof value != 'number' || isNaN(value)) {
    callback(new Error('所需人力必须为数字'))
  }
  callback();
}

export default {
  data() {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      hideCmsTips: localStorage.hideCmsTips && localStorage.hideCmsTips == 'true',
      tableData: [],
      queryLoading: false,
      pageInfo: {},
      maximize: false,
      maximize1: false,
      maximize2: false,
      tableHeight: 0,
      btnDisabled: true,
      sync: false,
      members: [],
      memberFull: [],
      userOptions: [],
      userOptions1: [],
      userOptions2: [],
      userOptions3: [],
      releases: [],
      modules: [],
      permitStatus: [],
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      showDialog: false,
      showDialogMod: false,
      showAttachDialog: false,
      activeName: "cmsDetail",
      showDetail: false,
      dialogWidth: document.body.clientWidth - 100,
      currentCmsAttachs: [],
      parentReqAttachs: [],
      parentReq: {},
      parentReqBug:{
        data: [],
        pageInfo: {},
        currentPage: 1,
        pageSize: 5
      },
      brotherCms: {
        data: [],
        pageInfo: {},
        currentPage: 1,
        pageSize: 5
      },
      reqType: [],
      reqStatus: [],
      reqPriority: [],
      cmsStatus: [],
      mform: {
        reqId: "",
        id: "",
        moduleId: "",
        planBegin: [],
        planTo: [],
        relDate: "",
        relId: "",
        spliter: "",
        responser: "",
        status: [1,2,3,4,5]
      },
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      nform: {
        spliter: "",
        responser: "",
        status: 1,
        moduleId: "",
        planBegin: "",
        planTo: "",
        manpower: "",
        summary: "",
        detail:"",
        fileList: []
      },
      currentCms : {},
      nformRules: {
        responser: [{ required: true, message: '请选择负责人', trigger: 'change' }],
        planBegin: [{ type: 'string', required: true, message: '请选择计划开始日期', trigger: 'blur' }],
        planTo: [{ type: 'string', required: true, message: '请选择计划完成日期', trigger: 'blur' }],
        manpower: [{ validator: validateManpower, trigger: 'blur'}],
        summary: [
          { required: true, message: '请输入工作任务摘要', trigger: 'blur' },
          { min: 5, max: 50, message: '长度在 5 到 50 个字', trigger: 'blur' }
        ],
        detail: [
          { min: 0, max: 2000, message: '长度不可超过 2000 字，内容过多请上传附件', trigger: 'blur' }
        ]
      }
    };
  },

  computed: {
    dataRevert() {
      for (let i = 0, datas = this.tableData; i < datas.length; i++) {
        let now = new Date(dateFormat(new Date(), this.datefmt) + " 00:00:00").getTime();
        let planTo = new Date(datas[i].planTo + " 00:00:00").getTime();
        if ((planTo - now) < 0  && datas[i].status < 4  && datas[i].status > 0) {
          this.$set(datas[i], "planToHtml", "<span style='color:orange;font-weight:500'>"+ datas[i].planTo + "</span>");
        } else {
          this.$set(datas[i], "planToHtml", "<span style='color:#606266'>"+ datas[i].planTo + "</span>");
        }
        this.tableData.splice(i, 1, datas[i]);
      }
      return this.tableData;
    }
  },

  watch: {
    hideCmsTips: function(val, old) {
      if (val != old) {
        localStorage.setItem("hideCmsTips", val);
      }
    },

    mform: {
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
        this.missionQuery();
      }
    }
  },

  created() {
    let _self =  this;
    _self.tableHeight = bodyAviHeightTab - 65 - 45;
    let dateE = new Date();
    let dateS = new Date();
    dateS.setTime(dateS.getTime() - 3600 * 1000 * 24 * 60);
    dateE.setTime(dateE.getTime() + 3600 * 1000 * 24 * 30);
    let dateBegin = dateFormat(dateS, _self.datefmt);
    let dateEnd = dateFormat(dateE, _self.datefmt);
    _self.nform.splitDate = dateFormat(new Date(), _self.datefmt);
    _self.moduleQuery();

    _self.reqType.splice(0, _self.reqType.length);
    let requirementType = localStorage.getItem("requirementType");
    eval(requirementType).forEach(item => {
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

    _self.cmsStatus.splice(0, _self.cmsStatus.length);
    let codeMissionStatus = localStorage.getItem("codeMissionStatus");
    eval(codeMissionStatus).forEach(item => {
      _self.cmsStatus.push({
        value: item.statusId,
        label: item.statusName
      });
    });

    if (_self.$route.params.relId) {
      _self.releaseQuery();
      _self.$nextTick(function(){
        _self.mform.relId = _self.$route.params.relId;
        _self.mform.reqId = "";
        _self.mform.id = "";
        _self.mform.status = "";
        _self.mform.responser = "";
        _self.mform.spliter = "";
        _self.mform.planTo.splice(0, _self.mform.planTo.length);
        _self.btnDisabled = true;
        _self.memberQuery(_self.missionQuery);
      });
    } else if (_self.$route.params.reqId) {
      _self.mform.reqId = _self.$route.params.reqId;
      _self.nform.reqId = _self.$route.params.reqId;
      _self.mform.relId = "";
      _self.mform.id = "";
      _self.mform.status = "";
      _self.mform.responser = "";
      _self.mform.spliter = "";
      _self.mform.planTo.splice(0, _self.mform.planTo.length);
      _self.btnDisabled = false;
      _self.releaseQuery();
      _self.memberQuery(_self.missionQuery);
    } else if (_self.$route.params.id) {
      _self.mform.id = _self.$route.params.id;
      _self.mform.relId = "";
      _self.mform.reqId = "";
      _self.mform.status = "";
      _self.mform.responser = "";
      _self.mform.spliter = "";
      _self.mform.planTo.splice(0, _self.mform.planTo.length);
      _self.releaseQuery();
      _self.memberQuery(_self.missionQuery);
    } else {
      if (commonQuery.roleAllow([3])) {
        _self.mform.spliter = parseInt(sessionStorage.userId);
        _self.mform.responser = "";
      } else if(commonQuery.roleAllow([5])) {
        _self.mform.spliter = "";
        _self.mform.responser = parseInt(sessionStorage.userId);
      } else {
        _self.mform.spliter = "";
        _self.mform.responser = "";
      }
      _self.mform.planTo.push(dateBegin);
      _self.mform.planTo.push(dateEnd);
      _self.releaseQuery();
      _self.memberQuery(_self.missionQuery);
    }
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

    checkUrl(url) {
      return commonQuery.checkUrl(url);
    },

    isCurrentRow({ row, rowIndex }) {
      console.log(row.id);
      console.log(this.currentCms.id);
      if (row.id == this.currentCms.id) {
        return "current-row";
      }
    },

    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.missionQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.missionQuery();
    },

    handleCurrentChangeCms(current) {
      this.brotherCms.currentPage = current;
      this.brotherCmsQuery(this.currentCms);
    },

    handleSizeChangeCms(size) {
      this.brotherCms.pageSize = size;
      this.brotherCms.currentPage = 1;
      this.brotherCmsQuery(this.currentCms);
    },

    handleCurrentChangeBug(current) {
      this.parentReqBug.currentPage = current;
      this.parentReqBugQuery(this.parentReq.reqId);
    },

    handleSizeChangeBug(size) {
      this.parentReqBug.pageSize = size;
      this.parentReqBug.currentPage = 1;
      this.parentReqBugQuery(this.parentReq.reqId);
    },

    isManage(){
      return commonQuery.roleAllow([2, 3, 10]);
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    showCmsDetail(row){
      let _self =  this;
      _self.activeName = "cmsDetail";
      _self.showDetail = true;
      _self.currentCms = row;
      _self.currentCmsAttachs = _self.getAttach(row.attachment);
      _self.brotherCms.data = [];
      _self.parentReqBug.data = [];
      if (commonQuery.isNull(_self.parentReq.reqId) || _self.parentReq.reqId != row.reqId) {
        _self.parentReqQuery(row.reqId);
        _self.parentReqBugQuery(row.reqId);
      } else {
        _self.parentReqBugQuery(row.reqId);
      }
      _self.brotherCmsQuery(_self.currentCms);
    },

    checkSaveCmsCreate(formName){
      let _self =  this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.saveCmsCreate();
        }
      });
    },

    checkSaveCmsMod(formName){
      let _self =  this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.cmsUpdate();
        }
      });
    },

    missionDeal(row) {
      let _self =  this;
      if (!_self.parentReq || _self.parentReq.reqId != row.reqId) {
        _self.parentReqQuery(row.reqId, () => {
          if (commonQuery.isNull(_self.parentReq.relId)) {
            _self.$message.info("需求尚未纳入版本，请直接跟进需求！");
            return;
          }
          let routeData = _self.$router.push({
            name: "dashboard",
            params: {
              relId: _self.parentReq.relId,
              id: row.id,
              type: 'cms'
            }
          });
        });
      }
    },

    beginSplit(reqId){
      let _self =  this;
      _self.parentReqQuery(reqId);
      _self.changeOnWayReq(reqId, (changeCount) => {
        if (changeCount > 0) {
          _self.$confirm("是否前往变更页面查看？", "需求变更未完成，请暂勿操作", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            _self.$router.push({name: "change", params: {reqId: reqId}});
          })
          .catch(() => {
          });
        } else {
          _self.nform.reqId = reqId;
          _self.nform.spliter = "";
          _self.nform.responser = "";
          _self.nform.status = 1,
          _self.nform.planBegin = "";
          _self.nform.planTo = "";
          _self.nform.manpower = "";
          _self.nform.summary = "";
          _self.nform.detail = "";
          _self.nform.fileList = [];
          _self.showDialog = true;
        }
      });
    },

    changeOnWayReq(reqId, callback){
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
        .then(function(res) {
          let changes = res.data;
          _self.$nextTick(() => {
            if (typeof callback == "function") {
              callback(changes);
            }
          })
        })
        .catch(function(response) {
          console.log(response);
          _self.$notify.error("查询需求变更记录时发生程序错误！");
        });
    },

    changeOnWayCms(id, callback){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/change/on_way",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            cmId: id,
          }
        })
        .then(function(res) {
          let changes = res.data;
          _self.$nextTick(() => {
            if (typeof callback == "function") {
              callback(changes);
            }
          })
        })
        .catch(function(response) {
          console.log(response);
          _self.$notify.error("查询需求变更记录时发生程序错误！");
        });
    },

    beginEdit(data){
      let _self =  this;
      _self.changeOnWayCms(data.id, (changeCount) => {
        if (changeCount > 0) {
          _self.$confirm("是否前往变更页面查看？", "需求变更未完成，请暂勿操作", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            _self.$router.push({name: "change", params: {reqId: data.reqId}});
          })
          .catch(() => {
          });
        } else {
          _self.currentCms = data;
          _self.nform.reqId = data.reqId;
          _self.nform.id = data.id;
          _self.nform.spliter = data.spliter;
          _self.nform.responser = data.responser;
          _self.nform.status = data.status,
          _self.nform.planBegin = data.planBegin;
          _self.nform.planTo = data.planTo;
          _self.nform.moduleId = data.moduleId;
          _self.nform.manpower = data.manpower;
          _self.nform.summary = data.summary;
          _self.nform.detail = data.detail;
          _self.nform.fileList = _self.getAttach(data.attachment);
          _self.showDialogMod = true;
          _self.permitStatus = _self.cmsStatus.concat([]);
        }
      });
    },

    saveCmsCreate() {
      let _self =  this;
      let files = [];
      _self.nform.fileList.forEach(item => {
        files.push(item.id);
      });
      _self.$axios.post("/cms/create", {
        reqId: _self.nform.reqId,
        status: 1,
        spliter: sessionStorage.userId,
        splitDate: _self.nform.splitDate,
        responser: _self.nform.responser,
        manpower: _self.nform.manpower,
        moduleId: _self.nform.moduleId,
        planBegin: _self.nform.planBegin,
        planTo: _self.nform.planTo,
        summary: _self.nform.summary,
        detail: commonQuery.isNull(_self.nform.detail) ? "" : _self.nform.detail,
        attachment: files.toString()
        })
        .then(function(res) {
          if (res.data > 0) {
            _self.showDialog = false;
            _self.$message.success("拆分开发任务保存成功！");
            _self.missionQuery();
          } else {
            _self.$message.info("拆分开发任务保存失败");
            console.log(res);
          }
        })
        .catch(function(response) {
          _self.$notify.error("拆分开发任务时发生程序错误");
          console.log(response);
        });
    },

    cmsUpdate(callback) {
      let _self =  this;
      let files = [];
      _self.nform.fileList.forEach(function(fs, i) {
        if (fs.response) {
          files.push(fs.response[0].id);
        } else {
          files.push(fs.id);
        }
      });

      _self.$axios.post("/cms/update", {
        id: _self.nform.id,
        manpower: _self.nform.manpower,
        planBegin: _self.nform.planBegin,
        planTo: _self.nform.planTo,
        summary: _self.nform.summary,
        attachment: files.toString(),
        moduleId: _self.nform.moduleId,
        status: _self.nform.status,
        detail: commonQuery.isNull(_self.nform.detail) ? "" : _self.nform.detail,
        responser: _self.nform.responser
      })
      .then(function(sres) {
        if (sres.data == 1) {
          _self.showDialogMod = false;
          _self.$message.success("开发任务信息修改成功！");
          _self.missionQuery();
          if (typeof callback == "function") {
            callback();
          }
        } else {
          _self.$message.info("开发任务信息修改保存失败");
        }
      })
      .catch(error => {
        _self.$notify.error("开发任务信息修改时发生程序错误");
        console.log(error);
      });
    },

    countAttach(attach){
      return null == attach || attach == "" ? 0 : attach.split(",").length;
    },

    showAttachs(row){
      let _self =  this;
      _self.showAttachDialog = true;
      _self.currentCmsAttachs = _self.getAttach(row.attachment);
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
        if (typeof callback == "function") {
          callback();
        }
      });
    },

    releaseQuery() {
      let _self =  this;
      _self.releases.splice(0, _self.releases.length);
      commonQuery.openRelQuery((result) => {
        _self.releases = result.releasesWithBranch;
      })
    },

    moduleQuery() {
      let _self =  this;
      _self.$axios({
        method: "post",
        url: "/module/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        }
      })
      .then(function(res) {
        var json = eval(res.data.list);
        let modules = [];
        for (var i = 0; i < json.length; i++) {
          modules.push({
            label: json[i].moduleName,
            value: json[i].moduleId
          });
        }
        _self.modules = modules;
      })
    },

    missionQuery() {
      let _self =  this;
      _self.queryLoading = true;
      let planToBegin = "",
        planToEnd = "";
      if (_self.mform.planTo && _self.mform.planTo.length > 1) {
        planToBegin = _self.mform.planTo[0];
        planToEnd = _self.mform.planTo[1];
      }
      _self.$axios({
        method: "post",
        url: "/cms/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        params: {
          id: _self.mform.id,
          reqId: _self.mform.reqId,
          relId: _self.mform.relId,
          moduleId: _self.mform.moduleId,
          spliter: _self.mform.spliter,
          responser: _self.mform.responser,
          status: _self.mform.status.toString(),
          planToBegin: planToBegin,
          planToEnd: planToEnd,
          pageNum: _self.currentPage,
          pageSize: _self.pageSize
        }
      })
      .then(function(res) {
        _self.tableData = eval(res.data.list);
        _self.pageInfo = res.data;
        setTimeout(() => {
          _self.queryLoading = false;
          _self.queryChanged = false;
        }, 200);
      })
      .catch(function(response) {
        console.log(response);
        _self.queryLoading = false;
      });
    },

    parentReqQuery(reqId, callback) {
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/req/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            reqId: reqId
          }
        })
        .then(function(res) {
          _self.parentReq = eval(res.data.list)[0];
          _self.nform.moduleId = _self.parentReq.moduleId;
          _self.parentReqAttachs = _self.getAttach(_self.parentReq.attachment)
          if (typeof callback == "function") {
            callback();
          }
        })
    },

    parentReqBugQuery(reqId) {
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/defect/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            reqId: reqId,
            pageNum: _self.parentReqBug.currentPage,
            pageSize: _self.parentReqBug.pageSize
          }
        })
        .then(function(res) {
          _self.parentReqBug.data = eval(res.data.list);
          _self.parentReqBug.pageInfo = res.data;
        })
        .catch(function(response) {
          _self.$notify.error("缺陷信息查询时发生程序错误！");
          console.log(response);
        });
    },

    brotherCmsQuery(currentCms){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/cms/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            reqId: currentCms.reqId,
            pageNum: _self.brotherCms.currentPage,
            pageSize: _self.brotherCms.pageSize
          }
        })
        .then(function(res) {
          _self.brotherCms.pageInfo = res.data;
          _self.brotherCms.data = eval(res.data.list);
        })
    },

    openAttach(fileObject) {
      commonQuery.attachmentDownload(fileObject);
    },

    beforeUpload(file){
      if (file.size / 1024 / 1024 > 50) {
        this.$message.info("单个文件不能超过 50MB！");
        return false;
      }
      if (file.name == "") {
        this.$message.info("文件名不能为空，请重命名！");
        return false;
      }
      const fileType = file.name.split(".");
      const forbidden = ['exe', 'msi', 'sh','bat','avi','bmp','jar','war','ear'];
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
      _self.nform.fileList = fileList;
    },

    handleRemoveMod(file, fileList) {
      let _self =  this;
      _self.$message.success("文件删除成功！");
      _self.nform.fileList = fileList;
    },

    handleRemove(file, fileList) {
      let _self =  this;
      commonQuery.attachmentDelete(file, fileList, (res) => {
        _self.nform.fileList = res;
      })
    },

    handlePreview(file) {
      commonQuery.attachmentDownload(file);
    },

    getAttach(attachId) {
      return commonQuery.attachmentQuery(attachId);
    },

    uploadAction(params){
      let _self =  this;
      let file = params.file;
      let fileList = _self.nform.fileList || [];
      let refedUpload = _self.showDialog ? _self.$refs.upload : _self.$refs.uploadMod;
      
      if (file.name.indexOf("_V") > -1) {
        _self.$message.warning("请去除文件名中包含的字符串： _V");
        refedUpload.uploadFiles = fileList.filter(item => {return item.status == 'success'}) || []; 
        return;
      }
      commonQuery.attachmentUpload(file, fileList, (res) => {
        _self.nform.fileList = res;
      })
    }
  }
};
</script>

<style>
.cms-detail-collapse .el-input, .cms-detail-collapse .el-select {
  width: 170px;
}

.cms-detail-collapse i {
  font-size: 15px;
}

.cms-detail-table, 
.cms-detail-table + .page-set{
  margin-left: 3% !important;
  width: 96.5% !important;
}

.cms-detail-collapse .el-input input, .cms-detail-collapse .el-select input{
  cursor: initial;
}

.cms-detail-collapse .el-select .el-input__suffix {
  display: none;
}

.cms-detail-collapse .el-collapse-item__arrow {
  font-weight: 600;
  line-height: 45px;
}

.mission-form .el-form-item .el-input {
  width: 180px;
}

.cmform-box .el-form-item .el-input {
  width: 150px;
}

.cmform-box .el-form-item .muti-select .el-input {
  width: 180px;
}

.cm-summary,
.cm-summary input {
  width: 768px !important;
}

.cms-sum-tips {
  width: 758px !important;
}

.cms-sum-tips input{
  color:#3AB4D7 !important;
  cursor:pointer !important;
}

.cms-sum-tips input:hover{
  color: #61c3df !important;
}

.cms-sum-tips .el-input-group__prepend {
  padding: 0 10px;
}

.cms-attach-upload {
  width: 768px;
}

.cms-attach-upload .el-upload--text {
  width: 100%;
  height: 80px;
}

.cms-attach-upload .el-upload-dragger {
  width: 100%;
  height: 80px;
}

.cms-attach-upload .el-upload-dragger .el-icon-upload {
  margin: 0;
  font-size: 40px;
}

.cmform-box {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.4%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.cmform-box .el-table .cell {
  padding-right: 0px;
}

.cmform-box .el-table i{
  font-size: 14px;
  cursor: pointer;
  color: #3AB4D7;
}

.cms-status-tip {
  margin-bottom: 10px;
  color: #61c3df;
}

.current-row {
  color: #61c3df !important;
  font-weight: 600 !important;
}

.tips {
  width: 100%;
  height: 40px;
  text-align: center;
  line-height: 40px;
  background-color: #909399;
  font-size: 15px;
  color: #fff;
  margin: 25px 0 10px 0;
  border-radius: 2px;
}
</style>
