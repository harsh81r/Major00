@echo off
echo Starting CodeSync - Simple Real-time Editor
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd Backend && npm start"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd Frontend/smartbrowser && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo Features:
echo - Simple login with Room ID and Username
echo - Real-time code editing with CodeMirror 5
echo - VS Code-like interface
echo - Responsive design
echo.
echo Press any key to exit...
pause > nul
