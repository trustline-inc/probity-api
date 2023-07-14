FROM node:14-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json /usr/src/app/

RUN yarn
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . /usr/src/app/

EXPOSE 8080

CMD [ "yarn", "run", "start" ]
