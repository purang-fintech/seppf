﻿<template>
  <div id="root" style="width: 100%">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-tech"></i> 发布管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>发布清单</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog :close-on-click-modal="modalClose" title="新构建清单" :visible.sync="showDialog" width="1160px" :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">新构建清单</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-collapse accordion class="build-detail-collapse" v-model="newActive">
        <el-collapse-item name="info">
          <template slot="title">
            <i class="el-icon-info"></i> 构建基本信息
          </template>
          <el-form
            :model="newform"
            :rules="formRules"
            ref="ruledForm"
            size="mini"
            :inline="true"
            label-width="100px">
            <el-form-item label="构建版本" prop="relId">
              <el-select v-model="newform.relId" @change="relReqQuery(newform.relId)" style="width:180px" clearable>
                <el-option v-for="opt in newform.releases" :value="opt.value" :key="opt.value" :label="opt.label + '[' + opt.rdate + ']'"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="产品需求" prop="reqId">
              <el-select v-model="newform.reqId" style="width:450px" clearable filterable>
                <el-option v-for="opt in reqs" :value="opt.value" :key="opt.value" :label="opt.value + ' - '+opt.label" :disabled="opt.disabled">
                  <el-tooltip content="已存在该需求的发布文件配置" effect="dark" placement="top" :disabled="!opt.disabled">
                    <span>{{opt.label}}</span>
                  </el-tooltip>
                </el-option>
              </el-select>
            </el-form-item>
            <br>
            <el-form-item label="构建摘要" prop="description">
              <el-input v-model=" newform.description" style="width:735px"></el-input>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item name="file">
          <template slot="title">
            <i class="iconfont icon-computer"></i> 更新文件
          </template>
          <el-form :model="newform" :rules="formRules" ref="ruledForm1" class="modules-ruled-form">
            <el-button
              v-no-more-click
              v-show="newform.buildFiles.length ==0"
              type="primary"
              sizi="mini"
              icon="el-icon-plus"
              @click="addRow()"
              style="width:100%">新增模块
            </el-button>
            <el-table
              v-show="newform.buildFiles.length !=0"
              :data="newform.buildFiles"
              :rules="formRules"
              size="mini"
              :show-header="true"
              :highlight-current-row="false">
              <el-table-column label="组件实例" min-width="15%" align="center">
                <template slot-scope="scope">
                  <el-form-item :prop="'buildFiles[' + scope.$index + '].instance'" :rules='formRules.instance'>
                    <el-select v-model="scope.row.instance" placeholder="组件实例" @change="getParamKeyOfInstance(scope.row.instance)" :disabled="scope.row.instance != ''">
                      <el-option v-for="instance in unSelectedInstance" :value="instance.value" :key="instance.value" :label="instance.label"></el-option>
                    </el-select>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="参数名" min-width="20%" align="center">
                <template slot-scope="scope">
                  <el-form-item :prop="'buildFiles[' + scope.$index + '].paramValue'" :rules='formRules.paramKey'>
                    <el-select v-model="scope.row.paramKey">
                      <el-option v-for="paramKey in paramKeys" :value="paramKey" :key="paramKey" :label="paramKey"></el-option>
                    </el-select>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="文件列表" header-align="center">
                <template slot-scope="scope">
                  <el-form-item :prop="'buildFiles[' + scope.$index + '].paramValue'" :rules='formRules.paramValue'>
                    <el-input
                      v-model="scope.row.paramValue"
                      placeholder="发布文件内容，按空格或者回车分割"
                      type="textarea"
                      resize="none"
                      :rows="2"
                      class="build-attach-upload">
                    </el-input>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column width="60px" align="center">
                <template slot-scope="scope">
                  <el-button type="text" size="small" icon="el-icon-circle-plus-outline" @click="addRow(scope.$index)"></el-button>
                  <el-button type="text" size="small" icon="el-icon-remove-outline" @click="removeRow(scope.$index,scope.row)"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </el-collapse-item>

        <el-collapse-item name="config">
          <template slot="title">
            <i class="iconfont icon-setup"></i> 配置及其他
          </template>
          <el-form :model="newform" ref="newform" size="mini" :inline="false" label-width="0">
            <el-form-item prop="others">
              <el-input
                v-model="newform.others"
                class="build-attach-upload"
                type="textarea"
                :rows="5"
                show-word-limit
                :maxlength="2000"></el-input>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item name="attach">
          <template slot="title">
            <i class="el-icon-upload2"></i> 数据库或附件上传
          </template>
          <el-upload
            class="build-attach-upload"
            ref="upload"
            multiple
            drag
            :limit="10"
            :on-exceed="fileExceeded"
            :before-upload="beforeUpload"
            :on-success="uploadComplete"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="newform.fileList"
            action=""
            :http-request="uploadAction">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">支持图片、Zip包、Office文档、pdf、html、sql文档，单个文件不超过50MB</div>
          </el-upload>
        </el-collapse-item>
      </el-collapse>

      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="saveBuildInfoCreate('ruledForm','ruledForm1')" size="small">确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="修改构建清单" :visible.sync="showDialogMod" width="1160px" :fullscreen="maximize1">
      <div slot="title">
        <span style="font-size:18px">修改构建清单</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize1=!maximize1">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize1==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize1==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-collapse accordion v-model="activeNameMod" class="build-detail-collapse">
        <el-collapse-item name="info">
          <template slot="title">
            <i class="el-icon-info"></i> 构建明细信息
          </template>
          <el-form
            :model="mform"
            :rules="mformRules"
            ref="uruledmform"
            size="mini"
            :inline="true"
            label-width="80px">
            <el-form-item label="构建版本" prop="relId" required>
              <el-select v-model="mform.relId" disabled style="width:180px">
                <el-option v-for="opt in releases" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="产品需求" prop="id" required>
              <el-select v-model="mform.reqId" disabled style="width:500px">
                <el-option v-for="opt in reqs" :value="opt.value" :key="opt.value" :label="'【'+opt.value+'】'+opt.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="构建摘要" prop="description">
              <el-input v-model="mform.description" style="width:763px"></el-input>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item name="files">
          <template slot="title">
            <i class="iconfont icon-computer"></i> 更新文件
          </template>
          <el-form :model="mform" :rules="mformRules" ref="uruledmform1" class="modules-ruled-form">
            <el-button
              v-no-more-click
              v-show="mform.buildFiles.length ==0"
              type="primary"
              sizi="mini"
              icon="el-icon-plus"
              @click="updateAddRow(mform.Id)"
              style="width:100%">新增模块
            </el-button>
            <el-table v-show="mform.buildFiles.length !=0" :data="mform.buildFiles" size="mini" :show-header="true">
              <el-table-column label="组件实例" min-width="15%" align="center">
                <template slot-scope="scope">
                  <el-form-item :prop="'buildFiles[' + scope.$index + '].instance'" :rules='formRules.instance'>
                    <el-select v-model="scope.row.instance" clearable placeholder="实例名" @change="modParamKeyOfInstance(scope.row.instance)" :disabled="scope.row.instance != ''">
                      <el-option v-for="instance in modUnSelectedInstance" :value="instance.value" :key="instance.value" :label="instance.label"></el-option>
                    </el-select>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="参数名" min-width="15%" align="center">
                <template slot-scope="scope">
                  <el-form-item :prop="'buildFiles[' + scope.$index + '].paramKey'" :rules='formRules.paramKey'>
                    <el-select v-model="scope.row.paramKey" clearable>
                      <el-option v-for="paramKey in paramKeys" :value="paramKey" :key="paramKey" :label="paramKey"></el-option>
                    </el-select>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="文件列表" header-align="center">
                <template slot-scope="scope">
                  <el-form-item :prop="'buildFiles[' + scope.$index + '].paramValue'" :rules='formRules.paramValue'>
                    <el-input v-model="scope.row.paramValue" type="textarea" resize="none" :rows="maxRowCount(scope.row.paramValue)" class="build-attach-upload"></el-input>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column width="60px" align="center">
                <template slot-scope="scope">
                  <el-button type="text" size="small" icon="el-icon-circle-plus-outline" @click="updateAddRow(scope.row.noteId)"></el-button>
                  <el-button type="text" size="small" icon="el-icon-remove-outline" @click="updateRemoveRow(scope.$index,scope.row)"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </el-collapse-item>

        <el-collapse-item name="config">
          <template slot="title">
            <i class="iconfont icon-setup"></i> 配置及其他
          </template>
          <el-form :model="mform" size="mini" :inline="false" label-width="0">
            <el-form-item prop="others">
              <el-input
                v-model="mform.others"
                type="textarea"
                :rows="5"
                class="build-attach-upload"
                :maxlength="2000"
                show-word-limit></el-input>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item name="attach">
          <template slot="title">
            <i class="el-icon-upload2"></i> 数据库或其他附件上传
          </template>
          <el-upload
            class="build-attach-upload"
            ref="upload"
            multiple
            drag
            :limit="10"
            :on-exceed="fileExceeded"
            :before-upload="beforeUpload"
            :on-success="uploadCompleteMod"
            :on-preview="handlePreview"
            :on-remove="handleRemoveMod"
            :file-list="mform.fileList"
            action=""
            :http-request="uploadActionMod">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">支持图片、Zip包、Office文档、pdf、html、sql文档，单个文件不超过50MB</div>
          </el-upload>
        </el-collapse-item>
      </el-collapse>

      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialogMod=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="saveBuildInfoUpdate('uruledmform','uruledmform1')" size="small">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showDetail" title="产品构建详细信息" width="1024px" :fullscreen="maximize2">
      <div slot="title">
        <span style="font-size:18px">产品构建详细信息</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize2=!maximize2">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize2==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize2==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-collapse v-model="activeName" accordion class="build-detail-collapse">
        <el-collapse-item name="info">
          <template slot="title">
            <i class="el-icon-info"></i> 构建信息
          </template>
          <el-form :model="buildDetail" ref="newform" size="mini" :inline="true" label-width="120px">
            <el-form-item label="构建摘要">
              <el-input v-model="buildDetail.description" size="mini" style="width:775px" disabled></el-input>
            </el-form-item>
            <el-form-item label="产品需求">
              <el-input style="width:775px" v-model="buildDetail.reqId + ' - ' + buildDetail.reqSummary" size="mini" disabled></el-input>
            </el-form-item>
            <br>
            <el-form-item label="需求提交时间">
              <el-input v-model="buildDetail.submitDate" size="mini" disabled></el-input>
            </el-form-item>
            <el-form-item label="期望完成时间">
              <el-input v-model="buildDetail.expectDate" size="mini" disabled></el-input>
            </el-form-item>
            <el-form-item label="发布版本">
              <el-input v-model="buildDetail.relCode" size="mini" disabled></el-input>
            </el-form-item>
            <el-form-item label="开发负责人">
              <el-input v-model="buildDetail.deverName" size="mini" disabled></el-input>
            </el-form-item>
            <el-form-item label="测试负责人">
              <el-input v-model="buildDetail.testerName" size="mini" disabled></el-input>
            </el-form-item>
            <el-form-item label="SIT计划开始">
              <el-input v-model="buildDetail.sitDate" size="mini" disabled></el-input>
            </el-form-item>
            <el-form-item label="需求提交人">
              <el-input v-model="buildDetail.reqSubmitterName" size="mini" disabled></el-input>
            </el-form-item>
            <el-form-item label="产品负责人">
              <el-input v-model="buildDetail.proderName" size="mini" disabled></el-input>
            </el-form-item>
            <el-form-item label="UAT计划开始">
              <el-input v-model="buildDetail.uatDate" size="mini" disabled></el-input>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item name="fileContent" id="fileContent">
          <template slot="title">
            <i class="iconfont icon-computer" v-if="filesIsFilled ==false"></i><i class="iconfont icon-computer_fill" v-if="filesIsFilled"></i>
            发布应用程序文件内容
          </template>
          <el-table :data="buildDetail.buildFiles" size="mini" :show-header="true">
            <el-table-column prop="instance" label="内容模块" width="100px" align="center">
              <template slot-scope="scope">
                <el-select v-model="scope.row.instance" clearable placeholder="实例名" disabled>
                  <el-option v-for="instance in FileInstances" :value="instance.value" :key="instance.value" :label="instance.label"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="paramKey" label="参数名" width="120px" align="center">
              <template slot-scope="scope">
                <el-select v-model="scope.row.paramKey" clearable disabled>
                  <el-option v-for="paramKey in paramKeys" :value="paramKey" :key="paramKey" :label="paramKey"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="文件内容" width="700px" align="center">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.paramValue"
                  type="textarea"
                  :rows="2"
                  class="build-attach-upload"
                  :maxlength="2000"
                  show-word-limit
                  readonly></el-input>
              </template>
            </el-table-column>
          </el-table>
          <el-button
            @click="copyToClip('fileContent')"
            @mouseenter.native.stop="mouseEnter('fileContent')"
            class='float-button'
            size="small"
            style="right:55px;top:220px"
            v-no-more-click
            v-show="seen">
            {{copy}}
          </el-button>
        </el-collapse-item>

        <el-collapse-item name="other_content">
          <template slot="title">
            <i class="iconfont icon-setup" v-if="othersIsFilled ==false"></i><i class="iconfont icon-setup_fill" v-if="othersIsFilled"></i>其他发布文件内容
          </template>
          <el-input
            id="buildDetailOthers"
            v-model="buildDetail.others"
            type="textarea"
            :rows="5"
            class="build-attach-upload"
            readonly="readonly"
            resize="none"
            @mouseenter.native="mouseEnter('buildDetailOthers')"
            @mouseleave.native="mouseLeave()">
          </el-input>
          <el-button
            v-no-more-click
            class='float-button'
            v-show="seen"
            size="mini"
            @click="copyToClip('buildDetailOthers')"
            @mouseenter.native.stop="mouseEnter('buildDetailOthers')"
            style="right:55px;top:320px">
            {{copy}}
          </el-button>
        </el-collapse-item>

        <el-collapse-item name="attach">
          <template slot="title">
            <i class="iconfont icon-attachment" v-if="attachmentIsFilled ==false"></i><i class="el-icon-upload" v-if="attachmentIsFilled"></i>
            发布文件和数据库附件清单
          </template>
          <el-table :data="buildDetail.attachs" size="mini" empty-text="当前需求没有上传附件" stripe>
            <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
            <el-table-column prop="name" label="文件名" min-width="50%" header-align="center"></el-table-column>
            <el-table-column prop="uploadDate" label="上传时间" min-width="15%" align="center"></el-table-column>
            <el-table-column prop="uploadUserName" label="上传用户" min-width="10%" align="center">
            </el-table-column>
            <el-table-column label="操作" width="110px" align="center">
              <template slot-scope="scope">
                <el-button v-no-more-click type="success" icon="el-icon-download" @click="openAttach(scope.row)" size="mini">下载附件</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDetail=false" size="small">取消</el-button>
      </div>
    </el-dialog>

    <div class="build-form">
      <el-form :inline="true" size="mini" label-width="110px">
        <el-form-item label="构建状态">
          <el-select v-model="buildForm.status" multiple clearable collapse-tags>
            <el-option v-for="opt in buildStatus" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发布提交人">
          <el-select v-model="buildForm.submitter" clearable filterable :filter-method="filterUsers" @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="发布版本号">
          <el-select v-model="buildForm.relId" clearable @change="relReqQuery(buildForm.relId)">
            <el-option v-for="opt in releases" :value="opt.value" :key="opt.value" :label="opt.label + '[' + opt.rdate + ']'"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-checkbox size="mini" v-model="buildForm.hideClosed" @change="releaseQuery()" border>隐藏已关闭版本</el-checkbox>
        </el-form-item>
        <br>
        <el-form-item label="需求状态">
          <el-select v-model="buildForm.reqStatus" multiple clearable collapse-tags>
            <el-option v-for="opt in reqStatuses" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品需求" v-if="buildForm.reqStatus.length==0||buildForm.reqStatus.length==7">
          <el-select v-model="buildForm.reqId" clearable class="wide-select">
            <el-option v-for="opt in reqs" :value="opt.value" :key="opt.value" :label="opt.value + ' - ' + opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button v-no-more-click type="primary" icon="el-icon-circle-plus-outline" @click="newBuild()">新建清单</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="releasenoteQuery()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="checkedData"
        :max-height="tableHeight"
        size="mini"
        stripe
        :border="showBorder"
        v-loading="queryLoading"
        element-loading-text="查询中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column prop="id" label="构建编号" align="center" width="100" sortable>
        </el-table-column>
        <el-table-column
          prop="relCode"
          label="版本号"
          align="center"
          width="120"
          sortable
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="id"
          label="产品需求"
          header-align="center"
          min-width="30%"
          sortable
          show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="breq-sum-tips" @click.stop="toRequest(scope.row.reqId)">{{scope.row.reqId}} - {{scope.row.reqSummary}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="构建状态" align="center" width="100" sortable>
        </el-table-column>
        <el-table-column prop="submitterName" label="发布提交人" width="100px" align="center" sortable>
        </el-table-column>
        <el-table-column prop="description" label="构建摘要" header-align="center" min-width="30%" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="breq-sum-tips" @click="showBuildDetail(scope.row)">{{scope.row.description}}</span>
          </template>
        </el-table-column>
        <el-table-column width="120" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="warning" size="mini" @click.stop="editBuildInfo(scope.row)" :disabled="!scope.row.editAble">编辑</el-button>
            <el-button v-no-more-click type="success" size="mini" @click="routeToDeploy(scope.row)" :disabled="!scope.row.buildAble">构建</el-button>
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
          @click="exportCSV('发布文件清单数据', 'buildTable')">
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
import TableExport from '@/util/TableExport.js'
export default {
  data: function () {
    return {
      noteIdsSet: new Set(),
      timer: null,
      noteIds: [],
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      newActive: "info",
      pageInfo: {},
      maximize: false,
      maximize1: false,
      maximize2: false,
      queryLoading: false,
      subLoading: false,
      currentRelNote: {},
      currentNoteBuild: {},
      showDialog: false,
      releases: [],
      reqs: [],
      expandKeys: [],
      showDetail: false,
      buildStatus: [],
      fillUpActive: false,
      buttonWidth: 0,
      buttonHeight: 0,
      seen: false,
      copy: "",
      buildResults: [],
      envTypes: [],
      responser: "",
      tableData: [],
      showDialogMod: false,
      timefmt: defaultTimeFormat,
      datefmt: defaultDateFormat,
      activeName: "info",
      activeNameMod: "info",
      buildDetail: {
        ip: "",
      },
      filesIsFilled: false,
      othersIsFilled: false,
      attachmentIsFilled: false,
      currentReqDetail: {
        attachs: [],
        data: {}
      },
      currentBuildDetail: {},
      url: {},
      tableHeight: bodyAviHeightNTab - 70 - 45,
      members: [],
      memberFull: [],
      userOptions: [],
      reqStatuses: [],
      buildForm: {
        reqId: "",
        relId: "",
        hideClosed: true,
        submitter: "",
        status: [1, 2],
        reqStatus: [3, 4, 5, 6],
        files: "",
        configs: "",
        others: "",
        attachment: ""
      },
      existsReqs: [],
      form: {
        reqId: "",
        submitter: "",
        relId: "",
        status: "",
        creatDate: "",
        summory: ""
      },
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      mform: {
        id: "",
        relId: "",
        reqId: "",
        id: "",
        status: "",
        buildFiles: [],
        configs: "",
        others: "",
        attachment: "",
        description: "",
        fileList: [],
      },

      newform: {
        reqId: "",
        relId: "",
        id: "",
        releases: [],
        files: "",
        others: "",
        attachment: "",
        description: "",
        fileList: [],
        buildFiles: []
      },

      FileInstances: [],
      modFileInstances: [],
      restoredFileInstances: [],

      paramKeys: [],
      formRules: {
        relId: [{
          required: true,
          message: '构建版本不能为空，请选择构建版本',
          trigger: 'change'
        }],
        reqId: [{
          required: true,
          message: '产品需求号不能为空，请选择产品需求号',
          trigger: 'change'
        }],
        description: [{
            required: true,
            message: '构建描述不能为空',
            trigger: 'blur'
          },
          {
            min: 5,
            max: 50,
            message: '长度在 5 到 50 个字',
            trigger: 'blur'
          }
        ],
        instance: [{
          required: true,
          message: '文件实例不能为空，请选择文件实例',
          trigger: 'change'
        }],
        paramKey: [{
          required: false,
          message: '文件类型不能为空，请选择文件类型',
          trigger: 'change'
        }],
        paramValue: [{
          required: true,
          message: '文件内容不能为空，填写文件或移除此行',
          trigger: 'blur'
        }]
      },
      mformRules: {
        description: [{
            required: true,
            message: '构建描述不能为空',
            trigger: 'blur'
          },
          {
            min: 5,
            max: 50,
            message: '长度在 5 到 50 个字',
            trigger: 'blur'
          }
        ],
        instance: [{
          required: true,
          message: '文件实例不能为空，请选择文件实例',
          trigger: 'change'
        }],
        paramKey: [{
          required: false,
          message: '文件类型不能为空，请选择文件类型',
          trigger: 'change'
        }],
        paramValue: [{
          required: true,
          message: '文件内容不能为空，填写文件或移除此行',
          trigger: 'blur'
        }]
      }
    };
  },

  created: function () {
    let _self = this;

    _self.buildStatus.splice(0, _self.buildStatus.length);
    let releaseNoteStatus = localStorage.getItem("releaseNoteStatus");
    eval(releaseNoteStatus).forEach(item => {
      _self.buildStatus.push({
        value: item.statusId,
        label: item.statusName
      });
    });

    _self.reqStatuses.splice(0, _self.reqStatuses.length);
    let requirementStatus = localStorage.getItem("requirementStatus");
    eval(requirementStatus).forEach(item => {
      _self.reqStatuses.push({
        value: item.statusId,
        label: item.statusName
      });
    });

    _self.envTypes.splice(0, _self.envTypes.length);
    let environmentType = localStorage.getItem("environmentType");
    eval(environmentType).forEach(item => {
      _self.envTypes.push({
        value: item.typeId,
        label: item.typeName
      });
    });

    _self.releaseQuery();
    _self.getAllBuildInstances();
    _self.memberQuery(_self.releasenoteQuery);
  },

  watch: {
    buildForm: {
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
        this.releaseQuery();
      }
    }
  },

  computed: {
    unSelectedInstance: function () {
      return this.FileInstances.filter(function (instance) {
        return instance.isSelected == false
      })
    },

    modUnSelectedInstance: function () {
      return this.restoredFileInstances.filter(function (instance) {
        return instance.isSelected == false
      })
    },

    checkedData: function () {
      let _self = this;
      let isManagers = commonQuery.roleAllow([2, 10, 3, 4, 7]);
      let currentUser = parseInt(sessionStorage.userId);
      _self.tableData.forEach(row => {
        _self.$set(row, "editAble", isManagers || currentUser == row.devResponser || currentUser == row.submitter);
        _self.$set(row, "buildAble", isManagers || currentUser == row.devResponser || currentUser == row.testResponser);
      });
      return _self.tableData;
    }
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

    maxRowCount(text) {
      if (commonQuery.isNull(text)) {
        return 1;
      }
      let count = text.split(/\n/).length;
      return count > 2 ? 2 : count;
    },

    getAllBuildInstances() {
      let _self = this;
      _self.$axios({
          method: "get",
          url: "/build/build-instances",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          }
        })
        .then(function (res) {
          let json = eval(res.data);
          _self.FileInstances.splice(0, _self.FileInstances.length);
          _self.modFileInstances.splice(0, _self.modFileInstances.length);
          for (let i = 0; i < json.length; i++) {
            _self.FileInstances.push({
              isSelected: false,
              value: json[i].instance,
              label: json[i].instance
            });
            _self.modFileInstances.push({
              isSelected: false,
              value: json[i].instance,
              label: json[i].instance
            });
          }
        })
    },

    restoreInstance(row) {
      let _self = this;
      _self.restoredFileInstances.splice(0, _self.restoredFileInstances.length);
      _self.restoredFileInstances = JSON.parse(JSON.stringify(_self.modFileInstances));
      if (row.buildFiles) {
        row.buildFiles.forEach(item => {
          _self.restoredFileInstances.forEach(a => {
            if (a.value == item.instance) {
              _self.$set(a, "isSelected", true)
            }
          })
        })
      }
    },

    getParamKeyOfInstance(instance) {
      let _self = this;
      if (instance != "") {
        _self.FileInstances.forEach(item => {
          if (item.value == instance) {
            _self.$set(item, "isSelected", true)
          }
        })
      }
      _self.$axios({
          method: "get",
          url: "/build/params/" + instance,
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
        })
        .then(function (res) {
          _self.paramKeys = eval(res.data);
          _self.paramKeys = res.data;
          let a = res.data;
          _self.newform.buildFiles.forEach(item => {
            if (item.instance == instance) {
              _self.$set(item, "paramKey", a[0]);
            }
          });
        })
    },

    modParamKeyOfInstance(instance) {
      let _self = this;
      if (instance != "") {
        _self.restoredFileInstances.forEach(item => {
          if (item.value == instance) {
            _self.$set(item, "isSelected", true)
          }
        })
      }
      _self.$axios({
          method: "get",
          url: "/build/params/" + instance,
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
        })
        .then(function (res) {
          _self.paramKeys = eval(res.data);
          let a = res.data;
          _self.mform.buildFiles.forEach(item => {
            if (item.instance == instance) {
              _self.$set(item, "paramKey", a[0]);
            }
          });
        })
    },

    addRow() {
      let _self = this;
      var ins = {
        id: "",
        instance: "",
      }
      _self.newform.buildFiles.push(ins)
    },

    removeRow(index, row) {
      let _self = this;
      _self.newform.buildFiles.splice(index, 1);

      if (row.instance != "") {
        _self.FileInstances.forEach(item => {
          if (item.value == row.instance) {
            _self.$set(item, "isSelected", false)
          }
        })
      }
    },

    updateAddRow(noteId) {
      let _self = this;
      var ins = {
        id: "",
        noteId: noteId,
        instance: "",
      }
      _self.mform.buildFiles.push(ins)
    },

    updateRemoveRow(index, row) {
      let _self = this;
      _self.mform.buildFiles.splice(index, 1);

      if (row.instance != "") {
        _self.restoredFileInstances.forEach(item => {
          if (item.value == row.instance) {
            _self.$set(item, "isSelected", false)
          }
        })
      }
    },

    formatTime(row) {
      return row.buildInterval / 1000;
    },

    routeToDeploy(data) {
      this.$router.push({
        name: 'buildDeployment',
        query: {
          'noteId': data.id,
          'relCode': data.relCode,
          'buildType': 'BUILD_DEPLOY'
        }
      });
    },

    handleCurrentChange(current) {
      if (this.queryChanged == true) {
        this.currentPage = 1;
      } else {
        this.currentPage = current;
      }
      this.releasenoteQuery();
    },

    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.releasenoteQuery();
    },

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    copyToClip(elementId) {
      let _self = this;
      let elem = document.getElementById(elementId);
      elem.select();
      document.execCommand("copy");
      _self.copy = '完成';
    },

    mouseEnter(elementId) {
      let _self = this;
      let elem = document.getElementById(elementId);
      _self.buttonWidth = elem.offsetWidth - 10 + 'px';
      _self.buttonHeight = elem.offsetTop + 5 + 'px';
      _self.copy = "复制";
      _self.seen = true;
    },

    mouseLeave(e) {
      let _self = this;
      _self.seen = false;
    },

    toRequest(data) {
      this.$router.push({
        name: "request",
        params: {
          id: data
        }
      });
    },

    openAttach(file) {
      commonQuery.attachmentDownload(file);
    },

    editBuildInfo(row) {
      let _self = this;
      _self.restoreInstance(row);
      _self.showDialogMod = true;
      _self.mform.id = row.id;
      _self.mform.relId = row.relId;
      _self.mform.reqId = row.reqId;
      _self.mform.status = row.status;
      _self.mform.buildFiles = JSON.parse(JSON.stringify(row.buildFiles));
      _self.mform.description = row.description;
      _self.mform.others = row.others;
      _self.mform.attachment = row.attachment;
      _self.mform.fileList = _self.getAttach(row.attachment);
      _self.relReqQuery(row.relId);
    },

    buildDetailQuery(row) {
      let _self = this;
      _self.buildDetail = row;
      _self.buildDetail.attachs = _self.getAttach(_self.buildDetail.attachment);
      if (0 == _self.buildDetail.buildFiles.length) {
        _self.filesIsFilled = false;
      } else {
        _self.filesIsFilled = _self.buildDetail.buildFiles.length > 0;
      }
      if (null == _self.buildDetail.others || _self.buildDetail.others == "") {
        _self.othersIsFilled = false;
      } else {
        _self.othersIsFilled = _self.buildDetail.others.replace(/\s*/g, "").length > 0;
      }
      if (null == _self.buildDetail.attachment || _self.buildDetail.attachment == "") {
        _self.attachmentIsFilled = false;
      } else {
        _self.attachmentIsFilled = _self.buildDetail.attachment.replace(/\s*/g, "").length > 0;
      }
    },

    showBuildDetail(row, event) {
      let _self = this;
      _self.showDetail = true;
      _self.buildDetailQuery(row);
    },

    releaseNoteCreate() {
      let _self = this;
      let attachment = [];
      _self.newform.fileList.forEach(item => {
        attachment.push(item.id);
      });
      _self.$axios.post("/build/releasenote_create", {
          attachment: attachment.toString(),
          buildFiles: _self.newform.buildFiles,
          description: _self.newform.description,
          others: _self.newform.others,
          relId: _self.newform.relId,
          reqId: _self.newform.reqId,
          status: 1,
          submitter: sessionStorage.userId
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.showDialog = false;
            _self.$message.success("构建信息创建成功！");
            _self.releasenoteQuery();
          } else {
            _self.$message.warning("构建信息创建失败!");
            console.log(res);
          }
        })
    },

    releaseNoteUpdate() {
      let _self = this;
      let attachs = [];
      _self.mform.fileList.forEach(item => {
        attachs.push(item.id);
      });
      _self.$axios.post("/build/releasenote_update", {
          attachment: attachs.toString(),
          buildFiles: _self.mform.buildFiles,
          description: _self.mform.description,
          others: _self.mform.others,
          relId: _self.mform.relId,
          reqId: _self.mform.reqId,
          id: _self.mform.id,
          status: _self.mform.status,
          submitter: sessionStorage.userId
        })
        .then(function (res) {
          _self.showDialogMod = false;
          _self.$message.success("构建信息修改成功！");
          _self.releasenoteQuery();
        })
    },

    memberQuery(callback) {
      let _self = this;
      commonQuery.memberQuery((result) => {
        _self.members = result.users;
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        if (typeof callback == "function") {
          callback();
        }
      });
    },

    beforeUpload(file) {
      if (file.size / 1024 / 1024 > 50) {
        this.$message.info("单个文件不能超过 50MB！");
        return false;
      }
    },

    fileExceeded(files, fileList) {
      this.$message.info("文件个数超出限制！");
      return;
    },

    uploadComplete(res, file, fileList) {
      let _self = this;
      _self.newform.fileList = fileList;
    },

    uploadCompleteMod(res, file, fileList) {
      let _self = this;
      _self.mform.fileList = fileList;
    },

    handleRemoveMod(file, fileList) {
      let _self = this;
      _self.$message.success("文件删除成功！");
      _self.mform.fileList = fileList;
    },

    saveBuildInfoCreate(formName1, formName2) {
      let _self = this;
      _self.$refs[formName1].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交！");
          return;
        } else {
          _self.$refs[formName2].validate((valid) => {
            if (!valid) {
              _self.$notify.error("表单校验不通过，无法提交！");
              return;
            } else {
              _self.releaseNoteCreate();
            }
          });
        }
      });
    },

    saveBuildInfoUpdate(formName1, formName2) {
      let _self = this;
      _self.$refs[formName1].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交！");
          return;
        } else {
          _self.$refs[formName2].validate((valid) => {
            if (!valid) {
              _self.$notify.error("表单校验不通过，无法提交！");
              return;
            } else {
              _self.releaseNoteUpdate();
            }
          });
        }
      });
    },

    handleRemove(file, fileList) {
      let _self = this;
      commonQuery.attachmentDelete(file, fileList, (res) => {
        _self.newform.fileList = res;
      })
    },

    handlePreview(file) {
      commonQuery.attachmentDownload(file);
    },

    getAttach(attachId) {
      return commonQuery.attachmentQuery(attachId);
    },

    uploadAction(params) {
      let _self = this;
      let file = params.file;
      let fileList = _self.newform.fileList || [];
      let refedUpload = _self.showDialog ? _self.$refs.upload : _self.$refs.uploadMod;

      if (file.name.indexOf("_V") > -1) {
        _self.$message.warning("请去除文件名中包含的字符串： _V");
        refedUpload.uploadFiles = fileList.filter(item => {
          return item.status == "success";
        }) || [];
        return;
      }
      commonQuery.attachmentUpload(file, fileList, (res) => {
        _self.newform.fileList = res;
      })
    },

    uploadActionMod(params) {
      let _self = this;
      let file = params.file;
      let fileList = _self.mform.fileList || [];
      let refedUpload = _self.showDialog ? _self.$refs.upload : _self.$refs.uploadMod;

      if (file.name.indexOf("_V") > -1) {
        _self.$message.warning("请去除文件名中包含的字符串： _V");
        refedUpload.uploadFiles =
          fileList.filter(item => {
            return item.status == "success";
          }) || [];
        return;
      }
      commonQuery.attachmentUpload(file, fileList, (res) => {
        _self.mform.fileList = res;
      })
    },

    releaseQuery() {
      let _self = this;
      _self.releases.splice(0, _self.releases.length);
      if (_self.buildForm.hideClosed == true) {
        commonQuery.openRelQuery((result) => {
          _self.releases = result.releasesWithBranch;
        })
      } else {
        commonQuery.releaseQuery((result) => {
          _self.releases = result.releasesWithBranch;
        })
      }
    },

    openReleaseQuery() {
      let _self = this;
      _self.newform.releases.splice(0, _self.newform.releases.length);
      commonQuery.openRelQuery((result) => {
        _self.newform.releases = result.releasesWithBranch;
      })
    },

    relReqQuery(relId) {
      let _self = this;
      _self.newform.reqId = "";
      if (!relId) {
        _self.reqs.splice(0, _self.reqs.length); //清空数组
        return;
      }
      this.$nextTick(_ => {
        if (_self.$refs.ruledForm) {
          _self.$refs.ruledForm.clearValidate();
        }
      });
      _self.$axios.post("/req/rel_query/" + relId + "/1/500")
        .then(function (res) {
          let reqsData = [];
          reqsData = eval(res.data.list);
          _self.reqs.splice(0, _self.reqs.length); //清空数组
          for (let i = 0; i < reqsData.length; i++) {
            _self.reqs.push({
              label: reqsData[i].summary,
              value: reqsData[i].id,
              disabled: _self.existsReqs.indexOf(reqsData[i].id) > -1
            });
          }
        })
    },

    releasenoteQuery() {
      let _self = this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/build/releasenote_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            reqId: _self.buildForm.reqId,
            reqStatus: _self.buildForm.reqStatus.toString(),
            relId: _self.buildForm.relId,
            status: _self.buildForm.status.toString(),
            submitter: _self.buildForm.submitter,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function (res) {
          _self.tableData = eval(res.data.list);
          _self.existsReqs.splice(0, _self.existsReqs.length);
          _self.tableData.forEach(d => _self.existsReqs.push(d.reqId));
          _self.pageInfo = res.data;
          _self.queryChanged = false;
          setTimeout(() => {
            _self.queryLoading = false;
          }, 200);
        })
        .catch(function (response) {
          _self.queryLoading = false;
          _self.$notify.error("发生错误");
        });
    },

    newBuild() {
      let _self = this;
      _self.showDialog = true;
      _self.openReleaseQuery();
      if (_self.$refs.ruledForm) {
        _self.$refs.ruledForm.resetFields();
      }
    }
  }
};
</script>

