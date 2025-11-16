# Archivo: /backend/Dockerfile

# Usamos una imagen Node.js ligera
FROM node:20-alpine

# Establecemos el directorio de trabajo
WORKDIR /usr/src/app

# Copiamos los archivos de dependencias
COPY package*.json ./
RUN npm ci --only=production

# Instalamos las dependencias
#RUN npm install

# Copiamos el resto del código de la aplicación
COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Exponemos el puerto en el que corre la API
EXPOSE 3000


HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
 CMD node -e "require('http').get('http://localhost:3000/api/status', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"


# Comando para iniciar la aplicación
# !! CAMBIA 'server.js' si tu archivo principal tiene otro nombre !!
CMD [ "node", "server.js" ]

