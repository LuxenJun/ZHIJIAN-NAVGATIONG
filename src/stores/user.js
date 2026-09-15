import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userGetInfoService } from '@/api/user'

// 用户模块 token setToken removeToken
export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const setToken = (newToken) => {
      token.value = newToken
      console.log('Token已设置：', newToken)

    }

    const removeToken = () => {
      token.value = ''
    }

    const user = ref({})
    const getUser = async () => {
      const res = await userGetInfoService() // 返回的是用户数组
      user.value = res.data[0] ?? {}
    }
    const setUser = (obj) => {
      user.value =obj
    }
    const isRemember = ref(false)

    return {
      token,
      isRemember,
      setToken,
      removeToken,
      user,
      getUser,
      setUser,
    }
  },
  {
    persist: {
      enabled: true,
      key: 'nav-user',
      storage: localStorage, // 显式指定存储方式
      debug: true, // 启用调试模式
    },
  },
)
