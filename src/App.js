import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [notes, setNotes] = useState([]);
    const [text, setText] = useState("");
    const [color, setColor] = useState("#ffeb3b");

    // Load notes from local storage on page load
    useEffect(() => {
        const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
        setNotes(savedNotes);
    }, []);

    // Save notes to local storage whenever they change
    useEffect(() => {
        localStorage.setItem("notes", JSON.stringify(notes));
    }, [notes]);

    // Fetch notes from the backend (optional)
    useEffect(() => {
        axios.get("http://localhost:5000/notes")
            .then(response => setNotes(response.data))
            .catch(error => console.error("Error fetching notes:", error));
    }, []);

    // Add a note
    const addNote = () => {
        if (text.trim() === "") return;
        const newNote = { id: Date.now(), text, color, pinned: false };

        axios.post("http://localhost:5000/notes", newNote)
            .then(response => {
                setNotes([response.data, ...notes]); // Add new note at the top
                setText("");
            })
            .catch(error => console.error("Error adding note:", error));
    };

    // Delete a note
    const deleteNote = (id) => {
        axios.delete(`http://localhost:5000/notes/${id}`)
            .then(() => setNotes(notes.filter(note => note.id !== id)))
            .catch(error => console.error("Error deleting note:", error));
    };

    // Edit a note
    const editNote = (id, newText) => {
        setNotes(notes.map(note => (note.id === id ? { ...note, text: newText } : note)));
    };

    // Pin/Unpin a note
    const togglePin = (id) => {
        setNotes(notes.map(note => (note.id === id ? { ...note, pinned: !note.pinned } : note)));
    };

    // Change note color
    const changeColor = (id, newColor) => {
        setNotes(notes.map(note => (note.id === id ? { ...note, color: newColor } : note)));
    };

    return (
        <div className="app">
            <h1>📌 Sticky Notes</h1>
            <div className="input-container">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a note..."
                />
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                <button onClick={addNote}>➕ Add</button>
            </div>
            <div className="notes-container">
                {notes
                    .sort((a, b) => b.pinned - a.pinned) // Show pinned notes first
                    .map(note => (
                        <div key={note.id} className="note" style={{ backgroundColor: note.color }}>
                            <p contentEditable onBlur={(e) => editNote(note.id, e.target.textContent)}>
                                {note.text}
                            </p>
                            <div className="note-buttons">
                                <button onClick={() => togglePin(note.id)}>
                                    {note.pinned ? "📍 Unpin" : "📌 Pin"}
                                </button>
                                <input type="color" value={note.color} onChange={(e) => changeColor(note.id, e.target.value)} />
                                <button onClick={() => deleteNote(note.id)}>❌</button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default App;
