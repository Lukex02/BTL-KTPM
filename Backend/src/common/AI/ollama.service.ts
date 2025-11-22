import { Injectable } from '@nestjs/common';
import ollama from 'ollama';
import net from 'net';
import {
  GenQuizRequestDto,
  StudentAnswerDto,
} from 'src/domain/assessment/dto/assessment.dto';
import { Question, Quiz } from 'src/domain/assessment/models/assessment.models';

const MODEL = 'gpt-oss';
const LANGUAGE = 'Vietnamese';

@Injectable()
export class OllamaService {
  async generateQuiz(request: GenQuizRequestDto) {
    const { topic, type, difficulty, numberOfQuestions } = request;
    const message = `Generate a JSON object with the following schema:
      ${Quiz.toString()}
      This object is a ${numberOfQuestions} questions Quiz about topic ${topic} with difficulty ${difficulty}
      Ignore the id in quiz schema.
      The question is an array of this schema:
      ${Question.toString()}
      Question info:
        - id is incremental and starts from 1.
        - type is ${type}.
        - correctAnswer type must be type correct with the question type.
      Text is written in ${LANGUAGE}.
      Make sure all the text is valid for JSON parsing.
      Only return JSON object.
    `;
    const response = await ollama.chat({
      model: MODEL,
      messages: [{ role: 'user', content: message }],
    });

    return JSON.parse(response.message.content);
  }

  async gradeQuiz(request: StudentAnswerDto) {
    const { answers } = request;
    const message = `Grade a quiz with the following answers:
      ${answers
        .map((answer) => {
          return `Question: ${answer.question}, Answer: ${answer.answer}`;
        })
        .join('\n')}
      Answer info:
        - question is the question text.
        - answer is the student answer.
      The response is a summary evaluation/rating of the student's answers with a overall rating score from 1 to 10.
      The response is under 50 words.
      If their answer is wrong or not perfect, the response should give hints or advices like learning item or explain why their answer is wrong to the student.
      Response attitude should be positive and constructive towards the student.
      Response sentences shouldn't be repetitive.
      Text is written in ${LANGUAGE}.
    `;
    const response = await ollama.chat({
      model: MODEL,
      messages: [{ role: 'user', content: message }],
    });

    return response.message.content;
  }

  // Stream response
  async *gradeQuizRealtime(request: StudentAnswerDto) {
    const { answers } = request;
    const message = `Grade a quiz with the following answers:
      ${answers
        .map((answer) => {
          return `Question: ${answer.question}, Answer: ${answer.answer}`;
        })
        .join('\n')}
      Answer info:
        - question is the question text.
        - answer is the student answer.
      The response is a summary evaluation/rating of the student's answers with a overall rating score from 1 to 10.
      The response is under 50 words.
      If their answer is wrong or not perfect, the response should give hints or advices like learning item or explain why their answer is wrong to the student.
      Response attitude should be positive and constructive towards the student.
      Response sentences shouldn't be repetitive.
      Text is written in ${LANGUAGE}.
    `;
    const stream = await ollama.chat({
      model: MODEL,
      messages: [{ role: 'user', content: message }],
      stream: true,
    });

    for await (const part of stream) {
      if (part.message.content === '') continue;
      yield part.message.content;
    }
  }

  // Check if port is open
  checkPort(host: string, port: number, timeout = 1000): Promise<boolean> {
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
