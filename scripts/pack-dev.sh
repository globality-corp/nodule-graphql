#!/usr/bin/env bash

yarn clean 
yarn build

rm globality-nodule-graphql-*.tgz
yarn pack

file=$(ls globality-nodule-graphql-*.tgz)
name=${file%.*}

mv $file $name.$(date +%s).tgz

