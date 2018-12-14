const fs = require('fs');
const fsPromises = fs.promises;
const tumblr = require('tumblr.js');

let tumblrApiConfig = JSON.parse(fs.readFileSync(`./tumblr-api-config.json`, 'utf8'));

let client = tumblr.createClient({
    credentials: tumblrApiConfig,
    returnPromises: true,
});

async function getLikes(beforeTimestamp) {
    console.log(`Retrieving likes before: ${new Date(Number(beforeTimestamp) * 1000)} (${beforeTimestamp})`);

    let likesResp = await client.userLikes({
        limit: 20,
        before: beforeTimestamp
    });

    return {
        likesResp: likesResp, 
        beforeTimestamp: beforeTimestamp
    };
}

async function saveLikes(likesRespAndTimestamp) {
    let {likesResp, beforeTimestamp} = likesRespAndTimestamp;

    // Save the raw API response for posterity
    await fsPromises.writeFile(`./likes-api-raw/before-${beforeTimestamp}.json`, JSON.stringify(likesResp), 'utf8');

    // Save individual likes
    console.log(`${likesResp.liked_posts.length} more likes retrieved.`);
    for (let like of likesResp.liked_posts) {
        await fsPromises.writeFile(`./likes-json/${like.id}.json`, JSON.stringify(like), 'utf8');
    }

    return likesResp._links;
}

async function processSetOfLikes(beforeTimestamp) {
    getLikes(beforeTimestamp)
    .then(saveLikes)
    .then(function(links) {
        if (links && links.hasOwnProperty('next')) {
            // Recursive, so use setImmediate to break the call stack.
            setImmediate(processSetOfLikes, links.next.query_params.before);
        } else {
            console.log('DONE: list of likes downloaded.\n');

            console.log(`The next step is to download the images and video media from Tumblr.`);
            console.log(`Run this command next:`);
            console.log(`npm run get-likes-media`);
        }

        return;
    })
    .catch(function(err) {
        console.log(err);
    });
}

processSetOfLikes(Math.floor(Date.now() / 1000));
