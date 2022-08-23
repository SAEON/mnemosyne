# mnemosyne

A very simple HTTP-range supporting file server. Stream your file in, and stream your file out! Named after the goddess of memory in Greek mythology.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Background](#background)
- [Development](#development)
  - [Deployment](#deployment)
    - [Docker](#docker)
- [Usage](#usage)
  - [Viewing/retrieving files](#viewingretrieving-files)
    - [Customize GET requests via URL params](#customize-get-requests-via-url-params)
    - [Serving websites](#serving-websites)
  - [Uploading files](#uploading-files)
- [Future functionality](#future-functionality)

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

# The server will print access tokens that can be used for uploads
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
      --user some-user
      --user some-user2
      --user some-user@gmail.com
      # Or --users=user1,user2,user3,etc

# Look at the startup logs, and pass access tokens to the relevant users
```

### Docker

**_Build a Docker image locally_**

```sh
docker build -t mnemosyne .
```

**_Run a containerized instance of the server_**

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
  -e USERS=user1,user2 \
  mnemosyne
```

# Usage

- Serve directory listings / files via `HTTP GET` requests
  - Folders that contain `index.html` files wil be served as websites.
  - CORS is enabled (`*`), so the file server can be perused automatically via client-side JavaScript
- Upload files via `HTTP PUT` requests

## Viewing/retrieving files

Tools that understand cloud-optimized formats (i.e. COGs, Zarrs, etc.) should work flawlessly when pointed to files hosted on this server. Otherwise, some examples of explicit HTTP requests:

**_Download entire file via cURL_**

```
curl \
  -X GET \
  --keepalive-time 1200 \
  https://<domain>/filename.tif
```

**_Download partial file via cURL_**

```
curl \
  -H "Range bytes=12-20" \
  -X GET \
  https://<domain>/filename.tif
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
    document.getElementsByTagName('body')[0].append(JSON.stringify(json))
  })
```

You can serve the website on a custom domain via registering a CNAME record and then configuring URL-rewrites to the desired folder. Currently this has to be done by manually adjusting Nginx configuration - [ask me to make this user-configurable](https://github.com/SAEON/mnemosyne/issues)!!

## Uploading files

Any files/folder in the exposed volume will be served. To upload files to the server either add a directory/file to the exposed volume, or upload via the `HTTP PUT` API endpoint. Here are some examples using `cURL` (and some notes):

- For `PUT` requests I find it's necessary to pipe the output to `cat`, since `cURL` won't print output to stdout (who knows why) when using `POST` and `PUT` requests
- The `-T` header means 'transfer file'. Use this instead of `--data-binary`, since the latter will try to load your entire file into memory before sending
- The `--keepalive-time` header is necessary when you are uploading large files. By default `cURL` will only use 60 seconds as the default time to keep a connection open, which is not long enough to upload large files
- In some cases it may be helpful to use the `--limit-rate` flag. For example, if you have an incredibly fast internet connection and uploads are failing, try limiting the upload speed to 3MB/sec (`--limit-rate 3m`)
- [Here is a helpful list of cURL flags](https://gist.github.com/zachsa/085b3cdfb3534c6da7d0b9967da9647e)

**_Specifying a filename_**

```sh
curl \
  --progress-bar \
  --keepalive-time 1200 \
  -X PUT \
  -H "Authorization: Bearer <token>" \
  -T ./some/local/cog.tiff \
  https://<domain>/some/deep/nested/directory/cog.tif \
    | cat
```

**_Streaming from a file - not sure if this is different to the above example_**

```sh
cat ./some/local/cog.tiff \
  | curl \
    --progress-bar \
    --keepalive-time 1200 \
    -X PUT \
    -H "Authorization: Bearer <token>" \
    --data-binary @- \
    -H "Content-Type: application/octet-stream" \
    https://<domain>/some/deep/nested/directory/cog.tif \
      | cat
```

**_Streaming from a file using mbuffer_**

```sh
mbuffer \
  -i ./some/local/cog.tiff \
  -r 2M \
  | curl \
    --progress-bar \
    --keepalive-time 1200 \
    -X PUT \
    -H "Authorization: Bearer <token>" \
    --data-binary @- \
    -H "Content-Type: application/octet-stream" \
    https://<domain>/some/deep/nested/directory/cog.tif \
      | cat
```

And then that file can be retrieved at `https://<domain>/some/deep/nested/directory/cog.tif`.

**_Uploading a Zarr directory_**
```sh
find \
  /path/to/directory.zarr \
  -type f \
  -exec \
    curl \
    --progress-bar \
    -X PUT \
    -H "Authorization: Bearer <token>" \
    --create-dirs \
    -T {} \
    https://<domain>/some/root/directory/{} \; |
      cat
```

# Future functionality

Please submit ideas/feature-requests on the [GitHub issues feed](https://github.com/SAEON/mnemosyne/issues). Some ideas

- Logging/metrics: It's possible to determine which pixels are being downloaded (and even by which user if authentication is forced). so over time SAEON could say 'these pixels were downloaded N number of times by these users'
- Compression: I've chosen NOT to compress (i.e. 'zip') the downloads for now since I'm not sure how that effects byte-range requests. However this should be possible and it would greatly lighten the load on the network.
- Roles/permissions on a folder-by-folder / file-by-file basis. Currently everything uploaded is public. But potentially it could be useful to provide some access controls
- CRUD management from a UI - should be possible for a user to delete things they have uploaded (?? or should it).
- Perhaps certain folders should be immutable, and some folders should not be
- A better UI?
- Metadata?
- A drag/drop website creator for static sites?
- URL rewriting - specifically being able to define this at runtime and via a UI rather than in source code
