@echo off
echo =======================================
echo SCHOOL FEE MANAGEMENT SYSTEM INSTALLER
echo =======================================
echo.
echo This batch file will help you set up the School Fee Management System.
echo.
echo PREREQUISITES:
echo 1. Node.js installed (v18+ recommended)
echo 2. PostgreSQL server running
echo 3. A PostgreSQL database created for the application
echo.
echo Press any key to continue...
pause > nul

echo.
echo Extracting files...
echo.

:: Check if the zip file exists
if not exist "school-fee-management-system.zip" (
  echo Error: Could not find school-fee-management-system.zip
  echo Please make sure the zip file is in the same directory as this batch file.
  goto :end
)

:: Create application directory
if not exist "school-fee-management" mkdir school-fee-management

:: Extract the zip file
echo Extracting application files...
powershell -command "Expand-Archive -Path 'school-fee-management-system.zip' -DestinationPath 'school-fee-management' -Force"

cd school-fee-management

:: Install dependencies
echo.
echo Installing dependencies...
call npm install

:: Create .env file
echo.
echo Creating .env file...
echo.
set /p dbuser=Enter PostgreSQL username: 
set /p dbpass=Enter PostgreSQL password: 
set /p dbname=Enter PostgreSQL database name: 
set /p dbhost=Enter PostgreSQL host (default: localhost): 
if "%dbhost%"=="" set dbhost=localhost
set /p dbport=Enter PostgreSQL port (default: 5432): 
if "%dbport%"=="" set dbport=5432

:: Write to .env file
echo DATABASE_URL=postgresql://%dbuser%:%dbpass%@%dbhost%:%dbport%/%dbname% > .env
echo SESSION_SECRET=school-fee-management-secret >> .env
echo PGUSER=%dbuser% >> .env
echo PGPASSWORD=%dbpass% >> .env
echo PGDATABASE=%dbname% >> .env
echo PGHOST=%dbhost% >> .env
echo PGPORT=%dbport% >> .env

:: Initialize database
echo.
echo Initializing database...
call npm run db:push

:: Create start script
echo.
echo Creating start script...
echo @echo off > start.bat
echo echo Starting School Fee Management System... >> start.bat
echo call npm run dev >> start.bat
echo. >> start.bat
echo pause >> start.bat

echo.
echo =======================================
echo INSTALLATION COMPLETED SUCCESSFULLY!
echo =======================================
echo.
echo The School Fee Management System has been installed successfully.
echo.
echo To start the application, run the start.bat file in the school-fee-management folder.
echo Then open your browser and go to: http://localhost:5000
echo.
echo Default Admin User:
echo - Email: admin@example.com
echo - Password: adminadmin
echo.
echo Default Parent User:
echo - Email: parent@example.com
echo - Password: parentparent
echo.
echo Press any key to exit...
pause > nul

:end