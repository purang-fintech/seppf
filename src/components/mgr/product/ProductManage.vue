<template>
  <div class="root">

    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-icon-product"></i> 产品配置</el-breadcrumb-item>
        <el-breadcrumb-item>产品配置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog :visible.sync="showPreview" width="940px" :show-close="false" custom-class="preview-dialog" top="100px">
      <v-direction :datas="configForm.defectTrend" v-if="null != configForm.defectTrend && configForm.defectTrend.length > 0"></v-direction>
    </el-dialog>

    <el-card class="product-info" shadow="hover">
      <div slot="header">
        <span>{{productInfo.productName}}</span>
        <el-button @click="deleteProduct()" type="text">禁用产品</el-button>
        <el-button style="margin-right:10px" @click="editing=false" type="text">取消修改</el-button>
        <el-button @click="checkSave('pdForm')" type="text">保存修改</el-button>
        <el-button @click="editing=true" type="text">修改</el-button>
      </div>
      <el-form
        ref="pdForm"
        :rules="prodfromRules"
        :model="productInfo"
        :inline="false"
        size="mini"
        label-width="110px">
        <el-form-item label="产品编号" prop="productCode" required>
          <el-input v-model="productInfo.productCode" :disabled="!editing"></el-input>
        </el-form-item>
        <el-form-item label="产品名称" prop="productName" required>
          <el-input v-model="productInfo.productName" :disabled="!editing"></el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="owner" required>
          <el-select
            v-model="productInfo.owner"
            filterable
            clearable
            :filter-method="filterUsers8"
            @visible-change="resetFilterText"
            :disabled="!editing"
            style="width:100%">
            <el-option-group v-for="group in userOptions8" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="是否有效" prop="isValid" required>
          <el-select v-model="productInfo.isValid" :disabled="!editing || productInfo.isValid==='Y'" style="width:100%">
            <el-option v-for="opt in isValid" :value="opt" :key="opt" :label="opt"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品描述" prop="productDesc">
          <el-input v-model="productInfo.productDesc" class="summary" type="textarea" :rows="5" :disabled="!editing"></el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="product-info" shadow="hover">
      <div slot="header">
        <span>项目/产品高级配置</span>
        <el-button @click="updateProductConfig()" type="text">保存修改</el-button>
      </div>
      <el-form
        :model="configForm"
        size="small"
        :inline="false"
        :rules="configFormRules"
        ref="configForm"
        label-width="135px">
        <el-form-item label="产品负责人" prop="pdResponser" required>
          <el-select
            v-model="configForm.pdResponser"
            placeholder="请选择"
            filterable
            clearable
            :filter-method="filterUsers1"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions1" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="辅助产品负责人" prop="pdAssistant">
          <el-select
            v-model="configForm.pdAssistant"
            placeholder="请选择，可多选"
            filterable
            clearable
            multiple
            :filter-method="filterUsers2"
            @change="multiOptionsHandler2">
            <el-option-group v-for="group in userOptions2" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin:0 10px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="开发负责人" prop="devResponser" required>
          <el-select
            v-model="configForm.devResponser"
            placeholder="请选择"
            filterable
            clearable
            :filter-method="filterUsers3"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions3" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="辅助开发负责人" prop="devAssistant">
          <el-select
            v-model="configForm.devAssistant"
            placeholder="请选择，可多选"
            filterable
            clearable
            multiple
            :filter-method="filterUsers4"
            @change="multiOptionsHandler4">
            <el-option-group v-for="group in userOptions4" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin:0 10px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="测试负责人" prop="testResponser" required>
          <el-select
            v-model="configForm.testResponser"
            placeholder="请选择"
            filterable
            clearable
            :filter-method="filterUsers5"
            @visible-change="resetFilterText">
            <el-option-group v-for="group in userOptions5" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="辅助测试负责人" prop="testAssistant">
          <el-select
            v-model="configForm.testAssistant"
            placeholder="请选择，可多选"
            filterable
            clearable
            multiple
            :filter-method="filterUsers6"
            @change="multiOptionsHandler6">
            <el-option-group v-for="group in userOptions6" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                <span style="float:left">{{ item.name }}</span>
                <span style="float:right;margin:0 10px;color:#9ca9c4">{{ item.account }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="需求变更审批人" prop="changeAuditor">
          <el-checkbox-group v-model="configForm.changeAuditor">
            <el-checkbox label="1" key="1" border>开发工程师</el-checkbox>
            <el-checkbox label="2" key="2" border>测试工程师</el-checkbox>
            <el-checkbox label="3" key="3" border>项目经理</el-checkbox>
            <el-checkbox label="4" key="4" border>产品主管</el-checkbox>
            <el-checkbox label="5" key="5" border>开发主管</el-checkbox>
            <el-checkbox label="6" key="6" border>测试主管</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="product-info" shadow="hover">
      <div slot="header">
        <span>质量预测配置(基于Gompertz模型)</span>
        <el-button @click="updateProductConfig()" type="text">保存修改</el-button>
      </div>
      <el-alert type="success" center title="Gompertz模型计算公式为：y=Math.exp(k + a * Math.pow(b, t))，其中t为时间点（个数）参数，k、a、b可配置或推算" :closable="false"></el-alert>
      <el-form
        :model="configForm"
        size="small"
        :inline="false"
        label-width="200px"
        style="margin-top:10px"
        class="gompertz-define">
        <el-form-item>
          <template slot="label">
            <el-tooltip content="测试缺陷除以线上问题与测试缺陷之和" placement="left" effect="dark">
              <span>DRE目标值</span>
            </el-tooltip>
          </template>
          <el-input v-model.number="configForm.dreTarget" maxlength="7">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="参数来源选择">
          <el-select v-model="configForm.paramChoosen" @change="setCalculationMethod()">
            <el-option v-for="opt in configForm.paramChoices" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="可参考版本" v-if="configForm.paramChoosen==3">
          <el-select v-model="configForm.historyRelease.selected" placeholder="请选择" @change="getReleaseParams()">
            <el-option v-for="opt in configForm.historyRelease.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采样规则-最少测试天数" v-if="configForm.paramChoosen==2">
          <el-input v-model.number="configForm.minTestPeriod"></el-input>
        </el-form-item>
        <el-form-item label="采样规则-最少发现缺陷数" v-if="configForm.paramChoosen==2">
          <el-input v-model.number="configForm.minDefectCount"></el-input>
        </el-form-item>
        <el-form-item label="采样规则-最近发布间隔月数" v-if="configForm.paramChoosen==2">
          <el-input v-model.number="configForm.latestOffsetMonth"></el-input>
        </el-form-item>
        <el-form-item style="float:right" v-if="configForm.paramChoosen==2" size="mini">
          <el-button v-no-more-click type="text" size="meddium" style="float:right;padding:5px 20px" @click="ruledParamCalculation()">基于历史版本采样规则的参数试算</el-button>
        </el-form-item>
        <br v-if="configForm.paramChoosen==2">
        <el-form-item label="参数数据">
          <div class="param-values">{{displayedParams()}}</div>
        </el-form-item>
        <el-form-item label="曲线走势预览">
          <el-button v-no-more-click type="text" size="meddium" style="line-height:0.5" @click="curvePreview(7)">一周</el-button>
          <el-button v-no-more-click type="text" size="meddium" style="line-height:0.5" @click="curvePreview(14)">两周</el-button>
          <el-button v-no-more-click type="text" size="meddium" style="line-height:0.5" @click="curvePreview(21)">三周</el-button>
          <el-button v-no-more-click type="text" size="meddium" style="line-height:0.5" @click="curvePreview(28)">四周</el-button>
          <el-button v-no-more-click type="text" size="meddium" style="line-height:0.5" @click="curvePreview(60)">两个月</el-button>
          <el-button v-no-more-click type="text" size="meddium" style="line-height:0.5" @click="curvePreview(90)">三个月</el-button>
        </el-form-item>
      </el-form>
      <el-alert type="warning" center title="组织架构、人员、应用架构、技术栈发生较大变动之后，建议先观测和累积至少3个月的数据再进行测算" :closable="false" style="margin-top:5px"></el-alert>
    </el-card>
  </div>
</template>

<script>
import commonQuery from "@/components/util/CommonQuery.vue";
import defectDirection from "./DefectDirection.vue";
export default {
  data: function () {
    return {
      modalClose: sessionStorage.dialogAutoClose == 1,
      productInfo: {},
      user: [],
      isValid: ["Y", "N"],
      editing: false,
      memberFull: [],
      userOptions: [],
      userOptions1: [],
      userOptions2: [],
      userOptions3: [],
      userOptions4: [],
      userOptions5: [],
      userOptions6: [],
      userOptions8: [],
      prodfromRules: {
        owner: [{
          required: true,
          message: "请选择负责人",
          trigger: "change"
        }],
        productCode: [{
            required: true,
            message: "请输入产品代码",
            trigger: "blur"
          },
          {
            min: 3,
            max: 15,
            message: "长度在 3 到 15 个字",
            trigger: "blur"
          }
        ],
        productName: [{
            required: true,
            message: "请输入工作产品名称",
            trigger: "blur"
          },
          {
            min: 3,
            max: 50,
            message: "长度在 3 到 50 个字",
            trigger: "blur"
          }
        ]
      },
      showPreview: false,
      configForm: {
        productId: "",
        pdResponser: "",
        pdAssistant: [],
        devResponser: "",
        devAssistant: [],
        testResponser: "",
        testAssistant: [],
        changeAuditor: [],
        dreTarget: 99.95,
        paramChoosen: 1,
        defaultPrams: [],
        currentParams: [],
        paramChoices: [{
            value: 1,
            label: "当前设置"
          },
          {
            value: 2,
            label: "已关闭历史版本"
          },
          {
            value: 3,
            label: "指定版本"
          }
        ],
        minTestPeriod: 3,
        minDefectCount: 10,
        latestOffsetMonth: 24,
        historyRelease: {
          selected: "",
          opts: []
        },
        defectTrend: []
      },
      configFormRules: {
        pdResponser: [{
          required: true,
          message: "请选择产品负责人",
          trigger: "change"
        }],
        devResponser: [{
          required: true,
          message: "请选择开发负责人",
          trigger: "change"
        }],
        testResponser: [{
          required: true,
          message: "请选择测试负责人",
          trigger: "change"
        }]
      },
    };
  },

  components: {
    vDirection: defectDirection
  },

  created() {
    let _self = this;
    _self.memberQuery(() => {
      _self.productQuery();
      _self.queryProductConfig();
      _self.configForm.paramChoosen = 1;
    });
  },

  methods: {
    resetFilterText() {
      let _self = this;
      _self.userOptions = _self.memberFull;
      _self.userOptions1 = _self.memberFull;
      _self.userOptions3 = _self.memberFull;
      _self.userOptions5 = _self.memberFull;
      _self.userOptions8 = _self.memberFull;
    },

    multiOptionsHandler6() {
      let _self = this;
      const selected = _self.configForm.testAssistant.concat([]);
      _self.configForm.testAssistant.splice(0, _self.configForm.testAssistant.length);
      _self.$nextTick(_ => {
        _self.userOptions6 = _self.memberFull;
        selected.forEach(d => {
          _self.configForm.testAssistant.push(d);
        });
      });
    },

    multiOptionsHandler4() {
      let _self = this;
      const selected = _self.configForm.devAssistant.concat([]);
      _self.configForm.devAssistant.splice(0, _self.configForm.devAssistant.length);
      _self.$nextTick(_ => {
        _self.userOptions3 = _self.memberFull;
        selected.forEach(d => {
          _self.configForm.devAssistant.push(d);
        });
      });
    },

    multiOptionsHandler2() {
      let _self = this;
      const selected = _self.configForm.pdAssistant.concat([]);
      _self.configForm.pdAssistant.splice(0, _self.configForm.pdAssistant.length);
      _self.$nextTick(_ => {
        _self.userOptions2 = _self.memberFull;
        selected.forEach(d => {
          _self.configForm.pdAssistant.push(d);
        });
      });
    },

    filterUsers(val) {
      let _self = this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers1(val) {
      let _self = this;
      _self.userOptions1 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers2(val) {
      let _self = this;
      _self.userOptions2 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers3(val) {
      let _self = this;
      _self.userOptions3 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers4(val) {
      let _self = this;
      _self.userOptions4 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers5(val) {
      let _self = this;
      _self.userOptions5 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers6(val) {
      let _self = this;
      _self.userOptions6 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers8(val) {
      let _self = this;
      _self.userOptions8 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    displayedParams() {
      if (!this.configForm.currentParams) {
        return "样本数据异常，结果为空";
      }
      if (this.configForm.currentParams instanceof Array && this.configForm.currentParams.length > 2) {
        let k = 'k=' + this.configForm.currentParams[0].toFixed(2);
        let a = 'a=' + this.configForm.currentParams[1].toFixed(2);
        let b = 'b=' + this.configForm.currentParams[2].toFixed(2);
        return k + ', ' + a + ', ' + b;
      }
      if (this.configForm.currentParams.toString().split(",").length < 4) {
        return this.configForm.currentParams.toString();
      }
      return "样本数据异常，结果为空";
    },

    setCalculationMethod() {
      let _self = this;
      if (_self.configForm.paramChoosen == 1) {
        _self.configForm.currentParams = _self.configForm.defaultPrams.concat([]);
      } else if (_self.configForm.paramChoosen == 2) {
        _self.getRuledSampleParams();
      } else if (_self.configForm.paramChoosen == 3) {
        _self.getRuledSampleRelease();
        _self.configForm.historyRelease.selected = "";
      }
    },

    ruledParamCalculation() {
      let _self = this;
      let gompertzDefine = {
        minTestPeriod: _self.configForm.minTestPeriod,
        minDefectCount: _self.configForm.minDefectCount,
        latestOffsetMonth: _self.configForm.latestOffsetMonth
      };
      _self.$axios.post("/quality/rules_precalc/" + sessionStorage.productId, {
          gompertzDefine: JSON.stringify(gompertzDefine)
        })
        .then(function (res) {
          let result = res.data;
          _self.configForm.currentParams.splice(0, _self.configForm.currentParams.length);
          if (!result) {
            _self.$message.warning("版本数据异常，无法推算参数！");
            _self.configForm.currentParams.push("无法获取版本参数");
          } else if (result instanceof Array) {
            _self.configForm.currentParams = result;
          } else {
            _self.configForm.currentParams.push(result.toString());
          }
        })
    },

    getRuledSampleRelease() {
      let _self = this;
      _self.$axios.post("/quality/ruled_sample_release/" + sessionStorage.productId)
        .then(function (res) {
          _self.configForm.historyRelease.opts.splice(0, _self.configForm.historyRelease.opts.length);
          eval(res.data).forEach(item => {
            _self.configForm.historyRelease.opts.push({
              value: item.id,
              label: item.relCode
            });
          });
        })
    },

    getReleaseParams() {
      let _self = this;
      _self.$axios.post("/quality/release_params/" + sessionStorage.productId + "/" + _self.configForm.historyRelease.selected)
        .then(function (res) {
          let result = res.data;
          _self.configForm.currentParams.splice(0, _self.configForm.currentParams.length);
          if (!result) {
            _self.$message.warning("版本数据异常，无法推算参数！");
            _self.configForm.currentParams.push("无法获取版本参数");
          } else if (result instanceof Array) {
            _self.configForm.currentParams = result;
          } else {
            _self.configForm.currentParams.push(result.toString());
          }
        })
    },

    getRuledSampleParams() {
      let _self = this;
      _self.$axios.post("/quality/ruled_sample_params/" + sessionStorage.productId)
        .then(function (res) {
          let result = res.data;
          _self.configForm.currentParams.splice(0, _self.configForm.currentParams.length);
          if (!result) {
            _self.$message.warning("版本数据异常，无法推算参数！");
            _self.configForm.currentParams.push("无法获取版本参数");
          } else if (result instanceof Array) {
            _self.configForm.currentParams = result;
          } else {
            _self.configForm.currentParams.push(result.toString());
          }
        })
    },

    curvePreview(days) {
      let _self = this;
      if (!_self.configForm.currentParams || _self.configForm.currentParams.toString().split(",").length < 4 || _self.displayedParams() == '样本数据异常，结果为空') {
        _self.$message.warning("参数错误，无法计算！");
        return;
      }
      _self.showPreview = true;
      _self.configForm.defectTrend.splice(0, _self.configForm.defectTrend.length);
      _self.$axios.post("/quality/defect_trend_preview/" + days, {
          calParams: _self.configForm.currentParams.toString()
        })
        .then(function (res) {
          _self.configForm.defectTrend = eval(res.data);
        })
    },

    initConfigs() {
      let _self = this;
      _self.configForm.pdResponser = "";
      _self.configForm.pdAssistant = [];
      _self.configForm.devResponser = "";
      _self.configForm.devAssistant = [];
      _self.configForm.testResponser = "";
      _self.configForm.testAssistant = [];
      _self.configForm.changeAuditor = [];
    },

    queryProductConfig() {
      let _self = this;
      _self.$axios.post("/product/config_query/" + sessionStorage.productId)
        .then(function (res) {
          let json = res.data;
          _self.initConfigs();
          if (!json) {
            _self.$message.info("本项目/产品尚未进行配置，请继续！");
            return;
          }
          if (json.changeAuditor && json.changeAuditor.length >= 1) {
            _self.configForm.changeAuditor = json.changeAuditor.split(",");
          }
          if (json.memberConfig) {
            _self.configForm.pdResponser = json.memberConfig.pdResponser;
            _self.configForm.devResponser = json.memberConfig.devResponser;
            _self.configForm.testResponser = json.memberConfig.testResponser;
            if (json.memberConfig.pdAssistant) {
              json.memberConfig.pdAssistant.split(",").forEach(item => {
                _self.configForm.pdAssistant.push(parseInt(item));
              });
            }
            if (json.memberConfig.devAssistant) {
              json.memberConfig.devAssistant.split(",").forEach(item => {
                _self.configForm.devAssistant.push(parseInt(item));
              });
            }
            if (json.memberConfig.testAssistant) {
              json.memberConfig.testAssistant.split(",").forEach(item => {
                _self.configForm.testAssistant.push(parseInt(item));
              });
            }
          }
          if (json.gompertzDefine) {
            _self.configForm.minTestPeriod = json.gompertzDefine.minTestPeriod;
            _self.configForm.minDefectCount = json.gompertzDefine.minDefectCount;
            _self.configForm.latestOffsetMonth = json.gompertzDefine.latestOffsetMonth;
          }
          if (json.gompertzParams) {
            _self.configForm.defaultPrams.splice(0, _self.configForm.defaultPrams.length);
            _self.configForm.defaultPrams.push(json.gompertzParams.k);
            _self.configForm.defaultPrams.push(json.gompertzParams.a);
            _self.configForm.defaultPrams.push(json.gompertzParams.b);
            _self.configForm.defaultPrams.push(json.gompertzParams.m);
          }
          _self.configForm.currentParams = _self.configForm.defaultPrams.concat([]);
          _self.configForm.dreTarget = json.dreTarget;
        })
    },

    updateProductConfig() {
      let _self = this;
      if (_self.configForm.pdResponser == "") {
        _self.$message.warning("产品负责人不可为空！");
        return;
      }
      if (_self.configForm.devResponser == "") {
        _self.$message.warning("开发负责人不可为空！");
        return;
      }
      if (_self.configForm.testResponser == "") {
        _self.$message.warning("测试负责人不可为空！");
        return;
      }
      let memberConfig = {
        pdResponser: _self.configForm.pdResponser,
        devResponser: _self.configForm.devResponser,
        testResponser: _self.configForm.testResponser,
        pdAssistant: _self.configForm.pdAssistant.toString(),
        devAssistant: _self.configForm.devAssistant.toString(),
        testAssistant: _self.configForm.testAssistant.toString()
      };
      let gompertzDefine = {
        minTestPeriod: _self.configForm.minTestPeriod,
        minDefectCount: _self.configForm.minDefectCount,
        latestOffsetMonth: _self.configForm.latestOffsetMonth
      };
      let gompertzParams = {
        k: _self.configForm.currentParams[0],
        a: _self.configForm.currentParams[1],
        b: _self.configForm.currentParams[2],
        m: _self.configForm.currentParams[3]
      };
      _self.$axios.post("/product/config_update", {
          productId: sessionStorage.productId,
          memberConfig: JSON.stringify(memberConfig),
          changeAuditor: _self.configForm.changeAuditor.toString(),
          gompertzDefine: JSON.stringify(gompertzDefine),
          gompertzParams: JSON.stringify(gompertzParams),
          dreTarget: _self.configForm.dreTarget
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("项目/产品高级配置修改成功！");
          } else {
            _self.$message.warning("项目/产品高级配置修改失败！");
            return;
          }
        })
    },

    checkSave(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          let reg = /^[a-zA-Z-]{3,15}$/;
          if (!reg.test(_self.productInfo.productCode)) {
            _self.$message.warning("产品编码只可输入字母和横线！");
            _self.productInfo.productCode = "";
            return;
          }
          _self.saveProductEdit();
        }
      });
    },

    memberQuery(callback) {
      let _self = this;
      commonQuery.memberQueryAll((result) => {
        _self.user = result.users;
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        _self.userOptions1 = result.usersFull;
        _self.userOptions2 = result.usersFull;
        _self.userOptions3 = result.usersFull;
        _self.userOptions4 = result.usersFull;
        _self.userOptions5 = result.usersFull;
        _self.userOptions6 = result.usersFull;
        _self.userOptions8 = result.usersFull;
        if (typeof callback == "function") {
          callback();
        }
      });
    },

    productQuery() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/product/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            productId: sessionStorage.productId
          }
        })
        .then(function (res) {
          _self.productInfo = eval(res.data.list)[0];
          _self.editing = false;
        })
    },

    saveProductEdit() {
      let _self = this;
      _self.$axios.post("/product/update", {
          productId: _self.productInfo.productId,
          userId: sessionStorage.userId,
          productCode: _self.productInfo.productCode.toUpperCase(),
          productName: _self.productInfo.productName,
          owner: _self.productInfo.owner,
          isValid: _self.productInfo.isValid,
          productDesc: _self.productInfo.productDesc
        })
        .then(function (res) {
          if ((res.data = 1)) {
            _self.$message.success("修改成功！");
            _self.productQuery();
          } else {
            _self.$message.warning("修改失败");
            console.log(response);
          }
        })
    },

    deleteProduct() {
      this.$confirm("确定要禁用当前产品吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.saveProductDelete();
        })
    },

    saveProductDelete() {
      let _self = this;
      _self.$axios.post("/product/delete/" + _self.productInfo.productId)
        .then(function (res) {
          if ((res.data = 1)) {
            _self.$message.success("产品禁用成功！");
            _self.productQuery();
          } else {
            _self.$message.warning("产品禁用失败");
            console.log(response);
          }
        })
    }
  }
};
</script>

<style>
.product-info .el-card__header .el-button {
  float: right;
  padding: 3px 0;
}

.product-info .el-card__header .el-button [class*="el-icon-"]+span {
  margin-left: 1px;
}

.product-info .el-form-item .el-select {
  width: 100%;
}

.product-info+.product-info {
  margin-top: 20px;
}

.product-form .el-form-item input {
  width: 150px;
}

.gompertz-define .el-form-item .el-input,
.gompertz-define .el-form-item .el-select {
  width: 213px;
}

.gompertz-define .param-values {
  background-color: #f5f7fa;
  border-radius: 2px;
  padding: 0 15px;
  height: 32px;
  border: 1px solid #e4e7ed;
  width: 180px;
}

.preview-dialog .el-dialog__body,
.preview-dialog .el-dialog__header {
  padding: 0;
}

.product-form .summary,
.product-form .summary input {
  width: 700px !important;
}
</style>
