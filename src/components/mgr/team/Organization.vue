<template>
  <div ref="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item><i class="el-icon-setting"></i> 系统配置</el-breadcrumb-item>
        <el-breadcrumb-item>团队管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-dialog :close-on-click-modal="modalClose" title="新建 团队信息" :visible.sync="showNewBox" width="500px">
      <el-form
        :model="newForm"
        ref="teamFormNew"
        :rules="teamFormRules"
        size="small"
        :inline="false"
        label-width="100px">
        <el-form-item label="团队名称" prop="teamName" required>
          <el-input v-model="newForm.teamName" placeholder="请输入团队名称，50字以内" clearable class="team-infos"></el-input>
        </el-form-item>
        <el-form-item label="团队负责人" prop="responser" required>
          <el-select
            v-model="newForm.responser"
            placeholder="请选择"
            filterable
            clearable
            class="team-infos"
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
        <el-form-item label="团队说明">
          <el-input
            type="textarea"
            :rows="8"
            v-model="newForm.teamDescription"
            class="team-infos"
            :maxlength="2000"
            show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="onCancel">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="checkFormRules('teamFormNew', saveNewNode)">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="修改 团队信息" :visible.sync="showModBox" width="500px">
      <el-form
        :model="modForm"
        ref="teamFormMod"
        :rules="teamFormRules"
        size="small"
        :inline="false"
        label-width="100px">
        <el-form-item label="团队名称" prop="teamName" required>
          <el-input v-model="modForm.teamName" placeholder="请输入团队名称，50字以内" clearable class="team-infos"></el-input>
        </el-form-item>
        <el-form-item label="团队负责人" prop="responser" required>
          <el-select
            v-model="modForm.responser"
            placeholder="请选择"
            filterable
            clearable
            class="team-infos"
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
        <el-form-item label="团队说明">
          <el-input
            type="textarea"
            :rows="8"
            v-model="modForm.teamDescription"
            class="team-infos"
            :maxlength="2000"
            show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="onCancel">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="checkFormRules('teamFormMod', saveModNode)">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :close-on-click-modal="modalClose" title="选择团队成员" :visible.sync="currentTeam.showAddMember" width="400px">
      <el-select
        size="small"
        v-model="currentTeam.addSelected"
        placeholder="请选择，可多选"
        filterable
        clearable
        multiple
        class="team-infos"
        :filter-method="filterUsers2"
        @change="multiOptionsHandler">
        <el-option-group v-for="group in userOptions2" :key="group.label" :label="group.label">
          <el-option v-for="item in group.options" :key="item.value" :label="item.name" :value="item.value">
            <span style="float:left">{{ item.name }}</span>
            <span style="float:right;margin:0 10px;color:#9ca9c4">{{ item.account }}</span>
          </el-option>
        </el-option-group>
      </el-select>
      <div slot="footer">
        <el-button v-no-more-click type="primary" icon="el-icon-circle-close" size="small" @click="currentTeam.showAddMember=false">取消</el-button>
        <el-button v-no-more-click type="primary" icon="el-icon-circle-check" size="small" @click="addMembers()">确定</el-button>
      </div>
    </el-dialog>

    <div class="team-block" v-bind:style="{height: baseHeight + 'px'}" ref="cases">
      <el-tree
        class="tree-view"
        :style="{ height: treeHeight + 'px' }"
        node-key="id"
        ref="team"
        :data="treeData"
        highlight-current
        :expand-on-click-node="false"
        :props="defaultProps"
        @node-click="nodeClickEvent"
        :default-expanded-keys="expanded"
        :render-content="renderContent">
      </el-tree>
    </div>

    <div class="team-detail" v-bind:style="{height: baseHeight + 'px'}">
      <el-input
        type="textarea"
        :rows="5"
        v-model="currentTeam.teamDescription"
        class="team-description"
        resize="none"
        disabled></el-input>
      <el-button v-no-more-click size="mini" type="primary" icon="el-icon-circle-plus-outline" @click="beginAddMembers()">增加团队成员</el-button>
      <el-button v-no-more-click size="mini" type="danger" icon="el-icon-remove-outline" @click="removeMembers()">移除团队成员</el-button>
      <el-table
        :data="currentTeam.members"
        :max-height="tableHeight"
        size="middium"
        stripe
        style="margin-top:10px"
        @selection-change="selectionChange"
        :border="showBorder">
        <el-table-column type="selection" label="选择" width="60" align="center">
        </el-table-column>
        <el-table-column prop="userName" label="姓名" width="120" align="center">
        </el-table-column>
        <el-table-column prop="userAccount" label="账号" align="center" sortable>
        </el-table-column>
        <el-table-column prop="isVendor" label="是否外包" width="100" align="center" sortable>
        </el-table-column>
      </el-table>
    </div>

  </div>
