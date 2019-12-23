<template>
  <div id="root" style="width: 100%">
    <div class="query-filter">
      <el-select
        v-model="relId"
        placeholder="请选择一个版本"
        size="small"
        style="width: 18.9%"
        @change="releaseReqQuery()"
        filterable>
        <el-option v-for="opt in releases" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
      </el-select>

      <div class="ana-mode">
        <el-radio-group v-model="queryFilter" size="small" @change="queryFilterChange()">
          <el-radio-button label="0">全部</el-radio-button>
          <el-radio-button label="1">按模块</el-radio-button>
          <el-radio-button label="2">按提交人</el-radio-button>
          <el-radio-button label="3">按产品经理</el-radio-button>
        </el-radio-group>
      </div>
      <el-select v-if="queryFilter === '1'" v-model="moduleId" size="small" placeholder="请选择模块" @change="releaseReqQuery()">
        <el-option v-for="opt in modules" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
      </el-select>
      <el-select
        v-if="queryFilter === '2'"
        v-model="submitter"
        size="small"
        placeholder="请选择提交人"
        @change="releaseReqQuery()"
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
      <el-select
        v-if="queryFilter === '3'"
        v-model="pdResponser"
        size="small"
        placeholder="请选择产品经理"
        @change="releaseReqQuery()"
        filterable
        :filter-method="filterUsers1"
        @visible-change="resetFilterText">
        <el-option-group v-for="group in userOptions1" :key="group.label" :label="group.label">
          <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
            <span style="float:left">{{ item.name }}</span>
            <span style="float:right;margin-left:20px;color:#9ca9c4">{{ item.account }}</span>
          </el-option>
        </el-option-group>
      </el-select>
      <el-button
        v-no-more-click
        type="primary"
        size="small"
        class="el-icon-search"
        @click="releaseReqQuery()"
        style="margin-left:1%">查询</el-button>
    </div>

    <div class="require-list" :style="{height: formHeight + 'px'}">
      <el-tag class="card-title" type="info" size="small">
        <i class="iconfont icon-label" /> 排期待开发</el-tag>
      <draggable
        element="ul"
        class="drag-area"
        v-model="released"
        :options="dragOptions"
        :move="onMove"
        @change="onReleased">
        <div v-for="ele in released" :key="ele.id" class="items" :class="ele.id === specified ? 'specified' : ''">
          <i :class="ele.fixed? 'iconfont icon-anchor' : 'iconfont icon-pushpin'" @click=" ele.fixed=! ele.fixed" aria-hidden="true"></i>
          <el-tooltip :content="ele.label" placement="top" effect="dark">
            <span class="cms-link" @click="$router.push({ name: 'request', params: { 'id': ele.id } })">{{ele.label}}</span>
          </el-tooltip>
          <div class="split-line"></div>
          [{{ele.statusName}}] 已拆分任务数：{{ele.cmCount}}
          <br> 需求提交日期：{{ele.submitDate}}
          <br> 期望完成日期：{{ele.expectDate}}
        </div>
      </draggable>
    </div>

    <div class="require-list" :style="{height: formHeight + 'px'}">
      <el-tag class="card-title" size="small">
        <i class="el-icon-time" /> 已拆分任务</el-tag>
      <draggable
        element="ul"
        class="drag-area"
        v-model="splited"
        :options="dragOptions"
        :move="onMove"
        @change="onSplited">
        <div v-for="ele in splited" :key="ele.id" class="items" :class="ele.id === specified ? 'specified' : ''">
          <i :class="ele.fixed? 'iconfont icon-anchor' : 'iconfont icon-pushpin'" @click=" ele.fixed=! ele.fixed" aria-hidden="true"></i>
          <el-tooltip :content="ele.label" placement="top" effect="dark">
            <span class="cms-link" @click="$router.push({ name: 'request', params: { 'id': ele.id } })">{{ele.label}}</span>
          </el-tooltip>
          <div class="split-line"></div>
          [{{ele.statusName}}] 已拆分任务数：{{ele.cmCount}}
          <br> 需求提交日期：{{ele.submitDate}}
          <br> 期望完成日期：{{ele.expectDate}}
        </div>
      </draggable>
    </div>

    <div class="require-list" :style="{height: formHeight + 'px'}">
      <el-tag class="card-title" type="danger" size="small">
        <i class="iconfont icon-coding" /> 设计编码中</el-tag>
      <draggable
        element="ul"
        class="drag-area"
        v-model="coding"
        :options="dragOptions"
        :move="onMove"
        @change="onCoding">
        <div v-for="ele in coding" :key="ele.id" class="items" :class="ele.id === specified ? 'specified' : ''">
          <i :class="ele.fixed? 'iconfont icon-anchor' : 'iconfont icon-pushpin'" @click=" ele.fixed=! ele.fixed" aria-hidden="true"></i>
          <el-tooltip :content="ele.label" placement="top" effect="dark">
            <span class="cms-link" @click="$router.push({ name: 'request', params: { 'id': ele.id } })">{{ele.label}}</span>
          </el-tooltip>
          <div class="split-line"></div>
          [{{ele.statusName}}] 已拆分任务数：{{ele.cmCount}}
          <br> 需求提交日期：{{ele.submitDate}}
          <br> 期望完成日期：{{ele.expectDate}}
        </div>
      </draggable>
    </div>

    <div class="require-list" :style="{height: formHeight + 'px'}">
      <el-tag class="card-title" type="warning" size="small">
        <i class="iconfont icon-bug" /> 测试中</el-tag>
      <draggable
        element="ul"
        class="drag-area"
        v-model="testing"
        :options="dragOptions"
        :move="onMove"
        @change="onTesting">
        <div v-for="ele in testing" :key="ele.id" class="items" :class="ele.id === specified ? 'specified' : ''">
          <i :class="ele.fixed? 'iconfont icon-anchor' : 'iconfont icon-pushpin'" @click=" ele.fixed=! ele.fixed" aria-hidden="true"></i>
          <el-tooltip :content="ele.label" placement="top" effect="dark">
            <span class="cms-link" @click="$router.push({ name: 'request', params: { 'id': ele.id } })">{{ele.label}}</span>
          </el-tooltip>
          <div class="split-line"></div>
          [{{ele.statusName}}] 已拆分任务数：{{ele.cmCount}}
          <br> 需求提交日期：{{ele.submitDate}}
          <br> 期望完成日期：{{ele.expectDate}}
        </div>
      </draggable>
    </div>

    <div class="require-list" :style="{height: formHeight + 'px'}">
      <el-tag class="card-title" type="success" size="small">
        <i class="el-icon-circle-check" /> 已完成</el-tag>
      <draggable
        element="ul"
        class="drag-area"
        v-model="completed"
        :options="dragOptions"
        :move="onMove"
        @change="onCompleted">
        <div v-for="ele in completed" :key="ele.id" class="items" :class="ele.id === specified ? 'specified' : ''">
          <i :class="ele.fixed? 'iconfont icon-anchor' : 'iconfont icon-pushpin'" @click=" ele.fixed=! ele.fixed" aria-hidden="true"></i>
          <el-tooltip :content="ele.label" placement="top" effect="dark">
            <span class="cms-link" @click="$router.push({ name: 'request', params: { 'id': ele.id } })">{{ele.label}}</span>
          </el-tooltip>
          <div class="split-line"></div>
          <el-link v-if="ele.status==6" @click="confirmClose(ele)" type="danger" style="font-size:12px">[{{ele.statusName}}] </el-link>
          <span v-else>[{{ele.statusName}}] </span>
          已拆分任务数：{{ele.cmCount}}
          <br> 需求提交日期：{{ele.submitDate}}
          <br> 期望完成日期：{{ele.expectDate}}
        </div>
      </draggable>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import commonQuery from "@/components/util/CommonQuery.vue";
