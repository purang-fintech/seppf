<template>
  <div>
    <el-tooltip content="如无本产品权限则无法操作" placement="right" effect="dark">
      <el-button v-no-more-click type="primary" 
        size="mini" 
        class="el-icon-refresh" 
        @click="queryCaseStep(caseId)" 
        style="margin-bottom:10px"> 刷新</el-button>
    </el-tooltip>
    <el-table :data="tableData" class="tb-edit" size="small"  highlight-current-row stripe :border="showBorder"
      :max-height="tableHeight" @current-change="handleCurrentChange" ref="dymTable" >
        <el-table-column prop="stepId" type="index" label="序号" width="50" align="center">
        </el-table-column>
        <el-table-column label="调序" width="50" align="center">
          <template slot-scope="scope">
            <el-button v-no-more-click 
              v-show="scope.$index>0" 
              size="mini" 
              class="iconfont icon-arrowup move" 
              circle 
              @click="indexUp(scope.$index, scope.row)" 
              :disabled="operDisabled()">
            </el-button>
            <el-button v-no-more-click 
              v-show="scope.$index < tableData.length - 1" 
              size="mini" 
              class="iconfont icon-arrowdown move" 
              circle 
              @click="indexDown(scope.$index, scope.row)" 
              :disabled="operDisabled()">
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作描述" min-width="30%" header-align="center">
          <template slot-scope="scope">
            <el-input size="mini" type="textarea" resize="none" :rows="3" v-model="scope.row.operation" :maxlength="500" show-word-limit @change="handleEdit(scope.$index, scope.row)"></el-input>
            <span>{{scope.row.operation}}</span>
          </template>
        </el-table-column>
        <el-table-column label="输入数据" min-width="20%" header-align="center">
          <template slot-scope="scope">
            <el-input size="mini" type="textarea" resize="none" :rows="3" v-model="scope.row.inputData" :maxlength="500" show-word-limit @change="handleEdit(scope.$index, scope.row)"></el-input>
            <span>{{scope.row.inputData}}</span>
          </template>
        </el-table-column>
        <el-table-column label="预期结果" min-width="30%" header-align="center">
          <template slot-scope="scope">
            <el-input size="mini" type="textarea" resize="none" :rows="3" v-model="scope.row.expectResult" :maxlength="500" show-word-limit @change="handleEdit(scope.$index, scope.row)"></el-input>
            <span>{{scope.row.expectResult}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70" align="center">
          <template slot-scope="scope">
            <el-button v-no-more-click size="mini" type="danger" icon="el-icon-close" circle @click="deleteRow(scope.$index, scope.row)" :disabled="operDisabled()"></el-button>
            <el-button v-no-more-click size="mini" type="success" icon="el-icon-check" circle  @click="addRow(scope.$index, scope.row)" :disabled="operDisabled()"></el-button>
          </template>
        </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      tableData: [
        {
          operation: "",
          inputData: "",
          expectResult: ""
        }
      ],
      baseHeight: "",
      tableHeight: ""
    };
  },

  created() {
    this.tableHeight = bodyAviHeightTab - 40;
    this.queryCaseStep(this.caseId, 0);
  },

  methods: {
    handleCurrentChange(val) {
    },

    handleEdit(index, row) {
    },

    indexUp(index) {
      if (index === 0) {
        return;
      }
      this.transIndex(this.tableData, index, index - 1);
    },

    indexDown(index) {
      if (index === this.tableData.length - 1) {
        return;
      }
      this.transIndex(this.tableData, index, index + 1);
    },

    transIndex(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
      for (let i = 0; i < arr.length; i ++) {
        this.$set(arr[i], "stepId", i + 1);
      }
      this.caseStepUpdate(this.caseId, arr);
    },

    operDisabled(){
      return parseInt(this.currentProd) != parseInt(sessionStorage.productId);
    },

    deleteRow(index, row) {
      let _self =  this;
      if (!row.stepId) {
        _self.$message.info("当前行为空行，无需删除");
        return;
      }
      _self.$axios.post( "/case/step_delete/" + _self.caseId + "/" + row.stepId)
      .then(function(res) {
        if (res.data === 1) {
          _self.tableData.splice(index, 1);
          _self.$message.success("删除成功");
        }
        _self.queryCaseStep(_self.caseId, index + 1);
      })
    },

    addRow(index, rowData) {
      if (null === rowData.operation || rowData.operation.length < 1){
        this.$notify.error("操作描述不能为空！");
        return;
      }
      if (null === rowData.expectResult || rowData.expectResult.length < 1){
        this.$notify.error("预期结果不能为空！");
        return;
      }
      if (this.tableData.length == index + 1) {
        var d = {
          operation: "请输入",
          inputData: "请输入",
          expectResult: "请输入"
        };
        this.tableData.push(d);
        setTimeout(() => {
          this.$refs.dymTable.setCurrentRow(d);
        }, 100);
      } else {
        setTimeout(() => {
          this.$refs.dymTable.setCurrentRow(null);
        }, 100);
      }
      this.saveCaseStep(this.caseId, index + 1, rowData);
    },

    queryCaseStep(caseId, index){
      let _self =  this;
      _self.$axios.post("/case/step_query/" + caseId)
      .then(function(res) {
        _self.tableData = eval(res.data);
        if (_self.tableData.length === 0){
          var d = {
            operation: "",
            inputData: "",
            expectResult: ""
          };
          _self.tableData.push(d);
          setTimeout(() => {
            _self.$refs.dymTable.setCurrentRow(d);
          }, 100);
        } else if (_self.tableData.length === index){
          var d = {
            operation: "",
            inputData: "",
            expectResult: ""
          };
          _self.tableData.push(d);
          setTimeout(() => {
            _self.$refs.dymTable.setCurrentRow(d);
          }, 100);
        }
      })
    },

    caseStepUpdate(caseId, steps){
      let _self =  this;
      _self.$axios.post("/case/step_update", {
        steps : JSON.stringify(steps)
      })
      .then(function(res) {
        if (res.data == 0) {
          _self.$message.success("测试步骤调整顺序失败！");
        } else {
          _self.queryCaseStep(caseId, 0);
        }
      })
    },

    saveCaseStep(caseId, stepId, datas){
      let _self =  this;
      _self.$axios.post("/case/step_save", {
        "caseId" : caseId,
        "stepId" : stepId,
        "operation" : datas.operation,
        "inputData" : null == datas.inputData || datas.inputData == "" ? "无" : datas.inputData,
        "expectResult" : datas.expectResult
      })
      .then(function(res) {
        if (res.data === 1) {
          _self.$message.success("保存成功");
        }
        _self.queryCaseStep(caseId, stepId);
      })
    }
  },
  props: ["caseId", "currentProd"]
};
</script>

<style>
.tb-edit .el-textarea {
  display: none;
  width: 100%;
}

.tb-edit .el-textarea>textarea{
  padding: 5px 10px;
}

.tb-edit .el-textarea>span{
  bottom: 2px;
  right: 10px;
}

.tb-edit .current-row .el-textarea {
  display: inherit !important;
}

.tb-edit .current-row .el-textarea + span {
  display: none !important;
}

.tb-edit .cell .is-circle {
  padding: 5px;
}

.tb-edit .cell .el-button + .el-button {
  margin: 0 !important;
}

.tb-edit th {
  background-color: #e4edf3 !important;
  color: #000;
}

.tb-edit .move {
  cursor:pointer;
  font-size:12px;
  padding: 0 !important;
  background-color: transparent;
  border: none;
  margin-right: -4px;
}
</style>
