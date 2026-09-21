<script setup>
import { nextTick, reactive, ref } from 'vue'
import { Promotion } from '@element-plus/icons-vue'
import { useAiStore } from '@/stores/ai'
import { ElMessage } from 'element-plus'
import { debounce } from '@/utils/help'
import { navRecommendService } from '@/api/nav'
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
const loading = ref(false)

// 后端返回的是纯文本，约定只允许 <br> / <hr> 两个标签。
// 先整体转义，再把白名单标签放回来，最后把网址变成可点的 <a>，
// 这样既保留了换行/分隔线，又不会让模型返回的 <img onerror=...> 之类被执行。
const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const turnlink = (text) => {
  if (typeof text !== 'string' || !text) return ''
  return escapeHtml(text)
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
    .replace(/&lt;hr\s*\/?&gt;/gi, '<hr>')
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #409EFF; text-decoration: underline;">$1</a>',
    )
};
// 历史记录

const handleAiSearch = debounce(async () => {
  if (loading.value) return
  const promptText = aiInput.value.trim()
  if (!promptText) {
    ElMessage.error('请输入你的需求')
    return
  }

  // 直接持有这条新记录的引用，后面按引用写回。
  // 原来用 historyContent[aiStore.count] 按下标反查，count 一旦和数组不同步就会写错位置甚至报错。
  // 注意必须是 reactive 对象：push 原始对象后直接改原引用不会触发视图更新
  const record = reactive({
    id: Date.now(),
    theprompt: promptText,
    thereply: ''
  })
  aiStore.historyContent.push(record)
  aiInput.value = ''
  loading.value = true
  const prompt = `
你是一个导航站助手。用户会描述他需要的网站功能，你需要从大数据中，推荐最匹配的 3 个网站，且输出网站的链接网址，并解释为什么推荐。

用户需求：${promptText}

请直接返回推荐结果，格式：
1. 网站名 - 网站链接 - 推荐理由 <br><hr>
2. 网站名 - 网站链接 - 推荐理由 <br><hr>
3. 网站名 - 网站链接 - 推荐理由 <br>
`
  try {
    // await fetchEventSource('https://api.deepseek.com/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': 'Bearer <你的Key，切勿写进代码/提交到仓库>'
    //   },
    //   body: JSON.stringify({
    //     model: 'deepseek-chat',
    //     messages: [{ role: 'user', content: prompt }],
    //     stream: true
    //   }),
    //   onmessage(msg) {
    //     if (msg.data === '[DONE]') return
    //     const data = JSON.parse(msg.data)
    //     const delta = data.choices[0].delta.content
    //     if (delta) {
    //       aiStore.historyContent[aiStore.count].thereply += delta

    //     }


    //     nextTick(() => {
    //       chatArea.value.scrollTop = chatArea.value.scrollHeight
    //     })
    //   },
    //   onerror(err) {
    //     console.error('请求出错:', err)
    //     throw err
    //   }
    // })
    // 响应拦截器已经拆过包：这里拿到的就是后端的 data（纯文本字符串），
    // 所以不能再判 res.code，也不能再取 res.data —— 否则 thereply 永远是空串，气泡一片空白
    const reply = await navRecommendService(prompt)
    record.thereply = typeof reply === 'string' ? reply : String(reply ?? '')
  } catch (err) {
    // 拦截器（utils/request.js）内部已经弹过错误提示，这里不再重复弹 toast，只把失败写进气泡
    console.error('AI 请求出错:', err)
    record.thereply = '抱歉，AI 服务暂时不可用，请稍后重试。'
  } finally {
    loading.value = false
    nextTick(() => {
      if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight
    })
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
      <el-button class="send-btn" type="primary" :icon="Promotion" :loading="loading" @click="handleAiSearch" />
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
