"""Run the all-ID arbitrary byte-affine SSSS rank census on the canonical source.
Requires a C++17 GCC/Clang compiler, including unsigned __int128 support.
The optional case index 0..7 isolates one radix/packing/direction case.
"""
from pathlib import Path
import hashlib
import json
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'resources/liber-primus/lp2-grid-256.json').read_text(encoding='utf-8'))
tokens = [t for page in data['pages'] for t in page['tokens']]
assert len(tokens) == 256
alphabet = data['alphabet']
vectors = []
for radix in (59, 60):
    a = alphabet.replace('f', '') if radix == 59 else alphabet
    v = bytes(radix*a.index(t[0])+a.index(t[1]) for t in tokens)
    vectors.append(v)
assert hashlib.sha256(vectors[1]).hexdigest() == '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
stdin = '\n'.join(' '.join(map(str, v)) for v in vectors) + '\n'
cases = [int(sys.argv[1])] if len(sys.argv) > 1 else range(8)
with tempfile.TemporaryDirectory() as temp:
    exe = Path(temp) / 'ssss_byte_affine.exe'
    subprocess.run(['g++', '-std=c++17', '-O3', str(ROOT/'sims/lp2_ssss_byte_affine.cpp'), '-o', str(exe)], check=True)
    for i in cases:
        assert 0 <= i < 8
        output = subprocess.run([str(exe),str(i)], input=stdin, text=True, capture_output=True, check=True).stdout
        print(output, end='', flush=True)
        radix = 59 + i//4
        layout = (i%4)//2
        reverse = i%2
        assert 'positive known IDs rank=63' in output
        assert 'all 256 byte values and 32 untouched eighth-share bytes recovered' in output
        assert f'radix={radix} layout={layout} reverse={reverse} trials=604800 full_rank=604800 fallback=0' in output
