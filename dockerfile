# Common build stage
FROM node:lts-alpine3.15 as common-build-stage

COPY . ./app

WORKDIR /app

RUN npm install

EXPOSE 6700

FROM common-build-stage as production-build-stage

ENV NODE_ENV production
ENV PORT 6700

CMD ["node", "index.js"]
