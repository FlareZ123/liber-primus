#!/usr/bin/env python3
"""Decode a Py2.7-MT keyskip1 seed through 240 LP2 ciphertext runes.

Input is the pinned upstream Dukotah/cicada3301 repository's liber-primus root.
For each supplied integer, output the *actual* 240-rune path, a 12-register
panel-R36 score, and independent 3/4 held-out reproducibility. This follow-up
requires no 9-register bar calibration and makes no automatic plaintext claim.

Usage: python3 mt_nearmiss_stageb.py PATH_TO_UPSTREAM_LIBER_PRIMUS 4271474643
"""
import json
import os
import sys
from pathlib import Path

lp = Path(sys.argv[1]).resolve()
for relative in (
    "src", "analysis", "analysis/round11", "analysis/round19/G3",
    "analysis/round19/I1", "analysis/round19/I2",
    "analysis/campaign18_skip",
):
    sys.path.insert(0, str(lp / relative))

import gen_py27 as G  # noqa: E402
import driftbeam as DB  # noqa: E402
import adjudicate as AD  # noqa: E402
import lib_numchannel as NC  # noqa: E402

PRESET = DB.PRESETS["exact"]
PANEL = AD.Panel(lp / "data/panels/panel-r36.npz")
C = list(NC.unsolved())[:240]
TRANSLIT = [AD.TRANSLIT[k] for k in range(29)]


def inspect_seed(seed):
    assert 0 <= seed < (1 << 32)
    mt = G.MT19937()
    mt.init_by_array([seed])
    K = G.REDUCERS["random29"](mt, 240 * 6 + 64)
    full = DB.beam_decode(C, K, sign=-1, o=0, beam_w=400, want_path=True, **PRESET)
    a = AD.adjudicate(full["plain_idx"], translit=full.get("translit"), pan=PANEL)
    cut = 60
    fit = DB.beam_decode(C[:cut], K, sign=-1, o=0, beam_w=400, want_path=True, **PRESET)
    tail = DB.beam_decode(C[cut:], K, sign=-1, o=fit["ptr_end"] + 1, beam_w=400,
                          want_path=True, **PRESET)
    agreement = sum(x == y for x, y in zip(tail["plain_idx"], full["plain_idx"][cut:])) / 180
    plain = "".join(TRANSLIT[k] for k in full["plain_idx"])
    return {
        "seed": seed,
        "source": "Dukotah/cicada3301 f63501d8f2d835b80c30230eb89a1110fb9197d2",
        "cipher_len": len(C),
        "panel": "data/panels/panel-r36.npz",
        "preset": "exact keyskip1",
        "beam_w": 400,
        "pmax_L240": float(a["pmax"]),
        "best_register": PANEL.registers[int(a["preg"])],
        "english_score": float(a["en"]),
        "heldout_agreement": agreement,
        "ptr_end": full["ptr_end"],
        "n_skips": full["n_skips"],
        "rune_plaintext_idx": full["plain_idx"],
        "transliteration": plain,
    }


for arg in sys.argv[2:]:
    print("STAGEB " + json.dumps(inspect_seed(int(arg)), separators=(",", ":")))
