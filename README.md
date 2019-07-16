### whirlpool-fetch

steps to build and push the service after pulling the repository.

`
docker build --no-cache -t whirlpool-fetch-dev:latest --target whirlpool-fetch-dev .
`

`
docker tag whirlpool-fetch-dev:latest rihbyne/whirlpool-fetch-dev:latest
`

`
docker push rihbyne/whirlpool-fetch-dev:latest
`

`
docker-compose -f dev-docker-compose.yml build --no-cache whirlpool-fetch
`

start the container with build flag in detach mode (will build all the images before starting)
`
docker-compose -f dev-docker-compose.yml up --build -d whirlpool-fetch
`

stop the container by removing non-running containers 
`
docker-compose -f dev-docker-compose.yml down --remove-orphans
`

Start with no dependencies
`docker-compose run --no-deps SERVICE COMMAND [ARGS...]`

