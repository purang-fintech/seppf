<template>
  <div>
    <el-card>
      <div slot="header">
        <span style="font-size:15px">工作台选项卡选择</span>
      </div>
      <div class="work-label">请选择需要展示的内容</div>
      <div style="padding: 0 30px">
        <el-select v-model="selected" size="small" multiple style="width:90%;margin-bottom:20px;display:inline-block" clearable>
          <el-option v-for="opt in cardList" :label="opt.title" :key="opt.index" :value="opt.index"></el-option>
        </el-select>
        <el-button icon="el-icon-check" type="primary" size="mini" style="float:right" @click="updateWorkbenchPortal()">保存</el-button>
      </div>
      <div class="work-label">已选择选项卡示例（图例卡片中数据非真实数据）</div>
      <div style="padding: 0 2% 0 3%">
        <el-card v-for="(item, cindex) in filteredCards" :key="cindex" class="work-cards">
          <div slot="header">
            <span style="font-size:15px;color:#FFF">{{item.title}}</span>
            <el-link v-for="(btn, bindex) in item.links" :key="bindex" type="primary" style="float:right" :underline="false">{{btn}}</el-link>
          </div>
          <div v-for="(cnt, index) in item.contents" :key="index" class="work-content" :style="{width: 100 / item.contents.length + '%'}">
            <div class="content-name">{{cnt.name}}</div>
            <div style="width:100%;text-align:center">
              <el-link type="primary" class="content-number" :style="{color: cnt.color}" :underline="false">{{cnt.count}}
                <span v-if="cnt.showPercent" style="font-size:15px;font-weight:500">{{cnt.percent}}</span>
              </el-link>
            </div>
            <el-divider direction="vertical" v-if="index > 0" style="height:100px"></el-divider>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      selected: [1, 3, 4, 5, 6, 7],
      cardList: workCards
    };
  },

  computed: {
    filteredCards: function () {
      let selectdCards = [];
      this.cardList.forEach(item => {
        if (item.needed && this.selected.indexOf(item.index) == -1) {
          this.selected.push(item.index);
        }
        if (this.selected.indexOf(item.index) > -1) {
          selectdCards.push(item);
        }
      });
      return selectdCards;
    }
  },

  created() {
    let _self = this;
    _self.selected.splice(0, _self.selected.length);
    if (sessionStorage.portalConfig) {
      sessionStorage.portalConfig.split(",").forEach(d => {
        _self.selected.push(parseInt(d));
      });
    }
  },

  methods: {
    updateWorkbenchPortal() {
      let _self = this;
      _self.$axios.post("/user/setting/update", {
          userId: sessionStorage.userId,
          portalConfig: _self.selected.toString()
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("更新工作台卡片配置成功！");
            sessionStorage.setItem("portalConfig", _self.selected.toString());
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            _self.$message.warning("没有记录被更新！");
          }
        })
    }
  }
};
</script>

<style>
.work-label {
  font-size: 15px;
  font-weight: 600;
  margin: 10px 5px 15px;
}

.work-cards {
  width: 32.18%;
  margin-right: 1%;
  margin-bottom: 1%;
  background-color: #3b434e;
  display: inline-grid;
}

.work-cards .el-link+.el-link {
  margin-right: 10px;
}

.work-cards .el-card__header {
  padding: 12px 20px;
}

.work-cards .el-card__body {
  padding: 0;
}

.work-cards .work-content {
  margin: 30px 0;
  display: inline-block;
}

.work-cards .work-content .content-name {
  text-align: center;
  font-size: 15px;
  color: #FFF;
}

.work-cards .work-content .content-number {
  font-size: 22px;
  font-weight: 600;
  margin-top: 30px;
}

.work-cards .work-content .content-number:hover {
  color: #FFF !important;
}

.work-cards .el-divider--vertical {
  display: block;
  height: 80px;
  margin: -75px 0;
}
</style>