export default {
  components: {
    draggable: draggable
  },

  data: function () {
    return {
      formHeight: bodyAviHeightTab,
      isDragging: false,
      delayedDragging: false,
      memberFull: [],
      userOptions: [],
      userOptions1: [],
      queryFilter: "0",
      modules: [],
      moduleId: "",
      submitter: "",
      pdResponser: "",
      releases: [],
      relId: "",

      released: [],
      splited: [],
      coding: [],
      testing: [],
      completed: [],
      specified: ""
    };
  },

  created() {
    let _self = this;
    let releaseId = _self.$route.params.relId;
    if (releaseId && releaseId > 0) {
      _self.relId = parseInt(releaseId);
      _self.specified = releaseId;
    }

    _self.memberQuery();
    _self.moduleQuery();
    _self.releaseQuery();
  },

  watch: {
    isDragging(newValue) {
      if (newValue) {
        this.delayedDragging = true;
        return;
      }
      this.$nextTick(() => {
        this.delayedDragging = false;
      });
    }
  },

  computed: {
    dragOptions() {
      return {
        animation: 0,
        group: "tasks",
        ghostClass: "ghost"
      };
    }
  },

  methods: {
    resetFilterText() {
      let _self = this;
      _self.userOptions = _self.memberFull;
      _self.userOptions1 = _self.memberFull;
    },

    filterUsers(val) {
      let _self = this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },

    filterUsers1(val) {
      let _self = this;
      _self.userOptions1 = commonQuery.pickListFilter(val, _self.memberFull);
    },

    queryFilterChange() {
      let _self = this;
      if (_self.queryFilter === "1") {
        _self.pdResponser = "";
        _self.submitter = "";
        _self.releaseReqQuery();
      } else if (_self.queryFilter === "2") {
        _self.moduleId = "";
        _self.pdResponser = "";
      } else if (_self.queryFilter === "3") {
        _self.moduleId = "";
        _self.submitter = "";
      } else {
        _self.moduleId = "";
        _self.pdResponser = "";
        _self.submitter = "";
      }
    },

    onMove(evt) {
      let element = evt.draggedContext.element;
      return !element.fixed && element.status > 0;
    },

    onReleased(e) {
      if (e.added && e.added.element) {
        this.changeReqState(e.added.element, 2);
      }
    },

    onSplited(e) {
      if (e.added && e.added.element) {
        this.changeReqState(e.added.element, 3);
      }
    },

    onCoding(e) {
      if (e.added && e.added.element) {
        this.changeReqState(e.added.element, 4);
      }
    },

    onTesting(e) {
      let _self = this;
      if (e.added && e.added.element) {
        _self.changeReqState(e.added.element, 5);
      } else {
        return;
      }
    },

    onCompleted(e) {
      let _self = this;
      if (e.added && e.added.element) {
        _self.changeReqState(e.added.element, 6);
      } else {
        return;
      }
    },

    confirmClose(element) {
      let _self = this;
      _self.$confirm("本需求已完成，是否确认关闭？", "需求关闭提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          _self.changeReqState(element, 0);
        })
    },

    changeOnWay(reqId, callback) {
      let _self = this;
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
        .then(function (res) {
          let changes = res.data;
          _self.$nextTick(() => {
            if (typeof callback == "function") {
              callback(changes);
            }
          })
        })
    },

    changeReqState(element, newStatus) {
      let _self = this;
      _self.changeOnWay(element.id, (changeCount) => {
        if (changeCount > 0) {
          _self.$confirm("是否前往变更页面查看？", "需求变更未完成，请暂勿操作", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
            .then(() => {
              _self.$router.push({
                name: "change",
                params: {
                  reqId: element.id
                }
              });
            })
        } else {
          const special = element.cmCount > 0 && newStatus == 2;
          if (special && element.status == 3) {
            _self.$message.info("已拆分开发任务，无需额外操作！");
            _self.releaseReqQuery();
            return;
          }
          if (special) {
            newStatus = 3;
          }
          if (element.cmCount == 0 && newStatus > 2) {
            _self.$message.info("未拆分开发任务不可操作！");
            _self.releaseReqQuery();
            return;
          }
          _self.$axios.post("/req/status_update", {
              id: element.id,
              status: newStatus
            })
            .then(sres => {
              if (sres.data < 1) {
                _self.$message.warning("产品需求状态更新失败！");
              } else {
                _self.$message.success("产品需求状态更新成功！");
                if (newStatus == 0) {
                  _self.$confirm("是否同步关闭所属开发任务？", "操作提示", {
                      confirmButtonText: "确定",
                      cancelButtonText: "取消",
                      type: "info"
                    })
                    .then(() => {
                      _self.reqCmsStatusSync(element.id, 0);
                    })
                }
              }
              _self.releaseReqQuery();
            })
        }
      });
    },

    reqCmsStatusSync(reqId, targetStatus) {
      let _self = this;
      _self.$axios.post("/cms/req_cms_sync/" + reqId + "/" + targetStatus)
        .then(function (res) {
          if (res.data = 1) {
            _self.$message.success("同步开发任务状态成功！");
          } else {
            _self.$message.warning("同步开发任务状态失败！");
          }
        })
    },

    memberQuery() {
      let _self = this;
      commonQuery.memberQuery((result) => {
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        _self.userOptions1 = result.usersFull;
      });
    },

    releaseQuery() {
      let _self = this;
      _self.releases.splice(0, _self.releases.length);
      commonQuery.openRelQuery((result) => {
        _self.releases = result.releasesWithBranch;
        if (_self.releases.length == 0) {
          _self.$message.info("没有在途（未关闭）版本计划！");
          return;
        }
        if (commonQuery.isNull(_self.relId)) {
          _self.relId = _self.releases[0].value;
        }
        _self.$nextTick(() => {
          _self.releaseReqQuery();
        });
      })
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
        })
    },

    releaseReqQuery() {
      let _self = this;
      _self.released.splice(0, _self.released.length);
      _self.splited.splice(0, _self.splited.length);
      _self.coding.splice(0, _self.coding.length);
      _self.testing.splice(0, _self.testing.length);
      _self.completed.splice(0, _self.completed.length);

      _self.$axios.post("/req/rel_query/" + _self.relId + "/1/500")
        .then(function (res) {
          let json = eval(res.data.list);
          if (json.length == 0) {
            _self.$message.info("该版本尚未纳入任何需求！");
            return;
          }

          let filterd = json;
          if (!commonQuery.isNull(_self.moduleId)) {
            filterd = json.filter(d => {
              return d.moduleId == _self.moduleId
            });
          } else if (!commonQuery.isNull(_self.submitter)) {
            filterd = json.filter(d => {
              return d.submitter == _self.submitter
            });
          } else if (!commonQuery.isNull(_self.pdResponser)) {
            filterd = json.filter(d => {
              return d.pdResponser == _self.pdResponser
            });
          }

          filterd.forEach(item => {
            _self.$set(item, "fixed", item.status == 0);
            _self.$set(item, "label", "【" + item.proderName + "】" + item.id + " - " + item.summary);

            if (item.status == 2) {
              _self.released.push(item);
            }
            if (item.status == 3) {
              _self.splited.push(item);
            }
            if (item.status == 4) {
              _self.coding.push(item);
            }
            if (item.status == 5) {
              _self.testing.push(item);
            }
            if (item.status == 6 || item.status == 0) {
              _self.completed.push(item);
            }
          });
        })
    }
  }
};
</script>

