UPDATE staff SET password_hash = '$2y$10$DCKz0K4E3HXL/ZGshWKDMOa4FJl/1/4pXyFl4e3J5LnMaLg6GWq6K' WHERE email = 'psychiatrist@neurolock.com';
SELECT email, password_hash FROM staff WHERE email = 'psychiatrist@neurolock.com';
