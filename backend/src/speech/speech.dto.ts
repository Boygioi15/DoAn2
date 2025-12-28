import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SpeechToTextDto {
  @IsNotEmpty()
  @IsString()
  audioData: string; // Base64 encoded audio data

  @IsOptional()
  @IsString()
  language?: string; // Language code (e.g., 'vi-VN', 'en-US')

  @IsOptional()
  @IsString()
  mimeType?: string; // Audio mime type (e.g., 'audio/webm', 'audio/wav')
}

export class SpeechToTextResponseDto {
  transcript: string;
  confidence?: number;
  language?: string;
}

