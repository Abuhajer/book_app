'use strict';

// Defining Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');
const { response } = require('express');

require('dotenv').config()
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.static('public/styles'));
app.use(cors());
app.set('view engine', 'ejs');
const BookKey = process.env.BookKey;
app.use(express.urlencoded({ extended: true })); //we added to get the values from form by request them
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL)

//---------------
// Routes
app.get('/', firstpage)
app.get('/searches/new', searchpage)
app.post('/searches', handleBooks)
app.get('/books/:id', getDetails)
app.post('/books', setBook)
//---------------------------
//handler functions
//---------------------------
function getDetails(request, response) {
  const sql = 'SELECT * FROM Books WHERE id=$1;';
  console.log(request.params.id)
  const parametr = [request.params.id];
  client.query(sql, parametr).then(data => response.render('pages/books/detail', { result: data.rows[0] }))
}
//---------------------
function setBook(request, respnse) {

  const { title, authors, description, imageLinks, isbn, categories } = request.body;
  let counter;
  const sql0 = 'SELECT * FROM Books;';
  client.query(sql0).then(alldata => {
    counter=alldata.rows.length;
    const sql1 = 'SELECT * FROM Books WHERE isbn=$1;';
    const parametr1 = [isbn];
    client.query(sql1, parametr1).then(data => {
      if ((data.rows.length === 0)) {
        const sql2 = 'INSERT INTO Books (title,author,isbn,image_url,description,categories) VALUES ($1,$2,$3,$4,$5,$6);';
        const parametr2 = [title, authors, isbn, imageLinks, description, categories];
        counter++;
        client.query(sql2, parametr2).then(() => {
          respnse.redirect(`/books/${counter}`);

        })

      }
      else {
        respnse.redirect(`/books/${data.rows[0].id}`);
      }


    })

  })


}
//---------------------s
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
    response.render('pages/searches/show',{ result: books })

  })

}
//---------------------------
function searchpage(request, response) {
  response.render('pages/searches/new')
}
//---------------------------
function firstpage(request, response) {
  const sql = 'SELECT * FROM Books;';
  client.query(sql).then(data => response.render('pages/index', { result: data.rows })
  )

}
//-----------------------------
function errorHandling(request,response,massage){
  response.render('pages/error', { error: massage})
}


//-------------------------------
//COUNSTRUCTORS
function Book(data) {
  this.categories = data.volumeInfo.categories || 'none';
  this.isbn = data.volumeInfo.industryIdentifiers[0].type + data.volumeInfo.industryIdentifiers[0].identifier || 'none';

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

client.connect().then(() => {
  app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
}).catch(() => console.log('no connect on database'));

app.use('*', (request, resp) => {
  resp.status(404).send('Not found!!');
})

