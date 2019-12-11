<template>
<div ref="root">
  <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item><i class="iconfont icon-icon-product"></i> 产品配置</el-breadcrumb-item>
          <el-breadcrumb-item>产品文档</el-breadcrumb-item>
      </el-breadcrumb>
  </div>

  <el-dialog :close-on-click-modal="modalClose" :visible.sync="showSearch" width="1150px" :fullscreen="maximize">
    <div slot="title">
      <span style="font-size:18px">文档信息模糊查询</span>
      <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
        <el-tooltip content="最大化" effect="dark" placement="left">
          <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
        </el-tooltip>
        <el-tooltip content="还原" effect="dark" placement="left">
          <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
        </el-tooltip>
      </button>
    </div>
    <el-button v-no-more-click type="primary" icon="el-icon-search" size="small" style="float:right;margin-left:10px" @click="executeQuery()">查询</el-button>
    
    <el-tooltip content="仅支持文档关键字、摘要、文件名、所属需求标题的关键字搜索" placement="top" effect="dark">
      <el-autocomplete
        v-model="searchText" 
        style="width:300px;margin-bottom:20px;float:right" 
        size="small" 
        :fetch-suggestions="searchHistory"
        @select="handleSelect"
        placeholder="输入关键字不得少于2个字符" clearable>
        <template slot-scope="{ item }">
          <span class="sdocInput">{{ item }}</span>
          <i class="el-icon-close" style="float:right;line-height:34px" @click="removeHistory(item)"></i>
        </template>
      </el-autocomplete>
    </el-tooltip>

    <el-table :data="searchMatch" max-height="400" size="mini" stripe :border="showBorder">
      <el-table-column type="index" width="50" label="序号" align="center">
      </el-table-column>
      <el-table-column prop="keywod" label="关键字" width="200" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <div v-html="scope.row.keywordHtml"></div>
        </template>
      </el-table-column>
      <el-table-column prop="label" label="文档标题" min-width="20%" header-align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="pdocs-links" v-html="scope.row.labelHtml" @click="intoNodes(scope.row)">{{scope.row.label}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="所属需求" min-width="20%" header-align="center" sortable show-overflow-tooltip>
        <template slot-scope="scope">
          <div v-html="scope.row.reqHtml"></div>
        </template>
      </el-table-column>
      <el-table-column label="上传人" align="center" width="90">
        <template slot-scope="scope">
          <el-select size="mini" v-model="scope.row.uploadUser" placeholder="" disabled>
            <el-option v-for="opt in members" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <div class="page-set">
      <el-pagination 
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange" 
        :current-page="searchResult.currentPage" 
        :page-sizes="[10, 20, 50, 100, 200]" 
        :page-size="searchResult.pageSize" 
        layout="total, sizes, prev, pager, next, jumper" 
        :total="searchResult.pageInfo.total">
      </el-pagination>
    </div>
    <div slot="footer">
      <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="showSearch=false">取消</el-button>
    </div>
  </el-dialog>

  <el-dialog :close-on-click-modal="modalClose" title="新增功能点文件夹" :visible.sync="showNewBox" width="600px">
    <el-form :model="newForm" size="small">
      <el-form-item label="功能点名称" label-width="100px" required>
        <el-input v-model="newForm.label"  clearable style="width:95%"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="onCancel()">取消</el-button>
      <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="saveNewNode()">确定</el-button>
    </div>
  </el-dialog>

  <el-dialog :close-on-click-modal="modalClose" title="文档所属需求清单" :visible.sync="showDocReqs" width="800px">
    <el-table :data="currentDocument.reqs" max-height="400" size="mini" stripe :border="showBorder">
      <el-table-column type="index" width="50" label="序号" align="center">
      </el-table-column>
      <el-table-column prop="reqId" label="需求号" width="100" align="center" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="reqSummary" label="需求摘要" header-align="center" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="操作" width="80" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button v-no-more-click type="primary" size="small" @click="showDocReqs=false;$router.push({ name: 'request', params: { 'id': scope.row.reqId } })">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer">
      <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="showDocReqs=false">关闭</el-button>
    </div>
  </el-dialog>

  <el-dialog :close-on-click-modal="modalClose" title="修改功能点文件夹" :visible.sync="showModBox" width="600px">
    <el-form :model="modForm" size="small">
      <el-form-item label="功能点名称" label-width="100px" required>
        <el-input v-model="modForm.label"  clearable style="width:95%"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="onCancel()">取消</el-button>
      <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="saveModNode()">确定</el-button>
    </div>
  </el-dialog>

  <div class="document-block" v-bind:style="{height: baseHeight + 'px'}" ref="cases">
    <el-tree
      class="tree-view"
      :style="{ height: treeHeight + 'px' }"
      node-key="id"
      ref="folder"
      :key="nodeKey"
      @node-expand="expandNode"
      @node-collapse="collapseNode"
      highlight-current
      :auto-expand-parent="false"
      :expand-on-click-node="false"
      :props="defaultProps"
      lazy
      :load="loadNode"
      @node-click="nodeClickEvent"
      :default-expanded-keys="expanded"
      :render-content="renderContent">
    </el-tree>
  </div>

  <div class="document-detail" v-bind:style="{height: baseHeight + 'px'}"> 
      <el-button 
        type="primary" 
        size="mini" 
        icon="el-icon-check" 
        style="float:right" 
        @click="saveDocumentInfo()" 
        :disabled="operForbidden()">
         保存
      </el-button>
      <br><br>
      <el-form ref="form" :model="currentDocument" :inline="false" size="small" label-width="100px" class="content-form">
        <el-form-item>
          <template slot="label">
            <el-tooltip content="点击下载或查看文档" placement="left" effect="dark" :disabled="!currentDocument.url">
              <span>文档标题</span>
            </el-tooltip>
          </template>
          <el-tooltip :content="currentDocument.label" placement="top" effect="dark" :disabled="!currentDocument.url">
            <div class="pdocs-router-link">
              <span 
                class="links" 
                v-if="currentDocument.url" 
                @click="openAttach(currentDocument)">
                {{currentDocument.label}}
              </span>
            </div>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="文档上传人">
          <el-select v-model="currentDocument.uploadUser" placeholder="" disabled>
            <el-option v-for="opt in members" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上传日期">
          <el-input v-model="currentDocument.uploadDate" disabled> </el-input>
        </el-form-item>
        <el-form-item label="所属需求">
          <div class="pdocs-router-link">
            <span v-if="currentDocument.attachmentId" class="links" @click="documentReqQuery(currentDocument.attachmentId)">点击查看</span>
          </div>
        </el-form-item>
        <el-form-item label="最后维护人">
          <el-select v-model="currentDocument.maintainUser" placeholder="" disabled>
            <el-option v-for="opt in members" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属功能" v-if="currentDocument.showFunc" required>
          <el-select v-model="currentDocument.funcs.selected" placeholder="请选择">
            <el-option v-for="opt in currentDocument.funcs.options" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="currentDocument.type=='doc'" required>
          <template slot="label">
            <el-tooltip content="所属大版本，2级数字版本号" placement="left" effect="dark" :disabled="!currentDocument.version">
              <span>所属版本</span>
            </el-tooltip>
          </template>
          <el-select v-model="currentDocument.version" placeholder="请选择">
            <el-option v-for="opt in versions" :value="opt" :key="opt" :label="opt"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文档关键字" required>
          <el-tag
            :key="index"
            :closable="currentDocument.type=='doc'"
            v-for="(tag, index) in currentDocument.keyWords"
            :disable-transitions="false"
            @close="handleClose(tag)">
            {{tag}}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="currentDocument.inputVisible"
            v-model="currentDocument.inputValue"
            ref="docTags"
            size="small"
            @keyup.enter.native="handleInputConfirm()"
            @blur="handleInputConfirm()">
          </el-input>
          <el-button v-else type="primary" class="button-new-tag el-icon-plus" size="mini" @click="showInput()" :disabled="currentDocument.type!='doc'"> 新关键字</el-button>
        </el-form-item>
        <el-form-item label="文档摘要" required>
          <el-input v-model="currentDocument.summary" type="textarea" :rows="10" placeholder="请输入文档摘要" :disabled="currentDocument.type!='doc'" :maxlength="500" show-word-limit></el-input>
        </el-form-item>
      </el-form>
  </div>

</div>
</template>

<script>
let id = 0;
const rootId = -1;
import commonQuery from "@/components/util/CommonQuery.vue";
export default {
  data: function() {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      treeData: [],
      showViewer: false,
      maximize: false,
      timestamp: "",
      nodeKey: "",
      expanded: [],
      showSearch: false,
      dialogWith: document.body.clientWidth - 300,
      showDocReqs: false,
      searchText: "",
      searchResult: {
        data: [],
        pageInfo: "",
        currentPage: 1,
        pageSize: parseInt(sessionStorage.tablePageSize) || 10
      },
      defaultProps: {
        children: 'children',
        label: "label",
        isLeaf: 'leaf'
      },
      currentDocument: {
        keyWords: [],
        label: "",
        showFunc: false,
        inputVisible: false,
        inputValue: "",
        uploadUser: "",
        maintainUser: "",
        uploadDate: "",
        summary: "",
        version: "",
        url: "",
        funcs: {
          selected: "",
          options: []
        },
        reqs: []
      },
      newForm: {
        label: ""
      },
      modForm: {
        label: "",
        id: "",
        keyword: "",
        summary: ""
      },
      versions: [],
      members: [],
      showNewBox: false,
      showModBox: false,
      baseHeight: "",
      treeHeight: "",
      tableHeight: "",
      tempData: [],
      index: 0,
      sysUsers: []
    };
  },

  created() {
    this.baseHeight = bodyAviHeightNTab + 50;
    this.treeHeight = bodyAviHeightNTab + 45;
    this.tableHeight = bodyAviHeightNTab - 120;
    this.timestamp = new Date().getTime();

    this.expanded.splice(0, this.expanded.length);
    this.expanded.push(rootId);
    this.docVersionQuery();
    this.memberQuery();
  },

  computed: {
    searchMatch(){
      let _self =  this;
      for (let i = 0, rows = _self.searchResult.data; i < rows.length; i++) {
        let keyword = rows[i].keyword;
        let reqText = rows[i].reqId + " - " + rows[i].reqSummary;
        let label = rows[i].label;
        if (_self.searchText && _self.searchText.length > 0) {
          let replaceReg = new RegExp(_self.searchText, 'g');
          let replaceString = "<span style='color:orange;font-weight:500'>" + _self.searchText + '</span>';
          if (keyword && keyword.length > 0) {
            _self.$set(rows[i], "keywordHtml", keyword.replace(replaceReg, replaceString));
          }
          if (reqText && reqText.length > 0) {
            _self.$set(rows[i], "reqHtml", reqText.replace(replaceReg, replaceString));
          }
          if (label && label.length > 0) {
            _self.$set(rows[i], "labelHtml", label.replace(replaceReg, replaceString));
          }
        }
        _self.searchResult.data.splice(i, 1, rows[i]);
      };
      return _self.searchResult.data;
    }
  },

  methods: {
    handleClose(tag) {
      this.currentDocument.keyWords.splice(this.currentDocument.keyWords.indexOf(tag), 1);
    },

    showInput() {
      let _self =  this;
      _self.$set(_self.currentDocument, "inputVisible", true);
      _self.$nextTick(_ => {
        _self.$refs.docTags.$refs.input.focus();  
      });
    },

    handleInputConfirm() {
      let _self =  this;
      let inputValue = _self.currentDocument.inputValue;
      if (inputValue) {
        if (inputValue.indexOf(",") > -1) {
          _self.$message.warning("关键字不能包含英文半角的逗号！");
        } else {
          if (!_self.currentDocument.keyWords) {
            _self.$set(_self.currentDocument, "keyWords", []);
          }
          _self.currentDocument.keyWords.push(inputValue);
        }
      }
      _self.currentDocument.inputVisible = false;
      _self.currentDocument.inputValue = '';
    },

    handleCurrentChange(current) {
      this.searchResult.currentPage = current;
      this.documentFuzzQuery();
    },

    handleSizeChange(size) {
      this.searchResult.pageSize = size;
      this.searchResult.currentPage = 1;
      this.documentFuzzQuery();
    },

    operForbidden(){
      return this.currentDocument.type!='doc' || !commonQuery.roleAllow([1, 16]);
    },

    refreshNodes(){
      let _self =  this;
      _self.nodeKey += new Date().getTime();
      if (_self.currentDocument || _self.currentDocument.id) {
        _self.$nextTick(_ => {
          setTimeout(() => {
            _self.$refs.folder.setCurrentNode(_self.currentDocument);
          }, 500);
        });
      }
    },

    executeQuery(){
      let _self =  this;

      const qText = _self.searchText;
      if (qText == "" || qText.length < 2) {
        _self.$message.warning("请输入不少于2个字的文本！");
        return;
      }
      
      _self.searchHistorySet(qText);
      _self.documentFuzzQuery();
    },

    documentFuzzQuery(){
      let _self =  this;
      _self.$axios({
        method: "post",
        url: "/document/fuzz_query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        params: {
          searchText: _self.searchText,
          pageNum: _self.searchResult.currentPage,
          pageSize: _self.searchResult.pageSize
        }
      })
      .then(function(res) {
        _self.searchResult.data = eval(res.data.list);
        _self.searchResult.pageInfo = res.data;
      })
    },

    loadNode(node, resolve) {
      let _self =  this;
      if (node.level === 0) {
        return resolve([{ label: sessionStorage.productCode + ' - ' + sessionStorage.productName, id: -1 }]);
      }

      if (node.level == 1){
        _self.moduleQuery(node, sessionStorage.productId, resolve);
      }
      
      if (node.level >= 2 && node.data.type != 'doc'){
        _self.documentQuery(node, resolve);
        _self.$nextTick(_ => {
          setTimeout(() => {  //id恰好与moduleId相同的时候会触发子节点遍历，预先将其阻止
            let children = node.data.children;
            children.forEach(n => {
              let childNode = _self.$refs.folder.getNode(n);
              _self.$set(childNode, "loading", false);
            });
          }, 500);
        });
      }
    },

    expandNode(data, node, s){
      let _self =  this;
      _self.$refs.folder.setCurrentNode(data);
      _self.expanded.push(data.id);
    },

    collapseNode(data, node, s){
      let _self =  this;
      let index = _self.expanded.indexOf(data.id);
      if (index > -1) {
        _self.expanded.splice(index, 1);
      }
    },

    nodeClickEvent(data, node, s){
      let _self =  this;
      let crtNode = node || _self.$refs.folder.getNode(data);
      _self.currentDocument = data;

      if (data.type == "doc") {
        if (!_self.currentDocument.funcs) {
          _self.$set(_self.currentDocument, "funcs", {});
        }
        _self.currentDocument.funcs.options = data.funcs.options;
        _self.currentDocument.funcs.selected = data.funcs.selected;
        _self.currentDocument.showFunc = true;
        if (crtNode.parent.data.type == "module") {
          _self.currentDocument.funcs.selected = "";
        } else {
          _self.currentDocument.funcs.selected = crtNode.parent.data.id;
        }
      } else {
        _self.currentDocument.showFunc = false;
      }
      if (data.keyword) {
        _self.$set(_self.currentDocument, "keyWords", data.keyword.split(","));
      }
      _self.$refs.folder.setCurrentNode(data);
    },

    intoNodes(data){
      let _self =  this;
      _self.showSearch = false;

      if (_self.expanded.indexOf(_self.timestamp + data.moduleId) == -1) {
        _self.expanded.push(_self.timestamp + data.moduleId);
      }

      if (_self.expanded.indexOf(data.parentId) == -1 && data.parentId != data.moduleId) {
        _self.expanded.push(data.parentId);
      }

      _self.$nextTick(_ => {
        setTimeout(() => {
          _self.nodeClickEvent(data);
        }, 500);
      });
    },

    search(){
      this.showSearch = true;
    },

    searchHistory(sText, callback){
      let sdocHistory = localStorage.getItem("sdocHistory");
      if (sdocHistory && sdocHistory != null && sdocHistory != '') {
        callback(sdocHistory.split(","));
      } else {
        callback([]);
      }
    },

    handleSelect(item){
      this.searchText = item;
    },

    removeHistory(historyText){
      let hisText = localStorage.getItem("sdocHistory");
      let sdocHistory = [];
      if (hisText && hisText != null && hisText != '') { //搜索历史记录不为空
        sdocHistory = hisText.split(",");
        let index = sdocHistory.indexOf(historyText);
        sdocHistory.splice(index, 1);
        localStorage.setItem("sdocHistory", sdocHistory.toString());
      }
    },

    searchHistorySet(qText){
      let historyText = localStorage.getItem("sdocHistory");
      let sdocHistory = [];
      let current = [];
      if (historyText && historyText != null && historyText != '') { //搜索历史记录不为空
        sdocHistory = historyText.split(",");
        // 本次搜索文本不在历史记录中
        let index = sdocHistory.indexOf(qText);
        if (index > -1) {
          sdocHistory.splice(index, 1);
        } else {
          // 搜索历史记录达到6条
          if (sdocHistory.length >= 6) {
            sdocHistory.splice(length - 1, 1);
          }
        }
      }
      current.push(qText);
      localStorage.setItem("sdocHistory", current.concat(sdocHistory).toString());
    },


    openAttach(file) {
      if (file) {
        commonQuery.attachmentDownload(file);
      }
    },

    toRequest(reqId) {
      if (reqId) {
        this.$router.push({ name: 'request', params: { 'reqId': reqId } })
      }
    },

    onCancel() {
      let _self =  this;
      _self.showNewBox = false;
      _self.showModBox = false;
    },

    docVersionQuery() {
      let _self =  this;
      _self.$axios.post("/document/version_query/" + sessionStorage.productId)
      .then(function(res) {
        _self.versions = eval(res.data);
      })
    },

    moduleQuery(node, productId, resolve) {
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
      .then(function(res) {
        let modules = eval(res.data.list);
        if (modules.length === 0) {
          _self.$message.warning("该产品尚未录入模块信息！");
          return;
        }
        _self.$set(node.data, "children", []);
        modules.forEach(item => {
          item.leaf = false;
          item.type = "module";
          item.label = item.moduleName;
          item.id = _self.timestamp + item.moduleId;
          item.busiId = item.moduleId;
          node.data.children.push(item);
        });
        resolve(modules);
      })
    },

    documentReqQuery(attachmentId){
      let _self =  this;
      _self.showDocReqs = true;
      _self.$axios.post("/document/req_query/" + attachmentId)
      .then(function(res) {
        if (!_self.currentDocument.reqs) {
          _self.$set(_self.currentDocument, "reqs", eval(res.data));
        } else {
          _self.currentDocument.reqs = eval(res.data);
        }
      });
    },

    documentQuery(node, resolve) {
      let _self =  this;
      const isModule = node.data.type == "module";
      let params = isModule ? {
        productId: node.data.productId,
        moduleId: node.data.moduleId
      } : {
        parentId: node.data.id
      }
      _self.$axios({
        method: "post",
        url: "/document/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        params: params
      })
      .then(function(res) {
        let docs = eval(res.data);
        if (node.data.id > 0) {
          _self.$set(node.data, "children", []);
        }
        
        let functions = [];
        docs.forEach(item => {
          if (item.type == 'folder') {
            functions.push({
              value: item.id,
              label: item.label
            });
          }
        });
        docs.forEach(item => {
          if (!item.leaf) {
            _self.$set(item, "leaf", item.type == 'doc');
          }
          if (!item.funcs) {
            _self.$set(item, "funcs", {});
          }
          if (isModule) {
            item.funcs.options = functions.concat();
          } else {
            item.funcs.options = node.data.funcs.options.concat();
          }
          item.funcs.selected = "";
          node.data.children.push(item);
        });
        resolve(docs);
      })
    },

    append(node, data, store) {
      let _self =  this;
      _self.tempData = data;
      _self.showNewBox = true;
      _self.$nextTick(_ => {
        setTimeout(() => {
          _self.$refs.folder.setCurrentNode(data);
          if (_self.expanded.indexOf(data.id) < 0) {
            _self.expanded.push(data.id);
          }
        }, 500);
      });
    },

    saveNewNode() {
      let _self =  this;
      let data = _self.tempData;
      let label = _self.newForm.label;

      if (null == label || '' == label) {
        _self.$message.warning("功能点名称不能为空！");
        return;
      }
      if (label.length > 20) {
        _self.$message.warning("功能点名称长度不能超过20字符！");
        return;
      }
      
      if (data.children) {
        for (let i = 0; i < data.children.length; i ++){
          if (data.children[i].label === label) {
            _self.$message.warning("存在相同标题的功能点！");
            return;
          }
        }
      }
      
      _self.$axios.post("/document/create", {
        label : label,
        parentId : data.busiId,
        productId : data.productId,
        moduleId : data.moduleId,
        type : "folder",
        maintainUser: sessionStorage.userId
      })
      .then(function(res) {
        _self.showNewBox = false;
        _self.nodeKey += new Date().getTime();
        _self.$message.success("新增功能点文件夹保存成功！");
      })
    },

    memberQuery(callback){
      let _self =  this;
      commonQuery.memberQuery((result) => {
        _self.members = result.users;
        _self.memberFull = result.usersFull;
        if (typeof callback == "function") {
          callback();
        }
      });
    },

    modify(node, data) {
      this.showModBox = true;
      this.tempNode = node;
      this.tempData = data;

      this.modForm.label = data.label;
      this.modForm.id = data.id;
      this.modForm.keyword = data.keyword;
      this.modForm.summary = data.summary;
    },

    saveModNode() {
      let _self =  this;
      let data = _self.tempData;
      let node = _self.tempNode;
      if (null == _self.modForm.label || '' == _self.modForm.label) {
        _self.$notify.error("功能点名称不能为空！");
        return;
      }
      if (_self.modForm.label.length > 20) {
        _self.$notify.error("功能点名称长度不能超过20字符！");
        return;
      }
      
      const parent = node.parent;
      const children = parent.data.children || parent.data;

      for (let i = 0; i < children.length; i ++){
        if (children[i].label == _self.modForm.label && data.label != _self.modForm.label) {
          _self.$message.warning("存在相同标题的功能点！");
          return;
        }
      }
      _self.showModBox = false;

      data.label = _self.modForm.label;
      data.id = _self.modForm.id;
      data.keyword = _self.modForm.keyword;
      data.summary = _self.modForm.summary;

      _self.$axios.post("/document/update", {
        label : data.label,
        id:  data.id,
        parentId: parent.data.busiId,
        maintainUser : sessionStorage.userId
      })
      .then(function(res) {
        if (res.data == 1) {
          _self.nodeKey += new Date().getTime();
          _self.$nextTick(_ => {
            setTimeout(() => {
              _self.$refs.folder.setCurrentNode(data);
            }, 500);
          });
          _self.$message.success("功能点文件夹名称修改成功！");
        } else {
          _self.$message.warning("功能点文件夹名称修改失败，没有记录更新！");
        }
      })
    },

    saveDocumentInfo(){
      let _self =  this;
      if (!_self.currentDocument.keyWords || _self.currentDocument.keyWords.length === 0) {
        _self.$message.warning("文档关键字不能为空，请录入！");
        return;
      }
      if (!_self.currentDocument.summary) {
        _self.$message.warning("文档摘要不能为空，请录入！");
        return;
      }
      if (!_self.currentDocument.version) {
        _self.$message.warning("文档所属版本不能为空，请选择！");
        return;
      }
      if (_self.currentDocument.summary.length > 500) {
        _self.$message.warning("文档摘要不可超过500字！");
        return;
      }
      if (!_self.currentDocument.funcs.selected) {
        _self.$message.warning("请选择所属功能！");
        return;
      }
      const data = _self.$refs.folder.getCurrentNode();
      const parent = _self.$refs.folder.getNode(data).parent;
      const children = parent.data.children || parent.data;
      _self.$axios.post("/document/update", {
        label : _self.currentDocument.label,
        id:  _self.currentDocument.id,
        parentId: _self.currentDocument.funcs.selected,
        version: _self.currentDocument.version,
        keyword: _self.currentDocument.keyWords.toString(),
        summary: _self.currentDocument.summary,
        maintainUser : sessionStorage.userId
      })
      .then(function(res) {
        if (res.data == 1) {
          const index = children.findIndex(d => d.id === data.id);
          children.splice(index, 1, data);
          _self.nodeKey += new Date().getTime();
          _self.$nextTick(_ => {
            _self.expanded.push(_self.currentDocument.funcs.selected);
            setTimeout(() => {
              _self.$refs.folder.setCurrentNode(data);
            }, 500);
          });
          _self.$message.success("文档信息更新成功！");
        } else {
          _self.$message.warning("文档信息更新失败，没有记录更新！");
        }
      })
    },

    renderContent(h, { node, data, store }) {
      if (node.level === 1) {
        return (
          <span class="tree-render">
            <span>
              <i class="iconfont icon-folder" style="margin-right: 4px"/>
              {node.label}
            </span>
            <span>
              <el-button v-no-more-click size="small" type="text" on-click={() => this.refreshNodes()} >
                <i class="el-icon-refresh"></i>
              </el-button>
              <el-button v-no-more-click size="small" type="text" on-click={() => this.search()} >
                <i class="el-icon-search"></i>
              </el-button>
            </span>
          </span>
        );
      } else if (node.level === 2 && commonQuery.roleAllow([0])) {
        return (
          <span class="tree-render">
            <span>
              <i class="iconfont icon-folder" style="margin-right: 4px"/>
              {node.label}
            </span>
            <span>
              <el-button v-no-more-click size="small" type="text" on-click={() => this.append(node, data, store)} >
                <i class="iconfont icon-addition"></i>
              </el-button>
            </span>
          </span>
        );
      } else if (node.level === 3 && commonQuery.roleAllow([0]) && data.type != 'doc') {
        return (
          <span class="tree-render">
            <span>
              <i class="iconfont icon-folder" style="margin-right: 4px"/>
              {node.label}
            </span>
            <span>
              <el-button v-no-more-click size="small" type="text" on-click={() => this.modify(node, data)} >
                <i class="el-icon-edit-outline"></i>
              </el-button>
            </span>
          </span>
        );
      } else {
        if (data.type == 'doc') {
          return (
            <span class="tree-render">
              <span>
                <i class="el-icon-document" style="margin-right: 4px"/>
                {node.label}
              </span>
            </span>
          );
        } else {
          return (
            <span class="tree-render">
              <span>
                <i class="iconfont icon-folder" style="margin-right: 4px"/>
                {node.label}
              </span>
            </span>
          );
        }
      }
    },
  }
};
</script>

