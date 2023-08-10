const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const pug = require('pug');

const app = express();
const PORT = 3008;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.get('/books', (req, res) => {
  try {
    const books = JSON.parse(fs.readFileSync('books.json', 'utf8'));
    const compiledFunction = pug.compileFile(path.join(__dirname, 'views', 'books.pug'));
    const html = compiledFunction({ books });
    res.send(html);
  } catch (error) {
    res.status(500).send('Error reading books data.');
  }
});

app.get('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send('Invalid book ID');
    }
    try {
      const books = JSON.parse(fs.readFileSync('books.json', 'utf8'));
      console.log('Books:', JSON.stringify(books, null, 2)); // Add this line
      const book = books.find((book) => book.id === id);
      console.log('Requested ID:', id); // Add this line
      console.log('Found Book:', book); // Add this line
      if (!book) {
        return res.status(404).send('Book not found');
      }
  
      const compiledFunction = pug.compileFile(path.join(__dirname, 'views', 'booksDetails.pug'));
      const html = compiledFunction({ book });
      res.send(html);
    } catch (error) {
      res.status(500).send('Error reading books data.');
    }
  });
  

app.post('/books', (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).send('Both ID and Name are required.');
  }

  try {
    let books = [];
    if (fs.existsSync('books.json')) {
      books = JSON.parse(fs.readFileSync('books.json', 'utf8'));
    }

    books.push({ id: parseInt(id), name });
    fs.writeFileSync('books.json', JSON.stringify(books, null, 2), 'utf8');
    res.send('Book added successfully.');
  } catch (error) {
    res.status(500).send('Error adding book.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
