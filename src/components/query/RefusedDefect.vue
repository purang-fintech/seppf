<template>
  <div id="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-bug"></i> 综合查询
        </el-breadcrumb-item>
        <el-breadcrumb-item>被拒缺陷</el-breadcrumb-item>
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

    <div class="dform-box">
      <el-form ref="dform" :model="dform" :inline="true" size="mini" label-width="100px" @keydown.native.enter="queryDefect()">
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
          <el-select v-model="dform.submitter" placeholder="请选择" clearable filterable :filter-method="filterUsers2" @visible-change="resetFilterText">
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
        <el-form-item label="修复责任人">
          <el-select v-model="dform.responser" placeholder="请选择" clearable filterable :filter-method="filterUsers1" @visible-change="resetFilterText">
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
        <el-form-item label="缺陷状态">
          <el-select v-model="dform.status" placeholder="请选择" multiple collapse-tags disabled>
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
          <el-date-picker v-model="dform.foundTime" type="daterange" align="right" unlink-panels :value-format="datefmt" range-separator="至"
                          start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="float:right;">
          <el-button v-no-more-click type="text" @click="showDefectTips=true">缺陷流转说明</el-button>
          <el-button v-no-more-click type="primary" icon="el-icon-search" @click="queryDefect()">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="dataRevert" :max-height="baseHeight" size="mini" stripe :border="showBorder" ref="defectTable"
        :expand-row-keys="expandedBugs"
        row-key="id"
        @expand-change="manualExpand"
        v-loading="queryLoading"
        element-loading-text="查询中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column prop="id" label="缺陷编号" width="100" align="center" sortable>
        </el-table-column>
        <el-table-column prop="relCode" label="发现版本" width="140" align="center" sortable>
        </el-table-column>
        <el-table-column prop="statusName" label="缺陷状态" width="90" align="center" sortable>
        </el-table-column>
        <el-table-column prop="submitterName" label="提交人" width="80" align="center" sortable>
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
                  <el-popover
                    :disabled="!scope.row.refuseDetail"
                    placement="right-end"
                    width="600"
                    trigger="click">
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
                <el-image
                  :src="bugIconSrc"
                  :preview-src-list="scope.row.imgList">
                </el-image>
              </el-form-item>
            </el-form>
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
          @click="exportCSV('拒绝缺陷清单数据', 'defectTable')">
          导出CSV
        </el-button>
        <div class="export-tips">导出CSV文件请使用<span>新版本</span>MS Office或者WPS表格工具打开</div>
      </div>
    </div>
  </div>
</template>

<script>
  import commonQuery from "@/components/util/CommonQuery.vue";
  import {dateFormat, pickOptions} from "@/util/date.js";
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
        queryLoading: false,
        expandedBugs: [],
        memberFull: [],
        userOptions1: [],
        userOptions2: [],
        baseHeight: "",
        currentRow: {},
        datefmt: defaultDateFormat,
        pickOptions: pickOptions,
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
          status: [0]
        },
        currentPage: 1,
        pageSize: parseInt(sessionStorage.tablePageSize) || 10,
        queryChanged: false,
        refuseReasons: []
      };
    },

    watch: {
      hideDefectTips: function (val, old) {
        if (val != old) {
          localStorage.setItem("hideDefectTips", val);
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
        for (let i = 0, datas = this.tableData; i < datas.length; i++) {
          if (!datas[i]) {
            continue;
          }

          let dateE = commonQuery.isNull(datas[i].closedTime) ? new Date() : new Date(datas[i].closedTime);
          let timeCost = this.dateDiff(new Date(datas[i].foundTime), dateE);
          let day = parseInt(timeCost / 24);
          let hour = parseInt(timeCost - day * 24);
          let min = parseInt((timeCost - day * 24 - hour) * 60);

          this.$set(datas[i], "timeCost", day + " 天" + hour + " 时" + min + " 分");
          let urlList = [];
          this.parseText(datas[i].detail).forEach(item => {
            this.imgExists(item.url, (imgObject) => {
              if (imgObject.width > 0 && imgObject.height > 0) {
                urlList.push(item.url);
              }
            })
          });
          this.$set(datas[i], "imgList", urlList);
          this.tableData.splice(i, 1, datas[i]);
        }
        return this.tableData;
      }
    },

    created() {
      let _self =  this;
      _self.baseHeight = bodyAviHeightNTab - 110 - 45;

      _self.releaseQuery();
      _self.moduleQuery();

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

        let date = new Date();
        let oldDay = new Date();
        let today = dateFormat(date, _self.datefmt);
        oldDay.setTime(oldDay.getTime() - 3600 * 1000 * 24 * 180);
        let yesterday = dateFormat(oldDay, _self.datefmt);
      _self.dform.foundTime.push(yesterday);
      _self.dform.foundTime.push(today);
      _self.memberQuery();
      _self.queryDefect();
    },

    methods: {
      resetFilterText() {
        let _self =  this;
        _self.userOptions1 = _self.memberFull;
        _self.userOptions2 = _self.memberFull;
      },

      filterUsers1(val) {
        let _self =  this;
        _self.userOptions1 = commonQuery.pickListFilter(val, _self.memberFull);
      },

      filterUsers2(val) {
        let _self =  this;
        _self.userOptions2 = commonQuery.pickListFilter(val, _self.memberFull);
      },

      memberQuery(callback) {
        let _self =  this;
        commonQuery.memberQuery((result) => {
          _self.memberFull = result.usersFull;
          _self.userOptions1 = result.usersFull;
          _self.userOptions2 = result.usersFull;
          if (typeof callback == "function") {
            callback();
          }
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
        let _self =  this;
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

      dateDiff(date1, date2) {
        return ((date2.getTime() - date1.getTime()) / 1000 / 3600).toFixed(2);
      },

      exportCSV(fileName = 'result', tableRef = 'table') {
        const columns = this.$refs[tableRef].$children.filter(t => t.prop != null);
        TableExport(this.tableData, columns, fileName)
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

      releaseQuery() {
        let _self =  this;
        _self.releases.splice(0, _self.releases.length);
        commonQuery.releaseQuery((result) => {
          _self.releases = result.releases;
        })
      },

      moduleQuery() {
        let _self =  this;
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
          .catch(function (response) {
            _self.$notify.error("发生错误");
            console.log(response);
          });
      },

      queryDefect() {
        let _self =  this;
        _self.queryLoading = true;
        let foundTimeBegin = "",
          foundTimeEnd = "";
        if (_self.dform.foundTime && _self.dform.foundTime.length > 1) {
          foundTimeBegin = _self.dform.foundTime[0];
          foundTimeEnd = _self.dform.foundTime[1];
        }
        _self.$axios({
            method: "post",
            url: "/defect/refused",
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
      }
    }
  };
</script>

<style>
  .dform-box .el-form-item .el-input,
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

  .defect-table-expand .content-tips span{
    cursor: pointer;
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

  .dform-box {
    width: 97% !important;
    border: 1px solid #e4edf3;
    border-radius: 2px;
    padding: 1.5%;
    -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
  }

  .dform-box .el-table i {
    cursor: pointer;
    color: #3AB4D7;
  }
</style>
