const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const util = require('util');
const OAuth = require('oauth').OAuth;

let oAuthClient; // This will be initialized when main() called
let tumblrApiConfig; // This will be initialized when main() called

// Tumblr endpoints
const authorizeUrl = 'https://www.tumblr.com/oauth/authorize';
const requestTokenUrl = 'https://www.tumblr.com/oauth/request_token';
const accessTokenUrl = 'https://www.tumblr.com/oauth/access_token';
const tumblrApiTestUrl = 'https://api.tumblr.com/v2/blog/developers.tumblr.com/info';

const router = new express.Router();

router.get('/', function (req, res, next) {
    oAuthClient.getOAuthRequestToken(function (err, token, secret) {
        if (err) {
            console.error('Failed with error', err);
            return next(err);
        }

        // Save generated tokens to session
        req.session.requestToken = token;
        req.session.requestTokenSecret = secret;

        let authUrl = authorizeUrl + '?oauth_token=' + token;
        return res.redirect(authUrl);
    });
});

router.get('/callback', function (req, res, next) {
    console.log('Verifying permission was granted…');
    // console.log('oauth_token %s | oauth_verifier %s', req.query.oauth_token, req.query.oauth_verifier);
    // console.log('session token %s | session secret %s', req.session.requestToken, req.session.requestTokenSecret);

    if (!req.session.requestToken || !req.session.requestTokenSecret) {
        console.error('Error: Missing OAuth session information');
        return next('Missing OAuth session information');
    }

    oAuthClient.getOAuthAccessToken(
        req.query.oauth_token,
        req.session.requestTokenSecret,
        req.query.oauth_verifier,
        function (err, token, secret) {
            if (err) {
                console.error('Error: Access token could not be obtained from Tumblr API', err);
                return next('getOAuthAccessToken failed');
            }

            testOAuthToken(token, secret);
        }
    );

    function testOAuthToken(token, secret) {
        oAuthClient.get(tumblrApiTestUrl, token, secret, function (err) {
            if (err) {
                console.error('Error: OAuth token does not seem to be valid', err);
                return next('Error testing OAuth token');
            }

            console.log(`\nPermisson received.`);

            // Save the token and token secret to the config file
            tumblrApiConfig.token = token;
            tumblrApiConfig.token_secret = secret;

            try {
                fs.writeFileSync(`./tumblr-api-config.json`, JSON.stringify(tumblrApiConfig), 'utf8');
            } catch(err) {
                console.log(`ERROR: could not save tumblr-api-config.json: ${err}`);
            }

            console.log(`\nThe next step is to download your list of likes from Tumblr.`);
            console.log(`Run this command next:`);
            console.log(`npm run get-likes-data`);

            // Kill the process after sending a response back to the browser
            setImmediate(process.exit);

            return res.send(`<strong>Authorization successful!</strong><br>OAuth Access Token: <code>${token}</code><br>OAuth Access Token Secret: <code>${secret}</code><p>You can close this browser.</p>`);
        });
    }
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: 'Verizon is a prude',
    resave: false,
    saveUninitialized: true
}));

app.use('/', router);

// Catch-all error handler
app.use(function (err, req, res, next) {
    // If there are no errors here, it must be 404
    if (!err) {
        err = new Error('Not found');
        res.status = 404;
    }

    res.status(err.status || 500);
    return res.send(JSON.stringify(err, null, 2));
});

function main() {
    tumblrApiConfig = JSON.parse(fs.readFileSync(`./tumblr-api-config.json`, 'utf8'));
    const appConsumerKey = tumblrApiConfig.consumer_key;
    const appConsumerSecret = tumblrApiConfig.consumer_secret;

    oAuthClient = new OAuth(
        requestTokenUrl,
        accessTokenUrl,
        appConsumerKey,
        appConsumerSecret,
        '1.0A',
        'http://localhost:3000/callback',
        'HMAC-SHA1'
    );

    app.listen(3000, function (err) {
        if (err) {
            throw err;
        }
        console.log(``);
        console.log(`You need to give this app permission to access your likes on Tumblr.`);
        console.log(`In your Web browser, go to http://localhost:3000`);
    });
}

module.exports = main;