require("dotenv").config();

var fs = require("fs");
var keys = require("./key.js");
var request = require('request');
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var axios = require("axios");
var inquirer = require("inquirer");

//NOT BEING USED...I GOT FANCY, may come back to this
function processCommand(command, parameters) {

    switch (command) {
        case 'concert-this':
            // node liri.js concert-this < artist / band name here >
            bandsInTown();
            console.log("concert-this");
        case 'spotify-this-song':
            // node liri.js spotify-this-song '<song name here>'
            songInfo();
            console.log("spotify-this-song");
            break;
        case 'movie-this':
            // node liri.js movie-this '<movie name here>'
            movieInfo();
            console.log("movie-this");
            break;
        case 'do-what-it-says':
            //node liri.js do-what-it-says
            doWhatItSays();
            console.log("do-what-it-says");
            break;
        default:
            logError("Invalid Instruction");
            console.log("I don't know what to do");
    }
}


//=================================================================================================//

//=================================================================================================//
function getConcertInfo(band) {
    console.log("bandsInTown", band);
    var bandName = band.replace(' ', '+');
    //     This will search the Bands in Town Artist Events API("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp") for an artist and render the following information about each event to the terminal:

    // Name of the venue
    // Venue location
    // Date of the Event(use moment to format this as "MM/DD/YYYY")
    var venue = "VENUE: ";
    var venueLocation = "VENUE LOCATION: ";
    var dateOfEvent = "DATE OF EVENT: MM/DD/YYYY";


    var queryUrl = "https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=codecademy";
    console.log(queryUrl);

    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var data = JSON.parse(body);
            //@todo replace with moment.js
            for (i = 0; i < data.length; i++) {
                var dTime = data[i].datetime;
                var month = dTime.substring(5, 7);
                var year = dTime.substring(0, 4);
                var day = dTime.substring(8, 10);
                var dateFormatted = month + "/" + day + "/" + year

                if (data[i].venue.region !== "") {
                    region = "Region: " + data[i].venue.region;
                }

                var concertData =
                    "\nBand: " + band +
                    "\nDate: " + dateFormatted +
                    "\nName: " + data[i].venue.name +
                    "\nCity: " + data[i].venue.city +
                    "\nRegion: " + region +
                    "\nCountry: " + data[i].venue.country;

                console.log(concertData);
                logIt(concertData);
                
            }
            anotherSearch();
        }
    });
}






