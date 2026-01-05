import { Injectable, BadRequestException } from '@nestjs/common';
import { SpeechToTextDto, SpeechToTextResponseDto } from './speech.dto';
import OpenAI, { toFile } from 'openai';

@Injectable()
export class SpeechService {
  private openai: OpenAI;

  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Convert speech audio to text using OpenAI Whisper API
   */
  async speechToText(dto: SpeechToTextDto) {
    try {
      const { audioData, language = 'vi-VN', mimeType = 'audio/webm' } = dto;

      // Validate base64 audio data
      if (!audioData || !audioData.includes('base64,')) {
        throw new BadRequestException('Invalid audio data format');
      }

      // Validate OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        throw new BadRequestException(
          'OpenAI API key not configured. Please set OPENAI_API_KEY in .env file',
        );
      }

      // Extract base64 data and convert to Buffer
      const base64Data = audioData.split('base64,')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      // Determine file extension based on mime type
      let extension = 'webm';
      if (mimeType.includes('mp3')) extension = 'mp3';
      else if (mimeType.includes('wav')) extension = 'wav';
      else if (mimeType.includes('m4a')) extension = 'm4a';
      else if (mimeType.includes('ogg')) extension = 'ogg';

      // Convert buffer to File object for OpenAI
      const file = await toFile(buffer, `audio.${extension}`, {
        type: mimeType,
      });

      // Extract language code for OpenAI (e.g., 'vi' from 'vi-VN')
      const languageCode = language.split('-')[0];

      // Call OpenAI Whisper API
      const transcription = await this.openai.audio.transcriptions.create({
        file,
        model: 'gpt-4o-transcribe',
        language: languageCode,
        response_format: 'json',
      });

      // Return transcription result
      return {
        transcript: transcription.text,
        confidence: 1.0,
        language: language,
      };
    } catch (error) {
      console.error('Speech to text error:', error);

      // Handle OpenAI specific errors
      if (error.response?.status === 401) {
        throw new BadRequestException('Invalid OpenAI API key');
      } else if (error.response?.status === 429) {
        throw new BadRequestException('OpenAI API rate limit exceeded');
      }

      throw new BadRequestException(
        'Failed to process audio: ' + error.message,
      );
    }
  }
}
