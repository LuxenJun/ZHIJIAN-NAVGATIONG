<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { userUpdateInfoService } from '@/api/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = ref({
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认新密码', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (value !== form.value.newPassword) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
  }]
})
const formRef = ref(null)
const submitForm = async () => {
  await formRef.value.validate()
  await userUpdateInfoService(userStore.user.id, {
    password: form.value.newPassword
  })
  form.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  ElMessage.success('密码修改成功')
  userStore.getUser()
}
</script>
<template>
  <div>

    <el-card>
      <template #header>
        <span>修改密码</span>
      </template>
      <div class="password-form">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input v-model="form.oldPassword" type="password" placeholder="请输入旧密码" />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码" />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="请确认新密码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm">修改密码</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>


<style scoped></style>
