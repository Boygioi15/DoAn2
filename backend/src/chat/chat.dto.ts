export class ChatMessageDto {
  message: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export class ChatResponseDto {
  reply: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
  products?: any[]; // Products returned from tool calls
}

