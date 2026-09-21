import { defineStore } from 'pinia'
import { ref } from 'vue'
import { navGetListService } from '@/api/nav'
import { useUserStore } from '@/stores/user'

export const useNavStore = defineStore('nav', () => {
  // 搜索相关
  const searchText = ref('')

  const searchType = ref('https://www.baidu.com/s?wd=')
  // 导航总览相关
  const navList = ref([])

  const getnav = async () => {
    const userStore = useUserStore()

    const res = await navGetListService(userStore.user.id)
    navList.value = res ?? []
  }


  return { searchText, searchType, navList, getnav }
})
