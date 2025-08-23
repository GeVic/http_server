export const parseHeaders = (parts: string[]) => {
  let user_agent = "";
  let accept_encoding: string[] = [];
  let shouldClose: boolean = false;
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].startsWith("User-Agent")) {
      user_agent = parts[i].split(":")[1].trim();
      continue;
    }
    if (parts[i].startsWith("Accept-Encoding")) {
      accept_encoding = parts[i].split(":")[1].trim().split(", ");
      console.log("accept inco ", accept_encoding);
      continue;
    }
    if (parts[i].startsWith("Connection")) {
      shouldClose = parts[i].split(":")[1].trim() === "close" ? true : false;
      continue;
    }
  }
  return {
    user_agent,
    accept_encoding,
    shouldClose,
  };
};
