# Previous-clause GP-prime-sum Caesar feedback: exact original-input decision

Agent7, 25 November 2026 — Director [#2754](https://github.com/FlareZ123/liber-primus/issues/2754). **Eight of nine original chapter bodies have no legal inverse; the terminal body has only the unchanged ciphertext inverse.** No authentic unknown plaintext or historical key.

## Fixed mechanism and comparison

The real 2013 Parable checksum gives GP-prime sums 1259,1031,1229 (p57 original clause lengths 30,30,28); product 1,595,277,641. Replayed exactly using the corrected transcript and published GP chart. This does not supply a feedback opcode.

Test the Director's exact recurrence:
- For plaintext non-F rune p in one clause, emit c=(p+s) mod29 with one fixed clause shift s.
- Literal plaintext F (index 0) always emits F (0), independent of s.
- After the whole clause, set next s=sum(GPprime[p]) mod29, **including** literal F's prime weight 2.
- The first s of each physical illustrated chapter is any 0..28. Remove only the contiguous leading red title runes in ink annotations (p15 has two adjoining red spans); interior red material remains. Use corrected major punctuation delimiters . / & / $ (slash here denotes an alternatives list, not a line-wrap character); no line or page reset. Restore p50's omitted empty page and check all 58 physical rune sequences before taking unknown body ranges.

The [previous-clause prime-ordinal receiver](lp2-prevclause-primeindex-fhold-gate.md) converts the full sum to an ordinal then uses changing successive prime shifts. The [public ciphertext checksum relaxations](lp2-running-checksum-anyalphabet-capacity.md) calculate state from ciphertext rather than plaintext. Neither subsumes this exact fixed-shift, plaintext-fed recurrence.

## Exact finite inverse

For any nonzero s, a nonzero ciphertext c=s is forbidden: it would require consuming plaintext F, yet F must emit 0. Consequently the allowed shifts of a complete clause are 0 plus its missing nonzero ciphertext symbols. At shift 0 the identity is the unique inverse.

For any allowed nonzero s, each ciphertext F independently permits either literal F or non-F p=-s mod29. Let z be the number of such zero symbols, B the sum of the inverse with all z set to literal F, and d=GPprime[-s mod29]-2. Every outgoing residue is (B+k*d) mod29, k=0..z, with multiplicity binomial(z,k). Aggregate identical residues and propagate exact BigInt multiplicities at every clause boundary. All legal paths are included without a beam or language assumption. A separate clause-reset trigram Viterbi over partial residue and previous two plaintext runes scores exact MAP paths for the controls, retaining every future-distinguishable state.

## Controls and predictive inverse

Native solved GP sections from the pinned Relikd reference. Hold target section out of add-0.5 trigram training; exclude title, fit first ceil(number of clauses / 2) with all 29 starting shifts. Freeze the recovered preceding-clause residue before decoding the remaining complete clauses. All chosen paths forward-replay.

| Plant | Hidden initial shift / recovered | Prefix exact | Frozen residue true / recovered | Withheld exact | Full legal paths |
|---|---|---:|---|---:|---:|
| WARNING | 13 / 13 | 91/91 | 15 / 15 | 87/87 | 18 |
| LOSS OF DIVINITY | 17 / 17 | 412/412 | 28 / 28 | 325/327 | 6,720 |

Both blind keys and both boundary states are recovered. The two withheld errors on LOSS OF DIVINITY illustrate that latent F ambiguity can survive the score and the model is not generally uniquely invertible. Held-out scores −2.86864 and −2.84033 nats/rune; this is a calibration, not evidence of an actual historical cipher.

## Original-body result (zero-based body-clause numbering)

| Physical chapter | Title removed | Body runes | Failed body clause | Incoming possible residues at failure | Allowed shifts in failed clause |
|---|---:|---:|---:|---|---|
| p0–2 |13|716|1|4,5,6,9,11,16,21,23,28|0|
| p3–7 |16|1129|2|4,7,15,18,21,25|0|
| p8–14 |12|1717|2|5,22|0,23,27|
| p15–22 |20|1883|2|7,14,25|0|
| p23–26 |16|1005|1|14|0,3,4,5,6,12,16,20,24,27|
| p27–32 |19|1414|1|24|0,1,2,6,8,9,10,11,12,14,19,21,25|
| p33–39 |10|1670|2|2,5,8,27,28|0|
| p40–53 |8|3000|3|15,22|0,7,13,28|
| p54–55 |9|299|none|all 29 initial residues|0|

All eight failures have empty incoming/allowed intersection, hence zero complete legal paths independently of English or lexical score. The terminal 299-rune body is **one clause**. The p54-only 223-rune body prefix already contains every nonzero ciphertext label; the legal shift is uniquely 0 before p55 is examined. The frozen prediction of the 76 p55 runes is exactly their original ciphertext (not a new decode). The entire terminal body unique inverse has trigram score −3.453786 and is nonprose. No extra shift or reset is available under the declared recurrence. Thus 8/9 exact reachability failures and 1/9 trivial identity, not 9/9 zero paths.

## Decision and reproduction

Retire this specific chapter-seeded previous-clause checksum feedback with literal-F convention; no new modulus, boundary, sign, or feedback variants. This result does not exclude other mechanisms or make arbitrary language impossibility claims about the original rune tape. No authored feedback selector was found.

Run `node sims/lp2_prevclause_prime_sum_caesar_fhold_sft.cjs` from repo root. Connected V8 executed exact body/held-out control and original core, and separately replayed p57 checksum. Standalone Node wrapper not separately executed. Script commit a07af206e72f7201c4fece66daad106bfcf52a5c. Inputs corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; corrected transcript f7b534a33edeb212d427329798438325307463d7; ink 0614aca67969a14ae006e0c1ae6aee6dcd8136e6; native solved corpus 1b064ef6d85819b7d96adaff31a82d1ec551598f.