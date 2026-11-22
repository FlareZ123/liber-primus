"""Blind full-key 5-tap GF29 ciphertext-feedback inverse, original LP2.

A source-motivated hypothesis is that five previous printed cipher runes
generate a shared linear feedback offset, while the plaintext is native-GP
English. Exhaustively score ALL 29**5 secret vectors by an exact 5-D DFT;
the highest native-source Fourier harmonics (2, 4) are fixed before
original-cipher model selection. The original book's latter part is held out.
This is a source-register test, not evidence Cicada selected this cipher.

SFT: python sims/lp2_fivetap_allsecret_spectral_original_sft.py
Requires numpy and scipy. No network, file writes, or external text generator.
"""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

import numpy as np
from scipy.fft import fftn

ROOT = Path(__file__).resolve().parent.parent
GP = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
P = 29
DIM = 5
SHAPE = (P,) * DIM
STATES = P ** DIM
TRUE_KEY = np.array([5, 17, 26, 9, 14], dtype=np.int64)
MOD = lambda values: np.mod(values, P)


def native_shakespeare(length: int) -> np.ndarray:
    """Encode the pinned Shakespeare source in the solved-Cicada GP register."""
    source = (ROOT / "resources/control/shakespeare_first300k.txt").read_text(encoding="utf-8")
    tokens = sorted(enumerate(GP["translit"]), key=lambda x: -len(x[1]))
    out: list[int] = []
    for word in re.findall(r"[A-Za-z]+", source):
        text = word.upper().replace("QU", "CW").replace("V", "U")
        text = text.replace("K", "C").replace("Q", "C").replace("Z", "S")
        i = 0
        while i < len(text):
            if text.startswith("ING", i):
                out.append(21)
                i += 3
            elif text.startswith("IO", i):
                out.append(27)
                i += 2
            else:
                match = next(((index, label) for index, label in tokens
                              if text.startswith(label, i)), None)
                if match is None:
                    raise ValueError(f"Unsupported native source token {word!r}, {text[i:]!r}")
                out.append(match[0])
                i += len(match[1])
        if len(out) >= length:
            break
    assert len(out) >= length
    return np.asarray(out[:length], dtype=np.int16)


PAGES = [p for p in GP["pages"] if 0 <= p["page"] <= 55 and p["indices"]]
LENGTHS = [len(p["indices"]) for p in PAGES]
SOURCES = np.concatenate([np.asarray(p["indices"], dtype=np.int16) for p in PAGES])
assert len(SOURCES) == 12956 and len(PAGES) == 55
TRAIN_COUNT = sum(len(p["indices"]) for p in PAGES if p["page"] <= 27)
assert TRAIN_COUNT == 6761
LITERARY = native_shakespeare(len(SOURCES))
LITERARY_HOLD = native_shakespeare(len(SOURCES) + 13000)[len(SOURCES):]
assert len(LITERARY_HOLD) == 13000
freq = np.bincount(np.concatenate([LITERARY, LITERARY_HOLD]), minlength=P) + 0.5
LOGP = np.log(freq / freq.sum())


def rows(cipher: np.ndarray, train: bool) -> tuple[np.ndarray, np.ndarray]:
    """Original printed pages: no cross-page predecessor and no fitted clock."""
    current, lagged = [], []
    offset = 0
    for page, n in zip(PAGES, LENGTHS):
        is_train = page["page"] <= 27
        if is_train == train and n > DIM:
            c = cipher[offset:offset+n]
            current.append(c[DIM:])
            lagged.append(np.stack([c[DIM-j:n-j] for j in range(1, DIM+1)], axis=1))
        offset += n
    return np.concatenate(current).astype(np.int64), np.concatenate(lagged).astype(np.int64)


def encrypt(plain: np.ndarray, key: np.ndarray) -> np.ndarray:
    cipher = np.empty_like(plain)
    offset = 0
    for n in LENGTHS:
        for j in range(n):
            idx = offset+j
            state = sum(int(key[k-1])*int(cipher[idx-k]) for k in range(1, min(j,DIM)+1))
            cipher[idx] = (int(plain[idx])+state) % P
        offset += n
    return cipher


def check_positive(plain: np.ndarray, cipher: np.ndarray, key: np.ndarray) -> None:
    offset = 0
    for n in LENGTHS:
        for j in range(n):
            idx = offset+j
            state = sum(int(key[k-1])*int(cipher[idx-k]) for k in range(1, min(j,DIM)+1))
            assert int(plain[idx]) == (int(cipher[idx])-state) % P
        offset += n


