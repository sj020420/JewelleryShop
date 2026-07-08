// Run: node utils/hashPassword.js YourPassword
// Prints a bcrypt hash you can paste into the Admin.PasswordHash column.
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.log('Usage: node utils/hashPassword.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('\nBcrypt hash for "%s":\n%s\n', password, hash);
});
