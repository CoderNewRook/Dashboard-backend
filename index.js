const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = 3000;
const path = require("path");
// const https = require("https");
const nodefetch = require("node-fetch");
// const async = require("async");
// const { XMLParser } = require("fast-xml-parser");
const {parse} = require("csv-parse");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
// https.get("https://therapy-box.co.uk/hackathon/clothing-api.php?username=swapnil", (res: Response) => {
//     console.log(res.headers);
//     // res.on("data", data => console.log(data));
// })

// let db = null;
// async function connectToDatabase() {
db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "qfpjASDFQSEF1234zpzp",
    database: "dashboarduserdata"
})
// }

db.connect(err => {
    if(err){
        console.log(err);
        return;
    }
    console.log("Connected to database");
})



// connectToDatabase();

app.use(express.static(path.join(__dirname, "client/build")));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// app.use(bodyParser.raw());

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
    // console.log(userData);
    const sql = "INSERT INTO userdata VALUES (?,?,?,?)";
    // const sql = "INSERT INTO userdata VALUES (?,?,?)";
    const query = db.query(sql, Object.values(userData), (error, result) => {
        if(error) {
            console.log(error); 
            return false;
        };
        console.log(result);
        return true;
    });
}

// createNewUser({username: "userrrrname",password: "pass",email: "mail@ee",picture: null});

const getUserData = (username) => {
    
}

function authenticate(username, password) {
    const sql = "SELECT password FROM userdata WHERE username = ?";
    const query = db.query(sql, [username], (error, result) => {
        if(error) {
            console.log(error); 
            return;
        };
        console.log(result);
        if(result.length === 0) console.log("failed");
        else if(password === result[0]["password"]) console.log("successs");
        else console.log("failed");
    });
}

// authenticate("myusersname", "thepassword");
// authenticate("userrrrname", "passwd");

app.get("/picture/:username", async (req, res) => {
    const sqlGetPhotos = "SELECT picture FROM userdata WHERE username = ?"
    db.query(sqlGetPhotos, [req.params.username], (error, result) => {
        if(error) {
            console.log(error); 
            // dataRetrieved();
            return;
        };
        // userData["photos"] = result.map(item => item["photo"]);
        // console.log("photos retrieved");
        // res.send(JSON.stringify(result[0].picture));
        res.send(result[0].picture);
        // dataRetrieved();
    });
    // console.log("getting photos");
})

