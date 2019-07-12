FROM node:10.16.0 as whirlpool-fetch

RUN useradd --create-home --shell /bin/bash whirlpool

ARG WH_FETCH_ROOT=/home/whirlpool/whirlpool-fetcher
WORKDIR $WH_FETCH_ROOT

RUN chown -R whirlpool:whirlpool $WH_FETCH_ROOT

# files necessary to build the project
COPY package.json ./
COPY .babelrc ./
COPY .eslintrc.js ./
COPY .eslintignore ./
COPY package-lock.json ./

RUN npm install --no-audit

COPY config/ config/
COPY src/ src/
COPY logs/ logs/
