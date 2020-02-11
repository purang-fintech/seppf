<template>
  <div class="user-main">
    <el-drawer title="消息订阅设置" :visible.sync="showMessageSubscribe" direction="rtl" size="500px" custom-class="subscribe-drawer">
      <el-checkbox-group v-model="userSetting.messageSubscribe">
        <el-checkbox v-for="opt in objectTypes" :label="opt.value" :key="opt.value" border>{{opt.label}}</el-checkbox>
      </el-checkbox-group>
      <div class="drawer-footer">
        <el-button @click="showMessageSubscribe=false" size="small" icon="el-icon-close">取 消</el-button>
        <el-button type="primary" size="small" icon="el-icon-check" @click="saveMessageSubscribe()">保存</el-button>
      </div>
    </el-drawer>

    <el-drawer title="邮件订阅设置" :visible.sync="showEmailSubscribe" direction="rtl" size="500px" custom-class="subscribe-drawer">
      <el-checkbox-group v-model="userSetting.emailSubscribe">
        <el-checkbox v-for="opt in objectTypes" :label="opt.value" :key="opt.value" border>{{opt.label}}</el-checkbox>
      </el-checkbox-group>
      <div class="drawer-footer">
        <el-button @click="showEmailSubscribe=false" size="small" icon="el-icon-close">取 消</el-button>
        <el-button type="primary" size="small" icon="el-icon-check" @click="saveEmailSubscribe()">保存</el-button>
      </div>
    </el-drawer>

    <el-card shadow="hover">
      <div slot="header">
        <span>用户基本信息</span>
        <el-button
          v-no-more-click
          class="save-btn"
          size="small"
          type="text"
          @click="checkSaveUserBase('ruledForm')"
          :disabled="!infoUpdated">保存信息</el-button>
      </div>

      <el-form
        ref="ruledForm"
        :model="userInfo"
        :inline="true"
        :rules="userRules"
        size="mini"
        label-width="100px">
        <el-form-item label="用户账号" prop="userAccount">
          <el-input v-model="userInfo.userAccount" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户姓名" prop="userName">
          <el-input v-model="userInfo.userName" clearable></el-input>
        </el-form-item>
        <el-form-item label="用户邮箱" prop="userEmail">
          <el-input v-model="userInfo.userEmail" clearable></el-input>
        </el-form-item>
        <el-form-item label="是否外包" prop="isVendor">
          <el-select v-model="userInfo.isVendor" placeholder="请选择">
            <el-option v-for="opt in vendorOpts" :value="opt" :key="opt" :label="opt"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="原有密码">
          <el-input type="password" v-model="userInfo.oldPwd" :placeholder="normalAuthed && !isGuest ? '原有密码': abnromalTips" clearable :disabled="!normalAuthed || isGuest"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPwd">
          <el-input type="password" v-model="userInfo.newPwd" :placeholder="normalAuthed && !isGuest ? '请输入新密码': abnromalTips" clearable :disabled="!normalAuthed || isGuest"></el-input>
        </el-form-item>
        <el-form-item label="重复新密码" prop="secNewPwd">
          <el-input type="password" v-model="userInfo.secNewPwd" :placeholder="normalAuthed && !isGuest ? '请再次输入新密码': abnromalTips" clearable :disabled="!normalAuthed || isGuest"></el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover">
      <div slot="header">
        <span>用户头像设置</span>
        <el-button v-no-more-click class="save-btn" size="small" type="text" @click="uploadFavicon()">保存头像</el-button>
      </div>

      <div class="preview">
        <vue-cropper
          ref="cropper"
          :guides="true"
          :view-mode="2"
          drag-mode="crop"
          :auto-crop-area="0.5"
          :min-container-width="150"
          :min-container-height="150"
          :background="true"
          :rotatable="true"
          :src="iconSrc"
          :img-style="{ 'max-width': '300px', 'max-height': '200px' }">
        </vue-cropper>

        <el-upload
          class="favicon-upload"
          ref="upload"
          :accept="favicon.permitType"
          :limit=2
          :show-file-list="false"
          :auto-upload="false"
          :on-change="setImage"
          :before-upload="beforeUpload"
          :action="favicon.uploadAction"
          :file-list="favicon.fileList">
          <el-button
            v-no-more-click
            slot="trigger"
            size="mini"
            class="cut-btn"
            type="success"
            icon="el-icon-upload">选取文件</el-button>
        </el-upload>
        <el-button
          v-no-more-click
          class="cut-btn"
          size="mini"
          @click="cropImage()"
          v-if="iconSrc != ''"
          icon="iconfont icon-tailor"
          type="primary"> 裁剪</el-button>
        <el-button
          v-no-more-click
          class="rotate-btn"
          size="mini"
          @click="rotate()"
          v-if="iconSrc != ''"
          icon="el-icon-refresh"
          type="primary"> 旋转</el-button>
      </div>
      <div class="preview">
        <img :src="cutImg" class="user-icon" />
      </div>
    </el-card>

    <el-card shadow="hover">
      <div slot="header">
        <span>用户消息设置</span>
      </div>
      <el-checkbox v-model="userSetting.messageOn" @change="saveMessageOnOff()" size="small" border>打开通知</el-checkbox>
      <el-button
        v-if="userSetting.messageOn"
        size="small"
        type="text"
        icon="el-icon-s-comment"
        style="margin-left:20px;font-size:14px;padding:0"
        @click="setMessageSubscribe()">消息订阅设置
      </el-button>
      <el-button
        v-if="userSetting.messageOn"
        size="small"
        type="text"
        icon="iconfont icon-mail_fill"
        style="font-size:14px;padding:0"
        @click="setEmailSubscribe()">邮件订阅设置
      </el-button>
    </el-card>

    <el-card shadow="hover" style="margin-bottom:5px">
      <div slot="header">
        <span>用户其他设置</span>
        <el-button v-no-more-click class="save-btn" size="small" type="text" @click="saveExtraSetting()">保存设置</el-button>
      </div>
      <el-checkbox v-model="userSetting.autoRefresh" size="small" border>侧边栏折叠/展开刷新图表布局</el-checkbox>
      <el-checkbox v-model="userSetting.autoLogin" size="small" border style="margin-left:10px">自动登录上次产品/项目</el-checkbox>
      <el-checkbox v-model="userSetting.dialogAutoClose" size="small" border style="margin-left:10px">点击页面空白处自动关闭对话框</el-checkbox>
      <el-checkbox v-model="userSetting.tableShowBorder" size="small" border style="margin-left:10px">展示表格边框</el-checkbox>
      <span style="margin:0 0 0 10px">每页展示记录数：</span>
      <el-select v-model="userSetting.tablePageSize" size="small" @change="setPageSize()" style="width:120px">
        <el-option v-for="opt in tableRecords" :value="opt" :key="opt" :label="opt+' 条'"></el-option>
      </el-select>
    </el-card>
  </div>
