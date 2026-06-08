FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm install ts-node-dev typescript @types/node

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/index.js"]
