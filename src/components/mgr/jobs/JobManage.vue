<template>
    <div>
        <div class="crumbs">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item>
            <i class="iconfont icon-tech"></i> 基础设施</el-breadcrumb-item>
            <el-breadcrumb-item>任务管理</el-breadcrumb-item>
        </el-breadcrumb>
        </div>
        <el-card>
            <div slot="header">
                <span>定时任务清单</span>
                <el-button style="float: right; padding: 3px 0" @click="beginCreate()" type="text">添加任务</el-button>
                <el-button style="float: right; padding: 3px 0;margin-right:10px" @click="jobQuery" type="text">刷新</el-button>
            </div>
            <el-table :data="jobs" stripe size="small">
                <el-table-column prop="groupName" label="任务组名" width="150" align="center" sortable>
                </el-table-column>
                <el-table-column prop="jobName" label="任务名" width="150" align="center" sortable>
                </el-table-column>
                <el-table-column prop="description" label="任务描述" min-width="30%" align="center">
                </el-table-column>
                <el-table-column prop="className" label="任务类名" min-width="50%" header-align="center">
                </el-table-column>
                <el-table-column prop="cron" label="CRON表达式" width="200" align="center" sortable>
                </el-table-column>
                <el-table-column prop="status" label="任务状态" width="100" align="center" sortable>
                </el-table-column>
                <el-table-column label="操作" align="center" width="110">
                    <template slot-scope="scope">
                        <el-button icon="el-icon-video-play" type="text" class="oper-button" @click="runJob(scope.row)" style="color:#6BBD6B"></el-button>
                        <el-button icon="el-icon-video-pause" type="text" class="oper-button" @click="pauseJob(scope.row)" style="color:#3AB4D7"></el-button>
                        <el-button icon="el-icon-edit" type="text" class="oper-button" @click="beginEdit(scope.row)" style="color:#DEAF6C"></el-button>
                        <el-button icon="el-icon-delete" type="text" class="oper-button" style="color:#EE6F6F" @click="confirmDelete(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog title="添加任务" :visible.sync="dialogJobVisible" width="680px">
            <el-form ref="formNew" :model="job" :rules="formRules" :inline="false" label-width="110px" size="small">
                <el-form-item label="任务组名" required prop="groupName">
                    <el-input v-model="job.groupName" style="width:95%" clearable></el-input>
                </el-form-item>
                <el-form-item label="任务名" required prop="jobName">
                    <el-input v-model="job.jobName" style="width:95%" clearable></el-input>
                </el-form-item>
                <el-form-item label="任务描述" required prop="description">
                    <el-input v-model="job.description" style="width:95%" clearable></el-input>
                </el-form-item>
                <el-form-item label="任务类名" required prop="className">
                    <el-input v-model="job.className" style="width:95%" placeholder="如：com.pr.sepp.quartz.BusinessJob" clearable></el-input>
                </el-form-item>
                <el-form-item label="CRON表达式" required prop="cron">
                    <el-input v-model="job.cron" style="width:95%" placeholder="如：0 0/5 * * * ?" clearable></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogJobVisible=false" type="info" size="small" icon="el-icon-close">取消</el-button>
                <el-button @click="checkCreateJob('formNew')" type="primary" size="small" icon="el-icon-check">确定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="修改任务" :visible.sync="dialogJobVisibleMod" width="680px">
            <el-form ref="formMod" :model="currentJob" :rules="formRules" :inline="false" label-width="110px" size="small">
                <el-form-item label="任务组名" required prop="groupName">
                    <el-input v-model="currentJob.groupName" style="width:95%" clearable disabled></el-input>
                </el-form-item>
                <el-form-item label="任务名" required prop="jobName">
                    <el-input v-model="currentJob.jobName" style="width:95%" clearable disabled></el-input>
                </el-form-item>
                <el-form-item label="任务描述" required prop="description">
                    <el-input v-model="currentJob.description" style="width:95%" clearable disabled></el-input>
                </el-form-item>
                <el-form-item label="任务类名" required prop="className">
                    <el-input v-model="currentJob.className" style="width:95%" placeholder="如：com.sepp.quartz.BusinessJob" clearable disabled></el-input>
                </el-form-item>
                <el-form-item label="CRON表达式" required prop="cron">
                    <el-input v-model="currentJob.cron" style="width:95%" placeholder="如：0 0/5 * * * ?" clearable></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogJobVisibleMod=false" type="info" size="small" icon="el-icon-close">取消</el-button>
                <el-button @click="checkEditJob('formMod')" type="primary" size="small" icon="el-icon-check">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "JobConfig",
        data() {
            return {
                jobs: [],
                dialogJobVisible: false,
                dialogJobVisibleMod: false,
                job: {
                    className: "",
                    description: '',
                    jobName: '',
                    groupName: '',
                    cron: ""
                },
                currentJob: {},
                formRules: {
                    groupName: [
                        { required: true, message: "请输入任务组名", trigger: "blur" },
                        { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
                    ],
                    jobName: [
                        { required: true, message: "请输入人物名称", trigger: "blur" },
                        { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }],
                    description: [
                        { required: true, message: "请输入任务描述", trigger: "blur" },
                        { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
                    ],
                    className: [{ required: true, message: "请输入任务类名", trigger: "blur" }],
                    cron: [{ required: true, message: "请输入定时任务表达式", trigger: "blur" }]
                }
            }
        },
        
        created() {
            this.jobQuery();
        },

        methods: {
            checkEditJob(formName) {
                let _self =  this;
                _self.$refs[formName].validate(valid => {
                    if (!valid) {
                        _self.$notify.error("表单校验不通过，无法提交");
                        return;
                    } else {
                        _self.editJob();
                    }
                });
            },

            checkCreateJob(formName) {
                let _self =  this;
                _self.$refs[formName].validate(valid => {
                    if (!valid) {
                        _self.$notify.error("表单校验不通过，无法提交");
                        return;
                    } else {
                        _self.createJob();
                    }
                });
            },

            confirmDelete(row){
                this.$confirm("确定要删除当前记录吗?", "操作确认", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "error"
                })
                .then(() => {
                    this.deleteJob(row);
                })
            },

            deleteJob(row) {
                this.$axios.post("/job/delete", {
                    jobName: row.jobName,
                    groupName: row.groupName
                }).then(resp => {
                    let result = resp.data;
                    this.$message({
                        type: result.indexOf("成功") > -1 ? "success" : "warning",
                        message: result
                    });
                    this.jobQuery();
                })
            },

            jobQuery() {
                this.$axios.post("/job/list").then(resp => {
                    this.jobs = resp.data;
                })
            },

            createJob() {
                this.$axios.post("/job/create", {
                    jobName: this.job.jobName,
                    groupName: this.job.groupName,
                    description: this.job.description,
                    className: this.job.className,
                    cron: this.job.cron
                }).then(resp => {
                    let result = resp.data;
                    if (result.indexOf("成功") > -1) {
                        this.$message.success(result);    
                        this.jobQuery();
                        this.dialogJobVisible = false;
                    } else {
                        this.$message.warning(result);    
                    }
                })
            },

            editJob() {
                this.$axios.post("/job/edit", {
                    jobName: this.currentJob.jobName,
                    groupName: this.currentJob.groupName,
                    description: this.currentJob.description,
                    className: this.currentJob.className,
                    cron: this.currentJob.cron
                }).then(resp => {
                    let result = resp.data;
                    if (result.indexOf("成功") > -1) {
                        this.$message.success(result);    
                        this.jobQuery();
                        this.dialogJobVisibleMod = false;
                    } else {
                        this.$message.warning(result);    
                    }
                })
            },

            runJob(row) {
                this.$axios.post("/job/run", {
                    jobName: row.jobName,
                    groupName: row.groupName
                }).then(resp => {
                    let result = resp.data;
                    this.$message({
                        type: result.indexOf("成功") > -1 ? "success" : "warning",
                        message: result
                    });
                    this.jobQuery();
                })
            },

            pauseJob(row) {
                this.$axios.post("/job/pause", {
                    jobName: row.jobName,
                    groupName: row.groupName
                }).then(resp => {
                    let result = resp.data;
                    this.$message({
                        type: result.indexOf("成功") > -1 ? "success" : "warning",
                        message: result
                    });
                    this.jobQuery();
                })
            },

            beginCreate() {
                this.job.groupName = "";
                this.job.jobName = "";
                this.job.description = "";
                this.job.className = "";
                this.job.cron = "";
                this.dialogJobVisible = true;
            },

            beginEdit(row) {
                this.currentJob = row;
                this.dialogJobVisibleMod = true;
            }
        }
    }
</script>

<style scoped>
.oper-button {
    font-size: 18px;
}
</style>