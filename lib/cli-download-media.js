const fs = require('fs');
const fsPromises = fs.promises;
const https = require('https');
const path = require("path");
const { exec } = require('child_process');

var filesDownloaded = 0;

async function main() {
    let likesJsonFiles = await fsPromises.readdir('./likes-json');

    for (let likeFileName of likesJsonFiles) {
        let likeFile = await fsPromises.readFile(`./likes-json/${likeFileName}`, 'utf8');
        let like;
        try {
            like = JSON.parse(likeFile);
        } catch(err) {
            console.log(`Error in ${likeFileName}: ${err}`);
            continue;
        }
        delete likeFile;

        // Create destination directory if needed
        let saveDestination = `./likes-media/${like.blog_name}`;
        if (!fs.existsSync(saveDestination)) {
            fs.mkdirSync(saveDestination);
        }

        if (like.type === 'photo') {
            // for each photo, download like.photos[].original_size.url
            for (let photo of like.photos) {
                let filename = getFileNameFromUrl(photo.original_size.url);
                
                if (filename === null) {
                    console.log(`Error in ${likeFileName}: image filename not found in URL: ${photo.original_size.url}`);
                    continue;
                }

                // Skip if file already exists
                if (fs.existsSync(`${saveDestination}/${filename}`)) {
                    console.log(`Warning in ${likeFileName}: ${saveDestination}/${filename} already exists. Skipping.`);
                    continue;
                }

                // Download file
                try {
                    await downloadFile(photo.original_size.url, `${saveDestination}/${filename}`);
                } catch(err) {
                    console.log(`Error in ${likeFileName}: image could not be downloaded: ${photo.original_size.url} because of ${err}.`);
                }
            }
        } else if (like.type === 'video') {
            if (like.video_type !== 'tumblr') {
                console.log(`Error in ${likeFileName}: video could not be downloaded because it is of ${like.video_type} type.`);
                continue;
            }

            if (!like.video_url) {
                console.log(`Error in ${likeFileName}: video could not be downloaded because of unknown URL.`);
                continue;
            }

            let filename = getFileNameFromUrl(like.video_url);
            if (filename === null) {
                console.log(`Error in ${likeFileName}: video filename not found in URL: ${like.video_url}`);
                continue;
            }

            // Skip if file already exists
            if (fs.existsSync(`${saveDestination}/${filename}`)) {
                console.log(`Warning in ${likeFileName}: ${saveDestination}/${filename} already exists. Skipping.`);
                continue;
            }

            // Download file
            try {
                await downloadFile(like.video_url, `${saveDestination}/${filename}`);
            } catch(err) {
                console.log(`Error in ${likeFileName}: video could not be downloaded: ${like.video_url} because of ${err}.`);
            }
        } else if (like.type === 'text') {
            console.log(`Warning in ${likeFileName}: Text post. Skipping.`);
        }
    }

    console.log(`${filesDownloaded} files downloaded \n`);

    console.log(`Your like media is saved in ${path.resolve("./")}/likes-media`);
    console.log(`Your like data is saved in ${path.resolve("./")}/likes-json`);

    // Open Finder to the folder of liked media
    exec('open ./likes-media');
}

function getFileNameFromUrl(url) {
    let urlParts = url.match(/[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/);

    if (urlParts === null) {
        return null;
    } else {
        return urlParts[0];
    }
}

function downloadFile(url, dest) {
    console.log(`Starting download of ${url}`);

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest, { flags: 'wx' });

        const request = https.get(url, response => {
            if (response.statusCode === 200) {
                filesDownloaded++;
                response.pipe(file);
            } else {
                file.close();
                fs.unlink(dest, () => {}); // Delete temp file
                reject(`Error: Server responded with ${response.statusCode}: ${response.statusMessage}`);
            }
        });

        request.on('error', err => {
            file.close();
            fs.unlink(dest, () => {}); // Delete temp file
            reject(err.message);
        });

        file.on('finish', () => {
            console.log(`Finished download of ${url}`);
            resolve();
        });

        file.on('error', err => {
            file.close();

            if (err.code === 'EEXIST') {
                reject(`Error: File already exists`);
            } else {
                fs.unlink(dest, () => {}); // Delete temp file
                reject(err.message);
            }
        });
    });
}

main();