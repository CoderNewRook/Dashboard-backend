const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = 3000;
const path = require("path");
const nodefetch = require("node-fetch");
const {parse} = require("csv-parse");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
// const sportsCSV = require("./I1.csv");
// import sports from "./I1.csv";
const fs = require("fs/promises");

db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "qfpjASDFQSEF1234zpzp",
    database: "dashboarduserdata"
})

db.connect(err => {
    if(err){
        console.log(err);
        return;
    }
    console.log("Connected to database");
})

app.use(express.static(path.join(__dirname, "client/build")));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const createNewUser = async (userData) => {
    // Check if user already exists
    const sqlCheck = "SELECT username FROM userdata WHERE username = ?";
    const checkQuery = db.query(sqlCheck, [userData.username], (error, result) => {
        if(error) {
            console.log(error); 
            return false;
        };
        console.log(result);
        if(result.length > 0) return false;
    });
    const sql = "INSERT INTO userdata VALUES (?,?,?,?)";
    const query = db.query(sql, Object.values(userData), (error, result) => {
        if(error) {
            console.log(error); 
            return false;
        };
        console.log(result);
        return true;
    });
}

app.get("/picture/:username", async (req, res) => {
    const sqlGetPhotos = "SELECT picture FROM userdata WHERE username = ?"
    db.query(sqlGetPhotos, [req.params.username], (error, result) => {
        if(error) {
            console.log(error); 
            return;
        };
        res.send(result[0].picture);
    });
})

app.post("/login", async (req, res) => {
    const data = req.body;
    const {username, password} = data;
    const sql = "SELECT password FROM userdata WHERE username = ?";
    const query = db.query(sql, [username], (error, result) => {
        if(error) {
            console.log(error); 
            return;
        };
        let correctPassword = false;
        if(result.length === 0) {
            console.log("No such username");
            res.status(400).send({message: "No such username"});
        }
        else if(password === result[0]["password"]) {
            correctPassword = true;
            res.status(200).send({message: "Correct login details"});
        }
        else {
            console.log("Incorrect details");
            res.status(400).send({message: "Incorrect login details"});
        }
        return;
    });
})

app.get("/photo/:username", async (req, res) => {
    console.log(req.params);
    const sqlGetPhotos = "SELECT photo FROM userphotos WHERE username = ? AND id = ?"
    db.query(sqlGetPhotos, [req.params.username, req.query.id], (error, result) => {
        if(error) {
            console.log(error); 
            return;
        };
        res.send(result[0].photo);
    });
})

app.get("/photos/:username", async (req, res) => {
    const sqlGetPhotos = "SELECT photo FROM userphotos WHERE username = ?"
    db.query(sqlGetPhotos, [req.params.username], (error, result) => {
        if(error) {
            console.log(error); 
            dataRetrieved();
            return;
        };
        console.log("photos retrieved");
        res.send(JSON.stringify({numOfPhotos: result.length}));
    });
    console.log("getting photos");
})

app.post("/photo/:username", upload.single("photo"), (req, res) => {
    console.log(req.body);
    console.log(req.file);
    const sqlCheck = "SELECT username FROM userphotos WHERE username = ?";
    const checkQuery = db.query(sqlCheck, [req.params.username], (error, result) => {
        if(error) {
            console.log(error);
            res.status(400).send("Error when adding photo");
            return;
        };
        const numOfPhotos = result.length;
        const sql = "INSERT INTO userphotos (username, photo, id) VALUES (?,?,?)";
        const query = db.query(sql, [req.params.username, req.file.buffer, numOfPhotos], (error, result) => {
            if(error) {
                console.log(error);
                res.status(400).send("Error when adding photo");
                return;
            };
            console.log(result);
            res.status(200).send("Photo added");
        })
    });
})

app.put("/photo/:username", upload.single("photo"), (req, res) => {
    console.log(req.body);
    console.log(req.file);
    const sql = "UPDATE userphotos SET photo = ? WHERE username = ? AND id = ?";
    const query = db.query(sql, [req.file, req.params.username, req.query.id], (error, result) => {
        if(error) {
            console.log(error);
            res.status(400).send("Error when updating photo");
            return;
        };
        console.log(result);
        res.status(200).send("Photo updated");
    });
})

