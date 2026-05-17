/*
 * 功能：
 * 1. 请求时自动携带 access token
 * 2. access token 过期后自动刷新
 * 3. 刷新成功后自动重发原请求
 * 4. refresh token 失效则退出登录
 * 5. 支持并发请求队列，避免重复刷新 token
 */

import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
} from "axios"

import { useUserStore } from "@/stores/user"

const BASE_URL = "http://127.0.0.1:8000"

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

/**
 * 扩展请求配置
 */
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

/**
 * refresh token 返回数据类型
 */
interface RefreshResponse {
    access: string
}

/**
 * 请求拦截器
 * 自动携带 access token
 */
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const user = useUserStore()

        if (user.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`
        }

        return config
    }
)

/**
 * 是否正在刷新 token
 */
let isRefreshing = false

/**
 * 刷新完成后的订阅队列
 */
type RefreshCallback = (
    token?: string,
    error?: unknown
) => void

let refreshSubscribers: RefreshCallback[] = []

/**
 * 添加订阅
 */
function subscribeTokenRefresh(callback: RefreshCallback) {
    refreshSubscribers.push(callback)
}

/**
 * 刷新成功
 */
function onRefreshed(token: string) {
    refreshSubscribers.forEach(cb => cb(token))
    refreshSubscribers = []
}

/**
 * 刷新失败
 */
function onRefreshFailed(error: unknown) {
    refreshSubscribers.forEach(cb => cb(undefined, error))
    refreshSubscribers = []
}

/**
 * 响应拦截器
 */
api.interceptors.response.use(
    response => response,

    async (error: AxiosError) => {
        const user = useUserStore()

        const originalRequest =
            error.config as CustomAxiosRequestConfig

        if (!originalRequest) {
            return Promise.reject(error)
        }

        /**
         * access token 过期
         */
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/refresh_token/")
        ) {
            originalRequest._retry = true

            return new Promise((resolve, reject) => {

                /**
                 * 当前请求进入等待队列
                 */
                subscribeTokenRefresh((token, err) => {

                    if (err || !token) {
                        reject(
                            err ??
                            new Error("Token refresh failed")
                        )
                        return
                    }

                    originalRequest.headers.Authorization =
                        `Bearer ${token}`

                    resolve(api(originalRequest))
                })

                /**
                 * 只允许一个 refresh 请求
                 */
                if (!isRefreshing) {

                    isRefreshing = true

                    axios.post<RefreshResponse>(
                        `${BASE_URL}/api/user/account/refresh_token/`,
                        {},
                        {
                            withCredentials: true,
                            timeout: 5000,
                        }
                    )
                    .then(res => {

                        const newAccessToken =
                            res.data.access

                        /**
                         * 更新 pinia 中的 token
                         */
                        user.setAccessToken(
                            newAccessToken
                        )

                        /**
                         * 唤醒队列
                         */
                        onRefreshed(newAccessToken)
                    })
                    .catch(refreshError => {

                        /**
                         * refresh token 失效
                         */
                        user.logout()

                        /**
                         * 队列全部失败
                         */
                        onRefreshFailed(refreshError)
                    })
                    .finally(() => {
                        isRefreshing = false
                    })
                }
            })
        }

        return Promise.reject(error)
    }
)

export default api