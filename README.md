<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Country Currency & Exchange API

## Description

NestJS + TypeORM + MySQL service that caches country data and USD exchange rates on demand, exposes filters/sorts, and generates a summary image.

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Features

- POST `/countries/refresh`: fetch countries + USD rates; upsert DB; generate `cache/summary.png`
- GET `/countries`: filter by `region`, `currency`; sort by `gdp_desc|gdp_asc|name_asc|name_desc`
- GET `/countries/:name`: fetch by name (case-insensitive)
- DELETE `/countries/:name`: delete by name
- GET `/status`: total countries + last refresh timestamp
- GET `/countries/image`: serves summary image (404 JSON if missing)
- Swagger: `/docs`
- Uniform JSON error responses

## Project setup

```bash
$ yarn install
```

## Compile and run the project

# Run (Docker)

1. Copy `.env.example` → `.env` and adjust as needed.
2. `docker-compose up --build -d`
3. Open: `http://localhost:8080/docs`

```bash
# development
1. MySQL 8 running; create DB `country_cache`.
2. `cp .env.example .env` and set DB creds.
3. `npm ci`
4. `npm run start`

# watch mode
$ npm run start:dev (or npm run build && npm run start:prod)

# production mode
$ yarn run start:prod
```

## Examples

- `POST /countries/refresh`
- `GET /countries?region=Africa`
- `GET /countries?currency=NGN&sort=gdp_desc`

## Error Responses

- 400: `{ "error": "Validation failed", "details": { "field": "message" } }`
- 404: `{ "error": "Country not found" }`
- 500: `{ "error": "Internal server error" }`
- 503: `{ "error": "External data source unavailable", "details": "Could not fetch data from [API name]" }`

## Env Vars

See `.env.example`.

## Deploy

- **Railway/Render/Fly.io/AWS/**. Provide:
  - single container image,
  - persistent volume for `/usr/src/app/cache` if you want the image persisted across restarts,
  - MySQL provisioned or external MySQL (set env).

## Notes

- `synchronize: true` for demo simplicity. For production, switch to migrations.
- `population` stored as string (`bigint`).
- Estimated GDP: `population × random(1000..2000) ÷ exchange_rate`. Rules:
  - No currencies → `exchange_rate=null`, `estimated_gdp=0`
  - Unknown currency code → `exchange_rate=null`, `estimated_gdp=null`

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
