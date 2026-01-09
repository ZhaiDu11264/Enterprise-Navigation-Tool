# Reordering API Documentation

This document describes the drag-and-drop reordering backend implementation for the Enterprise Navigation Tool.

## Overview

The reordering system provides multiple endpoints to handle different reordering scenarios:

1. **Individual reordering** - Reorder links or groups separately
2. **Mixed reordering** - Reorder both links and groups in one request
3. **Batch operations** - Complex reordering with type-specific operations
4. **Cross-group moves** - Move links between groups while reordering

## API Endpoints

### 1. Reorder Links Only

**Endpoint:** `PUT /api/reorder/links`

**Description:** Reorder multiple links, optionally moving them between groups.

**Request Body:**
```json
{
  "linkOrders": [
    {
      "id": 1,
      "sortOrder": 2,
      "groupId": 3  // Optional: move to different group
    },
    {
      "id": 2,
      "sortOrder": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Links reordered successfully",
  "data": {
    "processedLinks": 2
  },
  "timestamp": "2024-01-06T10:30:00.000Z"
}
```

### 2. Reorder Groups Only

**Endpoint:** `PUT /api/reorder/groups`

**Description:** Reorder multiple groups.

**Request Body:**
```json
{
  "groupOrders": [
    {
      "id": 1,
      "sortOrder": 2
    },
    {
      "id": 2,
      "sortOrder": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Groups reordered successfully",
  "data": {
    "processedGroups": 2
  },
  "timestamp": "2024-01-06T10:30:00.000Z"
}
```

### 3. Batch Operations

**Endpoint:** `PUT /api/reorder/batch`

**Description:** Handle complex reordering scenarios with mixed operations.

**Request Body:**
```json
{
  "operations": [
    {
      "type": "group",
      "id": 1,
      "sortOrder": 1
    },
    {
      "type": "group", 
      "id": 2,
      "sortOrder": 2
    },
    {
      "type": "link",
      "id": 10,
      "sortOrder": 1,
      "groupId": 1  // Optional: move to different group
    },
    {
      "type": "link",
      "id": 11,
      "sortOrder": 2,
      "groupId": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch reordering completed successfully",
  "data": {
    "processedOperations": 4,
    "linkOperations": 2,
    "groupOperations": 2
  },
  "timestamp": "2024-01-06T10:30:00.000Z"
}
```

### 4. Legacy Mixed Reordering

**Endpoint:** `PUT /api/links/reorder`

**Description:** Legacy endpoint that handles both links and groups in one request.

**Request Body:**
```json
{
  "linkOrders": [
    {
      "id": 1,
      "sortOrder": 1,
      "groupId": 2  // Optional
    }
  ],
  "groupOrders": [
    {
      "id": 1,
      "sortOrder": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reordering completed successfully",
  "timestamp": "2024-01-06T10:30:00.000Z"
}
```

### 5. Individual Group Reordering

**Endpoint:** `PUT /api/groups/reorder`

**Description:** Alternative endpoint for reordering groups (same as `/api/reorder/groups`).

## Authentication

All reordering endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Validation Rules

### Link Orders
- `id`: Must be a positive integer
- `sortOrder`: Must be a non-negative integer
- `groupId`: Optional, must be a positive integer if provided

### Group Orders
- `id`: Must be a positive integer  
- `sortOrder`: Must be a non-negative integer

### Batch Operations
- `type`: Must be either "link" or "group"
- Other fields follow the same rules as individual operations

## Error Responses

### Authentication Error (401)
```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication required",
    "timestamp": "2024-01-06T10:30:00.000Z",
    "requestId": "req-123"
  }
}
```

### Validation Error (400)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "linkOrders.0.id",
        "message": "Link ID must be a positive integer"
      }
    ],
    "timestamp": "2024-01-06T10:30:00.000Z",
    "requestId": "req-123"
  }
}
```

### Resource Not Found (404)
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Link not found or access denied",
    "timestamp": "2024-01-06T10:30:00.000Z",
    "requestId": "req-123"
  }
}
```

## Usage Examples

### Simple Link Reordering
```javascript
// Swap the order of two links
const response = await fetch('/api/reorder/links', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    linkOrders: [
      { id: 1, sortOrder: 2 },
      { id: 2, sortOrder: 1 }
    ]
  })
});
```

### Move Link Between Groups
```javascript
// Move link 1 to group 3 and set it as first item
const response = await fetch('/api/reorder/links', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    linkOrders: [
      { id: 1, sortOrder: 1, groupId: 3 }
    ]
  })
});
```

### Complex Drag-and-Drop Scenario
```javascript
// Handle a complex drag-and-drop where groups are reordered
// and links are moved between groups
const response = await fetch('/api/reorder/batch', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    operations: [
      // Reorder groups first
      { type: 'group', id: 2, sortOrder: 1 },
      { type: 'group', id: 1, sortOrder: 2 },
      // Then move links
      { type: 'link', id: 5, sortOrder: 1, groupId: 2 },
      { type: 'link', id: 3, sortOrder: 2, groupId: 2 }
    ]
  })
});
```

## Implementation Notes

1. **Order of Operations**: In batch operations, groups are processed before links to ensure consistency.

2. **User Isolation**: All operations are scoped to the authenticated user - users can only reorder their own items.

3. **Group Validation**: When moving links to different groups, the system validates that the user owns the target group.

4. **Atomic Operations**: Each endpoint processes all items in the request atomically - if one fails, the entire operation fails.

5. **Sort Order Management**: The system doesn't automatically renumber sort orders - it uses the exact values provided in the request.

## Frontend Integration

These endpoints are designed to work with drag-and-drop libraries like:
- React DnD
- react-beautiful-dnd
- SortableJS
- HTML5 Drag and Drop API

The frontend should:
1. Track the new positions after drag-and-drop
2. Calculate the new sort orders
3. Send the appropriate reordering request
4. Update the UI optimistically or wait for confirmation