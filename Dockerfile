FROM heroku/heroku:18

FROM node

WORKDIR /app/user

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]