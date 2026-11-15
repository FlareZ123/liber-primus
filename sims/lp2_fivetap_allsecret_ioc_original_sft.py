"""Exhaustive all-secret five-tap GF29 feedback invariant by spectral Parseval.

Enumerates each of 29**5 arbitrary shared keys in a single exact 5-D
array. Harmonic aggregation recovers the exact 29-rune index of coincidence
for every key; even a post-feedback arbitrary secret rune permutation cannot
change this statistic. Original pp0..27 fit, pp28..55 blind held-out.
Only printed physical-page local previous five C runes are used.

SFT: python sims/lp2_fivetap_allsecret_ioc_original_sft.py
Requires numpy and scipy; no network and no file writes.
"""
from __future__ import annotations

import json
import math

import numpy as np
from scipy.fft import fftn
from lp2_fivetap_allsecret_spectral_original_sft import (
    P, DIM, SHAPE, STATES, SOURCES, LITERARY, TRUE_KEY, encrypt, rows, score,
)

def direct_ioc(y: np.ndarray, x: np.ndarray, key: np.ndarray) -> float:
    c = np.mod(y - x @ key, P)
    h = np.bincount(c, minlength=P).astype(np.int64)
    n = len(c)
    return float(np.sum(h*(h-1)) / (n*(n-1)))

def all_ioc(y: np.ndarray, x: np.ndarray, count: int=12) -> list[dict]:
    """Parseval evaluates all possible secret keys with no language scorer.

    Let F_h(a)=sum_i exp(2*pi*i*h*(c_i - a dot x_i)/29).
    29*sum_r frequency_r**2=sum_h |F_h|**2. Pair conjugacy
    F_(29-h)=conjugate(F_h) reduces the 28 nonzero transforms to 14.
    To place each transform at the SAME key vector a, accumulate its
    samples at h*x mod29 (rather than x) before the 5-D Fourier transform.
    """
    n=len(y)
    energy = np.full(SHAPE, float(n*n), dtype=np.float64)
    twopi = 2*np.pi/P
    for harmonic in range(1, 15):
        data = np.zeros(SHAPE, dtype=np.complex64)
        coordinates = tuple(np.mod(harmonic*x[:,k],P) for k in range(DIM))
        weights = np.exp(1j*twopi*harmonic*y).astype(np.complex64)
        np.add.at(data, coordinates, weights)
        fft = fftn(data, workers=4, overwrite_x=True)
        real = fft.real.astype(np.float64)
        imag = fft.imag.astype(np.float64)
        energy += 2*(real*real+imag*imag)
        del fft, data, real, imag
    # Sum_r n_r(n_r-1)=(sum_h |F_h|**2 /29)-n.
    ioc = (energy/29-n) / (n*(n-1))
    assert np.all(np.isfinite(ioc))
    selection=np.argpartition(ioc.ravel(),-count)[-count:]
    selection=selection[np.argsort(ioc.ravel()[selection])[::-1]]
    ranked=[]
    for ix in selection:
        key=np.asarray(np.unravel_index(int(ix),SHAPE),dtype=np.int64)
        spectral=float(ioc.ravel()[ix])
        direct=direct_ioc(y,x,key)
        assert math.isclose(direct,spectral,rel_tol=3e-5,abs_tol=1e-6),(
            "Parseval all-key score must equal direct ciphertext inverse",key.tolist(),direct,spectral)
        ranked.append({"key":key.tolist(),"training_ioc":spectral})
    for key in ([0,0,0,0,0],[1,0,0,0,0],TRUE_KEY):
        key=np.asarray(key,dtype=np.int64)
        direct=direct_ioc(y,x,key)
        spectral=float(ioc[tuple(key)])
        assert math.isclose(direct,spectral,rel_tol=3e-5,abs_tol=1e-6)
    print(f"  [check] exact all-key IOCs={STATES}, max={ranked[0]}, half-spectrum=14 transforms",flush=True)
    return ranked

def experiment(label: str, cipher: np.ndarray, planted: bool) -> dict:
    y, x = rows(cipher,True)
    yh,xh=rows(cipher,False)
    print(f"[{label}] train {len(y)} heldout {len(yh)}", flush=True)
    ranked=all_ioc(y,x)
    for item in ranked:
        key=np.asarray(item["key"],dtype=np.int64)
        item["heldout_ioc"]=direct_ioc(yh,xh,key)
        item["heldout"]=score(yh,xh,key)
    if planted:
        assert ranked[0]["key"]==TRUE_KEY.tolist(),(
            "True source-native planted key must be global all-key maximum")
        assert ranked[0]["heldout_ioc"]>0.055
    print(f"[{label}] top three: {ranked[:3]}",flush=True)
    return {"case":label,"all_key_states":STATES,"eligible_train":len(y),
            "eligible_heldout":len(yh),"top12":ranked,
            "reference_plaintext_train_ioc":direct_ioc(y,x,np.zeros(DIM,dtype=np.int64)) if planted else None}

def main()->None:
    print("[SFT] all 29^5 keys, 14 nonzero harmonics, Parseval exact",flush=True)
    original=experiment("original-LP2",SOURCES,False)
    planted=experiment("Shakespeare-native-plant",encrypt(LITERARY,TRUE_KEY),True)
    print(json.dumps({"family":"P=C-sum_j a_j*C[i-j] in GF29, j=1..5; any fixed unknown GP29 output permutation",
                      "conclusion_scope":"globally shared five-tap coefficients, original physical page resets",
                      "original":original,"positive":planted},indent=2),flush=True)

if __name__=="__main__":
    main()
