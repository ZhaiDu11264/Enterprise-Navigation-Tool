import { promises as fs } from 'fs';
import path from 'path';
import { executeQuery } from '../config/database';

interface Migration {
  filename: string;
  version: string;
  description: string;
  sql: string;
}

// Create migrations table if it doesn't exist
const createMigrationsTable = async (): Promise<void> => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      version VARCHAR(50) UNIQUE NOT NULL,
      filename VARCHAR(255) NOT NULL,
      description TEXT,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await executeQuery(createTableQuery);
};

// Get executed migrations
const getExecutedMigrations = async (): Promise<string[]> => {
  const query = 'SELECT version FROM migrations ORDER BY version';
  const results = await executeQuery<{ version: string }>(query);
  return results.map(row => row.version);
};

// Mark migration as executed
const markMigrationExecuted = async (migration: Migration): Promise<void> => {
  const query = `
    INSERT INTO migrations (version, filename, description) 
    VALUES (?, ?, ?)
  `;
  
  await executeQuery(query, [
    migration.version,
    migration.filename,
    migration.description
  ]);
};

// Parse migration file
const parseMigrationFile = async (filePath: string): Promise<Migration> => {
  const content = await fs.readFile(filePath, 'utf-8');
  const filename = path.basename(filePath);
  
  // Extract version from filename (e.g., 001_initial_schema.sql -> 001)
  const versionMatch = filename.match(/^(\d+)_/);
  const version = versionMatch ? versionMatch[1] : filename;
  
  // Extract description from comment or filename
  const descriptionMatch = content.match(/-- Description: (.+)/);
  const description = descriptionMatch 
    ? descriptionMatch[1] 
    : filename.replace(/^\d+_/, '').replace(/\.sql$/, '').replace(/_/g, ' ');
  
  return {
    filename,
    version: version || filename,
    description: description || 'No description',
    sql: content
  };
};

// Run pending migrations
export const runMigrations = async (): Promise<void> => {
  try {
    console.log('🔄 Checking for database migrations...');
    
    // Create migrations table
    await createMigrationsTable();
    
    // Get migration files
    const migrationsDir = path.join(process.cwd(), 'database', 'migrations');
    
    try {
      await fs.access(migrationsDir);
    } catch (error) {
      console.log('📁 No migrations directory found, skipping migrations');
      return;
    }
    
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();
    
    if (sqlFiles.length === 0) {
      console.log('📄 No migration files found');
      return;
    }
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    
    // Process each migration file
    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const migration = await parseMigrationFile(filePath);
      
      if (executedMigrations.includes(migration.version)) {
        console.log(`⏭️  Migration ${migration.version} already executed`);
        continue;
      }
      
      console.log(`🔄 Running migration ${migration.version}: ${migration.description}`);
      
      try {
        // Execute migration SQL
        await executeQuery(migration.sql);
        
        // Mark as executed
        await markMigrationExecuted(migration);
        
        console.log(`✅ Migration ${migration.version} completed successfully`);
      } catch (error) {
        console.error(`❌ Migration ${migration.version} failed:`, error);
        throw error;
      }
    }
    
    console.log('✅ All migrations completed successfully');
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    throw error;
  }
};