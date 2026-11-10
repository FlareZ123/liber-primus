#!/usr/bin/env python3
"""Test the source-frozen 58 2014 Onion7 LP2 JPEG bytes against the AN END hash.

Onion7 index lists exactly 0.jpg..57.jpg. In the combined original 75-page
corpus these are resources/liber-primus/17.jpg..74.jpg. No URL guessing, text
normalization, recompression, or inferred hash format is attempted.

Usage: python3 sims/anend_original_jpeg_gate.py [repo_root]
"""
import hashlib
import json
from pathlib import Path
import sys

TARGET = ("36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09"
          "a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4")
ROOT = Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"

assert len(TARGET)==128 and len(bytes.fromhex(TARGET))==64
assert hashlib.sha512(b"abc").hexdigest()=="ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"

algos = {
  "sha512": lambda b: hashlib.sha512(b).hexdigest(),
  "sha3_512": lambda b: hashlib.sha3_512(b).hexdigest(),
  "blake2b_512": lambda b: hashlib.blake2b(b,digest_size=64).hexdigest(),
  "shake256_512": lambda b: hashlib.shake_256(b).hexdigest(64),
}
assert len(set(f(b"abc") for f in algos.values()))==4

rows=[]; matches=[]
for page in range(58):
    f = SOURCE / f"{page+17:02d}.jpg"
    data=f.read_bytes()
    sha1=hashlib.sha1(f"blob {len(data)}\\0".encode().replace(b"\\0",b"\\x00")+data).hexdigest()
    row={"lp2_page":page, "file":str(f.relative_to(ROOT)), "size":len(data),
         "git_blob_sha1":sha1, "sha256":hashlib.sha256(data).hexdigest()}
    rows.append(row)
    for name,func in algos.items():
        if func(data).lower()==TARGET: matches.append({"lp2_page":page,"algorithm":name,"sha256":row["sha256"]})

assert len(rows)==58
assert rows[56]["size"]==389813 and rows[56]["git_blob_sha1"]=="afa3428764199ddf590baf0c055c8caedc079cb1"
assert rows[57]["size"]==318076 and rows[57]["git_blob_sha1"]=="4397143b4df5ad729b00cfd740a74994052f46d2"
print(json.dumps({"files":len(rows),"algorithms":list(algos),"comparisons":len(rows)*len(algos),
                  "matches":matches,"original_source_checks":[rows[56],rows[57]],
                  "scope":"raw JPEG bytes only, fixed original Onion7 page roster"},indent=2))
