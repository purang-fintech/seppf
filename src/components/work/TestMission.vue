<template>
  <div id="root" style="width: 100%">
    <el-dialog :close-on-click-modal="modalClose" title="产品需求拆分测试任务" :visible.sync="showDialog" width="880px" :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">产品需求拆分测试任务</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form :model="nform" size="mini" :rules="nformRules" ref="ruledFromN" :inline="true" label-width="110px" class="test-mission-form">
        <el-form-item label="计划开始日期" prop="planBegin" required>
          <el-date-picker type="date" v-model="nform.planBegin" placeholder="请选择" :value-format="datefmt" clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="计划完成日期" prop="planTo" required>
          <el-date-picker type="date" v-model="nform.planTo" placeholder="请选择" :value-format="datefmt" clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="任务类型" prop="type" required>
          <el-select v-model="nform.type" placeholder="请选择" clearable @change="checkReleasePlan()">
            <el-option v-for="opt in type" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所需人日" prop="manpower" required>
          <el-input v-model="nform.manpower" placeholder="请输入（人日）" clearable>所需人日</el-input>
        </el-form-item>
        <el-form-item label="测试负责人" prop="responser" required>
          <el-select v-model="nform.responser" placeholder="请选择" clearable filterable :filter-method="filterUsers1" @visible-change="resetFilterText">
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
        <el-form-item label="测试参与人" prop="assistant">
          <el-select v-model="nform.assistant" placeholder="请选择，可多选" filterable clearable multiple collapse-tags class="long" :filter-method="filterUsers2" @change="multiOptionsHandler2">
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
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialog=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="resetForm('ruledFromN')" size="small">重置</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkSaveTmsCreate('ruledFromN')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="测试任务信息修改" :visible.sync="showDialogMod" width="880px"  :fullscreen="maximize1">
      <div slot="title">
        <span style="font-size:18px">测试任务信息修改</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize1=!maximize1">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize1==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize1==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form :model="nform" size="mini" :rules="nformRules" ref="ruledFromC" :inline="true" label-width="110px" class="test-mission-form">
        <el-form-item label="计划开始日期" prop="planBegin" required>
          <el-date-picker type="date" v-model="nform.planBegin" placeholder="请选择" :value-format="datefmt" clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="计划完成日期" prop="planTo" required>
          <el-date-picker type="date" v-model="nform.planTo" placeholder="请选择" :value-format="datefmt" clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="任务类型" prop="type" required>
          <el-select v-model="nform.type" placeholder="请选择" disabled>
            <el-option v-for="opt in type" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所需人日" prop="manpower" required>
          <el-input v-model="nform.manpower" placeholder="请输入（人日）" clearable>所需人日</el-input>
        </el-form-item>
        <el-form-item label="测试负责人" prop="responser" required>
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
        <el-form-item label="测试参与人" prop="assistant">
          <el-select v-model="nform.assistant" placeholder="请选择，可多选" filterable clearable multiple collapse-tags class="long" :filter-method="filterUsers4" @change="multiOptionsHandler4">
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
                <span style="float:right;margin:0 10px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showDialogMod=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkSaveTmsMod('ruledFromC')" size="small">确定</el-button>
      </div>
    </el-dialog>

    <div class="tmform-box">
      <el-form ref="form" :inline="true" size="mini" label-width="110px" @keydown.native.enter="missionQuery()">
        <el-form-item label="任务负责人">
          <el-select v-model="mform.responser" clearable filterable :filter-method="filterUsers" @visible-change="resetFilterText">
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
        <el-form-item label="版本号">
          <el-select v-model="mform.relId" clearable>
            <el-option v-for="opt in releases" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品需求号">
          <el-input v-model="mform.reqId" placeholder="请输入" clearable>产品需求号</el-input>
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="mform.type" placeholder="请选择" clearable>
            <el-option v-for="opt in type" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务号">
          <el-input v-model="mform.id" placeholder="请输入" clearable>任务号</el-input>
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select v-model="mform.status" clearable multiple collapse-tags>
            <el-option v-for="opt in status" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划结束日期">
          <el-date-picker v-model="mform.planTo" type="daterange" align="right" unlink-panels :value-format="datefmt" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button v-no-more-click type="primary" icon="el-icon-share" @click="beginSplit(mform.reqId)" :disabled="btnDisabled">任务测试拆分</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="missionQuery()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="dataRevert" :max-height="tableHeight" size="mini" stripe :border="showBorder" ref="table"
          v-loading="queryLoading" 
          element-loading-text="查询中..." 
          element-loading-spinner="el-icon-loading" 
          element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column label="产品需求号" width="100" align="center" prop="id" sortable>
          <template slot-scope="scope">
            <el-tooltip content="点此，产品需求拆分测试任务" placement="right-end" effect="dark">
              <el-button v-no-more-click size="mini" type="text" @click="beginSplit(scope.row.reqId)">{{scope.row.reqId}}</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="任务编号" width="100" align="center" sortable>
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
        <el-table-column label="产品需求摘要" header-align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="table-content-tips" slot="reference" @click="toRquest(scope.row.reqId)">{{scope.row.reqSummary}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="typeName" label="任务类型" width="110" align="center">
        </el-table-column>
        <el-table-column prop="statusName" label="任务状态" width="90" align="center">
        </el-table-column>
        <el-table-column prop="responserName" label="负责人" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="planBegin" label="计划开始" width="100" align="center" sortable>
          <template slot="header" slot-scope="slot">
            <el-tooltip content="计划开始日期小于当日且未提测，数据为橙色" placement="left" effect="dark">
              <span>计划开始</span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <div v-html="scope.row.planBeginHtml"></div>
          </template>
        </el-table-column>
        <el-table-column prop="planTo" label="计划完成" width="100" align="center" sortable>
          <template slot="header" slot-scope="slot">
            <el-tooltip content="计划完成日期小于当日且未完成或关闭，数据为橙色" placement="left" effect="dark">
              <span>计划完成</span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <div v-html="scope.row.planToHtml"></div>
          </template>
        </el-table-column>
        <el-table-column width="160" align="center" label="状态变更">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="statusTransCheck(scope.row, 2)" :disabled="transNotAllowed(scope.row, 2)">提测</el-button>
            <el-button type="success" size="mini" @click="statusTransCheck(scope.row, 3)" :disabled="transNotAllowed(scope.row, 3)">完成</el-button>
            <el-button type="info" size="mini" @click="statusTransCheck(scope.row, 0)" :disabled="transNotAllowed(scope.row, 0)">关闭</el-button>
          </template>
        </el-table-column>
        <el-table-column width="120" align="center" label="编辑操作">
          <template slot-scope="scope">
            <el-button v-no-more-click type="warning" size="mini" @click="beginEdit(scope.row)" :disabled="editForbidden(scope.row)">编辑</el-button>
            <el-button v-no-more-click type="danger" size="mini" @click="missionDelete(scope.row)" :disabled="editForbidden(scope.row)">删除</el-button>
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

          @click="exportCSV('测试任务数据', 'table')">
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
      tableData: [],
      queryLoading: false,
      pageInfo: {},
      tableHeight: 0,
      maximize: false,
      maximize1: false,
      btnDisabled: true,
      members: [],
      memberFull: [],
      userOptions: [],
      userOptions1: [],
      userOptions2: [],
      userOptions3: [],
      userOptions4: [],
      releases: [],
      modules: [],
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      showDialog: false,
      showDialogMod: false,
      type: [],
      status: [],
      mform: {
        reqId: "",
        id: "",
        type: "",
        planBegin: [],
        planTo: [],
        relId: "",
        responser: "",
        status: [1,2,3]
      },
      currentPage: 1,
      pageSize: parseInt(sessionStorage.tablePageSize) || 10,
      queryChanged: false,
      nform: {
        reqId:"",
        relId: "",
        type: "",
        spliter: "",
        responser: "",
        assistant: [],
        manpower: "",
        status: "",
        planBegin: "",
        planTo: ""
      },
      currentTms : {},
      nformRules: {
        responser: [{ required: true, message: '请选择负责人', trigger: 'change' }],
        type: [{ required: true, message: '请选任务类型', trigger: 'change' }],
        status: [{ required: true, message: '请选任务状态', trigger: 'change' }],
        planBegin: [{ type: 'string', required: true, message: '请选择计划开始日期', trigger: 'blur' }],
        planTo: [{ type: 'string', required: true, message: '请选择计划完成日期', trigger: 'blur' }],
        manpower: [{ validator: validateManpower, trigger: 'blur'}]
      }
    };
  },

  watch: {
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

  computed: {
    dataRevert() {
      for (let i = 0, datas = this.tableData; i < datas.length; i++) {
        let now = new Date(dateFormat(new Date(), this.datefmt) + " 00:00:00").getTime();
        let planTo = new Date(datas[i].planTo + " 00:00:00").getTime();
        let planBegin = new Date(datas[i].planBegin + " 00:00:00").getTime();
        if ((planBegin - now) < 0  && datas[i].status == 1) {
          this.$set(datas[i], "planBeginHtml", "<span style='color:orange;font-weight:500'>"+ datas[i].planBegin + "</span>");
        } else {
          this.$set(datas[i], "planBeginHtml", "<span style='color:#606266'>"+ datas[i].planBegin + "</span>");
        }
        if ((planTo - now) < 0  && datas[i].status < 3  && datas[i].status > 0) {
          this.$set(datas[i], "planToHtml", "<span style='color:orange;font-weight:500'>"+ datas[i].planTo + "</span>");
        } else {
          this.$set(datas[i], "planToHtml", "<span style='color:#606266'>"+ datas[i].planTo + "</span>");
        }
        this.tableData.splice(i, 1, datas[i]);
      }
      return this.tableData;
    }
  },

  created() {
    let _self =  this;

    _self.tableHeight = bodyAviHeightTab - 60 - 45;
    let dateE = new Date();
    let dateS = new Date();
    dateS.setTime(dateS.getTime() - 3600 * 1000 * 24 * 30);
    dateE.setTime(dateE.getTime() + 3600 * 1000 * 24 * 60);
    let dateBegin = dateFormat(dateS, _self.datefmt);
    let dateEnd = dateFormat(dateE, _self.datefmt);

    let params = [];
    for (let p in _self.$route.params) {
      params.push(p);
    }
    
    if (params.length > 0) {
      _self.$nextTick(function(){
        _self.mform.relId = _self.$route.params.relId;
        _self.mform.reqId = _self.$route.params.reqId;
        _self.nform.reqId = _self.$route.params.reqId;
        _self.mform.id = _self.$route.params.id;
        _self.mform.status = [];
        if (_self.$route.params.status) {
          _self.mform.status.push(_self.$route.params.status);
        }
        _self.mform.responser = _self.$route.params.responser;
        _self.mform.planTo = [];
        _self.btnDisabled = null == _self.$route.params.reqId || _self.$route.params.reqId == "";
      });
    } else {
      _self.mform.planTo.push(dateBegin);
      _self.mform.planTo.push(dateEnd);
    }

    _self.type = [];
    let testPeriod = localStorage.getItem("testPeriod");
    eval(testPeriod).forEach(item => {
      _self.type.push({
        value: item.periodId,
        label: item.periodName
      });
    });

    _self.status.splice(0, _self.status.length);
    let testMissionStatus = localStorage.getItem("testMissionStatus");
    eval(testMissionStatus).forEach(item => {
      _self.status.push({
        value: item.statusId,
        label: item.statusName
      });
    });

    _self.releaseQuery();
    _self.memberQuery(_self.missionQuery);
  },

  methods: {
    resetFilterText(){
      let _self =  this;
      _self.userOptions = _self.memberFull;
      _self.userOptions1 = _self.memberFull;
      _self.userOptions3 = _self.memberFull;
    },

    multiOptionsHandler4(){
      let _self =  this;
      const selected = _self.nform.assistant.concat([]);
      _self.nform.assistant.splice(0, _self.nform.assistant.length);
      _self.$nextTick(_ => {
        _self.userOptions4 = _self.memberFull;
        selected.forEach(d => {
          _self.nform.assistant.push(d);
        });
      });
    },

    multiOptionsHandler2(){
      let _self =  this;
      const selected = _self.nform.assistant.concat([]);
      _self.nform.assistant.splice(0, _self.nform.assistant.length);
      _self.$nextTick(_ => {
        _self.userOptions2 = _self.memberFull;
        selected.forEach(d => {
          _self.nform.assistant.push(d);
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

    exportCSV(fileName = 'result', tableRef = 'table') {
      const columns = this.$refs[tableRef].$children.filter(t => t.prop != null)
      TableExport(this.tableData, columns, fileName)
    },

    getAssistant(assistant) {
      let _self =  this;
      let result = [];
      if (null == assistant || assistant == "") {
        return "无";
      }
      let assists = assistant.split(",");
      assists.forEach(item => {
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

    editForbidden(data){
      return !commonQuery.roleAllow([0]) && data.status == 0;
    },

    transNotAllowed(data, newStatus) {
      if (newStatus == 0) {
        return data.status != 3;
      }
      return data.status != newStatus - 1;
    },

    checkReleasePlan(){
      let _self =  this;
      if (_self.nform.relId == "" || _self.nform.type == "") {
        return;
      }
      _self.$axios({
        method: "post",
        url: "/plan/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        params: {
          relId: _self.nform.relId,
          planType: _self.nform.type
        }
      })
      .then(function(res) {
        let result = eval(res.data.list);
        if (!result || result.length == 0) {
          _self.$message.warning("该版本对应类型测试计划未建立！");
          _self.nform.relId = "";
        }
      })
    },

    toRquest(reqId){
      this.$router.push({
        name: "request",
        params: {
          id: reqId
        }
      });
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    checkSaveTmsCreate(formName){
      let _self =  this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.saveTmsCreate();
        }
      });
    },

    checkSaveTmsMod(formName){
      let _self =  this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.saveTmsMod();
        }
      });
    },

    beginSplit(reqId){
      let _self =  this;
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
          _self.nform.relId = "";
          _self.nform.type = "",
          _self.nform.manpower = "";
          _self.nform.assistant = [];
          _self.showDialog = true;
        }
      });
    },

    beginEdit(data){
      let _self =  this;
      _self.changeOnWayTms(data.id, (changeCount) => {
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
          _self.currentTms = data;
          _self.nform.reqId = data.reqId;
          _self.nform.id = data.id;
          _self.nform.spliter = data.spliter;
          _self.nform.responser = data.responser;
          _self.nform.assistant = [];
          if (data.assistant && data.assistant != "") {
            data.assistant.split(",").forEach(item => {
              _self.nform.assistant.push(parseInt(item));
            });
          }
          _self.nform.status = data.status,
          _self.nform.type = data.type,
          _self.nform.planBegin = data.planBegin;
          _self.nform.planTo = data.planTo;
          _self.nform.relId = data.relId;
          _self.nform.manpower = data.manpower;
          _self.showDialogMod = true;
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

    changeOnWayTms(id, callback){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/change/on_way",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            id: id,
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

    saveTmsCreate() {
      let _self =  this;
      _self.$axios.post("/tms/create", {
        reqId: _self.nform.reqId,
        status: 1,
        spliter: sessionStorage.userId,
        splitDate: dateFormat(new Date(), _self.datefmt),
        planBegin: _self.nform.planBegin,
        planTo: _self.nform.planTo,
        responser: _self.nform.responser,
        assistant: _self.nform.assistant.toString(),
        manpower: _self.nform.manpower,
        relId: _self.nform.relId,
        type: _self.nform.type
      })
      .then(function(res) {
        if (res.data > 0) {
          _self.showDialog = false;
          _self.$message.success("拆分测试任务保存成功！");
          _self.missionQuery();
        } else {
          _self.$message.info("拆分测试任务保存失败");
          console.log(res);
        }
      })
    },

    statusTransCheck(data, newStatus){
      let _self =  this;
      _self.changeOnWayTms(data.id, (changeCount) => {
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
          _self.statusTrans(data, newStatus);
        }
      });
    },

    statusTrans(row, newStatus) {
      let _self =  this;
      _self.$axios.post("/tms/status_update/" + row.id, {
        status: newStatus
      })
      .then(function(sres) {
        if (sres.data == 1) {
          _self.$message.success("测试任务状态修改成功！");
          _self.missionQuery();   
        } else {
          _self.$message.info("测试任务状态修改保存失败");
        }
      })
    },

    saveTmsMod() {
      let _self =  this;
      _self.$axios.post("/tms/update", {
        id: _self.nform.id,
        manpower: _self.nform.manpower,
        planBegin: _self.nform.planBegin,
        planTo: _self.nform.planTo,
        assistant: _self.nform.assistant.toString(),
        relId: _self.nform.relId,
        status: _self.nform.status,
        responser: _self.nform.responser,
        type: _self.nform.type
      })
      .then(function(sres) {
        if (sres.data == 1) {
          _self.$message.success("测试任务信息修改成功！");
          _self.showDialogMod = false;
          _self.missionQuery();   
        } else {
          _self.$message.info("测试任务信息修改保存失败");
        }
      })
    },

    missionDelete(data) {
      let _self =  this;
      _self.changeOnWayTms(data.id, (changeCount) => {
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
          this.$confirm("确定要删除当前记录吗?", "操作确认", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              this.deleteTestMission(data.id);
            })
            .catch(() => {});
        }
      });
    },

    deleteTestMission(id) {
      let _self =  this;
      _self.$axios.post("/tms/delete/" + id)
      .then(function(res) {
        if ((res.data = 1)) {
          _self.$message.success("测试任务删除成功！");
          _self.missionQuery();
        } else {
          _self.$notify.error("测试任务删除失败");
          console.log(res);
        }
      })
    },

    memberQuery(callback){
      let _self =  this;
      commonQuery.memberQuery((result) => {
        _self.members = result.users;
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        _self.userOptions1 = _self.memberFull;
        _self.userOptions2 = _self.memberFull;
        _self.userOptions3 = _self.memberFull;
        _self.userOptions4 = _self.memberFull;
        if (typeof callback == "function") {
          callback();
        }
      });
    },

    releaseQuery() {
      let _self =  this;
      _self.releases.splice(0, _self.releases.length);
      commonQuery.releaseQuery((result) => {
        _self.releases = result.releasesWithBranch;
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
          url: "/tms/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            id: _self.mform.id,
            reqId: _self.mform.reqId,
            relId: _self.mform.relId,
            type: _self.mform.type,
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
    }
  }
};
</script>

<style>
.tmform-box {
  width: 97% !important;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 1.4%;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.tmform-box .el-range-editor.el-input__inner {
  width: 414px;
}

.tmform-box .el-table .cell {
  padding-right: 0px;
}

.tmform-box .el-table i{
  font-size: 14px;
  cursor: pointer;
  color: #3AB4D7;
}

.tmform-box .el-form-item .el-input {
  width: 150px;
}

.tmform-box .el-form-item .muti-select .el-input {
  width: 180px;
}

.test-mission-form .el-form-item .el-input {
  width: 300px;
}
</style>
