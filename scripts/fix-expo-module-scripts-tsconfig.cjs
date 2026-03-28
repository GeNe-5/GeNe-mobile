const fs = require("fs");
const path = require("path");

const targetDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-module-scripts"
);

const source = path.join(targetDir, "tsconfig.base.json");
const alias = path.join(targetDir, "tsconfig.base");
const expoAvTsconfig = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-av",
  "tsconfig.json"
);

try {
  if (!fs.existsSync(targetDir) || !fs.existsSync(source)) {
    process.exit(0);
  }

  if (!fs.existsSync(alias)) {
    fs.copyFileSync(source, alias);
    console.log("[fix] Created expo-module-scripts/tsconfig.base alias");
  }

  if (fs.existsSync(expoAvTsconfig)) {
    const current = fs.readFileSync(expoAvTsconfig, "utf8");
    const patched = current.replace(
      '"extends": "expo-module-scripts/tsconfig.base"',
      '"extends": "expo-module-scripts/tsconfig.base.json"'
    );

    if (patched !== current) {
      fs.writeFileSync(expoAvTsconfig, patched);
      console.log("[fix] Patched expo-av tsconfig extends path");
    }
  }
} catch (error) {
  console.warn("[fix] Could not create tsconfig alias:", error.message);
}
