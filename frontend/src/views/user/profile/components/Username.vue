<script setup lang="ts">
import {ref, watch} from "vue";

const props = defineProps(['username'])  // 接受父组件传递的变量
const myUsername = ref(props.username)

// watch 监听传过来的username，当变化时及时更新myUsername
watch(() => props.username, newVal => {
  myUsername.value = newVal
})

defineExpose({  // 暴漏出来，供父组件使用
  myUsername,
})
</script>

<template>
  <fieldset class="fieldset">
    <label class="label text-base">用户名</label>
    <input v-model="myUsername" type="text" class="input w-108">
  </fieldset>
</template>

<style scoped>

</style>