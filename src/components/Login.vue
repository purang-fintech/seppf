<template>
  <div class="login-wrap">
    <div class="ms-title">{{ title }}</div>
    <div class="login-tabs">
      <el-tabs v-model="activeName" type="border-card">
        <el-tab-pane name="ldap" :disabled="ldapDisabled || outerNetwork">
          <span slot="label">
            <i class="iconfont icon-computer_fill"></i> LDAP（域认证）</span>
          <div class="ms-login">
            <el-form :model="ruleFormL" :rules="rules" ref="ruleFormL" label-width="0px" @keyup.enter.native="submitForm('ruleFormL')">
              <el-form-item prop="account">
                <el-input v-model="ruleFormL.account" placeholder="AD账号或GUEST" suffix-icon="iconfont icon-mine" clearable>
                  <el-select v-model="domain.selected" slot="prepend" placeholder="无可用">
                    <el-option v-for="opt in domain.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
                  </el-select>
                </el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  type="password"
                  placeholder="AD账号密码"
                  class="input-userd"
                  v-model="ruleFormL.password"
                  suffix-icon="iconfont icon-lock"
                  clearable></el-input>
              </el-form-item>
              <el-checkbox class="remember" v-model="ruleFormL.rememberPassword">记住密码</el-checkbox>
              <div class="login-btn">
                <el-button v-no-more-click type="success" @click="submitForm('ruleFormL')">登录</el-button>
                <br>
                <el-button v-no-more-click type="primary" @click="applyPriv('ruleFormL')">申请权限</el-button>
              </div>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane name="normal">
          <span slot="label"><i class="iconfont icon-people_fill"></i>
            <el-tooltip content="内网加域计算机请使用LDAP认证！" placement="right" effect="dark" :disabled="!normalDisabled">
              <span> 普通认证</span>
            </el-tooltip>
          </span>
          <div class="ms-login">
            <el-form :model="ruleFormN" :rules="rules" ref="ruleFormN" label-width="0px" @keyup.enter.native="submitForm('ruleFormN')">
              <el-form-item prop="account">
                <el-input v-model="ruleFormN.account" placeholder="账号名或邮箱" class="input-userd" suffix-icon="iconfont icon-mine" clearable>
                </el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  type="password"
                  placeholder="账号密码"
                  v-model="ruleFormN.password"
                  class="input-userd"
                  suffix-icon="iconfont icon-lock"
                  clearable></el-input>
              </el-form-item>
              <el-checkbox class="remember" v-model="ruleFormN.rememberPassword">记住密码</el-checkbox>
              <el-button class="remember" type="text" @click="beginReg()">新用户注册</el-button>
              <div class="login-btn">
                <el-button v-no-more-click type="success" @click="submitForm('ruleFormN')">登录</el-button>
                <br>
                <el-button v-no-more-click type="primary" @click="applyPriv('ruleFormN')">权限申请</el-button>
              </div>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="oper-tips">
        <p>友情提示：超过60分钟未操作，刷新或页面跳转时会强制退出登录</p>
        <p>浏览器显示比例100%、操作系统DPI为100%时，兼容最低分辨率为1600 * 900</p>
      </div>
    </div>

    <div class="footer">
      <span class="icp" v-if="outerNetwork" @click="toICPGov()">沪ICP备18000644号</span>
      <span v-if="outerNetwork" style="margin-left:20px">交流QQ群号： 362260709</span>
      <span v-else>使用中如果遇到问题，请<a class="icp" href="mailto:liuyi@purang.com">联系管理员</a></span>
      <span style="margin-left:20px">前端仓库：</span>
      <github-button href="https://github.com/purang-fintech/seppf" data-icon="octicon-star">Star</github-button>
      <github-button href="https://github.com/purang-fintech/seppf/issues" data-icon="octicon-issue-opened">Issue</github-button>
      <span style="margin-left:10px">后端仓库：</span>
      <github-button href="https://github.com/purang-fintech/seppb" data-icon="octicon-star">Star</github-button>
      <github-button href="https://github.com/purang-fintech/seppb/issues" data-icon="octicon-issue-opened">Issue</github-button>
    </div>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showNew" width="950px">
      <v-prod ref="newProduct"></v-prod>
      <div slot="footer">
        <el-button type="primary" icon="el-icon-close" @click="showNew=false" size="mini">取消</el-button>
        <el-button type="primary" icon="el-icon-check" @click="saveCreate()" size="mini">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showErrors" title="权限申请处理失败信息" width="600px">
      <div class="float-body" style="padding-top:40px;height:auto">
        <h2 v-for="item in errors">{{item}}</h2>
      </div>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showErrors=false" size="small">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showApplyPriv" :title="userName + ' 欢迎您！ 请选择要申请的产品和角色：'" width="880px">
      <div class="float-body" style="padding-top:40px;height:auto">
        <el-form :model="applyForm" :inline="false" size="middium" label-width="120px">
          <el-form-item label="产品选择">
            <el-select
              v-model="applyForm.products"
              placeholder="请选择"
              multiple
              collapse-tags
              clearable
              style="width:95%">
              <el-option v-for="opt in products" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="角色选择">
            <el-select
              v-model="applyForm.roles"
              placeholder="请选择"
              multiple
              collapse-tags
              clearable
              style="width:95%">
              <el-option v-for="opt in roles" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showApplyPriv=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="commitApply()" size="small">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="modalClose"
      :visible.sync="showChoice"
      :title="userName + ' 欢迎您！ 请选择项目/产品：'"
      fullscreen
      :show-close="false"
      custom-class="pro-choice">
      <el-card v-for="(item, index) in float.products" :key="index" class="product-list" shadow="never" @dblclick.native="commitChoice(item)">
        <div slot="header">
          <el-popover placement="right-start" width="150" trigger="hover" title="拥有角色：" popper-class="role-list">
            <p v-for="(role, index) in getRoles(item.productId).roleNames" :key="index"><i class="el-icon-user" />{{role}}</p>
            <span slot="reference">{{item.productName}}</span>
          </el-popover>
          <el-link type="primary" style="float:right;font-size:16px" @click="commitChoice(item)" :underline="false" icon="el-icon-right">进入</el-link>
        </div>
      </el-card>
      <el-card class="product-list" shadow="never" :class="[float.products.length%4 > 0 ? 'special-list-login': 'normal-list-login']">
        <div slot="header">
          <el-link type="primary" @click="showNew=true" style="float:left;font-size:20px;font-weight:600" :underline="false" icon="el-icon-plus">新建产品 / 项目</el-link>
        </div>
      </el-card>
      <div slot="footer">
        <el-button
          v-no-more-click
          type="primary"
          icon="el-icon-circle-close"
          @click="cancelLogin()"
          size="small"
          style="margin-right:3.1%">取消</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="zoomed" width="500px" title="您的网页缩放比例可能会影响页面展示布局" top="250px">
      <p style="margin:0 0 5px 20px">
        <i class="el-icon-success" /> 可使用 CTRL+0 还原缩放比例</p>
      <p style="margin:0 0 5px 20px">
        <i class="el-icon-success" /> 可使用 CTRL+鼠标滚轮 来调整网页缩放比例</p>
      <p style="margin:0 0 5px 20px">
        <i class="el-icon-success" /> 尝试恢复操作系统显示DPI默认设置</p>
      <div slot="footer">
        <el-button v-no-more-click type="primary" size="small" @click="zoomed = false">确认</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="modalClose"
      :visible.sync="showReg"
      width="800px"
      title="用户注册"
      custom-class="reg-dialog"
      :fullscreen="maximize">
      <div slot="title">
        <span style="font-size:18px">用户注册</span>
        <button class="el-dialog__headerbtn" style="right:40px" @click="maximize=!maximize">
          <el-tooltip content="最大化" effect="dark" placement="left">
            <i v-show="maximize==false" class="el-icon-full-screen" style="font-size:14px"></i>
          </el-tooltip>
          <el-tooltip content="还原" effect="dark" placement="left">
            <i v-show="maximize==true" class="el-icon-bottom-left" style="font-size:14px"></i>
          </el-tooltip>
        </button>
      </div>
      <el-form
        ref="regForm"
        :model="regform"
        :inline="false"
        :rules="regRules"
        size="meddium"
        label-width="100px"
        style="padding:20px 40px">
        <el-form-item label="登录账号" prop="userAccount">
          <el-input v-model="regform.userAccount" placeholder="5到15个英文字母，不区分大小写" clearable suffix-icon="iconfont icon-mine"></el-input>
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input type="password" v-model="regform.password" placeholder="账号密码（双重SHA-256加密存储）" clearable suffix-icon="iconfont icon-lock"></el-input>
        </el-form-item>
        <el-form-item label="用户姓名" prop="userName">
          <el-input v-model="regform.userName" placeholder="您的真实姓名" clearable suffix-icon="iconfont icon-people"></el-input>
        </el-form-item>
        <el-form-item label="邮箱地址" prop="userEmail">
          <el-input v-model="regform.userEmail" placeholder="您的邮箱地址，仅用于用于接收系统通知" class="email" clearable suffix-icon="iconfont icon-mail"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" @click="showReg=false" size="small">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-refresh" @click="resetForm('regForm')" size="small">重置</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" @click="checkSaveUserReg('regForm')" size="small">注册提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const emailPatern = /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/;
