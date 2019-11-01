//Imports and required packages
require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var axios = require("axios");
var moment = require('moment');
var fs = require("fs");


//Grabbing the command and the search te
const command = process.argv[2];
const searchTerm = process.argv.slice(3).join(" ");

//Calling the function to choose which command gets run
chooseCommand(command, searchTerm)

//Here's where we pick the command using a swtich statement, and run it appropriately.
function chooseCommand(command, searchTerm) {
  switch (command) {
    case "concert-this":
      console.log("Searching for events for the artist " + searchTerm + "...\n");
      searchBand(searchTerm);
      break;

    case "spotify-this-song":
      console.log("Searching for info about the song " + searchTerm + "...\n");
      searchSong(searchTerm);
      break;

    case "movie-this":
      console.log("Searching for info about the movie " + searchTerm + "...\n");
      searchMovie(searchTerm);
      break;

    case "do-what-it-says":

      //open and read the file
      fs.readFile("random.txt", "utf8", function (error, data) {

        //Check for an error and log it
        if (error) {
          return console.log(error);
        }

        // spit it into an array on the comma
        var dataArr = data.split(",");

        if (dataArr[0] != "do-what-it-says") {
          // Call the chooseCommand function again with what we got from the file.
          chooseCommand(dataArr[0], dataArr[1]);
        } else{
          //This protects you from having "do-what-it-says" in the file and looping forever.
          console.log("oops, it looks like you tried to trap yourself in a loop.");
        }

      });

      break;

    default:
      console.log("Not a recognized command");
  }
}

//Search for showtimes for a band.
function searchBand(band) {
  var URL = "https://rest.bandsintown.com/artists/" + band + "/events?app_id=codingbootcamp";

  axios.get(URL).then(function (response) {
    var shows = response.data;

    for (i = 0; i < shows.length; i++) {

      //I decided to stop at 15 shows just to make testing a little easier.
      if (i === 15) {
        break;
      }

      //Set the date as a moment and format it
      var date = moment(shows[i].datetime);
      date = date.format("MM/DD/YYYY");

      var showData = [
        "Venue name: " + shows[i].venue.name,
        "Venue Location: " + shows[i].venue.city + ", " + shows[i].venue.country,
        "Event Date: " + date + "\n"
      ].join("\n");

      console.log(showData);
    }

  });
}

//Search for info about a song.
function searchSong(song) {
  console.log(song);

  //Setting the default song to be The Sign by Ace of Base.
  if (song === "") {
    song = "The Sign Ace of Base"; //If you just search for "The Sign" you get a Harry Styles song.
  }

  spotify.search({ type: 'track', query: song }, function (err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }

    //We're only going to look at the first song returned by our query
    var firstHit = data.tracks.items[0];
    var artistList = [];

    for (i = 0; i < firstHit.artists.length; i++) {
      artistList.push(firstHit.artists[i].name)
    }

    var trackData = [
      "Artist(s): " + artistList.join(", "),
      "Song Name: " + firstHit.name,
      "Album: " + firstHit.album.name,
      "Preview Link: " + firstHit.external_urls.spotify + "\n"
    ].join("\n");

    console.log(trackData);
  });
}

//Search for info about a movie.
function searchMovie(movie) {

  //Setting the default song to be Mr. Nobody
  if (movie === "") {
    movie = "Mr Nobody";
  }

  var URL = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";

  axios.get(URL).then(
    function (response) {

      var movieData = [
        "Title: " + response.data.Title,
        "Year: " + response.data.Year,
        "IMDB Rating: " + response.data.Ratings[0].Value,
        "Rotten Tomatoes Rating: " + response.data.Ratings[1].Value,
        "Country Produced: " + response.data.Country,
        "Language: " + response.data.Language,
        "Plot: " + response.data.Plot,
        "Actors: " + response.data.Actors + "\n"
      ].join("\n");

      console.log(movieData);
    })
    .catch(function (error) { //display any errors in here
      if (error.response) {
        console.log("---------------Data---------------");
        console.log(error.response.data);
        console.log("---------------Status---------------");
        console.log(error.response.status);
        console.log("---------------Status---------------");
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an object that comes back with details pertaining to the error that occurred.
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
      console.log(error.config);
    });

}