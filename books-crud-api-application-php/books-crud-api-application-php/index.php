<?php

require __DIR__ . '/vendor/autoload.php';

use Aws\DynamoDb\DynamoDbClient;
use Aws\DynamoDb\Marshaler;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

$app = AppFactory::create();

$dynamoDb = new DynamoDbClient([
    'region' => getenv('AWS_REGION') ?: 'us-east-1',
    'version' => 'latest'
]);
$tableName = getenv('DB_TABLE') ?: 'Books';
$marshaler = new Marshaler();

$app->get('/books', function (Request $request, Response $response) use ($dynamoDb, $tableName, $marshaler) {
    $result = $dynamoDb->scan([
        'TableName' => $tableName
    ]);

    $books = array_map(function ($item) use ($marshaler) {
        return $marshaler->unmarshalItem($item);
    }, $result['Items'] ?? []);

    $response->getBody()->write(json_encode($books));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/books', function (Request $request, Response $response) use ($dynamoDb, $tableName, $marshaler) {
    $data = json_decode($request->getBody()->getContents(), true);

    if (!isset($data['title']) || !isset($data['author'])) {
        $response->getBody()->write(json_encode(['message' => 'Title and Author are required']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $id = bin2hex(random_bytes(16));
    $book = [
        'id' => $id,
        'title' => $data['title'],
        'author' => $data['author'],
        'description' => $data['description'] ?? null,
        'createdAt' => date('c')
    ];

    $dynamoDb->putItem([
        'TableName' => $tableName,
        'Item' => $marshaler->marshalItem($book)
    ]);

    $response->getBody()->write(json_encode($book));
    return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
});

$app->get('/books/{id}', function (Request $request, Response $response, array $args) use ($dynamoDb, $tableName, $marshaler) {
    $id = $args['id'];
    $result = $dynamoDb->getItem([
        'TableName' => $tableName,
        'Key' => $marshaler->marshalItem(['id' => $id])
    ]);

    if (!$result['Item']) {
        $response->getBody()->write(json_encode(['message' => 'Book not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }

    $response->getBody()->write(json_encode($marshaler->unmarshalItem($result['Item'])));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->put('/books/{id}', function (Request $request, Response $response, array $args) use ($dynamoDb, $tableName, $marshaler) {
    $id = $args['id'];
    $data = json_decode($request->getBody()->getContents(), true);

    $result = $dynamoDb->getItem([
        'TableName' => $tableName,
        'Key' => $marshaler->marshalItem(['id' => $id])
    ]);

    if (!$result['Item']) {
        $response->getBody()->write(json_encode(['message' => 'Book not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }

    $currentData = $marshaler->unmarshalItem($result['Item']);
    $updatedData = array_merge($currentData, $data);

    $dynamoDb->putItem([
        'TableName' => $tableName,
        'Item' => $marshaler->marshalItem($updatedData)
    ]);

    $response->getBody()->write(json_encode($updatedData));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->delete('/books/{id}', function (Request $request, Response $response, array $args) use ($dynamoDb, $tableName, $marshaler) {
    $id = $args['id'];
    $dynamoDb->deleteItem([
        'TableName' => $tableName,
        'Key' => $marshaler->marshalItem(['id' => $id])
    ]);

    return $response->withStatus(204)->withHeader('Content-Type', 'application/json');
});

return $app;
