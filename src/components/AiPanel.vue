<script setup>
import { ref } from 'vue'
import { Promotion } from '@element-plus/icons-vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useNavStore } from '@/stores/nav'
import { ElMessage } from 'element-plus'
import { nextTick } from 'vue'
import { debounce } from '@/utils/help'
const navStore = useNavStore()
const closeAiPanel = () => {
  navStore.isAipanel = false
}
const count = ref(-1)

const chatHistory = ref([
  // {
  // theprompt: ''
  // thereply: ''
  // }
])
const aiInput = ref('')
const chatArea = ref(null)
// const loading = ref(true)   // 加载状态

// 在 <script setup> 中添加这个函数
const turnlink = (url) => {
  if (!url) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return url.replace(urlRegex, '<a href="$1" target="_blank" style="color: #409EFF; text-decoration: underline;">$1</a>');
};
const handleAiSearch = debounce(async () => {
  if (!aiInput.value.trim()) {
    ElMessage.error('请输入你的需求')
    return
  }


  chatHistory.value.push({
    theprompt: aiInput.value,
    thereply: ''
  })
  count.value++
  // loading.value = true
  const prompt = `
你是一个导航站助手。用户会描述他需要的网站功能，你需要从大数据中，推荐最匹配的 3 个网站，且输出网站的链接网址，并解释为什么推荐。

用户需求：${aiInput.value}

请直接返回推荐结果，格式：
1. 网站名 - 网站链接 - 推荐理由 <br><hr>
2. 网站名 - 网站链接 - 推荐理由 <br><hr>
3. 网站名 - 网站链接 - 推荐理由 <br>
`
  try {
    await fetchEventSource('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-7e2a7349efbc4bd9ab4e77a49cef6775`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        stream: true
      }),
      onmessage(msg) {
        if (msg.data === '[DONE]') return
        const data = JSON.parse(msg.data)
        const delta = data.choices[0].delta.content
        if (delta) {
          chatHistory.value[count.value].thereply += delta

        }


        nextTick(() => {
          chatArea.value.scrollTop = chatArea.value.scrollHeight
        })
      },
      onerror(err) {
        console.error('请求出错:', err)
        throw err
      }
    })
  } catch {
    ElMessage.error('AI 请求失败')
  } finally {
    aiInput.value = ''
  }
}, 500)


</script>
<template>
  <div class="ai-panel">
    <div class="title">
      智能导航
    </div>
    <div class="close" @click="closeAiPanel"> <el-icon>
        <Close />
      </el-icon>
    </div>
    <div class="chat-area" ref="chatArea">
      <div class="main" v-for="(item, index) in chatHistory" :key="index">
        <div class="show-prompt">
          {{ item.theprompt }}
        </div>
        <div class="show-reply" v-html="turnlink(item.thereply)">
        </div>
      </div>
    </div>
    <div class="prompt">
      <el-input @keyup.enter="handleAiSearch" v-model="aiInput" type="textarea" :autosize="{ minRows: 3, maxRows: 4 }"
        placeholder="描述你需要的网站功能，比如：我想要一个能在线写代码、支持多人协作、界面简洁的工具" resize="none" />
      <el-button class="send-btn" type="primary" :icon="Promotion" @click="handleAiSearch" />
    </div>
  </div>

</template>


<style scoped>
.ai-panel {

  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  width: 550px;
  height: 550px;
  background-color: #ededed;
  border: 1px solid #878282;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #000000;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  font-weight: bold;
  color: #000000;
}

.prompt {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
}

.send-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.close:hover {
  color: #ff0000;
  cursor: pointer;
  transform: scale(1.1);
  transition: all 0.3s ease-in-out;
}

.chat-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 110px;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.show-prompt {
  align-self: flex-end;
  background: #91b8e0;
  color: #000000;
  padding: 10px 14px;
  border-radius: 10px 10px 0 10px;
  font-size: 14px;
  width: fit-content;
}

.show-reply {
  align-self: flex-start;
  background: #fff;
  color: #303133;
  padding: 10px 14px;
  border-radius: 10px 10px 10px 0;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #ebeef5;
}
</style>
