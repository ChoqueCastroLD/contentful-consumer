# Contentful Consumer API

A RESTful API built with NestJS that consumes and synchronizes product data from Contentful, providing endpoints for product management and reporting.

## Features

- 🔐 JWT Authentication
- 📦 Product Management
- 📊 Reporting System
- 🔄 Contentful Synchronization
- 📝 Swagger Documentation
- 🧪 Test Coverage
- 🐳 Docker Support

## Prerequisites

- Node.js (v22 or higher)
- Docker and Docker Compose
- PostgreSQL
- Contentful Account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Contentful Configuration
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_CONTENT_TYPE=product

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=contentful_rest

# JWT Configuration
JWT_SECRET=your_jwt_secret
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ChoqueCastroLD/contentful-consumer
cd contentful-consumer
```

2. Install dependencies:
```bash
npm install
```

3. Start the application using Docker:
```bash
docker-compose up -d
```

## Docker

Build and run the application using Docker:

```bash
docker-compose up -d
```

## Available Scripts

- `npm run build` - Build the application
- `npm run format` - Format code using Prettier
- `npm run start` - Start the application in production mode
- `npm run start:dev` - Start the application in development mode
- `npm run start:debug` - Start the application in debug mode
- `npm run start:prod` - Start the application in production mode
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:debug` - Run tests in debug mode
- `npm run test:e2e` - Run end-to-end tests
- `npm run generate:token` - Generate a JWT token for authentication
- `npm run sync:products` - Synchronize products from Contentful

## Docker Scripts

To run scripts inside the Docker container:

```bash
# Generate JWT token
docker-compose exec app npm run gen:token

# Synchronize products
# You should run this one while the container is running to get a initial batch of data
docker-compose exec app npm run sync:products
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

### Authentication

1. Generate a JWT token:
```bash
npm run gen:token
```

2. Use the token in your requests:
```
Authorization: Bearer <your_token>
```

### Endpoints

#### Public Endpoints

- `GET /products` - Get all products with optional filters
  - Query Parameters:
    - `name` (string, optional) - Filter by product name
    - `category` (string, optional) - Filter by category
    - `minPrice` (number, optional) - Minimum price
    - `maxPrice` (number, optional) - Maximum price
    - `page` (number, optional, default: 1) - Page number for pagination
    - `limit` (number, optional, default: 10) - Items per page
    - `search` (string, optional) - Search query
    - `startDate` (string, optional) - Start date for filtering
    - `endDate` (string, optional) - End date for filtering

- `DELETE /products/:id` - Soft delete a product by ID

#### Private Endpoints (Require Authentication)

- `GET /reports/deleted-products-percentage` - Get percentage of deleted products
- `GET /reports/non-deleted-products-percentage` - Get percentage of non-deleted products with filters
  - Query Parameters:
    - `priceMin` (number, optional) - Minimum price
    - `priceMax` (number, optional) - Maximum price
    - `startDate` (string, optional) - Start date
    - `endDate` (string, optional) - End date
- `GET /reports/price-range-stats` - Get product statistics by price ranges
  - Query Parameters:
    - `ranges` (string, optional) - Comma-separated price ranges (e.g., "0-100,101-500,501-1000")

## Project Structure

```
src/
├── auth/                 # Authentication module
├── modules/
│   ├── public/          # Public endpoints
│   │   └── products/    # Product management
│   ├── private/         # Private endpoints
│   │   └── reports/     # Reporting system
│   └── common/          # Shared services
├── scheduler/           # Scheduled tasks
└── scripts/            # Utility scripts
```

## Test Coverage

Current test coverage report (as of latest update):

### Overall Project Coverage
| Metric | Coverage |
|--------|----------|
| Statements | 56.34% |
| Branches | 54.16% |
| Functions | 63.82% |
| Lines | 55.18% |

### High Coverage (80-100%)
| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| reports.service.ts | 100% | 100% | 100% | 100% |
| reports.controller.ts | 100% | 100% | 100% | 100% |
| app.controller.ts | 100% | 100% | 100% | 100% |
| auth.service.ts | 92.85% | 66.66% | 100% | 91.66% |
| product.dto.ts | 100% | 100% | 100% | 100% |
| scheduler.service.ts | 100% | 100% | 100% | 100% |

### Medium Coverage (50-79%)
| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| products.service.ts | 74.46% | 61.29% | 100% | 72.09% |
| filter-products.dto.ts | 76.47% | 100% | 0% | 76.47% |

To run the coverage report:
```bash
npm run test:cov
```
