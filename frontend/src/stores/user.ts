import {defineStore} from "pinia";
import {ref} from "vue";
import type {UserInfo} from "@/types/user.ts";

export const useUserStore = defineStore('user', () => {
    const id = ref<number>(0)
    const username = ref<string>('')
    const photo = ref<string>('')
    const profile = ref<string>('')
    const accessToken = ref<string>('')

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