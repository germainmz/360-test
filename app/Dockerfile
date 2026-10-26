# Construit le front puis le sert avec nginx, qui relaie aussi l'API (voir nginx.conf).

# Étape 1 : image Node, uniquement pour compiler l'application.
FROM node:22-alpine AS build
WORKDIR /app
# Les dépendances sont installées avant de copier le code : tant que package-lock.json ne change
# pas, Docker réutilise cette étape en cache et les reconstructions sont rapides.
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# URL de l'API vue par le navigateur ; « /api » passe par le proxy nginx (même origine).
# Elle est inscrite dans le code au moment du build : la changer impose de reconstruire l'image.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Étape 2 : image finale légère, avec seulement nginx et les fichiers compilés (pas de Node).
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