function getSongInfo(song) {
    console.log("getSongInfo");
    var songName = song.replace(" ", "+");

    // spotify.search({ type: 'track', query: 'All the Small Things' }, function (err, data) {
    //     if (err) {
    //         return console.log('Error occurred: ' + err);
    //     }
    //     console.log(data);
    // });
    if (!song || song == "") {
        song = "The Sign, Ace of Base";
    }
    spotify.search({ type: 'track', query: songName, limit: 1 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        if (data.tracks.items[0] == undefined) {
            console.log("No Song Found");
            return;
        }

        var artist = data.tracks.items[0].artists[0].name;

        for (var i = 1; i < data.tracks.items[0].artists.length; i++) {
            artist += ", " + data.tracks.items[0].artists[i].name;
        }

        var songData =
            "Song: " + data.tracks.items[0].name +
            "\nArtist: " + artist +
            "\nAlbum: " + data.tracks.items[0].album.name +
            "\nLink: " + data.tracks.items[0].external_urls.spotify;
        console.log(songData);
        logIt(songData);
        anotherSearch();

    })

    // This will show the following information about the song in your terminal/bash window

    // Artist(s)
    // The song's name
    // A preview link of the song from Spotify
    // The album that the song is from

    // If no song is provided then your program will default to "The Sign" by Ace of Base.
}
//=================================================================================================//
function getMovieInfo(movie) {

    if (!movie) {
        console.log("You didn't type in a movie to search for, so the program searched for \'Mr. Nobody.\'");
        console.log("If you haven\'t watched \"Mr. Nobody,\" then you should: http://www.imdb.com/title/tt0485947/");
        console.log("It\'s on Netflix!");
        movie = "Mr. Nobody";
    }

    var movieName = movie.replace(" ", "+");
    //console.log(movieName);
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
    //console.log(queryUrl);

    // Then run a request with axios to the OMDB API with the movie specified
    axios.get(queryUrl).then(
        function (response) {

            var rtRating = '';
            var imdbRating = ''
            for (var i = 0; i < response.data.Ratings.length; i++) {
                if (response.data.Ratings[i].Source == "Rotten Tomatoes") {
                    rtRating = response.data.Ratings[i].Value;
                }
                else if (response.data.Ratings[i].Source == "Internet Movie Database") {
                    imdbRating = response.data.Ratings[i].Value;
                }
            }

            var movieData =
                "Title:\t\t\t" + response.data.Title +
                "\nYear:\t\t\t" + response.data.Year +
                "\nIMDB Rating:\t\t" + imdbRating +
                "\nRotten Tomatoes Rating:\t" + rtRating +
                "\nCountry:\t\t" + response.data.Country +
                "\nLanguage:\t\t" + response.data.Language +
                "\nPlot:\t\t\t" + response.data.Plot +
                "\nActors:\t\t\t" + response.data.Actors;

            console.log(movieData);
            logIt(movieData);
            anotherSearch();
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

function logIt(dataToLog) {
    var divider = "\n----------------------------------\n"
    //console.log(dataToLog);
    fs.appendFile('log.txt', dataToLog + divider, function (err) {
        if (err) {
            var errMsg = 'Error logging data to file: ' + err;
            logIt(errMsg);
            return errMsg;
        }
    });
}

// calls the function initLiri() to start the code
initLiri();

// Function that will start the request process based on user input
// Then will ...
function initLiri() {
    //console.log("\n--------\initLiri()\n---------");
    askQuestion();
}


// Function to run the cycle of liri questions.
function askQuestion() {
    //console.log("\n--------\startLiri()\n---------");
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'command',
                message: 'What do you want me to look up for you?',
                choices: ['A Concert with Bands in Town', 'A Song with Spotify', 'A Movie with OMBD'],

            }
        ])
        .then(function (inquirerResponse) {

            console.log("Command: " + inquirerResponse.command);
            switch (inquirerResponse.command) {
                case 'A Concert with Bands in Town':
                case 'concert-this':
                    // node liri.js concert-this < artist / band name here >
                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'concert',
                            message: 'What concert should I search for?',
                        }
                    ]).then(function (inquirerResponse) {
                        getConcertInfo(inquirerResponse.concert);
                    });

                    //console.log("concert-this");
                    break;

                case 'A Song with Spotify':
                case 'spotify-this-song':
                    // node liri.js spotify-this-song '<song name here>'
                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'song',
                            message: 'What song should I search for?',
                        }
                    ]).then(function (inquirerResponse) {
                        getSongInfo(inquirerResponse.song);

                    });
                    //console.log("spotify-this-song");
                    break;

                case 'A Movie with OMBD':
                case 'movie-this':
                    // node liri.js movie-this '<movie name here>'
                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'movie',
                            message: 'What movie should I search for?',
                        }
                    ]).then(function (inquirerResponse) {
                        getMovieInfo(inquirerResponse.movie);
                    });
                    //console.log("movie-this");
                    break;

                case 'do-what-it-says':
                    //node liri.js do-what-it-says
                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'parameters',
                            message: 'What movie should I search for?',
                        }
                    ]).then(function (inquirerResponse) {
                        doWhatItSays(inquirerResponse.parameters);
                    });
                    console.log("do-what-it-says");
                    break;

                default:
                    logError("Invalid Instruction");
                    console.log("I don't know what to do");
            }


        });
}

function anotherSearch() {
    inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message: 'Do you want to do another Search?',
            default: true
        }]).then(function (reply) {
            console.log("reply : ", reply);
            if (reply.confirmed) {
                console.log("Ok,  another");
                askQuestion();
            } else {
                console.log("Ok,  Goodbye");
                return;
            }

        });
}

