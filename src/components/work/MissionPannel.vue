<template>
  <div id="root" style="width: 100%">
    <div class="query-filter">
      <el-select
        v-model="release.selected"
        placeholder="请选择一个版本"
        size="small"
        style="width: 18.9%"
        @change="releaseReqQuery()"
        filterable>
        <el-option v-for="opt in release.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
      </el-select>

      <el-tooltip content="完成特指编码和测试都已完成！" placement="left" effect="dark">
        <span style="margin:0 10px">计划完成日期</span>
      </el-tooltip>
      <el-date-picker
        v-model="planTo"
        type="daterange"
        align="right"
        size="small"
        unlink-panels
        :value-format="datefmt"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickOptions">
      </el-date-picker>

      <div class="ana-mode">
        <el-radio-group v-model="queryFilter" size="small" @change="queryFilterChange()">
          <el-radio-button label="1">全部</el-radio-button>
          <el-radio-button label="2">按需求</el-radio-button>
          <el-radio-button label="3">按负责人</el-radio-button>
        </el-radio-group>
      </div>
      <el-select
        v-if="queryFilter === '2'"
        v-model="reqs.selected"
        size="small"
        style="width: 18.9%"
        placeholder="====请选择===="
        @change="missionQuery()">
        <el-option v-for="opt in reqs.opts" :value="opt.value" :key="opt.value" :label="opt.label"></el-option>
      </el-select>
      <el-select
        v-if="queryFilter === '3'"
        v-model="responser"
        size="small"
        style="width: 18.9%"
        placeholder="====请选择===="
        @change="missionQuery()"
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
      <el-button
        v-no-more-click
        type="primary"
        size="small"
        class="el-icon-search"
        @click="missionQuery()"
        style="margin-left:1%">查询</el-button>
    </div>

    <div class="task-lists" :style="{height: formHeight + 'px'}">
      <el-tag class="card-title" type="info" size="small">
        <i class="iconfont icon-label" /> 待处理</el-tag>
      <draggable
        element="ul"
        class="drag-area"
        v-model="planed"
        :options="dragOptions"
        :move="onMove"
        @change="onPlaned">
        <div v-for="ele in planed" :key="ele.id" class="items" :class="ele.id === specified ? 'specified' : ''">
          <i :class="ele.fixed? 'iconfont icon-anchor' : 'iconfont icon-pushpin'" @click=" ele.fixed=! ele.fixed" aria-hidden="true"></i>
          <el-tooltip :content="ele.label" placement="top" effect="dark">
            <span class="cms-link" @click="$router.push({ name: 'missions', params: {type: 'coding', 'id': ele.id } })">{{ele.label}}</span>
          </el-tooltip>
          <div class="split-line"></div>
          计划人力：{{ele.manpower}} 人日
          <br> 计划开始日期：{{ele.planBegin}}
          <br> 计划完成日期：{{ele.planTo}}
        </div>
      </draggable>
    </div>

    <div class="task-lists" :style="{height: formHeight + 'px'}">
      <el-tag class="card-title" type="danger" size="small">
        <i class="iconfont icon-coding" /> 设计编码中</el-tag>
      <draggable
        element="ul"
        class="drag-area"
        v-model="coding"
        :options="dragOptions"
        :move="onMove"
        @change="onCoding">
        <div v-for="ele in coding" :key="ele.id" class="items" :class="[ele.special? 'special' : '', ele.id === specified ? 'specified' : '']">
          <i :class="ele.fixed? 'iconfont icon-anchor' : 'iconfont icon-pushpin'" @click=" ele.fixed=! ele.fixed" aria-hidden="true"></i>
          <el-tooltip :content="ele.label" placement="top" effect="dark">
            <span v-if="ele.label.indexOf('处理缺陷') > -1" class="cms-link" style="color:red" @click="toDefect('dev')">{{ele.label}}</span>
            <span v-else class="cms-link" @click="$router.push({ name: 'missions', params: {type: 'coding', 'id': ele.id } })">{{ele.label}}</span>
          </el-tooltip>
          <div class="split-line"></div>
          计划人力：{{ele.manpower}} 人日
          <br> 计划开始日期：{{ele.planBegin}}
          <br> 计划完成日期：{{ele.planTo}}
        </div>
      </draggable>
    </div>

    <div class="task-lists" :style="{height: formHeight + 'px'}">
      <el-tag class="card-title" size="small">
        <i class="el-icon-time" /> 待提测</el-tag>
      <draggable
        element="ul"
        class="drag-area"
        v-model="ready"
        :options="dragOptions"
        :move="onMove"
        @change="onReady">
        <div v-for="ele in ready" :key="ele.id" class="items" :class="ele.id === specified ? 'specified' : ''">
          <i :class="ele.fixed? 'iconfont icon-anchor' : 'iconfont icon-pushpin'" @click=" ele.fixed=! ele.fixed" aria-hidden="true"></i>
          <el-tooltip :content="ele.label" placement="top" effect="dark">
            <span class="cms-link" @click="$router.push({ name: 'missions', params: {type: 'coding', 'id': ele.id } })">{{ele.label}}</span>
          </el-tooltip>
          <div class="split-line"></div>
          计划人力：{{ele.manpower}} 人日
          <br> 计划开始日期：{{ele.planBegin}}
          <br> 计划完成日期：{{ele.planTo}}
        </div>
      </draggable>
    </div>

    <div class="task-lists" :style="{height: formHeight + 'px'}">
      <el-tag class="card-title" type="warning" size="small">
        <i class="iconfont icon-bug" /> 测试中</el-tag>
      <draggable
        element="ul"
        class="drag-area"
        v-model="testing"
        :options="dragOptions"
        :move="onMove"
        @change="onTesting">
        <div v-for="ele in testing" :key="ele.id" class="items" :class="[ele.special? 'special' : '', ele.id === specified ? 'specified' : '']">
          <i :class="ele.fixed? 'iconfont icon-anchor' : 'iconfont icon-pushpin'" @click=" ele.fixed=! ele.fixed" aria-hidden="true"></i>
          <el-tooltip :content="ele.label" placement="top" effect="dark">
            <span v-if="ele.label.indexOf('处理缺陷') > -1" class="cms-link" style="color:red" @click="toDefect('test')">{{ele.label}}</span>
            <span v-else class="cms-link" @click="$router.push({ name: 'missions', params: {type: 'coding', 'id': ele.id } })">{{ele.label}}</span>
          </el-tooltip>
          <div class="split-line"></div>
          计划人力：{{ele.manpower}} 人日
          <br> 计划开始日期：{{ele.planBegin}}
          <br> 计划完成日期：{{ele.planTo}}
        </div>
      </draggable>
    </div>

    <div class="task-lists" :style="{height: formHeight + 'px'}">
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
            <span class="cms-link" @click="$router.push({ name: 'missions', params: {type: 'coding', 'id': ele.id } })">{{ele.label}}</span>
          </el-tooltip>
          <div class="split-line"></div>
          计划人力：{{ele.manpower}} 人日
          <br> 计划开始日期：{{ele.planBegin}}
          <br> 计划完成日期：{{ele.planTo}}
        </div>
      </draggable>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import commonQuery from "@/components/util/CommonQuery.vue";
