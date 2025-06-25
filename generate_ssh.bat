@echo off
echo Generating SSH key...
echo | ssh-keygen -t ed25519 -C "safalaan@example.com"
echo.
echo SSH key generated! Here is your public key:
echo.
type %USERPROFILE%\.ssh\id_ed25519.pub
echo.
echo Copy the above key and add it to GitHub at:
echo https://github.com/settings/ssh/new
pause
