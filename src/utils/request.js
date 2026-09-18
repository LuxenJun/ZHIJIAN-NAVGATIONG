import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'
const baseURL =
  'http://127.0.0.1:3000'

const instance = axios.create({
  // TODO 1. 基础地址，超时时间
  baseURL,
  timeout: 10000,
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // TODO 2. 携带token
    const useStore = useUserStore()
    if (useStore.token) {
      config.headers.Authorization =
        useStore.token
    }
    return config
  },
  (err) => Promise.reject(err),
)

// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    // 成功时返回完整 axios 响应，业务代码通过 res.data 取数据
    // if (res.data.code === 1) {return res}
    return res
    // ElMessage.error(res.data.message||"服务异常")
    // return Promise.reject(res.data)
  },
  (err) => {
    // TODO 5. 处理401错误

    if (err.response?.status === 401) {
      router.push('/login')
    }

    // 错误的默认情况 => 只要给提示
    ElMessage.error(
      err.response?.data?.message || '请求失败',
    )
    return Promise.reject(err)
  },
)

export default instance
export { baseURL }
