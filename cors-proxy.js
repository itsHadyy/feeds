import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

// Enable CORS for all routes
app.use(cors());

app.get('/fetch-xml', async (req, res) => {
    try {
        const xmlUrl = req.query.url; // Get the XML URL from query params
        if (!xmlUrl) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Fetching XML from: ${xmlUrl}`);

        // Fetch the XML data from the external URL
        const response = await fetch(xmlUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch XML');
        }

        const xmlData = await response.text();
        res.send(xmlData); // Send raw XML as response
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the proxy server on port 5000
const PORT = 5000;
app.listen(PORT, () => console.log(`CORS Proxy running on port ${PORT}`));