app.delete("/photo/:username", (req, res) => {
    console.log(req.body);
    console.log(req.file);
    const sql = "DELETE FROM userphotos WHERE username = ? AND id = ?";
    const query = db.query(sql, [req.params.username, req.query.id], (error, result) => {
        if(error) {
            console.log(error);
            res.status(400).send("Error when deleting photo");
            return;
        };
        console.log(result);
        res.status(200).send("Photo deleted");
        const sqlUpdateIds = "UPDATE userphotos SET id = id - 1 WHERE username = ? AND id > ?";
        const updateIdsQuery = db.query(sqlUpdateIds, [req.params.username, req.query.id], (error, result) => {
            if(error) {
                console.log(error);
                console.log("Error when updating photo ids");
                return;
            };
            console.log(result);
        });
    });
})

app.post("/task/:username", (req, res) => {
    console.log(req.body);
    const sql = "INSERT INTO usertasks (username, task, completed, id) VALUES (?,?,?,?)";
    const query = db.query(sql, [req.params.username, req.body.task, req.body.completed, req.body.id], (error, result) => {
        if(error) {
            console.log(error); 
            res.status(400).send("Error when adding task");
            return;
        };
        console.log(result);
        res.status(200).send("Task added");
    })
})

app.put("/tasks/:username", async (req, res) => {
    // const sqlDelete = "DELETE FROM usertasks WHERE username = ?";
    // const deleteQuery = db.query(sqlDelete, [req.params.username], (error, result) => {
    //     if(error) {
    //         console.log(error); 
    //         res.status(400).send("Error when updating tasks");
    //         return;
    //         // return false;
    //     };
    //     console.log(req.body);
    //     console.log(req.body.tasks);
    //     for(let task of req.body.tasks) {
    //         const sql = "INSERT INTO usertasks (username, task, completed) VALUES (?,?,?)";
    //         const query = db.query(sql, [req.params.username, task.task, task.completed], (error, result) => {
    //             if(error) {
    //                 console.log(error); 
    //                 res.status(400).send("Error when adding task");
    //                 return;
    //             };
    //             console.log(result);
    //         })
    //     }
    //     res.status(200).send("Tasks updated");
    // })
    for(let task of req.body.tasks) {
        const sql = "UPDATE usertasks SET task = ?, completed = ? WHERE username = ? AND id = ?";
        const query = db.query(sql, [task.task, task.completed, req.params.username, task.id], (error, result) => {
            if(error) {
                console.log(error); 
                res.status(400).send("Error when adding task");
                return;
            };
            console.log(result);
        })
    }
    res.status(200).send("Tasks updated");
})

// app.put("/photo/:username", async (req, res) => {
//     for(let task of req.body.tasks) {
//         const sql = "UPDATE usertasks SET task = ?, completed = ? WHERE username = ? AND id = ?";
//         const query = db.query(sql, [task.task, task.completed, req.params.username, task.id], (error, result) => {
//             if(error) {
//                 console.log(error); 
//                 res.status(400).send("Error when adding task");
//                 return;
//             };
//             console.log(result);
//         })
//     }
//     res.status(200).send("Tasks updated");
// })

app.get("/tasks/:username", async (req, res) => {
    const sqlGetTasks = "SELECT task, completed FROM usertasks WHERE username = ?"
    db.query(sqlGetTasks, [req.params.username], (error, result) => {
        if(error) {
            console.log(error); 
            dataRetrieved();
            return;
        };
        console.log("tasks retrieved");
        res.send(JSON.stringify(result));
    });
    console.log("getting tasks");
})

app.post("/register", upload.single("picture"), async (req, res) => {
    const userData = {...req.body, picture: req.file ? req.file.buffer : null};
    const sqlCheck = "SELECT username FROM userdata WHERE username = ?";
    const checkQuery = db.query(sqlCheck, [userData.username], (error, result) => {
        if(error) {
            console.log(error); 
            res.status(400).send({message: "Username already taken"});
            // return false;
        };
        console.log(result);
        if(result.length > 0) res.status(400).send({message: "Username already taken"});
    });
    const sql = "INSERT INTO userdata VALUES (?,?,?,?)";
    const query = db.query(sql, Object.values(userData), (error, result) => {
        if(error) {
            console.log(error); 
            res.status(400).send({message: "Username already taken"});
            // return false;
        };
        console.log(result);
        res.status(200).send({message: "Account created"});
    });
})


