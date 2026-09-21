import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'
// Vite 代理模式下，baseURL 设为空，请求会走同源 + proxy
const baseURL = ''

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
    if (useStore.user.id) {
      config.headers.Authorization =
        useStore.user.id
    }
    return config
  },
  (err) => Promise.reject(err),
)

// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    // 业务成功：只把后端的 data 部分交给调用方（res 直接就是业务数据）
    if (res.data.code === 200) {
      return res.data.data
    }
    // 业务失败：必须 reject，否则调用方拿到 undefined 后继续执行会抛 TypeError，
    // 表现为"点击按钮没反应"。这里统一提示后中断。
    ElMessage.error(res.data.msg || '服务异常')
    return Promise.reject(res.data)
  },
  (err) => {
    // TODO 5. 处理401错误

    if (err.response?.status === 401) {
      router.push('/login')
    }

    // 错误的默认情况 => 只要给提示
    ElMessage.error(
      err.response?.data?.msg || '请求失败',
    )
    return Promise.reject(err)
  },
)

export default instance
export { baseURL }
