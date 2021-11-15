docker-compose -f %~dp0../docker-compose.yml up -d --build
docker image prune --filter label=stage=build -f