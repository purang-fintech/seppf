<template>
  <div class="main-container">
    <header-menu></header-menu>
    <mainEditor></mainEditor>
    <navigator></navigator>
  </div>
</template>

<script>
import headerMenu from "./header.vue";
import mainEditor from "./main_editor/main_editor.vue";
import navigator from "./main_editor/navigator.vue";

export default {
  name: "editor",
  components: {
    headerMenu,
    mainEditor,
    navigator
  }
};
</script>
