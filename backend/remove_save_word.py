import shutil
from pathlib import Path

# Read the file
file_path = Path(r"c:\Users\Duran Ozcelik\Desktop\SAKA QMS\backend\api\files.py")
lines = file_path.read_text(encoding='utf-8').splitlines(keepends=True)

# Backup
shutil.copy(file_path, str(file_path) + ".bak")

# Remove old save_word function (lines 503-630)
new_lines = lines[:502] + lines[630:]

# Write back
file_path.write_text(''.join(new_lines), encoding='utf-8')

print("OK - old save_word removed")
