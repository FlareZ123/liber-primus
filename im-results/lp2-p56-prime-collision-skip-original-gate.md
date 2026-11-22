# Authentic p56 prime-totient key with optional duplicate-output retries: exact LP2 original-input reachability

**15 November 2026, Agent32. Conditional exact cipher-family exclusion; no recovered unknown-page plaintext, creator key or final destination.**

## Human-selected rule and independent control

The genuinely solved LP2 p56 uses a consecutive-prime totient shift on the 29-symbol Gematria Primus alphabet: for non-F plaintext rune `P`, `C=(P+(prime_j−1)) mod29`. Its special **plaintext F** emits ciphertext F without consuming `prime_j`. A ciphertext F remains ambiguous because it may also be the encrypted output of non-F plaintext. The source-authenticated method is implemented independently at [the original solved-control regression](../sims/authentic_decryption_regression.cjs).

Original unsolved LP2 has only **86 adjacent equal-rune pairs across 12,901 within-page opportunities**, suggesting a possible anti-repeat encoding operation. The testable variant here is the **minimal unchanged p56 cipher** plus a candidate duplicate-output collision filter: whenever the next would-be ciphertext rune equals the previous emitted rune, the sender *may consume the candidate prime without emitting it and retry the same plaintext rune with the next consecutive prime*. A duplicate may also be accepted; source doublets exist. The recipient does not receive the skip count and must infer it from ciphertext.

The unknown-page hypothesis retains **the actual p56 prime source and prime-2 initial clock**. It does not select any new key by fitting unknown data. Neither Cicada-authenticated source nor historical solver instruction authorizes the duplicate-output filter on p0–55, so the result must remain a **conditional exclusion** of this precise natural bridge.

## Exhaustive decoder and forward control