app.get("/clothes", async (req, res) => {
    const response = await nodefetch("https://therapy-box.co.uk/hackathon/clothing-api.php?username=swapnil");
    const data = await response.json();

    const dataDistribution = {};
    data["payload"].forEach(day => {
        if(!dataDistribution.hasOwnProperty(day["clothe"])) {
            dataDistribution[day["clothe"]] = 0;
        }
        dataDistribution[day["clothe"]] = dataDistribution[day["clothe"]] + 1;
    });
    res.send(JSON.stringify(dataDistribution));
})

app.get("/sport", async (req, res) => {
    const csvBuffer = await fs.readFile("./I1.csv");
    const records = [];
    const parser = parse(csvBuffer, {
        delimiter: ':'
    });
    parser.on('readable', function(){
    let record;
    while ((record = parser.read()) !== null) {
        records.push(record);
    }
    });
    parser.on('error', function(err){
    console.error(err.message);
    });
    parser.on('end', function(){
        const teamsBeaten = {};
        const lines = records.map(line => line[0]).slice(1).filter(line => line !== "");
        const data = lines.map(line => {
            const lineValues = line.split(",");
            const homeTeam = lineValues[2];
            const awayTeam = lineValues[3];
            const winnerCode = lineValues[6];
            let winner = undefined;
            let loser = undefined;
            if(winnerCode === "H") {
                winner = homeTeam;
                loser = awayTeam;
            }
            else if(winnerCode === "A") {
                winner = awayTeam;
                loser = homeTeam;
            }
            if(winner) {
                if(!teamsBeaten.hasOwnProperty(winner)) teamsBeaten[winner] = [];
                teamsBeaten[winner].push(loser);
            }
        })
        // Remove duplicate beaten teams
        for(const [team, beaten] of Object.entries(teamsBeaten)) {
            teamsBeaten[team] = [...new Set(beaten)]
        }
        // console.log(teamsBeaten);
        res.send(JSON.stringify(teamsBeaten));
    });
})

async function sportTest(){
    // const response = await nodefetch("http://www.football-data.co.uk/mmz4281/1718/I1.csv");
    // const data = await streamToString(response.body);
    // console.log(data);
    // parse()
    // parse(data, {relax_column_count_less: true, relaxQuotes: true}, function(err, records){
    //     if(err) console.log(err.message);
    //     console.log(records);
    // });
    // const records = [];
    // // Initialize the parser
    // const parser = parse(sportsCSV, {
    //     delimiter: ','
    // });
    // // Use the readable stream api to consume records
    // parser.on('readable', function(){
    // let record;
    // while ((record = parser.read()) !== null) {
    //     records.push(record);
    // }
    // });
    // // Catch any error
    // parser.on('error', function(err){
    // console.error(err.message);
    // });
    // // Test that the parsed records matched the expected records
    // parser.on('end', function(){
    //     console.log(records);
    //     // res.send(JSON.stringify(records));
    // });
    const csvBuffer = await fs.readFile("./I1.csv");
    // const csvString = csvBuffer.toString("utf8");
    // console.log(csvString);
    // const csvFile = parse(csvBuffer);
    const records = [];
    // Initialize the parser
    const parser = parse(csvBuffer, {
        delimiter: ':'
    });
    // Use the readable stream api to consume records
    parser.on('readable', function(){
    let record;
    while ((record = parser.read()) !== null) {
        records.push(record);
    }
    });
    // Catch any error
    parser.on('error', function(err){
    console.error(err.message);
    });
    // Test that the parsed records matched the expected records
    parser.on('end', function(){
        const teamsBeaten = {};
        const lines = records.map(line => line[0]).slice(1).filter(line => line !== "");
        const data = lines.map(line => {
            const lineValues = line.split(",");
            const homeTeam = lineValues[2];
            const awayTeam = lineValues[3];
            const winnerCode = lineValues[6];
            let winner = undefined;
            let loser = undefined;
            if(winnerCode === "H") {
                winner = homeTeam;
                loser = awayTeam;
            }
            else if(winnerCode === "A") {
                winner = awayTeam;
                loser = homeTeam;
            }
            if(winner) {
                if(!teamsBeaten.hasOwnProperty(winner)) teamsBeaten[winner] = [];
                teamsBeaten[winner].push(loser);
            }
        })
        // Remove duplicate beaten teams
        for(const [team, beaten] of Object.entries(teamsBeaten)) {
            teamsBeaten[team] = [...new Set(beaten)]
        }
        console.log(teamsBeaten);
        // res.send(JSON.stringify(teamsBeaten));
    });
    // console.log(csvFile);
    // for(let line of csvFile) {
    //     console.log(line);
    // }
}

