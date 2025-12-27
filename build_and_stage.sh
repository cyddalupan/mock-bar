#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Building Angular application ---"
cd angular
npm run build
cd ..

echo "--- Staging built files in 'bar' directory ---"
git add bar

echo "--- Build and staging complete. You can now commit your changes. ---"
echo "Example: git commit -m \"feat: Update Angular application\" && git push"
