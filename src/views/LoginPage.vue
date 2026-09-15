<script setup>
import { ref, reactive } from 'vue'
import { Back } from '@element-plus/icons-vue'
import {
  userRegisterService,
  userLoginService,
} from '@/api/user'
import { useUserStore } from '@/stores/user'
import { watch, onMounted } from 'vue'
import router from '@/router'
import { ElMessage } from 'element-plus'

onMounted(() => {
  if (store.isRemember) {
    ruleForm.value.username = localStorage.getItem('remember_username')
  }
})
const store = useUserStore()
const form = ref()
const isRegister = ref(false)
const ruleForm = ref({
  username: '',
  password: '',
  repassword: '',
})
const rules = reactive({
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur',
    },
    {
      pattern: /^[A-Za-z0-9]{1,10}$/,
      message: '用户名为1-10位大小写字母和数字',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur',
    },
    {
      pattern: /^\S{6,15}$/,
      message: '密码为6-15位非空格字符',
      trigger: 'blur',
    },
  ],
  repassword: [
    {
      required: true,
      message: '请确认密码',
      trigger: 'blur',
    },
    {
      validator: (rule, value, callback) => {
        if (value !== ruleForm.value.password) {
          callback(
            new Error('两次输入密码不一致'),
          )
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})
// 表单校验，数据提交并赋值，建立token，提示用户，跳转页面
const isloading = ref(false)
const register = async () => {

  await form.value.validate()
  isloading.value = true
  await userRegisterService(ruleForm.value)
  ElMessage.success('注册成功')
  isloading.value = false
  isRegister.value = false
}
const submitForm = async () => {
  await form.value.validate()
  isloading.value = true
  // 返回的是匹配到的用户数组，查到即登录成功
  //接口逻辑-----------------------------------------------------------------------------------------token
  const res = await userLoginService(ruleForm.value)
  if (res.length === 0) {
    ElMessage.error('用户名或密码错误')
    return
  }
  isloading.value = false

  if (store.isRemember) {
    localStorage.setItem('remember_username', ruleForm.value.username)
  } else {
    localStorage.removeItem('remember_username')
  }
  store.setToken(1)
  ElMessage.success('登录成功,欢迎回来')
  router.push('/NavList')
}

watch(isRegister, () => {
  ruleForm.value = {
    username: '',
    password: '',
    repassword: '',
  }
})
</script>
<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <el-form size="large" ref="form" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto">
        <div v-if="isRegister">
          <h1 class="title">注册</h1>
          <el-form-item label="用户名" prop="username">
            <el-input prefix-icon="User" v-model="ruleForm.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input prefix-icon="Lock" v-model="ruleForm.password" type="password" />
          </el-form-item>
          <el-form-item label="确认密码" prop="repassword">
            <el-input prefix-icon="Lock" v-model="ruleForm.repassword" type="password" />
          </el-form-item>
          <el-form-item>
            <el-button class="button" :loading="isloading" type="primary" @click="register">注册</el-button>
          </el-form-item>
          <el-form-item>
            <span @click="isRegister = false" class="tab"><el-icon>
                <Back />
              </el-icon>返回登陆</span>
          </el-form-item>
        </div>
        <div v-else>
          <h1 class="title">登陆</h1>
          <el-form-item label="用户名" prop="username">
            <el-input prefix-icon="User" v-model="ruleForm.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input prefix-icon="Lock" v-model="ruleForm.password" type="password" />
          </el-form-item>
          <el-form-item>
            <el-button class="button" :loading="isloading" type="primary" @click="submitForm">登陆</el-button>
          </el-form-item>
          <el-form-item class="flex">
            <div class="flex">
              <el-checkbox v-model="store.isRemember" label="记住我" />
              <el-link underline="never" type="primary" href="#" class="forget">忘记密码？</el-link>
            </div>
          </el-form-item>
          <el-form-item>
            <span @click="isRegister = true" class="tab"><el-icon>
                <Back />
              </el-icon>返回注册</span>
          </el-form-item>
        </div>
      </el-form>
    </el-col>
  </el-row>
</template>
<style scoped>
.login-page {
  height: 100vh;
  background-color: #fff;

  .bg {
    background:

      url('@/assets/屏幕截图.png') no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;

    .tab {
      font-size: 12px;
      cursor: pointer;
      color: #75777a;
    }

    .button {
      width: 100%;
    }

    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
