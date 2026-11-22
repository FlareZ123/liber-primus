# LP2 source numeric table as RC4 with authentic Fehu bypass and collision skips

**Agent 4, 17 November 2026. Research classification: bounded exact original-cipher incompatibility, with a native-GP positive plant.** None of the 64 predeclared original-table RC4 keys can encode a complete intact p33–39 or p40–55 chapter under the specified lossless F-transparent/collision-rejection architecture. No unknown LP2 plaintext, creator-selected original key or final destination has been recovered.

## Why this branch differs from the earlier RC4 screens

The historical 2014 solved Cicada ciphers, including the independently authenticated LP2 p56 prime-totient cipher, send plaintext F/index0 literally as ciphertext F **without consuming a keystream symbol**. The earlier source-table RC4 screens used a conventional additive symbol clock, or a ciphertext-collision skipping clock, without also carrying that authentic Fehu exception. See [the source-radix RC4 tests](grid-rc4-field-source-inverse.md), [the collision-keyskip test](grid-rc4-keyskip-inversion.md), and [the actual authentic F-transparent inverse and blind controls](lp2-ftransparent-word-lexical-viterbi.md).

The 32×8 table spread over physical p49–51 provides 256 original two-character tokens. Its conventional radix60 reading and an alternative alphabet-valid radix59 reading are distinct: the author supplied neither a definite byte radix nor an RC4 key instruction. This finite test asks whether their literal complete table *could* support a compatible original cipher before pursuing English scoring, cribs or arbitrary key searches.

Freeze **2 radices (59/60) × 4 source-order layouts (row/column major and complete reversal) × 4 traditional RC4 drop lengths (0,256,768,3072) × 2 GP29 signs**, giving 64 configurations. Each configuration uses ordinary RC4 KSA and PRGA on the literal 256-byte key, reduces each output byte modulo29, and starts at keystream cursor0 for a chosen genuine chapter or page. No fitted seed, phase, custom S-box, filename, plaintext key, alphabet permutation or per-page offset is allowed.

## Exact model and all-secret cursor decision

For a plaintext rune `P_i=0`, publish `C_i=0` and consume **zero** RC4 bytes. For `P_i ≠0`, tentatively publish `(P_i+s K_j) mod29` for sign `s∈{+1,−1}`. A proposal may be **rejected only when it equals the preceding actually emitted ciphertext rune**, advancing `j` and trying the same plaintext rune with the next pad. The final accepted ciphertext may itself repeat the previous rune. A collision-rejection probability, if supplied by a particular forward cipher, must lie between zero and one; it does not affect the binary existence of a valid cursor path.

The inverse maintains *every* possible cursor after each original cipher rune and applies every forward-valid F bypass, no-consumption branch, and collision-rejection run. There is no beam, language model, candidate threshold or arbitrary maximum number of rejected keys.

A useful exact observation makes the enumeration finite for each proposed position: when `m≥1` proposals are rejected for the *same* plaintext `P_i`, all the first `m` consumed pad residues must equal the same `(C_{i−1}−P_i)/s mod29`. Once a proposed rejected-pad residue differs from the first, no longer rejection run through that position is lawful. Thus the algorithm can stop extending that branch **without pruning any possible lawful path**, even if the source RC4 stream has a long run of repeated pad symbols.

A source-ciphertext configuration fails at the first original rune where its set of lawful cursors becomes empty. This is a direct encoding-existence contradiction for the exact architecture; it is stronger than low IoC or language-score screening, and it does not depend on guessing any unknown plaintext.

## Original-input result

All original rune sequences come from the unmodified `resources/liber-primus/lp2-corpus.json`. Chapter slices concatenate their authentic physical pages, with the p50 zero-rune table page contributing no ciphertext. A physical p55 page-only reset is **not** treated as an independent full-text solve because the first p55 rune continues a word from p54. The intact 308-rune p54+p55 terminal interval is therefore tested together.

| Source-original clock and target | Original rune length | Full compatible configurations / 64 | Furthest prefix any key encodes |
| --- | ---: | ---: | ---: |
| One continuous p0–55 book clock | **12,956** | **0** | **1,682** |
| One intact p33–39 chapter clock | **1,680** | **0** | **511** |
| One intact p40–55 chapter clock | **3,316** | **0** | **1,510** |
| New clock on p54, continuing through p55 | **308** | **1** | **308** |

