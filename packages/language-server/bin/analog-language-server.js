#!/usr/bin/env node
console.log("in server bin")
if (process.argv.includes("--version")) {
	const pkgJSON = require("../package.json");
	console.log(`${pkgJSON["version"]}`);
}
else {
	require("../out/index.js");
}
