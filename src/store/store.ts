// Pinia 替代 Zustand
import { defineStore } from 'pinia';
import { User, MessageData } from '@/types';

export const useMainStore = defineStore('main', {
  state: () => ({
    user: null as User | null,
    messageData: [] as MessageData[]
  }),
  actions: {
    setUser(user: User) {
      this.user = user;
    },
    setMessageData(data: MessageData[]) {
      this.messageData = data;
    }
  }
});