<template>
  <div class="case-info">
    <el-form :model="form" :inline="true" size="mini" :rules="baseInfoRules" ref="baseInfoForm">
      <el-form-item class="autocase">
        <template slot="label">
          <el-tooltip content="点击用例标题查看更多测试用例信息" placement="left" effect="dark">
            <span>用例ID-标题</span>
          </el-tooltip>
        </template>
        <el-popover placement="bottom-start" width="380" trigger="click">
          <el-form label-position="right" size="mini" :inline="false" label-width="150px">
            <el-form-item label="被执行次数：">
              <el-input v-model="form.executedTimes" disabled></el-input>
            </el-form-item>
            <el-form-item label="关联缺陷个数：">
              <el-input v-model="form.relatedBug" disabled></el-input>
            </el-form-item>
            <el-form-item label="覆盖产品需求个数：">
              <el-input v-model="form.relatedReq" disabled></el-input>
            </el-form-item>
            <el-form-item label="用例设计时间：">
              <el-input v-model="form.designDate" disabled></el-input>
            </el-form-item>
            <el-form-item label="最后执行时间：">
              <el-input v-model="form.lastExecuted" disabled></el-input>
            </el-form-item>
            <el-form-item label="最新执行结果：">
              <el-select v-model="form.testResult" disabled>
                <el-option v-for="opt in testResults" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <el-input v-model="caseTitle" disabled class="read-content-tips" slot="reference">{{caseTitle}}</el-input>
        </el-popover>
      </el-form-item>
      <el-form-item class="button-item">
        <el-tooltip content="您没有本产品权限，无法操作！" placement="left" effect="dark" :disabled="!editForbidden">
          <el-button
            v-no-more-click
            size="mini"
            type="primary"
            icon="el-icon-circle-check"
            @click="checkSaveCaseInfo('baseInfoForm')"
            :disabled="editForbidden">保存</el-button>
        </el-tooltip>
      </el-form-item>
      <br>
      <el-form-item label="产品模块" prop="prodModule" v-if="!editForbidden">
        <el-select v-model="form.prodModule" placeholder="请选择（必选）" clearable filterable :disabled="readOnly">
          <el-option v-for="opt in modules" :value="opt.moduleId" :key="opt.moduleId" :label="opt.moduleName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品模块" v-else>
        <el-input v-model="form.prodModuleName" disabled></el-input>
      </el-form-item>
      <el-form-item label="优先级" prop="priority" required v-if="!editForbidden">
        <el-select v-model="form.priority" placeholder="请选择" filterable :disabled="readOnly">
          <el-option v-for="opt in priorities" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" v-else>
        <el-input v-model="form.priorityName" disabled></el-input>
      </el-form-item>
      <el-form-item label="用例状态" required v-if="!editForbidden">
        <el-select v-model="form.caseStatus" placeholder="请选择" :disabled="readOnly">
          <el-option v-for="opt in caseStatuss" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用例状态" v-else>
        <el-input v-model="form.statusName" disabled></el-input>
      </el-form-item>
      <el-form-item label="测试阶段" required v-if="!editForbidden">
        <el-select v-model="form.testPeriod" placeholder="请选择" filterable :disabled="readOnly">
          <el-option v-for="opt in testPeriods" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="测试阶段" v-else>
        <el-input v-model="form.testPeriodName" disabled></el-input>
      </el-form-item>
      <el-form-item label="测试类型" required v-if="!editForbidden">
        <el-select v-model="form.testType" placeholder="请选择" :disabled="readOnly">
          <el-option v-for="opt in testTypes" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="测试类型" v-else>
        <el-input v-model="form.testTypeName" disabled></el-input>
      </el-form-item>
      <el-form-item label="设计者">
        <el-input v-model="form.designerName" disabled></el-input>
      </el-form-item>
      <el-form-item label="回归标识" v-if="!editForbidden">
        <el-select v-model="form.regressMark.selected" placeholder="请选择" filterable :disabled="readOnly">
          <el-option v-for="opt in form.regressMark.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="回归标识" v-else>
        <el-input v-model="form.regressMarkName" disabled></el-input>
      </el-form-item>
      <el-form-item label="测试脚本" class="autocase" prop="autoPath">
        <el-input v-model="form.autoPath" placeholder="例如：class:com.xx.TestABC 或 testng:~/tests/suiteEFG.xml" spellcheck="false" clearable :disabled="readOnly || editForbidden"></el-input>
      </el-form-item>
      <br>
      <el-form-item label="前置条件" class="case-desc" prop="preCondition">
        <el-input
          v-model="form.preCondition"
          type="textarea"
          :rows="4"
          placeholder="请输入前置条件"
          resize="none"
          :maxlength="2000"
          show-word-limit
          clearable
          :disabled="readOnly || editForbidden">前置条件</el-input>
      </el-form-item>
      <el-form-item label="用例描述" class="case-desc" prop="summary">
        <simple-mde v-model="form.summary" :configs="configs" ref="caseDetail" v-if="loadMde"></simple-mde>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {
  dateFormat
} from "@/util/date.js";
import commonQuery from "@/components/util/CommonQuery.vue";
import simpleMde from "vue-simplemde/src/markdown-editor";
let id = 0;
const rootParent = 0;
const rootId = 1;
const testPatern = /^(class:|test:).*(\.java|\.py|\.sql)$/;
const suitePatern = /^(suite:|testng:).*\.xml$/;
export default {
  data: function () {
    return {
      testResults: [],
      testTypes: [],
      priorities: [],
      testPeriods: [],
      caseStatuss: [],
      form: {
        tips: "请完成测试用例信息编辑之后保存修改，否则信息将丢失",
        editForbidden: false,
        product: {
          selected: sessionStorage.productId,
          opts: [{
            value: sessionStorage.productId,
            label: sessionStorage.productName
          }]
        },
        caseId: "",
        caseStatus: 1,
        designer: parseInt(sessionStorage.userId),
        priority: 2,
        testType: 1,
        prodModule: "",
        testPeriod: 4,
        regressMark: {
          selected: "N",
          opts: [{
              value: "Y",
              label: "是"
            },
            {
              value: "N",
              label: "否"
            }
          ]
        },
        autoPath: "",
        summary: "",
        preCondition: "",
        lastExecuted: "",
        testResult: "",
        executedTimes: "",
        designDate: "",
        relatedReq: "",
        relatedBug: ""
      },
      modules: [],
      members: [],
      baseInfoRules: {
        'prodModule': [{
          required: true,
          message: '请选择产品模块',
          trigger: 'change'
        }]
      },
      loadMde: true,
      caseTitle: "",
      designerDisabled: true,
      configs: {
        status: false, // 禁用底部状态栏
        autofocus: false, //激活容易影响键盘快捷键事件监听
        spellChecker: false, // 禁用拼写检查,
        showIcons: [
          "code",
          "table",
          "strikethrough"
        ],
        hideIcons: ["fullscreen", "side-by-side"],
        placeholder: "此处可通过粘贴板或者拖拽进行快捷图片上传，仅限图片",
        renderingConfig: {
          codeSyntaxHighlighting: true,
          highlightingTheme: "atom-one-light"
        }
      }
    };
  },

  components: {
    simpleMde
  },

  watch: {
    caseId: function () {
      this.caseTitle = this.caseId + " - " + this.title;
      this.editForbidden = parseInt(this.currentProd) != parseInt(sessionStorage.productId);
    }
  },

  created() {
    let _self = this;
    _self.testResults.splice(0, _self.testResults.length);
    let testResultStatus = localStorage.getItem("testResultStatus");
    eval(testResultStatus).forEach(item => {
      _self.testResults.push({
        value: item.statusId,
        label: item.statusName
      });
    });

    _self.testTypes.splice(0, _self.testTypes.length);
    let testType = localStorage.getItem("testType");
    eval(testType).forEach(item => {
      _self.testTypes.push({
        value: item.typeId,
        label: item.typeName
      });
    });

    _self.priorities.splice(0, _self.priorities.length);
    let testPriority = localStorage.getItem("testPriority");
    eval(testPriority).forEach(item => {
      _self.priorities.push({
        value: item.priorityId,
        label: item.priorityName
      });
    });

    _self.testPeriods.splice(0, _self.testPeriods.length);
    let testPeriod = localStorage.getItem("testPeriod");
    eval(testPeriod).forEach(item => {
      _self.testPeriods.push({
        value: item.periodId,
        label: item.periodName
      });
    });

    _self.caseStatuss.splice(0, _self.caseStatuss.length);
    let testStatus = localStorage.getItem("testStatus");
    eval(testStatus).forEach(item => {
      _self.caseStatuss.push({
        value: item.statusId,
        label: item.statusName
      });
    });

    _self.caseTitle = _self.caseId + " - " + _self.title;
    _self.editForbidden = parseInt(_self.currentProd) != parseInt(sessionStorage.productId);
    _self.queryCaseInfo(_self.caseId);
    _self.moduleQuery();
    if (_self.readOnly) {
      if (!_self.configs.toolbar) {
        _self.$set(_self.configs, "toolbar", false);
      } else {
        _self.configs.toolbar = false;
      }
    } else {
      if (_self.configs.toolbar) {
        delete _self.configs[toolbar];
      }
    }
  },

  methods: {
    checkSaveCaseInfo(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          if (!_self.form.prodModule || _self.form.prodModule == 0 || _self.form.prodModule == '未定义') {
            _self.$message.warning("请选择正确的所属模块！");
            return;
          }
          if (
            _self.form.autoPath &&
            !testPatern.test(_self.form.autoPath.toLowerCase()) &&
            !suitePatern.test(_self.form.autoPath.toLowerCase())
          ) {
            _self.$message.warning("测试脚本路径格式校验不通过！");
            return;
          }
          _self.saveCaseInfo();
        }
      });
    },

    saveCaseInfo() {
      let _self = this;
      _self.$axios.post("/case/info_save", {
          caseId: _self.caseId,
          status: _self.form.caseStatus,
          productId: _self.form.product.selected,
          designer: _self.form.designer,
          priority: _self.form.priority,
          testPeriod: _self.form.testPeriod,
          testType: _self.form.testType,
          prodModule: _self.form.prodModule,
          regressMark: _self.form.regressMark.selected ? _self.form.regressMark.selected : "N",
          autoPath: _self.form.autoPath,
          summary: commonQuery.isNull(_self.form.summary) ? "" : _self.form.summary,
          preCondition: commonQuery.isNull(_self.form.preCondition) ? "" : _self.form.preCondition
        })
        .then(function (res) {
          if (res.data >= 1) {
            _self.queryCaseInfo(_self.caseId);
            _self.$message.success("保存成功");
          } else {
            _self.$notify.error("保存失败，没有记录更新");
          }
        })
    },

    queryCaseInfo(caseId) {
      let _self = this;
      _self.loadMde = false;
      this.$nextTick(_ => {
        if (_self.$refs.baseInfoForm) {
          _self.$refs.baseInfoForm.clearValidate();
        }
      });

      _self.$axios.post("/case/info_query/" + caseId)
        .then(function (res) {
          let info = eval(res.data);
          if (res.data && eval(res.data).length > 0) {
            _self.caseReadQuery(caseId);
            _self.form.designer = info[0].designer;
            _self.form.designerName = info[0].designerName;
            _self.form.caseStatus = info[0].status;
            _self.form.statusName = info[0].statusName;
            _self.form.priority = info[0].priority;
            _self.form.priorityName = info[0].priorityName;
            _self.form.testType = info[0].testType;
            _self.form.testTypeName = info[0].testTypeName;
            if (info[0].prodModule == 0) {
              _self.form.prodModule = "";
            } else {
              _self.form.prodModule = info[0].prodModule;
            }
            _self.form.prodModuleName = info[0].prodModuleName;
            _self.form.testPeriod = info[0].testPeriod;
            _self.form.testPeriodName = info[0].testPeriodName;
            _self.form.regressMark.selected = info[0].regressMark ? info[0].regressMark : "N";
            _self.form.regressMarkName = _self.form.regressMark.opts.find(item => {
              return item.value == _self.form.regressMark.selected
            }).label;
            _self.form.autoPath = info[0].autoPath;
            _self.form.summary = info[0].summary;
            _self.form.preCondition = info[0].preCondition;
            _self.form.lastExecuted = info[0].lastExecuted;
            _self.form.executedTimes = info[0].executedTimes;
            _self.form.designDate = info[0].designDate;
            _self.form.relatedReq = info[0].relatedReq;
            _self.form.relatedBug = info[0].relatedBug;

            let textHeight = (_self.readOnly == true) ? bodyAviHeightTab - 420 : bodyAviHeightTab - 380;
            _self.loadMde = true;
            _self.mdeIMGHandler();

            _self.$nextTick(function () {
              _self.$el.querySelector(".CodeMirror").style.height = textHeight + "px";
            });
          }
        })
    },

    caseReadQuery(caseId) {
      let _self = this;
      _self.$axios.post("/case/read_query/" + caseId)
        .then(function (res) {
          let result = res.data;
          _self.form.designDate = result.designDate;
          _self.form.executedTimes = result.executedTimes;
          _self.form.lastExecuted = commonQuery.isNull(result.lastExecuted) ? "尚未执行" : result.lastExecuted;
          _self.form.testResult = commonQuery.isNull(result.testResult) ? 5 : result.testResult;
          _self.form.relatedReq = commonQuery.isNull(result.relatedReq) ? 0 : result.relatedReq;
          _self.form.relatedBug = commonQuery.isNull(result.relatedBug) ? 0 : result.relatedBug;
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
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
          _self.modules = eval(res.data.list);
        })
    },

    mdeIMGHandler() {
      this.$nextTick(() => {
        [this.$refs.caseDetail].map(({
          simplemde
        }) => {
          if (this.readOnly || this.editForbidden) {
            simplemde.togglePreview();
            return;
          }
          simplemde.codemirror.on("drop", (editor, e) => {
            if (!(e.dataTransfer && e.dataTransfer.files)) {
              this.$notify.error("该浏览器不支持操作");
              return;
            }
            let dataList = e.dataTransfer.files;
            let imageFiles = [];
            for (let i = 0; i < dataList.length; i++) {
              if (dataList[i].type.indexOf("image") === -1) {
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
                dataList[0].kind === "file" &&
                dataList[0].getAsFile().type.indexOf("image") !== -1
              ) {
                this.mdeIMGUpload(simplemde.codemirror, [
                  dataList[0].getAsFile()
                ]);
              }
            } catch (e) {
              this.$notify.error("只能通过粘贴板上传，而不是文件");
            }
          });
        });
      });
    },

    mdeIMGUpload(simplemde, files) {
      let params = files.map(file => {
        let param = new FormData();
        param.append("file", file, '【' + sessionStorage.userName + '】测试用例附件图片.png');
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
            let url = `![](${ result.url})`; // 拼接成markdown语法
            let content = simplemde.getValue();
            simplemde.setValue(content + url + "\n"); // 和编辑框之前的内容进行拼接
          }
          this.$message.success("文件上传成功!");
        })
      );
    }
  },

  props: ["caseId", "currentProd", "readOnly", "title"]
};
</script>

