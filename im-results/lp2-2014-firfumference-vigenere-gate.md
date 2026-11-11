# Cross-round 2014 `FIRFUMFERENCE` key on LP2

**Decision: reject the direct continuous-key transfer.** The 2014 key is a real, source-documented GP29 Vigenere key for LP1 prime pages 107 and 167. LP2 p57's “circumferences” is a plausible human-facing callback. Applying the exact 2014 key schedule continuously to the 12,956 unknown LP2 runes does not produce plaintext or a meaningful language-score improvement.

## Why this was a motivated test

The 2014 sixth-onion archive states that LP1 pages 107 and 167 are encrypted with Vigenere key `FIRFUMFERENCE`, and that the key continues across the page boundary. Its original `gematriaprimus.py` implements the key as a 1-based position in the reverse GP alphabet and adds that shift to each ciphertext rune. In GP indices this is exactly:

```
P[i] = (C[i] + 29 - GP_INDEX(key[i mod 13])) mod 29
```

LP2 p57 says “WE MUST SHED OUR OWN CIRCUMFERENCES.” That is a plausible cue to revisit the earlier Cicada circumference key and its known operation. The hypothesis is a direct cross-round transfer, not a claim that p57 proves the key.

Sources:
- [2014 sixth-onion README: key and page relationship](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/README.md)
- [Original 2014 GP/Vigenere implementation](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/gematriaprimus.py)
- [2014 page 107 rune source](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/107.jpg.runes.txt) and [archived decryption possibilities](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/107.jpg.runes-possibilities.txt)
- [2014 page 167 rune source](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/167.jpg.runes.txt) and [archived decryption possibilities](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/167.jpg.runes-possibilities.txt)
- The 2014/009 README contains the spelling `FIRFUMFERENFE`; the actual 2014/008 README and executable source use `FIRFUMFERENCE`. Only the code-backed spelling was tested.

## Positive control

The key schedule was replayed on the archived 2014 page-107 and page-167 rune sources, starting at key offset 0 and carrying the pointer across the page boundary. It reproduces the archived output apart from three known `IO/IA` transliteration choices. The pointer consumes 224 runes on page 107 and 93 on page 167 (317 total), confirming the source's continuous schedule and the GP-index sign used below.

## Frozen LP2 test

- Input: `resources/liber-primus/lp2-corpus.json`, pages 0–55, 55 rune-bearing pages, 12,956 runes.
- p50 contributes zero runes and therefore consumes no key.
- Key: `FIRFUMFERENCE`; GP indices `[0,10,4,0,1,19,0,18,4,18,9,5,18]`; source shifts `[29,19,25,29,28,10,29,11,25,11,20,24,11]`.
- Schedule: start at offset 0 on p0; carry continuously across every rune-bearing page; punctuation does not consume key; no page resets or searched offsets.
- The 2014 implementation has colon-triggered skip behavior for marked runes. The LP2 transcription contains **zero colon markers**, so no unsourced skip rule was introduced.
- Language scores use the same 700-rune matched-control protocol as `sims/source_register_benchmark.cjs`, with Emerson, Gibran and Shakespeare models. p56/p57 are retained as readable positive controls.

| Matched 700-rune model | Raw LP2 | After key | Change |
|---|---:|---:|---:|
| Emerson | -4.361516 | -4.364094 | -0.002578 |
| Gibran | -4.437846 | -4.426299 | +0.011547 |
| Shakespeare | -4.435810 | -4.424500 | +0.011310 |

The known plaintext controls score substantially better: p56 is `-2.961452 / -2.878342 / -2.885286` and p57 is `-2.820506 / -2.871894 / -2.625673` under the same three models. The key changes the global IoC only from `0.0344784` to `0.0344762`. The decoded prefix is `SIAXOCFIAJJHNTTTHUTHAEEANGOEXCPFPEBXJOEJLNGEOCWYCPHWCIAEOIANDWPSTHXWMPBHFAETHJGHIAFOYNGAETHXNOEMHAEBOOBAEULAEMIPRUHFJUJUCMNGBNGENGMEOGRAEYAYFYOAEALEONGW`, not readable text.

The tiny Gibran/Shakespeare score increases are not a coherent recovery: Emerson worsens, all scores remain about 1.5 nats/rune below the solved-page controls, IoC is unchanged, and no page yields an English passage. This is a negative result for the **direct continuous Vigenere transfer**, not proof that p57's wording has no historical significance.

## Reproduction and decision

Run:

```sh
node sims/lp2_2014_firfumference_vigenere_gate.cjs
```

The script reads only repository inputs, asserts the 55-page/12,956-rune corpus and key-shift vector, and prints the control, raw, decoded and IoC statistics.

Do not retune key offsets, reset the key at page boundaries, test the README typo, or invent skip positions to rescue this direct transfer. Reopen only if an independent LP2 source clue selects a different use of the 2014 key or supplies the missing skip/reset rule. No LP2 plaintext, authentic key, complete cipher mechanism or destination is recovered.
