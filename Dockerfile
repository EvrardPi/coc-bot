FROM node:18-slim as build

WORKDIR /app

COPY package*json .

RUN npm i

COPY . .

RUN npm run build

FROM node:18-slim as run

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build .

USER node

CMD ["node", "main.js"]