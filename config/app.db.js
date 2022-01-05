const mongoose = require('mongoose');

// this is our MongoDB database
const dbRoute = "mongodb+srv://Deepak:@Deepak002@cluster0.pelmi.mongodb.net/Barcley?retryWrites=true&w=majority"//process.env.DB

//const dbRoute = "mongodb+srv://<user>:<pass>@cluster0-rwgsz.azure.mongodb.net/test?retryWrites=true&w=majority";

// connects our back end code with the database
mongoose.connect(dbRoute, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

let db = mongoose.connection;

db.once('open', () => {
  console.log('connected to the database')
});

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
