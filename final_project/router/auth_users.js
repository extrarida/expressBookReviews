const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []

// Check if a user with the given username already exists
const isValid = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Login endpoint
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // we expect ?review=This%20book%20is%20great
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "No review provided" });
    }

    // Initialize reviews object if not present
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or update review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/modified successfully",
        reviews: books[isbn].reviews
    });
});

// DELETE a book review (only for the logged-in user)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this user" });
    }

    // Delete the review of the logged-in user
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Your review has been deleted successfully",
        reviews: books[isbn].reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
