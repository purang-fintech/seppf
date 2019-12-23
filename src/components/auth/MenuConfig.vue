<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item><i class="iconfont icon-auth"></i> 权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>菜单配置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="block" :style="{height: baseHeight + 'px'}">
      <el-tree
        class="tree-view"
        ref="treeNodes"
        :data="menus"
        node-key="id"
        highlight-current
        :auto-expand-parent="true"
        :default-expanded-keys="expanded"
        @node-expand="expandNode"
        @node-collapse="collapseNode"
        @node-click="nodeClick"
        :highlight-current="true"
        :expand-on-click-node="false"><span class="custom-tree-node" slot-scope="{ node, data }"><span>{{ node.label }}</span><span>
            <el-button v-no-more-click size="small" type="text" @click="() => append(data)" v-if="data.id && node.level<4"><i class="iconfont icon-addition"></i></el-button>
            <el-button
              v-no-more-click
              size="small"
              type="text"
              @click="() => remove(node, data)"
              style="color:#EE6F6F"
              v-if="node.level>1"><i class="el-icon-delete"></i></el-button>
          </span></span>
      </el-tree>
    </div>
    <div :style="{height: baseHeight + 'px'}" class="detail">
      <el-form ref="menuDetailForm" :model="menu" label-width="110px">
        <el-form-item label="菜单名" prop="title" :required="menu.level<4">
          <el-input v-model="menu.title" style="width:95%" :disabled="menu.level==4"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon" :required="menu.level==2">
          <el-input v-model="menu.icon" style="width:95%" :disabled="menu.level!=2" placeholder="例如: el-icon-goods"></el-input>
        </el-form-item>
        <el-form-item label="路径" prop="index" required>
          <el-input v-model="menu.index" style="width:95%" placeholder="例如: /request"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds" :required="menu.level==3">
          <el-select
            v-model="menu.roleIds"
            multiple
            clearable
            placeholder="请选择"
            style="width:95%"
            :disabled="menu.level==2||menu.level==4">
            <el-option v-for="role in roleIds" :key="role.roleId" :label="role.roleName" :value="role.roleId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" icon="el-icon-check" @click="checkSaveMenuConfig('menuDetailForm')" style="float:right;margin-right:5%">保存</el-button>
          <el-button type="primary" size="small" icon="el-icon-refresh" @click="resetForm('menuDetailForm')" style="float:right;margin-right:10px">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "MenuConfig",
  data() {
    return {
      menu: {
        icon: "",
        index: "",
        level: "",
        title: "",
        roleIds: "",
        parentId: null,
        type: [],
        resource: "",
        desc: "",
        id: ""
      },
      baseHeight: "",
      expanded: [1],
      roleIds: [],
      menus: [],
      maxIndex: 0
    };
  },

  created() {
    this.baseHeight = bodyAviHeightNTab + 45;
    this.menusConfigs();
    this.userRoles();
  },

  methods: {
    resetForm(name) {
      this.$refs.menuDetailForm.resetFields();
    },

    checkSaveMenuConfig(formName) {
      let _self = this;
      _self.$refs[formName].validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          _self.saveMenuConfig();
        }
      });
    },

    saveMenuConfig() {
      this.$axios
        .post("/menus/configs", {
          menuIcon: this.menu.icon,
          menuIndex: this.menu.index,
          title: this.menu.title,
          roleIds: this.menu.roleIds,
          parentId: this.menu.parentId,
          type: this.menu.type,
          resource: this.menu.resource,
          desc: this.menu.desc,
          id: this.menu.id
        })
        .then(resp => {
          this.$message.success("保存成功");
          this.menusConfigs();
        });
    },

    deleteMenu(node, data) {
      this.$axios.delete("/menus/configs/" + data.id).then(resp => {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.treeNodes.setCurrentNode(parent.data);
          }, 1000);
        });
        this.clearNode();
        this.$message({
          type: "success",
          message: "删除成功"
        });
      });
    },

    nodeClick(data, node, s) {
      this.menu.icon = data.icon;
      this.menu.level = node.level;
      this.menu.index = data.index;
      this.menu.roleIds = data.roleIds;
      this.menu.title = data.label;
      this.menu.parentId = data.parentId;
      this.menu.id = data.id;
    },

    clearNode() {
      this.menu.icon = null;
      this.menu.index = null;
      this.menu.roleIds = null;
      this.menu.title = null;
      this.menu.parentId = null;
      this.menu.id = null;
    },

    expandNode(data, node, s) {
      this.$refs.treeNodes.setCurrentNode(data);
      this.expanded.push(data.id);
    },

    collapseNode(data, node, s) {
      let index = this.expanded.indexOf(data.id);
      if (index > -1) {
        this.expanded.splice(index, 1);
      }
    },

    append(data) {
      let id = data.id;
      let node = this.$refs.treeNodes.getNode(data.id);
      if (node.level > 3) {
        this.$message.warning("最多只支持3级路由！");
        return;
      }
      if (id === 1) {
        this.menu.index = this.maxIndex;
      }
      if (!data.children) {
        this.$set(data, "children", []);
      }
      let indexCode = data.children.length + 1;
      const newChild = {
        label: node.level == 3 ? "子路由页面" + indexCode : "新菜单",
        children: [],
        parentId: id,
        index: node.level == 1 ? this.maxIndex : ""
      };
      data.children.push(newChild);
      if (this.expanded.indexOf(data.id) == -1) {
        this.expanded.push(data.id);
      }
    },

    remove(node, data) {
      if (data.id) {
        this.$confirm("此操作将永久删除该实例, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "error"
          })
          .then(() => {
            this.deleteMenu(node, data);
          })
          .catch(() => {
            this.$message.info("已取消删除");
          });
      } else {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.treeNodes.setCurrentNode(parent.data);
          }, 1000);
        });
        this.clearNode();
      }
    },

    menusConfigs() {
      this.$axios.get("/menus/configs?initValue=0").then(resp => {
        this.menus = resp.data;
        if (this.menus && this.menus[0]) {
          for (let menu of this.menus[0].children) {
            let index = parseInt(menu.index);
            if (index > this.maxIndex) {
              this.maxIndex = index;
            }
          }
          this.maxIndex = this.maxIndex + 1;
        }
      });
    },

    userRoles() {
      this.$axios.get("/user/all-roles").then(resp => {
        this.roleIds = resp.data.concat({
          roleId: -1,
          roleName: "所有人"
        });
      });
    }
  }
};
</script>

<style>
.tree-view .el-tree-node__expand-icon {
  font-size: 15px;
  font-weight: 600;
}

.tree-view .el-tree-node__content {
  height: 30px;
}

.tree-view .el-tree-node.is-current>.el-tree-node__content {
  background-color: #e4e7ed;
}
</style><style scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 15px;
}

.custom-tree-node>span {
  font-size: 15px;
}

.block {
  width: 50%;
  float: left;
  border: 1px solid #e4edf3db;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 2px;
}

.detail {
  width: 49%;
  float: right;
  border: 1px solid #e4edf3db;
  background-color: #f0f8ff40;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 2px;
  padding: 10px;
}

.tree-view {
  padding: 0.05% 0;
  height: 99.9%;
  overflow-y: auto;
  font-size: 13px;
  width: 100%;
  background-color: #f0f8ff40;
}

.tree-view .el-button+.el-button {
  margin-left: 5px !important;
}

.tree-view .iconfont {
  font-size: 17px;
}

.tree-view i {
  font-size: 16px;
}
</style>
