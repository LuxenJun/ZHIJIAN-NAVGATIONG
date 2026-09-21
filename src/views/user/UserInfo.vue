<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import defaultimg from '@/assets/default.png'
import avatar from '@/assets/avatar.jpg'
import { ElMessage } from 'element-plus'
import { userUpdateInfoService } from "@/api/user"
const store = useUserStore()

const formRef = ref(null)
const form = ref({
  username: '',
  nickname: ''
})
const editAvatar = ref(false)
const fileinput = ref(null)
const selectedFile = ref(null)
const baseurl = ref('')

// 从 store 同步表单与头像预览（store.user 是唯一数据源）
const syncFromStore = () => {
  form.value.username = store.user.username ?? ''
  form.value.nickname = store.user.nickname ?? ''
  baseurl.value = store.user.avatar ?? ''
}

onMounted(async () => {
  await store.getUser()
  syncFromStore()
  console.log("用户信息", store.user)
})

const rules = ref({

  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
})
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 文件大小限制 2MB
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 2MB')
    // 清空 input，防止再次选择同一文件不触发 change
    e.target.value = ''
    return
  }

  // 校验文件类型：必须是图片
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    e.target.value = ''
    return
  }

  selectedFile.value = file
  console.log(file)

  const reader = new FileReader()
  reader.readAsDataURL(file)
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

  try {
    const res = await userUpdateInfoService({
      id: store.user.id,
      avatar: baseurl.value
    })
    // 接口返回的是更新后的完整用户对象，必须写回 store。
    // 原来这里调的是 store.getUser()，而 getUser 现在是个空函数
    // （后端没有"查用户信息"接口），所以 store 从没更新过 ——
    // 表现为"请求成功了，但页面上的头像没变"。
    if (res) store.setUser({ ...store.user, ...res })

    ElMessage.success('头像更新成功')
    await store.getUser()
    editAvatar.value = false
    baseurl.value = store.user.avatar
    selectedFile.value = null
  } catch (error) {
    console.error('上传头像失败:', error)
    ElMessage.error('头像上传失败，请重试')
  }
}
const submitForm = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return // 校验不通过，表单下方已有错误提示
  }

  const res = await userUpdateInfoService({
    id: store.user.id, ...form.value
  })
  // 同样：用接口返回值刷新 store，顶栏昵称才会跟着变
  await store.getUser()
  if (res) store.setUser({ ...store.user, ...res })

  ElMessage.success('修改成功')
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


<style scoped>
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
