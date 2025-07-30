// @/composables/useChatLogic.ts
import {Ref, ref} from 'vue';
import type { Message, User } from '@/types';

export function useChatLogic(store: any, user: Ref<User | null>, messageData: Ref<any[]>, messageList: Ref<Message[]>) {
    // 添加标记防止循环更新
    const isUpdating = ref(false);

    // 处理消息数据更新
    const handleSetMessageData = (message: Message[]) => {
        if (isUpdating.value || !user.value) return;

        isUpdating.value = true;
        try {
            const index = messageData.value.findIndex((e: any) => e.name === user.value!.name);
            const newMessageData = [...messageData.value];

            if (index === -1) {
                newMessageData.push({
                    name: user.value.name,
                    message,
                });
            } else {
                // 仅在数据不同时更新
                if (JSON.stringify(newMessageData[index].message) !== JSON.stringify(message)) {
                    newMessageData[index] = {
                        name: user.value.name,
                        message,
                    };
                } else {
                    return; // 数据相同则不更新
                }
            }

            store.setMessageData(newMessageData);
        } finally {
            isUpdating.value = false;
        }
    };

    return {
        handleSetMessageData
    };
}