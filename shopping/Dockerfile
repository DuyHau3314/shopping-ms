FROM node:16.14.2

WORKDIR /app/shopping

COPY package.json .

RUN npm install

RUN npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 8003

CMD ["npm", "start"]
