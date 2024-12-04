//user.js
const express = require('express');
const bcrypt = require('bcrypt'); // For password hashing
const connection = require('./db'); // Import the database connection

const router = express.Router();

// User registration endpoint
router.post('/register', async (req, res) => {
    const { username, email, age, gender, password, skintype } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    try {
        // Check for duplicate email
        connection.query('SELECT * FROM Users WHERE Email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Error checking email:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: 'Email is already registered.' });
            }

            // Hash the password for secure storage
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the user into the database
            const query = `
                INSERT INTO Users (UserId, UserName, Email, Age, Gender, Password, SkinType)
                VALUES (UUID(), ?, ?, ?, ?, ?, ?)
            `;
            const params = [username, email, age || null, gender || null, hashedPassword, skintype || null];

            console.log('Executing query:', query, params);
            connection.query(query, params, (insertErr, result) => {
                if (insertErr) {
                    console.error('Error registering user:', insertErr);
                    return res.status(500).json({ message: 'Database error' });
                }

                res.status(201).json({ message: 'User registered successfully!' });
            });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// User sign-in endpoint
router.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check if user exists
    connection.query('SELECT * FROM Users WHERE Email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const user = results[0];

        // Compare hashed passwords
        const isPasswordValid = await bcrypt.compare(password, user.Password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Return success response
        res.status(200).json({ message: 'Sign in successful!', user: { id: user.UserId, username: user.UserName, email: user.Email } });
    });
});

// Add an item to the user's wishlist
router.post('/wishlist', (req, res) => {
    const { UserId, ProductId } = req.body;

    // Validate required fields
    if (!UserId || !ProductId) {
        return res.status(400).json({ message: 'UserId and ProductId are required.' });
    }

    const query = `
        INSERT INTO WishListItem (UserId, ProductId)
        VALUES (?, ?)
    `;
    const params = [UserId, ProductId];

    connection.query(query, params, (err, result) => {
        if (err) {
            console.error('Error adding to wishlist:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.status(201).json({ message: 'Item added to wishlist successfully!' });
    });
});

// Get wishlist items for a user
router.get('/wishlist/:userId', (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT w.RecordId, w.ProductId, p.ProductName, p.Price, p.Category, p.BrandId 
        FROM WishListItem w
        JOIN Products p ON w.ProductId = p.ProductId
        WHERE w.UserId = ?
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching wishlist:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.status(200).json(results);
    });
});

module.exports = router;


