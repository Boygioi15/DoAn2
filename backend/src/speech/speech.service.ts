import { Injectable, BadRequestException } from '@nestjs/common';
import { SpeechToTextDto, SpeechToTextResponseDto } from './speech.dto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import OpenAI from 'openai';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

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
  async speechToText(dto: SpeechToTextDto): Promise<SpeechToTextResponseDto> {
    let tempFilePath: string | null = null;

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

      // Extract base64 data
      const base64Data = audioData.split('base64,')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      // Ensure temp directory exists
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Determine file extension based on mime type
      let extension = 'webm';
      if (mimeType.includes('mp3')) extension = 'mp3';
      else if (mimeType.includes('wav')) extension = 'wav';
      else if (mimeType.includes('m4a')) extension = 'm4a';
      else if (mimeType.includes('ogg')) extension = 'ogg';

      // Save audio to temporary file
      tempFilePath = path.join(tempDir, `speech-${Date.now()}.${extension}`);
      await writeFile(tempFilePath, buffer);

      // Extract language code for OpenAI (e.g., 'vi' from 'vi-VN')
      const languageCode = language.split('-')[0];

      // Call OpenAI Whisper API
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'gpt-4o-transcribe',
        language: languageCode, // 'vi' for Vietnamese
        response_format: 'json', // Get more details including confidence
      });

      // Clean up temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        await unlink(tempFilePath);
        tempFilePath = null;
      }

      // Return transcription result
      const response: SpeechToTextResponseDto = {
        transcript: transcription.text,
        confidence: 1.0, // OpenAI doesn't provide confidence scores
        language: language,
      };

      return response;
    } catch (error) {
      console.error('Speech to text error:', error);

      // Clean up temp file in case of error
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          await unlink(tempFilePath);
        } catch (unlinkError) {
          console.error('Error deleting temp file:', unlinkError);
        }
      }

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
