import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAiStore = defineStore('ai-store', () => {
  const isAipanel = ref(false)
  const count = ref(-1)
  const historyContent = ref([
    // {
    //   id: 1,
    //   theprompt: 提示词
    //   thereply: 回复
    // }
  ])

  return { historyContent,isAipanel,count }
},
  {
    persist: {
      enabled: true,
      key: 'ai-store',
      storage: localStorage, // 显式指定存储方式
      debug: true, // 启用调试模式
    },
  },
)
