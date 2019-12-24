<template>
  <div class="wrapper">
    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showWarning" width="950px" :show-close="false" custom-class="popver-dialog">
      <el-table
        :data="warnings"
        size="mini"
        stripe
        empty-text="暂无异常告警情况发生"
        :max-height="warnTHeight"
        :border="showBorder">
        <el-table-column type="index" label="序号" width="50" align="center" sortable>
        </el-table-column>
        <el-table-column prop="warningDate" label="告警日期" width="120" align="center" sortable>
        </el-table-column>
        <el-table-column prop="category" label="所属版本" width="160" align="center" sortable>
        </el-table-column>
        <el-table-column prop="typeName" label="告警类型" width="100" align="center">
        </el-table-column>
        <el-table-column prop="levelName" label="告警级别" width="100" align="center">
        </el-table-column>
        <el-table-column label="告警摘要" header-align="center">
          <template slot-scope="scope">
            <el-popover placement="top" width="500" trigger="click">
              <el-alert title="告警内容" type="warning" :closable="false" :description="scope.row.summary + '，详情：' + scope.row.content">
              </el-alert>
              <el-button slot="reference" type="text" size="small" style="margin-left:5px">{{ scope.row.summary }}</el-button>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <div slot="footer">
        <el-button type="primary" icon="el-icon-close" @click="closeWarning()" size="mini">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showNewProduct" width="950px">
      <v-prod ref="newProduct"></v-prod>
      <div slot="footer">
        <el-button type="primary" icon="el-icon-close" @click="showNewProduct=false" size="mini">取消</el-button>
        <el-button type="primary" icon="el-icon-check" @click="saveCreate()" size="mini">保存</el-button>
      </div>
    </el-dialog>

    <div class="header">
      <span v-if="!isCollapse" class="app-name" @click="toHome()">{{sysName}}</span>
      <span v-if="isCollapse" class="app-alias" @click="toHome()">SEPP</span>
      <i :class="{ 'el-icon-d-arrow-right': isCollapse , 'el-icon-d-arrow-left' : !isCollapse }" @click="setCollapse()" style="vertical-align:middle;margin-right:10px" />
      <el-button
        v-no-more-click
        size="mini"
        type="text"
        @click="$router.push('/prereq')"
        class="el-icon-document"
        style="color:#6bbd6b"> 提交需求</el-button>
      <el-divider direction="vertical"></el-divider>
      <el-button
        v-no-more-click
        size="mini"
        type="text"
        @click="$router.push('/defect')"
        class="iconfont icon-bug"
        style="color:#DEAF6C"> 上报缺陷</el-button>
      <el-divider direction="vertical"></el-divider>
      <el-button
        v-no-more-click
        size="mini"
        type="text"
        @click="$router.push('/problem')"
        class="iconfont icon-flashlight"
        style="color:#EE6F6F"> 上报线上问题</el-button>
      <el-divider direction="vertical"></el-divider>
      <el-button
        v-no-more-click
        size="mini"
        type="text"
        @click="$router.push('/build')"
        class="iconfont icon-flag_fill"
        style="color:#3AB4D7"> 构建发布</el-button>
      <el-divider direction="vertical"></el-divider>
      <el-button
        v-no-more-click
        size="mini"
        type="text"
        @click="toSearch()"
        class="el-icon-search"
        style="color:#9CA9C4"> 全局搜索(Q)</el-button>

      <div class="user-info">
        <el-badge :value="messages.length" class="item" :max="99" v-if="messageOn" :hidden="messages.length==0">
          <el-button icon="el-icon-message" size="mini" @click="openMessage()" :disabled="!authed">通知</el-button>
        </el-badge>
        <el-badge :value="total" class="item" :max="99" v-if="authed" :hidden="total == 0">
          <el-button icon="el-icon-warning-outline" size="mini" @click="openWarning()" :disabled="!authed">告警</el-button>
        </el-badge>
        <el-dropdown trigger="hover" @command="handleCommand">
          <span class="el-dropdown-link">
            <img class="user-logo" :src="userFavicon"> {{username}}
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="workbench">
              <i class="el-icon-tickets"></i> 我的工作</el-dropdown-item>
            <el-dropdown-item command="settings">
              <i class="el-icon-setting"></i> 用户设置</el-dropdown-item>
            <el-dropdown-item command="logout">
              <i class="iconfont icon-logout"></i> 退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="current-pr">
        <span>我的项目：</span>
        <el-dropdown trigger="click" @command="productChoose">
          <span style="color:#fafad2;margin-left:0">{{productName}}<i class="el-icon-arrow-down" style="margin-left:5px"></i></span>
          <el-dropdown-menu slot="dropdown">
            <template v-for="(item, index) in userProducts">
                    <el-dropdown-item :command="composeValue(item)" :key="index" :disabled="item.productId==productId"><i class="el-icon-right" />{{item.productName}}</el-dropdown-item>
            </template>
                  <el-dropdown-item command="new" style="color:#3ab4d7"><i class="el-icon-plus" />新建产品/项目</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div class="sidebar">
      <el-menu :default-active="routes" class="home-menu" unique-opened router :collapse="isCollapse">
        <template v-for="item in items">
          <template v-if="item.subs">
            <el-submenu :index="item.index" v-if="rootShow(item)">
              <template slot="title">
                <i :class="[{'collapsed-icon' : isCollapse}, item.icon]"></i>
                <span slot="title" style="margin-left:5px">{{ item.title }}</span>
              </template>
              <el-menu-item v-for="(subItem,i) in item.subs" :key="i" :index="subItem.index" v-if="subShow(subItem)">{{ subItem.title }}
              </el-menu-item>
            </el-submenu>
          </template>
          <template v-else>
            <el-menu-item :index="item.index">
              <i :class="[{'collapsed-icon' : isCollapse}, item.icon]"></i>
              <span slot="title" style="margin-left:5px"> {{ item.title }}</span>
            </el-menu-item>
          </template>
        </template>
      </el-menu>
    </div>

    <div :class="{'collapsed-content' : isCollapse, 'content' : !isCollapse}">
      <keep-alive>
        <router-view :messages="messages" :collapsed="isCollapse" v-if="$route.meta.keepAlive && viewRefreshed" />
      </keep-alive>
      <router-view :messages="messages" :collapsed="isCollapse" v-if="!$route.meta.keepAlive && viewRefreshed" />
    </div>
  </div>
