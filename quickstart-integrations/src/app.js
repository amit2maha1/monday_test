require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const mongoose = require('mongoose'); // Import mongoose
const cors = require("cors");
const { PORT: port } = process.env;
const app = express();
const request = require('request'); // "Request" library for HTTP requests
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const client_id = process.env.CLIENT_ID ; // Your app's client ID
const client_secret = process.env.CLIENT_SECRET; // Your app's secret
const redirect_uri = process.env.REDIRECT_URI; // The URI you will send your user to after auth

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

// Gracefully handle app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

app.use(cors([
  {
    origin: "https://10366872-3f23d3a87045.apps-tunnel.monday.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
])).use(cookieParser())

app.use(bodyParser.json());
app.use(routes);

app.get('/start', function (req, res) {
  try {

  
    res.redirect('https://auth.monday.com/oauth2/authorize?' +
      querystring.stringify({
        client_id: client_id,
        redirect_uri: redirect_uri ,
        scopes: "me:read boards:read boards:write"
      }));
  } catch (error) {
    console.error('Error in /start route:', error);
    res.status(500).send('Internal Server Error');
  }

 
});


app.get('/oauth/callback', function (req, res) {

  // upon callback, your app first checks state parameter
  // if state is valid, we make a new request for access and refresh tokens

  var code = req.query.code || null;


    res.clearCookie('monday_auth_state');
    var authRequest = {
      url: 'https://auth.monday.com/oauth2/token',
      form: {
        redirect_uri: redirect_uri,
        client_id: client_id,
        client_secret: client_secret,
        code: code,
      },
    };

    // POST auth.monday.com/oauth2/token

    request.post(authRequest, function (error, response, body) {

      if (!error && response.statusCode === 200) {

        var jsonBody = JSON.parse(body);
        var accessToken = jsonBody.access_token || null;
        var refreshToken = jsonBody.refresh_token || null;
        var tokenType = jsonBody.token_type || null;
        var scope = jsonBody.scope || null;

        res.redirect("/finish?" +
          querystring.stringify({
            status: 'success',
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: tokenType,
            scope: scope,
          }));

      } else {

        res.redirect("/finish?" +
          querystring.stringify({
            status: 'failure'
          }));

      }
    });
  
});

// Show final app page
app.get('/finish', function (req, res) {

  let {
    access_token,
    refresh_token,
    token_type,
    scope,
    status,
  } = req.query;

  const queryString = querystring.stringify({
    status,
    access_token,
    refresh_token,
    token_type,
    scope,
  });

  const redirectUrl = `https://10366872-3f23d3a87045.apps-tunnel.monday.app/oauth?${queryString}`;

  res.redirect(redirectUrl);


});
app.listen(port, () => {
  console.log(`Transform text integration listening on port ${port}`)
});

module.exports = app;
