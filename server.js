'use strict';

// Defining Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT || 3003;
const app = express();
app.use(express.static('public/styles'));
app.use(cors());
app.set('view engine', 'ejs');
//---------------
// Routes
app.get('/hello', firstpage)
app.get('/searches/new', searchpage)


function searchpage(request, response) {
  response.render('pages/searches/new')
}
function firstpage(request, response) {
  response.render('pages/index')
}

app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
app.use('*', (request, resp) => {
  resp.status(404).send('Not found!!');
})