<style>
.query-filter .ana-mode .el-radio-button .el-radio-button__inner {
  font-size: 14px;
}
</style>

<style scoped>
.query-filter {
  width: 100%;
  display: block;
  margin-bottom: 10px;
}

.query-filter .ana-mode {
  display: inline-block;
  margin-right: 20px;
  margin-left: 1%;
}

.card-title {
  font-size: 16px;
  text-align: center;
  color: #000;
  width: 100%;
  height: 30px;
  line-height: 30px;
  margin-bottom: 10px;
}

.card-title .el-icon-success {
  font-size: 12px;
}

.require-list {
  display: inline-block;
  width: 18.9%;
}

.drag-area {
  display: inline-block;
  width: 91%;
  height: 91%;
  min-height: 10px;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 4%;
  background-color: #ecfbe430;
  vertical-align: top;
  overflow-y: auto;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.require-list+.require-list {
  margin-left: 1%;
}

.items {
  height: 93px;
  line-height: 23px;
  border: 1px solid #e4edf3;
  background-color: #fff;
  color: #000;
  border-radius: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  cursor: move;
  padding: 5px 10px;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.items i {
  font-size: 12px;
  cursor: pointer;
}

.cms-link {
  color: #3AB4D7;
  cursor: pointer;
}

.specified {
  background-color: #435154;
  color: #fff !important;
}

.drag-area div+div {
  margin-top: 10px;
}

.split-line {
  height: 0;
  width: 100%;
  border: 1px solid #e4edf3;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
