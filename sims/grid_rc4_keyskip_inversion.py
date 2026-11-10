#!/usr/bin/env python3
"""LP2 RC4 grid-column 256-bit key-skip inversion.

Use the manuscript's eight 32-byte columns as direct RC4 keys, then
invert with exact collision-conditioned hidden key consumption. The
optimizer matches eight keys to eight sections globally (8! assignments).
Planted controls encrypt held-out authentic-source GP runes. Read-only.
"""
from __future__ import annotations

import json
import random

from grid_mt_fullseed_sieve import (
    MOD, english_control, grid_columns, ciphertext_groups, optimum_assignment
)
from grid_mt_keyskip_inversion import (
    PREFIX, MAX_SKIP, decode_viterbi, train_unigram
)


def rc4_symbols(key: bytes, drop: int, mapping: str, count: int) -> list[int]:
    """Standard RC4 KSA/PRGA, byte-drop before the declared 29-symbol map."""
    assert len(key) == 32
    state = list(range(256))
    j = 0
    for i in range(256):
        j = (j + state[i] + key[i % len(key)]) % 256
        state[i], state[j] = state[j], state[i]
    i = j = 0
    out: list[int] = []
    emitted = 0
    while len(out) < count:
        i = (i + 1) & 255
        j = (j + state[i]) & 255
        state[i], state[j] = state[j], state[i]
        byte = state[(state[i] + state[j]) & 255]
        emitted += 1
        if emitted <= drop:
            continue
        if mapping == "reject" and byte >= 232:
            continue
        out.append(byte % MOD if mapping != "scale" else (byte * MOD) // 256)
    return out


def screen(groups: list[list[int]], columns: list[bytes], logfreq: list[float]) -> list[dict]:
    short = [x[:PREFIX] for x in groups]
    outcome = []
    for drop in (0,256,3072):
        for mapping in ("mod","scale","reject"):
            keys = [rc4_symbols(col,drop,mapping,PREFIX+MAX_SKIP+2) for col in columns]
            for sign in (-1,1):
                matrix = [
                    [decode_viterbi(section,key,sign,logfreq)["per_rune"] for key in keys]
                    for section in short
                ]
                total, assignment = optimum_assignment(matrix)
                best = [
                    decode_viterbi(short[i],keys[assignment[i]],sign,logfreq)
                    for i in range(8)
                ]
                outcome.append({
                    "drop":drop,"map":mapping,"sign":sign,
                    "per_rune":round(total/8,7),
                    "assignment":assignment,
                    "by_group":[round(x["per_rune"],7) for x in best],
                    "skips":[x["skips"] for x in best],
                    "first_plaintext":best[0]["plaintext"][:60]
                })
    outcome.sort(key=lambda x:-x["per_rune"])
    return outcome


def plant(groups: list[list[int]], cols: list[bytes]) -> tuple[list[list[int]],list[list[int]],int]:
    source = english_control()
    rng = random.Random(0x410fc4dd)
    offset = 0
    out,truth = [],[]
    consumed = 0
    for col, section in enumerate(groups):
        plain = source[offset:offset+PREFIX]
        offset += len(section)
        truth.append(plain)
        key = rc4_symbols(cols[col],256,"reject",PREFIX+MAX_SKIP+3)
        cipher, j = [],0
        for value in plain:
            c = (value+key[j]) % MOD
            retries=0
            while cipher and c==cipher[-1] and retries<2 and rng.random()<0.81:
                retries+=1
                j+=1
                c=(value+key[j])%MOD
                consumed+=1
            cipher.append(c)
            j+=1
        out.append(cipher)
    return out,truth,consumed


def main() -> None:
    sections= ciphertext_groups()
    cols = grid_columns()
    q = train_unigram()
    created,truth,skips = plant(sections,cols)
    actual = screen(sections,cols,q)
    synthetic = screen(created,cols,q)
    true = next(x for x in synthetic if (x["drop"],x["map"],x["sign"])==(256,"reject",-1))
    assert true["assignment"]==list(range(8)),true
    recovered=[]
    for i in range(8):
        key=rc4_symbols(cols[i],256,"reject",PREFIX+MAX_SKIP+2)
        p=decode_viterbi(created[i],key,-1,q)["plaintext"]
        recovered.append(sum(a==b for a,b in zip(p,truth[i])))
    assert sum(recovered)>=int(0.80*8*PREFIX),recovered
    print(json.dumps({
        "model":"RC4 grid columns; direct byte key; collision-keyskip Viterbi",
        "ciphertext_runes":sum(map(len,sections)),
        "prefix_each":PREFIX,
        "settings":18,"assignments_per_setting":40320,
        "real_top":actual[:5],"plant_top":synthetic[:3],
        "plant_true":true,"plant_source_recovered":recovered,
        "plant_source_total":8*PREFIX,"plant_true_key_skips":skips,
    },indent=2))


if __name__ == "__main__":
    main()