</template>

<script>
import commonQuery from "@/components/util/CommonQuery.vue";
import createProduct from "@/components/mgr/product/ProductCreate.vue";
let baseUrl = process.env.ROOT_URL;
import {
  Notification
} from 'element-ui';
export default {
  data() {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      sysName: "普兰能效平台",
      name: "游客",
      productId: sessionStorage.productId,
      productName: sessionStorage.productName,
      favicon: "/static/img/baby.png",
      warnTHeight: 0,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      messageCurrentPage: 1,
      messagePageSize: parseInt(sessionStorage.tablePageSize) || 10,
      messageTotal: 0,
      userProducts: [],
      isCollapse: localStorage.isCollapse && localStorage.isCollapse == 'true',
      items: [],
      showMessage: false,
      messages: [],
      showWarning: false,
      warnings: [],
      showNewProduct: false,
      authed: sessionStorage.userId && sessionStorage.userId != null,
      websock: null,
      isShowAlert: false,
      isShowMesage: false,
      newAlertCount: 0,
      newMessageCount: 0,
      timeout: 4000,
      viewRefreshed: true
    };
  },

  components: {
    vProd: createProduct
  },

  watch: {
    '$route'(to, from) {
      let params = [];
      for (let p in this.$route.params) {
        params.push(p);
      }
      let querys = [];
      for (let p in this.$route.query) {
        querys.push(p);
      }
      if (params.length > 0 || querys.length > 0) {
        to.meta.keepAlive = false;
      } else {
        to.meta.keepAlive = true;
      }
    }
  },

  created() {
    this.$axios.get("/menus/configs").then(resp => {
      this.items = resp.data;
    });
    if (!this.authed) {
      return;
    }
    this.initWebSocket();
    this.userProductRoles();

    this.baseQuery();
  },

  mounted() {
    if (document.addEventListener) {
      document.addEventListener("keydown", this.hotKeyPress, true);
    }
  },

  computed: {
    routes() {
      return this.$route.path;
    },

    username() {
      let uname = sessionStorage.userName;
      return uname ? uname : this.name;
    },

    userFavicon() {
      let ufavicon = sessionStorage.userFavicon;
      return ufavicon ? ufavicon : this.favicon;
    },

    contentWidth() {
      return document.body.clientWidth - (!this.isCollapse ? 180 : 50);
    },

    messageOn() {
      return sessionStorage.messageOn == 1;
    }
  },

  beforeDestroy() {
    if (this.timeoutObj) {
      clearInterval(this.timeoutObj);
    }
    if (this.websock) {
      this.websock.close();
    }
    Notification.closeAll();
  },

  methods: {
    reset: function () {
      clearInterval(this.timeoutObj);
      this.start();
    },

    userProductRoles() {
      let _self = this;
      _self.userProducts.splice(0, _self.userProducts.length);
      let userPrivs = localStorage.getItem("userProducts");
      if (commonQuery.isNull(userPrivs) || eval(JSON.parse(userPrivs)).length == 0) {
        return;
      }
      eval(JSON.parse(userPrivs)).forEach(item => {
        _self.userProducts.push({
          productId: item.productId,
          roles: item.roles,
          roleNames: item.roleNames,
          productName: item.productName,
          productCode: item.productCode
        });
      });
    },

    saveCreate() {
      this.$refs.newProduct.checkProductCreate();
    },

    composeValue(item) {
      return {
        productId: item.productId,
        productName: item.productName,
        roles: item.roles,
        roleNames: item.roleNames,
        productCode: item.productCode
      }
    },

    productChoose(cmd) {
      if (cmd == 'new') {
        this.showNewProduct = true;
        return;
      }
      if (cmd.productId == sessionStorage.productId) {
        return;
      }
      this.productName = cmd.productName;
      sessionStorage.setItem("productName", cmd.productName);
      sessionStorage.setItem("productId", cmd.productId);
      sessionStorage.setItem("productCode", cmd.productCode);
      sessionStorage.setItem("roles", cmd.roles.toString());
      sessionStorage.setItem("roleNames", cmd.roleNames);
      localStorage.setItem("lastProduct", cmd.productId);
      window.location.reload();
    },

    start() {
      let _self = this;
      _self.timeoutObj = setInterval(function () {
        if (_self.websock.readyState == 1) {
          _self.websock.send("HeartBeat");
        } else {
          clearTimeout(_self.timeoutObj)
          _self.reconnect()
        }
      }, this.timeout)
    },

    reconnect() { //重新连接
      let _self = this;
      if (_self.lockReconnect) {
        return;
      };
      _self.lockReconnect = true;
      //没连接上会一直重连，设置延迟避免请求过多
      _self.timeoutnum && clearTimeout(_self.timeoutnum);
      _self.timeoutnum = setTimeout(function () {
        //新连接
        _self.initWebSocket();
        _self.lockReconnect = false;
      }, 5000);
    },

    messageHandleSizeChange(val) {
      this.messagePageSize = val;
      this.messageCurrentPage = 1;
    },

    messageHandleCurrentChange(val) {
      this.messageCurrentPage = val;
    },

    subShow(subMenu) {
      if (subMenu.shows.indexOf(-1) > -1) {
        return true;
      }
      if (!sessionStorage.roles) {
        return false;
      }
      let roles = sessionStorage.roles.split(",");
      for (let i = 0; i < roles.length; i++) {
        if (subMenu.shows.indexOf(parseInt(roles[i])) > -1) {
          return true;
        }
      }
    },

    handleSizeChange(val) {
      this.pageSize = val;
      //todo 异步请求一次
      let params = {
        "pageNum": this.currentPage,
        "pageSize": this.pageSize,
        "messageTypes": ["ALARM"]
      };
      this.websocketsend(JSON.stringify(params));
    },

    handleCurrentChange(val) {
      this.currentPage = val;
      //异步请求一次
      let params = {
        "pageNum": this.currentPage,
        "pageSize": this.pageSize,
        "messageTypes": ["ALARM"]
      };
      this.websocketsend(JSON.stringify(params));
    },

    initWebSocket() {
      //初始化weosocket
      const wsuri = "ws://" + baseUrl.substr(7, baseUrl.length) + "myHandler";
      this.websock = new WebSocket(wsuri);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },

    websocketonopen() {
      this.start();
      //连接建立之后执行send方法发送数据
      let messageTypes = ["ALARM"];
      if (this.messageOn) {
        messageTypes = ["ALARM", "NOTICE"];
      }
      let params = {
        alertPage: {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        },
        messagePage: {
          pageNum: this.messageCurrentPage,
          pageSize: this.messagePageSize
        },
        messageTypes: messageTypes,
        userId: sessionStorage.userId,
        productId: sessionStorage.productId
      };
      this.websocketsend(JSON.stringify(params));
    },

    websocketonerror(w) { //连接建立失败重连
      this.initWebSocket();
    },

    websocketonmessage(e) { //数据接收
      let resp = JSON.parse(e.data);
      if (resp.alerts) {
        this.warnings = eval(resp.alerts.list);
        this.total = resp.alerts.total;
      };
      this.newAlertCount = resp.newAlertCount;
      if (resp.newAlertCount && resp.newAlertCount > 0 && !this.isShowAlert) {
        this.isShowAlert = true;
        const alertNotify = this.$notify({
          dangerouslyUseHTMLString: true,
          message: '<span style="font-weight:600;cursor:pointer;color:#EE6F6F">您有新的告警（点击查看）</span>',
          duration: 0,
          type: 'warning',
          position: 'bottom-right',
          showClose: false,
          onClick: () => this.newOpenWarning(alertNotify),
        });
      }
      if (resp.messages && resp.messages.list != null) {
        this.messages = eval(resp.messages.list);
        this.messageTotal = resp.messages.total;
      }
      this.newMessageCount = resp.newMessageCount;
      if (this.newMessageCount > 0 && !this.isShowMesage) {
        this.isShowMesage = true;
        const messageNotify = this.$notify({
          dangerouslyUseHTMLString: true,
          message: '<span style="font-weight:600;cursor:pointer;color:#3AB4D7">您有新的消息（点击查看）</span>',
          duration: 0,
          type: 'success',
          position: 'bottom-right',
          showClose: true,
          onClick: () => this.newOpenMessage(messageNotify),
        });
      }
    },

    websocketsend(Data) { //数据发送
      this.websock.send(Data);
    },

    websocketclose(e) { //关闭
    },

    newOpenMessage(val) {
      this.openMessage();
      val.close();
      this.isShowMesage = false;
    },

    newOpenWarning(val) {
      this.openWarning();
      val.close();
      this.isShowAlert = false;
    },

    hotKeyPress(e) {
      if (e.ctrlKey && e.keyCode == 81) {
        e.preventDefault();
        this.$router.push("/fuzzq");
      }
    },

    setWarnTHeight() {
      if (this.warnings * 40 > 360) {
        this.warnTHeight = 380;
      } else {
        this.warnTHeight = 450;
      }
    },

    toHome() {
      this.$router.push("/index");
    },

    toSearch() {
      this.$router.push("/fuzzq");
    },

    openMessage() {
      if (this.$route.path == "/message") {
        this.viewRefreshed = false;
        setTimeout(() => {
          this.viewRefreshed = true;
        }, 200);
      } else {
        this.$router.push({
          path: '/message'
        });
      }
    },

    closeMessage() {
      this.showMessage = false;
    },

    openWarning() {
      this.showWarning = true;
    },

    closeWarning() {
      this.showWarning = false;
    },

    rootShow(rootMenu) {
      let _self = this;
      let subMenus = rootMenu.subs;
      if (!subMenus) {
        return true;
      }
      for (let i = 0; i < subMenus.length; i++) {
        if (_self.subShow(subMenus[i])) {
          return true;
        }
      }
      return false;
    },

    setCollapse() {
      this.isCollapse = !this.isCollapse;
      localStorage.setItem("isCollapse", this.isCollapse);
      if (sessionStorage.autoRefresh == 1) {
        this.$message.success("页面将自动重新自适应刷新");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    },

    handleCommand(command) {
      let _self = this;
      if (command == "logout") {
        _self.$confirm("确定要退出登录吗?", "操作确认", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            _self.loginOut();
          })
      } else if (command == "workbench") {
        _self.$router.push("/index");
      } else if (command == "settings") {
        _self.$router.push("/user");
      }
    },

    loginOut() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/user/logout",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          }
        })
        .then(function (res) {
          _self.$router.push("/login");
          _self.$message.success("退出登录成功!");
        })
        .catch(function (response) {
          this.$notify.error("发生错误");
          console.log(response);
        });
    },

    baseQuery() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/base/query_p",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          }
        })
        .then(function (res) {
          let result = res.data;
          localStorage.setItem("autotestType", JSON.stringify(result.autotestType));
          localStorage.setItem("releaseNoteStatus", JSON.stringify(result.releaseNoteStatus));
          localStorage.setItem("caseRelateType", JSON.stringify(result.caseRelateType));
          localStorage.setItem("codeMissionStatus", JSON.stringify(result.codeMissionStatus));
          localStorage.setItem("dataUnit", JSON.stringify(result.dataUnit));
          localStorage.setItem("defectFoundMeans", JSON.stringify(result.defectFoundMeans));
          localStorage.setItem("defectFoundPeriod", JSON.stringify(result.defectFoundPeriod));
          localStorage.setItem("defectInfluence", JSON.stringify(result.defectInfluence));
          localStorage.setItem("defectPeriod", JSON.stringify(result.defectPeriod));
          localStorage.setItem("defectPriority", JSON.stringify(result.defectPriority));
          localStorage.setItem("defectStatus", JSON.stringify(result.defectStatus));
          localStorage.setItem("defectType", JSON.stringify(result.defectType));
          localStorage.setItem("environmentType", JSON.stringify(result.environmentType));
          localStorage.setItem("messageGateway", JSON.stringify(result.messageGateway));
          localStorage.setItem("objectType", JSON.stringify(result.objectType));
          localStorage.setItem("problemImprove", JSON.stringify(result.problemImprove));
          localStorage.setItem("problemResolve", JSON.stringify(result.problemResolve));
          localStorage.setItem("problemStatus", JSON.stringify(result.problemStatus));
          localStorage.setItem("problemType", JSON.stringify(result.problemType));
          localStorage.setItem("releaseStatus", JSON.stringify(result.releaseStatus));
          localStorage.setItem("productBranch", JSON.stringify(result.productBranch));
          localStorage.setItem("reportType", JSON.stringify(result.reportType));
          localStorage.setItem("requirementPriority", JSON.stringify(result.requirementPriority));
          localStorage.setItem("prStatus", JSON.stringify(result.prStatus));
          localStorage.setItem("requirementStatus", JSON.stringify(result.requirementStatus));
          localStorage.setItem("requirementType", JSON.stringify(result.requirementType));
          localStorage.setItem("testMeans", JSON.stringify(result.testMeans));
          localStorage.setItem("testMissionStatus", JSON.stringify(result.testMissionStatus));
          localStorage.setItem("testPeriod", JSON.stringify(result.testPeriod));
          localStorage.setItem("testPriority", JSON.stringify(result.testPriority));
          localStorage.setItem("warningType", JSON.stringify(result.warningType));
          localStorage.setItem("warningLevel", JSON.stringify(result.warningLevel));
          localStorage.setItem("testStatus", JSON.stringify(result.testStatus));
          localStorage.setItem("testResultStatus", JSON.stringify(result.testResultStatus));
          localStorage.setItem("testType", JSON.stringify(result.testType));
          localStorage.setItem("userRoles", JSON.stringify(result.userRoles));
          localStorage.setItem("products", JSON.stringify(result.product));
          localStorage.setItem("requirementClose", JSON.stringify(result.requirementClose));
          localStorage.setItem("defectRefuseReason", JSON.stringify(result.defectRefuseReason));
        })
        .catch(function (response) {
          _self.$notify.error("基础表信息查询时出现程序错误！");
          console.log(response);
        });
    }
  }
};
</script>

