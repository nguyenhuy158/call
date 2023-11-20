@echo off
setlocal enabledelayedexpansion

set "sourceFile=keybindings.json"
set "destinationFolder=%APPDATA%\Code\User"

echo List of user profiles on this PC:

set "userCount=0"
for /d %%a in (C:\Users\*) do (
    set /a "userCount+=1"
    set "userList[!userCount!]=%%a"
    echo [!userCount!] %%a
)

if %userCount% equ 0 (
    echo No user profiles found.
    pause
    exit /b 1
)

set /p "userChoice=Enter the number corresponding to the user to copy keybindings.json: "

if !userChoice! lss 1 (
    echo Invalid choice. Please enter a valid number.
    pause
    exit /b 1
)

if !userChoice! gtr %userCount% (
    echo Invalid choice. Please enter a valid number.
    pause
    exit /b 1
)

set "selectedUser=!userList[%userChoice%]!"
set "selectedUserFolder=!selectedUser!\AppData\Roaming\Code\User"

if exist "!selectedUserFolder!" (
    echo Copying %sourceFile% to !selectedUserFolder!...
    xcopy /Y "%sourceFile%" "!selectedUserFolder!" > nul
    echo.
    echo Copy operation completed for user: !selectedUser!
) else (
    echo User profile folder not found: !selectedUserFolder!
)

pause

exit /b 0
