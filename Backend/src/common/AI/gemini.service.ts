import { GoogleGenAI } from '@google/genai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AIRepository } from './ai.repository';
import { Quiz } from 'src/domain/assessment/models/assessment.models';
import {
  GenQuizRequestDto,
  StudentAnswerDto,
} from 'src/domain/assessment/dto/assessment.dto';

@Injectable()
export class GeminiService extends AIRepository {
  MODEL = 'gemini-2.5-flash';
  private readonly client = new GoogleGenAI({
    apiKey: 'AIzaSyAR3ZvwI5FjlBkvuFNtRIMSyo70B1obRBk',
  });

  async checkServiceOnline(): Promise<boolean> {
    try {
      return false;
      await this.client.models.generateContent({
        model: this.MODEL,
        contents: 'Return "Y"',
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  async generateQuiz(request: GenQuizRequestDto) {
    const message = this.generateQuizMessage(request);
    const response = await this.client.models.generateContent({
      model: this.MODEL,
      contents: message,
    });
    if (!response.text)
      throw new InternalServerErrorException('client service is not open');
    return JSON.parse(response.text) as Quiz;
  }

  async gradeQuiz(request: StudentAnswerDto) {
    const message = this.gradeQuizMessage(request);
    const response = await this.client.models.generateContent({
      model: this.MODEL,
      contents: message,
    });
    if (!response.text)
      throw new InternalServerErrorException('client service is not open');
    return response.text;
  }

  // Gemini doesn't generate chunk response, instead the chunk is the full answer itself tho
  async *gradeQuizRealtime(request: StudentAnswerDto): AsyncGenerator<string> {
    const message = this.gradeQuizMessage(request);
    const stream = await this.client.models.generateContentStream({
      model: this.MODEL,
      contents: message,
    });

    for await (const part of stream) {
      if (!part.text || part.text === '') continue;
      yield part.text;
    }
  }
}
