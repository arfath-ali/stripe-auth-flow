declare module 'node:http' {
  interface IncomingMessage {
    body: any;
  }
}
