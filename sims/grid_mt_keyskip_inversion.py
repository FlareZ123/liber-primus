#!/usr/bin/env python3
"""Exact bounded LP2 key-rejection Viterbi under grid-column MT19937 pads.

Original section prefixes and separately planted English are decoded using
one or two hidden rerolls per rune only if the rejected key would have
produced the previous ciphertext rune. Unknown 8-column assignment is exact.
Unlike direct pad subtraction, a wrong hidden skip need not shift every later
rune. A first-256-rune section prefix is a fixed computational gate, not full
manuscript proof. Standard Python3, read-only.
"""
from __future__ import annotations

import json
import math
import random
from pathlib import Path
from grid_mt_fullseed_sieve import (
    ROOT, MOD, TEXT_NAMES, ciphertext_groups, grid_columns, pad,
    optimum_assignment, english_control
)

PREFIX = 256
MAX_SKIP = 30
SKIP_COST = 2.6
INF = -1e100


def train_unigram() -> list[float]:
    control = (ROOT / "resources/control/shakespeare_first300k.txt").read_text(encoding="utf-8")
    control = control[:240000].upper().replace("V","U").replace("K","C").replace("Z","S").replace("Q","CW")
    freq = [1.0] * MOD
    at = 0
    while at < len(control):
        for token, val in TEXT_NAMES:
            if control.startswith(token, at):
                freq[val] += 1
                at += len(token)
                break
        else:
            at += 1
    total = sum(freq)
    return [math.log(f / total) for f in freq]


def decode_viterbi(cipher: list[int], key: list[int], sign: int,
                   logfreq: list[float]) -> dict:
    """Solve exact key-consumption drift with <=2 collision-activated retries."""
    n = len(cipher)
    assert n + MAX_SKIP <= len(key)
    prev = [INF] * (MAX_SKIP + 1)
    prev[0] = logfreq[(cipher[0] + sign * key[0]) % MOD]
    actions: list[bytearray] = []
    for i in range(1, n):
        row = bytearray(MAX_SKIP + 1)
        nxt = [INF] * (MAX_SKIP + 1)
        for drift in range(MAX_SKIP + 1):
            kpos = i + drift
            plain = (cipher[i] + sign * key[kpos]) % MOD
            value = prev[drift]
            step = 0
            for consume in (1,2):
                if consume > drift:
                    break
                if cipher[i] == cipher[i-1]:
                    continue
                if not all((plain - sign * key[kpos - offset]) % MOD == cipher[i-1]
                           for offset in range(1, consume+1)):
                    continue
                cand = prev[drift-consume] - SKIP_COST * consume
                if cand > value:
                    value = cand
                    step = consume
            nxt[drift] = value + logfreq[plain]
            row[drift] = step
        prev = nxt
        actions.append(row)
    drift = max(range(MAX_SKIP + 1), key=lambda d:prev[d])
    score = prev[drift]
    plain = [0] * n
    skips = 0
    for i in range(n-1,0,-1):
        plain[i] = (cipher[i] + sign * key[i+drift]) % MOD
        step = actions[i-1][drift]
        drift -= step
        skips += step
    assert drift == 0
    plain[0] = (cipher[0] + sign * key[0]) % MOD
    return {"score":score, "per_rune":score/n, "plaintext":plain, "skips":skips}


def screen(groups: list[list[int]], columns: list[bytes],
           logfreq: list[float]) -> list[dict]:
    short = [section[:PREFIX] for section in groups]
    outcome = []
    for endian in ("big","little"):
        for generator in ("randrange","float","uint32"):
            keys = [pad(col,endian,generator,PREFIX+MAX_SKIP+2) for col in columns]
            for sign in (-1,1):
                matrix = []
                for section in short:
                    matrix.append([decode_viterbi(section,k,sign,logfreq)["per_rune"]
                                   for k in keys])
                total, assignment = optimum_assignment(matrix)
                actual = [decode_viterbi(short[i],keys[assignment[i]],sign,logfreq)
                          for i in range(8)]
                outcome.append({
                    "endian":endian,"generator":generator,"sign":sign,
                    "per_rune":round(total/8,7),
                    "assignment":assignment,
                    "by_group": [round(x["per_rune"],6) for x in actual],
                    "skips": [x["skips"] for x in actual],
                    "first_plaintext":actual[0]["plaintext"][:60]
                })
    outcome.sort(key=lambda row:-row["per_rune"])
    return outcome


def planted_skip(groups: list[list[int]], columns: list[bytes]) -> tuple[list[list[int]],list[list[int]],int]:
    """Encrypt real English controls with the true MT key and actual key rerolls."""
    source = english_control()
    rng = random.Random(0x49171423)
    offset = 0
    out = []
    plaintext = []
    skips = 0
    for i,section in enumerate(groups):
        plain = source[offset:offset+PREFIX]
        plaintext.append(plain)
        offset += len(section)
        key = pad(columns[i],"big","float",PREFIX+MAX_SKIP+3)
        cursor = 0
        cipher = []
        for value in plain:
            proposed = (value + key[cursor]) % MOD
            count = 0
            while cipher and proposed == cipher[-1] and count < 2 and rng.random() < 0.81:
                count += 1
                cursor += 1
                proposed = (value + key[cursor]) % MOD
                skips += 1
            cursor += 1
            cipher.append(proposed)
        out.append(cipher)
    return out,plaintext,skips


def main() -> None:
    sections,cols= ciphertext_groups(),grid_columns()
    lang=train_unigram()
    planted,plain,skips=planted_skip(sections,cols)
    real=screen(sections,cols,lang)
    planted_out=screen(planted,cols,lang)
    true=next(x for x in planted_out if (x["endian"],x["generator"],x["sign"]) == ("big","float",-1))
    assert true["assignment"] == list(range(8)), true
    # Verify the planted stream is exactly invertible by this Viterbi,
    # recognizing that unigram scoring can choose a near-optimal wrong path.
    true_scores=[]
    for i in range(8):
        key=pad(cols[i],"big","float",PREFIX+MAX_SKIP+2)
        rec=decode_viterbi(planted[i],key,-1,lang)
        true_scores.append(sum(a==b for a,b in zip(rec["plaintext"],plain[i]))/PREFIX)
    assert sum(true_scores)/8>0.80, "Key-skip Viterbi could not recover most planted source."
    print(json.dumps({
        "scope":"8 groups x first 256 runes, Python3 MT from eight genuine table columns",
        "settings":12,"column_assignments":40320,"skip_max":MAX_SKIP,
        "per_skip_cost":SKIP_COST,
        "real_top":real[:5],"plant_top":planted_out[:3],
        "planted_true_setting":true,"planted_true_key_score":true["per_rune"],
        "planted_source_recovery":true_scores,"planted_skips":skips,
    },indent=2))


if __name__=="__main__":
    main()
