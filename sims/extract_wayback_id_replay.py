#!/usr/bin/env python3
"""Verify the exact ArchiveBot capture via Wayback id_ when the raw WARC is restricted."""
import argparse, base64, hashlib, json, shutil, subprocess, sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ORIGINAL="http://1711141131131.xyz/"
CAPTURE="20170629043935"
URL=f"https://web.archive.org/web/{CAPTURE}id_/{ORIGINAL}"
EXPECTED_LEN=4521
EXPECTED_SHA1="GPMGLFNUMSJSUJVXPZSRAZPQJBVLRDPV"
MEMENTO="Thu, 29 Jun 2017 04:39:35 GMT"
P56="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output-dir",required=True)
    ap.add_argument("--raw-warc-status",default="HTTP 403/401")
    a=ap.parse_args()
    out=Path(a.output_dir);out.mkdir(parents=True,exist_ok=True)
    req=Request(URL,headers={"User-Agent":"Liber-Primus-archival-research/1.0","Accept":"text/html,*/*;q=0.8"})
    try:
        with urlopen(req,timeout=90) as r:
            body=r.read();status=r.status;final=r.geturl();headers=dict(r.headers.items())
    except HTTPError as e:
        body=e.read();status=e.code;final=e.geturl();headers=dict(e.headers.items())
    except (URLError,TimeoutError,OSError) as e:
        print(f"Wayback retrieval failed: {e}",file=sys.stderr);return 2
    (out/"root.html").write_bytes(body)
    sha1=base64.b32encode(hashlib.sha1(body).digest()).decode().rstrip("=")
    sha256=hashlib.sha256(body).hexdigest()
    digests={"sha512":hashlib.sha512(body).hexdigest(),
             "sha3_512":hashlib.sha3_512(body).hexdigest(),
             "blake2b_512":hashlib.blake2b(body,digest_size=64).hexdigest(),
             "shake256_64":hashlib.shake_256(body).hexdigest(64)}
    wp=None;wp_kat=None
    openssl=shutil.which("openssl")
    if openssl:
        def wh(x):
            z=subprocess.run([openssl,"dgst","-provider","legacy","-whirlpool"],input=x,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout.decode().strip()
            return z.rsplit("= ",1)[-1].strip().lower()
        wp_kat=wh(b"abc")=="4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5"
        wp=wh(body)
    digests["whirlpool"]=wp
    memento=next((v for k,v in headers.items() if k.lower()=="memento-datetime"),None)
    markers=[{"marker":m.decode(),"offset":body.find(m)} for m in
             [b"-----BEGIN PGP SIGNED MESSAGE-----",b"-----BEGIN PGP MESSAGE-----",b"-----BEGIN PGP SIGNATURE-----",b"-----BEGIN PGP PUBLIC KEY BLOCK-----"] if body.find(m)>=0]
    failures=[]
    if status!=200:failures.append(f"HTTP {status}")
    if len(body)!=EXPECTED_LEN:failures.append(f"length {len(body)} != {EXPECTED_LEN}")
    if sha1!=EXPECTED_SHA1:failures.append(f"SHA1 {sha1} != {EXPECTED_SHA1}")
    if f"/web/{CAPTURE}id_/" not in final:failures.append("final URL lost exact capture timestamp")
    if memento and memento!=MEMENTO:failures.append(f"Memento-Datetime {memento!r} != {MEMENTO!r}")
    matches={k:v==P56 for k,v in digests.items() if v is not None}
    meta={"retrieval_mode":"Wayback id_ replay; NOT raw WARC extraction","raw_warc_download_status":a.raw_warc_status,
          "original_url":ORIGINAL,"capture_timestamp_utc":"2017-06-29T04:39:35Z","requested_url":URL,
          "final_url":final,"http_status":status,"response_headers":headers,"memento_datetime":memento,
          "archive_original_headers":{k:v for k,v in headers.items() if k.lower().startswith("x-archive-orig-")},
          "entity_length":len(body),"cdx_expected_length":EXPECTED_LEN,"sha1_base32":sha1,
          "cdx_expected_sha1_base32":EXPECTED_SHA1,"sha256":sha256,"p56_target":P56,
          "p56_direct_digests":digests,"p56_direct_digest_matches":matches,
          "whirlpool_abc_known_answer_passed":wp_kat,"pgp_armour_markers":markers,
          "body_contains_p56_target_hex":P56.encode() in body.lower(),
          "cdx_entity_verified":not failures,"verification_failures":failures}
    (out/"headers.json").write_text(json.dumps(headers,indent=2,sort_keys=True)+"\n")
    (out/"metadata.json").write_text(json.dumps(meta,indent=2,sort_keys=True)+"\n")
    (out/"README.md").write_text("# 2017 ArchiveBot root response — Wayback id_ fallback\n\n"+
      "**Replay-derived, not a raw WARC extraction.** The Archive.org WARC download returned HTTP 403/401.\n\n"+
      f"- Original URL: {ORIGINAL}\n- Capture: 2017-06-29T04:39:35Z\n- Final URL: {final}\n"+
      f"- HTTP status: {status}\n- Entity bytes: {len(body)}\n- CDX SHA-1 base32: {sha1}\n"+
      f"- SHA-256: {sha256}\n- Memento-Datetime: {memento}\n- PGP markers: {markers}\n"+
      f"- p56 digest matches: {matches}\n- Exact entity verification: {not failures}\n\n"+
      "Accept as the same entity only when length and CDX SHA-1 match.\n")
    print(json.dumps(meta,indent=2,sort_keys=True))
    if failures:
        print("Verification failed: "+"; ".join(failures),file=sys.stderr);return 1
    return 0
if __name__=="__main__":raise SystemExit(main())
