# Original p50 table as a changing key cursor for its posttable sentence

**Disposition: one source-adjacent, fully executed decoder candidate is negative; no unknown Liber Primus plaintext or authentic key/operation recovered.** The tested *key cursor* consumes extra table cells when a proposed GP29 output would repeat the previous ciphertext rune. It allows original doublets by an unverified probabilistic escape. It is a diagnostic attack with an underdetermined skip tape, not an established lossless 2014 Cicada cipher.

## Why these two source objects

Original physical pp49–51 show one 32×8 table of 256 two-character numeral cells, followed by a **170-rune intact sentence** on physical pp51–52 (the final 92 runes of p51 plus 78 of p52). The exact row-major, conventional base-60 byte interpretation is retained as `resources/liber-primus/lp2-grid-256.json`; the original rune indices are retained in `lp2-corpus.json`. Treat the table as the key for the *immediately following* intact sentence. This is a more direct physical link than the distant p8 256-rune coincidence, but the original gives **no explicit table-to-GP29 serialization, skip opcode, or initial-state instruction**.

Prior #2214 excludes standard bitpacked Mealy and literal pad interpretations; #374 tests a distinct 256-quotient skip stream on p55; #1099 constrains the exact flanking sentence; #381 proves ciphertext-only stochastic skip/rewrite indistinguishability. This test changes the cursor under source table values, targets the whole contiguous *immediate* posttable sentence, and retains those existing negative gates rather than rerunning them.

## Fixed reproducible receiver

- Byte key `K[j] = table[j % 256] % 29`, original printed 32×8 row order, key index zero at the first posttable rune.
- Primary operator `C[i] = (P[i] + K[j]) % 29` and advance `j`. At an apparent ciphertext collision with the previous output, an extra source key cell may be consumed. The skip heuristic is set to 0.81, following preexisting anti-repeat modeling; **that number was inferred from anomalous original doublets and is not independently selected by the source**. Enumerate 0–4 omitted cursor positions with a beam of 1,200.
- Retain an English GP29 unigram/bigram/trigram scorer trained on the actual solved LP1 text `lp1-plaintext-reference.txt`. The exact original posttable word boundaries are preserved in the input but the candidate score uses only contiguous runes; it therefore cannot accidentally fit those word spaces.
- The 170-rune plaintext planted control is a deterministic 170-rune repetition of source-native solved p57, withheld from that LP1 model. It is encrypted by the frozen cursor and a seeded collision sampler.

## Execution, original versus positive

| Measure | Authentic solved-GP native plant | Untouched original posttable p51–52 |
|---|---:|---:|
| Input runes | 170 | 170 |
| Recovered exact native runes | **170/170** | No known plaintext for comparison |
| Inferred skipped key cells | 4 | 3 |
| Recovered GP29 IoC | **0.06634** | **0.03557** |
| Full trigram+skip score | **−489.724** | **−778.409** |
| Mean full score/rune | −2.881 | **−4.579** |
| Readable connected prose | Yes, reconstructed solved p57 | **No** |

Original recovered opening, source GP spelling: `W H L B B S R H R B H M E S EA OE Y H W TH G A EO X A TH EA H M B OE EO Y W EA O AE G X TH M D R B O AE B EA EA C L ...`. The full 170-symbol inverse remains near a random GP29 frequency distribution despite the same decoder recovering its native planted control exactly. The p50 arithmetic is conventional byte interpretation, not a Cicada-authenticated GP key schedule.

## Research fork

**Reject this exact source-table modulo29, phase-zero, GP-additive collision-key-cursor receiver as a plaintext route.** In addition to its original negative, the skip events require side-information or a uniquely specified deterministic rule; the manuscript supplies neither. Do not rescue the candidate by changing base59/base60, byte permutations, an arbitrary cursor start, q, or the output language after seeing the failure. Another typed p50 consumer should require an actual historical instruction or an independent holdout prediction.

Reproduce the experiment with `node sims/lp2_p50_posttable_collision_cursor_original_sft.cjs` from the repository root. This is a single-file read-only Node 22 program; it uses only the canonical three resources and Node built-ins. Its source and output are supporting experimental evidence in `im-results`, not a new established result in `results/`.
