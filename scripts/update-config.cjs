
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "appwrite.config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

if (!config.functions) config.functions = [];
const existingIndex = config.functions.findIndex(f => f.name === "compress-pdf");

const funcConfig = {
  "$id": "compress-pdf",
  "name": "compress-pdf",
  "enabled": true,
  "logging": true,
  "runtime": "node-21",
  "buildSpecification": "s-1vcpu-512mb",
  "runtimeSpecification": "s-1vcpu-512mb",
  "deploymentRetention": 3,
  "scopes": [],
  "events": [],
  "schedule": "",
  "timeout": 30,
  "entrypoint": "src/main.js",
  "commands": "npm install",
  "ignore": "node_modules\n.tmp",
  "path": "appwrite/functions/compress-pdf"
};

if (existingIndex >= 0) {
  config.functions[existingIndex] = funcConfig;
} else {
  config.functions.push(funcConfig);
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
console.log("Updated appwrite.config.json");

