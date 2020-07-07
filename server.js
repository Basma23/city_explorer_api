'use strict';
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const { request, response } = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 5500;
const server = express();
server.use(cors());
// server.get('/location', (request, response) =>{
//     const city = request.query.city;
//     // const location = require('./data/location.json');
//     // const newLocation = new Location(city, location);
//     // response.send(newLocation);
//     let key = process.env.LOCATIONIQ_KEY;
//     let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
//     superagent.get(url).then(location =>{
//         const newLocation = new Location(city, location.body);
//         request.status(200).json(newLocation);
//     })
// });
server.get('/location', handlerOfLocation);
server.get('/weather', handlerOfWeather);
server.get('/trails', handlerOfTrails);
function handlerOfLocation(request, response){
    const city = request.query.city;
    locationInfo(city).then(location =>{
        response.status(200).json(location);
    })
}
function locationInfo(city){
    let key = process.env.LOCATIONIQ_KEY;
    let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
    return superagent.get(url).then(location =>{
        const newLocation = new Location(city, location.body);
        return newLocation;
    });   
}
function Location(city, location){
    this.search_query = city;
    this.formatted_query = location[0].display_name;
    this.latitude = location[0].lat;
    this.longitude = location[0].lon;
};
// server.get('/weather', (request, response) =>{
//     const city = request.query.city;
//     let key = process.env.WEATHERBIT_KEY;
//     let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city},NC&key=${key}`;
//     const status = require('./data/weather.json');
//     response.send(updatedWeather(status));
// });
// function Weather(forcast, date){
//     this.forecast = forcast;
//     this.date = date;
// }
// function updatedWeather(status){
//     let newWeather = [];
//     status.data.forEach(element =>{
//         let date = new Date(element.datetime);
//         newWeather.push(new Weather(element.weather.description,date.toDateString()));
//     });
//     return newWeather;
// }
function handlerOfWeather(request, response){
    const city = request.query.city;
    weatherInfo(city).then(weather =>{
        response.status(200).json(weather);
    });  
}
function weatherInfo(city){
    let newWeather = [];
    let key = process.env.WEATHERBIT_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`;
    return superagent.get(url).then(weather =>{
        let status = weather.body.data;
        return status;
    }).then(weather =>{
        newWeather = weather.map(element =>{
            return new Weather(element);
        })
        return newWeather;
    })
}
function Weather(day){
    this.description = day.weather.description;
    this.time = new Date(day.valid_date).toString().slice(0,15);
}
function handlerOfTrails(request, response){
    let lat = request.query.latitude;
    let lon = request.query.longitude;
    trailsInfo(lat, lon).then(trails =>{
        response.status(200).json(trails);
    });
}
function trailsInfo(lat, lon){
    let newTrails = [];
    let key = process.env.HIKINGPROJECT_KEY;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${key}`;
    return superagent.get(url).then(trails =>{
        let dataOFTrails = trails.body.trails;
        return dataOFTrails;
    }).then(trails =>{
        newTrails = trails.map(element =>{
            return new Trails(element);
        });
        return newTrails
    });
}
function Trails(trails){
    this.name = trails.name;
    this.location = trails.location;
    this.length = trails.length;
    this.stars = trail.stars;
    this.star_votes = trail.starVotes;
    this.summary = trail.summary;
    this.trail_url = trail.url;
    this.conditions = trail.conditionStatus;
    this.condition_date = trail.conditionDate.split(" ")[0];
    this.condition_time = trail.conditionDate.split(" ")[1];
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