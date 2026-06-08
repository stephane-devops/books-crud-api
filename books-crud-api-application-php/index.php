<?php

require __DIR__ . '/vendor/autoload.php';

use App\Controllers\BookController;
use App\Middleware\CorsMiddleware;
use Slim\Factory\AppFactory;

$app = AppFactory::create();

$app->add(new CorsMiddleware());
$app->addRoutingMiddleware();

$bookController = new BookController();

$app->get('/books', [$bookController, 'list']);
$app->post('/books', [$bookController, 'create']);
$app->get('/books/{id}', [$bookController, 'get']);
$app->put('/books/{id}', [$bookController, 'update']);
$app->delete('/books/{id}', [$bookController, 'delete']);

$app->options('/{routes:.+}', function ($request, $response) {
    return $response;
});

return $app;
