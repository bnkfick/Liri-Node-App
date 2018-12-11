require("dotenv").config();

var fs = require("fs");
var keys = require("./key.js");
var request = require('request');
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var axios = require("axios");
var inquirer = require("inquirer");
var moment = require('moment');

function processCommand(command, term) {

    //console.log("Command: " + inquirerResponse.command);
    switch (command) {
        case 'A Concert with Bands in Town':
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'concert',
                    message: 'What concert should I search for?',
                }
            ]).then(function (inquirerResponse) {
                getConcertInfo(inquirerResponse.concert);
            });

            break;

        // node liri.js concert-this < artist / band name here >
        case 'concert-this':
            getConcertInfo(term);
            break;

        case 'A Song with Spotify':
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'song',
                    message: 'What song should I search for?',
                }
            ]).then(function (inquirerResponse) {
                getSongInfo(inquirerResponse.song);
            });
            break;

        // node liri.js spotify-this-song '<song name here>'
        case 'spotify-this-song':
            getSongInfo(term);
            break;

        case 'A Movie with OMBD':
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'movie',
                    message: 'What movie should I search for?',
                }
            ]).then(function (inquirerResponse) {
                getMovieInfo(inquirerResponse.movie);
            });
            break;

        // node liri.js movie-this '<movie name here>'
        case 'movie-this':
            getMovieInfo(term);
            break;

        case "Random Search":
            doWhatItSays();
            //console.log("do-what-it-says");
            break;
        //node liri.js do-what-it-says
        case 'do-what-it-says':

            doWhatItSays();
            break;
        default:
            logIt("Invalid Instruction: " + command);
            console.log("I don't know what to do");
    }
}


//=================================================================================================//
// This will search the Bands in Town Artist Events API
// "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp"
// for an artist and render the following information about each event to the terminal
//
// Get Band/Artist Concert Information Based on Value that the User Inputs
// Check if no band/artist is input
// Print Message if there are no results
// Print concerts if there are results
// Log concerts to log.txt if there are results
//=================================================================================================//
function getConcertInfo(band) {

    var bandName = band.split(' ').join('+'); 

    var queryUrl = "https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=codecademy";
    //console.log(queryUrl);

    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var data = JSON.parse(body);
            //console.log(data);
            if (!Array.isArray(data) || !data.length) {
                console.log("NO CONCERTS FOUND");
            } else {

                for (i = 0; i < data.length; i++) {
                    var dTime = data[i].datetime;

                    var eventDate = dTime.substring(5, 7) + "/" + dTime.substring(8, 10) + "/" + dTime.substring(0, 4);
                    var dateFormat = "MM/DD/YYYY";
                    var convertedDate = moment(eventDate, dateFormat);

                    var region = '';
                    if (data[i].venue.region !== "") {
                        region = data[i].venue.region;
                    }

                    var concertData =
                        "\nBand: " + band +
                        "\nDate: " + convertedDate.format("MM/DD/YY") +
                        "\nName: " + data[i].venue.name +
                        "\nCity: " + data[i].venue.city +
                        "\nRegion: " + region +
                        "\nCountry: " + data[i].venue.country;

                    console.log(concertData);
                    logIt(concertData);

                }
            }
            anotherSearch();
        }
    });
}

//=================================================================================================//
// Get Song Information from Spotify Based on Value that the User Inputs
// Get Song Information for The Sign by Ace of Base if there is no User Input
// Print Data to the Console
// Log Data to the Log file log.txt
//=================================================================================================//
function getSongInfo(song) {

    var songName = song.split(' ').join('+'); 

    // If no song is provided then your program will default to "The Sign" by Ace of Base.
    if (!song || song == null) {
        songName = "The Sign, Ace of Base";
    }
    spotify.search({ type: 'track', query: songName, limit: 1 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        if (!data) {
            console.log("NO SONGS FOUND");
        } else {
            if (data.tracks.items[0] == undefined) {
                console.log("No Song Found");
                return;
            }

            var artist = data.tracks.items[0].artists[0].name;

            for (var i = 1; i < data.tracks.items[0].artists.length; i++) {
                artist += ", " + data.tracks.items[0].artists[i].name;
            }
            // This will show the following information about the song in your terminal/bash window
            // Artist(s)
            // The song's name
            // A preview link of the song from Spotify
            // The album that the song is from
            var songData =
                "\nArtist: " + artist +
                "\nSong: " + data.tracks.items[0].name +
                "\nLink: " + data.tracks.items[0].external_urls.spotify +
                "\nAlbum: " + data.tracks.items[0].album.name;
            console.log(songData);
            logIt(songData);
        }
        anotherSearch();

    })


}

