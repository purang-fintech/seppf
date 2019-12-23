<template>
  <div id="root" class="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-mine"></i> 个人中心
        </el-breadcrumb-item>
        <el-breadcrumb-item>消息中心</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-tabs @tab-click="getReadMessages" type="card" tab-position="top" style="height: 100%" v-model="activeName">
      <el-tab-pane label="未读信息" name="notRead">
        <div v-if=" this.messages.length> 10" style="width:100%">
          <el-alert
            title="当前未读消息积累太多，请及时处理"
            type="warning"
            effect="dark"
            center
            show-icon
            :closable="false">
          </el-alert>
        </div>
        <el-table
          :data="messages"
          size="mini"
          stripe
          empty-text="暂无未读消息"
          :max-height="msgTHeight - 35"
          class="message-table">
          <el-table-column type="index" label="序号" width="100" align="center">
          </el-table-column>
          <el-table-column property="objectTypeName" label="消息类型" width="140" align="center">
          </el-table-column>
          <el-table-column property="userName" label="消息来自" width="140" align="center">
          </el-table-column>
          <el-table-column property="createdDate" label="消息时间" width="200" align="center">
          </el-table-column>
          <el-table-column label="消息摘要" header-align="center">
            <template slot-scope="scope">
              <el-popover placement="top" width="500" trigger="click">
                <el-alert type="success" :closable="false" :description="scope.row.content" effect="dark" class="message-content">
                </el-alert>
                <el-button slot="reference" type="text" size="small">{{ scope.row.title }}</el-button>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template slot-scope="scope">
              <el-button type="success" size="mini" @click="haveRead(scope.row)">置为已读</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="float: right;margin: 10px 10px 10px 0">
          <el-button v-no-more-click type="primary" icon="el-icon-success" @click="allHaveRead()" size="mini">
            全部标记为已读
          </el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="已读信息" name="hasRead">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-form :inline="false" class="message-form" size="small">
              <el-form-item>
                <el-select clearable v-model="message.objectType" filterable placeholder="消息类型">
                  <el-option v-for="item in objectTypes" :key="item.typeId" :label="item.typeName" :value="item.typeId">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-select
                  v-model="message.messageFrom"
                  clearable
                  placeholder="消息来源"
                  filterable
                  :filter-method="filterUsers"
                  @visible-change="resetFilterText">
                  <el-option-group v-for="group in userOptions" :key="group.label" :label="group.label">
                    <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
                      <span style="float:left">{{ item.name }}</span>
                      <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
                    </el-option>
                  </el-option-group>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-input v-model="message.messageCode" placeholder="关键字搜索" clearable></el-input>
              </el-form-item>
              <el-form-item>
                <el-date-picker v-model="message.messageDateBegin" type="date" :value-format="datefmt" placeholder="开始日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-date-picker v-model="message.messageDateEnd" type="date" :value-format="datefmt" placeholder="结束日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item style="width:90%">
                <el-button type="primary" @click="haveReadMessages()" icon="el-icon-search" style="float:right">搜索</el-button>
              </el-form-item>
            </el-form>
          </el-col>

          <el-col :span="20">
            <el-table
              :data="readMessages"
              size="mini"
              stripe
              empty-text="暂无已读消息"
              :max-height="msgTHeight"
              class="message-table">
              <el-table-column type="index" label="序号" width="80" align="center">
              </el-table-column>
              <el-table-column property="objectTypeName" label="消息类型" width="120" align="center">
              </el-table-column>
              <el-table-column property="userName" label="消息来自" width="120" align="center">
              </el-table-column>
              <el-table-column property="createdDate" label="消息时间" width="180" align="center">
              </el-table-column>
              <el-table-column label="消息摘要" header-align="center">
                <template slot-scope="scope">
                  <el-popover placement="top" width="500" trigger="click">
                    <el-alert type="success" :closable="false" :description="scope.row.content" effect="dark" class="message-content">
                    </el-alert>
                    <el-button slot="reference" type="text" size="small">{{ scope.row.title }}</el-button>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>

            <div class="page-set" style="margin: 10px 0">
              <el-pagination
                @size-change="readMessageHandleSizeChange"
                @current-change="readMessageHandleCurrentChange"
                :current-page="readMessageCurrentPage"
                :page-sizes="[10, 20, 50, 100, 200]"
                :page-size="readMessagePageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="readMessagesTotal">
              </el-pagination>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {
  dateFormat,
  pickOptions
} from "@/util/date.js";
import commonQuery from "@/components/util/CommonQuery.vue";
import {
  Notification
} from 'element-ui';
export default {
  data: function () {
    return {
      pickOptions: pickOptions,
      datefmt: defaultDateFormat,
      tabPosition: 'left',
      msgTHeight: bodyAviHeightTab - 40,
      queryChanged: false,
      activeName: "notRead",
      readMessages: [],
      readMessagesTotal: 0,
      readMessagePageSize: parseInt(sessionStorage.tablePageSize) || 10,
      readMessageCurrentPage: 1,
      message: {
        objectType: "",
        messageFrom: "",
        messageDateBegin: null,
        messageDateEnd: null,
        messageCode: null
      },
      objectTypes: [],
      memberFull: [],
      userOptions: []
    }
  },

  props: {
    messages: {
      type: Array,
      default () {
        return {}
      }
    },
    refreshed: {
      type: Boolean
    }
  },

  watch: {
    message: {
      handler() {
        this.currentPage = 1;
        this.queryChanged = true;
      },
      deep: true,
      immediate: true
    },

    'readMessages.length': function (val) {
      if (val == 0) {
        this.currentPage = 1;
        this.haveReadMessages();
      }
    },

    refreshed: {
      handler(val) {
        console.log(val);
        if (true == val) {
          this.activeName = "notRead";
        }
      }
    }
  },

  beforeRouteLeave(to, form, next) {
    this.$destroy();
    next();
  },

  activated() {
    this.activeName = "notRead";
  },

  created() {
    this.objectTypes = eval(localStorage.getItem("objectType"));
    this.memberQuery();
    this.activeName = "notRead";
    const now = new Date();
    this.message.messageDateEnd = dateFormat(now, this.datefmt);
    now.setTime(now.getTime() - 3600 * 1000 * 24 * 30);
    this.message.messageDateBegin = dateFormat(now, this.datefmt);
  },

  methods: {
    memberQuery() {
      let _self = this;
      commonQuery.memberQuery((result) => {
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
      });
    },

    resetFilterText() {
      let _self = this;
      _self.userOptions = _self.memberFull;
    },

    filterUsers(val) {
      let _self = this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },

    readMessageHandleSizeChange(val) {
      this.readMessagePageSize = val;
      this.readMessageCurrentPage = 1;
      this.haveReadMessages();
    },

    readMessageHandleCurrentChange(val) {
      if (this.queryChanged == true) {
        this.readMessageCurrentPage = 1;
      } else {
        this.readMessageCurrentPage = val;
      }
      this.haveReadMessages();
    },

    allHaveRead() {
      this.$axios.post("/message/have-read/all", {})
        .then(() => {
          Notification.closeAll();
        })
    },

    haveRead(data) {
      let ids = [data.id];
      this.$axios.post("/message/have-read", {
          ids: ids
        })
        .then(() => {
          if (this.messages.length == 0) {
            Notification.closeAll();
          }
        })
    },

    getReadMessages() {
      if (this.activeName == "hasRead") {
        this.haveReadMessages();
      }
    },

    haveReadMessages() {
      let messageDate = [];
      if (this.message.messageDateEnd && this.message.messageDateBegin) {
        messageDate.push(this.message.messageDateBegin);
        messageDate.push(this.message.messageDateEnd);
      } else {
        this.message.messageDateBegin = "";
        this.message.messageDateEnd = "";
        messageDate = null;
      }
      this.$axios.post("/message/have-read::query", {
          objectType: this.message.objectType,
          messageFrom: this.message.messageFrom,
          messageDate: messageDate,
          messageCode: this.message.messageCode,
          pageSize: this.readMessagePageSize,
          pageNum: this.readMessageCurrentPage
        })
        .then(resp => {
          this.readMessages = resp.data.list;
          this.readMessagesTotal = resp.data.total;
          setTimeout(() => {
            this.queryChanged = false;
          }, 200);
        })
    }
  }
}
</script>

<style>
.message-form .el-form-item {
  margin-bottom: 10px;
  float: right;
}

.message-form .el-input,
.message-form .el-input__inner {
  width: 180px;
}

.message-table th {
  background-color: #fff;
  font-size: 14px;
  color: #788288;
}
</style>
