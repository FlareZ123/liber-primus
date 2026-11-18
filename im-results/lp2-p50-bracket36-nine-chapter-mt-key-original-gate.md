# Original p50 36-byte zero-bracket as nine chapter RNG keys

**17–18 November 2026, Agent17. Original-input, source-constrained negative.** No unknown GP29 plaintext, authenticated author key or final destination was recovered. This is an explicit frozen direct-key test, not identification of a cipher.

## Independent source trigger and unselected operator

The original 2014 p49–51 table contains two literal `00` cells at indices **192** and **229**, enclosing exactly **36 nonzero base60-decoded bytes** in original row-major order. An unusually specific historical-DH clue has recently been established as a conditional **address**, without a decoder: signed 2013 DH modulus23 and base5 land at p51 first row's source `3C`=192 at original table index 189; the original row23 col2 is `0J`=19, equal to the signed worked client public share19; 3301 modulo256 points at the other zero at229. The same source already has an independent p39 double-root24 row-address into cell192. The coordinate grammar is *retrospectively inferred*, and neither signed protocol nor 2014 manuscript instructs a pseudorandom expansion. This is why the trial below is bounded.

A **distinct nine-seed candidate** arises because the manuscript's nine visually red-headed unknown chapters admit one seed apiece, and the 36-byte literal bracket divides into **nine consecutive 4-byte 32-bit integers**. One period-available primitive is the standard MT19937 pseudo-random generator `random.Random(seed)` (CPython 3.11 serialization used to pin its current exact behavior). This is *different* from previous checks on the **entire original p50 table as direct time-seeded MT output**. The source does not name MT, a seed endianness, a byte extraction, or a GP29 cipher. Test exactly two canonical 32-bit endiannesses, three native generator readouts, and two arithmetic directions. No plaintext feedback or language model selects settings.

The untouched original byte slice is hex

`9b9f59b073692f6e4ad144c24c7f1539af063d4696fb548edb943b3a343397443449f990`

with SHA-256 `9205dc9d0d6071448dd91876e1211becd2b4ef224445030e11b08b63acbdd86b`.

For each source-visible chapter start, initialize its four-byte seed big- or little-endian and emit one key residue per original GP rune. The three fixed generators are `randrange(29)`, `getrandbits(32)%29`, and `getrandbits(8)%29`. Directly invert `P_i=(C_i ± K_i)%29` until the next original chapter reset. Use the exact nine source chapter rune lengths **[729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]**, totaling **12,956** unknown runes. Original ciphertext, visual chapter assignment and rune orthography are not edited.

## Completed full-original decision

All **12 complete variants** invert and reencrypt all 12,956 source runes and pass a separate exact **95-rune genuine-clear p57** plant under each chosen source key/sign. None reveals prose.

| Fixed source contract | Original-input result |
| --- | --- |
| 12 entire-book inverses (2 endiannesses × 3 readouts × 2 signs) | Every pooled GP29 IoC **0.034466–0.034535** |
| Best case under conservative criterion maximizing the weakest of the first eight chapter IoCs | Big-endian, `getrandbits(32)%29`, plus; full-book IoC **0.034475** |
| Its original eight held-out chapter IoCs | **0.034644, 0.034452, 0.034564, 0.034452, 0.034633, 0.034655, 0.034400, 0.034520** |
| Untouched original first eight chapter IoCs | **0.034083, 0.034634, 0.034460, 0.034502, 0.034274, 0.034186, 0.034360, 0.034543** |
| Source-native positive | The independently printed 95-rune p57 plain GP29 input encrypts and decrypts exactly **95/95** for each of 12 key contracts |

This near-`1/29=0.03448276` outcome is qualitatively noise-like, whereas the source-native clear p57 has IoC approximately **0.06271**. These outcomes exclude **this specific direct MT-derived GP29 additive receiver** as an ordinary prose decipherment, without excluding a different value-changing consumer chosen by a genuine independent clue. The exact 36-byte count is insufficient alone to authorize a nine×four key schedule.

## Reproduce and next decision

Read-only self-contained Python3.11 source: [`sims/lp2_p50_bracket36_nine_mt_sft.py`](../sims/lp2_p50_bracket36_nine_mt_sft.py). Exact original input is the committed p50 grid and LP2 corpus; the SFT asserts the 36-byte SHA-256, original nine chapter lengths, 12 exact roundtrips and the full 95-rune genuine-source planted controls. It completed successfully on the Windows runner in [GitHub Actions run 44205694276](https://github.com/FlareZ123/liber-primus/actions/runs/44205694276).

**Decision:** retire the 9×4-byte MT direct-key reading under these twelve native contracts. The potentially important surviving clue is the separately authored **23/5/2/19 DH numeral set** relating to the original row23 table cells, and its alleged instruction or actual consumer remains missing. Further pseudorandom generator families from this same bracket without a new authenticated selector would repeat speculative key hunting.
