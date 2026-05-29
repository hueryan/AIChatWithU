<script setup lang="ts">
import {ref, watch} from "vue";

const props = defineProps(['profile'])  // 接受父组件传递的变量
const myProfile = ref(props.profile)

watch(() => props.profile, newVal => {
  myProfile.value = newVal
})

defineExpose({  // 暴漏出来，供父组件使用
  myProfile,
})
</script>

<template>
  <fieldset class="fieldset">
    <label class="label text-base">简介</label>
    <textarea v-model="myProfile" rows="6" class="textarea w-108"></textarea>
  </fieldset>
</template>

<style scoped>

</style>