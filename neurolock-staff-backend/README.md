# NeuroLock Backend

## Setup Instructions

1. **Create Database**: 
   - Run PostgreSQL and create a database named `neuro_app`.

2. **Set Environment Variables**:
   - Copy `.env.example` to `.env` and update the values accordingly.

3. **Run Migrations**:
   - Execute the migration script:
     ```
     node src/infra/db/migrate.js
     ```

4. **Start the Server**:
   - Run the server:
     ```
     npm start
     ```

5. **Smoke Test**:
   - Use curl to test the health endpoint:
     ```
     curl http://localhost:4311/health
     ```

## Testing

- Run unit tests:
  ```
  npm test
  ```

- Run end-to-end tests:
  ```
  npm run test:e2e
  ```

## Commands in package.json
- `dev`: Start the development server
- `start`: Start the production server
- `migrate`: Run migrations
- `rollback`: Rollback migrations
- `test`: Run tests
- `lint`: Lint the code