# mnemosyne
A very simple HTTP-range supporting file server. Stream your file in, and stream your file out! Named after the goddess of memory in Greek mythology.

## Background
I started looking at using a file server that supports the HTTP GET Range header, thinking that this would be a good way of registering out-db NetCDF files in PostGIS. However this doesn't work - NetCDF files over a network require an OPeNDAP interface, and as such I don't need a means of serving COGs at the moment.

However, it's pretty trivial to write a streaming server in Node.js that respects the `Range` header. If there is a need to make COGs available please let me know, this is only a couple hours work and I'd love an excuse to do it!

## Ideas for functionality
- Two routes based on the HTTP method
  - `GET/{optional filename}`: without a file you can explore the directory
  - `POST/path/to/file body={..file contents}`: Streams your file to disk if it doesn't already exist. Errors if it does
  
- Authentication
  - The GET route is completely public. I.e. for publicly shared files only
  - The POST route is either protected via basic auth, or is accessible via a different port to the GET route (i.e on saeon.int network vs saeon.ac.za)

- Logging/metrics
  - You can determine which pixels are being downloaded (and by which user if authentication is forced). so over time SAEON could say 'these pixels were downloaded N number of times'

## Some reference code
- https://github.com/phoenixinfotech1984/node-content-range
- https://gist.github.com/padenot/1324734
