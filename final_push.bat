@echo off
echo Adding HTTPS remote with token...
git remote add origin https://safalaanhallow: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@github.com/safalaanhallow/valuelyst.git

echo Checking remote URL...
git remote get-url origin

echo Pushing all files to GitHub...
git push -u origin main

echo Verifying push...
git ls-remote origin

echo Done! Check GitHub repository.
pause
