<?php

namespace App\Controllers;

use App\Services\BookService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class BookController
{
    private BookService $bookService;

    public function __construct()
    {
        $this->bookService = new BookService();
    }

    public function list(Request $request, Response $response): Response
    {
        $books = $this->bookService->getAllBooks();
        $response->getBody()->write(json_encode($books));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function create(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);

        if (!isset($data['title']) || !isset($data['author'])) {
            $response->getBody()->write(json_encode(['message' => 'Title and Author are required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $book = $this->bookService->createBook($data);
        $response->getBody()->write(json_encode($book));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public function get(Request $request, Response $response, array $args): Response
    {
        $id = $args['id'];
        $book = $this->bookService->getBookById($id);

        if (!$book) {
            $response->getBody()->write(json_encode(['message' => 'Book not found']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($book));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $id = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);

        $book = $this->bookService->updateBook($id, $data);

        if (!$book) {
            $response->getBody()->write(json_encode(['message' => 'Book not found']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($book));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        $id = $args['id'];
        $this->bookService->deleteBook($id);

        return $response->withStatus(204)->withHeader('Content-Type', 'application/json');
    }
}