<style>
.document-block {
  width: 44%;
  float: left;
  border: 1px solid #e4edf3;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 2px;
}

.document-detail {
  width: 55%;
  padding: 10px;
  float: right;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 2px;
  border: 1px solid #e4edf3;
  overflow-y: auto;
}

.document-detail textarea {
  cursor: initial !important;
}

.document-detail .oper-button {
  float:right;
  margin: 8px -5px 0 15px;
  color: #3AB4D7;
  font-size: 16px;
  cursor: pointer;
}

.tree-render {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  font-family: 微软雅黑;
  padding-right: 15px;
}

.tree-render>span {
  max-width: 400px;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-view {
  padding: 1px 0;
  overflow-y: auto;
  width: 100%;
}

.tree-view .iconfont{
  font-size: 17px;
}

.tree-view i {
  font-size: 16px;
}

.tree-view .el-tree-node__loading-icon {
  /* font-size: 18px !important; */
  display: none !important;
}

.tree-view .el-tree-node__expand-icon {
  font-size: 16px;
}

.tree-view .el-tree-node__content {
  height: 30px;
}

.content-form {
  margin-top: 5px;
}

.content-form .el-select {
  width: 100%;
}

.content-form .el-select .is-disabled .el-input__suffix {
  display: none !important;
}

.el-tag + .el-tag,
.el-tag + .el-button {
  margin-left: 10px;
}

.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.pdocs-router-link {
  background-color: #f5f7fa;
  border-radius: 2px;
  padding: 0 15px;
  height: 32px;
  border: none;
  border-bottom: 1px solid #e4e7ed;
  width: 95%;
}

.pdocs-router-link .links,
.pdocs-links {
  cursor: pointer;
  color: #3AB4D7 !important;
}

.pdocs-router-link .links:hover,
.pdocs-links:hover {
  color: #61c3df !important;
}

.sdocInput {
  text-overflow:ellipsis;
  overflow:hidden;
  color:#b4b4b4;
  max-width:200px;
  display:inline-block;
  height:25px;
}
</style>
