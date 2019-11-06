FROM nginx:1.17.4-alpine

COPY dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/

CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80