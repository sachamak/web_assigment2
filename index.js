const express= require('express');
const app=express();
const dotenv = require('dotenv').config();
const port = process.env.PORT;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect(process.env.DB_CONNECTION, {
});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log("Connected to Database"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const postsRoutes = require("./routes/Post_routes");
const commentsRoutes = require("./routes/Comments_routes");

app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);

app.listen(port,() =>{
    console.log(`Exemple app listening on port http://localhost:${port}`);
    });
    
module.exports = app;