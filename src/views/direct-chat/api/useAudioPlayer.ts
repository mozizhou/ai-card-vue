// @/composables/useAudioPlayer.ts
import { Ref } from 'vue';
import type { Message, User } from '@/types';

export function useAudioPlayer(audio: Ref<HTMLAudioElement | null>, messageList: Ref<Message[]>) {
    // 处理语音播放
    const togglePlay = async (
        message: Message,
        index: number,
        user: User | null,
        token: string,
        directMode: boolean
    ) => {
        // 先暂停当前播放
        if (audio.value) {
            audio.value.pause();
        }

        // 更新所有消息的语音状态
        messageList.value = messageList.value.map(data => {
            if (data.id === message.id) {
                return { ...data, voiceType: 1 };
            }
            if (data.voiceType === 2) {
                return { ...data, voiceType: 0 };
            }
            return data;
        });

        try {
            if (!user) throw new Error('未选择用户');

            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: token,
                    text: message.content,
                    id: user.id,
                    direct_mode: directMode,
                }),
            });

            if (!response.ok) throw new Error(`语音生成失败: ${response.status}`);

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            audio.value = new Audio(audioUrl);
            await audio.value.play();

            // 更新为播放状态
            messageList.value = messageList.value.map(data =>
                data.id === message.id ? { ...data, voiceType: 2 } : data
            );

            // 播放结束处理
            audio.value.addEventListener('ended', () => {
                messageList.value = messageList.value.map(data =>
                    data.id === message.id ? { ...data, voiceType: 0 } : data
                );
            });
        } catch (error) {
            console.error('语音播放失败:', error);
            // 出错时重置状态
            messageList.value = messageList.value.map(data =>
                data.id === message.id ? { ...data, voiceType: 0 } : data
            );
        }
    };

    return {
        togglePlay
    };
}