app.post("/login", async (req, res) => {
    const data = req.body;
    const {username, password} = data;
    // console.log(req);
    const sql = "SELECT password FROM userdata WHERE username = ?";
    const query = db.query(sql, [username], (error, result) => {
        if(error) {
            console.log(error); 
            return;
        };
        // console.log(result);
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

app.get("/photo/:username/:id", async (req, res) => {
    console.log(req.params);
    const sqlGetPhotos = "SELECT photo FROM userdata WHERE username = ? AND id = ?"
    db.query(sqlGetPhotos, [req.params.username, req.params.id], (error, result) => {
        if(error) {
            console.log(error); 
            // dataRetrieved();
            return;
        };
        // userData["photos"] = result.map(item => item["photo"]);
        // console.log("photos retrieved");
        // res.send(JSON.stringify(result[0].picture));
        res.send(result[0].photo);
        // dataRetrieved();
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
        // userData["photos"] = result.map(item => item["photo"]);
        console.log("photos retrieved");
        res.send(JSON.stringify({numOfPhotos: result.length}));
        // dataRetrieved();
    });
    console.log("getting photos");
})

app.post("/photo/:username", upload.single("photo"), async (req, res) => {
    console.log(req.body);
    const sqlCheck = "SELECT username FROM userphotos WHERE username = ?";
    const checkQuery = db.query(sqlCheck, [req.params.username], (error, result) => {
        if(error) {
            console.log(error);
            res.status(400).send("Error when adding photo");
            return;
            // return false;
        };
        // console.log(result);
        // if(result.length > 0) return false;
        const numOfPhotos = result.length;
        const sql = "INSERT INTO userphotos (username, photo, id) VALUES (?,?,?)";
        // const sql = "INSERT INTO userdata VALUES (?,?,?)";
        const query = db.query(sql, [req.params.username, req.file.buffer, numOfPhotos], (error, result) => {
            if(error) {
                console.log(error);
                res.status(400).send("Error when adding photo");
                return;
                // return false;
            };
            console.log(result);
            res.status(200).send("Photo added");
            // return true;
        })
    });
})

app.post("/task/:username", (req, res) => {
    console.log(req.body);
    const sql = "INSERT INTO usertasks (username, task, completed) VALUES (?,?,?)";
    // const sql = "INSERT INTO userdata VALUES (?,?,?)";
    const query = db.query(sql, [req.params.username, req.body.task, req.body.completed], (error, result) => {
        if(error) {
            console.log(error); 
            res.status(400).send("Error when adding task");
            return;
            // return false;
        };
        console.log(result);
        res.status(200).send("Task added");
        // return true;
    })
})

app.put("/tasks/:username", async (req, res) => {
    const sqlDelete = "DELETE FROM usertasks WHERE username = ?";
    // const sql = "INSERT INTO userdata VALUES (?,?,?)";
    const deleteQuery = db.query(sqlDelete, [req.params.username], (error, result) => {
        if(error) {
            console.log(error); 
            res.status(400).send("Error when updating tasks");
            return;
            // return false;
        };
        console.log(req.body);
        console.log(req.body.tasks);
        for(let task of req.body.tasks) {
            const sql = "INSERT INTO usertasks (username, task, completed) VALUES (?,?,?)";
            // const sql = "INSERT INTO userdata VALUES (?,?,?)";
            const query = db.query(sql, [req.params.username, task.task, task.completed], (error, result) => {
                if(error) {
                    console.log(error); 
                    res.status(400).send("Error when adding task");
                    return;
                    // return false;
                };
                console.log(result);
                // res.status(200).send("Task added");
                // return true;
            })
        }
        res.status(200).send("Tasks updated");
        // return true;
    })
})

app.get("/tasks/:username", async (req, res) => {
    const sqlGetTasks = "SELECT task, completed FROM usertasks WHERE username = ?"
    db.query(sqlGetTasks, [req.params.username], (error, result) => {
        if(error) {
            console.log(error); 
            dataRetrieved();
            return;
        };
        // userData["tasks"] = result3.map(item => ({task: item["task"], completed: item["completed"]}));
        console.log("tasks retrieved");
        res.send(JSON.stringify(result));
        // dataRetrieved();
    });
    console.log("getting tasks");
})

app.post("/register", upload.single("picture"), async (req, res) => {
    // const data = req.body;
    // const profilePicture = new File(data.pictureData);
    // console.log(profilePicture);
    // const dataString = streamToString(data)
    // console.log(data);
    // console.log(req);
    // console.log(req.file);
    // console.log(req.body);
    // return;
    const userData = {...req.body, picture: req.file.buffer};
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
    // console.log(userData);
    const sql = "INSERT INTO userdata VALUES (?,?,?,?)";
    // const sql = "INSERT INTO userdata VALUES (?,?,?)";
    const query = db.query(sql, Object.values(userData), (error, result) => {
        if(error) {
            console.log(error); 
            res.status(400).send({message: "Username already taken"});
            // return false;
        };
        console.log(result);
        res.status(200).send({message: "Account created"});
        // return true;
    });
    // const success = await createNewUser({...req.body, picture: req.file.buffer});
    // console.log(success);
    // if(success){
    //     res.status(200).send({message: "Account created"});
    // }
    // else{
    //     res.status(400).send({message: "Username already taken"});
    // }
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
    const response = await nodefetch("http://www.football-data.co.uk/mmz4281/1718/I1.csv");
    // const data = await response.json();

    const records = [];
    // Initialize the parser
    const parser = parse({
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
        res.send(JSON.stringify(records));
    });
})

app.get("/weather", async (req, res) => {
    // const response = await nodefetch("https://api.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=d0a10211ea3d36b0a6423a104782130e");
    const data = await getWeather();
    // console.log(data);
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
    // console.log(data);
    const temperature = data.main.temp;
    const location = data.name;
    const weather = weatherToBasicWeather(data.weather.main);
    console.log({weather, temperature, location});
    return {weather, temperature, location};
}

async function sportTest(){
    const response = await nodefetch("http://www.football-data.co.uk/mmz4281/1718/I1.csv");
    const data = await streamToString(response.body);
    // console.log(response.body);
    console.log(data);
    // parse()
    parse(data, {relax_column_count_less: true, relaxQuotes: true}, function(err, records){
        if(err) console.log(err.message);
        console.log(records);
    });
}
// getWeather();
// sportTest();

async function streamToString(stream){
    const chunks = [];
    // return new Promise((resolve, reject) => {
    //     stream.on("data", chunk => chunks.push(Buffer.from(chunk)));
    //     stream.on("error", error => reject(error));
    //     stream.on("end", resolve(Buffer.concat(chunks).toString("utf8")));
    // })
    
    // stream.on("data", chunk => chunks.push(chunk));
    // stream.on("end", () => chunks);
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf-8");
}



async function streamToBuffer(stream){
    const chunks = [];
    // return new Promise((resolve, reject) => {
    //     stream.on("data", chunk => chunks.push(Buffer.from(chunk)));
    //     stream.on("error", error => reject(error));
    //     stream.on("end", resolve(Buffer.concat(chunks).toString("utf8")));
    // })
    
    // stream.on("data", chunk => chunks.push(chunk));
    // stream.on("end", () => chunks);
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
    // console.log(data);
    // const newsItems = data.match(/<item>[^]+?<\/item>/g);
    const newsItems = data.match(/(?<=<item>)[^]+?(?=<\/item>)/g);
    // console.log(newsItems);
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
    // console.log(getNewsItems());
    const firstNews = await getFirstNews();
    console.log(firstNews);
    const latestNews = await getLatestNews();
    console.log(latestNews);
    // console.log(getFirstNews());
    // console.log(getLatestNews());
}
// console.log(getNewsItems());
// console.log(getFirstNews());
// console.log(getLatestNews());

// testfunc();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})