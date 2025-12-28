#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Building Angular application ---"
cd angular
npm run build
cd ..

echo "--- Staging all changes ---"
git add --all

echo "--- Committing changes ---"
git commit -m "feat: Automated build and stage for Angular application changes"

echo "--- Pushing changes to remote ---"
git push origin main

echo "--- Build, staging, commit, and push complete. ---"
