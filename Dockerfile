FROM node
RUN mkdir /app
ADD . /app

WORKDIR /app
RUN npm install

EXPOSE 80
CMD ["npm", "start"]
