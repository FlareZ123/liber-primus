# Spacing-free cyclic preceding-plaintext-word autokey

## Decision

Remove the printed-cut assumption from [#2503](lp2-preceding-plaintext-word-autokey-fhold-exact-gate.md)'s exact preceding-word ordinal cyclic Vigenere/F-hold law. A calibrated exact finite-language graph rejects the ordinary native-language prediction on original p0–2 and p16–21. Both original scopes admit complete mathematical paths; the earlier fixed-boundary all-key contradiction does not transfer as a language-independent no-path claim. No unknown plaintext or authentic key recovered.

## Frozen mechanism and inference

Let K be the entire preceding recovered plaintext word (GP0). Each new word starts phase0; for p=0 emit 0 without phase advance, otherwise emit (p+K[q mod |K|]) mod29 and increment q. The current decoded word becomes K for the next word. The initial K is unknown; enumerate all 34,895 independent native vocabulary forms as possible starting keys, equal prior. This fixes the exact #2503 law, not an authenticated source instruction. Its motivating sources are ordinary GP29 additive encryption and transparent F in solved LP1, and the signed 2016 words/numbers instruction.

Discard every printed boundary. For each cut, maintain every reachable previous word (not merely sum or suffix). Invert all possible lengths 1..24 and all valid latent F interpretations. A known preceding word allows either a lexical or arbitrary OOV successor. An OOV predecessor requires a lexical successor; this grants every isolated OOV but not consecutive OOV words. Use a prefix trie to prune impossible lexical-only continuations. No language beam or state truncation; hard cap 1,000,000 live states per cut, not reached in any experiment. Identical cut and exact previous word have identical future emissions, so merge using two independently optimal cumulative objectives:
- MAP using the same frozen TextBlob/Shakespeare/native word-mixture prior as the [self-word prime-index study](lp2-spacingfree-selfword-primeindex-original-gate.md).
- Maximum lexical rune coverage, granting any isolated OOV word of length≤24. This objective is independent of probability weights and yields an exact conditional OOV lower bound.

Both witnesses are reconstructed and forward-replayed. Word length cap and isolated-OOV restriction were fixed from the intended native register before original use. The four withheld native controls contain 2,2,4,2 OOV words respectively; none are adjacent. No added target vocabulary. Control first word is used as hidden seed and omitted from ciphertext. Gate per control >=95% rune recovery and >=90% boundary recall; seed errors reported separately because an equivalent key prefix or wrong opening can be unidentifiable. Original p0–2 and p16–21 fixed before scoring.

## Calibration and original results

| Native control | Runes recovered | Boundaries | Seed recovered | Max lex | MAP nats/rune |
|---|---:|---:|---|---:|---:|
| WELCOME | 508/508 | 123/123 | WELCOME | 494/508 | -1.765582 |
| KOAN1 | 777/779 | 207/207 | AWL instead of A | 771/779 | -1.736653 |
| LOSS OF DIVINITY | 753/753 | 180/180 | THE | 721/753 | -1.848329 |
| KOAN2 | 318/318 | 87/87 | A | 317/318 | -1.712545 |

Total 2356/2358 native runes, 597/597 true boundaries, all 597 true transitions, 3/4 full seed words. KOAN1's two incorrect opening runes and different seed are a real inference failure, not rounded away. All four recovery gates pass.

| Original scope | Exact MAP nats/rune | MAP known runes | Exact max known runes | Min OOV runes | Enumerated edges | Peak live states |
|---|---:|---:|---:|---:|---:|---:|
| p0–2 | -5.258733 | 318/729 | 512/729 | 217 | 11,755,454 | 80,952 |
| p16–21 | -5.249364 | 742/1613 | 1140/1613 | 473 | 20,707,407 | 43,159 |

Both exact MAP and maximum-coverage paths are full and replay unchanged ciphertext. MAP opening begins YESTAETECAHEA ATTAIN CA BHR XU RGODUNGIAN BA NGUE EU MTLY DUE EIPU O D LD O ISA M; p16 begins POEMAYSIX SNGS PAB I A R CU YEECC HER T XU LAB PL PRO EPEDJ. Individual recognizable tokens are artifacts of the scoring objective, not plaintext. Original optimizers EMOTIONAL and CUCUMBER are not evidence of historical seeds.

Even the exact maximum-coverage paths require 29.8% and 29.3% OOV runes, far above controls (0.3–4.3%). This rejects the frozen finite-native-register/isolated-OOV/length24/lexical-seed interpretation under arbitrary segmentation. No assertion about arbitrarily consecutive OOV words, unrestricted initial nonlexical keys or unbounded lengths. Do not sweep alternative cyclic offsets after this result.

## Reproduce

`node sims/lp2_spacingfree_prevword_cyclic_sft.cjs`. Actual core executed in separate V8 control/original calls against exact fetched corpus and lexicon. Wrapper not executed end-to-end. [Core](../sims/lp2_spacingfree_prevword_cyclic_core.cjs), [p0–2 witness](lp2-spacingfree-prevword-cyclic-p0-2.json), [p16–21 witness](lp2-spacingfree-prevword-cyclic-p16-21.json), [WELCOME](lp2-spacingfree-prevword-cyclic-control1.json), [KOAN1](lp2-spacingfree-prevword-cyclic-control3.json), [LOSS](lp2-spacingfree-prevword-cyclic-control4.json). KOAN2 pilot retained in execution summary and reproduced by same core.
