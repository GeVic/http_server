# HTTP Server (TypeScript, Bun)

A minimal HTTP/1.1 server built from scratch using TCP sockets. This project implements a subset of HTTP for learning purposes (inspired by the CodeCrafters HTTP Server challenge).

## Features

- Listens on localhost:4221
- Connection handling: respects `Connection: close`, otherwise keeps the connection open for the request
- Endpoints:
  - GET `/` → 200 OK, empty body
  - GET `/echo/<text>` → echoes `<text>` as `text/plain`
    - Supports gzip compression when `Accept-Encoding: gzip` is present
  - GET `/user-agent` → returns the request's `User-Agent` as `text/plain`
  - GET `/files/<filename>` → serves the exact file from a configured directory as `application/octet-stream` (404 if missing)
  - POST `/files/<filename>` → writes request body to the configured directory and returns `201 Created`

## Requirements

- Bun 1.0+ (recommended; Bun runs TypeScript directly)

## Quickstart

Install dependencies (dev only):
- If you already have `node_modules`, you can skip this step.
- Otherwise, run: `bun install`

Start the server:
- Default:
  - `bun run app/main.ts`
- With a files directory (recommended for /files endpoints):
  - `bun run app/main.ts --directory ./tmp/`
  - Note: The server expects the directory argument value as the token following `--directory`. Ensure the path includes a trailing slash (e.g., `./tmp/`).

The server listens on:
- Host: `localhost`
- Port: `4221`

## API Examples

- Health/root
  - `curl -i http://localhost:4221/`

- Echo (plain)
  - `curl -i http://localhost:4221/echo/hello-world`

- Echo with gzip
  - Request with gzip:
    - `curl -H "Accept-Encoding: gzip" -i http://localhost:4221/echo/compress-me`
  - To view decompressed content:
    - `curl --compressed http://localhost:4221/echo/compress-me`

- User-Agent
  - `curl -i http://localhost:4221/user-agent`

- Files (ensure you started the server with `--directory ./tmp/`)
  - Write a file:
    - `curl -i -X POST --data 'sample content' http://localhost:4221/files/notes.txt`
  - Read an existing file:
    - `curl -i http://localhost:4221/files/notes.txt`
  - Non-existent file:
    - `curl -i http://localhost:4221/files/missing.txt` → 404 Not Found

## Behavior Notes

- Content types:
  - `text/plain` for `/echo` and `/user-agent`
  - `application/octet-stream` for `/files`
- Compression:
  - `/echo/<text>` returns gzip-compressed content when the request includes `Accept-Encoding: gzip`
- File directory:
  - The directory used for `/files` endpoints is taken from the command line (the token after `--directory`).
  - If not provided, the server may fall back to `/tmp/` depending on argument length. Using `--directory` with a trailing slash is recommended (for example: `--directory ./tmp/`).

## Project Structure

- `app/main.ts`: TCP server, HTTP parsing and route handling
- `app/helpers/parseArgs.ts`: extracts the files directory from CLI args
- `app/helpers/parseHeaders.ts`: parses `User-Agent`, `Accept-Encoding`, and `Connection`
- `app/helpers/createResponse.ts`: assembles status line, headers, and body

## Development

- Run the server:
  - `bun run app/main.ts --directory ./tmp/`
- Script shortcut:
  - `bun run dev` (as defined in `package.json`) runs `app/main.ts` without passing a directory; prefer the explicit command above for `/files` routes.

## Limitations

- Minimal HTTP parsing (single-buffer request handling; no streaming/chunked encoding)
- No MIME type detection for files (always `application/octet-stream`)
- No path sanitization for `/files` (avoid untrusted input; do not expose this to the internet)
- Error handling is intentionally simple

## License

This project is for educational purposes.