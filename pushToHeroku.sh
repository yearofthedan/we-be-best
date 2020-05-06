#! /usr/bin/env sh
set -euo pipefail

docker tag we-be-best/app registry.heroku.com/we-be-best/web

echo $HEROKU_API_KEY | docker login --username=_ --password-stdin registry.heroku.com

docker push registry.heroku.com/we-be-best/web

