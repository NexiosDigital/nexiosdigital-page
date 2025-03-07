FROM node:18-alpine

WORKDIR /app

# Instalar dependências para desenvolvimento
RUN apk add --no-cache python3 make g++

# Copiar arquivos de configuração
COPY package*.json ./

# Instalar dependências com definição de network timeout maior
RUN npm config set fetch-timeout 300000 && \
  npm install

# Copiar o resto dos arquivos
COPY . .

# Garantir que o servidor de desenvolvimento aceite conexões externas
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Usar o modo de polling para hot reload funcionar no Docker
CMD ["npm", "start"]