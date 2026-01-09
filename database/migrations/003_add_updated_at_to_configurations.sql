-- Add updated_at column to default_configurations table for version tracking
-- Migration: 003_add_updated_at_to_configurations.sql

USE enterprise_navigation;

-- Add updated_at column to default_configurations table
ALTER TABLE default_configurations 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
AFTER created_at;

-- Update existing records to have updated_at = created_at
UPDATE default_configurations 
SET updated_at = created_at 
WHERE updated_at IS NULL;