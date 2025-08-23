export const parseArgs = (arg: string[]): string => {
  const args = arg.slice(2);
  if (args.length !== 0) {
    return args[1].length >= 3 ? args[1] : "/tmp/";
  }
  return "";
};
