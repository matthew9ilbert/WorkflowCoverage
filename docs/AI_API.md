# AI Assistant API Documentation

## Authentication
- Requires valid JWT + API key header:
  ```
  Authorization: Bearer <JWT>
  X-AI-API-Key: <API_KEY>
  ```

## Endpoints

### POST `/api/ai/assist`
- **Description**: Get expert code assistance
- **Request Body**:
  ```json
  {
    "message": "Your question or request",
    "context": "Optional additional context"
  }
  ```
- **Response**:
  ```json
  {
    "response": "Expert analysis",
    "suggestions": ["Optimizations", "Bug fixes"]
  }
  ```

### GET `/api/ai/insights`
- **Description**: Get automated codebase review
- **Response**:
  ```json
  {
    "suggestions": ["Security improvements"],
    "warnings": ["Performance bottlenecks"]
  }
  ```

## Access Control
Only available to:
- Owners
- Administrators
- Explicitly assigned users

## Rate Limits
- 10 requests/minute
- 100 requests/day
