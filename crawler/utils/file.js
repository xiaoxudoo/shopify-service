// call this if you have an array of urls and want to save then as a JSON file
const fs = require("fs");
const fsPromises = require("fs").promises;
const readline = require("readline");

function saveFile(content = [], fName = "default.json") {
  return new Promise((resolve, reject) => {
    fs.writeFile(fName, JSON.stringify(content, null, 2), resolve);
  });
}

function readFile(fName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fName, function(err, content) {
      content = content || []
      resolve(JSON.parse(content));
    });
  });
}

async function appendFile(content, fName) {
  const linelist = await readFile(fName);
  content = linelist.concat(content);
  await saveFile(content, fName);
  //   await fsPromises.appendFile(fName, JSON.stringify(content, null, 2), {});
}

async function fileState(fName) {
  return fsPromises.stat(fName)
}

async function processLine(fName) {
  const fileStream = fs.createReadStream(fName);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  const lines = [];
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    // console.log(`Line from file: ${line}`);
    lines.push(line);
  }
  return lines;
}

module.exports = {
  saveFile,
  readFile,
  fileState,
  appendFile,
  processLine
};
