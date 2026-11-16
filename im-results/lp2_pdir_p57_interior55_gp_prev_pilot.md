# P57 interior-55 as a key under ciphertext-word-directed pointer reversal

**Status:** bounded negative for one source-motivated rule/convention; not a cipher-family exclusion and not a plaintext result.

## Solve-path hypothesis

The clear p57 *PARABLE* supplies a 55-symbol operand when the first and last rune of each of its 20 printed words are removed: five interior title runes plus fifty interior body runes. Separately, the 2016 signed Cicada message says that words are the map and their numbers are the direction. A plausible human operation is therefore:

1. use the p57 interior-55 tape as a cyclic key;
2. let each ciphertext word's GP-prime-value sum determine whether the key pointer walks forward or backward for the next word;
3. handle the corpus's unusual adjacent-repeat suppression with a skip/coin collision rule.

This is deliberately narrower than arbitrary key hunting. The tested direction rule is **GP_prev**: direction for a word is +1 when the preceding ciphertext word's sum of GP prime values is prime, otherwise -1; the first word defaults to +1.

## Reproducible test

Run from the repository root:

```sh
node im-results/lp2_pdir_p57_interior55_gp_prev_pilot.cjs
```

The script verifies that the transcription's first three page segments exactly match the canonical corpus, and that the final transcription segment contains 20 words / 95 runes. It then tests:

- title-first and body-first key order;
- GP ordinal values and GP prime values modulo 29;
- normal and reversed direction;
- key multipliers 1 and 28;
- deterministic skip and branching coin collision models;
- beam width 16, pointer start 0, and conv000 (no extra movement at word boundaries; previous ciphertext rune as collision comparator).

The window is the first 300 runes from transcription pages 0–2. This is a pilot, not a full-page or full-corpus search.

## Result

The raw window has scaled IoC **0.988651**. The best of the 32 tested combinations is:

- key order/encoding: **body-first GP index**;
- collision model: **coin**;
- direction: normal (not globally reversed);
- key multiplier: **28**;
- scaled IoC: **1.152887**.

The best title-first GP-index variant reaches only **1.066243**. Prime-value encodings peak at **1.084994**. None yields readable plaintext or a language-like frequency profile.

This rejects only the tested p57 key tape + GP_prev rule + conv000 + start offset 0 on this 300-rune window. It does **not** reject other direction rules, pointer conventions, key sources, offsets, or a separately selected layer.

## External context and next decision

The public [pnotisdev/cicada3301 pdir reference](https://github.com/pnotisdev/cicada3301/blob/main/work/kscreen/pdir_ref.py) describes a broader ciphertext-word-directed key-pointer family. Its [queue](https://github.com/pnotisdev/cicada3301/blob/main/docs/QUEUE.md) specifies 66 direction rules, 18 pointer conventions, and a 581-stream flat-IoC library. Its six-stream pilot showed no signal (best reported IoC about 1.238 versus a null around 1.306); the full stage-one screen was still queued in the repository status inspected on 2026-11-16. That broader search is not yet a result in this repository.

The current repository has already tested word-sign rules and plaintext-derived word-direction variants, but not this ciphertext-word-driven pointer reversal over a broad key library. Do not launch the full multi-hour screen without a source-vetted key subset, matched null controls, and a discriminating hit criterion. The p57-specific pilot above is negative and should not be repeated unchanged.
