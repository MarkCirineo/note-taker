const express = require("express");
const path = require("path");
const notes = require("./db/db.json")
const uuid = require("./helpers/uuid")
const fs = require("fs");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/notes.html"))
});

app.get("/api/notes", (req, res) => {
    fs.readFile("./db/db.json", "utf8", (err, data) => { 
        res.json(JSON.parse(data)); 
    })
});

app.post("/api/notes", (req, res) => {
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        fs.readFile("./db/db.json", "utf8", (err, data) => {
            if (err) {
                console.error(err);
            } else {
                const parsedNotes = JSON.parse(data);

                parsedNotes.push(newNote);

                fs.writeFile("./db/db.json", JSON.stringify(parsedNotes), (err) => {
                    err ? console.error(err) : console.log("Successfully added note!")
                });
            }
        });
        const response = {
            status: 'success',
            body: newNote,
        };
        
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting review');
      }
})

// delete request
app.delete("/api/notes/:id", (req, res) => {
    fs.readFile("./db/db.json",  "utf8", (err, data) => {
        const parsedNotes = JSON.parse(data);
        for (let i = 0; i < parsedNotes.length; i++) {
            if (parsedNotes[i].id === req.params.id) {
                parsedNotes.splice(i, 1);
            }
        }
        fs.writeFile("./db/db.json", JSON.stringify(parsedNotes), (err) => {
            err ? console.error(err) : console.log("Succesfully deleted note!")
        })
        res.json(parsedNotes)
    });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"))
});

app.listen(PORT, () => {
    console.log(`App listening at https://localhost:${PORT}`)
});