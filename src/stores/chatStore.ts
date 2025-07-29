import { defineStore } from 'pinia'

// 消息类型定义
export interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: string
}

export const useChatStore = defineStore('chat', {
    state: () => ({
        chatHistory: [] as Message[]
    }),
    actions: {
        // 添加消息到历史
        addMessage(message: Message) {
            this.chatHistory.push(message)
            // 保存到本地存储
            this.saveToLocalStorage()
        },

        // 清除聊天历史
        clearChat() {
            this.chatHistory = []
            localStorage.removeItem('chatHistory')
        },

        // 从本地存储加载历史
        loadFromLocalStorage() {
            const savedHistory = localStorage.getItem('chatHistory')
            if (savedHistory) {
                try {
                    this.chatHistory = JSON.parse(savedHistory)
                } catch (error) {
                    console.error('Failed to load chat history:', error)
                    this.chatHistory = []
                }
            }
        },

        // 保存到本地存储
        saveToLocalStorage() {
            localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory))
        }
    },
    getters: {
        // 获取聊天历史
        getChatHistory(): Message[] {
            return this.chatHistory
        }
    }
})