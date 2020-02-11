<template>
  <div class="system-settings">
    <div v-for="item in configurations" :key="item.id" class="setting-main">
      <div class="crumbs">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>
            <i class="el-icon-setting" /> 系统配置
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{item.settingName}}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-button v-no-more-click type="text" icon="el-icon-edit" @click="editCurrentConfig(item)">修改配置项</el-button>
        <div style="border-bottom:1px solid #e4edf3;width:100%"></div>
      </div>

      <el-button
        v-no-more-click
        size="mini"
        type="primary"
        icon="el-icon-plus"
        @click="addEmptySetting(item)"
        style="float:right;margin:10px 0 5px 0">增加行</el-button>
      <el-table :data="listSettingValue(item.id)" size="mini" :border="showBorder" stripe>
        <el-table-column type="index" label="序号" width="50" align="center">
        </el-table-column>
        <el-table-column v-for="(ftitem, index) in item.settingKeys" :label="ftitem.paramLabel" :key="index" :min-width="ftitem.longInput == true ? '40%' : '20%'" align="center">
          <template slot-scope="scope">
            <el-input :type="ftitem.isPassword ? 'password' : 'text'" v-model="scope.row[ftitem.paramKey]" size="mini" :disabled="scope.row.disabled"></el-input>
          </template>
        </el-table-column>
        <el-table-column width="150" align="center" label="操作">
          <template slot-scope="scope">
            <el-button
              v-no-more-click
              type="warning"
              size="mini"
              class="el-icon-edit"
              @click="beginEdit(scope.$index, item)"
              v-if="scope.row.disabled"> 编辑</el-button>
            <el-button
              v-no-more-click
              type="success"
              size="mini"
              class="el-icon-check"
              @click="saveCurrentSetting(item)"
              v-if="!scope.row.disabled"> 保存</el-button>
            <el-button
              v-no-more-click
              type="info"
              size="mini"
              class="el-icon-close"
              @click="cancelEdit(scope.row, item, scope.$index)"
              v-if="!scope.row.disabled"> 取消</el-button>
            <el-button
              v-no-more-click
              type="danger"
              size="mini"
              class="el-icon-delete"
              @click="deleteCurrentSetting(scope.$index, scope.row, item)"
              v-if="scope.row.disabled"> 删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-button v-no-more-click type="primary" class="more-settings" plain @click="showAddConfig=true">更多设置 <i class="el-icon-more" /></el-button>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showAddConfig" width="960px" :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">新增配置设置——</span>
        <span style="font-size:18px;color:#3AB4D7">增加、删除行之后必须 <b>保存</b> 方可生效</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form :model="newSettings" :inline="true" size="mini" label-width="110px">
        <el-form-item>
          <el-checkbox v-model="newSettings.useExists" size="mini" border style="margin-right:10px">选择已有配置</el-checkbox>
        </el-form-item>
        <el-form-item
          label="新配置项类型"
          prop="settingType"
          :rules="[{ required: true, message: '请输入配置项类型', trigger: 'blur' }]"
          style="width:240px"
          required
          v-if="!newSettings.useExists">
          <el-input placeholder="请输入" v-model="newSettings.settingType" style="width:120px" clearable></el-input>
        </el-form-item>
        <el-form-item
          label="新配置项名称"
          prop="settingName"
          :rules="[{ required: true, message: '请输入配置项名称', trigger: 'blur' }]"
          style="width:310px"
          required
          v-if="!newSettings.useExists">
          <el-input placeholder="请输入" v-model="newSettings.settingName" style="width:180px" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="existSetting.selected" placeholder="请选择" @change="loadExistSetting()" v-if="newSettings.useExists">
            <el-option v-for="opt in existSetting.opts" :label="opt.label" :key="opt.value" :value="opt.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="配置条目限制" prop="settingLimit" :rules="[{ type: 'number', required: true, message: '请输入正整数或0', trigger: 'blur' }]">
          <el-input v-model.number="newSettings.settingLimit" placeholder="正整数或0" style="width:100px"></el-input>
        </el-form-item>
      </el-form>
      <div style="border-bottom:1px solid #e4edf3;width:100%;margin-bottom:5px"></div>
      <el-button
        v-no-more-click
        size="mini"
        type="primary"
        icon="el-icon-plus"
        @click="addEmptyConfig()"
        style="float:right;margin-bottom:5px">增加行</el-button>
      <el-table
        :data="newSettings.data"
        class="tb-edit"
        size="mini"
        @current-change="handleCurrentChange"
        ref="dymTable"
        highlight-current-row
        max-height="300"
        :border="showBorder">
        <el-table-column label="参数名" header-align="center">
          <template slot-scope="scope">
            <el-input size="mini" v-model="scope.row.paramKey" placeholder="请输入参数名，非空"></el-input>
            <span>{{scope.row.paramKey}}</span>
          </template>
        </el-table-column>
        <el-table-column label="展示标签" header-align="center">
          <template slot-scope="scope">
            <el-input size="mini" v-model="scope.row.paramLabel" placeholder="请输入展示标签，非空"></el-input>
            <span>{{scope.row.paramLabel}}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否密码" width="100" align="center">
          <template slot-scope="scope">
            <el-checkbox size="mini" v-model="scope.row.isPassword"></el-checkbox>
            <span>{{scope.row.isPassword ? '是' : '否'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否宽值域" width="100" align="center">
          <template slot-scope="scope">
            <el-checkbox size="mini" v-model="scope.row.longInput"></el-checkbox>
            <span>{{scope.row.longInput ? '是' : '否'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否值唯一" width="100" align="center">
          <template slot-scope="scope">
            <el-checkbox size="mini" v-model="scope.row.valueUnique"></el-checkbox>
            <span>{{scope.row.valueUnique ? '是' : '否'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button v-no-more-click size="mini" type="danger" icon="el-icon-close" @click="deleteRowNew(scope.$index)">删除</el-button>
            <el-button v-no-more-click size="mini" type="success" icon="el-icon-check" @click="addRowNew(scope.$index, scope.row)">暂存</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button v-no-more-click type="info" icon="el-icon-circle-close" size="small" @click="showAddConfig=false">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="saveNewConfig()">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showModConfig" width="960px" :fullscreen="maximize1">
      <div slot="title">
        <span style="font-size:18px">修改配置设置——</span>
        <span style="font-size:18px;color:#3AB4D7">增加、删除行之后必须 <b>保存</b> 方可生效</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize1=!maximize1">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize1==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize1==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form :model="currentConfig" :inline="true" size="mini" label-width="120px">
        <el-form-item label="配置项类型" prop="settingType" :rules="[{ required: true, message: '请输入配置项类型', trigger: 'blur' }]">
          <el-input v-model="currentConfig.settingType" disabled></el-input>
        </el-form-item>
        <el-form-item label="配置项名称" prop="settingName" :rules="[{ required: true, message: '请输入配置项名称', trigger: 'blur' }]">
          <el-input v-model="currentConfig.settingName"></el-input>
        </el-form-item>
        <el-form-item label="配置条目限制" prop="settingLimit" :rules="[{ type: 'number', required: true, message: '请输入正整数或0(无限制)', trigger: 'blur' }]">
          <el-input v-model.number="currentConfig.settingLimit"></el-input>
        </el-form-item>
      </el-form>
      <div style="border-bottom:1px solid #e4edf3;width:100%;margin-bottom:10px"></div>
      <el-button
        v-no-more-click
        size="mini"
        type="primary"
        icon="el-icon-plus"
        @click="addEmptyConfigMod()"
        style="float:right;margin-bottom:10px">增加行</el-button>
      <el-table
        :data="currentConfig.settingKeys"
        class="tb-edit"
        size="mini"
        @current-change="handleCurrentChange"
        ref="dymTable"
        :border="showBorder"
        highlight-current-row
        max-height="300">
        <el-table-column label="参数名" header-align="center">
          <template slot-scope="scope">
            <el-input size="mini" v-model="scope.row.isPassword ? 'password' : scope.row.paramKey" placeholder="请输入参数名，非空"></el-input>
            <span>{{scope.row.isPassword ? 'password' : scope.row.paramKey}}</span>
          </template>
        </el-table-column>
        <el-table-column label="展示标签" header-align="center">
          <template slot-scope="scope">
            <el-input size="mini" v-model="scope.row.paramLabel" placeholder="请输入展示标签，非空"></el-input>
            <span>{{scope.row.paramLabel}}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否密码" width="100" align="center">
          <template slot-scope="scope">
            <el-checkbox size="mini" v-model="scope.row.isPassword"></el-checkbox>
            <span>{{scope.row.isPassword ? '是' : '否'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否宽值域" width="100" align="center">
          <template slot-scope="scope">
            <el-checkbox size="mini" v-model="scope.row.longInput"></el-checkbox>
            <span>{{scope.row.longInput ? '是' : '否'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否值唯一" width="100" align="center">
          <template slot-scope="scope">
            <el-checkbox size="mini" v-model="scope.row.valueUnique"></el-checkbox>
            <span>{{scope.row.valueUnique ? '是' : '否'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button v-no-more-click size="mini" type="danger" icon="el-icon-close" @click="deleteRowMod(scope.$index)">删除</el-button>
            <el-button v-no-more-click size="mini" type="success" icon="el-icon-check" @click="addRowMod(scope.$index, scope.row)">暂存</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button v-no-more-click type="danger" icon="el-icon-delete" size="small" @click="deleteConfigSetting()">删除配置项与配置数据</el-button>
        <el-button v-no-more-click type="info" icon="el-icon-circle-close" size="small" @click="showModConfig=false">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="saveModConfig()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      formRef: "form_",
      configurations: [],
      maximize: false,
      maximize1: false,
      settings: [],
      currentConfig: {},
      currentSetting: {},
      showAddConfig: false,
      showModConfig: false,
      newSettings: {
        settingType: "",
        settingName: "",
        settingLimit: "",
        useExists: false,
        data: []
      },
      existSetting: {
        selected: "",
        opts: []
      }
    }
  },

  watch: {
    showAddConfig: function (val) {
      let _self = this;
      if (val && _self.newSettings.data.length == 0) {
        _self.addEmptyConfig();
      }
    },
    'newSettings.useExists': function (val) {
      let _self = this;
      if (val === false) {
        _self.newSettings.data.splice(0, _self.newSettings.data.length);
        _self.newSettings.settingLimit = "";
        _self.existSetting.selected = "";
      }
    }
  },

  created() {
    let _self = this;
    _self.listConfig();
    _self.listSetting();
  },

  methods: {
    handleCurrentChange(val) {},

    saveNewConfig() {
      let _self = this;
      let hasEmpty = false;
      _self.newSettings.data.forEach(row => {
        for (let key in row) {
          if (row[key] === null || row[key] === "") {
            hasEmpty = true;
            return;
          }
        }
      });

      if (hasEmpty === true) {
        _self.$message.warning("不允许存在空值配置！");
        return;
      }
      let settingType = _self.newSettings.settingType;
      let settingName = _self.newSettings.settingName;
      let settingLimit = _self.newSettings.settingLimit;
      let settingKeys = JSON.stringify(_self.newSettings.data);
      if (_self.newSettings.useExists == true) {
        let exists = _self.existSetting.opts.find(d => {
          return d.value == _self.existSetting.selected;
        });
        if (!exists) {
          _self.$message.warning("请选择配置类型！");
          return;
        }
        _self.updateConfig(exists.label, settingLimit, settingKeys, exists.value);
      } else {
        let duplicated = _self.configurations.find(cfg => {
          return cfg.settingName == settingName || cfg.settingType == settingType;
        });
        if (duplicated) {
          _self.$message.warning("配置类型和名称不可以重复！");
          return;
        }
        _self.createConfig(settingType, settingName, settingLimit, settingKeys);
      }
    },

    saveModConfig() {
      let _self = this;
      let hasEmpty = false;
      let savedKeys = _self.currentConfig.settingKeys;
      savedKeys.forEach(row => {
        for (let key in row) {
          if (row[key] === null || row[key] === "") {
            hasEmpty = true;
            return;
          }
        }
      });

      if (hasEmpty === true) {
        _self.$message.warning("不允许存在空值配置！");
        return;
      }
      let settingName = _self.currentConfig.settingName;
      let settingLimit = _self.currentConfig.settingLimit;
      let settingKeys = JSON.stringify(savedKeys);
      let id = _self.currentConfig.id;
      _self.updateConfig(settingName, settingLimit, settingKeys, id);

      let index = -1;
      let currentSetting = undefined;
      for (let i = 0; i < _self.settings.length; i++) {
        if (_self.settings[i].configId === _self.currentConfig.id) {
          currentSetting = _self.settings[i];
          index = i;
          break;
        }
      }
      if (!currentSetting) {
        return;
      }
      let valueKeys = [];
      let configKeys = [];
      let needReduce = [];
      for (let valuedKey in currentSetting.settingValue[0]) {
        valueKeys.push(valuedKey);
      }
      savedKeys.forEach(key => {
        configKeys.push(key.paramKey);
      });

      // 如果关键字列数增加，为原有设置值追加新的key
      let needAppend = savedKeys.filter(key => {
        return valueKeys.indexOf(key.paramKey) == -1
      });
      needAppend.forEach(app => {
        currentSetting.settingValue.forEach(row => {
          _self.$set(row, app.paramKey, "");
        });
      });

      // 如果关键字列减少，原有设置数据列同步减少
      for (let key in currentSetting.settingValue[0]) {
        if (configKeys.indexOf(key) == -1) {
          needReduce.push(key);
        }
      }
      needReduce.forEach(red => {
        currentSetting.settingValue.forEach(row => {
          delete row[red];
        });
      });

      // 提交配置数据更新，刷新数据
      if (needAppend.length > 0 || needReduce.length > 0) {
        _self.settingUpdate(currentSetting, currentSetting.settingValue);
      }
    },

    deleteConfigSetting() {
      let _self = this;
      _self.$confirm("确认删除当前配置项和配置数据吗？", "删除告警", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        })
        .then(() => {
          _self.deleteConfig();
          setTimeout(() => {
            _self.deleteSetting();
          }, 100);
        })
        .catch(() => {});
    },

    deleteConfig() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/config/delete",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            id: _self.currentConfig.id
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("删除配置项成功！");
            _self.showModConfig = false;
            _self.listConfig();
          } else {
            _self.$message.warning("删除配置项失败！");
          }
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    deleteSetting() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/setting/delete",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            id: _self.settings.find(set => {
              return set.configId === _self.currentConfig.id;
            }).id
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("删除配置数据成功！");
            _self.listSetting();
          } else {
            _self.$message.warning("删除配置数据失败！");
          }
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    createConfig(settingType, settingName, settingLimit, settingKeys) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/config/create",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            settingType: settingType.toUpperCase(),
            settingName: settingName,
            settingLimit: settingLimit,
            settingKeys: settingKeys
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.createNewSetting(res.data);
            _self.$message.success("新增配置项成功！");
            _self.showAddConfig = false;
            _self.listConfig();
            _self.listSetting();
          } else {
            _self.$message.warning("新增配置项失败！");
          }
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    updateConfig(settingName, settingLimit, settingKeys, id) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/config/update",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            settingName: settingName,
            settingLimit: settingLimit,
            settingKeys: settingKeys,
            id: id
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("修改配置项成功！");
            _self.showAddConfig = false;
            _self.showModConfig = false;
            _self.listConfig();
            _self.listSetting();
          } else {
            _self.$message.warning("修改配置项失败！");
          }
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    editCurrentConfig(currentConfig) {
      let _self = this;
      _self.currentConfig = currentConfig;
      _self.showModConfig = true;
    },

    createNewSetting(configId) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/setting/create",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            configId: configId,
            settingValue: "[]"
          }
        })
        .then(function (res) {
          if (res.data <= 0) {
            _self.$message.warning("穿件默认配置参数失败！");
            return;
          }
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    addEmptySetting(config) {
      let _self = this;
      let limit = config.settingLimit;
      let rowCount = 0;
      let cntSetting = {};
      for (let i = 0; i < _self.settings.length; i++) {
        if (_self.settings[i].configId == config.id) {
          cntSetting = _self.settings[i];
          break;
        }
      }
      rowCount = cntSetting.settingValue.length;
      if (limit > 0 && limit <= rowCount) {
        _self.$message.info("该配置最多允许配置 " + limit + " 行！");
        return;
      }
      let emptySetting = {};
      config.settingKeys.forEach(item => {
        _self.$set(emptySetting, item.paramKey, "");
      })
      cntSetting.settingValue.push(emptySetting);
      setTimeout(() => {
        _self.$set(emptySetting, "disabled", false);
      }, 100);
    },

    deleteCurrentSetting(index, row, configItem) {
      let _self = this;
      let emptyKeys = 0;
      let configedSetting = _self.settings.find(d => {
        return d.configId == configItem.id;
      });
      let configedValue = configedSetting.settingValue;
      let keyCount = configItem.settingKeys.length;
      configItem.settingKeys.forEach(item => {
        if (!row[item.paramKey] || row[item.paramKey] == null) {
          emptyKeys++;
        }
      })
      if (emptyKeys == keyCount) {
        configedValue.splice(index, 1);
      } else if (emptyKeys > 0 && emptyKeys < keyCount) {
        _self.$confirm("请确认不保存直接删除吗？", "存在未保存记录", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            configedValue.splice(index, 1);
          })
          .catch(() => {});
      } else {
        _self.$confirm("确认删除当前记录吗？", "删除告警", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            let tempValue = [];
            for (let i = 0; i < configedValue.length; i++) {
              if (index != i) {
                tempValue.push(configedValue[i]);
              }
            }
            _self.settingUpdate(configedSetting, tempValue);
          })
          .catch(() => {});
      }
    },

    saveCurrentSetting(configItem) {
      let _self = this;
      let configedSetting = _self.settings.find(d => {
        return d.configId == configItem.id;
      });
      let configedValue = configedSetting.settingValue;
      let existEmpty = false;
      configedValue.forEach(row => {
        for (let key in row) {
          if (row[key] === null || row[key] === "") {
            existEmpty = true;
            return;
          }
        }
      });
      if (existEmpty == true) {
        _self.$message.warning("配置值不允许存在空记录！");
        return;
      } else {
        configedValue.forEach(row => {
          delete row.disabled;
        });
        _self.settingUpdate(configedSetting, configedValue);
      }
    },

    beginEdit(index, configItem) {
      let _self = this;
      let currentValItem = null;
      let lastIndex = _self.currentSetting.lastIndex;
      let lastItem = null;

      if (_self.currentSetting.lastItemId && lastIndex >= 0) {
        lastItem = _self.configurations.find(cfg => {
          return cfg.id == _self.currentSetting.lastItemId;
        });
      }
      _self.configurations.forEach(item => {
        let configedSetting = _self.settings.find(d => {
          return d.configId == item.id;
        });
        if (!configedSetting || !configedSetting.settingValue) {
          return;
        }
        let settingValue = configedSetting.settingValue;
        if (item.id == configItem.id) {
          for (let i = 0; i < settingValue.length; i++) {
            if (index == i) {
              settingValue[i].disabled = false;
              currentValItem = settingValue[i];
            } else {
              if (settingValue[i].disabled == false && lastIndex >= 0) {
                configItem.settingKeys.forEach(set => {
                  settingValue[i][set.paramKey] = _self.currentSetting[set.paramKey];
                });
              }
              settingValue[i].disabled = true;
            }
          }
        } else {
          for (let i = 0; i < settingValue.length; i++) {
            if (settingValue[i].disabled == false && lastIndex >= 0) {
              lastItem.settingKeys.forEach(set => {
                settingValue[i][set.paramKey] = _self.currentSetting[set.paramKey];
              });
            }
            settingValue[i].disabled = true;
          }
        }
      });
      for (let key in _self.currentSetting) {
        delete _self.currentSetting[key];
      }
      configItem.settingKeys.forEach(key => {
        _self.currentSetting[key.paramKey] = currentValItem[key.paramKey];
      });
      _self.$set(_self.currentSetting, "lastItemId", configItem.id);
      _self.$set(_self.currentSetting, "lastIndex", index);
    },

    cancelEdit(row, configItem, index) {
      let _self = this;
      let emptyKeys = 0;
      row.disabled = true;
      let keyCount = configItem.settingKeys.length;
      configItem.settingKeys.forEach(item => {
        row[item.paramKey] = _self.currentSetting[item.paramKey];
      });
      for (let key in _self.currentSetting) {
        delete _self.currentSetting[key];
      }
      let configedValue = _self.settings.find(d => {
        return d.configId == configItem.id;
      }).settingValue;
      configItem.settingKeys.forEach(item => {
        if (!row[item.paramKey] || row[item.paramKey] == null) {
          emptyKeys++;
        }
      });
      if (emptyKeys == keyCount) {
        configedValue.splice(index, 1);
      }
    },

    listSettingValue(configId) {
      let _self = this;
      let configedSetting = _self.settings.find(item => {
        return item.configId == configId;
      });
      if (!configedSetting) {
        return [];
      }
      let settingValue = configedSetting.settingValue;
      for (let i = 0; i < settingValue.length; i++) {
        _self.$set(settingValue[i], "disabled", true);
      }
      return settingValue;
    },

    loadExistSetting() {
      let _self = this;
      _self.newSettings.data.splice(0, _self.newSettings.data.length);
      let selectedConfig = _self.configurations.find(item => {
        return item.id === _self.existSetting.selected;
      });
      selectedConfig.settingKeys.forEach(item => {
        _self.newSettings.data.push(item);
      });
      _self.newSettings.settingLimit = selectedConfig.settingLimit;
    },

    addEmptyConfig() {
      let _self = this;
      let emptied = {
        paramKey: "",
        paramLabel: "",
        longInput: false,
        isPassword: false,
        valueUnique: false
      };
      _self.newSettings.data.push(emptied);
      setTimeout(() => {
        _self.$refs.dymTable.setCurrentRow(emptied);
      }, 100);
    },

    addEmptyConfigMod() {
      let _self = this;
      let emptied = {
        paramKey: "",
        paramLabel: "",
        longInput: false,
        isPassword: false,
        valueUnique: false
      };
      _self.currentConfig.settingKeys.push(emptied);
      setTimeout(() => {
        _self.$refs.dymTable.setCurrentRow(emptied);
      }, 100);
    },

    listConfig() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/config/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          }
        })
        .then(function (res) {
          _self.configurations = eval(res.data);
          _self.existSetting.opts.splice(0, _self.existSetting.opts.length);
          _self.configurations.forEach(item => {
            _self.existSetting.opts.push({
              label: item.settingType + " - " + item.settingName,
              value: item.id
            });
          });
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    listSetting() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/setting/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          }
        })
        .then(function (res) {
          let json = eval(res.data);
          _self.settings.splice(0, _self.settings.length);
          for (let i = 0; i < json.length; i++) {
            _self.settings.push(json[i]);
          }
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    settingUpdate(configedSetting, configedValue) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/setting/update",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            id: configedSetting.id,
            settingValue: JSON.stringify(configedValue)
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("修改配置数据成功！");
            _self.listSetting();
          } else {
            _self.$message.warning("修改配置数据失败！");
          }
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    deleteRowNew(index) {
      let _self = this;
      _self.newSettings.data.splice(index, 1);
    },

    deleteRowMod(index) {
      let _self = this;
      _self.currentConfig.settingKeys.splice(index, 1);
    },

    addRowNew(index, rowData) {
      let _self = this;
      if (null === rowData.paramKey || rowData.paramKey.length < 1) {
        _self.$notify.error("参数名不能为空！");
        return;
      }
      if (null === rowData.paramLabel || rowData.paramLabel.length < 1) {
        _self.$notify.error("参数展示名称不能为空！");
        return;
      }
      if (_self.newSettings.data.length == index + 1) {
        var d = {
          paramKey: "",
          paramLabel: "",
          longInput: false,
          isPassword: false,
          valueUnique: false
        };
        _self.newSettings.data.push(d);
        setTimeout(() => {
          _self.$refs.dymTable.setCurrentRow(d);
        }, 100);
      } else {
        setTimeout(() => {
          _self.$refs.dymTable.setCurrentRow(null);
        }, 100);
      }
    },

    addRowMod(index, rowData) {
      let _self = this;
      if (null === rowData.paramKey || rowData.paramKey.length < 1) {
        _self.$notify.error("参数名不能为空！");
        return;
      }
      if (null === rowData.paramLabel || rowData.paramLabel.length < 1) {
        _self.$notify.error("参数展示名称不能为空！");
        return;
      }
      if (_self.currentConfig.settingKeys.length == index + 1) {
        var d = {
          paramKey: "",
          paramLabel: "",
          longInput: false,
          isPassword: false,
          valueUnique: false
        };
        _self.currentConfig.settingKeys.push(d);
        setTimeout(() => {
          _self.$refs.dymTable.setCurrentRow(d);
        }, 100);
      } else {
        setTimeout(() => {
          _self.$refs.dymTable.setCurrentRow(null);
        }, 100);
      }
    }
  }
}
</script>

