<template>
  <div id="root" class="root">
    <div class="crumbs">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>
          <i class="iconfont icon-mine"></i> 个人中心</el-breadcrumb-item>
        <el-breadcrumb-item>操作历史</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="his-lists">
      <el-tag class="his-class" type="success" size="small">
        <i class="iconfont icon-mine_fill"> 我操作的（最近30天）</i>
      </el-tag>
      <div class="his-area" :style="{height: formHeight + 35 + 'px'}">
        <div style="overflow-y:auto" :style="{height: formHeight + 'px'}">
          <div>
            <el-steps direction="vertical" space="67px">
              <el-step 
                v-for="(item, i) in direct.directHitory" 
                :key="i" 
                :title="item.operTime" 
                :description="item.operComment" 
                status="success">
              </el-step>
            </el-steps>
          </div>
        </div>
        <div class="page-setting">
          <el-pagination 
            @size-change="handleSizeChangeDirect" 
            @current-change="handleCurrentChangeDirect" 
            :current-page="direct.currentPage" 
            :page-sizes="[10, 20, 50, 100, 200]" 
            :page-size="direct.pageSize" 
            layout="total, sizes, prev, pager, next, jumper" 
            :total="direct.pageInfo.total">
          </el-pagination>
        </div>
      </div>
    </div>

    <div class="his-lists">
      <el-tag class="his-class" type="warning" size="small">
        <i class="iconfont icon-request"> 与我相关的（最近30天）</i>
      </el-tag>
      <div class="his-area" :style="{height: formHeight + 35 + 'px'}">
        <div style="overflow-y:auto" :style="{height: formHeight + 'px'}">
          <div>
            <el-steps direction="vertical" space="67px">
              <el-step 
                v-for="(item, i) in refer.referHistory" 
                :key="i" 
                :title="item.operTime" 
                :description="item.operComment" 
                status="finish">
              </el-step>
            </el-steps>
          </div>
        </div>
        <div class="page-setting">
          <el-pagination 
            @size-change="handleSizeChangeRefer" 
            @current-change="handleCurrentChangeRefer" 
            :current-page="refer.currentPage" 
            :page-sizes="[10, 20, 50, 100, 200]" 
            :page-size="refer.pageSize" 
            layout="total, sizes, prev, pager, next, jumper" 
            :total="refer.pageInfo.total">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
let versions = [];
export default {
  data: function() {
    return {
      formHeight: bodyAviHeightNTab - 75,
      direct: {
        currentPage: 1,
        pageSize: 10,
        pageInfo: {},
        directHitory: []
      },
      refer: {
        currentPage: 1,
        pageSize: 10,
        pageInfo: {},
        referHistory: []
      }
    }
  },

  created() { 
    let _self =  this;
    _self.historyDirectQuery();
    _self.historyReferQuery();
  },

  methods: {
    handleCurrentChangeDirect(current) {
      this.direct.currentPage = current;
      this.historyDirectQuery();
    },

    handleSizeChangeDirect(size) {
      this.direct.pageSize = size;
      this.historyDirectQuery();
    },

    handleCurrentChangeRefer(current) {
      this.refer.currentPage = current;
      this.historyReferQuery();
    },

    handleSizeChangeRefer(size) {
      this.refer.pageSize = size;
      this.historyReferQuery();
    },

    historyReferQuery(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/mgr/refer",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            pageNum: _self.refer.currentPage,
            pageSize: _self.refer.pageSize
          }
        })
        .then(function(res) {
          _self.refer.referHistory = eval(res.data.list);
          _self.refer.pageInfo = res.data;
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },

    historyDirectQuery(){
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/mgr/direct",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            pageNum: _self.direct.currentPage,
            pageSize: _self.direct.pageSize
          }
        })
        .then(function(res) {
          _self.direct.directHitory = eval(res.data.list);
          _self.direct.pageInfo = res.data;
        })
        .catch(function(response) {
          _self.$notify.error("发生错误");
          console.log(response);
        });
    },
  }
};
</script>

<style>
.his-lists {
  display: inline-block;
  width: 49.5%;
}

.his-class {
  text-align: center;
  color: #000;
  width: 100%;
  height: 30px;
  line-height: 30px;
  margin-bottom: 10px;
}

.his-class * {
  font-size: 16px;
}

.his-area {
  display: inline-block;
  width: 94.5%;
  border: 1px solid #e4edf3;
  border-radius: 2px;
  padding: 4% 1% 10px 4%;
  background-color: rgba(200,200,200,0.1);
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}

.page-setting{
  margin-top: 10px;
  float: right;
}

.page-setting * {
  height: 24px !important;
  line-height: 24px !important;
  font-size: 12px !important;
  margin: 0;
}

.page-setting .el-pagination__sizes .el-input {
  width: 90px;
}

.page-setting .el-pager li {
  min-width: 25px;
}

.page-setting .el-pagination__jump {
  margin-left: 10px;
}
</style>
