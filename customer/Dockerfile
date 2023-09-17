FROM node:16.14.2

WORKDIR /app/customer

COPY package.json .

RUN npm install

RUN npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 8001

CMD ["npm", "start"]
