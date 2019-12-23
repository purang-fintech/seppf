<template>
  <div>
    <el-form
      :model="prodfrom"
      size="small"
      :inline="false"
      :rules="prodfromRules"
      ref="ruledForm"
      label-width="110px"
      class="product-form">
      <el-form-item label="产品编号" required prop="productCode">
        <el-input v-model="prodfrom.productCode" placeholder="产品编号" :minlength="3" :maxlength="20"></el-input>
      </el-form-item>
      <el-form-item label="负责人" required prop="owner">
        <el-select
          v-model="prodfrom.owner"
          placeholder="请选择负责人"
          filterable
          clearable
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
      <el-form-item label="是否有效" prop="isValid">
        <el-select v-model="prodfrom.isValid" disabled>
          <el-option v-for="opt in isValid" :value="opt" :key="opt" :label="opt"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品名称" required prop="productName">
        <el-input v-model="prodfrom.productName" placeholder="产品名称" class="summary" :maxlength="40" :minlength="3"></el-input>
      </el-form-item>
      <el-form-item label="产品描述" prop="productDesc">
        <el-input v-model="prodfrom.productDesc" type="textarea" :rows="10" :maxlength="2000" show-word-limit></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import commonQuery from "@/components/util/CommonQuery.vue";
export default {
  data: function () {
    return {
      isValid: ["Y", "N"],
      memberFull: [],
      userOptions: [],
      prodfrom: {
        productCode: "",
        productName: "",
        productDesc: "",
        owner: "",
        isValid: "Y"
      },
      prodfromRules: {
        owner: [{
          required: true,
          message: "请选择负责人",
          trigger: "change"
        }],
        productCode: [{
            required: true,
            message: "请输入产品代码",
            trigger: "blur"
          },
          {
            min: 3,
            max: 15,
            message: "长度在 3 到 15 个字",
            trigger: "blur"
          }
        ],
        productName: [{
            required: true,
            message: "请输入工作产品名称",
            trigger: "blur"
          },
          {
            min: 3,
            max: 50,
            message: "长度在 3 到 50 个字",
            trigger: "blur"
          }
        ]
      },
    };
  },

  created() {
    this.memberQuery();
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

    checkProductCreate() {
      let _self = this;
      _self.$refs.ruledForm.validate(valid => {
        if (!valid) {
          _self.$notify.error("表单校验不通过，无法提交");
          return;
        } else {
          let reg = /^[a-zA-Z-]{3,15}$/;
          if (!reg.test(_self.prodfrom.productCode)) {
            _self.$message.warning("产品编码只可输入字母和横线！");
            _self.prodfrom.productCode = "";
            return;
          }
          _self.checkExists((count) => {
            if (count > 0) {
              _self.$message.warning("产品编码或名称已存在，不可重复！");
              return;
            } else {
              _self.productCreate();
            }
          });
        }
      });
    },

    checkExists(callback) {
      let _self = this;
      _self.$axios({
          method: "post",
          url: "/product/exists",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            productCode: _self.prodfrom.productCode,
            productName: _self.prodfrom.productName
          }
        })
        .then(function (res) {
          if (typeof callback == "function") {
            callback(res.data);
          }
        })
    },

    productCreate() {
      let _self = this;
      _self.$axios.post("/product/create", {
          productCode: _self.prodfrom.productCode.toUpperCase(),
          productName: _self.prodfrom.productName,
          owner: _self.prodfrom.owner,
          productDesc: _self.prodfrom.productDesc
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.$message.success("创建产品/项目成功，您是项目管理员！");
            let userProducts = [];
            let userPrivs = localStorage.getItem("userProducts");
            // 登录确认之前，直接重新加载
            if (commonQuery.isNull(userPrivs) || eval(JSON.parse(userPrivs)).length == 0) {
              setTimeout(() => {
                window.location.reload();
              }, 500);
              return;
            }
            eval(JSON.parse(userPrivs)).forEach(item => {
              userProducts.push({
                productId: item.productId,
                roles: item.roles,
                roleNames: item.roleNames,
                productName: item.productName,
                productCode: item.productCode
              });
            });
            userProducts.push({
              productId: res.data,
              roles: 0,
              roleNames: ['项目管理员'],
              productName: _self.prodfrom.productName,
              productCode: _self.prodfrom.productCode
            });
            localStorage.setItem("userProducts", JSON.stringify(userProducts));
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            _self.$message.warning("创建产品/项目失败！");
            console.log(response);
          }
        })
    },

    memberQuery() {
      let _self = this;
      commonQuery.memberQueryAll((result) => {
        _self.memberFull = result.usersFull;
        _self.userOptions = result.usersFull;
      });
    }
  }
};
</script>

<style>
.product-form .el-form-item__content>.el-input,
.product-form .el-form-item__content>.el-select,
.product-form .el-form-item__content>.el-textarea {
  width: 98%;
}

.product-form .el-form-item__content>.el-input input,
.product-form .el-form-item__content>.el-select input {
  width: 100%;
}
</style>
