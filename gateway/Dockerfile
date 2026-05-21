FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY gateway ./gateway

ENV NODE_ENV=production
ENV GATEWAY_PORT=8080

EXPOSE 8080

CMD ["npm", "run", "start:gateway"]
