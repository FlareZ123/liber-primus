# p32 13-rune seed gate

**Status: bounded negative; no plaintext or key recovered.** This tests a source-selected candidate, not the p32 route as a whole.

## Hypothesis

The provisional 2016 word-map interpretation selects a 13-rune window on LP2 p32. Its canonical GP indices are:

`[27,4,16,2,0,0,3,2,8,3,19,18,14]`

The transliteration is `IARTTHFFOTHHOMEX` (13 runes; 16 Latin characters because GP digraphs expand). The 2013 BASE29 material makes a base-29 interpretation natural. The candidate was therefore tested as:

1. a repeating GP29 Vigenère key;
2. a Python 2 MT19937 seed, either as the base-29 integer or as a Python 2 string hash, feeding the already-investigated random29/key-skip mechanism;
3. a seed for direct generation of the 256-byte p49–51 table.

The p32 word-map selection is provisional. Python 2 MT is a plausible implementation family, not a source-established LP2 mechanism.

## Exact derivations

- Base-29 integer, digits read in page order: **`0x855877CAB313F788`** = `9608561517466482568`.
- Python 2 64-bit string hash of the ASCII transliteration: **`0x8B974A152812757A`**.
- The implementation also checks the raw 13-byte GP-index string as a third Python 2 string-seed representation.

For 64-bit integer/hash seeds, the two MT initialization words are split low-word first, high-word second, matching Python 2's `init_by_array` path. The random29 reducer is `int(random()*29)`.

## Results

### Repeating GP29 Vigenère

Both additive signs were tested with the key read forward, both as one continuous stream and with the key reset at each page. No output became language-like. The ciphertext's period-13 average column IC is **0.03457**, essentially the uniform 29-symbol baseline **1/29 = 0.03448**; period 13 is not a peak among periods 1–60.

This rejects the direct repeating-key interpretation of this exact window, not autokey or every possible use of the window.

### Python 2 MT19937 + exact keyskip1

The base-29 integer, ASCII string-hash, and raw-index-byte string-hash seeds were each tested against the first 240 original LP2 runes under the existing exact one-draw rejection/keyskip1 relation:

- sign `-1`;
- random29 keystream;
- maximum skip 3;
- beam width 400;
- the repository's English quadgram reference model.

All three candidate scores were approximately **−7.1 to −7.3**, below the existing **−5.5** candidate bar, and produced no readable plaintext. The implementation reproduces the stored seed-777 S2 reference path exactly (120/120 rune-index agreement and the reference score), so this is not an unvalidated decoder port.

The completed 32-bit seed sweep did not cover these source-derived 64-bit seeds; this was a distinct, bounded test.

### Direct generation of the p49–51 256-byte table

The 256 base-60 tokens in `resources/liber-primus/lp2-grid-256.json` were decoded to bytes (range 0–255; 161 distinct values). For the base-29 integer and ASCII string-hash seeds, the first 256 Python 2 MT outputs were compared using top-8-bit extraction, `int(random()*256)`, and 9-bit rejection sampling. Each comparison produced at most **one matching byte out of 256**, consistent with chance; no stream was reproduced.

This is bounded by the current derived table transcription. Its source notes say only eleven disputed cells have been independently adjudicated against original JPEG pixels.

## Conclusion and scope

The exact p32 window does **not** supply a successful key under direct period-13 GP29 Vigenère, Python 2 MT random29 + keyskip1, or direct Python 2 MT byte-stream generation of the p49–51 table. No plaintext, authentic key, or destination was recovered.

Do not expand this into unconstrained seed encodings or reducer searches without a new independent clue. The p32 word-map selection and other uses of the window remain open; this report only retires the three explicit interpretations above. No change to `results/README.md` is warranted because this is an intermediate negative, not an established overall result.

## Reproduction

Run:

`node sims/p32_13rune_seed_gate.cjs`

Inputs:
- `resources/liber-primus/lp2-corpus.json`
- `resources/liber-primus/lp2-grid-256.json`
- `resources/control/duko_round27_english_quadgrams.txt`
- `resources/control/duko_round27_vectors_s2.json`

The keyskip beam is a small JavaScript reproduction of the exact relation used in the external `Dukotah/cicada3301` research, principally `analysis/round19/I1/driftbeam.py` and `analysis/round19/G3/gen_py27.py`. The stored S2 reference vector is used as a parity check.
