type ResponseType = {
  ContentType: string;
  ContentLength: number;
  CloseConnection: boolean;
  Content: string;
  StatusLine: string;
  Encoding?: string;
};

export const createResponse = ({
  ContentType,
  ContentLength,
  CloseConnection,
  Content,
  StatusLine,
  Encoding = "",
}: ResponseType): string => {
  let content_type = `Content-Type: ${ContentType}\r\n`;
  let content_length = `Content-Length: ${ContentLength}\r\n`;
  let connection_header = CloseConnection ? "Connection: close\r\n" : "";

  let encoding = Encoding ? `Content-Encoding: ${Encoding}\r\n` : "";

  const headers = `${content_type}${content_length}${encoding}${connection_header}\r\n`;
  return `${StatusLine}${headers}${Content}`;
};