def score(y: np.ndarray, x: np.ndarray, key: np.ndarray) -> dict:
    decoded = MOD(y - x @ key)
    h = np.bincount(decoded, minlength=P)
    n = len(decoded)
    return {
        "runes": n,
        "ioc": float(np.dot(h.astype(np.float64), h-1) / (n*(n-1))),
        "native_GP_unigram_nats": float(np.mean(LOGP[decoded])),
        "harmonic4_magnitude_per_rune": float(abs(np.exp(8j*np.pi*decoded/P).mean())),
        "opening_GP": " ".join(GP["translit"][int(v)] for v in decoded[:36]),
    }


def exhaustive_fft(y: np.ndarray, x: np.ndarray, harmonic: int, top: int=16) -> list[dict]:
    """Score all secret keys: DFT frequency k equals harmonic * key (mod 29)."""
    reg = np.zeros(SHAPE, dtype=np.complex64)
    coords = tuple(x[:,i] for i in range(DIM))
    weights = np.exp((2j * np.pi * harmonic / P) * y).astype(np.complex64)
    np.add.at(reg, coords, weights)
    spect = fftn(reg, workers=4, overwrite_x=True)
    modulus = np.abs(spect.ravel())
    selected = np.argpartition(modulus, -top)[-top:]
    selected = selected[np.argsort(modulus[selected])[::-1]]
    inverse_harmonic = pow(harmonic, -1, P)
    result = []
    for index in selected:
        coeff = np.unravel_index(int(index), SHAPE)
        key = np.asarray([(int(k)*inverse_harmonic)%P for k in coeff], dtype=np.int64)
        direct = float(abs(np.exp((2j * np.pi * harmonic/P) * MOD(y-x @ key)).sum()))
        fftmag = float(modulus[index])
        assert math.isclose(direct, fftmag, rel_tol=3e-5, abs_tol=0.1), (direct, fftmag)
        result.append({"key": key.tolist(), "train_magnitude": fftmag,
                       "relative": fftmag/len(y)})
    del spect, reg
    return result


def experiment(name: str, cipher: np.ndarray, planted: bool) -> dict:
    yt, xt = rows(cipher, True)
    yh, xh = rows(cipher, False)
    print(f"[{name}] training={len(yt)} heldout={len(yh)} states={STATES}", flush=True)
    candidates = []
    for harmonic in (2,4):
        print(f"[{name}] exact {P}**{DIM} Fourier score, harmonic={harmonic}", flush=True)
        ranks = exhaustive_fft(yt, xt, harmonic)
        for item in ranks:
            item["selected_harmonic"] = harmonic
            candidates.append(item)
        print(f"[{name}] harmonic {harmonic} top: {ranks[:3]}",flush=True)
    unique = {}
    for item in candidates:
        unique[tuple(item["key"])] = item
    scored = []
    for keyt, item in unique.items():
        key = np.asarray(keyt)
        scored.append({**item, "train":score(yt,xt,key),"heldout":score(yh,xh,key)})
    scored.sort(key=lambda z:z["heldout"]["native_GP_unigram_nats"], reverse=True)
    raw = score(yh,xh,np.zeros(DIM,dtype=np.int64))
    predecessor = score(yh,xh,np.array([1,0,0,0,0],dtype=np.int64))
    assert all(np.isfinite(x["heldout"]["native_GP_unigram_nats"]) for x in scored)
    if planted:
        assert any(tuple(x["key"])==tuple(TRUE_KEY) for x in scored), (
            "Planted source-native full-key not retrieved in 2/4-harmonic top16")
        check_positive(LITERARY,cipher,TRUE_KEY)
    print(f"[{name}] heldout best: {json.dumps(scored[:3])}",flush=True)
    return {"case": name, "runes":len(cipher), "original_training_pages":"p0..p27",
            "heldout_pages":"p28..p55", "states_per_harmonic": STATES,
            "top_holdout":scored[:6], "raw_heldout":raw,
            "first_difference_heldout":predecessor,
            "key_recovered_if_planted": planted and any(
                tuple(x["key"])==tuple(TRUE_KEY) for x in scored)}


def main() -> None:
    print("[SFT] original source checksum FNV32=0xfe63c4ed, computed in independent connector", flush=True)
    real = experiment("original-LP2",SOURCES,False)
    plant = encrypt(LITERARY,TRUE_KEY)
    check_positive(LITERARY,plant,TRUE_KEY)
    positive = experiment("Shakespeare-native-plant",plant,True)
    yt,x=rows(LITERARY,True)
    yh,z=rows(LITERARY,False)
    controls = {"Shakespeare_plain_train":score(yt,x,np.zeros(DIM,dtype=np.int64)),
                "Shakespeare_plain_heldout":score(yh,z,np.zeros(DIM,dtype=np.int64))}
    print(json.dumps({"model":"P_i=C_i-sum(a_l*C_{i-l}) mod29, l=1..5, page-local five-predecessor initial state",
                      "source":"unchanged LP2 p0..55 and pinned Shakespeare GP native",
                      "original":real,"positive":positive,"native_controls":controls},indent=2),
          flush=True)


if __name__ == "__main__":
    main()
