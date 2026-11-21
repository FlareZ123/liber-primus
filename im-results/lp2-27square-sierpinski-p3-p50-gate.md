# Ternary-carpet cross-chapter gate on the original 729-rune opening

## Exact source observation

Original LP2 physical pp0–2 contain **729** GP29 ciphertext runes, exactly a `27×27` array. The immediately following physical p3 contains **217** runes. A standard order-three Sierpiński carpet on a 27×27 array removes the center third at each of three resolutions: **81+72+64=217** cells, leaving **512=2×256**. The original p49–51 table contains exactly **256** paired base60-style tokens that can be interpreted as bytes, although its radix and output role have no first-party authentication.

This is an **unproven structural alignment**, not recovered plaintext or a source-selected cipher. The published 2016 signed message's emphasis on a map, road and numerical direction suggests spatial readings in general. It does not specify a Sierpiński carpet, hole order, data role or decryption operation.

## Complete deterministic experiment

Reproduce with `node sims/lp2_27square_sierpinski_p3_p50_sft.cjs`. The program reads the committed original-input-derived `lp2-corpus.json` and `lp2-grid-256.json`; it copies p0–2 in physical order into a 27×27 row-major square. It selects every location where any corresponding ternary row and column digit are both 1, at scales 9, 3 or 1. These are 217 disjoint removed cells. The surviving cells number 512 and are paired consecutively in row-major order, yielding 256 pairs.

The one-to-one physical-p3 versus carpet-hole test gives **10/217** identical GP symbols at equal offsets and marginal-frequency L1 distance **82**; adding the original terminal-23 source scalar to every hole rune gives **8/217** equal symbols. The full subtraction of the 217-hole tape from p3 is reversibly defined but its generated rune tape has no evident English reading (the SFT prints its first 90 rune transliterations).

For the 256 retained rune pairs versus the physical table bytes, direct two-rune base29 packing, reduced modulo256, matches **1/256** table bytes in either big-endian or little-endian order. The sum of the two GP-prime values matches **2/256**. These are chance-scale matches. Such modulo256 packing is lossy for a generic pair of base29 symbols, so it is not itself a legitimate reversible codec.

## Research decision

The exact **729→217+512** split and adjacent p3 length may justify *one* independent source-clue investigation. The literal one-to-one transport and elementary arithmetic consumers tested here **fail to establish a key or plaintext**. No continuation should be built on the numeral coincidence alone.

A useful successor must identify a **pre-existing original-image or source-authenticated instruction** choosing the ternary center-removal mask, the ordering of 217 holes and 512 retained symbols, and a reversible operand role for the p3 tape or 256-cell table. Freeze that transformation before inspecting output; require a complete original-cipher inverse and a withheld unmodified page/word interval. Without a selector, retire the carpet branch rather than tuning orientations and transforms.

This intermediate record does not change the unresolved status of LP2 pp0–55 in `results/README.md`.
