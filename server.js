'use strict';

// Defining Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.static('public/styles'));
app.use(cors());
app.set('view engine', 'ejs');
const BookKey = process.env.BookKey;
app.use(express.urlencoded({ extended: true })); //we added to get the values from form by request them
//---------------
// Routes
app.get('/', firstpage)
app.get('/searches/new', searchpage)
app.post('/searches', handleBooks)
//---------------------------
//handler functions
//---------------------------
function handleBooks(request, response) {
  //get values from forntend
  const titleName = request.body.title;
  const type = request.body.typeserach;
  //----
  let booktype = '';

  if (type === 'Title')
    booktype = 'intitle';
  else
    booktype = 'inauthor';

  const url = 'https://www.googleapis.com/books/v1/volumes';
  const parametrs = {
    key: BookKey,
    q: `${booktype}+${titleName}`,
    // printType:'books'
    maxResults: 10
  }
  let books = [];
  superagent.get(url, parametrs).then(data => {
    data.body.items.forEach(element => {
      books.push(new Book(element));
    });
    response.render('pages/searches/show', { result: books })

  }).catch(()=>response.render('pages/error',{error:'No search like that'})
  )
}
//---------------------------
function searchpage(request, response) {
  response.render('pages/searches/new')
}
//---------------------------
function firstpage(request, response) {
  response.render('pages/index')
}




function Book(data) {

  this.title = data.volumeInfo.title || 'Book Title'
  //-----
  this.authors = data.volumeInfo.authors || 'Author Name';
  //-----
  this.description = data.volumeInfo.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  //-----
  if (data.volumeInfo.imageLinks) {
    this.imageLinks = data.volumeInfo.imageLinks.smallThumbnail
    let notSecure = this.imageLinks.match(/(http\b)/g);
    if (notSecure[0] === 'http') {
      this.imageLinks = 'https' + this.imageLinks.match(/(?!http\b)\b.+/g)
    }
  }
  else
    this.imageLinks = 'https://i.imgur.com/J5LVHEL.jpg'

}


app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));

app.use('*', (request, resp) => {
  resp.status(404).send('Not found!!');
})

