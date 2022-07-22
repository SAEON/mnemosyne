# mnemosyne
A very simple HTTP-range supporting file server. Stream your file in, and stream your file out! Named after the goddess of memory in Greek mythology.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Background](#background)
- [Development](#development)
  - [Deployment](#deployment)
- [Usage](#usage)
  - [Viewing/retrieving files](#viewingretrieving-files)
    - [Customize GET requests via URL params](#customize-get-requests-via-url-params)
    - [Serving websites](#serving-websites)
  - [Uploading files](#uploading-files)
- [Future functionality](#future-functionality)
- [TODO](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Background
I started looking at using a file server that supports the HTTP GET Range header, thinking that this would be a good way of registering out-db NetCDF files in PostGIS. However this doesn't work - NetCDF files over a network require an OPeNDAP interface.

But a new format for cloud-optimized, multidimensional data (Zarr), and the potential need for SAEON to host (or at least test hosting) cloud-optimized-geotifs (COGs) makes this quick project worthwhile.

# Development
Install Node.js v18.6. Then setup the project:

```sh
# Clone the repository
git clone git@github.com:SAEON/mnemosyne.git
cd mnemosyne

# Install chomp CLI
npm install -g chomp
chomp --version # (wait for output)

# Install dependencies
npm install

# Start the app and write code!
chomp --watch
```

## Deployment
- Install Node.js
- Install dependencies from the lockfile (`package-lock.json`)
- Start the application. Use a process manager such as `pm2` to restart on failure. See below for Dockerized deployment

```sh
# Clone the repository
git clone git@github.com:SAEON/mnemosyne.git
cd mnemosyne

# Install dependencies from lockfile
npm ci --only=production

# Start the app
NODE_ENV=production \
TZ=UTC \
  node \
    src \
      --key <super-long-secret>
      --volume /path/to/directory
```

### Docker
***Build a Docker image locally***
```sh
docker build -t mnemosyne .
```

***Run a containerized instance of the server***
```sh
# default volume (cache directory), uploads disabled
docker run --rm -p 3000:3000 --name mnemosyne

# Mount a host volume, uploads disabled
docker run \
  --rm \
  -p 3000:3000 \
  --name mnemosyne \
  -v /some/host/directory:/mounted-directory \
  -e VOLUME=/mounted-directory \
  mnemosyne

# Mount a host volume, uploads enabled
docker run \
  --rm \
  -p 3000:3000 \
  --name mnemosyne \
  -v /some/host/directory:/mounted-directory \
  -e VOLUME=/mounted-directory \
  -e KEY=yoursupersecretkey \
  mnemosyne
```

# Usage
- Serve directory listings / files via `HTTP GET` requests
  - Folders that contain `index.html` files wil be served as websites.
  - CORS is enabled (`*`), so the file server can be perused automatically via client-side JavaScript
- Upload files via `HTTP PUT` requests


## Viewing/retrieving files
Tools that understand cloud-optimized formats (i.e. COGs, Zarrs, etc.) should work flawlessly when pointed to files hosted on this server. Otherwise, some examples of explicit HTTP requests:

***Download entire file via cURL***
```
curl -X GET https://<domain>/filename.tif
```

***Download partial file via cURL***
```
curl -H "Range bytes=12-20" -X GET https://<domain>/filename.tif
```

### Customize GET requests via URL params
By default a GET request will serve (in order of preference):

- A file if specified
- An `index.html` file (served as a website) if present
- The directory listing

You can override this logic via specifying URL params:

- `?noindex`: For directories with an `index.html` file, this will serve the directory listing instead of a website
- `?json`: This will return a JSON representation of a directory listing

**NOTE - all files are publicly available**

### Serving websites
Any folder that includes an `index.html` file will be served as a website. One potential use-case of this is to provide a branded / themed landing page for a particular directory. A folder that includes an `index.html` file will not show the directory listings, but those listings are still accessible as direct links or via a JavaScript request. For example, to request the directory listing as `JSON` in JavaScript, and then append the result to the DOM:

```js
// Client side JavaScript
fetch('https://<domain>/directory?json')
  .then(res => res.json())
  .then(json => {
    document
      .getElementsByTagName('body')[0]
      .append(JSON.stringify(json))
  })
```

You can serve the website on a custom domain via registering a CNAME record and then configuring URL-rewrites to the desired folder. Currently this has to be done by manually adjusting Nginx configuration - [ask me to make this user-configurable](https://github.com/SAEON/mnemosyne/issues)!!


## Uploading files
Any files/folder in the exposed volume will be served. To upload files to the server either add a directory/file to the exposed volume, or upload via the `HTTP PUT` API endpoint. Here are some examples I've found with cURL - I'n not sure what the differences are:

***Specifying a filename***
```sh
# -T means 'transfer file'

# The response is piped to cat
# because cURL doesn't print POST
# and PUT info by default
curl \
  --progress-bar \
  -X PUT \
  -T ./some/local/cog.tiff \
  https://<domain>/some/deep/nested/directory/cog.tif \
    | cat
```

***Testing streaming from a file - but doesn't seem to work any differently to the above example***
```sh
cat ./some/local/cog.tiff \
  | curl \
    --progress-bar \
    -X PUT \
    --data-binary @- \
    -H "Content-Type: application/octet-stream" \
    https://<domain>/some/deep/nested/directory/cog.tif \
      | cat
```

***Streaming from a file using mbuffer***
```sh
mbuffer \
  -i ./some/local/cog.tiff \
  -r 2M \
  | curl \
    --progress-bar \
    -X PUT \
    --data-binary @- \
    -H "Content-Type: application/octet-stream" \
    https://<domain>/some/deep/nested/directory/cog.tif \
      | cat
```


And then that file can be retrieved at `https://<domain>/some/deep/nested/directory/cog.tif`.


# Future functionality
Please submit ideas/feature-requests on the [GitHub issues feed](https://github.com/SAEON/mnemosyne/issues). Some ideas


- Logging/metrics: It's possible to determine which pixels are being downloaded (and even by which user if authentication is forced). so over time SAEON could say 'these pixels were downloaded N number of times by these users'
- Compression: I've chosen NOT to compress (i.e. 'zip') the downloads for now since I'm not sure how that effects byte-range requests. However this should be possible and it would greatly lighten the load on the network.
- Roles/permissions on a folder-by-folder / file-by-file basis. Currently everything uploaded is public. But potentially it could be useful to provide some access controls

# TODO
 - Uploading API endpoint
 - Some basic client authentication
 - Deployment
