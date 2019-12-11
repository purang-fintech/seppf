<template>
  <div class="root">

    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="el-icon-search"></i> 综合查询</el-breadcrumb-item>
        <el-breadcrumb-item>模糊查询</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="fuzz-main">
      <el-select v-model="searchType.selected" placeholder="请选择搜索类型" size="small" style="width:140px;margin-right:10px" @change="clearData()">
        <el-option v-for="opt in searchType.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
      </el-select>
      <el-tooltip content="仅支持编号、摘要 / 描述、用户账号、用户姓名的关键字搜索" placement="top" effect="dark">
        <el-autocomplete
          v-model="searchText" 
          style="width:280px;margin-right:10px" 
          size="small" 
          ref="searchInput"
          :fetch-suggestions="searchHistory"
          @select="handleSelect"
          @keydown.native.enter="execSearch()"
          placeholder="输入关键字不得少于2个字" clearable>
          <template slot-scope="{ item }">
            <span class="auto-input">{{ item }}</span>
            <i class="el-icon-close" style="float:right;line-height:34px" @click="removeHistory(item)"></i>
          </template>
        </el-autocomplete>
      </el-tooltip>
      <el-button v-no-more-click size="mini" type="primary" @click="execSearch()" class="el-icon-search"> 搜索</el-button>

      <div v-if="showRel">
        <el-table :data="tableData" :max-height="tableHeight" size="mini" stripe :border="showBorder" class="fuzz-table"
          row-key="id"
          v-loading="queryLoading" 
          element-loading-text="查询中..." 
          element-loading-spinner="el-icon-loading" 
          element-loading-background="rgba(0, 0, 0, 0.8)">
          <el-table-column prop="id" label="版本ID" width="110" align="center" sortable>
          </el-table-column>
          <el-table-column prop="relCode" label="版本编号" width="150" align="center" sortable>
            <template slot-scope="scope">
              <span class="router-link" @click="$router.push({ name: 'release', params: { 'relCode': scope.row.relCode } })">[{{scope.row.branchName}}] {{ scope.row.relCode }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="creatorName" label="提交人" width="110" align="center" sortable>
          </el-table-column>
          <el-table-column prop="responserName" label="负责人" width="110" align="center" sortable>
          </el-table-column>
          <el-table-column prop="relDate" label="计划发布日期" width="120" align="center" sortable>
          </el-table-column>
          <el-table-column prop="environment" label="发布环境" header-align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{getEnvName(scope.row.environment)}}</span>
            </template>
          </el-table-column>
          <el-table-column type="expand" label="更多信息" width="70">
            <template slot-scope="scope">
              <el-form inline class="sepp-table-expand" size="mini">
                <el-form-item label="需求确认日期">
                  <el-input v-model="scope.row.reqConfirmDate" disabled></el-input>
                </el-form-item>
                <el-form-item label="SIT开始日期">
                  <el-input v-model="scope.row.sitBeginDate" disabled></el-input>
                </el-form-item>
                <el-form-item label="UAT开始日期">
                  <el-input v-model="scope.row.uatBeginDate" disabled></el-input>
                </el-form-item>
                <el-form-item label="计划封版日期">
                  <el-input v-model="scope.row.readyDate" disabled></el-input>
                </el-form-item>
                <el-form-item label="实际发布日期">
                  <el-input v-model="scope.row.relDateAct" disabled></el-input>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="showReq">
        <el-table :data="tableData" :max-height="tableHeight" size="mini" stripe :border="showBorder" class="fuzz-table"
          row-key="id"
          v-loading="queryLoading" 
          element-loading-text="查询中..." 
          element-loading-spinner="el-icon-loading" 
          element-loading-background="rgba(0, 0, 0, 0.8)">
          <el-table-column prop="id" label="产品需求号" width="110" align="center" sortable>
          </el-table-column>
          <el-table-column prop="summary" label="需求摘要" header-align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <span class="router-link" @click="$router.push({ name: 'request', params: { 'id': scope.row.id } })">{{ scope.row.summary }}</span>
            </template>
          </el-table-column>
          <el-table-column label="需求类型" prop="typeName" width="100" align="center" sortable>
          </el-table-column>
          <el-table-column label="所属模块" prop="moduleName" width="100" align="center" sortable>
          </el-table-column>
          <el-table-column prop="priorityName" label="紧急程度" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="submitterName" label="提交人" width="80" align="center" sortable>
          </el-table-column>
          <el-table-column prop="sitDate" label="SIT计划开始" width="120" align="center" sortable>
          </el-table-column>
          <el-table-column prop="uatDate" label="UAT计划开始" width="120" align="center" sortable>
          </el-table-column>
          <el-table-column prop="submitDate" label="提交日期" width="100" align="center" sortable>
          </el-table-column>
          <el-table-column prop="expectDate" label="期望完成日期" width="120" align="center" sortable>
          </el-table-column>
          <el-table-column prop="statusName" label="需求状态" width="90" align="center" sortable>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="showCms">
        <el-table :data="tableData" :max-height="tableHeight" size="mini" stripe :border="showBorder" class="fuzz-table"
          row-key="id"
          v-loading="queryLoading" 
          element-loading-text="查询中..." 
          element-loading-spinner="el-icon-loading" 
          element-loading-background="rgba(0, 0, 0, 0.8)">
          <el-table-column prop="id" label="任务编号" width="110" align="center" sortable>
          </el-table-column>
          <el-table-column prop="summary" label="任务摘要" header-align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <span class="router-link" @click="$router.push({ name: 'mission', params: { 'id': scope.row.id } })">{{ scope.row.summary }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="moduleName" label="所属模块" width="110" align="center" sortable>
          </el-table-column>
          <el-table-column prop="statusName" label="任务状态" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="responserName" label="负责人" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="planBegin" label="计划开始" width="100" align="center" sortable>
          </el-table-column>
          <el-table-column prop="planTo" label="计划完成" width="100" align="center" sortable>
          </el-table-column>
          <el-table-column prop="spliterName" label="拆分人" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="splitDate" label="拆分日期" width="110" align="center" sortable>
          </el-table-column>
          <el-table-column prop="manpower" label="人力(人日)" width="100" align="center" sortable>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="showBug">
        <el-table :data="tableData" :max-height="tableHeight" size="mini" stripe :border="showBorder" class="fuzz-table"
          row-key="id"
          v-loading="queryLoading" 
          element-loading-text="查询中..." 
          element-loading-spinner="el-icon-loading" 
          element-loading-background="rgba(0, 0, 0, 0.8)">
          <el-table-column prop="id" label="缺陷编号" width="110" align="center" sortable>
          </el-table-column>
          <el-table-column prop="summary" label="缺陷摘要" header-align="center" show-overflow-tooltip>
            <template slot-scope="scope">
              <span class="router-link" @click="$router.push({ name: 'defect', params: { 'id': scope.row.id } })">{{ scope.row.summary }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="relCode" label="发现版本" width="150" align="center" sortable>
          </el-table-column>
          <el-table-column prop="statusName" label="缺陷状态" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="submitterName" label="提交人" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="responserName" label="修复责任人" width="110" align="center" sortable>
          </el-table-column>
          <el-table-column prop="defectPeriodName" label="植入阶段" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="priorityName" label="优先级" width="80" align="center" sortable>
          </el-table-column>
          <el-table-column prop="influenceName" label="严重程度" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column type="expand" label="更多信息" width="70">
            <template slot-scope="scope">
              <el-form inline class="sepp-table-expand" size="mini">
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
              </el-form>
            </template>
          </el-table-column>
        </el-table> 
      </div>

      <div v-if="showPro">
        <el-table :data="tableData" :max-height="tableHeight" size="mini" stripe :border="showBorder" class="fuzz-table"
          row-key="id"
          v-loading="queryLoading" 
          element-loading-text="查询中..." 
          element-loading-spinner="el-icon-loading" 
          element-loading-background="rgba(0, 0, 0, 0.8)">
          <el-table-column prop="id" label="线上问题号"align="center" width="110" sortable>
          </el-table-column>
          <el-table-column prop="summary" label="问题摘要" header-align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                <span class="router-link" @click="$router.push({ name: 'problem', params: { 'id': scope.row.id } })">{{ scope.row.summary }}</span>
              </template>
          </el-table-column>
          <el-table-column prop="submitterName" label="上报人" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="submitTime" label="上报时间" width="140" align="center" sortable>
          </el-table-column>
          <el-table-column prop="responserName" label="负责人" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="statusName" label="问题状态" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column prop="priorityName" label="优先级" width="80" align="center" sortable>
          </el-table-column>
          <el-table-column prop="influenceName" label="严重程度" width="90" align="center" sortable>
          </el-table-column>
          <el-table-column type="expand" label="更多信息" width="70">
            <template slot-scope="scope">
              <el-form inline class="sepp-table-expand" size="mini">
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
                  <el-input v-model="scope.row.resolveMethodName" disabled></el-input>
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
                  <el-popover
                    placement="right-end"
                    width="600"
                    trigger="click">
                    <el-input type="textarea" v-model="scope.row.improveDetail" :rows="10" disabled resize="none"></el-input>
                    <el-input v-model="scope.row.improveDetail" disabled class="content-tips" slot="reference">{{scope.row.improveDetail}}</el-input>
                  </el-popover>
                </el-form-item>
                <br>
              </el-form>
            </template>
          </el-table-column>
        </el-table>
      </div>

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
      </div>
    </div>
  </div>
</template>

<script>
import commonQuery from "@/components/util/CommonQuery.vue";
export default {
  data: function() {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      tableData: [],
      showRel: false,
      showReq: false,
      showCms: false,
      showBug: false,
      showPro: false,
      pageInfo: {},
      queryLoading: false,
      tableHeight: bodyAviHeightNTab - 30 - 45,
      searchType: {
        selected: 2,
        opts: [
          {label: "版本计划", value: 1},
          {label: "产品需求", value: 2},
          {label: "开发任务", value: 3},
          {label: "测试缺陷", value: 4},
          {label: "线上问题", value: 5}
        ]
      },
      searchText: "",
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
    }
  },

  methods: {
    handleCurrentChange(current) {
      let _self =  this;
      _self.currentPage = current;
      if (_self.searchType.selected == 1) {
        _self.relFuzzQuery();
      } else if (_self.searchType.selected == 2) {
        _self.reqFuzzQuery();
      } else if (_self.searchType.selected == 3) {
        _self.cmssFuzzQuery();
      } else if (_self.searchType.selected == 4) {
        _self.defectFuzzQuery();
      } else if (_self.searchType.selected == 5) {
        _self.problemFuzzQuery();
      }
    },

    handleSizeChange(size) {
      let _self =  this;
      _self.pageSize = size;
      if (_self.searchType.selected == 1) {
        _self.relFuzzQuery();
      } else if (_self.searchType.selected == 2) {
        _self.reqFuzzQuery();
      } else if (_self.searchType.selected == 3) {
        _self.cmssFuzzQuery();
      } else if (_self.searchType.selected == 4) {
        _self.defectFuzzQuery();
      } else if (_self.searchType.selected == 5) {
        _self.problemFuzzQuery();
      }
    },

    clearData(){
      let _self =  this;
      _self.showRel = false;
      _self.showReq = false;
      _self.showCms = false;
      _self.showBug = false;
      _self.showPro = false;
      _self.tableData.splice(0, _self.tableData.length);
      _self.pageInfo.total = 0;
    },

    searchHistory(sText, callback){
      let searchHistory = localStorage.getItem("searchHistory");
      if (searchHistory && searchHistory != null && searchHistory != '') {
        callback(searchHistory.split(","));
      } else {
        callback([]);
      }
    },

    handleSelect(item){
      this.searchText = item;
      this.execSearch();
    },

    removeHistory(historyText){
      let hisText = localStorage.getItem("searchHistory");
      let searchHistory = [];
      let current = [];
      if (hisText && hisText != null && hisText != '') { //搜索历史记录不为空
        searchHistory = hisText.split(",");
        let index = searchHistory.indexOf(historyText);
        searchHistory.splice(index, 1);
        localStorage.setItem("searchHistory", searchHistory.toString());
      }
    },

    execSearch(){
      let _self =  this;

      const qType = _self.searchType.selected;
      const qText = _self.searchText;
      if (qType == "") {
        _self.$message.warning("请选择搜索目标类型！");
        return;
      }
      if (qText == "" || qText.length < 2) {
        _self.$message.warning("请输入不少于2个字的文本！");
        return;
      }
      
      _self.searchHistorySet(qText);

      if (_self.searchType.selected == 1) {
        _self.relFuzzQuery();
      } else if (_self.searchType.selected == 2) {
        _self.reqFuzzQuery();
      } else if (_self.searchType.selected == 3) {
        _self.cmssFuzzQuery();
      } else if (_self.searchType.selected == 4) {
        _self.defectFuzzQuery();
      } else if (_self.searchType.selected == 5) {
        _self.problemFuzzQuery();
      }
    },

    searchHistorySet(qText){
      let _self =  this;
      let historyText = localStorage.getItem("searchHistory");
      let searchHistory = [];
      let current = [];
      if (historyText && historyText != null && historyText != '') { //搜索历史记录不为空
        searchHistory = historyText.split(",");
        // 本次搜索文本不在历史记录中
        let index = searchHistory.indexOf(qText);
        if (index > -1) {
          searchHistory.splice(index, 1);
        } else {
          // 搜索历史记录达到6条
          if (searchHistory.length >= 6) {
            searchHistory.splice(length - 1, 1);
          }
        }
      }
      current.push(qText);
      localStorage.setItem("searchHistory", current.concat(searchHistory).toString());
    },

    relFuzzQuery() {
      let _self =  this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/fuzz/release_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            searchText: _self.searchText,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function(res) {
          _self.tableData =  eval(res.data.list);
          _self.showRel = true;
          _self.pageInfo = res.data;
          setTimeout(() => {
            _self.queryLoading = false;
          }, 200);
        })
        .catch(function(response) {
          _self.queryLoading = false;
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    getEnvName(envs) {
      let result = [];
      if (!envs || envs == null || envs == "") {
        return "";
      }
      let filterd = "";
      envs.split(",").forEach(item => {
        filterd = eval(localStorage.getItem("environmentType")).find(d => {
          return item == d.typeId;
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

    reqFuzzQuery() {
      let _self =  this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/fuzz/req_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            searchText: _self.searchText,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function(res) {
          _self.tableData = eval(res.data.list);
          _self.showReq = true;
          _self.pageInfo = res.data;
          setTimeout(() => {
            _self.queryLoading = false;
          }, 200);
        })
        .catch(function(response) {
          _self.$notify.error("产品需求信息查询时发生程序错误！");
          console.log(response);
          _self.queryLoading = false;
        });
    },

    cmssFuzzQuery(){
      let _self =  this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/fuzz/cms_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            searchText: _self.searchText,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function(res) {
          _self.tableData = eval(res.data.list);
          _self.showCms = true;
          _self.pageInfo = res.data;
          setTimeout(() => {
            _self.queryLoading = false;
          }, 200);
        })
        .catch(function(response) {
          _self.$notify.error("开发任务信息查询时发生程序错误！");
          console.log(response);
          _self.queryLoading = false;
        });
    },

    defectFuzzQuery() {
      let _self =  this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/fuzz/defect_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            searchText: _self.searchText,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function(res) {
          _self.pageInfo = res.data;
          _self.tableData = eval(res.data.list);
          _self.showBug = true;
          setTimeout(() => {
            _self.queryLoading = false;
          }, 200);
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          _self.queryLoading = false;
          console.log(response);
        });
    },

    getDisplayedCloseReason(data) {
      if (commonQuery.isNull(data)) {
        return "";
      }
      return this.closeStyles.find(d => {
        return d.value == data
      }).label;
    },

    problemFuzzQuery() {
      let _self =  this;
      _self.queryLoading = true;
      _self.$axios({
          method: "post",
          url: "/fuzz/problem_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            searchText: _self.searchText,
            pageNum: _self.currentPage,
            pageSize: _self.pageSize
          }
        })
        .then(function(res) {
          _self.pageInfo = res.data;
          _self.tableData = eval(res.data.list);
          _self.showPro = true;
          setTimeout(() => {
            _self.queryLoading = false;
          }, 200);
        })
        .catch(function(response) {
          _self.$notify.error("线上问题信息查询时发生程序错误！");
          console.log(response);
          _self.queryLoading = false;
        });
    }
  }
};
</script>

<style>
.fuzz-main {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.5%;
  background-color: #fff;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.auto-input {
  text-overflow:ellipsis;
  overflow:hidden;
  color:#b4b4b4;
  max-width:200px;
  display:inline-block;
  height:25px;
}

.fuzz-table {
  width: 100%;
  margin-top: 10px;
}

.fuzz-table .cell .el-button {
  margin-left: 0;
}

.fuzz-table .cell {
  padding-left: 0;
}

.sepp-table-expand .content-tips {
  -webkit-appearance: none;
  color: #3AB4D7;
  cursor: pointer;
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

.fuzz-table .router-link {
  background: none !important;
  border: none;
  padding: 0;
  width: 95%;
  color: #3AB4D7 !important;
  cursor: pointer !important;
}
</style>
