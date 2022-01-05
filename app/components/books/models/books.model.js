/* const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const booksSchema = new Schema(
    {
        email: String,
        registerid: String,
        password: String,
        cards: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'cards'
        }]
    },
    { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("books", booksSchema); */