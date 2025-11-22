## Description

Backend for the BTL-KTPM project using NestJS.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Documentation

The API documentation is generated using [Swagger](https://swagger.io/tools/swagger-ui/).

The API documentation can be found at [http://localhost:3000/api](http://localhost:3000/api).

## AI Service

Currently, some endpoints using AI service will need Ollama to work properly, if Ollama is not running, those endpoints will return a default answer that a LLM would generate.

To run the AI service, you need to install [Ollama](https://ollama.com/download) on your PC:

Run Ollama in default port 11234:

```bash
ollama serve
```

Also currently the AI service is using model "gpt-oss", you can change it in src/common/AI/ollama.service.ts MODEL or pull the model (must run after 'ollama serve')

```bash
ollama pull gpt-oss
```

<!-- ## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
``` -->

<!-- ## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure. -->

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
