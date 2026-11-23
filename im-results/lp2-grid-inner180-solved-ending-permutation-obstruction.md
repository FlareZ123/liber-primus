# LP2 grid interior180 versus the solved ending: permutation-only obstruction

The printed p49–51 table has exactly **256** physical cells, and its one-cell-deep perimeter surrounds a **30×6 interior of 180 cells**. The two ending leaves p56 (85 runes) and p57 (95 runes) also contain 180 GP29 runes. The coincidence motivates a particularly inexpensive *necessary* test before anyone searches permutations: if the 180 cells encode the ending purely by **spatial reordering** (plus even a global arbitrary bijection among the 29 GP symbols), the **sorted 29-symbol frequency multiset must agree exactly**. The same applies if one compares to the genuinely decrypted plaintext of p56 rather than its ciphertext.

## Exact test on original material

Inputs:
- Original `resources/liber-primus/lp2-grid-256.json` 32×8 printed table, selecting physical row indices 1–30 and columns 1–6.
- `resources/liber-primus/lp2-corpus.json`, p56's 85 original ciphertext runes and p57's 95 original clear runes.
- Authentic p56 85-rune prose in native GP29, with the exact known prime-totient / plaintext-F-transparent forward replay asserted to reproduce the original p56 ciphertext byte-for-byte.
- Direct cell readings in original base60 and alternate base59 digit convention, each reduced modulo29; no additional guessed key.

The exact minimized histogram L1 distances after *any* possible global bijection of the 29 symbols are:

| Grid residue convention | Original ending ciphertext (p56 encrypted + p57 plain) | Actual ending plaintext (p56 decrypted + p57 plain) |
| --- | ---: | ---: |
| Base60 cell value mod29 | **20** | **74** |
| Base59 cell value mod29 | **26** | **80** |

Zero is **necessary** for any permutation-only source-to-target equality. The direct unrelabeled L1 scores are respectively base60 102/144 and base59 116/164. These numbers are nonzero on complete original 180-unit inputs. A native 180-symbol positive plant is permuted and encoded under a bijective GP29 relabelling, and its sorted histogram is preserved exactly; the implementation checks this invariant and the authentic p56 forward replay.

## Research decision

The inner180/solved180 count coincidence **cannot produce the known ending solely by reordering byte residues and globally renaming GP29 symbols** in either of the two conventional table radix encodings. This closes an otherwise expensive unkeyed search family. It does **not** exclude additions, XOR with keys, non-bijective conversion from 256 byte values, variable-symbol state, true original plaintext of unsolved pages, or another source-selected interpretation of the grid. No new LP2 plaintext follows; retain this as a mathematical intermediate constraint.

[Exact, read-only Windows Node22 test](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_inner180_permutation_spectrum_sft.cjs) · [Windows Node22 CI PASS, 23 November 2026, run45119599908](https://github.com/FlareZ123/liber-primus/actions/runs/45119599908).
