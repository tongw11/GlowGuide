const express = require('express');
const router = express.Router();
const connection = require('./db');

const calculateCosineSimilarity = (vectorA, vectorB) => {
    const dotProduct = vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, value) => sum + value * value, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, value) => sum + value * value, 0));

    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};

const assignAgeRange = (age) => {
    if (age < 18) return '0-18';
    if (age >= 18 && age <= 24) return '18-24';
    if (age >= 25 && age <= 34) return '25-34';
    if (age >= 35 && age <= 44) return '35-44';
    if (age >= 45 && age <= 54) return '45-54';
    return '55+';
};



router.get('/:userId/recommendations', async (req, res) => {
    const { userId } = req.params;

    // Step 1: Fetch user demographics
    const demographicsQuery = 'SELECT UserId, SkinType, Gender, Age FROM Users';
    connection.query(demographicsQuery, (error, users) => {
        if (error) {
            console.error('Error fetching user demographics:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        const usersWithAgeRange = users.map((user) => ({
            ...user,
            AgeRange: assignAgeRange(user.Age),
        }));

        // Step 3: Encode demographics into vectors
        const categories = {
            SkinType: ['Oily', 'Dry', 'Combination', 'Normal'],
            Gender: ['Male', 'Female', 'Other'],
            AgeRange: ['18-24', '25-34', '35-44', '45-54', '55+'],
        };

        const encodedUsers = usersWithAgeRange.map((user) => {
            const skinTypeVector = categories.SkinType.map((type) => (user.SkinType === type ? 1 : 0));
            const genderVector = categories.Gender.map((gender) => (user.Gender === gender ? 1 : 0));
            const ageRangeVector = categories.AgeRange.map((range) => (user.AgeRange === range ? 1 : 0));

            return {
                UserId: user.UserId,
                vector: [...skinTypeVector, ...genderVector, ...ageRangeVector],
            };
        });
        console.log('Users with Age Range:', usersWithAgeRange);
        // console.log("encodedUsers", encodedUsers);

        // Step 4: Find the current user
        const currentUser = encodedUsers.find((user) => user.UserId === userId);
        console.log("currentUser: ", currentUser);
        if (!currentUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Step 3: Calculate cosine similarity
        const similarityScores = encodedUsers
            .filter((user) => user.UserId !== currentUser.UserId) // Exclude the current user
            .map((user) => ({
                UserId: user.UserId,
                similarity: calculateCosineSimilarity(currentUser.vector, user.vector),
            }))
            .sort((a, b) => b.similarity - a.similarity); // Sort by similarity in descending order

        // Step 4: Get top similar users
        const topSimilarUsers = similarityScores.slice(0, 5).map((user) => user.UserId);
        console.log("Top Similarity Users: ", topSimilarUsers);

        // Step 5: Fetch products from similar users' wishlists
        const recommendationQuery = `
            SELECT DISTINCT 
            p.ProductId, 
            p.ProductName, 
            p.Category, 
            p.Price, 
            b.BrandName, 
            b.BrandCountry
            FROM WishListItem w
            JOIN Products p ON w.ProductId = p.ProductId
            JOIN Brands b ON p.BrandId = b.BrandId
            WHERE w.UserId IN (?)
        `;
        connection.query(recommendationQuery, [topSimilarUsers], (recError, products) => {
            if (recError) {
                console.error('Error fetching recommendations:', recError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            res.json(products);
        });
    });
});

module.exports = router;
