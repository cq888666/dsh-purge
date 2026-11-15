import { build } from "esbuild";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const community = process.argv.includes("--community");
const projectRoot = path.resolve(root, "../..");
const pkg = JSON.parse(
  await fs.readFile(
    path.join(community ? projectRoot : root, "package.json"),
    "utf8",
  ),
);
const result = await build({
  absWorkingDir: root,
  entryPoints: ["src/entry.js"],
  bundle: true,
  write: false,
  platform: "browser",
  format: "cjs",
  target: "es2022",
  external: ["react", "react-dom"],
  treeShaking: true,
  legalComments: "inline",
  loader: { ".css": "text" },
  define: {
    __PANEL_VERSION__: JSON.stringify(pkg.version),
    __COMMUNITY__: JSON.stringify(community),
  },
});
const output =
  "// Generated from src/ by npm run build. Do not edit.\n" +
  "// Derived UI: YuJunZhiXue/dsh-purge (MIT), see LICENSE.\n" +
  "window.__ModuleLoader__.load({id:" +
  JSON.stringify(pkg.name) +
  ",factory:(require)=>{\n" +
  "var module={exports:{}};var exports=module.exports;\n" +
  result.outputFiles[0].text +
  "\nreturn module.exports;\n}});\n";
const dest = path.join(community ? projectRoot : root, "client.js");
if (process.argv.includes("--check")) {
  const current = await fs.readFile(dest, "utf8");
  if (current !== output) {
    let at = 0;
    while (
      at < current.length &&
      at < output.length &&
      current[at] === output[at]
    )
      at += 1;
    const line = current.slice(0, at).split("\n").length;
    console.error(
      `client.js differs from generated output at line ${line} (byte ${at})`,
    );
    console.error("checked-in:", JSON.stringify(current.slice(at, at + 200)));
    console.error("generated: ", JSON.stringify(output.slice(at, at + 200)));
    throw new Error(
      "client.js is stale; run npm run build and commit the output.",
    );
  }
  console.log("PASS: checked-in bundle matches source");
} else {
  await fs.writeFile(dest, output);
  console.log(
    `Built ${pkg.name}@${pkg.version}: ${Buffer.byteLength(output)} bytes`,
  );
}