// sportTest();

app.get("/weather", async (req, res) => {
    // const response = await nodefetch("https://api.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=d0a10211ea3d36b0a6423a104782130e");
    const data = await getWeather();
    res.send(JSON.stringify(data));
})

const weatherToBasicWeather = (weather) => {
    switch(weather){
        case "Clear":
            return "sunny";
        case "Clouds":
            return "cloudy";
        case "Rain":
        case "Thunderstorm":
        case "Drizzle":
        case "Snow":
            return "rainy";
        default:
            return "cloudy";
    }
}

async function getWeather() {
    let coords = {lat: 35, lon: 139};
    // navigator.geolocation.getCurrentPosition(pos => {
    //     coords.lat = pos.coords.latitude;
    //     coords.lon = pos.coords.longitude;
    // },
    // err => console.log(err),
    // { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 });
    const response = await nodefetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=d0a10211ea3d36b0a6423a104782130e&units=metric`);
    const data = await response.json();
    const temperature = data.main.temp;
    const location = data.name;
    const weather = weatherToBasicWeather(data.weather.main);
    console.log({weather, temperature, location});
    return {weather, temperature, location};
}

async function streamToString(stream){
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf-8");
}



async function streamToBuffer(stream){
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
}

app.get("/firstNews", async (req, res) => {
    const firstNews = await getFirstNews();
    res.send(JSON.stringify(firstNews));
})

app.get("/latestNews", async (req, res) => {
    const latestNews = await getLatestNews();
    res.send(JSON.stringify(latestNews));
})

async function getNewsItems() {
    const response = await nodefetch("http://feeds.bbci.co.uk/news/rss.xml");
    const data = await streamToString(response.body);
    const newsItems = data.match(/(?<=<item>)[^]+?(?=<\/item>)/g);
    return newsItems;
}

async function getFirstNews() {
    const newsItems = await getNewsItems();
    const firstNews = newsItems[0];
    const title = firstNews.match(/(?<=<title><!\[CDATA\[)[^]+?(?=]]><\/title>)/)[0];
    const description = firstNews.match(/(?<=<description><!\[CDATA\[)[^]+?(?=]]><\/description>)/)[0];
    return {title, description};
}

async function getLatestNews() {
    const newsItems = await getNewsItems();
    const publishedDates = newsItems.map(item => item.match(/(?<=<pubDate>\D{3}, )[^]+?(?=<\/pubDate>)/)[0]);
    const publishedTimeInMilliseconds = publishedDates.map(date => Date.parse(date));
    const indexOfLatestNews = publishedTimeInMilliseconds.indexOf(Math.max(...publishedTimeInMilliseconds));
    const latestNews = newsItems[indexOfLatestNews];
    const title = latestNews.match(/(?<=<title><!\[CDATA\[)[^]+?(?=]]><\/title>)/)[0];
    const description = latestNews.match(/(?<=<description><!\[CDATA\[)[^]+?(?=]]><\/description>)/)[0];
    return {title, description};
}

async function testfunc() {
    const firstNews = await getFirstNews();
    console.log(firstNews);
    const latestNews = await getLatestNews();
    console.log(latestNews);
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})