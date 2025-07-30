// 原 React 类型转换为 Vue 兼容类型
export interface Message {
  id: number;
  type: "start" | "end" | undefined;
  role: string;
  content: string;
  voiceType?: number;
  isLoading?: boolean;
}

export interface MessageData {
  name: string;
  message: Message[];
}

export interface User {
  id: number;
  greeting: string;
  name: string;
  avatar: string;
  background: string;
  message: Message[];
}