#!/bin/bash

# Archive Git repository
git archive HEAD > deploy.tar

# Add Git files
tar -rf deploy.tar .git

# Deploy
npx caprover deploy -d -t ./deploy.tar

# Cleanup
rm ./deploy.tar
