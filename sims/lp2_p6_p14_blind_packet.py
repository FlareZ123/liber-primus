"""Director #2995: source-only p6–p14 cold-start packet, Python standard library."""
import argparse
import base64
import hashlib
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZipFile, ZipInfo, ZIP_STORED, ZIP_DEFLATED

HASHES = dict(line.split() for line in """
0 184e6f9de8695d99435c2bef4fd7e304a8a0f704dbe04439fa8bf13c4da395a7
1 71f4bd03c692ede630091272597d2b18702184ed32fdd1977ef0ba7306632b46
2 0297572bbc2d234f84df634c6f0474011ff5df66c2ce987c3bb7aa0c635799b4
3 b8b142f9b7854ec4f240e076cad03a98a2e3e9cf7c20f1da4fcde1ed25e3be3f
4 745c6a46f67de1e5a2a9ac76175c323af82c2432e3b7483a8dc6244f8de9478f
5 2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7
6 913e26462e51942f49ca3ce2e94ef56c5fb65110814442dccc02b0d88af2c5ca
7 b50c1536ea1f30847e7875835991d52951bafb599fb1ab04eb78c5c6e6c2b468
8 f0edba1084df9983353c11544bbf711f94ed7649edbf94b426c9b78549b64557
9 975cda73bbf829b2775f25beb609d34fa429728b2f2a4ce863c129b10b005089
10 12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376
11 7bd11a2c9f5b512e33c9db170756e3b34cc1e29eb405373eb94957383a61be7d
12 a5b58076e169f3f59c8a394dbef37da18226c9c4fff703df3be8dc95cf16291c
13 bef0fc4867c2363c835eb4f08029a1eba35c925e2f72659d7353cf8a91089e56
14 de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e
15 f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9
16 984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe
23 4c7dce370242c67a7b785828d75547c042717b221d9d565d7dd097834c7b25d7
24 91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c
25 6b1026dfdfb447a5a76819883fe576254e8a47fdf1e97ecf1825166833bc6f00
26 b8b7ee73d51de45833b36d864cb1c9067432cb4efadcf6c319eaef94d52c929d
27 1716e282c1d5e8a9ff911c01621e9b195d4728c7fa55ac857176a473eaba3239
28 26f0cb307a23dcb2adf03a70fb9c6da89746258a90fd9be5383b2757ab4aad30
29 6961f3f8eedba5b802fee9b40ad91fa604cd4e4394f9ba72853141ad71b19b21
30 3481daeed3ab2bea6effbe36eec22f74955bce87ca4b4ae8674be1d3f84ea08d
31 861037ea304b4d3b347cce18d97f25146f6f318cb748e59e6140d9eeaef6abd4
""".strip().splitlines())
CHART_BLOB = "625717bab1bff316c204b197c1cd901eb3cd7cb6"
START = """# Independent puzzle session

The original pages are sequential. Open pages/ in numeric order. You have
earlier original manuscript images and the historical rune chart in context/.
One final page has been held back to allow a prediction to be tested.

Spend up to 45 minutes; you may stop sooner. Record the first observation that
seems meaningful and why it suggests an exact operation. Ordinary offline image
viewers, calculators, editors, and your own code are allowed. Do not search
modern puzzle discussions, repository reports, transcriptions or solutions,
use generative AI, or contact any service. If additional period material
seems necessary, record what it is and why, then ask the coordinator.

Complete RESPONSE.txt as you work. Preserve failed ideas and changes of mind.
A useful outcome is an independently chosen operation and a concrete prediction
for p14, specified before seeing it. The prediction may concern exact rune
output or a falsifiable structural relation, with its coordinates and fixed
acceptance criterion. Record the alphabet, operand origin, all parameters,
indexing, and how state carries into the withheld page. Do not revise the
locked prediction after reveal. It is fine to find no actionable clue.
"""
RESPONSE = """Participant code:
Consent to record pseudonymized observations:
Prior puzzle exposure (including accidental hints):
Start UTC:
First observation UTC:
Image filename and exact position:
What I noticed:
What it suggests and why:
Exact operation and input sources:
Alphabet, parameters, ordering, boundaries and state:
Attempted result or reason not attempted:
Alternative explanation:
Further observations (append without replacing previous entries):

LOCKED PREDICTION (before seeing p14):
Operation and input/operand:
Target coordinates:
Predicted output or relation:
Objective pass/fail criterion:
Required state at p14 boundary:
Code and filenames needed to reproduce:
Lock UTC:

AFTER REVEAL (do not modify previous fields):
Actual output:
Pass/fail under frozen criterion:
Missing input or stopping point:
End UTC:
Tools and deviations:
"""
MODERATOR = """# Coordinator-only protocol

Do not give this file, the holdout archive, repository links, issue details,
research reports, or candidate keys to the participant during discovery.
Recruit only a consenting real human who has not seen the repository's
analyses. Maintainer approval is required before contacting anyone.
Do not use an LLM or current repository contributor as a substitute.

1. Give only the discovery ZIP. Record exposure, date, tools and start time.
2. Preserve the chronological first observations, without steering.
3. Before p14 is revealed, save the locked RESPONSE.txt and all required
   scripts unchanged; record their SHA-256 digests and UTC. If there is no
   independently justified prediction, stop without revealing the holdout.
4. Give holdout ZIP. Apply the frozen operation; record actual output and
   the fixed pass/fail criterion. Treat every later change as exploratory.
5. Preserve the unmodified transcript and source manifests with consent.

The p14 holdout is a procedural choice (last page of this fixed interval),
not a claim about cipher structure. No human trial has been conducted.
"""
def sha(data):
    return hashlib.sha256(data).hexdigest()

