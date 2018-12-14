const fs = require('fs');
const inquirer = require('inquirer');
const oAuthServer = require('./oauth1-server.js');

// Create required directories
function createDirectory(directoryName) {
    let dir = `./${directoryName}/`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    console.log(`✔︎ ${directoryName}`);
}

function checkDirectories() {
    console.log('\nChecking required directories:');
    createDirectory('likes-api-raw');
    createDirectory('likes-json');
    createDirectory('likes-media');
}

// Get Tumblr API OAuth 1.0a credentials
async function checkTumblrApiConfig() {
    // Check if config is ready
    console.log('\nRegister this application to use the Tumblr API at');
    console.log('https://www.tumblr.com/oauth/apps \n');

    console.log('Enter this information in the app registration:')
    console.log('• Application Name:        Like Downloader');
    console.log('• Application Website:     http://localhost:3000/');
    console.log('• Application Description: Like Downloader');
    console.log('• Default callback URL:    http://localhost:3000/callback \n');

    console.log('Enter the app’s Tumblr API information:');

    // Load the Tumblr API config, in case it already has been set.
    let tumblrApiConfig = {};
    try {
        tumblrApiConfig = JSON.parse(fs.readFileSync(`./tumblr-api-config.json`, 'utf8'));
    } catch(err) {
        // We don't care if it fails, because we're going to fill it in.
    }

    let tumblrApiResponses = await inquirer.prompt([
        {
            name: 'consumer_key',
            message: `OAuth Consumer Key`,
            default: tumblrApiConfig.consumer_key,
            type: 'input'
        },
        {
            name: 'consumer_secret',
            message: `Secret Key`,
            default: tumblrApiConfig.consumer_secret,
            type: 'input'
        }
    ]);

    // Save responses to disk
    fs.writeFileSync(`./tumblr-api-config.json`, JSON.stringify(tumblrApiResponses), 'utf8');

    return tumblrApiResponses;
}

async function main() {
    console.log(`Tumblr Like Downloader version 1.0.0`);
    console.log(`Check if for the latest version at https://github.com/jeremiahlee/tumblr-like-downloader`);

    checkDirectories();
    await checkTumblrApiConfig();
    oAuthServer();
}

main();