<style>
.home-menu .el-submenu li {
  padding-left: 45px !important;
}

.el-dropdown-menu {
  margin-top: 0 !important;
}

.header .el-badge__content {
  border: 1px solid #e0dddd82;
}

.popver-dialog .el-dialog__header {
  padding: 0;
}

.popver-dialog .el-dialog__body {
  padding: 20px 20px 10px 20px;
}

.popver-dialog .el-dialog__footer {
  padding: 0 20px 20px 20px;
}

.message-content .el-alert__description {
  font-size: 14px;
}
</style>
<style scoped>
.header {
  box-sizing: border-box;
  font-size: 20px;
  height: 50px;
  line-height: 50px;
  color: #fff;
  position: relative;
  overflow: hidden;
  background-color: #3b434e;
}

.header .app-alias {
  cursor: pointer;
  font-size: 17px;
}

.header .app-name {
  margin: 0 10px 0 20px;
  font-size: 19px;
  font-weight: 600;
  cursor: pointer;
}

.header .app-name:hover,
.header .app-alias:hover {
  color: #61c3df;
}

.header .el-divider--vertical {
  height: 15px;
  width: 1px;
  margin: 0 5px;
}

.header span {
  text-align: center;
  vertical-align: middle;
  height: 50px;
  line-height: 50px;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-left: 10px;
}

