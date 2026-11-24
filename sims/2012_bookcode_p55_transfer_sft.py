#!/usr/bin/env python3
"""Bounded source-derived tests of the 2012 book-code material against LP2 p55."""
from __future__ import annotations
import argparse, json, pathlib, re, statistics, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import outguess_extract

PHRASE_WORDS = ["CALL","US","AT","US","TELE","PHONE","NUMBER","TWO","ONE","FOUR","THREE","NINE","OH","NINE","SIX","OH","EIGHT"]
P55_BODY_WORD_LENGTHS = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]
PHONE = "2143909608"
TRANSFORMS = {
    "line": lambda l,c:l, "character": lambda l,c:c,
    "sum": lambda l,c:l+c, "difference": lambda l,c:l-c,
    "product": lambda l,c:l*c, "2line+character": lambda l,c:2*l+c,
    "line+2character": lambda l,c:l+2*c, "2line-character": lambda l,c:2*l-c,
    "line-2character": lambda l,c:l-2*c,
}

def tokenize_phrase(rune_index, collapse_th=True):
    out=[]
    for wi,word in enumerate(PHRASE_WORDS):
        i=0
        while i<len(word):
            if collapse_th and word.startswith("TH",i):
                out.append(rune_index["TH"]); i+=2
            else:
                out.append(rune_index[word[i]]); i+=1
        if wi<len(PHRASE_WORDS)-1: out.append(None)
    return out

def render_words(values, lengths, runes):
    out=[]; pos=0
    for n in lengths:
        out.append("".join(runes[v] for v in values[pos:pos+n])); pos+=n
    if pos!=len(values): raise ValueError(f"segmentation consumed {pos} of {len(values)}")
    return out

def direct_phrase_key(cipher, template, runes):
    rows=[]
    for space_value in range(29):
        key=[space_value if x is None else x for x in template]
        for sign,name in [(-1,"C-K"),(1,"C+K")]:
            plain=[(c+sign*k)%29 for c,k in zip(cipher,key)]
            rows.append({"space_value":space_value,"operation":name,
                         "first_word":render_words(plain,P55_BODY_WORD_LENGTHS,runes)[0]})
    return {"tested":len(rows),"first_words_by_operation":{
        name:sorted(set(x["first_word"] for x in rows if x["operation"]==name))
        for name in ("C-K","C+K")}}

def phone_repeating_key(cipher, runes):
    variants={"digits_forward":[int(x) for x in PHONE],
              "digits_reverse":[int(x) for x in PHONE[::-1]]}
    rows=[]
    for label,base in variants.items():
        key=[base[i%len(base)] for i in range(len(cipher))]
        for sign,name in [(-1,"C-K"),(1,"C+K")]:
            plain=[(c+sign*k)%29 for c,k in zip(cipher,key)]
            rows.append({"key":label,"operation":name,
                         "words":render_words(plain,P55_BODY_WORD_LENGTHS,runes)})
    return rows

def coordinate_gate(cipher, phrase_template, coords, coord_slice):
    best={"matches":-1}; tested=0; exact=0
    for space_value in range(29):
        pt=[space_value if x is None else x for x in phrase_template]
        required={"C-P":[(c-p)%29 for c,p in zip(cipher,pt)],
                  "P-C":[(p-c)%29 for c,p in zip(cipher,pt)]}
        for origin in (0,1):
            selected=coords[coord_slice]
            for name,fn in TRANSFORMS.items():
                key=[fn(line-origin,char-origin)%29 for line,char in selected]
                for operation,need in required.items():
                    matches=sum(a==b for a,b in zip(need,key)); tested+=1
                    if matches==len(cipher): exact+=1
                    if matches>best["matches"]:
                        best={"matches":matches,"space_value":space_value,
                              "origin":origin,"transform":name,"operation":operation}
    return {"candidate_comparisons":tested,"best_partial_match":best,"exact_matches":exact}

