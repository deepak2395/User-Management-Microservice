const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const cardSchema = new Schema(
    {
        bookID: String,
        title: String,
        price: Number,
        owner: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'users'
        }]
    },
    { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("cards", cardSchema);