.header .icon {
  height: 50px;
  line-height: 50px;
  width: 30px;
  margin-left: 5px;
}

.header .icon>img {
  width: 28px;
  height: 28px;
  line-height: 30px;
  vertical-align: middle;
}

.user-info {
  display: block;
  margin-right: 20px;
  float: right;
  font-size: 16px;
  color: #fff;
}

.user-info .el-dropdown-link {
  position: relative;
  display: inline-block;
  padding-left: 50px;
  color: #fff;
  cursor: pointer;
  vertical-align: middle;
}

.user-info .user-logo {
  position: absolute;
  left: 0;
  top: 7px;
  width: 33px;
  height: 33px;
  border-radius: 50%;
  border: 1px solid #31394a;
}

.header .el-button {
  font-size: 13px;
  vertical-align: middle;
  padding: 0;
}

.header>.el-button:hover {
  color: #fff !important;
  font-weight: 600;
}

.header .el-button+.el-button {
  margin-left: 0 !important;
}

.header .current-pr {
  display: block;
  margin-right: 20px;
  float: right;
  height: 50px;
  line-height: 50px;
}

.header .current-pr span {
  font-size: 14px;
  height: 50px;
  line-height: 50px;
  font-weight: 500;
}

.header .current-pr .el-dropdown>span {
  cursor: pointer;
}

