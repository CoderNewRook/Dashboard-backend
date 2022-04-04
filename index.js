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
    const query = db.query(sql, [req.file.buffer, req.params.username, req.query.id], (error, result) => {
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
    // console.log(req.body);
    // console.log(req.file);
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

app.put("/tasks/:username", async (req, res) => {
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

app.get("/sport/team/:username", async (req, res) => {
    console.log(req.params);
    const sqlGetPhotos = "SELECT team FROM userpreferences WHERE username = ?"
    db.query(sqlGetPhotos, [req.params.username], (error, result) => {
        if(error) {
            console.log(error); 
            return;
        };
        if(result.length > 0) res.status(200).send(result[0].team);
        else res.status(400).send("");
    });
})

app.put("/sport/team/:username", async (req, res) => {
    const sqlGetPhotos = "SELECT team FROM userpreferences WHERE username = ?"
    db.query(sqlGetPhotos, [req.params.username], (error, result) => {
        if(error) {
            console.log(error); 
            return;
        };
        if(result.length > 0) {
            // update
            const sql = "UPDATE userpreferences SET team = ? WHERE username = ?";
            const query = db.query(sql, [req.body.team, req.params.username], (error, result) => {
                if(error) {
                    console.log(error); 
                    res.status(400).send("Error when updating last team");
                    return;
                };
                res.status(200).send("Last team updated");
                console.log(result);
            })
        }
        else {
            // post
            const sql = "INSERT INTO userpreferences VALUES (?,?)";
            const query = db.query(sql, [req.params.username, req.body.team], (error, result) => {
                if(error) {
                    console.log(error);
                    res.status(400).send("Error when adding last team");
                    return;
                };
                res.status(200).send("Last team added");
                console.log(result);
            })
        }
    });
})

app.get("/firstNews", async (req, res) => {
    const firstNews = await getFirstNews();
    res.send(JSON.stringify(firstNews));
})

app.get("/latestNews", async (req, res) => {
    const latestNews = await getLatestNews();
    res.send(JSON.stringify(latestNews));
})

async function streamToString(stream){
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf-8");
}

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

app.listen(port, () => {console.log(`Server listening on port ${port}`)});
