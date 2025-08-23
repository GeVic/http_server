import * as net from "net";
import * as fs from "fs";
import * as zlib from "zlib";
import { parseArgs } from "./helpers/parseArgs";
import { parseHeaders } from "./helpers/parseHeaders";
import { createResponse } from "./helpers/createResponse";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString();
    const parts = req.split("\r\n");
    const status_line = parts[0];

    // args
    let dir = process.argv && parseArgs(process.argv);

    // parse status line
    const parsed_line = status_line.split(" ");
    const method = parsed_line[0];
    const route = parsed_line[1];

    // headers
    let { user_agent, accept_encoding, shouldClose } = parseHeaders(parts);

    let response = "HTTP/1.1 ";

    switch (true) {
      case method === "GET": {
        switch (true) {
          case route === "/": {
            let connection_header = shouldClose ? "Connection: close\r\n" : "";
            response += `200 OK\r\n${connection_header}\r\n`;
            break;
          }
          case route.startsWith("/echo"): {
            let phrase = route.replace("/echo/", "");
            let phrase_length = phrase.length;
            const stat_line = "200 OK\r\n";

            if (
              accept_encoding.length > 0 &&
              accept_encoding.includes("gzip")
            ) {
              let compressed_string = zlib.gzipSync(
                Buffer.from(phrase, "utf-8"),
              );
              response += createResponse({
                ContentType: "text/plain",
                ContentLength: compressed_string.length,
                CloseConnection: shouldClose,
                Content: "",
                StatusLine: stat_line,
                Encoding: "gzip",
              });
              socket.write(response);
              socket.write(compressed_string);
              if (shouldClose) {
                socket.end();
              }
              return;
            } else {
              response += createResponse({
                ContentType: "text/plain",
                ContentLength: phrase_length,
                CloseConnection: shouldClose,
                Content: phrase,
                StatusLine: stat_line,
              });
              break;
            }
          }
          case route.startsWith("/user-agent"): {
            let phrase = user_agent;
            const stat_line = "200 OK\r\n";
            response += createResponse({
              ContentType: "text/plain",
              ContentLength: phrase.length,
              CloseConnection: shouldClose,
              Content: phrase,
              StatusLine: stat_line,
            });
            break;
          }
          case route.startsWith("/files"): {
            let filename = route.replace("/files/", "");

            // read file
            if (!fs.existsSync(`${dir}${filename}`)) {
              let connection_header = shouldClose
                ? "Connection: close\r\n"
                : "";
              response += `404 Not Found\r\n${connection_header}\r\n`;
              break;
            }
            const content = fs.readFileSync(`${dir}${filename}`, "utf8");

            const stat_line = "200 OK\r\n";
            response += createResponse({
              ContentType: "application/octet-stream",
              ContentLength: content.length,
              CloseConnection: shouldClose,
              Content: content,
              StatusLine: stat_line,
            });
            break;
          }
          default: {
            response += "404 Not Found\r\n\r\n";
            break;
          }
        }
        break;
      }
      case method === "POST": {
        switch (true) {
          case route.startsWith("/files"): {
            let filename = route.replace("/files/", "");
            let content = parts[parts.length - 1];

            fs.writeFileSync(`${dir}${filename}`, content);

            const stat_line = "201 Created\r\n";
            response += createResponse({
              ContentType: "application/octet-stream",
              ContentLength: content.length,
              CloseConnection: shouldClose,
              Content: content,
              StatusLine: stat_line,
            });
            break;
          }
        }
      }
    }
    socket.write(response);
    if (shouldClose) {
      socket.end();
    }
    // socket.end();
  });
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