def add(z, name, data, compress=ZIP_STORED):
    item = ZipInfo(name, (1980,1,1,0,0,0))
    item.compress_type = compress
    z.writestr(item, data)

def build(repo, out):
    out.mkdir(parents=True,exist_ok=True)
    def image(n):
        data = (repo/"resources/liber-primus"/f"{n:02}.jpg").read_bytes()
        assert sha(data)==HASHES[str(n)], f"image mismatch {n}"
        return data
    raw=(repo/"resources/historical/cicada2013-gematria-jpeg.b64").read_bytes()
    assert hashlib.sha1(f"blob {len(raw)}\0".encode()+raw).hexdigest()==CHART_BLOB
    chart=base64.b64decode(b"".join(raw.split()),validate=True)
    assert chart.startswith(b"\xff\xd8")
    def make(file, items, discovery):
        rows=["file\tdate\tartifact\tsha256"]
        with ZipFile(file,"w") as z:
            if discovery:
                add(z,"START.md",START.encode(),ZIP_DEFLATED)
                add(z,"RESPONSE.txt",RESPONSE.encode(),ZIP_DEFLATED)
            for name,data,date,source in items:
                add(z,name,data)
                rows.append(f"{name}\t{date}\t{source}\t{sha(data)}")
            add(z,"SOURCE-MANIFEST.tsv",("\n".join(rows)+"\n").encode(),ZIP_DEFLATED)
        with ZipFile(file) as z:
            expected={v[0] for v in items}|{"SOURCE-MANIFEST.tsv"}
            if discovery: expected|={"START.md","RESPONSE.txt"}
            assert set(z.namelist())==expected and z.testzip() is None
            assert all(z.read(v[0])==v[1] for v in items)
        print(file.name,file.stat().st_size,sha(file.read_bytes()))
    discovery=[(f"pages/p{p:02}.jpg",image(p+17),"May 2014",f"LP2 p{p}; combined archive {p+17:02}.jpg") for p in range(6,14)]
    discovery += [(f"context/earlier-manuscript/{n:02}.jpg",image(n),"2014 before LP2",f"Combined original archive {n:02}.jpg") for n in range(17)]
    discovery += [("context/gematria-2013.jpg",chart,"2013","Original first-party Gematria image")]
    make(out/"discovery.zip",discovery,True)
    make(out/"holdout.zip",[("pages/p14.jpg",image(31),"May 2014","LP2 p14; combined archive 31.jpg")],False)
    (out/"moderator.md").write_text(MODERATOR,encoding="utf-8")
    print("PASS: exact allowlist, source bytes, holdout separation; human trial not performed")

if __name__=="__main__":
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--repo",type=Path,default=Path(__file__).resolve().parents[1])
    p.add_argument("--output",type=Path)
    a=p.parse_args()
    if a.output:
        build(a.repo,a.output)
    else:
        with TemporaryDirectory() as d:
            build(a.repo,Path(d))
