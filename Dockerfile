FROM node:18-alpine

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias (solo para producción en este caso, o completas si corremos tests)
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["npm", "start"]
