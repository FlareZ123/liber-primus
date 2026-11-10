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

# Verified archival Git blob IDs for original Onion7 0.jpg..57.jpg at
# micheloosterhof/cicada-2014 commit 06f57643821f1cadf597471c2b9c813bd08d2e37.
# Git author timestamps are untrusted as exact historical capture times.
ARCHIVE_GIT_BLOBS = [
  "abab573f7a3786f46fe4fab17d5f2dcf2476136b",
  "7b7905574bcc712a9ea8b7ca60c690a1f99314c5",
  "2936b21db3e1fc3ead8915185d58cab351dcb566",
  "3a7badc18e859868ef28d5b8b81bfde38e0ebbde",
  "9cc256b5356a9382713214324dbce89ba02b01b0",
  "d80bf744990eb4263c2137fb3ba13dbe775c0fa5",
  "f442a9333c78e39bef3f53487ca24dac0c7942de",
  "2b4e09dbad1a9c602a2919864b1a84f49d7ff501",
  "504f0e193c393f67e16643cbe9b6288190b5a4e4",
  "87a98edc542fec46bf087efd1446f6bbfa342bf2",
  "1c9fd75320b61e4bed7eb70d8c14d2fad4b87923",
  "df68046a383a4a216841552fdcd3979f25612a0f",
  "594ca9b258b15ac1d32497b869d3fa4ef6805ddf",
  "932313ad53dbc18b435b4c43f0e3c827547948c9",
  "2368c574b645782e8ab8f1a5d0f58d0955cb3025",
  "f380a4771461ad74eddf5b4e3e366c28ebc827c5",
  "a537b6c5f05cd40e4153a00e4397a053b631d325",
  "4d63ba27eb7f91594a665bfd8055d38707df644e",
  "9c28762bc2763d6eb1dcdb02ba988877821df0ca",
  "06005119670c1cc371c60934636ec58d5d4cc114",
  "a042e662cd74554d3f82049aecbe3f6085b4e399",
  "fe6a6f4fec9ae67f49699cfbf6a2824261c9100f",
  "0270e099f35a00dc24a9dc673ce13d4a0a843802",
  "feee4eed2a4f6d66456ff5a977f43c7ef297f8eb",
  "937f224786852ddfdc40704599ce5850e49049cb",
  "f2ead3e5e12ffefbe19b0474eeb0a1a21815ac60",
  "a0be92ee2b6ccda6d2bd6bc39b37d6b061edf8bd",
  "b2fc14497a1def3bb20b0c4ab88d50ebd3a036ff",
  "42a66257fb798d1a41fb23cddcd08a7f3678e233",
  "80306794137aa5406bb4c1918d469b1a2a23fc02",
  "cf4fea86915b8e98bbdac0098878223e89a0595a",
  "dc31a9e3057e9fef10e1a202b663b84f4f1c3a0e",
  "1a8fa8978bad0efc088e5ae247ceba69b2f29c27",
  "68d3e28d8c4161fdfe91a542f5bac8e276bc441e",
  "e6249fa4cf3a1163d2ef3b38dbed59a886a4d94c",
  "aec165a24c007299422e52e3480c70dbca63b9dc",
  "f8ddd9776975cd5d34de96eb8cb35e2de48c6a56",
  "ff7e60c2a574512200bea0f49d76808ecfb3e21f",
  "10ab76d6c31ea348bbc0f906adf6caac61398dc2",
  "819261c833837cbaa2bd200d210ca299d79031f3",
  "83f661b6107587c5d153d6dea3f6bf03090a70bc",
  "cef4a7baf17e31676ec219db99808287a63b6f33",
  "781940e751b879a4fe1a62bdcf4ac518e1e5c6a9",
  "165003151e37729d2b4fde70c92a432ad9c70d00",
  "6aaa4e0d3b89d652ef4eec43af4382d871e9e087",
  "5a29229e871ca21e28a2500b448c5df04b6d5545",
  "b02c15229caaecec339a5614f07396850e3b068c",
  "9cc071ca1f93dd29750deccc11f3a7cc056c94db",
  "a2db4b4363f4a991dc7a2f17855d7b238df9d09e",
  "c5243ea1324cf3b72b79a41366f8d0e434ce3978",
  "f5abe00085811319f5183c2468ea1171d9dbfb82",
  "701e47789abf4401d61420ff938c2b72aa03ad2c",
  "2bb9807409b2536feb788ec0cdf7a0fefb8ea5e6",
  "55791b97f20e57e9f0ffb4f28596712d5db2ed68",
  "5658a7f992c06ac7191f275cf32be2ce35b59754",
  "ee00cd34013fe3a5c6808650abb6d3206b6f1b13",
  "afa3428764199ddf590baf0c055c8caedc079cb1",
  "4397143b4df5ad729b00cfd740a74994052f46d2"
]

rows=[]; matches=[]
for page in range(58):
    f = SOURCE / f"{page+17:02d}.jpg"
    data=f.read_bytes()
    sha1=hashlib.sha1(b'blob '+str(len(data)).encode('ascii')+bytes([0])+data).hexdigest()
    assert sha1==ARCHIVE_GIT_BLOBS[page], f"original image differs from 2014 archived bytes: {page}"
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
