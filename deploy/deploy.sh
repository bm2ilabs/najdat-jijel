#!/bin/sh
# Deploys one release on the VPS. Called by CI after the image is pushed,
# or manually: ./deploy.sh v1.2.0   (rollback = rerun with an older tag).
set -eu

TAG="${1:?usage: deploy.sh <image-tag>}"
cd "$(dirname "$0")"

# Keep supabase/migrations in lockstep with the image being deployed.
git -C .. fetch --tags origin
git -C .. checkout -q "refs/tags/$TAG" 2>/dev/null || git -C .. pull --ff-only

sed -i "s/^APP_TAG=.*/APP_TAG=$TAG/" .env

docker compose pull app
docker compose up -d --remove-orphans
docker compose --profile tools run --rm migrate

# Small VPS: reclaim disk from old deploys — images no container uses + build cache.
docker image prune -af
docker builder prune -af

docker compose ps
curl -fsS "https://$(grep '^APP_HOST=' .env | cut -d= -f2)/api/health" && echo " — healthy"
