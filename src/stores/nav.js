import { defineStore } from 'pinia'
import { ref } from 'vue'
import { navGetCategoryService, navGetListService } from '@/api/nav'

export const useNavStore = defineStore('nav', () => {
  // 搜索相关
  const searchText = ref('')
  const searchType = ref('百度')
  // 导航总览相关
  const navCategory = ref([])
const navList = ref([])

  const getnav=async ()=>{
      const res = await navGetListService()
    navList.value = res.data
  }
  const getCategory=async ()=>{
    const res = await navGetCategoryService()
    navCategory.value = res.data
  }
  const isAipanel =ref(false)
  return { searchText, searchType, navList, navCategory,getnav,getCategory,isAipanel }
})
