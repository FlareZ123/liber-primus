"""Check source-selected p57 GIMP crop (24,3) against p50 inner 180.

Read-only original input. Needs NumPy. Run this script from repository root.
"""
import json
from pathlib import Path
import numpy as np

root = Path(__file__).resolve().parent.parent
corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
grid = json.loads((root / "resources/liber-primus/lp2-grid-256.json").read_text(encoding="utf-8"))
source = grid["bytes"]
assert len(source) == 256
alphabet = sorted(enumerate(corpus["translit"]), key=lambda x: -len(x[1]))
sentence = ("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO "
            "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE")
known56 = []
for word in sentence.split():
    while word:
        index, symbol = next((i, s) for i, s in alphabet if word.startswith(s))
        known56.append(index)
        word = word[len(symbol):]
assert len(known56) == 85
printed56 = corpus["pages"][56]["indices"]
clear57 = corpus["pages"][57]["indices"]
assert [len(printed56), len(clear57)] == [85, 95]

# p57 image cell (178,487) maps under measured GIMP translation (-154,-484)
# to source GIMP-local row 3, column 24. Hold the image-derived anchor fixed.
mt = np.random.RandomState(314159265)
seeds = mt.randint(0, 2**32, size=4096, dtype=np.uint32)
assert seeds[:8].tolist() == [
    3721122731, 618219707, 807213306, 3144837749,
    3447982176, 3230631767, 755972506, 1398685501,
]
raw = np.stack([
    np.random.RandomState(int(seeds[y + 3])).randint(
        0, 2**32, size=32, dtype=np.uint32)[24:32]
    for y in range(32)
])
assert raw.shape == (32, 8)
pads = {
    "range255": (raw.astype(np.uint64) % 255).astype(np.uint8).ravel().tolist(),
    "lowbyte": (raw.astype(np.uint64) % 256).astype(np.uint8).ravel().tolist(),
}
inner = [8*r+c for r in range(1,31) for c in range(1,7)]
border = list(range(8))+[8*r+7 for r in range(1,32)]+[248+c for c in range(6,-1,-1)]+[8*r for r in range(30,0,-1)]
assert len(inner)==180 and len(border)==76 and len(set(inner+border))==256
expected = {
    "range255": ((0,0,0),(0,0,1)),
    "lowbyte": ((1,1,2),(1,2,1)),
}

def decode(a, b, op):
    return a^b if op=="xor" else ((a-b)%256 if op=="subtract" else (a+b)%256)

def encode(a, b, op):
    return a^b if op=="xor" else ((a+b)%256 if op=="subtract" else (a-b)%256)

for keyname, pad in pads.items():
    for register_index, (label, known) in enumerate((
        ("solved",known56+clear57),("printed",printed56+clear57))):
        for op_index, operation in enumerate(("xor","subtract","add")):
            recovered = [decode(source[pos],pad[pos],operation) for pos in inner]
            hits = sum(a==b for a,b in zip(recovered,known))
            assert hits == expected[keyname][register_index][op_index]
            print(keyname,label,operation,hits,"/180 original symbols",flush=True)
            planted=[0]*256
            for pos, plain in zip(inner,known):
                planted[pos]=encode(plain,pad[pos],operation)
            for pos, plain in zip(border,clear57[:76]):
                planted[pos]=encode(plain,pad[pos],operation)
            assert [decode(planted[i],pad[i],operation) for i in inner]==known
            assert [decode(planted[i],pad[i],operation) for i in border]==clear57[:76]
print("PASS: all 12 original source-crop pads fail exact 180/180, all source plants invert")
