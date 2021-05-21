#!/usr/bin/env bash

## Setup

set -e

bold=$(tput bold)
normal=$(tput sgr0)

function isValidSemver() {
  if [[ $1 =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-((0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(\+([0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*))?$ ]]; then
    echo "$1"
  else
    echo ""
  fi
}

## Version

echo "replacing version number"

version=$(isValidSemver $1)

if [ -z $version ]; then
  echo "$1 is not a valid semver version"
  exit 1
fi

# extension.yaml
sed -i '' "s/^version:.*/version: $version/" extension.yaml
# package.json
sed -i '' "s/\"version.*/\"version\": \"$version\",/" package.json ./functions/package.json
# version.ts
echo "export const version = '$version';" > ./functions/src/version.ts

## Build

echo "installing and building"

npm install

cd functions
npm install
npm run build
cd ..

## End

read -r -p "Please check the created files. Do you want to release? [y/N]" response

case "$response" in
  [yY][eE][sS]|[yY]) 
    git add .
    git commit -m "v$version"
    git tag "v$version"

    echo "Version updated, now push to github and npm:"
    echo "${bold}cd functions && git push --follow-tags && npm publish${normal}"
  ;;
  *)
    echo "Canceled release. Once you are done, commit the version manually:"
    echo "${bold}git add . && git commit -m v$version git tag v$version${normal}"
    echo "Then release on npm:"
    echo "${bold}cd functions && git push --follow-tags && npm publish${normal}"
  ;;
esac

