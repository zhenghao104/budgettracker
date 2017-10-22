const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const PouchDB = require('pouchdb');
const methodOverride = require('method-override');

// Set the port to listen to requests on
const PORT = process.env.PORT || 8080;

// Create the app
const app = express();

// Create the database
const db = new PouchDB('transactions_db');

// =========================
// App Configs
// =========================
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// =======================================================================
// RESTful Routes
// HTTP Verbs: GET, POST, PUT, DELETE
//
// Name     |   Path      |   HTTP Verb |   Purpose
// =======================================================================
// Index    |   /         |   GET       | List all the posts
// New      |   /new      |   GET       | Show a form to create new posts
// Create   |   /         |   POST      | Create a new post
// Show     |   /:id      |   GET       | Show a single post
// Edit     |   /:id/edit |   GET       | Show a form to edit a post
// Update   |   /:id      |   PUT       | Update a particular post
// Destroy  |   /:id      |   DELETE    | Delete a particular post
// =======================================================================

//Summation of the total amount
var sumPos = Number(0);
var sumNeg = Number(0);

//pass in data to post for rendering into view to allow dynamically changing data
app.get('/', function(req, res) {
  db.allDocs({
    include_docs: true,
    attachments: true,
    descending: true
  }, function(error, result) {
    if(error) {
      console.log(error);
    } else {
      res.render('transactions', { transactions: result.rows , sumPos: sumPos,
      sumNeg: sumNeg});
      console.log(result.rows);
    }
  });
});

app.get('/new', function(req,res) {
  res.render('new-transaction', {})
})

//to post a request for data
app.post('/new', function(req,res) {
  //res.send('You sent the transaction "' + req.body.title +'".');
  // Create a transaction object to store into the database.
  var newTransaction = {
    _id: new Date().toJSON(),
    title: req.body.title,
    amount: Number(req.body.amount),
    sign: req.body.sign,
    date: req.body.date,
    category: req.body.category,
    description: req.body.description,

  }

  if (req.body.newcategory) {
    newTransaction.category=req.body.newcategory;
  }

  // Add the transaction object into the database.
  db.put(newTransaction, function(error, posted) {
    if(error) {
      console.log(error);
    } else {
      console.log(posted);
    }
    res.redirect('/');
  });
})

// Routes to a post page.
app.get('/:id', function(req, res) {
  // Obtain from the database of transaction.
  db.get(req.params.id, function(error, found) {
      if(error) {
        console.log(error);
        res.redirect('/');
      } else {
        res.render('show-transaction', { transaction: found });
        console.log(found)
      }
    });
})

// Shows the edit
app.get('/:id/edit', function(req,res) {
  //Edit the data in the database of the transaction
  db.get(req.params.id, function(error, found) {
    if(error) {
      console.log(error);
      res.redirect('/');
    } else {
      res.render('edit-transaction', { transaction: found });
    }
  });

})

  //Update the information of the post
  app.put('/:id', function(req,res) {

    var toSave = {
      title: req.body.title,
      date: req.body.date,
      category: req.body.category,
      amount: Number(req.body.amount),
      sign: req.body.sign,
      description: req.body.description
    };

    db.get(req.params.id, function(error, found) {
      if(error) {
        console.log(error);
        res.redirect('/');
      } else {
        db.put({
          _id: found._id,
          _rev: found._rev,
          title: req.body.title,
          date: req.body.date,
          category: req.body.category,
          amount: Number(req.body.amount),
          sign: req.body.sign,
          description: req.body.description
        }, function(error, saved) {
          if(error) {
            console.log(error);
          }
          res.redirect('/');
        });
      }
    });

  })

// Listen for requests
app.listen(PORT, () => {
  console.log('Server running on Port:', PORT);
});
