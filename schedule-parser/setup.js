// Downloads the MPXJ with-dependencies JAR from Maven Central
const https = require("https");
const fs = require("fs");
const path = require("path");

const MPXJ_VERSION = "13.4.0";
const JAR_URL = `https://repo1.maven.org/maven2/net/sf/mpxj/mpxj/${MPXJ_VERSION}/mpxj-${MPXJ_VERSION}-with-dependencies.jar`;
const JAR_PATH = path.join(__dirname, "lib", "mpxj.jar");

if (fs.existsSync(JAR_PATH)) {
  console.log("✓ mpxj.jar already present");
  process.exit(0);
}

console.log(`Downloading MPXJ ${MPXJ_VERSION}...`);
const file = fs.createWriteStream(JAR_PATH);

function download(url, dest) {
  https.get(url, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      download(res.headers.location, dest);
      return;
    }
    const total = parseInt(res.headers["content-length"] || "0", 10);
    let received = 0;
    res.on("data", (chunk) => {
      received += chunk.length;
      if (total) process.stdout.write(`\r  ${Math.round(received / total * 100)}%`);
    });
    res.pipe(file);
    file.on("finish", () => {
      file.close();
      console.log("\n✓ mpxj.jar downloaded");
    });
  }).on("error", (err) => {
    fs.unlink(dest, () => {});
    console.error("Download failed:", err.message);
    process.exit(1);
  });
}

download(JAR_URL, JAR_PATH);
