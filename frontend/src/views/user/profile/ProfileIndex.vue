<script setup lang="ts">

import Photo from "@/views/user/profile/components/Photo.vue";
import Username from "@/views/user/profile/components/Username.vue";
import Profile from "@/views/user/profile/components/Profile.vue";
import {useUserStore} from "@/stores/user.ts";
import {ref, useTemplateRef} from "vue";
import {base64ToFile} from "@/ts/utils/base64_to_file.ts";
import api from "@/ts/http/api.ts";

const user = useUserStore()

const photoRef = useTemplateRef('photo-ref')  // 取出子组件变量
const usernameRef = useTemplateRef('username-ref')
const profileRef = useTemplateRef('profile-ref')

const errorMessage = ref('')

async function handleUpdate() {
  const photo = photoRef.value?.myPhoto
  const username = usernameRef.value?.myUsername.trim()
  const profile = profileRef.value?.myProfile.trim()

  errorMessage.value = ''
  if (!photo) {
    errorMessage.value = '头像不能为空'
  } else if (!username) {
    errorMessage.value = '用户名不能为空'
  } else if (!profile) {
    errorMessage.value = '简介不能为空'
  } else {
    const formDate = new FormData()
    formDate.append('username', username)
    formDate.append('profile', profile)
    if (photo !== user.photo) {
      formDate.append('photo', base64ToFile(photo, 'photo.jpg'))
    }
    try {
      const res = await api.post('/api/user/profile/update/', formDate)
      const data = res.data
      if (data.result === 'success') {
        user.setUserInfo(data)
      } else {
        errorMessage.value = data.result
      }
    } catch (err) {
      console.log(err)
    }
  }
}
</script>

<template>
  <div class="flex justify-center">
    <div class="card w-120 bg-base-200 shadow-sm mt-16">
      <div class="card-body">
        <h3 class="text-lg font-bold my-4">编辑资料</h3>
        <Photo ref="photo-ref" :photo="user.photo"/>  <!-- :photo 给子组件传信息 ref取出子组件变量-->
        <Username ref="username-ref" :username="user.username" />
        <Profile ref="profile-ref" :profile="user.profile" />

        <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

        <div class="flex justify-center">
          <button @click="handleUpdate" class="btn btn-neutral w-60 mt-2">更新</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>