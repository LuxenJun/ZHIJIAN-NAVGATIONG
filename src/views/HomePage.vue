<script setup>
import { useNavStore } from '@/stores/nav'
import { Search, User, EditPen, SwitchButton } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
// import { ElMessage } from 'element-plus'
// import { ref } from 'vue'
import { debounce } from '@/utils/help'



import { useUserStore } from '@/stores/user'
const router = useRouter()

const userStore = useUserStore()
const navStore = useNavStore()

import avatar from "../assets/default.png"

const handleCommand = async (key) => {
  if (key === 'logout') {
    // 退出操作
    await ElMessageBox.confirm('你确认要进行退出么', '温馨提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })

    // 清除本地的数据 (token + user信息)
    userStore.removeToken()
    userStore.setUser({})

    router.push('/login')
  } else {
    // 跳转操作
    router.push(`/user/${key}`)
  }
}
// 搜索框功能
const restaurants = computed(() => navStore.navList)
// const isEmpty = computed(() => restaurants.value.length === 0)
// const isEmpty = ref(true)

const navSearch = debounce(() => {
  if (!navStore.searchText) {
    ElMessage.error("请输入搜索内容")
    return
  }
  window.open(navStore.searchType + navStore.searchText)
}, 500)

const querySearch = (queryString, cb) => {


  const results = queryString
    ? restaurants.value.filter(createFilter(queryString))
    : restaurants.value


  cb(results)

}
const createFilter = (queryString) => {
  return (restaurant) => {
    return (
      restaurant.name.toLowerCase().includes(queryString.toLowerCase())
    )
  }
}
const handleSelect = (item) => {
  navStore.searchText = ''
  if (!item.url) return


  window.open(item.url, '_blank')
}

</script>
<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside class="side" width="200px">

      <div class="logo">
        <!-- <el-icon>
          <Help />
        </el-icon> Nav -->
        <img src="../assets/logo-bro.png" alt="">
      </div>
      <el-menu active-text-color="#ffd04b" background-color="#edf1f1" :default-active="$route.path" text-color="#000000"
        router>
        <el-menu-item index="/NavList">
          <span>导航总览</span>

        </el-menu-item>
        <el-sub-menu index="user">
          <template #title>
            <span>个人中心</span>
          </template>
          <el-menu-item index="/user/Info">
            <span>个人信息</span>
          </el-menu-item>

          <el-menu-item index="/user/Password">
            <span>修改密码</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="Nav">
        <!-- 导航搜索和头像 -->
        <div class="search-bar">
          <el-select v-model="navStore.searchType" style="width: 120px">
            <el-option label="百度" value="https://www.baidu.com/s?wd=" />
            <el-option label="Google" value="https://www.google.com/search?q=" />
            <el-option label="Github" value="https://github.com/search?q=" />
            <el-option label="Bing" value="https://www.bing.com/search?q=" />
          </el-select>
          <!-- <div class="suggestion-empty" v-show="isEmpty"> -->
          <!-- <img class="sanyue" src="../assets/209be03fc18f0c1b679f9acde1e97e75.png"> -->
          <!-- <div class="bubble-1"></div> -->
          <!-- <div class="bubble-2"></div> -->
          <!-- <div class="bubble"> -->
          <!-- <span>站内无匹配,试试enter吧</span> -->
          <!-- </div> -->
          <!-- </div> -->
          <el-autocomplete @keyup.enter="navSearch" :trigger-on-focus="false" value-key="name"
            v-model="navStore.searchText" :fetch-suggestions="querySearch" clearable class="w-50" placeholder="请输入搜索内容"
            @select="handleSelect" />
          <el-button type="primary" :icon="Search" @click="navSearch" />
        </div>

        <!-- 头像 -->
        <div class="header-avatar">
          <span>昵称：{{ userStore.user.nickname || userStore.user.username }}</span>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown__box">
              <el-avatar :src="userStore.user.avatar || avatar" />
              <el-icon>
                <CaretBottom />
              </el-icon>
            </span>

            <!-- 折叠的下拉部分 -->
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="Info" :icon="User">个人信息</el-dropdown-item>
                <!-- <el-dropdown-item command="Avatar" :icon="Crop">更换头像</el-dropdown-item> -->
                <el-dropdown-item command="Password" :icon="EditPen">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main>
        <!-- 主体内容 -->

        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>


<style scoped>
.layout {
  height: 100vh;
}

.side {
  height: 100%;
  background-color: #edf1f1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #000000;

  padding: 12px 20px;
  border-radius: 8px;
  letter-spacing: 2px;
}

.Nav {
  margin-top: 20px;
  margin-left: 100px;
  margin-right: 20px;
  display: flex;

  gap: 10px;
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-bar {

  position: relative;

  display: flex;
  gap: 0;
  flex: 1;
  max-width: 600px;
}

.header-avatar {

  display: flex;
  align-items: center;
  /* 垂直居中 */
  gap: 12px
}

.el-dropdown,
.el-dropdown__box {
  outline: none !important;
}

.suggestion-empty {
  position: absolute;
  width: 200px;
  height: 70px;
  top: -61px;
  left: 90px;

  text-align: center;
}

.bubble {
  position: absolute;
  bottom: 15px;
  left: 20px;
  width: 200px;
  height: 20px;
  border-radius: 10px;
  background-color: #fff5f5f5;
}


/*
.sanyue {
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 30px;
  height: 30px;
  margin-right: 5px;
}


.bubble-1 {
  position: absolute;
  bottom: 28px;
  left: 40px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #fff5f5f5;
  background-color: #d56666;
  background-color: #0da6fb;
}

.bubble-2 {
  position: absolute;
  bottom: 34px;
  left: 47px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #fff5f5f5;
  background-color: #d56666;
  background-color: #0da6fb;
}*/
</style>