import {
  dateFormat,
  pickOptions
} from "@/util/date.js";
export default {
  components: {
    draggable: draggable
  },

  data: function () {
    return {
      formHeight: bodyAviHeightTab,
      editable: true,
      isDragging: false,
      datefmt: defaultDateFormat,
      pickOptions: pickOptions,
      planTo: [],
      delayedDragging: false,
      memberFull: [],
      userOptions: [],
      members: [],
      queryFilter: "1",
      responser: "",
      userRels: [],
      release: {
        selected: "",
        opts: []
      },
      reqs: {
        selected: "",
        opts: []
      },
      planed: [],
      ready: [],
      coding: [],
      testing: [],
      completed: [],
      specified: ""
    };
  },

  created() {
    let _self = this;
    _self.planTo.splice(0, _self.planTo.length);
    if (_self.$route.params.relId && _self.$route.params.relId > 0) {
      _self.release.selected = parseInt(_self.$route.params.relId);
      _self.specified = _self.$route.params.id;
    }

    _self.memberQuery(_self.releaseQuery);
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
    },

    filterUsers(val) {
      let _self = this;
      _self.userOptions = commonQuery.pickListFilter(val, _self.memberFull);
    },

    queryFilterChange() {
      let _self = this;
      if (_self.queryFilter === "1") {
        _self.reqs.selected = "";
        _self.responser = "";
        _self.missionQuery();
      } else if (_self.queryFilter === "2") {
        _self.responser = "";
      } else if (_self.queryFilter === "3") {
        _self.reqs.selected = "";
      }
    },

    toDefect(role) {
      let _self = this;
      _self.$router.push({
        name: 'defect',
        params: {
          'relId': _self.release.selected,
          'status': role == "dev" ? '1,2,3' : '4,5,6'
        }
      })
    },

    onMove(evt) {
      let element = evt.draggedContext.element;
      return !element.fixed && !element.special && !element.disabled;
    },

    onPlaned(e) {
      if (e.added && e.added.element) {
        this.changeMissionState(e.added.element, 1);
      }
    },

    onCoding(e) {
      if (e.added && e.added.element) {
        this.changeMissionState(e.added.element, 2);
      }
    },

    onReady(e) {
      if (e.added && e.added.element) {
        this.changeMissionState(e.added.element, 3);
      }
    },

    onTesting(e) {
      let _self = this;
      if (e.added && e.added.element) {
        _self.changeMissionState(e.added.element, 4);
      } else {
        return;
      }
    },

    onCompleted(e) {
      let _self = this;
      if (e.added && e.added.element) {
        _self.changeMissionState(e.added.element, 5);
      } else {
        return;
      }
    },

    changeOnWayCms(id, callback) {
      let _self = this;
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
        .then(function (res) {
          let changes = res.data;
          _self.$nextTick(() => {
            if (typeof callback == "function") {
              callback(changes);
            }
          })
        })
        .catch(function (response) {
          console.log(response);
          _self.$notify.error("查询需求变更记录时发生程序错误！");
        });
    },

    changeMissionState(element, newStatus) {
      let _self = this;
      _self.changeOnWayCms(element.id, (changeCount) => {
        if (changeCount > 0) {
          _self.missionQuery();
          _self.$confirm("是否前往变更页面查看？", "所属需求变更未完成，请暂勿操作", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
            .then(() => {
              _self.$router.push({
                name: "change",
                params: {
                  id: element.id
                }
              });
            })
            .catch(() => {});
        } else {
          _self.$axios.post("/cms/status_update/" + element.id + "/" + newStatus)
            .then(sres => {
              if (sres.data < 1) {
                _self.$message.info("开发任务变更保存失败！");
              }
            })
        }
      });
    },

    missionQuery() {
      let _self = this;
      _self.planed.splice(0, _self.planed.length);
      _self.ready.splice(0, _self.ready.length);
      _self.coding.splice(0, _self.coding.length);
      _self.testing.splice(0, _self.testing.length);
      _self.completed.splice(0, _self.completed.length);
      let planToBegin = "",
        planToEnd = "";
      if (_self.planTo && _self.planTo.length > 1) {
        planToBegin = _self.planTo[0];
        planToEnd = _self.planTo[1];
      }

      if (null === _self.release.selected || _self.release.selected === "") {
        return;
      }
      _self.defectQuery();
      _self.$axios({
          method: "post",
          url: "/cms/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.release.selected,
            reqId: _self.reqs.selected,
            responser: _self.responser,
            planToBegin: planToBegin,
            planToEnd: planToEnd
          }
        })
        .then(function (res) {
          let json = eval(res.data.list);
          let rels = _self.release.opts;
          for (let i = 0; i < json.length; i++) {
            if (!json[i].fixed) {
              _self.$set(json[i], "fixed", false);
            } else {
              json[i].fixed = false;
            }

            let responser = _self.members.find(item => {
              return item.value == json[i].responser;
            });

            let responserName = "已无权限";

            if (responser) {
              responserName = responser.label;
            }

            if (!json[i].label) {
              _self.$set(json[i], "label", "【" + responserName + "】" + json[i].summary);
            } else {
              json[i].label = responserName + " - " + json[i].summary;
            }

            if (json[i].status === 1) {
              _self.planed.push(json[i]);
            }
            if (json[i].status === 2) {
              _self.coding.push(json[i]);
            }
            if (json[i].status === 3) {
              _self.ready.push(json[i]);
            }
            if (json[i].status === 4) {
              _self.testing.push(json[i]);
            }
            if (json[i].status >= 5 || json[i].status === 0) {
              _self.completed.push(json[i]);
            }
          }
        })
        .catch(function (response) {
          console.log(response);
        });
    },

    defectQuery() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/defect/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: _self.release.selected
          }
        })
        .then(function (res) {
          let defects = eval(res.data.list);
          let toDever = 0;
          let toTester = 0;
          for (var i = 0; i < defects.length; i++) {
            if (
              defects[i].status > 0 &&
              defects[i].status < 4 &&
              defects[i].defectType != 6
            ) {
              toDever++;
            }
            if (defects[i].status > 3 && defects[i].status < 7) {
              toTester++;
            }
          }
          if (toDever > 0) {
            _self.coding.push({
              label: toDever + "个待开发处理缺陷",
              id: -1,
              planTo: "版本周期内",
              manpower: "/ ",
              special: true,
              fixed: false
            });
          }
          if (toTester > 0) {
            _self.testing.push({
              label: toTester + "个待测试处理缺陷",
              id: -2,
              planTo: "版本周期内",
              manpower: "/ ",
              special: true,
              fixed: false
            });
          }
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    memberQuery(callback) {
      let _self = this;
      commonQuery.memberQuery((result) => {
        _self.members = result.users;
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        if (typeof callback == "function") {
          callback();
        }
      });
    },

    releaseQuery() {
      let _self = this;
      let params = _self.release.selected == "" ? null : {
        relId: _self.release.selected
      };
      let planToBegin = "",
        planToEnd = "";
      if (_self.planTo && _self.planTo.length > 1) {
        planToBegin = _self.planTo[0];
        planToEnd = _self.planTo[1];
      }
      _self.$axios({
          method: "post",
          url: "/release/opening",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: params
        })
        .then(function (res) {
          let rels = eval(res.data);
          if (rels.length === 0) {
            _self.$message.warning("尚未创建版本计划！");
            return;
          }
          _self.release.opts.splice(0, _self.release.opts.length);
          for (var i = 0; i < rels.length; i++) {
            _self.release.opts.push({
              label: "[" + rels[i].branchName + "] " + rels[i].relCode,
              value: rels[i].id
            });
          }
          if (params == null) {
            _self.release.selected = rels[0].id;
          }
          _self.$nextTick(() => {
            _self.releaseReqQuery();
          });
        })
    },

    releaseReqQuery() {
      let _self = this;
      _self.$axios.post("/req/rel_query/" + _self.release.selected + "/1/500")
        .then(function (res) {
          let json = eval(res.data.list);
          _self.reqs.opts.splice(0, _self.reqs.opts.length);
          for (var i = 0; i < json.length; i++) {
            _self.reqs.opts.push({
              label: "#" + json[i].id + " - " + json[i].summary,
              value: json[i].id
            });
          }
          _self.reqs.selected = "";
          _self.responser = "";
          _self.queryFilter = "1";
          _self.$nextTick(() => {
            _self.missionQuery();
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

.task-lists {
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

.task-lists+.task-lists {
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

.special {
  background-color: #e2bc84;
  color: #000;
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