import commonQuery from "@/components/util/CommonQuery.vue";
import createProduct from "@/components/mgr/product/ProductCreate.vue";
import GithubButton from 'vue-github-button'
export default {
  data: function () {
    let accountValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('用户账户不能为空！'));
      }
      if (value.length < 5 || value.length > 10) {
        return callback(new Error('请输入5到10个字符！'));
      }
      this.checkAccount(value.toUpperCase()).then(res => {
        if (res.data > 0) {
          return callback(new Error('用户账户已存在！'));
        } else {
          return callback();
        }
      });
    };
    let emailValidator = (rule, value, callback) => {
      this.checkEmail(value.toUpperCase()).then(res => {
        if (res.data > 0) {
          return callback(new Error('邮箱已被占用！'));
        } else {
          return callback();
        }
      });
    };
    let nameValidator = (rule, value, callback) => {
      this.checkName(value.toUpperCase()).then(res => {
        if (res.data > 0) {
          return callback(new Error('用户姓名已存在，请加上数字后缀！'));
        } else {
          return callback();
        }
      });
    };
    return {
      maximize: false,
      outerNetwork: window.location.href.indexOf("seqcer.") > -1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      normalDisabled: false,
      showApplyPriv: false,
      showErrors: false,
      errors: [],
      applyForm: {
        products: [],
        roles: []
      },
      products: [],
      roles: [],
      ruleFormL: {
        account: "",
        password: "",
        rememberPassword: true
      },
      ruleFormN: {
        account: "",
        password: "",
        rememberPassword: true
      },
      rules: {
        account: [{
          required: true,
          message: "请输入用户名",
          trigger: "blur"
        }],
        password: [{
          required: true,
          message: "请输入密码",
          trigger: "blur"
        }]
      },
      menus: [],
      showNew: false,
      activeName: "ldap",
      ldapDisabled: false,
      userName: "",
      userId: "",
      userAccount: "",
      userFavicon: "",
      domain: {
        selected: "",
        opts: []
      },
      zoomed: false,
      showChoice: false,
      float: {
        products: []
      },
      title: "普兰能效平台欢迎您",
      regform: {
        userAccount: "",
        password: "",
        userEmail: "",
        userName: ""
      },
      regRules: {
        userAccount: [{
          required: true,
          message: "请输入用户账号",
          trigger: "blur"
        },
        {
          min: 5,
          max: 15,
          message: "长度在 5 到 15 个字",
          trigger: "blur"
        },
        {
        validator: accountValidator,
        trigger: "blur" 
        }],
        userEmail: [{
          type: "email",
          required: true,
          message: "请输入格式正确的邮箱地址",
          trigger: "blur"
        },
        {
          validator: emailValidator,
          trigger: "blur" 
        }],
        userName: [{
          required: true,
          message: "请输入用户姓名",
          trigger: "blur"
        },
        {
          validator: nameValidator,
          trigger: "blur" 
        }],
        password: [{
          required: true,
          message: "请输入密码",
          trigger: "blur"
        }]
      },
      showReg: false,
      userNew: false
    };
  },

  components: {
    vProd: createProduct,
    GithubButton
  },

  created() {
    sessionStorage.clear();
    localStorage.removeItem("userProducts");
    this.$axios.get("/menus/configs", {}).then(resp => {
      this.menus = resp.data;
    });
    this.listDomains();
    this.activeName = this.outerNetwork ? "normal" : "ldap";
    this.normalDisabled = !this.outerNetwork && navigator.platform.indexOf("Mac") == -1;
    this.ruleFormL.account = localStorage.userAccount ?
      localStorage.userAccount :
      this.ruleFormL.account;
    this.ruleFormL.password = localStorage.userPassword ?
      localStorage.userPassword :
      this.ruleFormL.password;
    this.ruleFormL.rememberPassword =
      localStorage.rememberPassword != null &&
      localStorage.rememberPassword === "true" ?
      true :
      false;
    this.ruleFormN.account = localStorage.userAccount ?
      localStorage.userAccount :
      this.ruleFormN.account;
    this.ruleFormN.password = localStorage.userPassword ?
      localStorage.userPassword :
      this.ruleFormN.password;
    this.ruleFormN.rememberPassword =
      localStorage.rememberPassword != null &&
      localStorage.rememberPassword === "true" ?
      true :
      false;
  },

  mounted() {
    this.zoomed = this.detectZoom() != 100;
  },

  methods: {
    resetForm(formName) {
      if (this.$refs[formName]) {
        this.$refs[formName].resetFields();
      }
    },

    saveCreate() {
      this.$refs.newProduct.checkProductCreate();
    },

    getRoles(productId) {
      return this.float.products.find(item => {
        return item.productId == productId;
      });
    },

    beginReg() {
      let _self = this;
      _self.showReg = true;
      _self.$nextTick(_ => {
        setTimeout(() => {
          _self.resetForm("regForm");
        }, 500);
      });
    },

    checkAccount(value){
      return this.$axios.get("/user/exists/account/" + value);
    },

    checkEmail(value){
      return this.$axios.get("/user/exists/email/" + value);
    },

    checkName(value){
      return this.$axios.get("/user/exists/name/" + value);
    },

    queryBaseInfo() {
      let _self = this;
      _self.showApplyPriv = true;
      _self.products.splice(0, _self.products.length);
      _self.roles.splice(0, _self.roles.length);

      _self
        .$axios({
          method: "post",
          url: "/base/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          }
        })
        .then(function (res) {
          let result = res.data;
          eval(res.data.product).forEach(e => {
            _self.products.push({
              value: e.productId,
              code: e.productCode,
              label: e.productCode + " - " + e.productName
            });
          });
          eval(res.data.userRoles).forEach(e => {
            _self.roles.push({
              value: e.roleId,
              code: e.roleCode,
              label: e.roleCode + " - " + e.roleName
            });
          });
        })
        .catch(function (response) {
          _self.$notify.error("后端服务未就绪，请稍等！");
          console.log(response);
        });
    },

    commitApply() {
      let _self = this;
      let applyProducts = [];
      let applyRoles = [];
      _self.errors.splice(0, _self.errors.length);

      _self.products
        .filter(item => {
          return _self.applyForm.products.indexOf(item.value) != -1;
        })
        .forEach(d => {
          applyProducts.push({
            id: d.value,
            product: d.label
          });
        });
      _self.roles
        .filter(item => {
          return _self.applyForm.roles.indexOf(item.value) != -1;
        })
        .forEach(d => {
          applyRoles.push({
            id: d.value,
            role: d.label
          });
        });

      _self
        .$axios({
          method: "post",
          url: "/user/priv_apply",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            products: JSON.stringify(applyProducts),
            roles: JSON.stringify(applyRoles),
            userId: sessionStorage.userId
          }
        })
        .then(function (res) {
          let results = eval(res.data);
          if (results.length == 0) {
            _self.$message.success("权限申请已提交，请等待处理！");
            _self.showApplyPriv = false;
          } else {
            _self.$message.warning("权限申请提交失败或部分失败！");
            _self.errors = results;
            _self.showErrors = true;
          }
        });
    },

    applyPriv(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$message.warning("表单校验不通过，请确认！");
          return;
        } else {
          _self.applyForm.products = [];
          _self.applyForm.roles = [];
          if (_self.activeName === "ldap") {
            _self.LdapAuth(_self.queryBaseInfo);
          } else {
            _self.normalAuth(_self.queryBaseInfo);
          }
        }
      });
    },

    SHA256(password) {
      let sha256 = require("js-sha256").sha256;
      return sha256(password);
    },

    submitForm(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$message.warning("表单校验不通过，请确认！");
          return;
        } else {
          if (_self.activeName === "ldap") {
            _self.LdapAuth(_self.queryUserRole);
          } else {
            _self.normalAuth(_self.queryUserRole);
          }
        }
      });
    },

    checkSaveUserReg(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$message.warning("表单校验不通过，请确认！");
          return;
        } else {
          if (!emailPatern.test(_self.regform.userEmail)) {
            _self.$message.warning("用户邮箱地址格式不正确！ ");
            return;
          }
          _self.saveUserReg();
        }
      });
    },

    saveUserReg() {
      let _self = this;
      _self
        .$axios({
          method: "post",
          url: "/user/register",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            userAccount: _self.regform.userAccount.toUpperCase(),
            password: _self.SHA256(_self.regform.password),
            userName: _self.regform.userName,
            userEmail: _self.regform.userEmail.toUpperCase()
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("注册成功，请登录！");
            _self.showReg = false;
            _self.userNew = true;
          } else {
            _self.$message.warning("注册失败，请联系运维！");
          }
        });
    },

    toICPGov() {
      window.open("http://www.miit.gov.cn/", "_blank");
    },

    normalAuth(callback) {
      let _self = this;
      _self
        .$axios({
          method: "post",
          url: "/user/normal_auth",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            account: _self.ruleFormN.account.toUpperCase(),
            password: _self.SHA256(_self.ruleFormN.password)
          }
        })
        .then(function (res) {
          let result = res.data.result;
          let user = res.data.user;
          if (result === 0) {
            _self.$message.info("用户名密码校验不通过！");
          } else if (result === -1) {
            _self.$message.info("认证服务出现异常！");
          } else if (result === 1) {
            _self.$message.success("登录认证通过，请继续操作！");
            sessionStorage.setItem("authType", "normal");
            localStorage.setItem("userAccount", user.userAccount);
            localStorage.setItem(
              "rememberPassword",
              _self.ruleFormN.rememberPassword
            );
            if (_self.ruleFormN.rememberPassword) {
              localStorage.setItem("userPassword", _self.ruleFormN.password);
            } else {
              localStorage.removeItem("userPassword");
            }
            _self.userName = user.userName;
            _self.userId = user.userId;
            _self.userAccount = user.userAccount;
            if (user.faviconId) {
              _self.queryFaviconFile(user.faviconId);
            }
            _self.userSettingQuery();
            _self.$nextTick(function () {
              if (typeof callback == "function") {
                setTimeout(() => {
                  callback();
                }, 500);
              }
            });
          }
        });
    },

    listDomains() {
      let _self = this;
      _self
        .$axios({
          method: "post",
          url: "/user/list_domain",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          }
        })
        .then(function (res) {
          _self.domain.opts.splice(0, _self.domain.opts.length);
          let jsonArray = eval(res.data);
          if (null == res.data || jsonArray.length == 0) {
            _self.$message.warning("管理员未配置LDAP认证服务");
            setTimeout(() => {
              _self.activeName = "normal";
              _self.ldapDisabled = true;
            }, 200);
            return;
          }
          jsonArray.forEach(item => {
            _self.domain.opts.push({
              label: item,
              value: item
            });
          });
          _self.domain.selected = jsonArray[0];
        })
        .catch(function (response) {
          _self.$message.warning("后端服务未就绪，请稍等！");
          console.log(response);
        });
    },

    LdapAuth(callback) {
      let _self = this;
      if (
        _self.ruleFormL.account.indexOf("@") > -1 ||
        _self.ruleFormL.account.toUpperCase().indexOf(".COM") > -1
      ) {
        _self.$message.info("不要以域名或邮箱地址形式输入！");
        return;
      }
      _self
        .$axios({
          method: "post",
          url: "/user/ldap_auth",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            domain: _self.domain.selected,
            account: _self.ruleFormL.account.toUpperCase(),
            password: _self.ruleFormL.password //暂不加密，或者考虑使用AES
          }
        })
        .then(function (res) {
          let result = res.data.result;
          let user = res.data.user;
          if (result === 0) {
            _self.$message.info("用户名密码校验不通过！");
            return;
          } else if (result === -1) {
            _self.$message.info("认证服务出现异常！");
            return;
          } else if (result === 1) {
            _self.$message.success("登录认证通过，请继续操作！");
            sessionStorage.setItem("authType", "ldap");
            localStorage.setItem("userAccount", user.userAccount);
            localStorage.setItem(
              "rememberPassword",
              _self.ruleFormL.rememberPassword
            );
            if (_self.ruleFormL.rememberPassword) {
              localStorage.setItem("userPassword", _self.ruleFormL.password);
            } else {
              localStorage.removeItem("userPassword");
            }
            _self.userName = user.userName;
            _self.userId = user.userId;
            _self.userAccount = user.userAccount;
            if (user.faviconId) {
              _self.queryFaviconFile(user.faviconId);
            }
            _self.userSettingQuery();
            _self.$nextTick(function () {
              if (typeof callback == "function") {
                setTimeout(() => {
                  callback();
                }, 500);
              }
            });
          }
        });
    },

    queryFaviconFile(fileId) {
      let _self = this;
      _self.$axios.post("/file/query/" + fileId).then(function (res) {
        if (!res.data || res.data.length == 0) {
          _self.userFavicon = "/static/img/baby.png";
          return;
        }
        var file = res.data[0];
        if (!file.url) {
          _self.userFavicon = "/static/img/baby.png";
          return;
        }
        _self.userFavicon = file.url;
      });
    },

    commitChoice(item) {
      let _self = this;
      localStorage.setItem("lastProduct", item.productId);
      localStorage.setItem(
        "userProducts",
        JSON.stringify(_self.float.products)
      );

      sessionStorage.setItem("userAccount", _self.userAccount);
      sessionStorage.setItem("userId", _self.userId);
      sessionStorage.setItem("userName", _self.userName);
      sessionStorage.setItem("userFavicon", _self.userFavicon);

      sessionStorage.setItem("productName", item.productName);
      sessionStorage.setItem("productCode", item.productCode);
      sessionStorage.setItem("productId", item.productId);
      sessionStorage.setItem("roles", item.roles.toString());
      sessionStorage.setItem("roleNames", item.roleNames);

      if (_self.userNew) {
        _self.$router.push({
          path: "/user",
          replace: true
        });
      } else {
        if (
          localStorage.lastUrl &&
          null != localStorage.lastUrl &&
          localStorage.lastUrl != "" &&
          _self.checkAuth(localStorage.lastUrl, item.roles)
        ) {
          _self.$router.push({
            path: localStorage.lastUrl,
            replace: true
          });
        } else {
          _self.$router.push({
            path: "/index",
            replace: true
          });
        }
      }
    },

    checkAuth(path, roles) {
      for (let i = 0; i < this.menus.length; i++) {
        for (let j = 0; j < this.menus[i].subs.length; j++) {
          let menu = this.menus[i].subs[j];
          if (path == menu.index) {
            let authed = false;
            for (let k = 0; k < roles.length; k++) {
              authed = menu.roleIds.indexOf(parseInt(roles[k])) > -1;
            }
            return authed || menu.shows.indexOf(-1) > -1;
          }
        }
      }
    },

    cancelLogin() {
      this.showChoice = false;
      sessionStorage.clear();
    },

    queryUserRole() {
      let _self = this;
      _self
        .$axios({
          method: "post",
          url: "/role/p_r_query_user",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            userId: _self.userId
          }
        })
        .then(function (res) {
          let privileges = eval(res.data);
          if (privileges.length == 0) {
            _self
              .$confirm("是否现在申请？", "您没有任何产品的可用角色", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "info"
              })
              .then(() => {
                _self.queryBaseInfo();
                _self.showApplyPriv = true;
                return;
              })
              .catch(() => {
                _self
                  .$confirm("是否现在创建？", "创建一个新的产品/项目", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "info"
                  })
                  .then(() => {
                    _self.showCreateNew = true;
                    return;
                  });
              });
          }
          let sortedPrivs = _self.sortData(
            privileges,
            "productId",
            "productName",
            "productCode",
            "children"
          );
          _self.float.products.splice(0, _self.float.products.length);
          sortedPrivs.forEach(item => {
            let roles = [];
            let roleNames = [];
            if (!item.children || item.children.length == 0) {
              return;
            }
            item.children.forEach(role => {
              roles.push(role.roleId);
              roleNames.push(role.roleName);
            });
            _self.float.products.push({
              productId: item.productId,
              roles: roles,
              roleNames: roleNames,
              productName: item.productName,
              productCode: item.productCode
            });
          });
          if (commonQuery.isNull(localStorage.lastProduct)) {
            _self.showChoice = true;
            return;
          }
          let lastProduct = _self.float.products.find(d => {
            return d.productId == parseInt(localStorage.lastProduct);
          });
          if (!lastProduct) {
            _self.showChoice = true;
            return;
          }
          if (sessionStorage.autoLogin && sessionStorage.autoLogin == 1) {
            _self.commitChoice(lastProduct);
          } else {
            _self.showChoice = true;
          }
        });
    },

    userSettingQuery() {
      let _self = this;
      _self.$axios
        .post("/user/setting/query/" + _self.userId)
        .then(function (res) {
          let settings = res.data;
          for (let p in settings) {
            sessionStorage.setItem(p, settings[p]);
          }
        });
    },

    sortData(json, idKey, labelKey, codeKey, childKey) {
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
          [codeKey]: children[0][codeKey],
          [childKey]: children
        });
      }
      return result;
    },

    detectZoom() {
      let ratio = 0,
        screen = window.screen,
        ua = navigator.userAgent.toLowerCase();
      if (~ua.indexOf("firefox")) {
        if (window.devicePixelRatio !== undefined) {
          ratio = window.devicePixelRatio;
        }
      } else if (~ua.indexOf("msie")) {
        if (screen.deviceXDPI && screen.logicalXDPI) {
          ratio = screen.deviceXDPI / screen.logicalXDPI;
        }
      } else if (
        window.outerWidth !== undefined &&
        window.innerWidth !== undefined
      ) {
        ratio = window.outerWidth / window.innerWidth;
      }

      if (ratio) {
        ratio = Math.round(ratio * 100);
      }

      if (ratio === 99 || ratio === 101) {
        ratio = 100;
      }

      return ratio;
    }
  }
};
</script>

