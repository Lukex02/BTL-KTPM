import { Module, Global } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { GeminiService } from './gemini.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: 'AI_SERVICE',
      useClass: GeminiService, // or OllamaService
    },
  ],
  exports: ['AI_SERVICE'],
})
export class AIModule {}