<style>
.system-settings {
  overflow-y: auto;
}

.system-settings .setting-main {
  margin-bottom: 30px;
  display: inline-block;
}

.system-settings .setting-main .el-form {
  margin: 0 0 10px 20px;
}

.system-settings .setting-main .el-table {
  float: right;
  width: 97%;
}

.system-settings .setting-main .el-table .el-input * {
  text-align: center;
  cursor: initial;
}

.system-settings .el-table .el-button,
.system-settings .el-dialog__body>.el-button,
.system-settings .setting-main>.el-button,
.system-settings .el-dialog__body .el-form .el-checkbox {
  padding: 5px 10px;
}

.system-settings .setting-main .el-form-item input {
  width: 130px;
}

.system-settings .setting-main .el-form-item .long-input input {
  width: 220px;
}

.system-settings .crumbs {
  margin: 0;
}

.system-settings .crumbs>div {
  display: inline-block;
}

.system-settings .crumbs .el-button {
  padding: 0;
  float: right;
  vertical-align: bottom;
}

.system-settings .save-btn {
  float: right;
}

.more-settings {
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.tb-edit .el-input,
.tb-edit .el-checkbox,
.tb-edit .el-select {
  display: none;
  width: 100%;
}

.tb-edit .current-row .el-input,
.tb-edit .current-row .el-checkbox,
.tb-edit .current-row .el-select {
  display: inherit;
}

.tb-edit .cell,
.tb-edit .current-row .el-input input {
  text-align: center;
}

.tb-edit .current-row .el-input+span,
.tb-edit .current-row .el-checkbox+span,
.tb-edit .current-row .el-select+span {
  display: none;
}
</style>
