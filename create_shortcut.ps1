$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\Hayan School System.lnk")
$Shortcut.TargetPath = "c:\Users\pc\Desktop\Hayan School System\launch_desktop_app.bat"
$Shortcut.WorkingDirectory = "c:\Users\pc\Desktop\Hayan School System"
$Shortcut.IconLocation = "c:\Users\pc\Desktop\Hayan School System\hss_real.ico" 
$Shortcut.WindowStyle = 7 
$Shortcut.Save()
