FROM node:20

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 8080

CMD ["npm", "run", "start"]