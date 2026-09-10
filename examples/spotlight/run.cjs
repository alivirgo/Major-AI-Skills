const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const { pathToFileURL } = require("node:url");

const outputRoot = path.join(__dirname, "output");
fs.mkdirSync(outputRoot, { recursive: true });
const output = fs.mkdtempSync(path.join(outputRoot, "run-"));
const hash = file => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const run = (binary, args) => execFileSync(binary, args, {
  encoding: "utf8", windowsHide: true, timeout: 60000, stdio: ["ignore", "pipe", "pipe"],
});

async function ffmpegReference() {
  const ffmpeg = require("ffmpeg-static");
  const ffprobe = require("ffprobe-static").path;
  const reports = [];
  for (const audio of [true, false]) {
    const label = audio ? "with-audio" : "video-only";
    const input = path.join(output, `${label}-input.mkv`);
    const destination = path.join(output, `${label}.mp4`);
    const source = ["-hide_banner", "-loglevel", "error", "-n", "-f", "lavfi", "-i", "testsrc2=size=320x180:rate=24"];
    if (audio) source.push("-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000");
    source.push("-t", "1", "-c:v", "ffv1");
    if (audio) source.push("-c:a", "pcm_s16le");
    run(ffmpeg, [...source, input]);
    const before = hash(input);
    const args = ["-hide_banner", "-loglevel", "error", "-n", "-i", input,
      "-map", "0:v:0", "-map", "0:a?", "-c:v", "libx264", "-preset", "fast", "-crf", "23",
      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", destination];
    run(ffmpeg, args);
    const probe = JSON.parse(run(ffprobe, ["-v", "error", "-show_streams", "-show_format", "-of", "json", destination]));
    const video = probe.streams.find(stream => stream.codec_type === "video");
    assert.equal(video.codec_name, "h264");
    assert.equal(video.pix_fmt, "yuv420p");
    assert.equal(video.width, 320);
    assert.equal(video.height, 180);
    assert(Math.abs(Number(probe.format.duration) - 1) < 0.15);
    const audioStreams = probe.streams.filter(stream => stream.codec_type === "audio");
    assert.equal(audioStreams.length, audio ? 1 : 0);
    if (audio) assert.equal(audioStreams[0].codec_name, "aac");
    assert.equal(hash(input), before);
    // Walk top-level MP4 boxes rather than matching incidental bytes in compressed media.
    const bytes = fs.readFileSync(destination);
    const boxes = [];
    for (let offset = 0; offset < bytes.length;) {
      const size = bytes.readUInt32BE(offset);
      assert(size >= 8 && offset + size <= bytes.length, "Invalid MP4 box size");
      boxes.push(bytes.toString("ascii", offset + 4, offset + 8));
      offset += size;
    }
    assert(boxes.includes("moov") && boxes.includes("mdat"));
    assert(boxes.indexOf("moov") < boxes.indexOf("mdat"));
    reports.push({ case: label, args, probe, inputUnchanged: true, faststart: true });
  }
  fs.writeFileSync(path.join(output, "ffmpeg.json"), JSON.stringify(reports, null, 2));
  return { version: run(ffmpeg, ["-version"]).split(/\r?\n/)[0], cases: reports.map(report => report.case) };
}

async function duckdbReference() {
  const { DuckDBInstance, version } = require("@duckdb/node-api");
  const instance = await DuckDBInstance.create(":memory:");
  const connection = await instance.connect();
  const input = path.join(__dirname, "fixtures/orders.csv");
  const before = hash(input);
  const query = `SELECT customer_id, CAST(SUM(CAST(amount AS DECIMAL(12,2))) AS VARCHAR) AS revenue
FROM read_csv($1, header = true, all_varchar = true)
WHERE status = 'paid' AND amount IS NOT NULL
GROUP BY customer_id ORDER BY customer_id`;
  try {
    const reader = await connection.runAndReadAll(query, [input]);
    const rows = reader.getRowObjectsJson();
    assert.deepEqual(rows, [{ customer_id: "A", revenue: "30.00" }, { customer_id: "B", revenue: "12.50" }]);
    const quality = await connection.runAndReadAll("SELECT CAST(count(*) AS INTEGER) AS missing FROM read_csv($1, header=true, all_varchar=true) WHERE status='paid' AND amount IS NULL", [input]);
    assert.equal(quality.getRowObjectsJson()[0].missing, 1);
    await assert.rejects(connection.runAndReadAll("SELECT CAST('invalid-amount' AS DECIMAL(12,2))"), /convert|conversion/i);
    assert.equal(hash(input), before);
    // The fixture has fixed safe column values; DuckDB performs the real CSV serialization.
    await connection.run("CREATE TABLE revenue(customer_id VARCHAR, revenue DECIMAL(12,2))");
    for (const row of rows) await connection.run("INSERT INTO revenue VALUES ($1, $2)", [row.customer_id, row.revenue]);
    const destination = path.join(output, "revenue.csv").replace(/'/g, "''");
    await connection.run(`COPY (SELECT * FROM revenue ORDER BY customer_id) TO '${destination}' (HEADER, DELIMITER ',')`);
    const roundtrip = await connection.runAndReadAll("SELECT * FROM read_csv($1, all_varchar=true)", [path.join(output, "revenue.csv")]);
    assert.deepEqual(roundtrip.getRowObjectsJson(), rows);
    fs.writeFileSync(path.join(output, "revenue.sql"), query + ";\n");
    return { version: version(), rows, missingPaidAmounts: 1, invalidAmountRejected: true, inputUnchanged: true };
  } finally {
    connection.closeSync();
    instance.closeSync();
  }
}

async function playwrightReference() {
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  const viewports = [{ width: 1280, height: 800 }, { width: 390, height: 844 }];
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      await context.tracing.start({ screenshots: true, snapshots: true });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const errors = [];
      const remoteRequests = [];
      page.on("pageerror", error => errors.push(error.message));
      await context.route(/^https?:/, route => {
        remoteRequests.push(route.request().url());
        return route.abort();
      });
      try {
        await page.goto(pathToFileURL(path.join(__dirname, "fixtures/checkout.html")).href);
        assert.equal(await page.locator("#count").textContent(), "0 items");
        assert.equal(await page.getByRole("heading", { name: "Your cart" }).isVisible(), false);
        await page.getByRole("button", { name: "Add to cart" }).click();
        await page.getByRole("link", { name: "Cart", exact: true }).click();
        await page.getByRole("heading", { name: "Your cart" }).waitFor();
        assert.equal(await page.locator("#count").textContent(), "1 item");
        await page.getByLabel("Email").fill("qa@example.test");
        await page.getByRole("button", { name: "Confirm demo order" }).click();
        await page.getByRole("heading", { name: "Order confirmed" }).waitFor();
        assert.equal(await page.locator("#receipt").textContent(), "Receipt for qa@example.test");
        assert.deepEqual(errors, []);
        assert.deepEqual(remoteRequests, []);
        await page.screenshot({ path: path.join(output, `checkout-${viewport.width}.png`), fullPage: true });
      } finally {
        await context.tracing.stop({ path: path.join(output, `checkout-${viewport.width}-trace.zip`) });
        await context.close();
      }
    }
    return { browser: browser.version(), viewports, externalRequests: 0 };
  } finally {
    await browser.close();
  }
}

async function main() {
  const report = { checkedAt: new Date().toISOString(), node: process.version, platform: process.platform, results: [] };
  for (const [id, task] of Object.entries({ ffmpeg: ffmpegReference, duckdb: duckdbReference, playwright: playwrightReference })) {
    try {
      report.results.push({ id, status: "passed", details: await task() });
      console.log(`PASS ${id}`);
    } catch (error) {
      report.results.push({ id, status: "failed", error: error.message });
      console.error(`FAIL ${id}: ${error.message}`);
      process.exitCode = 1;
    }
  }
  fs.writeFileSync(path.join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(`Artifacts: ${output}`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
