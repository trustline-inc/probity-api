#!/bin/bash

read -p 'Update Type (patch, minor, major): ' UPDATE_TYPE

# Update NPM package version
npm version $UPDATE_TYPE

# Get semantic version
VERSION=$(cat package.json | jq -r '.version')

# Tag the most recent commit
git tag $VERSION
git push --follow-tags

# Build the image
docker build \
  -t probity-api:$VERSION \
  -t probity-api:latest \
  .

# Add version and latest tags
docker tag probity-api:$VERSION
docker tag probity-api:latest
