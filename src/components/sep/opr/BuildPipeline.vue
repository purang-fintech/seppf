<template>
  <div v-if="pipelineData.pipelineStep != null">
    <div class="pipeline-steps">
      <el-timeline v-for="stage in pipelineData.pipelineStep.stages" :key="stage.id">
        <div v-if="stage.status == 'FAILED'">
          <el-timeline-item color="#F56C6C" :timestamp="timestampToTime(stage.startTimeMillis)" type="danger" placement="top">
            <el-card style="background-color: rgb(253, 226, 226)">
              <h4>{{stage.name}}</h4>
              <p>耗时{{stage.durationMillis/1000}}(秒)</p>
              <span style="font-size: 15px;color:#EE6F6F">状态：失败</span><br><br>
              <router-link target="_blank" :to="'/buildLog?jobName='+pipelineData.jobName+'&buildVersion='+pipelineData.buildVersion+'&buildStatus='+pipelineData.buildStatus+'&instanceType='+pipelineData.instanceType">
                查看日志
              </router-link>
            </el-card>
          </el-timeline-item>
        </div>
        <div v-else-if="stage.status == 'SUCCESS'">
          <el-timeline-item color="#67C23A" :timestamp="timestampToTime(stage.startTimeMillis)" :type="stage.status" placement="top">
            <el-card style="background-color:rgb(225, 243, 216)">
              <h4>{{stage.name}}</h4>
              <p>耗时{{stage.durationMillis/1000}}(秒)</p>
              <span style="font-size: 15px;color:#6bbd6b">状态：成功</span>
            </el-card>
          </el-timeline-item>
        </div>
        <div v-else-if="stage.status == 'IN_PROGRESS'">
          <el-timeline-item :timestamp="timestampToTime(stage.startTimeMillis)" type="info" placement="top">
            <el-card v-show="show" style="background-color:rgb(224, 229, 239)">
              <h4>{{stage.name}}</h4>
              <p>耗时{{stage.durationMillis/1000}}(秒)</p>
              <span style="font-size: 15px;">状态：构建中</span><i class="el-icon-loading"></i><br><br>
              <router-link target="_blank" :to="'/buildLog?jobName='+pipelineData.jobName+'&buildVersion='+pipelineData.buildVersion+'&buildStatus='+pipelineData.buildStatus+'&instanceType='+pipelineData.instanceType">
                查看日志
              </router-link>
            </el-card>
          </el-timeline-item>
        </div>
        <div v-else>
          <el-timeline-item :timestamp="timestampToTime(stage.startTimeMillis)" type="warning" placement="top">
            <el-card v-show="show" style="background-color:#9CA9C4">
              <h4>{{stage.name}}</h4>
              <p>耗时{{stage.durationMillis/1000}}(秒)</p>
              <span style="color:black;font-size: 15px;">状态：{{stage.status}}</span>
            </el-card>
          </el-timeline-item>
        </div>
      </el-timeline>
    </div>
  </div>
  <div v-else style="height: 100px">
    暂无数据
  </div>
</template>

<script>
  export default {
    name: "BuildPipeline",
    data() {
      return {
        // pipelineStep: {},
        stages: [],
        jobName: "ContinousCompile",
        buildStatus: 'FAILED',
        buildVersion: 4243,
        show: true,
        blockHeight: document.body.clientHeight - 200
      }
    },
    props: {
      pipelineData: {},
    },
    watch: {
      pipelineStep() {
      }
    },
    methods: {
      timestampToTime(timestamp) {
        let date = new Date(timestamp) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
        let Y = date.getFullYear() + '-'
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
        let D = date.getDate() + ' '
        let h = date.getHours() + ':'
        let m = date.getMinutes() + ':'
        let s = date.getSeconds()
        return Y + M + D + h + m + s
      },
    },
    created() {
      if (this.$route.query.jobName && this.$route.query.buildVersion && this.$route.query.buildStatus) {
        this.jobName = this.$route.query.jobName;
        this.buildVersion = this.$route.query.buildVersion;
        this.buildStatus = this.$route.query.buildStatus;
      }
    }
  }
</script>

<style>
  .pipeline-steps .el-timeline .el-timeline-item:last-child .el-timeline-item__tail {
    display: block !important;
  }

  .pipeline-steps .el-timeline:last-child .el-timeline-item .el-timeline-item__tail {
    display: none !important;
  }

  .pipeline-steps {
    max-height: 600px;
    padding: 0 30px;
    overflow-y: auto;
  }
</style>