<style>
.ms-login .el-input i,
.reg-dialog .el-input i {
  margin: 0 10px;
  font-size: 20px !important;
}

.reg-dialog .el-switch .el-switch__label:not(.is-active) {
  color: #9e9e9e;
}

.input-userd .el-input__inner {
  border: 1px solid #dcdfe6;
}

.ms-title {
  position: absolute;
  top: 50%;
  width: 100%;
  margin-top: -230px;
  text-align: center;
  font-size: 30px;
  font-weight: 600;
  color: #fff;
}

.login-tabs {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 500px;
  height: 360px;
  margin: -160px 0 0 -250px;
}

.login-tabs .el-tabs {
  border-radius: 2px;
}

.oper-tips {
  position: absolute;
  left: 40%;
  top: 380px;
  width: 120%;
  margin-left: -250px;
}

.oper-tips p {
  color: #fff;
  text-align: center;
  font-size: 15px;
}

.ms-login {
  width: 410px;
  height: 240px;
  padding: 30px;
}

.ms-login .el-select {
  width: 120px;
}

.ms-login .el-input {
  width: 100% !important;
}

.login-btn {
  text-align: center;
}

.login-btn button {
  width: 100%;
  height: 36px;
  margin-top: 5px;
}

.remember {
  padding: 5px 0 15px 0px;
  float: right;
  margin-left: 30px;
  margin-right: 0;
}

