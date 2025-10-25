# Banking Application

A Node.js application for managing bank accounts and transactions using DomainvDriven Design principles with TypeScript and MongoDB.

## Features

- Create and manage bank accounts
- Deposit and withdraw money
- Transfer money between accounts
- View transaction history
- RESTful API with Swagger documentation

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Documentation**: Swagger UI
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose

## Architecture

This application follows Domain-Driven Design (DDD) principles with a layered architecture:

- **Domain Layer**: Core business logic and rules
- **Application Layer**: Orchestrates the domain objects
- **Infrastructure Layer**: Database access and external services
- **API Layer**: REST API controllers and routes

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd banking-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start MongoDB using Docker Compose

```bash
docker-compose up -d
```

This will start MongoDB and Mongo Express (a web-based MongoDB admin interface).

- MongoDB will be available at `mongodb://localhost:27017`
- Mongo Express will be available at `http://localhost:8081`

### 4. Set up environment variables

Create a `.env` file in the root directory with the following content:

```
PORT=3000
MONGO_URI=mongodb://admin:password@localhost:27017/banking?authSource=admin
NODE_ENV=development
```

### 5. Build and run the application

For development with hot-reloading:

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

### 6. Access the API documentation

Once the application is running, you can access the Swagger UI documentation at:

```
http://localhost:3000/api-docs
```

## API Endpoints

### Account Endpoints

- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/:id` - Get account by ID
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id/transactions` - Get transactions for account

### Transaction Endpoints

- `POST /api/transactions/deposit` - Deposit money to account
- `POST /api/transactions/withdraw` - Withdraw money from account
- `POST /api/transactions/transfer` - Transfer money between accounts

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
/
├── src/
│   ├── domain/              # Domain layer (entities, value objects, domain services)
│   ├── application/         # Application layer (application services, DTOs)
│   ├── infrastructure/      # Infrastructure layer (database, repositories)
│   ├── api/                 # API layer (controllers, routes, middleware)
│   └── server.ts            # Express application setup
├── tests/                   # Test files
├── docker-compose.yml       # Docker Compose configuration
├── package.json             # Project dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Development

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

## License

MIT