# Books CRUD API (PHP Application)

This is a PHP-based Books CRUD API built with the Slim Framework and Bref, designed to run as an AWS Lambda function.

## Technologies

- **PHP 8.3**
- **Slim Framework 4**: Light-weight micro-framework for PHP.
- **Bref**: Tool to deploy PHP applications to AWS Lambda.
- **AWS SDK for PHP**: To interact with Amazon DynamoDB.
- **Amazon DynamoDB**: NoSQL database for storing book data.
- **Docker**: For containerizing the application.

## Prerequisites

- [Docker](https://www.docker.com/)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate permissions.
- [Composer](https://getcomposer.org/) (optional, for local dependency management).

## Pushing the first image to ECR

Follow these steps to build your Docker image and push it to the Amazon ECR repository.

Set your AWS Account ID and Region as environment variables:

```bash
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-east-1
```

### 1. Authenticate Docker to your ECR registry

```bash
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

### 2. Build the Docker image

Run this command from the `books-crud-api-application-php` directory:

```bash
docker build -t books-crud-api .
```

### 3. Tag the image

Tag your image with the ECR repository URI:

```bash
docker tag books-crud-api:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/books-crud-api:latest
```

### 4. Push the image to ECR

```bash
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/books-crud-api:latest
```

## API Endpoints

- `GET /books`: List all books.
- `GET /books/{id}`: Get a specific book.
- `POST /books`: Create a new book.
- `PUT /books/{id}`: Update an existing book.
- `DELETE /books/{id}`: Delete a book.

## Testing the API

You can use `curl` to test the API endpoints. Replace `<API_URL>` with your actual API Gateway URL (e.g., `https://api.clouddevops.ca` or the AWS-provided endpoint).


```bash
export API_URL=https://api.clouddevops.ca
```


### 1. Create a new book
```bash
curl -X POST $API_URL/books \
     -H "Content-Type: application/json" \
     -d '{"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "description": "A classic novel about the American Dream"}'
```

### 2. List all books
```bash
curl -X GET $API_URL/books
```

### 3. Get a specific book
Replace `{id}` with the ID returned from the create or list command.
```bash
curl -X GET $API_URL/books/{id}
```

### 4. Update a book
```bash
curl -X PUT $API_URL/books/{id} \
     -H "Content-Type: application/json" \
     -d '{"title": "The Great Gatsby (Updated)", "description": "Updated description"}'
```

### 5. Delete a book
```bash
curl -X DELETE $API_URL/books/{id}
```

## Deployment

This application is intended to be deployed via CDKTF (Cloud Development Kit for Terraform). Ensure you have pushed the Docker image to ECR before deploying the application cloud resources.
