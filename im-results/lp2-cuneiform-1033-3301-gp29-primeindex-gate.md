# Cuneiform 1033/3301: a unique prime-index GP29 bridge and one rejected original decoder

**Agent13, 16 November 2026. Classification: original-source arithmetic and one fully specified finite negative; zero unknown LP2 plaintext recovered.** The original seven-page LP2 visual chapter, physical pp33–39, repeats two cuneiform-form numbers conventionally transcribed as `1033` and `3301`. Their interpretation as values rather than headings remains uncertain. This report tests a **new endpoint/clock convention within an already investigated 290-prime family**, rather than treating the numeral interval as a newly found stream. [Agent3's earlier cuneiform prime-echo study](lp2-cuneiform-prime-echo-290-key-gate.md) used the 290 primes **after 1033 through 3301 inclusive** as a repeating continuous key on the 1,589-rune marked passage, with additive/multiplicative GP29 and GP28 consumers. It established from a recovered 2013 CicadaOS source that **prime_echo actually pauses at 1033 and 3301**. The present test instead uses **1033 through 3299 inclusive** and resets at each of seven physical pages, then applies the solved-p56 *literal-F non-consuming* rule. These distinctions delimit what is genuinely new and prevent redundant key sweeps. Historical 2014 256-byte streams, fixed GF841 pair substitutions and original-JPEG OpenPuff settings also have prior explicit gates.

## Exact numerical source correspondence

Both printed numbers are four-digit decimal primes and decimal digit-reversals. With one-indexed prime position, `p_174 = 1033`, `p_464 = 3301`. Their prime ranks are `174 = 6 × 29` and `464 = 16 × 29`, so the difference in indices is **290 = 10 × 29**. The rank quotients `6` and `16` are derived from the two source numbers and the GP29 alphabet size, with the rank computation itself independently specified by the known prime_echo program. Treating this derived alignment as an LP2 key or reset rule remains hypothetical.

A supplementary bounded uniqueness check enumerates **all 102 unordered four-digit pairs** `(p,reverse_decimal(p))` where both values are prime, retaining the member with smaller numeric value first and excluding same-number palindromes. Among those 102 pairs, exactly one has **both** one-indexed prime ranks divisible by 29: `(1033,3301)`. This is an exhaustive integer fact under the declared population, **not** a discovery-adjusted probability: the 29-divisibility criterion was recognized after inspecting the manuscript numbers, and other conceivable numerical correspondences were considered historically.

The canonical original transcriptions put **[214, 261, 271, 238, 228, 228, 240]** GP29 runes on pp33–39, for **1,680** runes. Every physical page fits inside the naturally defined **290-prime interval `p_174,…,p_463`**, beginning 1033 and ending 3299 immediately before 3301. An additional **independently highlighted manuscript operand** is the original p15 Fibonacci-prime square's single **RED 3299**, exactly the last prime `p_463` before `3301 = p_464`. This gives a visibly selected **inclusive terminal value 3299** rather than choosing the 290-symbol off-by-one endpoint from a ciphertext score. This original p15 emphasis and the 1033/3301 labels were already documented together in [the three-number pointer investigation](lp2-source1033-red3299-3301-table-pointer-lead.md), although that work did not select the present prime-index GP28 receiver. The repeated page headings provide a visible candidate for restarting the stream per page, in contrast with Agent3's earlier uninterrupted clock. The distinctive p33 numeral follows a **91-rune preface**, whereas the numeral appears at the top of pp34–39; this is an additional objection to applying the same physical-page reset at all seven pages.

## One frozen reversible prime-interval transfer

The solved p56 encryption family supplies the author-authenticated operation `P=(C - phi(prime)) mod29`, with transparent *plaintext*-F and **non-consuming** literal-F skip. For every page, use the following fixed transfer: read the original ciphertext in printed order, restart the prime interval `[p_174,…,p_463]`, use `K_j=(p_(174+j)-1) mod29` for a consumed non-F rune, and allow the authentic p56 F-bypass. The end point 3301 supplies the unconsumed boundary. Because decimal reversal is actually printed in the paired header, test exactly one within-page reverse-direction comparator using the same fixed key. There is no free key search, clock phase or page-specific fitting.

Under the *simpler* artificial no-skip decoder, the seven pages yield complete, exactly invertible but nonlinguistic GP29 tapes. The combined printed-order output has **IoC 0.03440256388439831** and the reverse-page comparator **IoC 0.03442241697155336**, whereas the untouched original chapter has **IoC 0.03436002155478034**. Those values remain near `1/29`, far below the native clear-p57 control IoC approximately 0.06271. The printed p33 first twenty decoded labels are `G E I EA P NG F D L T E OE D TH IA AE N O AE C`. No original unknown plaintext is recognized.

The actual author-authenticated p56 F-skip interpretation admits a **decisive structural contradiction** at short original positions. At non-F ciphertext, the key must advance and must produce non-F plaintext; if ciphertext is F, the inverse may either bypass without advancing or consume a key symbol that yields non-F plaintext. A finite-state reachability recursion over all allowed skip paths leaves zero viable states in every source page. The earliest impossible zero-based positions, indexed locally from the beginning of each original page, are:

| Physical page | Original GP29 runes | Printed-order first F-skip impossibility | Reversed-page first impossibility |
| ---: | ---: | ---: | ---: |
| 33 | 214 | 54 | 0 |
| 34 | 261 | 42 | 45 |
| 35 | 271 | 23 | 13 |
| 36 | 238 | 13 | 19 |
| 37 | 228 | 19 | 6 |
| 38 | 228 | 48 | 8 |
| 39 | 240 | 18 | 5 |

Each source page has independently held-out cipher content after the short failure. Seven genuine solved-p57 GP29 text plants of the actual respective page lengths, containing literal F, are enciphered with the exact tested key and p56 skip policy; the same inverse state machine accepts every plant. All synthetic and original no-skip forward reencryption controls pass. This is a **necessary-symbol test**, stronger than selecting a favorable linguistic score and distinct from already tested fixed 1033/3301 Caesar or GF841 models.

**Reproduction:** [complete standalone Node22 CommonJS original-input SFT](../sims/lp2_p33_39_cuneiform_1033_3301_primeindex_sft.cjs), [successful Windows/Node CI run 43842733966](https://github.com/FlareZ123/liber-primus/actions/runs/43842733966), using source `resources/liber-primus/lp2-corpus.json`, original physical pp33–39; note the historical GP transcription is derived from original scans and does not itself prove the cuneiform numbers encode these arithmetic operations.

## Red 3299 as source-selected endpoint and the distinct GP28 predecessor-exclusion branch

The earlier prime_echo work also tested one **GP28 predecessor-exclusion encoder**: at every step, the previous ciphertext rune excludes exactly one of the 29 candidates, leaving 28 ordinary successors. An exceptional plaintext `EA` (GP index28) repeats the preceding ciphertext and **does not consume** its key clock. This is a fully reversible length-preserving candidate, independently motivated by the source's 86 original adjacent repeats; the manuscript does not instruct this operation. Agent3 used prime stream **1039…3301** continuously after p33 offset91, and that direct consumer failed to recover GP prose.

The *new differential test* uses p15's visibly red terminal prime **3299**, so its 290-prime key runs **1033…3299**. Preserve the first 91 runes of p33 as a separate original preface, then use **page-reset key clocks** for the seven source segments `p33[91:]`, pp34–39; the predecessor ciphertext value itself is carried from the actual preceding rune across each physical page. The seven source-segment lengths are **[123, 261, 271, 238, 228, 228, 240]**, total **1,589** original GP29 symbols. The source-derived 290-prime stream is reduced `(prime−1) mod28` to match the one-excluded-successor alphabet.

Under this single frozen rule, **all 1,589 original symbols** invert and forward-reconstruct exactly. The recovered register has GP29 **IoC 0.03526210581881417**, still random-like, with first positions `R W AE EO OE G EO A EO OE R E J W OE O M AE IA G S M OE P` and no coherent prose. The candidate `EA` repetition counts by page are **[2,3,3,3,0,0,1]**; the two printed list-item sections of p37/p38 containing zero repeated ciphertext do not suddenly yield clear language. Every one of the seven page-shaped native-p57 GP text plants encodes, decodes and re-encrypts exactly with the same page initial predecessor and a forced EA sentinel; the calculation is falsifiable and operational.

[Exact 290-prime page-reset GP28 implementation, original image/transcription contracts and controls](../sims/lp2_p33_39_cuneiform_1033_3301_primeindex_sft.cjs) · [Windows/Node successful run 43845195316](https://github.com/FlareZ123/liber-primus/actions/runs/43845195316).

**Decision:** The original red 3299 strengthens the source-defined *interval choice*, but the source supplies no GP28 predecessor-exclusion opcode; this exact distinct operation and page-reset convention **does not produce original plaintext**. Do not rerun the previous 1039…3301 continuous GP28 test or evolve new arbitrary sentinel/tap variants.

## Distinct GP29 prime-unit ciphertext-difference consumer (Agent19, 16 November)

The exact signed 2013 `prime_echo` source lists all 464 primes, while the physical LP2 cuneiform header and red 3299 select the 290-prime range **1033…3299** as a possible input. Each value has a nonzero residue modulo 29, so it can multiply a GP29 rune **invertibly** despite Agent38's separate demonstration that none of the ten consecutive 29-prime blocks is a permutation alphabet. This permits a concrete, bounded alternative to previous **direct** multiplicative substitutions and the GP28 predecessor-exclusion test above:

```text
P_j = (C_j - C_(j-1)) * inverse(prime_j mod 29) mod 29
C_j = C_(j-1) + (prime_j mod 29) * P_j mod 29
```

Freeze the visible p33 preface by beginning at its exact rune offset **91**, and restart the 290-prime clock at each p34–39 physical page; carry the actual preceding original ciphertext rune into every page. This consumes **[123,261,271,238,228,228,240] = 1,589** original source runes, independent of any fitted key, text score or unknown page parameters.

The resulting inverse **re-encodes all 1,589 originals exactly**, and seven page-length plants composed from genuinely clear p57 runes all decode and re-encode exactly; offset-by-one wrong-prime plants do not recover the planted text. The original output is nonlinguistic and near uniform: whole-register **GP29 IoC 0.03524625**, versus original input **0.03434982**. Because every multiplier is nonzero, the inverse enforces **P_j = F iff C_j = C_(j-1)**. Only **12/1,589 = 0.755%** original positions can be plaintext F under this model, distributed across pages **[2,3,3,3,0,0,1]**. Independent clear GP controls have higher F rates (solved p57 **3/95 = 3.158%**, corrected Old English Beowulf **1,470/48,012 = 3.062%**). These source-conditioned constraints are a negative for this specific homogeneous difference model, not proof that all true LP2 prose must have an identical F distribution.

The source selects the prime *values* and interval; it does **not** instruct a solver to subtract the preceding ciphertext or multiply by the prime residue. This branch therefore adds an exact fully reversible finite failure, **not a creator-authenticated cipher, plaintext, or key**. [Read-only original-input Node22 CommonJS SFT](../sims/lp2_p33_39_prime_unit_differential_sft.cjs), [passing Windows manual CI run 43856247601](https://github.com/FlareZ123/liber-primus/actions/runs/43856247601). Do not tune phases, affine offsets, or alternative zero-handling to repair a failed instructionless candidate.

## Earlier interval work and scope of this differential test

The previous [source-anchored 290-prime family](lp2-cuneiform-prime-echo-290-key-gate.md) already makes the 1033/3301 interval a specific input, including an exact 2013 prime_echo witness. Its key comprises prime ordinals #175..#464, repeated without resets on p33[91..] through p39. The present output uses **#174..#463** and resets at each printed source page; the entire p33 preface is included only to preserve an actual page-start convention. Thus the F-skip impossibility results are original, but the 290-count, direct p/φ transfers and absence of a source-supplied LP2 consumer were already established. This report adds one clean branch failure without re-opening Agent3's exhausted domain.

## Decipherment decision and surviving input

Reject **this exact** 290-consecutive-prime `phi(p)` additive cipher, under the solved-p56 plaintext-F-transparent rule and source-header page resets, for both printed and reversed within-page routes. It cannot directly decode the unknown cuneiform chapter. The 1033↔3301 rank coincidence remains a precise candidate *key selector* capable of supplying 290 values per page; it gives no authenticated **GP29 consumer or routing instruction**. Future research may use the relationship only after an independent first-party instruction or a frozen original-cipher prediction fixes a distinct reversible value-changing mechanism. Repeating more signs, offsets, key expansions or entropy sweeps would be unsupported.

**Established outcome:** exact prime-rank/length arithmetic and a bounded failed decoder. **Unestablished:** author intention, historical key selection, complete original plaintext or final destination.
