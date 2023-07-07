# mnemosyne

A very simple HTTP-range supporting file server. Stream your file in, and stream your file out! Named after the goddess of memory and file systems.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Background](#background)
- [Usage](#usage)
  - [Viewing/retrieving files](#viewingretrieving-files)
    - [Customize GET requests via URL params](#customize-get-requests-via-url-params)
    - [Customize GET requests via HTTP headers](#customize-get-requests-via-http-headers)
    - [Serving websites](#serving-websites)
  - [Upload/update mode](#uploadupdate-mode)
    - [cURL examples (uploads)](#curl-examples-uploads)
      - [Upload file as binary](#upload-file-as-binary)
      - [Specify a file to upload](#specify-a-file-to-upload)
      - [Chunked uploads](#chunked-uploads)
        - [Stream from a file](#stream-from-a-file)
        - [Stream from a file using mbuffer](#stream-from-a-file-using-mbuffer)
      - [Uploading a directory recursively](#uploading-a-directory-recursively)
    - [PowerShell example (Windows)](#powershell-example-windows)
- [Updating files](#updating-files)
- [Deleting files](#deleting-files)
- [Development](#development)
  - [Deployment](#deployment)
    - [Docker](#docker)
  - [Publishing](#publishing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Background

A new format for cloud-optimized, multidimensional data (Zarr), and the potential need for SAEON to host (or at least test hosting) cloud-optimized-geotiffs (COGs) makes this quick project worthwhile.

# Usage

Mnemosyne is a relatively simple file server - `GET` HTTP requests for viewing files, and `PUT` HTTP requests for uploading files. Start the application with the `--key` argument (and at least one `--login` and `--permission`) to enable uploads. Otherwise uploads are disabled by default, the idea being that it's straightforward to share any directory on a server via HTTP Range requests.

Turn your current directory into a COG-sharing HTTP Range server with a single command!

```sh
npx @saeon/mnemosyne -v ./
```

Things to note:

- Folders that contain `index.html` files wil be served as websites.
- CORS is enabled (`*`), so the file server can be perused automatically via client-side JavaScript
- Default GET retrieval options can be overridden via URL params (see below)
- When mounting multiple directories, you cannot have duplicate top-level folders, but you can have duplicate top level files
- Running Mnemosyne without specifying a volume results in the application creating a temporary volume on your file system. Mnemosyne will NOT try to create volumes that are mounted but don't exist on the file system

## Viewing/retrieving files

Tools that understand cloud-optimized formats (i.e. COGs, Zarrs, etc.) should work flawlessly when pointed to files hosted on this server. Otherwise, some examples of explicit HTTP requests:

**_Download entire file via cURL_**

```
curl \
  -X GET \
  --keepalive-time 1200 \
  http://localhost:3000/filename.tif
```

**_Download partial file via cURL_**

```
curl \
  -H "Range bytes=12-20" \
  -X GET \
  http://localhost:3000/filename.tif
```

### Customize GET requests via URL params

By default a GET request will serve (in order of preference):

- A file if specified
- An `index.html` file (served as a website) if present
- The directory listing

You can override this logic via specifying URL params:

- `?noindex`: For directories with an `index.html` file, this will serve the directory listing instead of a website
- `?json`: This will return a JSON representation of a directory listing (useful in browser environments, but rather use the `Accept: Application/json` header for API calls)

In the case where there are duplicate filenames (only possible at the root), use the param `?v=N` to specify which mounted volume you are referring to (where N is an integer starting at 0).

**NOTE - all files are publicly available**

### Customize GET requests via HTTP headers
You can request a JSON representation of a directory listing by specifying `Accept: Application/json` in the HTTP headers

### Serving websites

Any folder that includes an `index.html` file will be served as a website. One potential use-case of this is to provide a branded / themed landing page for a particular directory. A folder that includes an `index.html` file will not show the directory listings, but those listings are still accessible as direct links or via a JavaScript request. For example, to request the directory listing as `JSON` in JavaScript, and then append the result to the DOM:

```js
// Client side JavaScript
fetch('http://localhost:3000/directory?json')
  .then(res => res.json())
  .then(json => {
    document.getElementsByTagName('body')[0].append(JSON.stringify(json))
  })
```

You can serve the website on a custom domain via registering a CNAME record and then configuring URL-rewrites to the desired folder. Currently this has to be done by manually adjusting Nginx configuration - [ask me to make this user-configurable](https://github.com/SAEON/mnemosyne/issues)!!

## Upload/update mode
Start the application with a `--key`, a `--login`, and a `--permission` to enable uploading, updating and deleting files. For example:

```sh
npx @saeon/mnemosyne \
  --volume /some/directory \
  --login username \
  --permission username:/some/directory
```

All files/folder in the exposed volume (`/some/directory` in this case) will be served, and the login `username` will have permission to write/edit `some/directory`. **_Permissions need to be granted explicitly_**.

 To upload files to the server either add a directory/file to the exposed volume, or upload via the `HTTP PUT` API endpoint. Directories will be created to match the specified resource URL if they do not exist already.

### cURL examples (uploads)

Here are some examples using `cURL` (and some notes) using the default authentication token on localhost. (Look at server logs for authentication tokens):

- For `PUT` requests I find it's necessary to pipe the output to `cat`, since `cURL` won't print output to stdout (who knows why) when using `POST` and `PUT` requests
- The `-T` header means 'transfer file'. Use this instead of `--data-binary`, since the latter will try to load your entire file into memory before sending
- The `--keepalive-time` header is necessary when you are uploading large files. By default `cURL` will only use 60 seconds as the default time to keep a connection open, which is not long enough to upload large files
- In some cases it may be helpful to use the `--limit-rate` flag. For example, if you have an incredibly fast internet connection and uploads are failing, try limiting the upload speed to 3MB/sec (`--limit-rate 3m`)
- [Here is a helpful list of cURL flags](https://gist.github.com/zachsa/085b3cdfb3534c6da7d0b9967da9647e)

#### Upload file as binary

This loads the entire file into memory first, so should probably be avoided unless the file is small. I think this is faster than other options (for small files).

```sh
cat ./some/local/cog.tiff \
  | curl \
    --progress-bar \
    --keepalive-time 1200 \
    -X PUT \
    -H "Authorization: Bearer f7efafd138da71cdcb0aa4767da9b6ee:1cc83802e7a4a831b17efa9ffecf4822" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @- \
    http://localhost:3000/some/deep/nested/directory/cog.tif \
      | cat
```

#### Specify a file to upload

Better than the previous example because the file is streamed (`-T`)

```sh
curl \
  --progress-bar \
  --keepalive-time 1200 \
  -X PUT \
  -H "Authorization: Bearer f7efafd138da71cdcb0aa4767da9b6ee:1cc83802e7a4a831b17efa9ffecf4822" \
  -T \
  ./some/local/cog.tiff \
  http://localhost:3000/some/deep/nested/directory/cog.tif \
    | cat
```

And then that file can be retrieved at `http://localhost:3000/some/deep/nested/directory/cog.tif`.

#### Chunked uploads

This is useful for uploading large files via cURL as contents are never fully buffered in memory.

##### Stream from a file

```sh
cat ./some/local/cog.tiff \
  | curl \
    --progress-bar \
    --keepalive-time 1200 \
    -X PUT \
    -H "Authorization: Bearer f7efafd138da71cdcb0aa4767da9b6ee:1cc83802e7a4a831b17efa9ffecf4822" \
    -H "Content-Type: application/octet-stream" \
    -T \
    - \
    http://localhost:3000/some/deep/nested/directory/cog.tif \
      | cat
```

##### Stream from a file using mbuffer

This is definitely quite nifty as you get buffer information

```sh
mbuffer \
  -i ./some/local/cog.tiff \
  -r 2M \
  | curl \
    --progress-bar \
    --keepalive-time 1200 \
    -X PUT \
    -H "Content-Type: application/octet-stream" \
    -H "Authorization: Bearer f7efafd138da71cdcb0aa4767da9b6ee:1cc83802e7a4a831b17efa9ffecf4822" \
    --data-binary @- \
    http://localhost:3000/some/deep/nested/directory/cog.tif \
      | cat
```

#### Uploading a directory recursively

For example, a Zarr directory

```sh
find \
  /path/to/directory.zarr \
  -type f \
  -exec \
    curl \
    --progress-bar \
    --keepalive-time 1200 \
    -X PUT \
    -H "Authorization: Bearer f7efafd138da71cdcb0aa4767da9b6ee:1cc83802e7a4a831b17efa9ffecf4822" \
    --create-dirs \
    -T {} \
    http://localhost:3000/some/nested/directory/{} \; \
      | cat
```

### PowerShell example (Windows)

The equivalent to the `cURL` utility on Windows Platform is the `Invoke-RestMethod` tool. This is an example on how to use it to upload a single file to Mnemosyne from the PowerShell terminal

```powershell
cd /to/the/directory/with/your/file
$FILENAME = "some-file.tiff"
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Authorization", "Bearer f7efafd138da71cdcb0aa4767da9b6ee:1cc83802e7a4a831b17efa9ffecf4822")

Invoke-RestMethod `
    -Uri "http://localhost:3000/some/nested/directory/$FILENAME" `
    -Method Put `
    -InFile "./$FILENAME" `
    -Headers $headers `
    -ContentType "application/octet-stream" `
    -Verbose
```

# Updating files
Use the HTTP `POST` method instead of the HTTP `PUT` method in the examples above. Note that this is actually an **_upsert_** operation, where the target resource is either created if it doesn't exist, or updated if it does (assuming correct permissions).

# Deleting files
Use the HTTP DELETE method to delete an existing file. For example (using `cURL`):

```sh
curl \
  --silent \
  -X DELETE \
  -H "Authorization: Bearer f7efafd138da71cdcb0aa4767da9b6ee:1cc83802e7a4a831b17efa9ffecf4822" \
  http://localhost:3000/some/deep/nested/directory/cog.tif
```

# Development

Install Node.js v20.3. Then setup the project:

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

# In a separate terminal, start the testing server
chomp test --watch
```

Refer to [chompfile.toml](/chompfile.toml) to see the start command used for local development

## Deployment

Use a process manager such as `pm2` to restart on failure. See below for Dockerized deployment

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
      --volume /other/path/to/directory
      --login some-user
      --login some-user2
      --login some-user@gmail.com

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
  --name mnemosyne \
  -p 3000:3000 \
  -v /some/host/directory:/mounted-directory \
  mnemosyne \
    --volume /mounted-directory

# Mount a host volume, uploads enabled
docker run \
  --rm \
  -p 3000:3000 \
  --name mnemosyne \
  -v /some/host/directory:/mnt1 \
  -v /some/other/host/directory:/mnt2 \
  mnemosyne \
    --key yoursupersecretkey \
    --volume /mnt1 \
    --volume /mnt2 \
    --login user1 \
    --login user2
```

## Publishing

Publish as a public package to NPM

```sh
npm publish --access public
```
