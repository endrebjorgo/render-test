const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

morgan.token("body", (request, response) => {
    return JSON.stringify(request.body);
})

const app = express()

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());
app.use(morgan(':method :url :status :response-time ms - Body: :body'));

let notes = [
    {
        id: "1",
        content: "HTML is easy",
        important: true
    },
    {
        id: "2",
        content: "Browser can execute only JavaScript",
        important: false
    },
    {
        id: "3",
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
    }
]

app.get('/api/notes', (request, response) => {
    response.json(notes);
})

app.get("/api/notes/:id", (request, response) => {
    const id = request.params.id;
    const note = notes.find(note => note.id === id);
    if (note) {
        response.json(note);
    } else {
        response.status(404).end();
    }
})

app.put("/api/notes/:id", (request, response) => {
    const body = request.body;
    const id = request.params.id;

    const index = notes.findIndex(note => note.id === id);

    if (index === -1) {
        return repsonse.status(404).json({
            error: `could not find resource with id '${id}'`
        });
    }
    if (!body.id) {
        return response.status(400).json({
            error: "PUT request must contain valid note: missing field 'id'"
        });
    }
    if (!body.content) {
        return response.status(400).json({
            error: "PUT request must contain valid note: missing field 'content'"
        });
    }
    if (body.important === undefined) {
        return response.status(400).json({
            error: "PUT request must contain valid note: missing field 'important'"
        });
    }

    notes[index] = {
        id: body.id,
        content: body.content,
        important: body.important
    }
    return response.status(200).send(notes[index]);
})

app.delete("/api/notes/:id", (request, response) => {
    const id = request.params.id;
    notes = notes.filter(note => note.id !== id);
    response.status(204).end();
})

const generateId = () => {
    const id = Math.floor(Math.random() * 100) + 1;
    return String(id);
}

app.post("/api/notes", (request, response) => {
    const body = request.body;

    if (!body.content) {
        return response.status(400).json({
            error: "POST request must contain 'content' field"
        });
    }

    const note = { 
        id: generateId(),
        content: body.content,
        important: body.important || false
    }

    notes.push(note);
    return response.json(note);
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
