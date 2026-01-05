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
import { checkAndCorrectOffensiveSentence } from 'src/ultility';

@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  /**
   * POST /speech/to-text
   * Convert audio to text using base64 encoded audio data
   */
  @Post('to-text')
  async speechToText(@Body() dto: SpeechToTextDto) {
    const speechResult = await this.speechService.speechToText(dto);
    console.log('Speech result: ', speechResult);
    const { correctedSentence, censoredWordList } =
      checkAndCorrectOffensiveSentence(speechResult.transcript);
    return { correctedSentence, censoredWordList };
  }
}
