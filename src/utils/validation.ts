import { promises as fs } from 'fs';
import path from 'path';
import config from '../config/environment';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate project setup
export const validateProjectSetup = async (): Promise<ValidationResult> => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // Check if required directories exist
    const requiredDirs = [
      config.uploadDir,
      'src',
      'src/config',
      'src/middleware',
      'src/utils'
    ];

    for (const dir of requiredDirs) {
      try {
        await fs.access(dir);
      } catch (error) {
        result.errors.push(`Required directory missing: ${dir}`);
        result.isValid = false;
      }
    }

    // Check if required files exist
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      '.env',
      'src/app.ts',
      'src/server.ts',
      'src/config/database.ts',
      'src/config/environment.ts'
    ];

    for (const file of requiredFiles) {
      try {
        await fs.access(file);
      } catch (error) {
        result.errors.push(`Required file missing: ${file}`);
        result.isValid = false;
      }
    }

    // Check environment variables
    const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        result.warnings.push(`Environment variable not set: ${envVar}`);
      }
    }

    // Check if JWT secret is still default
    if (process.env.JWT_SECRET === 'dev-secret-key-change-in-production') {
      result.warnings.push('JWT_SECRET is using default development value');
    }

    // Check Node.js version
    const nodeVersion = process.version;
    if (!nodeVersion) {
      result.errors.push('Unable to determine Node.js version');
      result.isValid = false;
    } else {
      const versionParts = nodeVersion.slice(1).split('.');
      const majorVersionStr = versionParts[0];
      if (!majorVersionStr) {
        result.errors.push('Unable to parse Node.js version');
        result.isValid = false;
      } else {
        const majorVersion = parseInt(majorVersionStr);
        if (majorVersion < 18) {
          result.errors.push(`Node.js 18+ required, current version: ${nodeVersion}`);
          result.isValid = false;
        }
      }
    }

  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.isValid = false;
  }

  return result;
};

// Print validation results
export const printValidationResults = (result: ValidationResult): void => {
  console.log('\n🔍 Project Setup Validation Results:');
  console.log('=====================================');

  if (result.isValid) {
    console.log('✅ Project setup is valid!');
  } else {
    console.log('❌ Project setup has errors:');
    result.errors.forEach(error => console.log(`   • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  console.log('=====================================\n');
};