.float-body {
  max-height: 320px;
  overflow-y: auto;
  padding: 30px 50px;
}

.footer {
  height: 40px !important;
  position: fixed;
  width: 100%;
  bottom: 0;
  line-height: 40px;
  border-top: 1px solid #e4edf3;
  color: #fff;
  font-size: 14px;
  text-align: center;
}

.footer>*{
  vertical-align: middle;
  height: 40px !important;
  line-height: 0;
}

.icp {
  color: #61c3df;
  cursor: pointer;
}

.icp:hover {
  color: yellow;
}

.pro-choice .el-dialog__body {
  overflow-y: auto;
  padding: 2% 3% 2% 4%;
}

.product-list {
  display: inline-grid;
  width: 23.8%;
  border-radius: 5px;
  margin: 0 1% 1% 0;
  border: none;
}

.special-list-login {
  position: absolute;
  width: 22.3% !important;
}

.normal-list-login {
  width: 23.8%;
}

.product-list .el-card__header {
  font-size: 20px;
  padding: 80px 20px;
  border: none;
  font-weight: 600;
  background-color: #4d5a6b;
}

.product-list .el-card__header span>span {
  color: #fff;
}

.product-list .el-card__body {
  padding: 0;
}

.role-list {
  background-color: #4d5a6b;
  color: #fff;
}

.role-list .el-popover__title {
  color: #fff;
  font-weight: 600;
}

.role-list p {
  font-size: 14px;
  margin: 8px 0 0 15px;
}

.role-list p i {
  margin-right: 5px;
}
</style>
