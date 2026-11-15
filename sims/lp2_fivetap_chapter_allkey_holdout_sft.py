"""Original LP2 full-secret five-tap test with nine source-visible chapter resets.

Each original illustrated chapter receives its own unrestricted five-tap GF29
ciphertext-feedback coefficients. Each chapter is split chronologically into
60% calibration and 40% withheld original ciphertext. A blind 29**5-key
Parseval IoC inverse is performed separately on each earlier subset.

This deliberately tests a different causal key assumption from the existing
global all-key feedback test. It does not assume common keys or interpolate
them to improve the fit. No plaintext or secret key is supplied to the
original search.

SFT: python sims/lp2_fivetap_chapter_allkey_holdout_sft.py
Requires numpy and scipy. Completely read-only.
"""
from __future__ import annotations

import json
from typing import Iterator

import numpy as np

from lp2_fivetap_allsecret_spectral_original_sft import (
    P, DIM, GP, PAGES, LENGTHS, SOURCES, LITERARY, TRUE_KEY,
    encrypt, score,
)
from lp2_fivetap_allsecret_ioc_original_sft import all_ioc, direct_ioc

CHAPTERS = [(0,2),(3,7),(8,14),(15,22),(23,26),
            (27,32),(33,39),(40,53),(54,55)]
CHAPTER_LENGTHS = [729,1145,1729,1903,1021,1433,1680,3008,308]
assert sum(CHAPTER_LENGTHS) == len(SOURCES) == 12956


def group_rows(cipher: np.ndarray) -> list[tuple[np.ndarray,np.ndarray,np.ndarray,np.ndarray]]:
    groups: list[tuple[np.ndarray,np.ndarray,np.ndarray,np.ndarray]] = []
    global_offset = 0
    for (first,last), expected_length in zip(CHAPTERS,CHAPTER_LENGTHS):
        rows: list[tuple[int,list[int]]] = []
        source_count = 0
        for p, length in zip(PAGES,LENGTHS):
            page = p["page"]
            if first <= page <= last:
                part=cipher[global_offset:global_offset+length]
                source_count += length
                for i in range(DIM,length):
                    rows.append((int(part[i]),[int(part[i-k]) for k in range(1,DIM+1)]))
            global_offset += length
        assert source_count == expected_length, (first,last,source_count,expected_length)
        assert source_count >= len(rows) >= source_count-6*(last-first+1)
        n = len(rows)
        split = max(DIM*5, int(.60*n))
        assert split < n
        y=np.asarray([a for a,_ in rows],dtype=np.int64)
        x=np.asarray([v for _,v in rows],dtype=np.int64)
        groups.append((y[:split],x[:split],y[split:],x[split:]))
        global_offset=0
    return groups


def run_group(name: str,cipher:np.ndarray,planted:bool) -> list[dict]:
    output=[]
    for idx,(first,last) in enumerate(CHAPTERS):
        yt,xt,yh,xh=group_rows(cipher)[idx]
        candidates=all_ioc(yt,xt,8)
        for row in candidates:
            key=np.asarray(row["key"],dtype=np.int64)
            row["heldout_ioc"]=direct_ioc(yh,xh,key)
        chosen=candidates[0]
        true_key_rank=None
        if planted:
            actual=direct_ioc(yt,xt,TRUE_KEY)
            if chosen["key"]==TRUE_KEY.tolist():
                true_key_rank=1
            else:
                true_key_rank="outside_top8_or_tied"
            assert actual>0.04, (first,last,actual)
        result={"chapter":idx+1,"pages":f"p{first}..p{last}",
                "train_runes":len(yt),"heldout_runes":len(yh),
                "top_train_ioc":chosen["training_ioc"],
                "top_heldout_ioc":chosen["heldout_ioc"],
                "top_key":chosen["key"],
                "all_top8":candidates,
                "blind_positive_key_rank":true_key_rank}
        print(f"[{name}] chapter {idx+1}: {result['pages']} training {len(yt)} "
              f"heldout {len(yh)}, top {chosen['top_key'] if 'top_key' in chosen else chosen['key']} "
              f"train {chosen['training_ioc']:.8f} heldout {chosen['heldout_ioc']:.8f}",
              flush=True)
        output.append(result)
    return output


def main()->None:
    print("[SFT] 9 distinct all-20,511,149-key source-chapter searches and blind heldout gates",flush=True)
    real=run_group("Original-LP2",SOURCES,False)
    plant=run_group("Shakespeare-native-plant",encrypt(LITERARY,TRUE_KEY),True)
    print(json.dumps({"model":"Nine independently secret, chapter-constant five-step ciphertext feedback coefficients",
      "source":"Original LP2 p0..55; nine original visible chapter boundaries; page-local five-tap",
      "original":real,"positive":plant},indent=2),flush=True)


if __name__=="__main__":
    main()
