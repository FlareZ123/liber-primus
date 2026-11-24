"""Direct original-glyph enclosure projection, no hidden parameters."""
import json
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import label

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
CORPUS = json.loads((ROOT / "lp2-corpus.json").read_text(encoding="utf-8"))
GEOM = json.loads((ROOT / "lp2-p55-source-glyph-coordinates.json").read_text(encoding="utf-8"))
EXPECTED = [0,0,1,0,1,0,0,1,1,0,0,2,0,0,0,0,0,2,0,2,0,1,1,2,0,0,1,0,0]
# Four GP identities absent in p55, from the unambiguous clear p57 words
# TUNNELNG, TO, DIUINITY (inclusive original pixel bounds).
MISSING = [
    (9, (947,1105,980,1219)),
    (16,(1192,1105,1241,1219)),
    (3, (1246,1105,1280,1219)),
    (26,(1058,1725,1091,1839)),
]

def holes(img, rect, threshold):
    x,y,X,Y = rect
    bg = np.pad(img[y:Y+1,x:X+1] >= threshold, 1, constant_values=True)
    components, n = label(bg)
    counts = np.bincount(components.ravel())
    return sum(j != components[0,0] and counts[j] >= 20 for j in range(1,n+1))

def read_image(name):
    return np.asarray(Image.open(ROOT / name).convert("L"))

def decode(a, h):
    t = [h[x] for x in a]
    v = [9*x+3*y+z for x,y,z in zip(t[::3],t[1::3],t[2::3])]
    return "".join(chr(65+x) if x < 26 else "?" for x in v), Counter(t), t[len(v)*3:]

def main():
    p55, p57 = read_image("72.jpg"), read_image("74.jpg")
    assert [g["gp29_index"] for g in GEOM["glyphs"]] == CORPUS["pages"][55]["indices"]
    for threshold in (64,128,192):
        obs = {}
        for g in GEOM["glyphs"]:
            k = g["gp29_index"]
            n = holes(p55,g["rect"],threshold)
            assert obs.setdefault(k,n) == n
        for k,rect in MISSING:
            assert k not in obs
            obs[k] = holes(p57,rect,threshold)
        assert [obs[k] for k in range(29)] == EXPECTED
        print("threshold",threshold,"class counts",Counter(obs.values()))
    targets = [
        (8,12,243,"AAMCJBATAUBVWJJFDDBBNBJAKADMJDAAASSBBYAODSAMGAIDDGAJANBAJBCABTPJAJACKGBVUJYDNAGAJ"),
        (55,1,75,"GLGCJCBPASECGCJAAAAMEASYS"),
        (56,0,85,"HFJJDMACYDTSAAJGAAMBSPECDJOA"),
        (57,0,95,"BGABAAJADDBADSBGDJDGDAAHGABKAGT"),
    ]
    for page,start,size,expected in targets:
        a = CORPUS["pages"][page]["indices"][start:]
        assert len(a) == size
        out, counts, tail = decode(a,EXPECTED)
        assert out == expected
        print(f"p{page} start {start} len {size}: {out}; trits {counts}; tail {tail}")
    a = CORPUS["pages"][55]["indices"]
    assert Counter(EXPECTED[x] for x in a) == {0:50,1:12,2:14}
    bits = "".join(str(int(EXPECTED[x]>0)) for x in a)
    packed = bytes(int(bits[i:i+8],2) for i in range(0,len(bits)-7,8))
    assert packed.hex() == "aa8c2708ca30003313"
    print("p55 full binary",packed.hex(),"remaining bits",bits[72:])
    print("PASS: exact original glyph classification and fixed projection; no plaintext claim")

if __name__ == "__main__":
    main()
