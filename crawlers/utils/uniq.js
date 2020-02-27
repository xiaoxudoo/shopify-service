const { saveFile, readFile } = require("./file");
const _ = require("lodash");
(async () => {
  const linelist = await readFile("../result.txt");
  await saveFile(_.uniq(linelist), "uniq.txt");
})();
