# Books CRUD API Frontend (Book App & Swagger UI)

This is a React-based frontend application that provides a user-friendly interface to manage books and an interactive API documentation via Swagger UI.

## Features

- **Books Management App**: A complete CRUD interface to list, create, update, and delete books.
- **Interactive API Documentation**: Explore all available endpoints of the Books CRUD API using Swagger UI.
- **API Testing**: Test the API directly from the browser by making requests to the configured API URL.

## Technologies

- **React**
- **TypeScript**
- **Material UI (MUI)**: For the user interface components.
- **swagger-ui-react**: For API documentation.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [npm](https://www.npmjs.com/)

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the development server**:
    ```bash
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application in your browser. You can switch between the "Books App" and "Swagger API Docs" tabs.

## Configuration

The API specification is located at `src/swagger.json`. You can update the `servers` section in this file to point to your actual API Gateway URL.

```json
  "servers": [
    {
      "url": "https://api.clouddevops.ca",
      "description": "Production server"
    }
  ],
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner.

### `npm run build`

Builds the app for production to the `build` folder.
