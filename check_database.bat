@echo off
echo Checking patient count...
docker exec neurolock-mysql mysql -u root -proot123 neurolock -e "SELECT COUNT(*) as total_patients FROM patients"
echo.
echo Listing all patients...
docker exec neurolock-mysql mysql -u root -proot123 neurolock -e "SELECT id, mrn, full_name, email FROM patients"
pause
