@echo off
echo.
echo ====================================================
echo      AGROGUARDIAN - SMART FARMING PLATFORM
echo ====================================================
echo.
echo Launching Backend Server...
start cmd /k "cd backend && npm start"

echo.
echo Launching Frontend Development Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo ----------------------------------------------------
echo  PLATFORM IS STARTING! 
echo  Frontend: http://localhost:5173
echo  Backend: http://localhost:5000
echo ----------------------------------------------------
echo.
pause