</template>

<script>
const staticImg = "/static/img/baby.png";
const emailPatern = /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/;
import VueCropper from 'vue-cropperjs';
export default {
  components: {
    VueCropper,
  },

  data: function () {
    let emailValidator = (rule, value, callback) => {
      this.checkEmail(value.toUpperCase()).then(res => {
        if (res.data > 0) {
          return callback(new Error('该邮箱地址已被占用！'));
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
      userInfo: {
        userId: "",
        faviconId: "",
        userAccount: "",
        userName: "",
        userEmail: "",
        isVendor: "",
        isValid: "",
        oldPwd: "",
        newPwd: "",
        secNewPwd: ""
      },
      objectTypes: [],
      showEmailSubscribe: false,
      showMessageSubscribe: false,
      userSetting: {
        tablePageSize: sessionStorage.tablePageSize || 20,
        tableShowBorder: sessionStorage.tableShowBorder == 1,
        autoRefresh: sessionStorage.autoRefresh == 1,
        autoLogin: sessionStorage.autoLogin == 1,
        dialogAutoClose: sessionStorage.dialogAutoClose == 1,
        messageOn: sessionStorage.messageOn == 1,
        messageSubscribe: [],
        emailSubscribe: []
      },
      tableRecords: [10, 20, 50, 100, 200],
      normalAuthed: (sessionStorage.authType && sessionStorage.authType == 'normal'),
      abnromalTips: '游客及LDAP认证不可修改密码',
      isGuest: false,
      userRules: {
        userEmail: [{
          type: 'email',
          required: true,
          message: "请输入邮箱地址",
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
          min: 2,
          max: 20,
          message: "长度在 2 到 20 个字",
          trigger: "blur"
        },
        {
          validator: nameValidator,
          trigger: "blur" 
        }],
        newPwd: {
          min: 5,
          max: 20,
          message: "长度在 5 到 20 个字",
          trigger: "blur"
        },
        secNewPwd: {
          min: 5,
          max: 20,
          message: "长度在 5 到 20 个字",
          trigger: "blur"
        }
      },
      vendorOpts: ["Y", "N"],
      favicon: {
        uploadAction: "",
        permitType: "image/jpg,image/jpeg,image/png",
        fileList: []
      },
      iconSrc: staticImg,
      cutImg: staticImg,
      faviconUpdated: false,
      infoUpdated: false,
      setUpdated: false
    };
  },

  watch: {
    cutImg(current, old) {
      if (old != staticImg && current != old) {
        this.faviconUpdated = true;
      }
    },

    userInfo: {
      handler: function (obj) {
        this.infoUpdated = true;
      },
      deep: true
    }
  },

  created() {
    let _self = this;
    _self.favicon.uploadAction = "file";
    _self.userQuery();
    if (sessionStorage.userFavicon) {
      _self.cutImg = sessionStorage.userFavicon;
    }
    if (sessionStorage.userAccount.toUpperCase().indexOf('GUEST') != -1) {
      _self.isGuest = true;
    }
    if (sessionStorage.messageSubscribe) {
      sessionStorage.messageSubscribe.split(",").forEach(d => {
        _self.userSetting.messageSubscribe.push(parseInt(d));
      });
    }
    if (sessionStorage.emailSubscribe) {
      sessionStorage.emailSubscribe.split(",").forEach(d => {
        _self.userSetting.emailSubscribe.push(parseInt(d));
      });
    }

    _self.objectTypes.splice(0, _self.objectTypes.length);
    eval(localStorage.getItem("objectType")).forEach(item => {
      _self.objectTypes.push({
        value: item.typeId,
        label: item.typeName
      });
    });
  },

  methods: {
    checkEmail(value){
      return this.$axios.get("/user/exists/email/" + this.userInfo.userId + "/" + value);
    },

    checkName(value){
      return this.$axios.get("/user/exists/name/" + this.userInfo.userId + "/" + value);
    },

    checkSaveUserBase(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          if (!emailPatern.test(_self.userInfo.userEmail)) {
            _self.$message.warning("用户邮箱地址格式不正确！ "); 
            return;
          }
          if (_self.userInfo.newPwd || _self.userInfo.secNewPwd) {
            if (!_self.userInfo.oldPwd) {
              _self.$message.warning("修改密码时必须输入旧密码！");
              return;
            }
            if (_self.userInfo.newPwd != _self.userInfo.secNewPwd) {
              _self.$message.warning("两次输入的密码不一致！");
              return;
            }
          }
          _self.saveUserBase();
        }
      });
    },

    SHA256(password) {
      let sha256 = require("js-sha256").sha256;
      return password ? sha256(password) : "";
    },

    saveUserBase() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/user/update",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            referUser: _self.userInfo.userId,
            faviconId: _self.userInfo.faviconId,
            userName: _self.userInfo.userName,
            oldPwd: _self.SHA256(_self.userInfo.oldPwd),
            newPwd: _self.SHA256(_self.userInfo.newPwd),
            userEmail: _self.userInfo.userEmail.toUpperCase(),
            isVendor: _self.userInfo.isVendor,
            isValid: _self.userInfo.isValid,
            messageOn: _self.userInfo.messageOn
          }
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("用户信息更新成功！");
            sessionStorage.setItem("userName", _self.userInfo.userName);
            _self.$nextTick(() => {
              setTimeout(() => {
                window.location.reload();
              }, 500);
            });
          } else {
            _self.$message.info("用户信息更新失败！");
          }
        })
    },

    beforeUpload(file) {
      this.$refs.upload.clearFiles();
    },

    setImage(file, fileList) {
      let fileUrl = "";
      const permitSize = file.size / 1024 / 1024 < 2;
      const permitType =
        file.raw.type === "image/jpeg" ||
        file.raw.type === "image/jpg" ||
        file.raw.type === "image/png";

      if (!permitSize) {
        this.$message.info("图片大小不能超过 2MB！");
        return;
      }
      if (!permitType) {
        this.$message.info("请上传 JPG、JPEG、PNG 格式！");
        return;
      }

      if (window.FileReader) {
        let reader = new FileReader();
        reader.readAsDataURL(file.raw);
        reader.onloadend = function (e) {
          fileUrl = e.target.result;
        };
        this.$nextTick(function () {
          setTimeout(() => {
            this.iconSrc = fileUrl;
            this.$refs.cropper.replace(fileUrl);
          }, 100);
        });
      } else {
        this.$message.info("您的浏览器不支持该操作！");
      }
    },

    cropImage() {
      this.cutImg = this.$refs.cropper.getCroppedCanvas().toDataURL();
    },

    rotate() {
      this.$refs.cropper.rotate(90);
    },

    userQuery() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/user/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            userId: sessionStorage.userId
          }
        })
        .then(function (res) {
          var json = res.data;
          _self.userInfo = json[0];
          _self.orgMessageOn = _self.userInfo.messageOn;
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    setMessageSubscribe() {
      this.showEmailSubscribe = false;
      this.showMessageSubscribe = true;
    },

    setEmailSubscribe() {
      this.showMessageSubscribe = false;
      this.showEmailSubscribe = true;
    },

    saveMessageOnOff() {
      let _self = this;
      let setting = {};
      const opened = _self.userSetting.messageOn;
      setting.messageOn = opened ? 1 : 0;
      _self.userSettingUpdate(setting, (opened ? "打开" : "关闭") + "用户消息通知");
    },

    saveMessageSubscribe() {
      let _self = this;
      let setting = {};
      setting.messageSubscribe = _self.userSetting.messageSubscribe.toString();
      _self.userSettingUpdate(setting, "用户消息订阅设置更新");
      _self.showMessageSubscribe = false;
    },

    saveEmailSubscribe() {
      let _self = this;
      let setting = {};
      setting.emailSubscribe = _self.userSetting.emailSubscribe.toString();
      _self.userSettingUpdate(setting, "用户邮件订阅设置更新");
      _self.showEmailSubscribe = false;
    },

    saveExtraSetting() {
      let _self = this;
      let setting = {};
      setting.dialogAutoClose = _self.userSetting.dialogAutoClose ? 1 : 0;
      setting.autoLogin = _self.userSetting.autoLogin ? 1 : 0;
      setting.autoRefresh = _self.userSetting.autoRefresh ? 1 : 0;
      setting.tableShowBorder = _self.userSetting.tableShowBorder ? 1 : 0;
      setting.tablePageSize = _self.userSetting.tablePageSize;
      _self.userSettingUpdate(setting, "用户设置信息更新");
    },

    userSettingQuery() {
      let _self = this;
      _self.$axios.post("/user/setting/query/" + _self.userInfo.userId)
        .then(function (res) {
          let settings = res.data;
          for (let p in settings) {
            sessionStorage.setItem(p, settings[p]);
          }
        })
    },

    userSettingUpdate(setting, message) {
      let _self = this;
      _self.$axios.post("/user/setting/update", {
          userId: _self.userInfo.userId,
          messageOn: setting.messageOn,
          dialogAutoClose: setting.dialogAutoClose,
          autoLogin: setting.autoLogin,
          autoRefresh: setting.autoRefresh,
          tableShowBorder: setting.tableShowBorder,
          tablePageSize: setting.tablePageSize,
          messageSubscribe: setting.messageSubscribe,
          emailSubscribe: setting.emailSubscribe
        })
        .then(function (res) {
          if (res.data > 0) {
            for (let p in setting) {
              if (setting[p]) {
                sessionStorage.setItem(p, setting[p]);
              } else {
                sessionStorage.removeItem(p);
              }
            }
            _self.$message.success(message + "成功！");
            _self.$nextTick(() => {
              setTimeout(() => {
                window.location.reload();
              }, 500);
            });
          } else {
            _self.$message.warning(message + "失败！");
          }
        })
    },

    uploadFavicon() {
      let _self = this;
      if (!_self.faviconUpdated) {
        _self.$message.info("头像未发生修改，无需保存！");
        return;
      }
      let imgData = window.atob(_self.cutImg.split(",")[1]);
      var ia = new Uint8Array(imgData.length);
      for (var i = 0; i < imgData.length; i++) {
        ia[i] = imgData.charCodeAt(i);
      }
      let blob = new Blob([ia], {
        type: "image/png"
      });

      let datas = new FormData();
      datas.append("file", blob, blob.name || "");
      _self.$axios({
          method: "post",
          url: "/file/base64img_upload",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          data: datas,
          params: {
            useage: "favicon"
          }
        })
        .then(function (res) {
          if (res.data.id > 0) {
            sessionStorage.setItem("userFavicon", res.data.url);
            _self.userInfo.faviconId = res.data.id;
            _self.faviconUpdated = false;
            _self.saveUserBase();
          } else {
            _self.$message.info("用户头像上传失败！");
          }
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    }
  }
}
</script>

<style>
.user-main {
  overflow-y: auto;
}

.user-main .el-card+.el-card {
  margin-top: 20px;
}

.user-main .el-card {
  /* border: 1px solid #3b434e; */
}

.user-main .el-card .el-card__header {
  /* background-color: #3b434e; */
  padding: 8px 20px;
}

.user-main .el-card .el-card__header>div>span {
  font-size: 15px;
  /* font-weight: 600; */
  /* color: #FFF; */
}

.user-main .el-card .el-card__body {
  padding: 15px 30px;
}

.user-main .el-form-item {
  width: 45%;
}

.user-main .el-form-item input {
  width: 300px;
}

.favicon-upload {
  display: inline-block;
}

.favicon-upload .el-upload--text {
  width: 100%;
}

.preview {
  vertical-align: top;
  width: 300px;
  height: 240px;
  display: inline-block;
}

.preview+.preview {
  margin-left: 50px;
}

.preview .cropper-container {
  max-width: 300px;
  max-height: 200px;
}

.preview .cut-btn {
  float: right;
  height: 30px;
  margin-top: 5px;
  padding: 6px 10px;
}

.preview .rotate-btn {
  float: right;
  height: 30px;
  margin-right: 10px;
  margin-top: 5px;
  padding: 6px 10px;
}

.preview .user-icon {
  border-radius: 50%;
  width: 200px;
  height: 200px;
  padding: 2px;
  border: 1px solid gray;
  vertical-align: bottom;
}

.user-main .save-btn {
  float: right;
  font-size: 14px;
  padding: 2px;
}

.subscribe-drawer .el-drawer__body {
  padding: 20px 60px;
}

.subscribe-drawer .el-checkbox.is-bordered+.el-checkbox.is-bordered {
  margin: 5px;
}

.subscribe-drawer .el-checkbox {
  margin: 5px;
}

.subscribe-drawer .drawer-footer {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 20px;
}
</style>
