import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { bookService, Book } from '../api/bookService';

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book>({ title: '', author: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAll();
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des livres');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleOpen = (book?: Book) => {
    if (book) {
      setCurrentBook(book);
      setIsEditing(true);
    } else {
      setCurrentBook({ title: '', author: '', description: '' });
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentBook({ ...currentBook, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && currentBook.id) {
        await bookService.update(currentBook.id, currentBook);
      } else {
        await bookService.create(currentBook);
      }
      handleClose();
      fetchBooks();
    } catch (err) {
      setError("Erreur lors de l'enregistrement du livre");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      try {
        await bookService.delete(id);
        fetchBooks();
      } catch (err) {
        setError('Erreur lors de la suppression du livre');
      }
    }
  };

  if (loading && books.length === 0) return <Box sx={{ display: "flex", justifyContent: "center", m: 4 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">Gestion des Livres</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Ajouter un livre
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Auteur</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.description}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(book)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => book.id && handleDelete(book.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {books.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">Aucun livre trouvé</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? 'Modifier le livre' : 'Ajouter un nouveau livre'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Titre"
              name="title"
              value={currentBook.title}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Auteur"
              name="author"
              value={currentBook.author}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={currentBook.description || ''}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookList;
