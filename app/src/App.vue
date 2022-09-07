<template>
  <div>
    <CCProp name="项目路径：">
      <CCInput readonly>{{ projectPath }}</CCInput>
      <CCButton @click="onSelectProjPath">打开</CCButton>
    </CCProp>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import CCButton from './ui/cc-button/button.vue';
import CCCheckbox from './ui/cc-checkbox/checkbox.vue';
import CCInput from './ui/cc-input/input.vue';
import CCProp from './ui/cc-prop/prop.vue';
import CCSection from './ui/cc-section/section.vue'
import CCSelect from './ui/cc-select/select.vue'
import { Shell, shell, ipcRenderer } from 'electron'
import { dialog } from './core/dialog';

export default defineComponent({
  name: "App",
  components: {
    HelloWorld, CCButton, CCCheckbox, CCInput, CCProp, CCSection, CCSelect,
  },
  setup(props, { emit }) {
    const projectPath = ref()
    return {
      projectPath,
      onSelectProjPath() {
        const ret = dialog.select({ title: '选择项目路径', properties: ['openDirectory'] })
        debugger
        if (ret) {
        }
      }
    }
  }
});
</script>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #171717;
}
</style>
