# Favicon Service Documentation

## Overview

The Favicon Service provides automatic favicon extraction, caching, and fallback functionality for the Enterprise Navigation Tool. It automatically attempts to fetch favicons when users add website links and provides a robust caching system to improve performance.

## Features

- **Automatic Favicon Extraction**: Extracts favicons from website HTML or common locations
- **Caching System**: Caches favicons in the database to reduce external requests
- **Fallback Icons**: Provides default icons when favicon extraction fails
- **Custom Icon Upload**: Allows users to upload custom icons for their links
- **Admin Cache Management**: Provides admin endpoints for cache management

## API Endpoints

### Extract Favicon
```
POST /api/favicon/extract
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Upload Custom Icon
```
POST /api/favicon/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form field: icon (file)
Supported formats: PNG, JPEG, GIF, SVG, ICO
Max size: 5MB
```

### Get Domain Favicon
```
GET /api/favicon/domain/:domain
Authorization: Bearer <token>
```

### Get Default Icon
```
GET /api/favicon/default
```

### Admin: Clear Cache (Admin Only)
```
DELETE /api/favicon/cache/:domain
Authorization: Bearer <admin-token>
```

### Admin: Cleanup Expired Cache (Admin Only)
```
POST /api/favicon/cache/cleanup
Authorization: Bearer <admin-token>
```

## Integration with Link Management

The favicon service is automatically integrated with the link management system:

1. When creating a new link without an `iconUrl`, the system automatically attempts to extract the favicon
2. When updating a link's URL without providing a new `iconUrl`, the system attempts to extract the favicon for the new URL
3. If favicon extraction fails, the system uses the default icon without failing the link creation/update

## Configuration

The service uses the following environment variables:

- `FAVICON_CACHE_TTL`: Cache time-to-live in seconds (default: 86400 = 24 hours)
- `FAVICON_TIMEOUT`: Request timeout in milliseconds (default: 5000 = 5 seconds)
- `UPLOAD_DIR`: Directory for storing uploaded icons (default: uploads)
- `MAX_FILE_SIZE`: Maximum file size for uploads (default: 5242880 = 5MB)

## Fallback Strategy

1. **HTML Parsing**: Looks for favicon links in the website's HTML
2. **Common Locations**: Checks standard favicon paths (/favicon.ico, /favicon.png, etc.)
3. **Default Icon**: Uses the default system icon if all else fails

## Cache Management

- Favicons are cached in the `favicon_cache` database table
- Cache entries expire after the configured TTL
- Expired entries are automatically cleaned up
- Admins can manually clear cache for specific domains
- Admins can trigger cleanup of all expired entries

## Error Handling

The service is designed to be fault-tolerant:

- Network errors don't prevent link creation
- Invalid URLs fall back to default icons
- File upload errors provide clear error messages
- All errors are logged for debugging

## File Storage

- Custom uploaded icons are stored in `uploads/icons/`
- Default icons are provided as SVG files
- Static file serving is configured for the uploads directory