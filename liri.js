require("dotenv").config();

// Grab the axios package...
var axios = require("axios");
// fs is a core Node package for reading and writing files
var fs = require("fs");


processCommand();

function processCommand() {
    var command = process.argv[2];

    switch (command) {
        case 'concert-this':
            // node liri.js concert-this < artist / band name here >
            getConcertInfo();
            console.log("concert-this");
        case 'spotify-this-song':
            // node liri.js spotify-this-song '<song name here>'
            getSongInfo();
            console.log("spotify-this-song");
            break;
        case 'movie-this':
            // node liri.js movie-this '<movie name here>'
            getMovieInfo();
            console.log("movie-this");
            break;
        case 'do-what-it-says':
            //node liri.js do-what-it-says
            doWhatItSays();
            console.log("do-what-it-says");
            break;
        default:
            console.log("I don't know what to do");
    }
}


//=================================================================================================//

//=================================================================================================//
function getConcertInfo() {
    console.log("getSongInfo");
    //Does this require quotes?

    //     This will search the Bands in Town Artist Events API("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp") for an artist and render the following information about each event to the terminal:

    // Name of the venue
    // Venue location
    // Date of the Event(use moment to format this as "MM/DD/YYYY")
    var venue = "VENUE: ";
    var venueLocation = "VENUE LOCATION: ";
    var dateOfEvent = "DATE OF EVENT: MM/DD/YYYY";

}

function getSongInfo() {
    // This will show the following information about the song in your terminal/bash window

    // Artist(s)
    // The song's name
    // A preview link of the song from Spotify
    // The album that the song is from

    // If no song is provided then your program will default to "The Sign" by Ace of Base.
}
//=================================================================================================//
function getMovieInfo() {

    // If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
    // If you haven't watched "Mr. Nobody," then you should: http://www.imdb.com/title/tt0485947/
    // It's on Netflix!

    // You'll use the axios package to retrieve data from the OMDB API. Like all of the in-class activities, the OMDB API requires an API key. You may use trilogy.

    // This line is just to help us debug against the actual URL.
    movieName = process.argv.slice(3).join("+");
    console.log(movieName);
    // Then run a request with axios to the OMDB API with the movie specified
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

    console.log(queryUrl);
    // Then create a request with axios to the queryUrl
    // ...
    // Then run a request with axios to the OMDB API with the movie specified
    axios.get(queryUrl).then(
        function (response) {
            // If the request with axios is successful
            // Then log the Release Year for the movie
            // ...
            console.log("The movie: " + movieName + " came out in: ", response.data.Year);
            // This will output the following information to your terminal/bash window:
            //    * Title of the movie.
            //    * Year the movie came out.
            //    * IMDB Rating of the movie.
            //    * Rotten Tomatoes Rating of the movie.
            //    * Country where the movie was produced.
            //    * Language of the movie.
            //    * Plot of the movie.
            //    * Actors in the movie.
        }
    ).catch(function (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
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


//=================================================================================================//
function doWhatItSays() {
    //Using the fs Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.

    // This block of code will read from the "random.txt" file.
    // It's important to include the "utf8" parameter or the code will provide stream data (garbage)
    // The code will store the contents of the reading inside the variable "data"
    fs.readFile("random.txt", "utf8", function (error, data) {
        //It should run spotify-this-song for "I Want it That Way," as follows the text in random.txt.
        //Edit the text in random.txt to test out the feature for movie-this and concert-this.


        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }

        // We will then print the contents of data
        console.log(data);

        // Then split it by commas (to make it more readable)
        var dataArr = data.split(",");

        // We will then re-display the content as an array for later use.
        console.log(dataArr);

    });
}