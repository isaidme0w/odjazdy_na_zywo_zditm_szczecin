const express = require('express');
const axios = require('axios');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.APP_PORT;
const IP_A = process.env.APP_IP;
const BASE_URL = process.env.APP_BASE_URL;
const ROOT_DIR = process.env.APP_ROOT_DIR;

app.locals.root = ROOT_DIR;

app.use(express.json());
app.use(express.static('public'));
app.use(`${ROOT_DIR}img`, express.static(path.join(__dirname, "img/")));
app.set('view engine', 'ejs');

let stops = [];

async function fetchStops() {
    const d = new Date();
    try {
        const response = await axios.get(`${BASE_URL}/stops`);
        stopsData = {};
        stops = response.data.data.map(stop => {
            stopsData[stop.number] = { name: stop.name, request_stop: stop.request_stop };
            const short_number = String(stop.number).slice(-2);
            return {
                id: stop.id,
                number: stop.number,
                short_number,
                name: stop.name,
                request_stop: stop.request_stop
            }
        });
        console.log(`[${d.getFullYear()}-${addZero(d.getMonth() + 1)}-${addZero(d.getDate())} ${addZero(d.getHours())}:${addZero(d.getMinutes())}:${addZero(d.getSeconds())}] Successfully fetched stops.`);
    } catch (error) {
        console.error(`[${d.getFullYear()}-${addZero(d.getMonth() + 1)}-${addZero(d.getDate())} ${addZero(d.getHours())}:${addZero(d.getMinutes())}:${addZero(d.getSeconds())}] Błąd pobierania przystanków`, error.message);
    }
}

fetchStops();

cron.schedule('0 4 * * *', () => {
    fetchStops();
});

function addZero(i) {
    if (i < 10) {i = "0" + i}
    return i;
}

function constructLog(message, req) {
    const d = new Date();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return "[" + d.getFullYear() + "-" + addZero(d.getMonth() + 1) + "-" + addZero(d.getDate()) + " " + addZero(d.getHours()) + ":" + addZero(d.getMinutes()) + ":" + addZero(d.getSeconds()) + "] (" + ip + ") " + message;
}

app.get(`${ROOT_DIR}`, async (req, res) => {
    try {
        res.render('stops', { stops });
        console.log(constructLog(`Successfully sent stops`, req));
    } catch (error) {
        res.status(500).send('Błąd podczas wyświetlania przystanków');
        console.log(constructLog(`Error while sending stops`, req));
    }
});

app.get(`${ROOT_DIR}departures/:stopNumber`, async (req, res) => {
    const { stopNumber } = req.params;
    const short_number = stopNumber.slice(-2);
    try {
        const response = await axios.get(`${BASE_URL}/displays/${stopNumber}`);
        const stopInfo = response.data;
        if (stopsData[stopNumber]) {
            stopInfo.request_stop = stopsData[stopNumber].request_stop;
        } else {
            stopInfo.request_stop = false;
        }
        res.render('departures', { stop: stopInfo, short_number });
        console.log(constructLog(`Successfully fetched departures for '${stopInfo.stop_name} (${short_number})'`, req));
    } catch (error) {
        res.status(500).send('Błąd podczas pobierania odjazdów dla przystanku');
        console.log(constructLog(`Could not fetch departures!`, req));
    }
});

app.get(`${ROOT_DIR}filterStops`, async (req, res) => {
    const searchTerm = req.query.searchTerm.toLowerCase();
    try {
        const response = await axios.get(`${BASE_URL}/stops`);
        const filteredStops = response.data.data.filter(stop => stop.name.toLowerCase().includes(searchTerm));

        const stops = filteredStops.map(stop => {
            const short_number = String(stop.number).slice(-2);
            return {
                id: stop.id,
                number: stop.number,
                short_number,
                name: stop.name,
                request_stop: stop.request_stop
            };
        });
        res.json(stops);
    } catch(error) {
        console.log(constructLog(`Could not fetch stops!`, req));
        res.status(500).send('Błąd podczas pobierania listy przystanków');
    }
});

app.listen(PORT, IP_A, () => {
    console.log(`Server running on http://${IP_A}:${PORT}`);
});