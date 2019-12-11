<template lang="html">
  <div class="mind-editor">
    <el-button type="primary" size="mini" icon="iconfont icon-save" style="position:absolute;top:10px;left:10px" @click="saveMind()" :disabled="!editable">保存</el-button>
    <el-dropdown size="mini" split-button type="primary" style="position:absolute;top:10px;left:90px" @command="handleCommand">
      导出
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="json">JSON</el-dropdown-item>
        <el-dropdown-item command="png">PNG</el-dropdown-item>
        <el-dropdown-item command="svg">SVG</el-dropdown-item>
        <el-dropdown-item command="plain">TextTree</el-dropdown-item>
        <el-dropdown-item command="markdown">Markdown</el-dropdown-item>
        <el-dropdown-item command="freemind">FreeMind</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from "vuex";
import { exportPNGImage } from "../../script/protocol/png"
import { exportSVG } from "../../script/protocol/svg"
import { exportJson } from "../../script/protocol/json"
import { exportTextTree } from "../../script/protocol/plain"
import { exportMarkdown } from "../../script/protocol/markdown"
import { exportFreeMind } from "../../script/protocol/freemind"

export default {
  data() {
    return {
      mindText: "",
      editable: true
    };
  },

  created() {
    this.editable = this.currentProd == sessionStorage.productId;
  },

  mounted() {
    var Editor = require("../../script/editor");
    var el = this.$el;
    var editor = (window.editor = new Editor(el));
    this.setEditor(editor);

    if (this.minds) {
      this.mindText = JSON.parse(this.minds);
      editor.minder.importJson(this.mindText);
      window.localStorage.mindText = this.minds;
    } else if (window.localStorage.mindText) {
      editor.minder.importJson(JSON.parse(window.localStorage.mindText));
      this.mindText = JSON.parse(window.localStorage.mindText);
    }

    editor.minder.on("contentchange", function() {
      window.localStorage.mindText = JSON.stringify(editor.minder.exportJson());
    });

    editor.minder.execCommand("camera", editor.minder.getRoot(), 600);

    window.minder = window.km = editor.minder;
    this.setMinder(editor.minder);
    this.executeCallback();
  },

  computed: {
    ...mapGetters(["minder"])
  },

  methods: {
    ...mapActions(["executeCallback"]),

    ...mapMutations(["setMinder", "setEditor"]),

    handleCommand(cmd){
      if (cmd == "json") {
        exportJson(editor.minder);
      } else if (cmd == "png") {
        exportPNGImage(editor.minder);
      } else if (cmd == "svg") {
        exportSVG(editor.minder);
      } else if (cmd == "plain") {
        exportTextTree(editor.minder);
      } else if (cmd == "markdown") {
        exportMarkdown(editor.minder);
      } else if (cmd == "freemind") {
        exportFreeMind(editor.minder);
      }
    },

    saveMind(){
      this.$parent.saveCaseMind(JSON.stringify(editor.minder.exportJson()));
    }
  },

  props: ["minds", "currentProd"]
};
</script>

<style lang="scss">
@import "@/assets/style/minder/editor.scss";
</style>
