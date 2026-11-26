"""Create the source-only p16–p22 blind cold-start archives (Director #2996)."""
import argparse
import base64
import hashlib
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

DISCOVERY = (16, 17, 18, 19, 20, 22)
HOLDOUT = 21
START = """# Source-only puzzle session

Investigate the original numbered manuscript pages in pages/ using the earlier
original material in context/. One page is withheld until a prediction is locked.
Do not consult modern solution reports, transcriptions, candidate keys, or prior
attempts. Independent historical references available before May 2014 may be
used if recorded.

Record what you first notice, why it suggests an operation, and failed attempts.
Specify exact input, alphabet, direction, indexing, key derivation, boundary/
clock rules, and output. Before seeing the held-out page, write a falsifiable
prediction: precise coordinates and predicted output, relation or criterion,
including how boundary state is handled. If no independently justified operation
emerges, say so. Do not adjust the prediction after the reveal.
"""
MODERATOR = """# Moderator protocol (not included in discovery archive)

1. Obtain consent from a real human without prior research exposure. Record
   date, prior exposure and tools. Do not disclose hypotheses or use an LLM proxy.
2. Provide only the discovery archive. Record first clue, operations and reasoning
   verbatim. Do not steer.
3. Before revealing p21, preserve a dated copy of the exact operation, target
   coordinates, predicted result/threshold, and boundary state handling.
   Record SHA-256 of the locked prediction. If no prediction, record and stop.
4. Reveal p21 and apply frozen operation. Preserve output and evaluate the
   locked criterion; subsequent tuning is exploratory.
5. Record outcome and dependencies. Withholding the penultimate page keeps
   p22 visible; this is a fixed procedural design choice, not a cipher clue.

No approved human session has yet been performed.
"""

def add(z, name, data):
    item = ZipInfo(name, (1980, 1, 1, 0, 0, 0))
    item.compress_type = ZIP_DEFLATED
    z.writestr(item, data)

def build(repo, output):
    output.mkdir(parents=True, exist_ok=True)
    images = repo / "resources/liber-primus"
    def get(n):
        return (images / f"{n:02}.jpg").read_bytes()
    rows = []
    def put(z, name, data, date, origin):
        add(z, name, data)
        rows.append(f"{name}\t{date}\t{origin}\t{hashlib.sha256(data).hexdigest()}")
    def manifest(z):
        add(z, "SOURCE-MANIFEST.tsv", "file\tperiod\tsource\tsha256\n" + "\n".join(rows) + "\n")
    with ZipFile(output / "LP2-p16-p22-discovery.zip", "w") as z:
        add(z, "START.md", START)
        for p in DISCOVERY:
            put(z, f"pages/p{p:02}.jpg", get(p+17), "May 2014", f"Original LP2 p{p}; combined archive {p+17:02}.jpg")
        for p in range(17):
            put(z, f"context/earlier-manuscript/{p:02}.jpg", get(p), "2014, before LP2", f"Original combined archive {p:02}.jpg")
        chart_path = repo / "resources/historical/cicada2013-gematria-jpeg.b64"
        chart = base64.b64decode(chart_path.read_bytes())
        if not chart.startswith(b"\xff\xd8"):
            raise ValueError("Gematria context is not JPEG")
        put(z, "context/gematria-2013.jpg", chart, "2013", "Original Gematria image decoded from archived base64")
        manifest(z)
    rows.clear()
    with ZipFile(output / "LP2-p21-holdout.zip", "w") as z:
        put(z, "pages/p21.jpg", get(HOLDOUT+17), "May 2014", "Original LP2 p21; combined archive 38.jpg")
        manifest(z)
    (output / "LP2-p16-p22-moderator.md").write_text(MODERATOR, encoding="utf-8")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    build(args.repo, args.output)
