#!/usr/bin/env python3
"""Source-exact one-way plaintext-F projection check on authentic solved LP2 p56.

Uses two canonical repo resources; does not infer any unknown-page plaintext.
Run: python3 sims/lp2_p56_f_nonconverse_source_sft.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
with (ROOT / 'resources/liber-primus/lp2-corpus.json').open(encoding='utf-8') as f:
    corpus = json.load(f)
with (ROOT / 'resources/external/relikd-solved-gp29-native-v1.json').open(encoding='utf-8') as f:
    solved = json.load(f)
runes = {r: i for i, r in enumerate(corpus['runes'])}
cipher = next(pg['indices'] for pg in corpus['pages'] if pg['page'] == 56)
source = next(s['source_text'] for s in solved['sections']
              if s['name'] == 'p56_an_end')
plain = [runes[x] for x in source if x in runes]
assert len(cipher) == len(plain) == 85
f = [(i, p, c) for i, (p, c) in enumerate(zip(plain, cipher))
     if p == 0 or c == 0]
assert f == [(35,24,0),(47,10,0),(51,23,0),(56,0,0),(74,5,0)], f
assert all(p != 0 or c == 0 for p, c in zip(plain, cipher))
assert sum(p == 0 for p in plain) == 1
assert sum(c == 0 for c in cipher) == 5

unknown_pages = [pg for pg in corpus['pages'] if pg['page'] <= 55]
c = [x for pg in unknown_pages for x in pg['indices']]
assert len(c) == 12956
assert c.count(0) == 458
assert 12956 - c.count(0) == 12498
assert corpus['pages'][0]['indices'][7] == 0
print('p56 confirmed F events (offset, plaintext, ciphertext):', f)
print('P=F => C=F: PASS; C=F => P=F: FALSE (4 of 5 are false positives)')
print('unknown original: 12,956 runes, 458 observed C=F, 12,498 C!=F')
print('No source confirms transfer of this one-sided p56 property to p0–p55.')
