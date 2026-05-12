import {defineStore} from "pinia";
import {ref} from "vue";
import type {UserInfo} from "@/types/user.ts";

export const useUserStore = defineStore('user', () => {
    const id = ref<number>(1)
    const username = ref<string>('yqy')
    const photo = ref<string>('http://127.0.0.1:8000/media/user/photos/default.jpg')
    const profile = ref<string>('111')
    const accessToken = ref<string>('111')

    function isLogin(){
        return !!accessToken.value
    }

    function setAccessToken(token:string | null) {
        accessToken.value = token ?? ''
    }

    function setUserInfo(data:UserInfo) {
        id.value = data.user_id
        username.value = data.username
        photo.value = data.photo
        profile.value = data.profile
    }

    function logout() {
        id.value = 0
        username.value = ''
        photo.value = ''
        profile.value = ''
        accessToken.value = ''
    }

    return {
        id,
        username,
        photo,
        profile,
        accessToken,
        isLogin,
        setAccessToken,
        setUserInfo,
        logout,

    }
})