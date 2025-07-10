
@echo off
setlocal
 
echo ?? Starting Node.js backend server...
start cmd /k "cd /d D:\SANG\Do An Tot Nghiep\DEPLOY-BACKEND-SERVER\JOBINFOR\QLVLBackEnd && npm start"
 
echo ? Waiting for backend to initialize...
timeout /t 5 /nobreak > nul
 
echo ?? Starting Ngrok tunnel on port 3009...
start /b "" "D:\SANG\Ngrok Installer\ngrok.exe" http 3009 > nul
 
echo ? Waiting for Ngrok tunnel to become active...
timeout /t 5 /nobreak > nul
 
echo ?? Extracting public URL from Ngrok using PowerShell...
 
for /f "delims=" %%i in ('powershell -Command "(Invoke-RestMethod -Uri http://127.0.0.1:4040/api/tunnels).tunnels | Where-Object {$_.proto -eq 'https'} | Select-Object -First 1 -ExpandProperty public_url"') do (
    set "URL=%%i"
)
 
:: Fail-safe check
if not defined URL (
    echo ? Failed to retrieve Ngrok public URL.
    pause
    exit /b
)
 
echo ?? Updating .env file with API URL...
cd /d D:\SANG\Do An Tot Nghiep\DEPLOY-BACKEND-SERVER\JOBINFOR\QLVLFrontEnd
del .env > nul 2>&1
echo VITE_API_URL=%URL%> .env
 
echo ?? New API base URL set to: %URL%
echo ? All set. You can now restart the frontend with: npm run dev
pause
