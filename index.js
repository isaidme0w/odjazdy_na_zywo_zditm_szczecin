const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const BASE_URL = 'https://www.zditm.szczecin.pl/api/v1';

app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

let stopsData = {};

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/stops`);
        const stops = response.data.data.map(stop => {
            stopsData[stop.number] = { name: stop.name, request_stop: stop.request_stop };
            return {
                id: stop.id,
                number: stop.number,
                name: stop.name,
                request_stop: stop.request_stop
            }
        });
        res.render('stops', { stops });
    } catch (error) {
        res.status(500).send('Błąd podczas pobierania listy przystanków');
    }
});

app.get('/departures/:stopNumber', async (req, res) => {
    const { stopNumber } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/displays/${stopNumber}`);
        const stopInfo = response.data;
        if (stopsData[stopNumber]) {
            stopInfo.request_stop = stopsData[stopNumber].request_stop;
        } else {
            stopInfo.request_stop = false;
        }
        res.render('departures', { stop: stopInfo });
    } catch (error) {
        res.status(500).send('Błąd podczas pobierania odjazdów dla przystanku');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});