def run_outguess(source_dir, password):
    controls=[]
    for n in (0,8):
        bitmap,bits=outguess_extract.build_bitmap(source_dir/f"{n:02d}.jpg")
        payload,meta=outguess_extract.extract(bitmap,bits,"Default key")
        if n==0 and not payload.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----"):
            raise AssertionError("LP1 image 00 default-key PGP control failed")
        if n==8 and b"For those who have fallen behind" not in payload:
            raise AssertionError("LP1 image 08 default-key text control failed")
        controls.append({"image":n,"payload_bytes":len(payload),
                         "sha256":meta["payload_sha256"],"prefix_hex":meta["prefix_hex"]})
    results=[]
    for n in range(17,75):
        bitmap,bits=outguess_extract.build_bitmap(source_dir/f"{n:02d}.jpg")
        forced=outguess_extract.header_is_source_forced(bitmap,bits)
        try:
            payload,meta=outguess_extract.extract(bitmap,bits,password)
            results.append({"image":n,"source_forced_header":forced,
                "header_hex":meta["header_hex"],"seed":meta["seed"],"length":meta["length"],
                "payload_bytes":len(payload),"sha256":meta["payload_sha256"],
                "entropy":meta["entropy_bits_per_byte"],"printable_fraction":meta["printable_fraction"],
                "magic":meta["magic"],"openpgp_armor":meta["possible_openpgp_armor"],
                "prefix_hex":meta["prefix_hex"]})
        except Exception as exc:
            results.append({"image":n,"source_forced_header":forced,"error":str(exc)})
    good=[x for x in results if "payload_bytes" in x]; errors=[x for x in results if "error" in x]
    if len(results)!=58 or sum(bool(x.get("source_forced_header")) for x in results)!=58:
        raise AssertionError("LP2 image count or source-forced-header census changed")
    if len(good)!=54 or [x["image"] for x in errors]!=[31,49,73,74]:
        raise AssertionError("OutGuess extraction counts changed")
    if len({(x["header_hex"],x["seed"],x["length"]) for x in good})!=1:
        raise AssertionError("password did not yield one common forced header")
    if any(x["magic"] or x["openpgp_armor"] or x["printable_fraction"]>.97 for x in good):
        raise AssertionError("recognisable payload candidate requires review")
    if len({x["prefix_hex"] for x in good})!=1:
        raise AssertionError("common forced-prefix behavior changed")
    page55=next(x for x in good if x["image"]==72)
    return {"password":password,"controls":controls,"scanned_images":len(results),
        "source_forced_headers":58,"completed_extractions":len(good),
        "errors":[{"image":x["image"],"error":x["error"]} for x in errors],
        "decoded_header":good[0]["header_hex"],"seed":good[0]["seed"],"length":good[0]["length"],
        "entropy_min_mean_max":[min(x["entropy"] for x in good),statistics.mean(x["entropy"] for x in good),max(x["entropy"] for x in good)],
        "printable_min_mean_max":[min(x["printable_fraction"] for x in good),statistics.mean(x["printable_fraction"] for x in good),max(x["printable_fraction"] for x in good)],
        "shared_prefix_hex":good[0]["prefix_hex"],"recognisable_payloads":0,"p55_archive_image_72":page55}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--root",type=pathlib.Path,default=pathlib.Path(__file__).resolve().parents[1])
    ap.add_argument("--source-dir",type=pathlib.Path)
    ap.add_argument("--out",type=pathlib.Path)
    args=ap.parse_args(); root=args.root.resolve()
    source_dir=(args.source_dir or root/"resources/liber-primus").resolve()
    corpus=json.loads((root/"resources/liber-primus/lp2-corpus.json").read_text())
    runes=corpus["runes"]; rune_index={r:i for i,r in enumerate(runes)}
    p55_full=corpus["pages"][55]["indices"]; p55_body=p55_full[1:]
    if len(p55_full)!=76 or len(p55_body)!=75 or sum(P55_BODY_WORD_LENGTHS)!=75:
        raise AssertionError("p55 source register changed")
    payload=(root/"im-results/2012-first-image-1CcV1-outguess.txt").read_text()
    coords=[(int(a),int(b)) for a,b in re.findall(r"(?m)^(\d+):(\d+)$",payload)]
    if len(coords)!=76: raise AssertionError(f"expected 76 source coordinates, got {len(coords)}")
    gp_phrase=tokenize_phrase(rune_index,True); latin_phrase=tokenize_phrase(rune_index,False)
    if len(gp_phrase)!=75 or len(latin_phrase)!=76: raise AssertionError("2012 phrase tokenization changed")
    result={"scope":"bounded 2012 book-code to LP2 p55 transfer tests; no general key search",
        "p55_full_runes":len(p55_full),"p55_body_runes":len(p55_body),
        "phrase_gp29_tokens":len(gp_phrase),"phrase_latin_char_tokens":len(latin_phrase),
        "coordinate_pairs":len(coords),"phrase_as_gp29_key":direct_phrase_key(p55_body,gp_phrase,runes),
        "phone_as_repeating_gp29_key":phone_repeating_key(p55_body,runes),
        "coordinate_key_body75":coordinate_gate(p55_body,gp_phrase,coords,slice(1,None)),
        "coordinate_key_full76":coordinate_gate(p55_full,latin_phrase,coords,slice(None)),
        "outguess_phone_password_all_lp2":run_outguess(source_dir,PHONE)}
    rendered=json.dumps(result,indent=2,sort_keys=True)+"\n"
    if args.out: args.out.write_text(rendered)
    print(rendered)

if __name__=="__main__": main()
