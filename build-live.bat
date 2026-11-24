@echo off
echo Building for LIVE (api.igoagriestate.com) ...
if exist .env.local ren .env.local .env.local.off
set VITE_API_URL=https://api.igoagriestate.com
set VITE_SUPABASE_URL=
set VITE_SUPABASE_ANON_KEY=
set NODE_OPTIONS=--max-old-space-size=4096
call npx vite build
set BUILD_ERR=%ERRORLEVEL%
if exist .env.local.off ren .env.local.off .env.local
if %BUILD_ERR% neq 0 ( echo BUILD FAILED & pause & exit /b 1 )
if not exist dist\.htaccess copy public\.htaccess dist\.htaccess
echo.
echo DONE. Upload ALL files inside the dist folder to Hostinger public_html.
pause
