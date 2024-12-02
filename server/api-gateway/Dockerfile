# Etapa 1: Construção da aplicação
FROM node:20 AS build

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar o package.json e package-lock.json (se existir) para instalar dependências
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o código-fonte da aplicação
COPY . .

# Compilar o TypeScript para JavaScript
RUN npm run build

# Etapa 2: Produção
FROM node:20-slim

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar apenas os arquivos essenciais do container de build
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Instalar as dependências de produção
RUN npm install --only=production

# Expor a porta em que a API vai rodar
EXPOSE 3000

# Definir o comando para rodar a aplicação
CMD ["node", "dist/index.js"]