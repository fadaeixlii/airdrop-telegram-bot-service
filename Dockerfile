FROM node:20

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install --quiet

COPY . .

EXPOSE 7001

CMD ["npm", "run", "start"]
