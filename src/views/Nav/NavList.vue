<script setup>
import { ref } from 'vue'
import { useNavStore } from '@/stores/nav'
import { ElMessage, ElMessageBox } from 'element-plus'
import { navAddCategoryService, navDeleteCategoryService, navAddLinkService, navDeleteLinkService } from '@/api/nav'
import { useUserStore } from '@/stores/user'
import { onMounted } from 'vue'
import { debounce } from '@/utils/help'
import { useAiStore } from '@/stores/ai'
const aiStore = useAiStore()

// import AiPanel from '@/components/AiPanel.vue'
const userStore = useUserStore()
const navStore = useNavStore()
onMounted(() => {
  Promise.all([
    userStore.getUser(),
    navStore.getnav(),
    navStore.getCategory(),
    aiStore.isAipanel = false
  ])
})
const categorybox = ref(false)
const newcategory = ref('')
const Delcategory = ref('')
const cancelcategory = () => {
  categorybox.value = false
  newcategory.value = ''
}
const updatecategory = debounce(async () => {
  if (!newcategory.value && !Delcategory.value) {
    ElMessage.error('请选择修改操作')
    return
  }
  // 传接口
  if (newcategory.value) {
    await navAddCategoryService({ name: newcategory.value })
  }

  if (Delcategory.value) {
    await navDeleteCategoryService(Delcategory.value)

  }
  ElMessage.success('修改分类成功')

  await navStore.getCategory()

  console.log(newcategory.value)
  categorybox.value = false
  newcategory.value = ''
  Delcategory.value = ''
}, 500)
const linkbox = ref(false)
const linkForm = ref({
  name: '',
  url: '',
  description: '',
  categoryId: ''
})
const linkRules = ref({
  name: [{ required: true, message: '请输入链接名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入链接URL', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
})
const linkFormRef = ref(null)
const cancellink = () => {
  linkForm.value = {
    name: '',
    url: '',
    description: '',
    categoryId: ''
  }
  linkbox.value = false
}
const addlink = debounce(async () => {
  linkFormRef.value.validate(async (valid) => {
    if (valid) {
      // 传接口
      await navAddLinkService(linkForm.value)
      ElMessage.success('添加链接成功')
      await navStore.getnav()

      console.log(linkForm.value)
      linkbox.value = false
      linkForm.value = {
        name: '',
        url: '',
        description: '',
        categoryId: ''
      }
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}, 500)
// 跳转链接
const handleClick = (linkItem) => {
  window.open(linkItem.url, '_blank')
}

// 删除导航
const delLink = async (id) => {
  await ElMessageBox.confirm('确认删除该链接吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  await navDeleteLinkService(id)
  ElMessage.success('删除链接成功')
  await navStore.getnav()
}


</script>
<template>
  <div>
    <!-- 弹出框 -->
    <Teleport to="body">
      <div class="AiPanel" v-if="aiStore.isAipanel">
        <AiPanel></AiPanel>
      </div>
    </Teleport>

    <el-dialog v-model="categorybox" title="修改分类" width="500" :before-close="cancelcategory">

      <el-form-item label="添加名称" prop="name">
        <el-input v-model="newcategory" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="删除分类" prop="id">
        <el-select v-model="Delcategory" placeholder="请选择删除分类" style="width: 100%">
          <el-option v-for="item in navStore.navCategory" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <template #footer>

        <div class="dialog-footer">
          <el-button @click="cancelcategory">取消</el-button>
          <el-button type="primary" @click="updatecategory">
            确认修改
          </el-button>
        </div>
      </template>
    </el-dialog>


    <el-dialog v-model="linkbox" title="添加链接" width="500" :before-close="cancellink">
      <el-form :model="linkForm" ref="linkFormRef" :rules="linkRules" label-width="120px">
        <el-form-item label="链接名称" prop="name">
          <el-input v-model="linkForm.name" placeholder="请输入链接名称" />
        </el-form-item>
        <el-form-item label="链接描述" prop="description">
          <el-input v-model="linkForm.description" placeholder="请输入链接描述" />
        </el-form-item>
        <el-form-item label="链接URL" prop="url">
          <el-input v-model="linkForm.url" placeholder="请输入链接URL" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="linkForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in navStore.navCategory" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>

        <div class="dialog-footer">
          <el-button @click="cancellink">取消</el-button>
          <el-button type="primary" @click="addlink">
            确认添加
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-card>
      <template #header>
        <div class="header">
          <span>导航总览</span>
          <!-- 添加el-button -->
          <div class="operate">
            <el-button type="primary" @click="aiStore.isAipanel = true">AI推荐</el-button>
            <el-button type="primary" @click="categorybox = true">修改分类</el-button>
            <!-- 添加el-button -->
            <el-button type="primary" @click="linkbox = true">添加链接</el-button>
          </div>
        </div>
      </template>
      <div v-for="item in navStore.navCategory" :key="item.id">
        <h3>{{ item.name }}</h3>
        <div class="link-container">
          <div @click="handleClick(linkItem)"
            v-for="linkItem in navStore.navList.filter(link => link.categoryId == item.id)" :key="linkItem.id">
            <div class="link-item">
              <div class="name"> {{ linkItem.name }}</div>
              <div class="description"> {{ linkItem.description }}</div>
              <div class="delclose" @click.stop="delLink(linkItem.id)"><el-icon>
                  <Close />
                </el-icon></div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>


<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.operate {
  display: flex;
  gap: 10px;
}

.link-container {

  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.link-item {
  position: relative;
  background: radial-gradient(circle at 0% 0%, 70%);
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.35s ease;
}

.link-item:hover {
  background: radial-gradient(circle at 100% 100%, #3498db1a, #9b59b61a 70%);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.25);
}

.name {
  padding: 5px 5px;
  font-size: 16px;
  font-weight: bold;
}

.description {

  font-size: 12px;
}

.delclose {

  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 16px;
  cursor: pointer;
  opacity: 0;
}

.link-item:hover .delclose {
  opacity: 1;
}

.delclose:hover {
  color: #ff4d4f;
}


.AiPanel {
  position: absolute;
  top: 100px;
  right: 20px;
}
</style>
