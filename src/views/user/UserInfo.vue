<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import defaultimg from '@/assets/default.png'
import avatar from '@/assets/avatar.jpg'
import { ElMessage } from 'element-plus'
import { userUpdateInfoService } from "@/api/user"
const store = useUserStore()
onMounted(async () => {
  await store.getUser()
  console.log("用户信息", store.user)
})
const formRef = ref(null)
const form = ref({
  username: store.user.username,
  nickname: store.user.nickname
})

const rules = ref({

  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
})
const editAvatar = ref(false)
const fileinput = ref(null)
const selectedFile = ref(null)
const baseurl = ref(store.user.avatar)
const handleFileChange = (e) => {
  selectedFile.value = e.target.files[0]
  console.log(selectedFile.value)
  const reader = new FileReader()
  reader.readAsDataURL(selectedFile.value)
  reader.onload = () => {
    baseurl.value = reader.result
  }
}
const cancelAvatar = () => {

  editAvatar.value = false
  baseurl.value = store.user.avatar
  selectedFile.value = null
}
const uploadAvatar = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请选择图片')
    return
  }

  console.log('baseurl.value 长度:', baseurl.value.length)
  console.log('baseurl.value 开头:', baseurl.value.slice(0, 50))

  try {
    const res = await userUpdateInfoService(store.user.id, {
      avatar: baseurl.value
    })
    console.log('接口返回:', res)
    console.log('头像上传成功')

    await store.getUser()
    console.log('重新获取用户信息后的store.user:', store.user)

    ElMessage.success('头像更新成功')
    editAvatar.value = false
    baseurl.value = store.user.avatar
    selectedFile.value = null
  } catch (error) {
    console.error('上传头像失败:', error)
    ElMessage.error('头像上传失败，请重试')
  }
}
const submitForm = async () => {
  await formRef.value.validate()
  await userUpdateInfoService(store.user.id, form.value)
  ElMessage.success('修改成功')
  store.getUser()

}

</script>
<template>
  <el-card>
    <template #header>
      <span>个人信息</span>
    </template>
    <!-- 头像弹出框 -->
    <el-dialog v-model="editAvatar" title="更换头像" width="500" :before-close="cancelAvatar">

      <div class="preview-edit">
        <img :src="baseurl || avatar" alt="图片预览">
      </div>
      <el-button class="submit" type="primary" @click="fileinput.click()">选择图片</el-button>
      <input type="file" ref="fileinput" style="display: none;" @change="handleFileChange">


      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelAvatar">取消</el-button>
          <el-button type="primary" @click="uploadAvatar">
            确认更换
          </el-button>
        </div>
      </template>
    </el-dialog>

    <div class="avatar">
      <div>头像</div>
      <div class="avatar-box" @click="editAvatar = true">
        <el-avatar :size="80" :src="store.user.avatar || defaultimg" />
        <div class="icon">
          <el-icon :size="22">
            <Camera />
          </el-icon>
          <span>更换头像</span>
        </div>
      </div>
    </div>
    <el-form class="theform" :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" disabled />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>
    </el-form>
    <el-button class="submit" type="primary" @click="submitForm">提交修改</el-button>



  </el-card>
</template>


<style>
.theform {
  margin-top: 20px;
  width: 600px;
}

.el-card {
  margin-top: 20px;
  height: 600px;
}

.avatar {
  margin-left: 67px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #606266;
}



.avatar-box {
  position: relative;
  width: 80px;
  height: 80px;
  margin-left: 10px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.icon {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.25s;
}

.avatar-box:hover .icon {
  opacity: 1;
}

.preview-edit img {
  width: 250px;
  height: 250px;
}

.submit {
  margin-top: 20px;
  margin-left: 67px;
}
</style>
