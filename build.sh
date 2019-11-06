npm run build

echo "Building image"

docker build -t kiesarun/vrp-frontend:latest .

echo "pushing image"

docker push kiesarun/vrp-frontend:latest
