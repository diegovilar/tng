const fs = require("fs");

main();

function main() {

    if (process.argv.length < 3) {
        process.exit(1);
    }

    const infile = process.argv[2];
    const outfile = process.argv.length > 3 ? process.argv[3] : infile;

    let contents = fs.readFileSync(infile, "utf8");
    contents = JSON.parse(contents);

    const regex = /^(?:(?:\/?\.{1,2}\/){0,}|\/)src\//g;

    for (let i = 0; i < contents.sources.length; i++) {
        contents.sources[i] = contents.sources[i].replace(regex, "tng/source/");
    }

    fs.writeFileSync(outfile, JSON.stringify(contents), { encoding: "utf8" });

    process.exit(0);

}