//=================================================================================================//
// Then run a request with axios to the OMDB API with the movie specified
// "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy"
// Get Movie Information from OMBS Based on Value that the User Inputs
// Get Movie Information for Mr. Nobody if there is no User Input
// Print Data to the Console
// Log Data to the Log file log.txt
//=================================================================================================//
function getMovieInfo(movie) {

    if (!movie) {
        console.log("You didn't type in a movie to search for, so the program searched for \'Mr. Nobody.\'");
        console.log("If you haven\'t watched \"Mr. Nobody,\" then you should: http://www.imdb.com/title/tt0485947/");
        console.log("It\'s on Netflix!");
        movie = "Mr. Nobody";
    }

    var movieName = movie.split(' ').join('+'); 
    //console.log(movieName);
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
    //console.log(queryUrl);

    axios.get(queryUrl).then(
        function (response) {
            if (response.data.Response == "False") {
                console.log(response.data.Error);
            } else {

                var rtRating = '';
                var imdbRating = ''
                if (!Array.isArray(response.data.Ratings) || !response.data.Ratings.length) {
                    for (var i = 0; i < response.data.Ratings.length; i++) {
                        if (response.data.Ratings[i].Source == "Rotten Tomatoes") {
                            rtRating = response.data.Ratings[i].Value;
                        }
                        else if (response.data.Ratings[i].Source == "Internet Movie Database") {
                            imdbRating = response.data.Ratings[i].Value;
                        }
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
            }
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
// Using the fs Node package, LIRI will take the text inside of random.txt and  
// use it to call one of LIRI's commands.
//It should run spotify-this-song for "I Want it That Way," as follows the text in random.txt.
//Edit the text in random.txt to test out the feature for movie-this and concert-this.
//=================================================================================================//
function doWhatItSays() {

    // This block of code will read from the "random.txt" file.
    fs.readFile("random.txt", "utf8", function (error, data) {
        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }

        // We will then print the contents of data
        console.log(data);

        // Then split it by commas (to make it more readable)
        var dataArr = data.split(",");

        processCommand(dataArr[0], dataArr[1]);

    });
}
//=================================================================================================//
// Log to a log.txt file for all Searches
//=================================================================================================//
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

//=================================================================================================//
// MAIN ENTRY INTO PROGRAM
//=================================================================================================//
var userCommand;
var searchTerm;
if (process.argv.length > 2) {
    userCommand = process.argv[2];
    searchTerm = process.argv.slice(3).join("+");
    processCommand(userCommand, searchTerm);
} else {
    askQuestion();
}


//=================================================================================================//
// Prompt the User with the Possible Search Tasks
// Then process the command to execute the appropriate search in 
// processCommand(command)
//=================================================================================================//
// Function to run the cycle of liri questions.
function askQuestion() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'command',
                message: 'What do you want me to look up for you?',
                choices: ['A Concert with Bands in Town', 'A Song with Spotify', 'A Movie with OMBD', "Random Search"],

            }
        ])
        .then(function (inquirerResponse) {
            processCommand(inquirerResponse.command, searchTerm);
        });
}

//=================================================================================================//
// Prompt the User with a yes or no for another Search
// Then continue
// Or Quit
//=================================================================================================//
function anotherSearch() {
    inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message: 'Do you want to do another Search?',
            default: true
        }]).then(function (reply) {
            //console.log("reply : ", reply);
            if (reply.confirmed) {
                console.log("\n");
                askQuestion();
            } else {
                console.log("Ok,  Goodbye");
                return;
            }
        });
}

