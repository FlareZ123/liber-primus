"""Original-input shared five-bit partition gate with arbitrary output codebook.

Run with Python 3 and the compiled lp2_bacon_shared_unknown_codebook executable
as the single argument. GCC/MinGW C++17, -O3 -march=native -fopenmp.
No output files in the repository; inputs are temporary ASCII rune-index tapes.
"""
from collections import Counter
from pathlib import Path
import json
import random
import string
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
ABC = "0123456789abcdefghijklmnopqrs"
FULL = (1 << 29) - 1
FILES = ("gibran_prophet_58585.txt", "emerson_essays_2944.txt", "shakespeare_first300k.txt")

def read(name):
    return (ROOT / name).read_text(encoding="utf-8")

def latin(s):
    return "".join(c for c in s.upper() if c in string.ascii_uppercase)

def fnv(seq):
    h = 2166136261
    for c in seq:
        h = ((h ^ ord(c)) * 16777619) & 0xffffffff
    return h

def tape(indices):
    return "".join(ABC[i] for i in indices)

def decode(indices, mask):
    return [sum(((mask >> indices[i+j]) & 1) << (4-j) for j in range(5))
            for i in range(0, len(indices), 5)]

def coincidences(seq, n):
    return sum(x*(x-1)//2 for x in Counter(zip(*(seq[i:] for i in range(n)))).values())

def envelope(docs, n):
    min_d, max_count, min_pairs, max_pairs = 26, 0, n*n, 0
    for doc in docs:
        hist = [0]*26
        for i, ch in enumerate(doc):
            hist[ord(ch)-65] += 1
            if i >= n:
                hist[ord(doc[i-n])-65] -= 1
            if i+1 >= n:
                min_d = min(min_d, sum(x>0 for x in hist))
                max_count = max(max_count, max(hist))
                pairs = sum(x*(x-1) for x in hist)
                min_pairs, max_pairs = min(min_pairs,pairs), max(max_pairs,pairs)
    return min_d, max_count, min_pairs, max_pairs

def plant(train, test):
    rng = random.Random(3301)
    mask = sum(1 << i for i in rng.sample(range(1,29),14))
    book = dict(zip(string.ascii_uppercase,rng.sample(range(32),26)))
    pools = [[i for i in range(29) if ((mask>>i)&1)==b] for b in range(2)]
    inputs = []
    for text in (train,test):
        out = []
        for c in text:
            for b in range(4,-1,-1):
                bit = (book[c] >> b) & 1
                out.append(rng.choice([i for i in pools[bit] if not out or i != out[-1]]))
        inv = {v:k for k,v in book.items()}
        assert "".join(inv[x] for x in decode(out,mask)) == text
        inputs.append(out)
    assert mask == 415888584
    assert list(book.values()) == [29,15,24,28,5,3,21,12,13,7,8,1,23,31,20,27,22,26,9,30,19,17,11,18,16,6]
    return mask, inputs

def run(exe, train, test):
    with tempfile.TemporaryDirectory() as d:
        a,b = Path(d)/"train.txt",Path(d)/"test.txt"
        a.write_text(tape(train)+"\n",encoding="ascii")
        b.write_text(tape(test)+"\n",encoding="ascii")
        raw = subprocess.run([exe,str(a),str(b)],check=True,capture_output=True,text=True).stdout
    lines = raw.splitlines()
    print("\n".join(lines[:9]))
    train_rows = [x.split() for x in lines if x.startswith("train_candidate ")]
    joint_rows = [x.split() for x in lines if x.startswith("candidate ")]
    keys = [int(row[1]) for row in train_rows]
    ranking = sorted(((tuple(coincidences(decode(train,k),n) for n in (2,3,4,5)),k) for k in keys),reverse=True)
    print("training survivors",len(keys),"joint survivors",len(joint_rows),"top repetition-ranked keys",ranking[:5])
    for _,k in ranking[:2]:
        print("key",k,"train/holdout repetition pairs",
              [coincidences(decode(train,k),n) for n in (1,2,3,4,5)],
              [coincidences(decode(test,k),n) for n in (1,2,3,4,5)])
    return lines,train_rows,joint_rows,ranking

def main():
    exe = str(Path(sys.argv[1]).resolve())
    corpus = json.loads(read("resources/liber-primus/lp2-corpus.json"))
    docs = [latin(read("resources/control/"+name)) for name in FILES]
    assert [len(d) for d in docs] == [66521,340374,229448]
    assert envelope(docs,600) == (20,104,19828,28912)
    assert envelope(docs,201) == (17,45,2038,3684)
    train = [x for p in corpus["pages"] if 40<=p["page"]<=53 for x in p["indices"]][8:]
    test = [x for p in corpus["pages"][23:27] for x in p["indices"]][16:]
    assert (len(train),len(test)) == (3000,1005)
    assert (fnv(tape(train)),fnv(tape(test))) == (0x521294b1,0x1cbd53f)
    print("ORIGINAL")
    _,rows,joint,_ = run(exe,train,test)
    assert [int(row[1]) for row in rows] == [209830276,536657522]
    assert [int(row[-1]) for row in rows] == [28,29]
    assert not joint
    mask,(a,b) = plant(docs[0][5000:5600],docs[1][5000:5201])
    print("PLANTED CONTROL")
    _,rows,joint,rank = run(exe,a,b)
    assert len(rows)==1002 and len(joint)==372
    assert rank[0][1]==mask
    assert mask in [int(row[1]) for row in joint]
    print("PASS: exhaustive original gate and actual independent source plant.")

if __name__ == "__main__":
    main()
