USE JewelleryShop;

SELECT * FROM Admin;
UPDATE Admin
SET Email = 'swapnil@example.com'
WHERE Email = 'admin@sajbyanita.com';
UPDATE Admin
SET Email = 'sj020420@gmail.com'
WHERE Email = 'Swapnil@1001';

UPDATE Admin
SET PasswordHash = '$2a$10$rB.chsMOhYbBlFJGs4HR6evcvXJ08k31pVyUi9TnX.866hkdSVUsy'
WHERE Email = 'sj020420@gmail.com';
SELECT Email FROM Admin;
UPDATE Admin
SET PasswordHash = '$2a$10$rB.chsMOhYbBlFJGs4HR6evcvXJ08k31pVyUi9TnX.866hkdSVUsy'
WHERE Email = 'swapnil@example.com';
SELECT * FROM Admin;