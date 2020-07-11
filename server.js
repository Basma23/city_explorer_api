'use strict';
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg')
const { request, response } = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 5500;
const client = new pg .Client(process.env.DATABASE_URL)
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
server.get('/movies', handlerOfTrails);
server.get('/trails', handlerOfTrails);
function handlerOfLocation(request, response){
    const city = request.query.city;
    locationInfo(city).then(location =>{
        response.status(200).json(location);
    })
}
function locationInfo(city){
    let SQLDB = `SELECT * FROM location WHERE search_query = $1`;
    let assignValues = [city];
    return client.query(SQLDB, assignValues).then(outpot =>{
        if(outpot.rowCount){
            return outpot.rows[0];
        }else{
            let key = process.env.LOCATIONIQ_KEY;
            let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
            return superagent.get(url).then(location =>{
                const newLocation = new Location(city, location.body);
                let SQLDB = `INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);`;
                let assignValues = [city, newLocation.formatted_query, newLocation.latitude, newLocation.longitude];
                return client.query(SQLDB, assignValues).then(outpot =>{
                    return newLocation;
                })
            });   
        }
    })    
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
    const lat = request.query.latitude;
    const lon = request.query.longitude;
    weatherInfo(lat, lon).then(weather =>{
        response.status(200).json(weather);
    });  
}
function weatherInfo(lat, lon){
    let newWeather = [];
    let key = process.env.WEATHERBIT_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${key}`;
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
function handlerOfMovies(request, response){
    const lat = request.query.latitude;
    const lon = request.query.longitude;
    movieInfo(lat, lon).then(movie =>{
        response.status(200).json(movie);
    });  
}
function movieInfo(lat, lon){
    let newMovie = [];
    let key = process.env.MOVIES_KEY;
    let url = `https://api.themoviedb.org/3/movie/550?key=${key}&lat=${lat}&lon=${lon}`;
    return superagent.get(url).then(movie =>{
        let dataOfMovie = movie.body.result;
        return dataOfMovie;
    }).then(movie =>{
        newMovie = movie.map(element =>{
            return new Movies(element);
        })
        return newMovie;
    })
}
function Movies(movies){
    this.title = movies.title;
    this.overview = movies.overview;
    this.average_votes = movies.average_votes;
    this.total_votes = movies.total_votes;
    this.image_url = `https://image.tmdb.org/t/p/w500/${movies.poster_path}`;
    this.popularity = movies.popularity;
    this.released_on = movies.released_on;
}
function handlerOfYelp(request, response) {
    let city = request.query.search_query;
    getYelpData(city)
      .then(data => {
        response.status(200).send(data);
    });
}
function getYelpData(city) {
    const url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
    return superagent.get(url)
        .set('Authorization', `Bearer ${process.env.YELP_KEY}`)
        .then(data => {
            const yelp = data.body.businesses.map(element => {
                return new Yelp(element)
            });
            return yelp;
        });
}
function Yelp(details) {
    this.url = details.url;
    this.name = details.name;
    this.price = details.price;
    this.rating = details.rating;
    this.image_url = details.image_url;
};
server.get('*', (req, res) => {
    res.status(404).send('Not Found');
});

server.use((error, req, res) => {
    res.status(500).send(error);
});

client.connect().then(() =>{
    server.listen(PORT, () => {
        console.log(`listening on port ${PORT}`)
    });
})