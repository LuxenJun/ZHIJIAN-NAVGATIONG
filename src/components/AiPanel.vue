<script setup>
import { ref } from 'vue'
import { Promotion } from '@element-plus/icons-vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useAiStore } from '@/stores/ai'
import { ElMessage } from 'element-plus'
import { nextTick } from 'vue'
import { debounce } from '@/utils/help'
const aiStore = useAiStore()
const closeAiPanel = () => {
  aiStore.isAipanel = false
}


// const chatview = ref([
//   // {
//   // theprompt: ''
//   // thereply: ''
//   // }
// ])
const aiInput = ref('')
const chatArea = ref(null)

const turnlink = (url) => {
  if (!url) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return url.replace(urlRegex, '<a href="$1" target="_blank" style="color: #409EFF; text-decoration: underline;">$1</a>');
};
// 历史记录

const handleAiSearch = debounce(async () => {
  if (!aiInput.value.trim()) {
    ElMessage.error('请输入你的需求')
    return
  }


  aiStore.historyContent.push({
    id: aiStore.count + 1,
    theprompt: aiInput.value,
    thereply: ''
  })
  aiStore.count++
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
          aiStore.historyContent[aiStore.count].thereply += delta

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

// const historySearch = (prompt, reply) => {
//   aiInput.value = prompt
//   chatview.value.push({
//     theprompt: prompt,
//     thereply: reply
//   })
// }
const scrollhistory = (id) => {
  const item = document.querySelector(`[data-id="${id}"]`)
  if (item) {
    item.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
// }
</script>
<template>
  <div class="ai-panel">
    <div class="title">
      智能导航
    </div>
    <div class="history-popover">
      <el-popover title="历史记录" placement="bottom">
        <div class="history-content">
          <div @click="scrollhistory(item.id)" class="history-item" v-for="(item, index) in aiStore.historyContent"
            :key="index">
            {{ item.theprompt }}

          </div>
        </div>

        <template #reference>
          <el-icon>
            <Memo />
          </el-icon>
        </template>
      </el-popover>
    </div>
    <div class="close" @click="closeAiPanel"> <el-icon>
        <Close />
      </el-icon>
    </div>
    <div class="chat-area" ref="chatArea">
      <div class="main" :data-id="item.id" v-for="(item) in aiStore.historyContent" :key="item.id">
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
  position: relative;
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

/*历史记录*/
.history-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
  /* 按需调整最大宽度 */
  border-bottom: 1px solid #000000;
  margin-bottom: 5px;
  padding-bottom: 5px;
  cursor: pointer;
}

.history-item:hover {
  background-color: #d2d5d8;
}

.history-content {
  padding: 10px;
  height: 100px;
  overflow-y: auto;
}

.history-popover {
  position: absolute;
  top: 13px;
  right: 40px;
}
</style>
