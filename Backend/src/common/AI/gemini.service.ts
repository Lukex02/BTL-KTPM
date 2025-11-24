import { GoogleGenAI } from '@google/genai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AIRepository } from './ai.repository';
import {
  Answer,
  AssessmentResult,
  Quiz,
} from 'src/domain/assessment/models/assessment.models';
import {
  GenQuizRequestDto,
  StudentAnswerDto,
} from 'src/domain/assessment/dto/assessment.dto';

@Injectable()
export class GeminiService extends AIRepository {
  MODEL = 'gemini-2.0-flash-lite';
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
    const cleaned = response.text
      .replace(/```[\s\S]*?```/g, (match) =>
        match.replace(/```[a-zA-Z]*/g, '').replace(/```/g, ''),
      )
      .trim();
    return JSON.parse(cleaned) as Quiz;
  }

  async gradeQuiz(request: StudentAnswerDto) {
    const { answers } = request;
    const message = this.gradeQuizMessage(answers, false);
    const response = await this.client.models.generateContent({
      model: this.MODEL,
      contents: message,
    });
    if (!response.text)
      throw new InternalServerErrorException('client service is not open');
    const cleaned = response.text
      .replace(/```[\s\S]*?```/g, (match) =>
        match.replace(/```[a-zA-Z]*/g, '').replace(/```/g, ''),
      )
      .trim();
    return JSON.parse(cleaned) as AssessmentResult;
  }

  // Gemini doesn't generate chunk response, instead the chunk is the full answer itself tho
  async *gradeQuizRealtime(request: Answer[]): AsyncGenerator<string> {
    const message = this.gradeQuizMessage(request, true);
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
