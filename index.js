const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.APP_PORT;
const IP_A = process.env.APP_IP;
const BASE_URL = process.env.APP_BASE_URL;
const ROOT_DIR = process.env.APP_ROOT_DIR;

app.locals.root = ROOT_DIR;

app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

function addZero(i) {
    if (i < 10) {i = "0" + i}
    return i;
}

function constructLog(message, req) {
    const d = new Date();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return "[" + d.getFullYear() + "-" + addZero(d.getMonth() + 1) + "-" + addZero(d.getDate()) + " " + addZero(d.getHours()) + ":" + addZero(d.getMinutes()) + ":" + addZero(d.getSeconds()) + "] (" + ip + ") " + message;
}

let stopsData = {};

app.get(`${ROOT_DIR}`, async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/stops`);
        const stops = response.data.data.map(stop => {
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
        res.render('stops', { stops });
        console.log(constructLog(`Successfuly fetched stops.`, req));
    } catch (error) {
        res.status(500).send('Błąd podczas pobierania listy przystanków');
        console.log(constructLog(`Could not fetch stops!`, req));
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

app.listen(PORT, IP_A, () => {
    console.log(`Server running on http://${IP_A}:${PORT}`);
});