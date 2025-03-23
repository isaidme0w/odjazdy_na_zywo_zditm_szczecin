const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const BASE_URL = 'https://www.zditm.szczecin.pl/api/v1';

app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/stops`);
        const stops = response.data.data.map(stop => ({
            id: stop.id,
            number: stop.number,
            name: stop.name
        }));
        res.render('stops', { stops });
    } catch (error) {
        res.status(500).send('Błąd podczas pobierania listy przystanków');
    }
});

app.get('/departures/:stopNumber', async (req, res) => {
    const { stopNumber } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/displays/${stopNumber}`);
        res.render('departures', { stop: response.data });
    } catch (error) {
        res.status(500).send('Błąd podczas pobierania odjazdów dla przystanku');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});