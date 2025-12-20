import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeechService } from './speech.service';
import { SpeechToTextDto, SpeechToTextResponseDto } from './speech.dto';

@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  /**
   * POST /speech/to-text
   * Convert audio to text using base64 encoded audio data
   */
  @Post('to-text')
  async speechToText(
    @Body() dto: SpeechToTextDto,
  ): Promise<SpeechToTextResponseDto> {
    return this.speechService.speechToText(dto);
  }

  /**
   * POST /speech/upload
   * Alternative endpoint that accepts file upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('audio'))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('language') language?: string,
  ): Promise<SpeechToTextResponseDto> {
    if (!file) {
      throw new BadRequestException('No audio file provided');
    }

    // Convert file buffer to base64
    const base64Audio = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const dto: SpeechToTextDto = {
      audioData: base64Audio,
      language: language || 'vi-VN',
      mimeType: file.mimetype,
    };

    return this.speechService.speechToText(dto);
  }
}

