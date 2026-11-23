"use strict";

// Reproduce the 2012 opening-image extraction from two pinned community mirrors.
// Run only through .github/workflows/manual-outguess-source-runner.yml, which
// builds the pinned OutGuess 0.4 source before invoking this script.

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { spawnSync, execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const EXPECTED_PAYLOAD = fs.readFileSync(
  path.join(ROOT, "im-results", "2012-first-image-1CcV1-outguess.txt")
);

const SOURCES = {
  scream314: {
    commit: "10733feb487bb8beb9966d534727ee5897aa54fc",
    image:
      "https://raw.githubusercontent.com/scream314/cicada3301/10733feb487bb8beb9966d534727ee5897aa54fc/assets/2012/1CcV1.jpg",
    payload:
      "https://raw.githubusercontent.com/scream314/cicada3301/10733feb487bb8beb9966d534727ee5897aa54fc/assets/2012/1CcV1.jpg.out",
  },
  cijhho123: {
    commit: "d360ad97d39c4719e42dc88b0cbbb81ed54aa02c",
    image:
      "https://raw.githubusercontent.com/cijhho123/cicada3301/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/2012/additional%20media/images/1CcV1.jpg",
    payload:
      "https://raw.githubusercontent.com/cijhho123/cicada3301/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/2012/additional%20docs/outguss/1CcV1.jpg.out",
  },
};

const EXPECTED_IMAGE_BYTES = 29279;
const EXPECTED_IMAGE_SHA256 =
  "870353b8fbe4d1dd83fdbfc61b07d80213bab035526d3e5fd6a43f7d77db1ead";
const EXPECTED_TRAILER =
  'TIBERIVS CLAVDIVS CAESAR says "lxxt>33m2mqkyv2gsq3q=w]O2ntk"\n';
const EXPECTED_NEXT_IMAGE = "http://i.imgur.com/m9sYK.jpg";

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function download(url, destination) {
  execFileSync(
    "curl",
    [
      "--fail",
      "--location",
      "--retry",
      "3",
      "--retry-delay",
      "2",
      "--silent",
      "--show-error",
      "--output",
      destination,
      url,
    ],
    { stdio: "inherit" }
  );
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "lp-2012-first-image-"));
try {
  const mirrorBytes = {};
  const mirrorPayloads = {};

  for (const [name, source] of Object.entries(SOURCES)) {
    const imagePath = path.join(temp, name + "-1CcV1.jpg");
    const payloadPath = path.join(temp, name + "-1CcV1.jpg.out");
    download(source.image, imagePath);
    download(source.payload, payloadPath);
    mirrorBytes[name] = fs.readFileSync(imagePath);
    mirrorPayloads[name] = fs.readFileSync(payloadPath);
  }

  const image = mirrorBytes.scream314;
  assert.equal(image.length, EXPECTED_IMAGE_BYTES);
  assert.equal(sha256(image), EXPECTED_IMAGE_SHA256);
  assert.deepEqual(mirrorBytes.cijhho123, image);
  assert.deepEqual(mirrorPayloads.cijhho123, mirrorPayloads.scream314);
  assert.deepEqual(mirrorPayloads.scream314, EXPECTED_PAYLOAD);
  assert.equal(EXPECTED_PAYLOAD.length, 535);

  // The post-EOI trailer is a separate channel from the OutGuess payload.
  const eoi = image.lastIndexOf(Buffer.from([0xff, 0xd9]));
  assert.notEqual(eoi, -1, "JPEG EOI marker not found");
  const trailer = image.subarray(eoi + 2);
  assert.equal(trailer.length, 61);
  assert.equal(trailer.toString("ascii"), EXPECTED_TRAILER);

  const encoded = 'lxxt>33m2mqkyv2gsq3q=w]O2ntk';
  const decoded = Buffer.from(
    Array.from(Buffer.from(encoded, "ascii"), (byte) => byte - 4)
  ).toString("ascii");
  assert.equal(decoded, EXPECTED_NEXT_IMAGE);

  // Reproduce the historically documented invocation exactly: no password,
  // no extra flags, and the original JPEG as the sole carrier input.
  const imagePath = path.join(temp, "scream314-1CcV1.jpg");
  const extractedPath = path.join(temp, "reproduced-1CcV1.jpg.out");
  fs.writeFileSync(imagePath, image);
  const run = spawnSync("outguess", ["-r", imagePath, extractedPath], {
    encoding: "utf8",
  });
  if (run.status !== 0) {
    throw new Error(
      "OutGuess failed.\nstdout:\n" +
        run.stdout +
        "\nstderr:\n" +
        run.stderr
    );
  }
  const transcript = (run.stdout || "") + "\n" + (run.stderr || "");
  assert.match(transcript, /seed:\s*228,\s*len:\s*535/);
  const extracted = fs.readFileSync(extractedPath);
  assert.deepEqual(extracted, EXPECTED_PAYLOAD);

  const payloadText = extracted.toString("utf8");
  assert.ok(payloadText.startsWith("Here is a book code."));
  assert.ok(payloadText.includes("http://www.reddit.com/r/a2e7j6ic78h0j/"));
  const coordinates = [...payloadText.matchAll(/^(\d+):(\d+)$/gm)];
  assert.equal(coordinates.length, 76);
  assert.equal(coordinates[0][0], "1:20");
  assert.equal(coordinates[75][0], "76:21");

  console.log(
    JSON.stringify(
      {
        result: "PASS",
        sources: Object.fromEntries(
          Object.entries(SOURCES).map(([name, source]) => [
            name,
            { commit: source.commit },
          ])
        ),
        image_bytes: image.length,
        image_sha256: sha256(image),
        mirrors_byte_identical: true,
        trailer_bytes: trailer.length,
        trailer_text: trailer.toString("ascii").trimEnd(),
        ascii_shift: -4,
        decoded_next_image: decoded,
        outguess_invocation: "outguess -r 1CcV1.jpg 1CcV1.jpg.out",
        outguess_seed: 228,
        extracted_payload_bytes: extracted.length,
        extracted_payload_sha256: sha256(extracted),
        book_code_entries: coordinates.length,
        expected_payload_matches_both_mirrors: true,
      },
      null,
      2
    )
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
