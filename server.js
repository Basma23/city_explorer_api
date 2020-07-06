'use strict';
const express = require('express');
const cors = require('cors');
const { request, response } = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 5500;
const server = express();
server.use(cors());
server.get('/location', (request, response) =>{
    const city = request.query.data;
    const location = require('./data/location.json');
    const newLocation = new Location(city, location);
    response.send(newLocation);
});
server.get('./weather', (request, response) =>{
    const status = require('./data/weather.json');
    response.send(updatedWeather(status));
});
function Location(city, location){
    this.search_query = city;
    this.formatted_query = location[0].display_name;
    this.latitude = location[0].lat;
    this.longitude = location[0].lon;
};
function Weather(forcast, date){
    this.forecast = forcast;
    this.date = date;
}
function updatedWeather(status){
    let newWeather = [];
    status.data.forEach(element =>{
        let date = new Date(element.datetime);
        newWeather.push(new Weather(element.weather.description,date.toDateString()));
    });
    return newWeather;
}
server.get('*', (req, res) => {
    res.status(404).send('Not Found');
});

server.use((error, req, res) => {
    res.status(500).send(error);
});

server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});