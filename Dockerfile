FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npm run build

ENV NODE_ENV=production
CMD ["node", "build/index.js"]
