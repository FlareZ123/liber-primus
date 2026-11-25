"""LP2 #2685: finite source-table consistency check. Python 3; Linux optional."""
from pathlib import Path
import ctypes
import json
import platform

ROOT = Path(__file__).resolve().parents[1]
GRID = ROOT / "resources/liber-primus/lp2-grid-256.json"

def check(data):
    assert all(0 <= x <= 255 for x in data)
    counts = [0, 0, 0]
    failures = []
    for i in range(31, len(data)):
        delta = (data[i] - data[i-31] - data[i-3]) % 256
        if delta in (0, 1):
            counts[delta] += 1
        else:
            counts[2] += 1
            failures.append(i)
    return counts, failures

def main():
    # Independent 2007 published native output vector, first 34 outputs.
    historical = [1804289383,846930886,1681692777,1714636915,1957747793,
        424238335,719885386,1649760492,596516649,1189641421,1025202362,
        1350490027,783368690,1102520059,2044897763,1967513926,1365180540,
        1540383426,304089172,1303455736,35005211,521595368,294702567,
        1726956429,336465782,861021530,278722862,233665123,2145174067,
        468703135,1101513929,1801979802,1315634022,635723058]
    assert check([x & 255 for x in historical])[0][2] == 0
    if platform.libc_ver()[0] == "glibc":
        libc = ctypes.CDLL("libc.so.6")
        libc.random.restype = ctypes.c_long
        libc.srandom.argtypes = [ctypes.c_uint]
        expected = [(1,[163,62,0]),(3301,[166,59,0]),
                    (305419896,[180,45,0]),(4294967295,[175,50,0])]
        for seed, target in expected:
            libc.srandom(seed)
            control = [libc.random() & 255 for _ in range(256)]
            actual, failures = check(control)
            assert actual == target and not failures
            print("native control", seed, actual)
        print("native libc", platform.libc_ver())
    else:
        print("Native glibc unavailable: historical vector only")
    grid = json.loads(GRID.read_text(encoding="utf-8"))
    tokens = [t for page in grid["pages"] for t in page["tokens"]]
    assert len(tokens) == 256 and all(len(t) == 2 for t in tokens)
    for radix, expected, first in [(59,[2,1,222],(131,200,148)),
                                    (60,[1,3,221],(133,203,150))]:
        alphabet = grid["alphabet"].replace("f","") if radix == 59 else grid["alphabet"]
        assert len(alphabet) == radix
        data = [radix*alphabet.index(t[0])+alphabet.index(t[1]) for t in tokens]
        if radix == 60:
            assert data == grid["bytes"]
        counts, failures = check(data)
        assert counts == expected and failures[0] == 31
        assert (data[31], data[0], data[28]) == first
        print("radix",radix,"counts [0,1,violation]",counts,
              "first violation", failures[0], "actual/inputs", first)
        print("violations by output page", [sum(a <= i < b for i in failures)
              for a,b in [(0,80),(80,184),(184,256)]])
        print("violation indices", failures)
    print("PASS: both fixed source-table observation models impossible")

if __name__ == "__main__":
    main()
