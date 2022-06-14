const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json()); // parse incoming json bodies

app.get('/', (req, res) => {
    console.log('Running on localhost:3000')
    res.send('Hollow World!');
});

app.listen(3000)


