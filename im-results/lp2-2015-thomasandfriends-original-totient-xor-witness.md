# Original 9 January 2015 LP2 p25 totient/XOR candidate: executable first-hand witness, no plaintext

**Decision (18 November 2026):** An original-period GitHub repository preserves a solver's p25 decryption attempt with a frozen four-number call and brute-force score data. The exact operation produces isolated dictionary words, without contiguous meaningful unknown-LP2 plaintext or an authenticated key. It supplies a bounded negative for Director [Issue #1475](https://github.com/FlareZ123/liber-primus/issues/1475).

## Original input and solver program

The historical repository [thomasandfriends/Cicada3301Runes](https://github.com/thomasandfriends/Cicada3301Runes) has a single visible [initial commit, 9 January 2015 23:39:25 UTC, SHA 52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35](https://github.com/thomasandfriends/Cicada3301Runes/commit/52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35). Source files are:

- [scripts/bruterunes.py](https://github.com/thomasandfriends/Cicada3301Runes/blob/52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35/scripts/bruterunes.py), Git blob d4e08c7556da18b5db8cdf39749b34d2c5b5246d, with the literal function call **tryDecrypt(25, 3, 14, 3)** immediately before **sys.exit()**.
- [scripts/rkeys.py](https://github.com/thomasandfriends/Cicada3301Runes/blob/52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35/scripts/rkeys.py) defines key index 3 as Euler-totient values, while [scripts/rappls.py](https://github.com/thomasandfriends/Cicada3301Runes/blob/52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35/scripts/rappls.py) defines operation index 3 as binary XOR followed by an additive shift modulo29.
- [data/runes.rune.old](https://github.com/thomasandfriends/Cicada3301Runes/blob/52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35/data/runes.rune.old), Git blob 6b703270f93e7a2af40570442ccb4174830b3200, and [data/bruterunes_findings.txt](https://github.com/thomasandfriends/Cicada3301Runes/blob/52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35/data/bruterunes_findings.txt), Git blob a3e921cf505d9dc5e461733446dd9a860fedd6de, holding 1,856 historical scores.

**Exact original-cipher address:** physical LP2 p25, rune offsets **0–272**. After removal of line-wrap and punctuation artifacts, this 2015 ciphertext agrees with the independently indexed original GP29 p25 at **273/273 source rune indices**. This historical transcription shares the ten known divergent physical pages and their deletion/substitution patterns with the earlier indexed January 2015 pad transcription [report](2015-hj8pvq5s43-pad-derived-transcription.md). Its 9 January commit predates the separately indexed 16 and 23 January Git derivatives. Shared contents do not establish an independent upstream source or unknown plaintext.

## Fixed candidate and outcome

The program selects page25, totient key, shift14 and XOR/mod29 operation. On original source cipher indices C_i at zero-based p25 offsets i=0..272 it computes

\[
P_i=((C_i\operatorname{XOR}\varphi(i+1))+14)\bmod 29.
\]

The first correctly decoded printed words are **DOE E MANGOES DDFOOE HOBMCN SAO YEA XX RNGT XUSYT DEAIADP ...**, followed by similar noise. The complete 273-rune output comes from the accompanying source-locked test. The original parameter artifact is exactly **8 key streams × 29 offsets × 8 operations = 1,856** entries, all for p25. The frozen candidate scored **7/58 = 0.1206896551724138** dictionary words in its original saved file. The best of all 1,856 combinations scored **8/58 = 0.13793103448275862**, well below the program's own 0.40 reporting threshold. The isolated seven-rune word MANGOES, discovered amid many candidate trials, is insufficient as independent plaintext.

The original Python2 parser grouped UTF-8 **bytes** into triples without removing embedded line wraps. It created **34 malformed three-byte triplets** on this page, substituting rune-index zero in place of invalid glyphs. The source-clean runes and historical malformed parser stream both contain 273 slots, but lead to different decoded texts. Neither yields a meaningful 40-rune original plaintext interval.

At **241 of 273** positions the source operation, from the 29 possible ciphertext GP symbols to output symbols, is **nonbijective** because binary XOR plus reduction modulo29 collapses multiple ciphertext values. Consequently this decoder has no general lossless one-rune-per-step forward inverse without additional source state. This is a finite limitation of the 2015 specific algorithm, rather than a ban on all totient or XOR mechanisms.

## Reproduction and decision

- [Runnable CommonJS SFT](../sims/lp2_2015_thomasandfriends_p25_source_sft.cjs) checks the immutable original Git blob SHAs, 273/273 canonical GP p25 rune equality, the historical parameter and saved scores, the malformed UTF-8 triplets, the 241 nonbijective positions and both 205-rune output streams.
- [Windows Node22 CI workflow](../.github/workflows/agent25-2015-thomasandfriends-original-manual.yml) and [passing run 44303530035](https://github.com/FlareZ123/liber-primus/actions/runs/44303530035).

For an additional narrow original-period primary-source boundary, [remlong/cicada-runes](https://github.com/remlong/cicada-runes) is a user-entered standard GP29 prime/shift/skip tool; [cicada-solvers/GematriaPrimusTool](https://github.com/cicada-solvers/GematriaPrimusTool) is a GP translator; [asklepios/Cicada-runes](https://github.com/asklepios/Cicada-runes) provides rune sets; and [kenorb/cicada-2014](https://github.com/kenorb/cicada-2014) archives the earlier stage journey. None of those bounded collections supplied a ≥40-rune original unknown-page plaintext with exact offsets and an executable decoder. The earliest ProBoards source inspected starts in 2016 and is outside this Issue's time window. Earlier source-covered resvolver, 2015 prime-difference, Calypne and first-hand 2014–16 IRC claims were intentionally excluded from repeat investigation.

**Next decision:** Retain this new first-hand executable 2015 artifact as a specific failed historical attempt. Genuine successor work needs a different source-anchored key/plaintext with exact original offsets, rather than variants of the same small dictionary-scoring sweep. The positive 150-rune, untouched-section and reencryption gates of Issue #1475 have not been triggered.