.header .current-pr .el-dropdown>span:hover {
  color: #FFF;
  font-weight: 600;
}

.header .item {
  line-height: 10px;
  margin-right: 10px;
}

.header .item .el-button {
  padding: 6px 12px;
  background: transparent;
  color: #fff;
  border: 1px solid #e0dddd82;
  font-weight: 600;
}

.header .item .el-button:hover {
  background: #fff;
  color: #3b434e;
  border: 1px solid #fff;
  font-weight: 600;
}

.header .favicon {
  vertical-align: middle;
  height: 35px;
  width: 35px;
  margin-left: 10px;
}

.content {
  background: none repeat scroll 0 0 #fff;
  position: absolute;
  left: 150px;
  right: 0;
  top: 50px;
  bottom: 0;
  width: auto;
  padding: 15px;
  box-sizing: border-box;
  overflow-y: auto;
  border: 1px solid #4d5a6b;
}

.collapsed-content {
  background: none repeat scroll 0 0 #fff;
  position: absolute;
  left: 60px;
  right: 0;
  top: 50px;
  bottom: 0;
  width: auto;
  padding: 15px;
  box-sizing: border-box;
  overflow-y: auto;
  border: 1px solid #4d5a6b;
}

.collapsed-icon {
  font-size: 23px !important;
}

.home-menu:not(.el-menu--collapse) {
  width: 150px;
  left: 0;
  top: 0;
  bottom: 0;
  display: block;
}

.sidebar {
  display: block;
  position: relative;
  width: 150px;
  left: 0;
  top: 0;
  bottom: 0;
  background: #3b434e;
  height: 100%;
}

.sidebar>ul {
  height: 100%;
}

.el-menu {
  background-color: #3b434e;
  color: #fff;
}

.el-menu-item {
  background-color: #4d5a6b;
  color: #fff;
}

.el-submenu__title {
  padding: 0 !important;
}

.el-submenu__title i {
  width: auto !important;
  margin-right: 0 !important;
  font-size: 16px;
}

.el-menu-item:hover {
  background-color: #456789;
}

.el-submenu {
  border-top: 1px dashed #4d4d4d90;
}

.el-submenu:last-child {
  border-bottom: 1px dashed #4d4d4d90;
}

.el-submenu .el-menu-item {
  border-bottom: 1px dashed #ffffff10;
}

.el-submenu .el-menu-item:last-child {
  border-bottom: none;
}
</style>
