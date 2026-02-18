const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    return users.some((user) => user.username === username);
};

const getAllBooks = () => {
    return books;
};

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Missing username or password" });
    } else if (doesExist(username)) {
        return res.status(404).json({ message: "user already exists." });
    } else {
        users.push({ username: username, password: password });
        return res
            .status(200)
            .json({ message: "User successfully registered.  Please login." });
    }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const allBooks = await getAllBooks();
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch books",
            error: error.message
        });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    const book = await books[isbn];

    if (book) {
        res.send(book);
    } else {
        res.status(404).send({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const authorBooks = Object.values(await books).filter(
        (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
    );

    if (authorBooks.length > 0) {
        return res.status(200).send(JSON.stringify(authorBooks, null, 4));
    } else {
        return res.status(404).json({ message: "No books by that author." });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const titleBooks = Object.values(await books).find(
        (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
    );

    if (titleBooks) {
        return res.status(200).send(JSON.stringify(titleBooks, null, 4));
    } else {
        return res.status(404).json({ message: "No books with that title." });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const bookRequired = books[isbn]
    if (bookRequired) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: "No books with that ISBN." });
    }
});

module.exports.general = public_users;
