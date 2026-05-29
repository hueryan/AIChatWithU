<script setup lang="ts">
import {nextTick, onBeforeUnmount, ref, useTemplateRef, watch} from "vue";
import CameraIcon from "@/views/user/profile/components/icon/CameraIcon.vue";
import Croppie from 'croppie'
import 'croppie/croppie.css'

const props = defineProps(['photo'])  // 接收父组件传递的变量
const myPhoto = ref(props.photo)
const previewImage = ref('')


watch(() => props.photo, newVal => {
  myPhoto.value = newVal
})

const fileInputRef = useTemplateRef<HTMLInputElement>('file-input-ref')
const modalRef = useTemplateRef<HTMLDialogElement>('modal-ref')
const croppieRef = useTemplateRef<HTMLDivElement>('croppie-ref')
let croppie: Croppie | null = null

async function openModal(photo: string) {
  previewImage.value = photo
  modalRef.value?.showModal()
  await nextTick()

  if (!croppie && croppieRef.value) {
    croppie = new Croppie(croppieRef.value, {
      viewport: {width: 200, height: 200, type: 'square'},
      boundary: {width: 300, height: 300},
      enableOrientation: true,
      enforceBoundary: true,
    })
  }

  if (!croppie) return

  await croppie.bind({
    url: photo,
  })
}

async function crop() {
  if(!croppie) return

  myPhoto.value = await croppie.result({
    type: 'base64',
    size: 'viewport',
  })

  modalRef.value?.close()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement

  const file = target.files?.[0]

  // 允许重复选择同一文件
  target.value = ''
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      openModal(reader.result)
    }
  }

  reader.readAsDataURL(file)
}

onBeforeUnmount(() => {
  croppie?.destroy()
})

defineExpose({  // 暴漏出来，供父组件使用
  myPhoto,
})
</script>

<template>
  <div class="flex justify-center">
    <div class="avatar relative">
      <div class="w-28 rounded-full">
        <img :src="myPhoto" alt="">
      </div>
      <div @click="fileInputRef?.click()" class="absolute left-0 top-0 w-28 h-28 flex justify-center items-center bg-black/20 rounded-full cursor-pointer">
        <CameraIcon />
      </div>
    </div>
  </div>
  <input ref="file-input-ref" type="file" accept="image/*" class="hidden" @change="onFileChange">

  <dialog ref="modal-ref" class="modal">
    <div class="modal-box transition-none">
      <button @click="modalRef?.close()" class="btn btn-circle btn-sm btn-ghost absolute right-2 top-2">✕</button>
      <div ref="croppie-ref" class="flex flex-col justify-center my-4"></div>

      <div class="modal-action">
        <button @click="modalRef?.close()" class="btn">取消</button>
        <button @click="crop" class="btn btn-neutral">确定</button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>

</style>