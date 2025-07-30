<template>
  <div
      class="flex-1 overflow-y-auto p-4 custom-scrollbar"
      ref="containerRef"
      style="scroll-behavior: smooth; padding-right: 8px;"
  >
    <div class="space-y-6 pb-24">
      <MessageItem
          v-for="(message, index) in messageList"
          :key="message.id"
          :message="message"
          :user="user"
          @toggle-play="(msg: Message) => $emit('toggle-play', msg, index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, Ref} from 'vue';
import MessageItem from './MessageItem.vue';
import type { Message, User } from '@/types';

const props = defineProps<{
  messageList: Message[];
  user: User | null;
  messageContainer: Ref<HTMLDivElement | null>;
}>();

const containerRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (props.messageContainer && containerRef.value) {
    props.messageContainer.value = containerRef.value;
  }
});

defineEmits<{
  (e: 'toggle-play', message: Message, index: number): void;
}>();
</script>