The [single-file Node 22 original-corpus SFT](../sims/lp2_p56_prime_collision_skip_reachability_sft.cjs), [passing Windows Node 22 CI (including both exact local certificates)](https://github.com/FlareZ123/liber-primus/actions/runs/43656894740) reads canonical `resources/liber-primus/lp2-corpus.json` GP29 indices. Its dynamic program begins with **key cursor zero** for each independently tested page or selected contiguous chapter. At ciphertext offset `i` and next-prime cursor `j`, it retains every reachable cursor and the minimum/maximum number of possible plaintext E runes, with exactly three state transitions:

1. When `C_i=F`, emit literal plaintext F and leave the prime cursor unchanged.
2. Emit a non-F `P_i=(C_i−K_j) mod29` with `K_j=(prime_j−1) mod29`, consuming one prime.
3. Only if `i>0`, consume a rejected prime `K_j` and emit a non-F `P_i=(C_i−K_(j+1)) mod29` consuming the next prime, **provided `(P_i+K_j) mod29=C_(i−1)`**, i.e. the rejected output would exactly duplicate the preceding ciphertext rune.

For the first **2,000 consecutive prime totients**, adjacent `K_j` are never equal modulo 29 (asserted over the exact computed key prefix). Two consecutive rejected candidate outputs for the same non-F plaintext would require `K_j=K_(j+1) mod29`, which is impossible. **The three routes therefore cover all possible skips**, rather than truncating a speculative Viterbi search at one retry. The DP makes no language-score choice, plaintext guess, fitted offset, per-page adaptive phase, or clock re-synchronization.

Two distinct positive controls pass:

- The genuine **85-rune p56 original ciphertext** remains fully reachable, ending with prime-clock indices **81–85**. The original known cipher is inside this model because it can always accept a duplicate without rejection.
- Six copies of the genuinely clear GP-native 95-rune p57, used as a **570-rune planted plaintext**, are encrypted under the defined original prime/F rule with seeded optional duplicate retries. The seed `0x3301ad42` yields **8 actually rejected keys**, **18 literal-F bypasses**, authentic plaintext **90 E runes** and true final key cursor **560**. The decoder preserves that cursor among nine reachable end states, with the true E count at its state-family upper bound. An independent trace replay reconstructs all 570 planted ciphertext runes exactly. The plant is an implementation control, not historical evidence for the filter.

## Frozen original LP2 outcomes

| Authentic ciphertext register | Exact rune count | Result under p56 key + transparent F + optional collision rejection |
| --- | ---: | --- |
| Physical p0, fresh prime-2 clock | 262 | **No valid plaintext/state path at zero-based rune 235** (the 236th rune). Without skips, failure is also at 235. |
| Physical p55, fresh prime-2 clock | 76 | **No valid plaintext/state path at zero-based rune 63** (the 64th rune). Without skips, failure is earlier at rune 39. |
| Physical pp54–55 concatenated, one fresh prime-2 clock at p54 | 308 | Only **two** surviving final cursor states, **314 and 316**, and **at most 10 plaintext E runes** across the entire 308-rune register. |
| Authentically solved p56, fresh prime-2 clock | 85 | Fully reachable, with five final cursor states; a correctly permissive positive. |

### Local impossibility certificates (independent of a language model)

The complete DP collapses to **one single possible key clock** before each decisive impossible rune:

- **p0 offset 235:** the previous ciphertext rune is **T** (GP16), and the next original ciphertext is **H** (GP8). The only preceding prime cursor is **j=231**. Its next totient residues are **K231=8** and **K232=20**. A direct decode gives `(8−8) mod29=F`, which is **forbidden** because authentic plaintext F would have produced ciphertext F. A one-key retry would produce plaintext **B** (GP17), but its rejected candidate would have been `17+8=25` (**AE**), which is **not** the actual preceding ciphertext T (GP16). H cannot be a literal-F bypass. Thus there is no transition.
- **p55 offset 63:** previous ciphertext **TH** (GP2), next ciphertext **OE** (GP22), sole preceding cursor **j=64**, with `K64=22` and `K65=26`. Direct decode again produces forbidden plaintext F. One retry would decode **AE** (GP25), but the preceding rejected candidate would have been **E** (GP18), different from the actual preceding TH (GP2). OE cannot bypass. Thus the state space is empty.

The two rune identities were additionally checked on the supplied original JPEG plates: **17.jpg**, physical p0 printed line 11, glyphs 19–20 (`T H`) and **72.jpg**, physical p55 printed line 3, glyphs 63–64 (`TH OE`). The second pair is independently registered in `resources/liber-primus/lp2-p55-source-glyph-coordinates.json` at the original-image rectangles `[1439,1050,1472,1159]` and `[1476,1050,1519,1159]`. These visual checks verify the precise glyph inputs used in the no-path certificates without selecting the decipherment rule.

These are explicit local contradictions on the **original source indices**. Every earlier possible key clock and F-bypass choice has already been considered, and none survives either site. The SFT asserts both complete machine-readable certificates as exact expected outputs.

The direct p0 and p55 impossibilities are stronger than the language comparison: **even arbitrary non-English original plaintext cannot be produced** by this exact family on those pages with those frozen source clocks, because no state path reaches their end.

## Decision and limitations

**Reject direct page-initial transfer of the genuine p56 consecutive-prime/F-bypass stream, even if every prospective adjacent-equal ciphertext emission is allowed one optional key-rejection retry.** This is a sharpened negative for the minimal p56→unsolved anti-repeat bridge, separate from [the GP28 predecessor-exclusion prime-totient test](lp2-gp28-phi-prime-fskip-original-direct-gate.md) and from previous **p49–51 numerical grid** keyskip studies.

This does **not** exclude an unknown page-specific starting prime, a different source-derived key, a changed orientation/sign, per-word clock resets, other anti-repeat encoders, additional cipher layers, or accidental suppression of doubles. In particular, **p55 is excluded only with a fresh p55 prime-2 start**; the continuous p54–55 case remains reachable algebraically, though its exceptionally low maximum E count offers no meaningful plaintext. Nothing here recovers a true unknown LP2 rune.

**Next causal test is source-led:** find an original instruction specifying a changed key start, state reset or collision mechanism, and predict new unknown ciphertext plaintext without reselecting parameters on the same original text. Until then, further prime offsets, arbitrary rejection penalties and synthetic key scores would only fit an unauthenticated premise.
