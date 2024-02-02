@REM pkg package.json --target node14-win-x64 --icon ./icon.ico --output bbb.exe
@REM pkg package.json --target node14-win-x64
call rollup app.js --file convert-markdown.js --format cjs && ^
pkg convert-markdown.js --target node16-win-x64 --output convert-markdown.exe
call run.bat
echo f | xcopy "convert-markdown.exe" "C:\Users\NisimHurst\Utilities\Autohotkey\Helper\convert-markdown.exe" /y
