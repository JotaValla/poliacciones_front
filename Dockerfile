FROM nginx:alpine

# Establece el directorio de trabajo
WORKDIR /usr/share/nginx/html

# Elimina cualquier archivo por defecto en la carpeta HTML de Nginx
RUN rm -rf ./*

# Copia todos los archivos del frontend (HTML, CSS, JS) al contenedor
COPY . .

# Exponer el puerto 80 para el servidor Nginx
EXPOSE 80

# Ejecutar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
