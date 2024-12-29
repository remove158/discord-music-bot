FROM oven/bun:1
WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
RUN bun install

COPY . .

CMD ["bun", "start"]