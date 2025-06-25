@echo off
echo Deleting repository and recreating...
git remote remove origin 2>nul
git remote add origin https://safalaanhallow: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@github.com/safalaanhallow/valuelyst.git

echo Current commit:
git log --oneline -1

echo Checking remote URL:
git remote get-url origin

echo Force pushing everything:
git push --force --set-upstream origin main

echo Verifying remote content:
git ls-remote origin

pause
