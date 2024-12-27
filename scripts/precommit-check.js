import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

try {

  const packageDatabasePath = join(
    __dirname,
    'packges',
    'database',
  );
  // Resolve the schema directory path
  const schemaPath = join(
    packageDatabasePath,
    'src',
    'schema'
  );

  const migrationsPath = join(
    packageDatabasePath,
    'migrations',
  ) 

  // Run `git diff` to check for changes in the schema directory
  const diffOutput = execSync(`git diff --name-only --cached`, { encoding: 'utf-8' })
    .split('\n')
    .filter((file) => file.startsWith(schemaPath.replace(/\\/g, '/'))); // Normalize path for Git

  console.log(diffOutput);

  // If there are schema changes, run migrations
  if (diffOutput.length > 0) {
    console.log('Schema changes detected, generating migrations...');
    execSync('turbo run migrate --filter=@services/database', { stdio: 'inherit' }); // Run migration generation
    console.log('Migrations generated and staged.');
    execSync(`git add ${migrationsPath}`, { stdio: 'inherit' }); // Stage the migrations
  } else {
    console.log('No schema changes detected, skipping migration generation.');
  }
} catch (error) {
  console.error('Error during migration generation:', error.message);
  process.exit(1); // Exit with failure code
}
