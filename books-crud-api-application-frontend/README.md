# Books CRUD API Frontend (Swagger UI)

This is a React-based frontend application that uses `swagger-ui-react` to provide an interactive API documentation and test interface for the Books CRUD API.

## Features

- **Interactive API Documentation**: Explore all available endpoints of the Books CRUD API.
- **API Testing**: Test the API directly from the browser by making requests to the configured API URL.

## Technologies

- **React**
- **TypeScript**
- **swagger-ui-react**

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
    Open [http://localhost:3000](http://localhost:3000) to view the Swagger UI in your browser.

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