<style>
.build-form {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.build-form .el-form-item .el-input {
  width: 180px;
}

.build-form .el-form-item .wide-select .el-input {
  width: 500px;
}

.build-form .el-form-item .muti-select .el-input {
  width: 180px;
}

.text-box {
  height: 20px;
}

.build-form .el-table .cell {
  padding-right: 0px;
}

.show-message {
  width: 450px;
  position: absolute;
  top: 20px;
}

.build-attach-upload {
  width: 100%;
}

.build-attach-upload .el-upload--text {
  width: 100%;
  height: 80px;
}

.build-attach-upload .el-upload-dragger {
  width: 100%;
  height: 80px;
}

.build-attach-upload .el-upload-dragger .el-icon-upload {
  margin: 0;
  font-size: 40px;
}

.breq-sum-tips {
  color: #3AB4D7 !important;
  cursor: pointer !important;
}

.build-detail-collapse .el-collapse-item__header i {
  font-size: 15px;
}

.build-detail-collapse .el-button i {
  font-size: 18px;
}

.build-detail-collapse .el-collapse-item__content {
  padding: 10px 20px 20px 40px
}

.build-detail-collapse .el-collapse-item__arrow {
  font-weight: 600;
  line-height: 45px;
}

.build-detail-collapse .modules-ruled-form .el-form-item {
  margin: 0;
}

.build-detail-collapse .modules-ruled-form .el-form-item__content {
  vertical-align: middle;
}

.modules-ruled-form .build-attach-upload textarea {
  min-height: 40px;
  line-height: 33px;
}

.float-button {
  position: absolute;
  font-size: 14px;
  color: #4d4d4d;
  background-color: white;
  padding: 2px 8px;
  margin: 8px;
  border-radius: 2px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.05)
}
</style>
