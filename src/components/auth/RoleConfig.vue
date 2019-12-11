<template>
    <div>
        <div class="crumbs">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item>
            <i class="iconfont icon-auth"></i> 权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色配置</el-breadcrumb-item>
        </el-breadcrumb>
        </div>
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>角色清单</span>
                <el-button style="float: right; padding: 3px 0" @click="openRoleDialog" type="text">添加</el-button>
            </div>
            <el-table :data="roles" stripe size="small" :max-height="tableHeight">
                <el-table-column prop="roleId" label="角色ID" width="100" align="center" sortable>
                </el-table-column>
                <el-table-column prop="roleCode" label="角色代码" width="150" align="center" sortable>
                </el-table-column>
                <el-table-column prop="roleName" label="角色名称" width="180" align="center">
                </el-table-column>
                <el-table-column prop="isValid" label="是否有效" width="100" align="center" sortable>
                    <template slot-scope="scope">
                        <div v-if="scope.row.isValid == 'Y'" style="text-align:center">
                            <el-tag type="success">有效</el-tag>
                        </div>
                        <div v-else style="text-align:center">
                            <el-tag type="info">无效</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="updatedDate" label="最后修改时间" width="180" align="center" sortable>
                </el-table-column>
                <el-table-column prop="roleDesc" label="角色描述" header-align="center">
                </el-table-column>
                <el-table-column label="操作" align="center" width="100">
                    <template slot-scope="scope">
                        <el-button icon="el-icon-edit" type="text" class="oper-button" @click="openRoleDialog(scope.row)" style="color:#DEAF6C"></el-button>
                        <el-button icon="el-icon-delete" type="text" class="oper-button" style="color:#EE6F6F" @click="confirmDelete(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="page-set" style="margin: 10px 0">
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-sizes="[10, 20, 50]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="pageInfo.total">
                </el-pagination>
            </div>
        </el-card>

        <!--添加或修改-->
        <el-dialog title="添加角色" :visible.sync="dialogRoleVisible" width="680px">
            <el-form ref="form" :model="role" label-width="100px">
                <el-form-item label="角色代码">
                    <el-input v-model="role.roleCode" style="width:95%"></el-input>
                </el-form-item>
                <el-form-item label="角色名称">
                    <el-input v-model="role.roleName" style="width:95%"></el-input>
                </el-form-item>
                <el-form-item label="角色描述">
                    <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="role.roleDesc" style="width:95%">
                    </el-input>
                </el-form-item>
                <el-form-item label="是否生效">
                    <el-switch v-model="role.isValid"></el-switch>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogRoleVisible = false" type="info" size="small">取 消</el-button>
                <el-button @click="saveRole" type="primary" size="small">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "RoleConfig",
        data() {
            return {
                currentPage: 1,
                pageSize: parseInt(sessionStorage.tablePageSize) || 10,
                pageInfo: {},
                roles: [{
                    roleId: 1,
                    roleCode: 'ADMIN',
                    roleName: '项目管理员',
                    roleDesc: 'hello world'
                }],
                dialogRoleVisible: false,
                role: {
                    id: "",
                    roleDesc: '',
                    roleName: '',
                    roleCode: '',
                    isValid: true
                },
                tableHeight: 0
            }
        },
        
        created() {
            this.tableHeight = bodyAviHeightNTab - 55 - 45;
            this.roleQuery();
        },

        methods: {
            handleSizeChange(val) {
                this.pageSize = val;
                this.roleQuery();
            },

            handleCurrentChange(val) {
                this.currentPage = val;
                this.roleQuery();
            },

            confirmDelete(row){
                this.$confirm("确定要删除当前记录吗?", "操作确认", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "error"
                })
                .then(() => {
                    this.deleteRole(row);
                })
            },

            deleteRole(row) {
                this.$axios.delete("/user/roles/" + row.roleId).then(resp => {
                    this.roleQuery();
                    this.dialogRoleVisible = false;
                })
            },

            roleQuery() {
                this.$axios.get("/user/roles?pageNum=" + this.currentPage + "&pageSize=" + this.pageSize).then(resp => {
                    this.roles = resp.data.list;
                    this.pageInfo = resp.data; 
                })
            },

            saveRole() {
                let isValid = 'N';
                if (this.role.isValid) {
                    isValid = 'Y';
                }
                this.$axios.post("/user/roles", {
                    roleId: this.role.roleId,
                    roleCode: this.role.roleCode,
                    roleName: this.role.roleName,
                    isValid: isValid,
                    roleDesc: this.role.roleDesc
                }).then(resp => {
                    this.roleQuery();
                    this.dialogRoleVisible = false;
                })
            },

            openRoleDialog(row) {
                this.role.roleId = row.roleId;
                this.role.roleDesc = row.roleDesc;
                this.role.roleName = row.roleName;
                this.role.roleCode = row.roleCode;
                if(!row.isValid) {
                    this.role.isValid = true;
                } else {
                    this.role.isValid = row.isValid === 'Y';
                }
                this.dialogRoleVisible = true;
            }
        }
    }
</script>

<style scoped>
.clearfix:before,
.clearfix:after {
    display: table;
    content: "";
}

.clearfix:after {
    clear: both
}

.box-card {
    width: 100%;
}
</style>