<style>
@import "~simplemde/dist/simplemde.min.css";

.case-info .el-form {
  width: 100%;
}

.case-info .el-form-item {
  width: 32.95%;
}

.case-info .el-form-item {
  margin-bottom: 12px;
}

.case-info .el-form-item .el-select,
.case-info .el-form-item .el-input {
  width: 100%;
}

.case-info .el-form-item .el-form-item__label {
  width: 40%;
}

.case-info .el-form-item .el-form-item__content {
  width: 59%;
}

.case-info .autocase {
  width: 66% !important;
}

.case-info .autocase .el-form-item__label {
  width: 20%;
}

.case-info .autocase .el-form-item__content {
  width: 80% !important;
}

.case-info .autocase input {
  width: 100% !important;
}

.case-info .el-input__inner {
  padding: 0 10px;
}

.case-desc {
  width: 99% !important;
  border-radius: 2px;
}

.case-desc textarea,
.case-desc .markdown-editor {
  width: 100%;
}

.case-desc .el-form-item__label {
  width: 13.05% !important;
}

.case-desc .el-form-item__content {
  width: 86.95% !important;
}

.case-desc .CodeMirror,
.case-desc .CodeMirror-scroll {
  min-height: 65%;
}

.button-item,
.button-item .el-form-item__content,
.button-item .el-button {
  float: right;
}

.autocase .read-content-tips input {
  color: #3AB4D7 !important;
  cursor: pointer !important;
}

.autocase .read-content-tips input:hover {
  color: #61c3df !important;
}
</style>
