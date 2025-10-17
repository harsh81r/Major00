@echo off
echo Setting up backend repository for GitHub...

REM Initialize git if not already done
git init

REM Add only the backend files we want
git add Backend/src/
git add Backend/package.json
git add Backend/package-lock.json
git add Backend/.gitignore
git add Backend/README.md

REM Check status
echo.
echo Files staged for commit:
git status --porcelain

REM Commit the changes
git commit -m "Initial backend setup for deployment - Smart Browser Backend"

REM Add remote origin
git remote add origin https://github.com/harsh81r/Backend-major00.git

REM Set main branch
git branch -M main

REM Push to GitHub
echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo Backend successfully pushed to GitHub!
echo Repository: https://github.com/harsh81r/Backend-major00
echo.
echo Next steps:
echo 1. Deploy to Render using this repository
echo 2. Set environment variables in Render
echo 3. Update Vercel with backend URL
pause



