# Usar imagem oficial do Node como base
FROM node:20-alpine AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código fonte
COPY . .

# Construir a aplicação para produção
RUN npm run build

# Usar Nginx para servir a aplicação
FROM nginx:alpine

# Copiar build da fase anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]