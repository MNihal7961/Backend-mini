FROM node:22

WORKDIR /app/shopping

COPY package*.json .


RUN npm install


COPY . .

EXPOSE 8003

CMD [ "npm","start" ]