The one terminal-only survivor is **radix59, reversed column-major, RC4 drop768, sign+1**. Its survival merely states that some plaintext/cursor path exists for 308 runes under a postselected one-of-64 short-window key, **not** that its path is English or that the source specifies this key. Its parent complete p40–55 chapter is incompatible.

**All surviving terminal plaintexts have now been enumerated.** At 308 source symbols there is only **one legal final cursor (314)** and exactly **1,152 distinct legal F-bypass/key-skip paths** under this receiver. None is recognizable native GP-English. A fixed Shakespeare GP29 trigram model, trained on the first 200,000 independent Shakespeare source characters and then frozen, scores the *best of all 1,152 actual proposed original plaintexts* at only **−4.1266068393 log units per rune**. The genuine clear original p57 scores **−2.4782061601**, and a separate 308-rune Shakespeare heldout scores **−2.4445153142**, with the identical alphabet normalizer, trigram smoothing and code. The top original candidate begins, at the original 66 printed-word boundaries, `B NEOXHTINL SHCYEAAETN OAEO HOEDAEEX NU LIDPNG JTHB OEI THEAM…`. Thus the sole apparent short-window survivor supplies **no recovered plaintext**. This language screen is a bounded native-English diagnostic; it cannot exclude deliberately non-English intermediate registers or an unmodeled subsequent cipher layer.

As an additional original-layout control, restart the exact same frozen key separately on each physical page. Across p33–39 the maximum complete pages under **one** configuration is **3 of 7**. Across p40–55 excluding the runeless p50, the maximum is **8 of 15**. **No single configuration survives all pages of either section** under that clock, even though page resets sometimes cut authentic printed words.

The checked-in SFT records the full 64 deterministic settings, all original-symbol counts, the exact all-cursor reachability result, and passing assertions for these maxima. Its keystream is generously provisioned with 16,000 outputs, more than all positions reached by any original candidate.

## Source-native 3,316-rune planted positive

To ensure the hard incompatibility is due to the original ciphertext rather than a decoder unable to follow hidden F and collision skips, use the independently clear original p57 GP stream (95 actual runes) repeated to 3,316 symbols. Encrypt under one frozen candidate key (radix59, reversed column-major, drop768, sign+1), with q=0.81 rejection of collision proposals and xorshift32 seed `0x3301cafe` in the forward plant **only**. The inverse sees only the generated ciphertext and the candidate key, not its hidden plaintext, bypass mask or skip positions.

The forward source-GP plant contains **105 literal F bypasses, 90 collision-rejected key proposals and 3,301 total key consumptions**. The exhaustive inverse reaches all **3,316/3,316** generated ciphertext runes and retains the exact true final consumed-key cursor. The cursor's numerical coincidence with "3301" is a feature of this deliberately constructed seeded synthetic control, with **zero evidence value** for any original LP2 key.

The native positive proves the all-cursor rejection-and-bypass logic can accept a genuine matching generator. It does **not** establish a probabilistic discrimination rate for other algorithms or other language registers. Its repeated p57 register is intended as an exact structural test of the source cipher, not as a natural-language ranking benchmark.

## Decision and exact scope

Retire only the original **complete-table RC4-KSA / modulo29 / source row-or-column / 0,256,768,3072 drop / F-bypass / collision-only skips** family for the frozen book, intact chapter and independently page-reset clocks. A solution requiring an additional authored per-symbol phase or separately supplied IV, a different radix, row-wise keys, some other non-RC4 cipher, or a genuinely non-F-transparent mechanism has not been excluded. Such changes require their own independent first-party selection rather than another arbitrary source-table permutation sweep.

**Single read-only Node22 CommonJS reproducer:** [`sims/lp2_grid_rc4_fehu_collision_allcursor_sft.cjs`](../sims/lp2_grid_rc4_fehu_collision_allcursor_sft.cjs). The script reads only the already-indexed original source JSON and numeric grid, implements standard RC4 KSA/PRGA, asserts the source geometry and native positive, enumerates the 64 exact original-input receivers, and asserts the original observed maximum prefix lengths.
