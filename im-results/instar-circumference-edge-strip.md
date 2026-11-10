# Page 57 “circumferences” clue: word-interior extraction is a negative

**Classification:** source-motivated, reproducible negative. No plaintext, key, or target address recovered. This is an exploratory test of one literal reading of the parable, not a claim that the parable must specify a cipher.

## Human-solver hypothesis

The solved physical LP2 page 57 (original combined image `resources/liber-primus/74.jpg`) reads:

> PARABLE: Like the instar tunneling to the surface. We must shed our own circumferences. Find the divinity within and emerge.

“Instar” is the cicada nymph stage, not “instant”. A literal textual interpretation is to regard each printed rune-word as having a circumference, remove its first and last rune, and inspect the interior. “Find the divinity within” additionally makes the previously used GP Vigenère key DIVINITY a plausible, but not compelled, candidate for the interior.

The test was fixed to the existing canonical continuous word parser. It did not split words at page wraps: the 32 words crossing page boundaries remain intact.

## Exact test and result

The original unsolved corpus contains **12,956 runes**, **2,896 continuous words**, and **32 cross-page words**. Removing both endpoint runes from every word leaves **7,247 interior runes**. Words of length one or two have no interior.

The GP spelling of DIVINITY is **DIUINITY** (the GP alphabet represents V with U). On the extracted interiors, test exactly 32 configurations: both Vigenère directions, all eight cyclic key starting phases, and either one continuous key clock or a reset at every word.

| Measurement | Original words | Edge-stripped interiors |
|---|---:|---:|
| Runes | 12,956 | 7,247 |
| Index of coincidence | 0.0344784 | 0.0344735 |
| Within-word doublets | 63 / 10,060 = 0.006262 | 33 / 4,882 = 0.006760 |
| English quadgram coverage | 44.13% | 45.11% |
| Mean log quadgram count | −1.1380 | −1.0297 |

The best DIVINITY configuration is **per-word reset, subtraction, phase 5**. It scores **−1.1411** with **43.96%** quadgram coverage. None of the 32 configurations yields readable English. For calibration, the same scorer gives the known p56 and p57 cleartext controls scores **+5.7606** (100% coverage) and **+6.0524** (100% coverage), respectively. These are model scores, not p-values.

The interior's IoC remains at the uniform 29-symbol floor and its doublet rate remains close to the original ciphertext's suppressed rate. Thus the literal edge-removal operation does not expose native GP English, and the explicit DIVINITY key does not repair it under the declared clock/sign family.

## Scope

This rejects only the direct “remove first and last rune of each printed word” reading, optionally followed by a repeating GP-DIUINITY Vigenère stream with the tested clocks. It does **not** rule out a different meaning of “circumferences”, a different use of DIVINITY, or a broader cipher whose intermediate plaintext is not native GP English. The page-57 parable may be philosophical rather than an operational instruction.

No changes to authoritative `results/README.md` are warranted: this is a bounded negative, not an established decryption. Reproduce with:

```sh
node sims/instar_circumference_probe.cjs
```

The script uses `sims/lp2_word_pages.cjs`, `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, and the checked-in English quadgram control.
