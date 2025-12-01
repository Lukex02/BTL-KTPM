import { Injectable } from '@nestjs/common';
import ollama from 'ollama';
import net from 'net';
import {
  GenQuizRequestDto,
  StudentAnswerDto,
} from 'src/domain/assessment/dto/assessment.dto';
import {
  Answer,
  AssessmentResult,
  Question,
  Quiz,
} from 'src/domain/assessment/models/assessment.models';
import { AIService } from './ai.service';

@Injectable()
export class OllamaService extends AIService {
  MODEL = 'gpt-oss';
  async generateQuiz(request: GenQuizRequestDto) {
    const message = this.generateQuizMessage(request);
    const response = await ollama.chat({
      model: this.MODEL,
      messages: [{ role: 'user', content: message }],
    });

    return JSON.parse(response.message.content) as Quiz;
  }

  async gradeQuiz(request: StudentAnswerDto) {
    const { answers } = request;
    const message = this.gradeQuizMessage(answers, false);
    const response = await ollama.chat({
      model: this.MODEL,
      messages: [{ role: 'user', content: message }],
    });

    return JSON.parse(response.message.content) as AssessmentResult;
  }

  // Stream response
  async *gradeQuizRealtime(request: Answer[]) {
    const message = this.gradeQuizMessage(request, true);
    const stream = await ollama.chat({
      model: this.MODEL,
      messages: [{ role: 'user', content: message }],
      stream: true,
    });

    for await (const part of stream) {
      if (part.message.content === '') continue;
      yield part.message.content;
    }
  }

  // Check if port is open
  checkServiceOnline(): Promise<boolean> {
    const host = '127.0.0.1',
      port = 11434,
      timeout = 1000;
    return new Promise((resolve) => {
      const socket = new net.Socket();

      const onError = () => {
        socket.destroy();
        resolve(false);
      };

      socket.setTimeout(timeout);
      socket.once('error', onError);
      socket.once('timeout', onError);

      socket.connect(port, host, () => {
        socket.end();
        resolve(true);
      });
    });
  }
}
