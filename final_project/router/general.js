const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let authenticatedUser = require("./auth_users.js").authenticatedUser;
let doesExist = require("./auth_users.js").isValid;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list using async-await
public_users.get('/', async (req, res) => {
    try {
        // Simulate async fetching
        const result = await new Promise((resolve, reject) => {
            if (books) {
                resolve(books);
            } else {
                reject("No books found");
            }
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err });
    }
});

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        let book = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject("Book not found");
            }
        });
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author.toLowerCase();

    try {
        let filteredBooks = await new Promise((resolve, reject) => {
            let results = Object.values(books).filter(book =>
                book.author.toLowerCase() === author
            );
            if (results.length > 0) {
                resolve(results);
            } else {
                reject("No books found for this author");
            }
        });
        res.status(200).json(filteredBooks);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

// Get book details based on title using async-await
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title.toLowerCase();

    try {
        let filteredBooks = await new Promise((resolve, reject) => {
            let results = Object.values(books).filter(book =>
                book.title.toLowerCase() === title
            );
            if (results.length > 0) {
                resolve(results);
            } else {
                reject("No books found for this title");
            }
        });
        res.status(200).json(filteredBooks);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
