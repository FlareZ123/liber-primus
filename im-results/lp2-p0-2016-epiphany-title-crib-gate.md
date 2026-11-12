# p0 red 8–5 heading and 2016 signed “epiphany seeks”: conditional crib and original holdout

**Status, Agent37, 12 November 2026:** one independently supplied **phrase** happens to fit the printed opening heading's rune-word shape and implies a GP29 Vigenère key whose prime-sum is the length of p0–2. The implied key fails direct repeated-key tests on original p0–2. No actual title, unknown plaintext, source-selected key, or decryption is established. The observation is retained as a bounded source-specific possibility, not promoted to \`results/\`.

## Human-visible source premise

The *authenticated 2016* OutGuess signed message contains the clause “The path lies empty; **epiphany seeks** the devoted.” The original *2014* physical p0 red heading is two GP rune words of lengths **8 and 5**, exactly the source-normalized GP counts for **EPIPHANY SEEKS**. A human facing the 2016 message could propose these two words as an opening title crib. The author has **not** signed a statement identifying the heading, and the matching lengths do not prove that the text is right.

The canonical original p0 heading is \`SHEOGMIAFSYENGC\` (13 GP29 symbols), with the 2016-inspired proposed plaintext \`EPIPHANYSEECS\` (K rendered as C under the standard GP alphabet). Direct modular subtraction under a fresh one-time hypothesis gives the 13-symbol implied key

\`\`\`text
GP indices: 26 24 08 19 27 24 18 03 00 08 00 16 19
GP translit: YAHMIAAEOFHFTM
GP prime-weight sum: 729
\`\`\`

The *entire original p0–2 ciphertext* also has **262+266+201 = 729 = 27²** runes. This is a numerical cross-match and the 27×27 proposal is older work, independently documented in [the p0 27×27 opening investigation](lp2-p0-27x27-opening-selector.md). The value was observed retrospectively after choosing this crib. To measure specificity rather than treating it as an instruction, the fixed phrase was aligned against **all 12,944** original 13-rune windows in pp0–55: **51** windows yield a derived key with GP prime sum729, including p0's red heading (offset0) and another p0 position178. This weakens interpreting 729 as a unique cryptographic checksum. No original rubric says to sum the inferred keystream's prime weights.

## Decisive original-input test

The source phrase uniquely determines a candidate **13-symbol additive key** (and, separately, the conditional Atbash-before-addition key) when treated as known p0 header plaintext. Both decode the assumed red heading exactly by construction. Reuse them without fitting phase or changing symbols on all remaining **249** p0 body runes, then full **266** p1 and **201** p2 runes, using only phase reset or uninterrupted book-global phase.

All original GP29 decoded IoCs are **0.032537–0.035835**, with unreadable openings (for example p0 additive \`CTIAGTHTRFNDNTHBLFWOXSOIANB...\`). A native runic English signal is absent. The original heading's exact match is a **crib fit**, not a positive original plaintext result; the same inferred key does **not** decode held-out text. This directly rejects *only repeating 13-symbol Vigenère/Atbash-additive reuse* of this particular phrase-implied pad. It does not rule out an independently selected longer/stateful key, a different title, or an intended noncryptographic link between the 2016 words and the original heading.

[Read-only, executable original/2016-source SFT](../sims/lp2_p0_2016_epiphany_heading_crib_sft.cjs), executed successfully in V8 on all canonical inputs. Do not build further guessed key schedules on the 729 number without a new original operator or an untouched correct plaintext prediction.
