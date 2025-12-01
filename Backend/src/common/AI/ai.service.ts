import {
  GenQuizRequestDto,
  StudentAnswerDto,
} from 'src/domain/assessment/dto/assessment.dto';
import {
  Answer,
  Question,
  Quiz,
} from 'src/domain/assessment/models/assessment.models';
import { IAIService } from './ai.interface';

export abstract class AIService implements IAIService {
  LANGUAGE = 'Vietnamese';

  generateQuizMessage(request: GenQuizRequestDto): string {
    const { topic, type, difficulty, numberOfQuestions } = request;
    return `Generate a JSON object with the following schema:
      ${Quiz.toString()}
      This object is a ${numberOfQuestions} questions Quiz about topic ${topic} with difficulty ${difficulty}
      Ignore the id in quiz schema.
      The question is an array of this schema:
      ${Question.toString()}
      Question info:
        - id is incremental and starts from 1.
        - type is ${type}.
        - correctAnswer type must be type correct with the question type.
      Text is written in ${this.LANGUAGE}.
      Make sure all the text is valid for JSON parsing.
      Only return JSON object.
    `;
  }

  gradeQuizMessage(answers: Answer[], isRealtime: boolean): string {
    return `Grade a quiz with the following answers:
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
      Text is written in ${this.LANGUAGE}.
      ${
        isRealtime
          ? ''
          : `Respond in a JSON schema:
        {
          "rating": int,
          "comment": string,
        }
      `
      }
    `;
  }

  abstract MODEL: string;
  abstract checkServiceOnline(): Promise<boolean>;
  abstract generateQuiz(request: GenQuizRequestDto): Promise<Quiz>;
  abstract gradeQuiz(
    request: StudentAnswerDto,
  ): Promise<{ rating: number; comment: string }>;
  abstract gradeQuizRealtime(request: Answer[]): AsyncGenerator<string>;
}
