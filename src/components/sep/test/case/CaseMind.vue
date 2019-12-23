<template>
  <div>
    <div class="main-container">
      <header-menu></header-menu>
      <mainEditor :minds="mindText" :currentProd="currentProd" v-if="showMind"></mainEditor>
      <navigator></navigator>
    </div>
  </div>
</template>

<script>
import "codemirror/lib/codemirror.js";
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/css/css.js";
import "codemirror/mode/htmlmixed/htmlmixed.js";
import "codemirror/mode/markdown/markdown.js";
import "codemirror/addon/mode/overlay.js";
import "codemirror/mode/gfm/gfm.js";
import "marked/lib/marked.js";
import "kity/dist/kity.js";
import "@/components/util/minder/script/tool/hotbox.js";
import "kityminder-core/dist/kityminder.core.js";
import "@/components/util/minder/script/expose-editor.js";
import $ from "jquery";

import headerMenu from "@/components/util/minder/pages/header.vue";
import mainEditor from "@/components/util/minder/pages/main_editor/main_editor.vue";
import navigator from "@/components/util/minder/pages/main_editor/navigator.vue";

export default {
  data() {
    return {
      mindText: "",
      showMind: true
    };
  },

  created() {
    this.queryCaseMind();
  },

  methods: {
    queryCaseMind() {
      let _self = this;
      _self.$axios.post("/case/mind_query/" + _self.caseId)
        .then(function (res) {
          _self.mindText = JSON.stringify(res.data);
          _self.showMind = false;
          setTimeout(() => {
            _self.showMind = true;
          }, 200);
        })
    },

    saveCaseMind(mindText) {
      let _self = this;
      _self.$axios.post("/case/mind_save", {
          caseId: _self.caseId,
          mindText: mindText
        })
        .then(function (res) {
          if (res.data > 0) {
            _self.queryCaseMind();
            _self.$message.success("保存成功！");
          }
        })
    }
  },

  components: {
    headerMenu,
    mainEditor,
    navigator
  },

  props: ["caseId", "currentProd"]
};
</script>

<style>
.main-container,
.main-container>div {
  border: 1px solid #e4edf3db;
}
</style>
