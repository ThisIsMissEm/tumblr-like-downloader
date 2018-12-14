# How to download your Tumblr likes

This is a Node.js command line utility to download your likes from Tumblr. It downloads the raw JSON data for the like and the photos and videos attached to the liked post.

**Current version:** 1.0.0

## Step 1: Setup Node.js

[Download Node.js and install Node.js](https://nodejs.org/) on your computer.

This script has been tested on macOS 10.14.2 using Node.js 11.4.0 and npm 6.5.0. It may work under other configurations, but I have not tested it myself.


## Step 2: Download this app

[Download this app](https://github.com/jeremiahlee/tumblr-like-downloader/archive/master.zip) and unzip it.

You can also [clone it from Github](https://github.com/jeremiahlee/tumblr-like-downloader.git) instead if you are comfortable doing that.


## Step 3: Install dependencies

Open Terminal. It's an located in at Applications/Utilities/Terminal.app in Finder.

Change directories to go to this app. You probably downloaded and unzipped it into your Downloads directory. If so, copy and paste this command into Terminal:

`cd ~/Downloads/tumblr-like-downloader-master`

Now, you need to install this app's dependencies. Copy and paste this command into Terminal:

`npm install`

## Step 4: Run this app

There are 3 steps to downloading your likes from Tumblr:

1. Registering this app on Tumblr and giving it permission to access your data.
2. Downloading the list of liked posts.
3. Downloading the photos and videos in the liked posts.

### 4.1 Tumblr API registration and permission

Copy and paste this command into Terminal:

`npm run start`

Follow the instructions.

### 4.2 Download liked posts data

Copy and paste this command into Terminal:

`npm run get-likes-data`

Follow the instructions.

### 4.3 Download liked posts data

Copy and paste this command into Terminal:

`npm run get-likes-media`

Follow the instructions.

## Step 5: Enjoy your likes forever

At the end of this, you will have 3 directories with the data from your liked posts.

- `likes-api-raw`: The raw Tumblr API response when retrievng the paginated liked posts. You can delete this when done.
- `likes-json`: Individual liked posts (JSON data for the post). Keep these. They can be used to create more easy ways to explore your liked posts in the future.
- `likes-media`: Images and videos for the posts


# Known errors and what they mean

> image could not be downloaded: (url) because of Error: Server responded with 301: Moved Permanently.

This means the image was removed by Tumblr

> image could not be downloaded: (url) because of Error: Server responded with 404: Not Found

This means the image was deleted by the author or by Tumblr

> video could not be downloaded: (url) because of Error: Server responded with 403: Forbidden.

This means the video is no longer available.

**Run into a  problem?** [File an issue here.](https://github.com/jeremiahlee/tumblr-like-downloader/issues)