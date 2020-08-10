FROM node:12
WORKDIR /app
COPY ["package.json", "package-lock.json*","npm-shrinkwrap.json*","./"]
RUN npm install
COPY . /app
CMD node app.js
EXPOSE 1337