</template>

<script>
let id = 0;
const rootId = 1;
import commonQuery from "@/components/util/CommonQuery.vue";
export default {
  data: function () {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      treeData: [],
      expanded: [],
      defaultProps: {
        children: 'children',
        label: "teamName"
      },
      memberFull: [],
      userOptions: [],
      userOptions1: [],
      userOptions2: [],
      showNewBox: false,
      showModBox: false,
      newForm: {
        teamName: "",
        responser: "",
        parentId: "",
        teamDescription: ""
      },
      modForm: {
        teamName: "",
        id: "",
        responser: "",
        parentId: "",
        teamDescription: ""
      },
      teamFormRules: {
        responser: [{
          required: true,
          message: "请选择负责人",
          trigger: "change"
        }],
        teamName: [{
            required: true,
            message: "请输入团队名称",
            trigger: "blur"
          },
          {
            min: 1,
            max: 50,
            message: "长度在 1 到 50 个字",
            trigger: "blur"
          }
        ]
      },
      baseHeight: "",
      treeHeight: "",
      tableHeight: "",
      tempData: [],
      tempNode: {},
      currentTeam: {
        teamDescription: "",
        members: [],
        multipleSelection: [],
        addSelected: [],
        showAddMember: false
      },
      index: 0,
      sysUsers: []
    };
  },

  watch: {
    'currentTeam.showAddMember': function (val) {
      if (val) {
        this.currentTeam.addSelected = [];
      }
    }
  },

  created() {
    this.baseHeight = bodyAviHeightNTab + 50;
    this.treeHeight = bodyAviHeightNTab + 45;
    this.tableHeight = bodyAviHeightNTab - 120;

    this.teamQuery(0);
    this.memberQuery();
    this.expanded.splice(0, this.expanded.length);
    this.expanded.push(rootId);
  },

  methods: {
    resetFilterText() {
      let _self = this;
      _self.userOptions = _self.memberFull;
      _self.userOptions1 = _self.memberFull;
    },

    multiOptionsHandler() {
      let _self = this;
      const selected = _self.currentTeam.addSelected.concat([]);
      _self.currentTeam.addSelected.splice(0, _self.currentTeam.addSelected.length);
      _self.$nextTick(_ => {
        _self.userOptions2 = _self.memberFull;
        selected.forEach(d => {
          _self.currentTeam.addSelected.push(d);
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

    checkFormRules(formName, callback) {
      let _self = this;
      _self.$refs[formName].validate((valid) => {
        if (!valid) {
          _self.$message.warning("表单校验不通过，无法提交！");
          return;
        } else {
          if (typeof callback === "function") {
            callback();
          } else {
            _self.$notify.error("程序回调失败，参数错误！");
            return;
          }
        }
      });
    },

    transData(json, idKey, pidKey, childrenKey) {
      let result = [];
      let hash = {};
      for (let i = 0; i < json.length; i++) {
        hash[json[i][idKey]] = json[i];
      }
      for (let j = 0; j < json.length; j++) {
        let aVal = json[j];
        let hashVP = hash[aVal[pidKey]];
        if (hashVP) {
          !hashVP[childrenKey] && (hashVP[childrenKey] = []);
          hashVP[childrenKey].push(aVal);
        } else {
          result.push(aVal);
        }
      }
      return result;
    },

    selectionChange(val) {
      this.currentTeam.multipleSelection = val;
    },

    removeMembers() {
      let _self = this;
      let selected = _self.currentTeam.multipleSelection;
      if (!selected || selected.length == 0) {
        _self.$message.warning("没有选中任何记录！");
        return;
      }
      _self.$confirm("确定要将选中成员移出当前团队吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          let members = [];
          for (var i = 0; i < selected.length; i++) {
            members.push(selected[i].userId);
          }
          _self.commitRemoveMembers(members);
        })
        .catch(() => {});
    },

    commitRemoveMembers(members) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/team/member_remove",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            members: members.toString()
          }
        })
        .then(function (res) {
          if (res.data == members.length) {
            _self.$message.success("移除团队成员成功！");
          } else if (res.data < members.length && res.data > 0) {
            _self.$message.info("移除团队成员部分成功，请检查！");
          } else {
            _self.$message.warning("移除团队成员全部失败，请检查！");
          }
          _self.teamMemberQuery(_self.currentTeam.id);
          _self.memberQuery();
        })
        .catch(function (response) {
          _self.$notify.error("移除团队成员时发生程序错误！");
          console.log(response);
        });
    },

    beginAddMembers() {
      let _self = this;
      if (_self.$refs.team.getCurrentNode() == null) {
        _self.$message.warning("请先选择一个团队！");
        return;
      } else if (_self.$refs.team.getNode(_self.$refs.team.getCurrentNode()).level == 1) {
        _self.$message.warning("根目录不允许操作！");
        return;
      }
      _self.currentTeam.showAddMember = true;
    },

    addMembers() {
      let _self = this;
      if (!_self.currentTeam.addSelected || _self.currentTeam.addSelected.length == 0) {
        _self.$message.warning("未选中任何记录，请确认！");
        return;
      }
      let teamed = _self.sysUsers.filter(item => {
        return _self.currentTeam.addSelected.indexOf(item.value) > -1;
      });
      let names = [];
      teamed.forEach(item => {
        if (item.teamId != null && item.teamId > 0) {
          names.push(item.label);
        }
      });
      if (names.length == 0) {
        _self.commitAddMembers();
        return;
      }
      _self.$confirm("用户【" + names.toString() + "】已在其他团队，确认修改到本团队吗？", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          _self.commitAddMembers();
        })
        .catch(() => {});
    },

    commitAddMembers() {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/team/member_add",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            id: _self.currentTeam.id,
            members: _self.currentTeam.addSelected.toString()
          }
        })
        .then(function (res) {
          if (res.data == _self.currentTeam.addSelected.length) {
            _self.$message.success("增加团队成员成功！");
          } else if (res.data < _self.currentTeam.addSelected.length && res.data > 0) {
            _self.$message.info("增加团队成员部分成功，请检查！");
          } else {
            _self.$message.warning("增加团队成员全部失败，请检查！");
          }
          _self.currentTeam.showAddMember = false;
          _self.teamMemberQuery(_self.currentTeam.id);
          _self.memberQuery();
        })
        .catch(function (response) {
          _self.$notify.error("增加团队成员时发生程序错误！");
          console.log(response);
        });
    },

    onCancel() {
      this.showNewBox = false;
      this.showModBox = false;
    },

    nodeClickEvent(data, node, s) {
      this.currentTeam.teamDescription = data.teamDescription;
      this.currentTeam.id = data.id;
      this.teamMemberQuery(data.id);
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.team.setCurrentNode(data);
        }, 200);
      });
    },

    append(data, parentNode) {
      this.tempData = data;
      this.showNewBox = true;
    },

    teamQuery(parentId) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/team/query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            "parentId": parentId
          }
        })
        .then(function (res) {
          let json = eval(res.data);
          _self.treeData = _self.transData(json, 'id', 'parentId', 'children');
        })
        .catch(function (response) {
          _self.$notify.error("加载团队组织架构时发生程序错误！");
          console.log(response);
        });
    },

    saveNewNode() {
      let _self = this;

      let data = _self.tempData;
      let teamName = _self.newForm.teamName;

      if (data.children) {
        for (let i = 0; i < data.children.length; i++) {
          if (data.children[i].teamName === teamName) {
            _self.$message.warning("存在相同名称的团队！");
            return;
          }
        }
      }

      _self.$axios({
          method: "post",
          url: "/team/create",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            teamName: teamName,
            parentId: data.id,
            responser: _self.newForm.responser,
            teamDescription: _self.newForm.teamDescription
          }
        })
        .then(function (res) {
          _self.showNewBox = false;
          const newChild = { //刷新之前只在前端将新节点添加，不需要与后端强制同步，节省开销
            id: res.data,
            teamName: teamName,
            responser: _self.newForm.responser,
            teamDescription: _self.newForm.teamDescription,
            children: []
          };
          if (!data.children) {
            _self.$set(data, "children", []);
          }
          data.children.push(newChild);
          _self.expanded.push(newChild.id);
          _self.$message.success("新增团队信息保存成功");
        })
        .catch(function (response) {
          _self.$notify.error("新增团队信息时发生程序错误！");
          console.log(response);
        });
    },

    remove(node, data) {
      let _self = this;
      if (node.isLeaf == false) {
        _self.$message.warning("存在下级团队，请先删除下级节点！");
        return;
      }
      _self.$confirm("确认删除团队 [" + data.teamName + "] 吗?", "操作确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          if (_self.currentTeam.members.length > 0) {
            _self.$message.warning("请先移除团队下所有成员！");
            return;
          }
          _self.$axios({
              method: "post",
              url: "/team/delete",
              headers: {
                "Content-type": "application/x-www-form-urlencoded"
              },
              params: {
                "id": data.id
              }
            })
            .then(function (res) {
              if (res.data === 1) {
                const parent = node.parent;
                const children = parent.data.children || parent.data;
                const index = children.findIndex(d => d.id === data.id);
                children.splice(index, 1);
                _self.$refs.team.setCurrentNode(parent);
                _self.$message.success("删除团队信息成功！");
              } else {
                _self.$notify.error("删除团队信息失败，没有记录更新");
              }
            })
            .catch(function (response) {
              _self.$notify.error("团队信息时发生程序错误！");
              console.log(response);
            });
        })
        .catch(() => {});
    },

    modify(node, data) {
      this.showModBox = true;
      this.tempNode = node;
      this.tempData = data;

      this.modForm.teamName = data.teamName;
      this.modForm.id = data.id;
      this.modForm.parentId = data.parentId;
      this.modForm.responser = data.responser;
      this.modForm.teamDescription = data.teamDescription;
    },

    saveModNode() {
      let _self = this;
      let data = _self.tempData;
      let node = _self.tempNode;

      const parent = node.parent;
      const children = parent.data.children || parent.data;

      for (let i = 0; i < children.length; i++) {
        if (children[i].teamName === _self.modForm.teamName && data.teamName != _self.modForm.teamName) {
          _self.$notify.error("存在相同名称的团队！");
          return;
        }
      }
      _self.showModBox = false;

      data.teamName = _self.modForm.teamName;
      data.id = _self.modForm.id;
      data.parentId = _self.modForm.parentId;
      data.responser = _self.modForm.responser;
      data.teamDescription = _self.modForm.teamDescription;

      _self.$axios({
          method: "post",
          url: "/team/update",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            id: data.id,
            teamName: data.teamName,
            parentId: data.parentId,
            responser: data.responser,
            teamDescription: data.teamDescription
          }
        })
        .then(function (res) {
          if (res.data === 1) {
            const index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1, data);
            _self.$message.success("修改团队信息成功");
          } else {
            _self.$notify.error("修改团队信息失败，没有记录更新");
          }
        })
        .catch(function (response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    renderContent(h, { node, data, store }) {
      if (node.level === 1) {
        return (
          <span class="tree-render">
            <span>
              <i class="iconfont icon-folder" style="margin-right: 4px"/>
              {node.label}
            </span>
            <span>
              <el-button v-no-more-click size="small" type="text" on-click={() => this.append(data)} >
                <i class="iconfont icon-addition"></i>
              </el-button>
            </span>
          </span>
        );
      }
      return (
        <span class="tree-render">
          <span>
            <i class="iconfont icon-folder" style="margin-right: 4px"/>
            {node.label}
          </span>
          <span>
            <el-button v-no-more-click size="small" type="text" on-click={() => this.append(data)} >
              <i class="iconfont icon-addition"></i>
            </el-button>
            <el-button v-no-more-click size="small" type="text" on-click={() => this.modify(node, data)} >
              <i class="iconfont icon-brush"></i>
            </el-button>
            <el-button v-no-more-click size="small" type="text" on-click={() => this.remove(node, data)} >
              <i class="iconfont icon-empty"></i>
            </el-button>
          </span>
        </span>
      );
    },

    teamMemberQuery(teamId) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/team/member_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            id: teamId
          }
        })
        .then(function (res) {
          _self.currentTeam.members = eval(res.data);
        })
        .catch(function (response) {
          _self.$notify.error("查询团队成员时发生程序错误！");
          console.log(response);
        });
    },

    memberQuery() {
      let _self = this;
      commonQuery.memberQueryAll((result) => {
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
        _self.userOptions1 = result.usersFull;
        _self.userOptions2 = result.usersFull;
        if (typeof callback == "function") {
          callback();
        }
      });
    }
  }
};
</script>

<style>
.team-block {
  width: 50%;
  float: left;
  border: 1px solid #e4edf3;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 2px;
}

.team-detail {
  width: 49%;
  padding: 10px;
  float: right;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 2px;
  border: 1px solid #e4edf3;
}

.tree-render {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  font-family: 微软雅黑;
  padding-right: 15px;
}

.tree-view {
  padding: 1px 0;
  overflow-y: auto;
  width: 100%;
}

.tree-view .iconfont {
  font-size: 17px;
}

.tree-view .el-tree-node__expand-icon {
  font-size: 16px;
}

.tree-view .el-tree-node__content {
  height: 30px;
}

.team-infos {
  width: 350px;
}

.team-description textarea {
  height: 100px;
  max-height: 100px;
  margin-bottom: 10px;
  font-size: 15px;
}
</style>
