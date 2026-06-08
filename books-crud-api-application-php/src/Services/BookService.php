<?php

namespace App\Services;

use Aws\DynamoDb\DynamoDbClient;
use Aws\DynamoDb\Marshaler;

class BookService
{
    private DynamoDbClient $dynamoDb;
    private string $tableName;
    private Marshaler $marshaler;

    public function __construct()
    {
        $this->dynamoDb = new DynamoDbClient([
            'region' => getenv('AWS_REGION') ?: 'us-east-1',
            'version' => 'latest'
        ]);
        $this->tableName = getenv('DB_TABLE') ?: 'Books';
        $this->marshaler = new Marshaler();
    }

    public function getAllBooks(): array
    {
        $result = $this->dynamoDb->scan([
            'TableName' => $this->tableName
        ]);

        return array_map(function ($item) {
            return $this->marshaler->unmarshalItem($item);
        }, $result['Items'] ?? []);
    }

    public function getBookById(string $id): ?array
    {
        $result = $this->dynamoDb->getItem([
            'TableName' => $this->tableName,
            'Key' => $this->marshaler->marshalItem(['id' => $id])
        ]);

        if (empty($result['Item'])) {
            return null;
        }

        return $this->marshaler->unmarshalItem($result['Item']);
    }

    public function createBook(array $data): array
    {
        $id = bin2hex(random_bytes(16));
        $book = [
            'id' => $id,
            'title' => $data['title'],
            'author' => $data['author'],
            'description' => $data['description'] ?? null,
            'createdAt' => date('c')
        ];

        $this->dynamoDb->putItem([
            'TableName' => $this->tableName,
            'Item' => $this->marshaler->marshalItem($book)
        ]);

        return $book;
    }

    public function updateBook(string $id, array $data): ?array
    {
        $currentBook = $this->getBookById($id);
        if (!$currentBook) {
            return null;
        }

        $updatedBook = array_merge($currentBook, $data);
        // Ensure ID doesn't change
        $updatedBook['id'] = $id;

        $this->dynamoDb->putItem([
            'TableName' => $this->tableName,
            'Item' => $this->marshaler->marshalItem($updatedBook)
        ]);

        return $updatedBook;
    }

    public function deleteBook(string $id): void
    {
        $this->dynamoDb->deleteItem([
            'TableName' => $this->tableName,
            'Key' => $this->marshaler->marshalItem(['id' => $id])
        ]);
    }
}
