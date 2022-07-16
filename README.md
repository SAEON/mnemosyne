# mnemosyne
A very simple HTTP-range supporting file server. Stream your file in, and stream your file out! Named after the goddess of memory in Greek mythology.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Background](#background)
- [Development](#development)
  - [Deployment](#deployment)
- [Ideas for functionality](#ideas-for-functionality)
- [Some reference code](#some-reference-code)

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
      --auth-key <super-long-secret>
      --volume /path/to/directory
```



# Ideas for functionality
- Two routes based on the HTTP method
  - `GET/{optional filename}`: without a file you can explore the directory. with a filename/path (i.e. `GET /some/path/to/file.tif`) - that is the COG for downloading/exploring
  - `POST/path/to/file body={..file contents}`: Streams your file to disk if it doesn't already exist. Errors if it does
  
- Authentication
  - The GET route is completely public. I.e. for publicly shared files only
  - The POST route is either protected via basic auth, or is accessible via a different port to the GET route (i.e on saeon.int network vs saeon.ac.za)

- Logging/metrics
  - You can determine which pixels are being downloaded (and by which user if authentication is forced). so over time SAEON could say 'these pixels were downloaded N number of times'

# Some reference code
- https://github.com/phoenixinfotech1984/node-content-range
- https://gist.github.com/padenot/1324734
