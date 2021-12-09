/***********************
  Load Components!
  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
const { queryResult } = require('pg-promise');
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const axios = require('axios');
const qs = require('query-string');

//Create Database Connection
var pgp = require('pg-promise')();


/**********************
  Database Connection information
  host: This defines the ip address of the server hosting our database.
		We'll be using `db` as this is the name of the postgres container in our
		docker-compose.yml file. Docker will translate this into the actual ip of the
		container for us (i.e. can't be access via the Internet).
  port: This defines what port we can expect to communicate to our database.  We'll use 5432 to talk with PostgreSQL
  database: This is the name of our specific database.  From our previous lab,
		we created the football_db database, which holds our football data tables
  user: This should be left as postgres, the default user account created when PostgreSQL was installed
  password: This the password for accessing the database. We set this in the
		docker-compose.yml for now, usually that'd be in a seperate file so you're not pushing your credentials to GitHub :).
**********************/
const dev_dbConfig = {
	host: 'db',
	port: 5432,
	database: 'users_db',
	user: 'postgres',
	password: 'pwd'
};

/** If we're running in production mode (on heroku), the we use DATABASE_URL
 * to connect to Heroku Postgres.
 */
const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

// Heroku Postgres patch for v10
// fixes: https://github.com/vitaly-t/pg-promise/issues/711
if (isProduction) {
  pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}

const db = pgp(dbConfig);


// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory

/*End of initializing stuff*/



// login page
	// what appears when first starting application
app.get('/', function(req, res) {
	res.render('pages/home',{
		items: '',
		error: false,
		message: ''
	});
});

app.get('/reviews', function(req, res) {
    var footballGames = 'select * from cocktail;';
    var rowCount = 'select COUNT(*) from cocktail;';
    db.task('get-everything', task => {
        return task.batch([
            task.any(footballGames),
            task.any(rowCount)
        ]);
    })
        .then(info => {
			//console.log(info[0]); 
            res.render('pages/reviews',{
                result: info[0],
				error: false,
				message: ''
            })
        })
        .catch(error => {
            req.flash('error', error);
            res.render('pages/reviews', {
                result: '',
                error: true,
                message: ''
            })
        });

});

app.post('/get_feed', function(req, res) {
	var drink = req.body.drink; //TODO: Remove null and fetch the param (e.g, req.body.param_name); Check the NYTimes_home.ejs file or console.log("request parameters: ", req) to determine the parameter names  
	if(drink) {
	  axios({
		url:`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drink}`,
		  method: 'GET',
		  dataType:'json',
		})
		  .then(items => {
			// TODO: Return the reviews to the front-end (e.g., res.render(...);); Try printing 'items' to the console to see what the GET request to the Twitter API returned.
			// Did console.log(items) return anything useful? How about console.log(items.data.results)?
			// Stuck? Look at the '/' route above
			// console.log(items.data.drinks); 
			res.render('pages/home',{
			//   my_title: "NYTimes Movie Reviews",
			  items: items.data.drinks,
			  error: false,
			  message: ''
			})
			console.log(items.strDrink); 
		  })
		  .catch(error => {
			console.log(error);
			res.render('pages/home',{
			//   my_title: "NYTimes Movie Reviews",
			  items: '',
			  error: true,
			  message: error
			})
		  });
  
  
	}
	else {
	  // TODO: Render the home page and include an error message (e.g., res.render(...);); Why was there an error? When does this code get executed? Look at the if statement above
	  // Stuck? On the web page, try submitting a search query without a search term
	  res.render('pages/home',{
		// my_title: "NYTimes Movie Reviews",
		items: items.data.drinks,
		error: true,
		message: 'Enter a Drink Name'
	  })
	}
  });

  app.post('/addReview', function(req, res) {
	var dateToAdd = new Date(); 
	var drinkName = req.body.recipient;
	var reviewToAdd = req.body.message;
	var cocktails = 'select * from cocktail;';
	var insert_statement = "INSERT INTO cocktail(cocktailName, review,reviewDate) VALUES('" + drinkName + "','" +
		reviewToAdd + "','"+dateToAdd+"') ON CONFLICT DO NOTHING;";

	db.task('get-everything', task => {
				return task.batch([
					task.any(insert_statement),
					task.any(cocktails)
				]);
			})
		.then(info => {
			// console.log(insert_statement); 
			// console.log(info[1]); 
			res.render('pages/reviews',{
				result: info[1],
				error: false,
				message: ''
			})
		})
		.catch(error => {
			// display error message in case an error
			request.flash('error', err);
			response.render('pages/reviews', {
				result: '',
				error: true,
				message: ''
			})
		});
});

  app.get('/searchReviews', function(req, res) {
	var drinkNeeded = req.query.drinkToFind; 
	var selectState = "Select * from cocktail where cocktailName = '" + drinkNeeded +"';";
	db.task('get-everything', task => {
				return task.batch([
					task.any(selectState)
				]);
			})
		.then(info => { 
			res.render('pages/reviews',{
				result: info[0],
				error: false,
				message: ''
			})
		})
		.catch(error => {
			// display error message in case an error
			request.flash('error', err);
			response.render('pages/reviews', {
				result: '',
				error: true,
				message: ''
			})
		});
});

//--------------

const server = app.listen(process.env.PORT || 3000, () => {
	console.log(`Express running → PORT ${server.address().port}`);
  });