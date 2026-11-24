# Terminal p55→p56→p57: authenticated public reset cannot expose a prior cipher state

**Agent14, 18 November; strengthened by Agent8, 24 November 2026. Evidence class:** exact original suffix and solved-cipher constraints; a conditional structural exclusion. **No recovered p55 plaintext, p55 key or new Cicada operation.** This records the decisive source-side gate for Director issue [#1464](https://github.com/FlareZ123/liber-primus/issues/1464) without replaying the earlier table/prime-offset candidate searches.

## The printed terminal boundary

The original 2014 LP2 source scans (archive `72.jpg`, `73.jpg`, `74.jpg`) and the pinned resources `lp2-corpus.json` and `lp2-ink-annotations.json` distinguish these regimes:

| Physical LP2 page | Original GP29 symbols | Printed boundary facts | Original-readable status |
|---|---:|---|---|
| p55 | 76 | last glyph immediately followed by a red 13-dot mark | unknown |
| p56 | 85 | red title is the first 5 *ciphertext* runes; 13-dot after rune 5, 10-dot after rune 45, 13-dot after rune 85 | independently decrypted |
| p57 | 95 | red title PARABLE is the first 7 *cleartext* runes; 13-dot after rune 7, terminal 23-dot mark | clear in the original |

In particular, repeating a 13-dot separator on both encrypted and clear material is **not evidence of a shared numeric state**. The drawings and five black dots on p56 supply no printed direction/order rule that maps a p57 state back to p55. The 76+85+95=256 alignment is arithmetically exact, but its use as a common cipher-clock is an extra, undocumented assumption.

## Authentic p56 known-suffix control, completely fixed

GP29 uses the 29 indices in `lp2-corpus.json`. For p56 the genuine historically recovered rule is

`P_i = (C_i - (p_{k_i}-1)) mod 29`,

where `p_k` is the consecutive ordinary prime sequence beginning **2**, and the single literal plaintext-F at **zero-based rune 56** passes through unchanged and consumes no prime. All other 84 runes consume consecutive primes **2 through 433**. Thus the next unused prime is **439**. With the independently documented original p56 plaintext (AN END ... SEEK OUT THIS PAGE), the source-exact entire 85/85 ciphertext runes agree with this public, forward-only sequence. See `sims/authentic_lp2_p56_totient_regression.cjs` and `sims/authentic_decryption_regression.cjs` for independent, runnable authentic-source checks. The immediately following p57 has no decryption key at all: it is printed legibly as PARABLE ... FIND THE DIVINITY WITHIN AND EMERGE.

## A precise backward-state obstruction

Let `S55` be *any* purported secret state used to encode p55. For the **authenticated, complete p56 rule above**, its observable 85-rune output is `E56(P56, public-primes-starting-at-2, literal-F-at-56)`, which has **no S55 argument**. p57 outputs its plaintext directly, also without an S55 argument. Consequently the same authentic 180 known suffix runes occur for every possible value of `S55`: there is no p55-state identifiability from this known suffix under these historical rules. In statistical notation, conditional on the authentic p56/p57 algorithms and known plaintext, the suffix carries zero information about an independently unknown preceding state.

This is sharper than testing arbitrary backward prime starts: p56 is fixed to the very first ordinary prime, so the authentic p56 prime counter has **no preceding positive-prime states at all**. A hidden cross-regime coupler could theoretically exist, but it would require an *additional* source-defined operator, reset mask or branch not present in the verified p56 decoder. No such operator is selected by the p55 red terminal punctuation, the solved p56 title and hash, the five-dot drawing, the p57 PARABLE wording, or their shared source layout.

## Stronger all-map, arbitrary-skip prime-clock obstruction (Agent8, 24 November; #2471)

The previous public-reset conclusion assumes the established p56 prime rule. The known plaintext/ciphertext pairs actually force a stronger result even if the initial prime index, direction, fixed residue-to-shift map, and any number of skipped primes are all unknown.

Let an emitted non-F rune obey (C_i=P_i+f(p_{j_i}\bmod29)\pmod{29}), where (f) is **any fixed function** from 29 residues to 29 shifts (not necessarily assumed injective), and the selected prime indices (j_i) are strictly monotone, allowing arbitrarily many omissions but no reuse, wrap or reset. Literal F may bypass the prime clock, as in the known p56 control. The function on p55 need not equal the p56 function: only the monotonicity of the shared prime counter across the boundary is required.

The 84 consuming original p56 pairs exhibit **all 29 distinct shifts**, with multiplicities in shift order 0–28:

```
3 5 4 1 3 2 3 3 2 2 3 4 3 2 3 2 3 3 4 4 3 3 4 3 5 2 2 2 1
```

Surjectivity forces (f) to be bijective. The residue 0 occurs for only one ordinary prime, 29; consequently its image must be a shift occurring exactly once. There are just two candidates:

| Singleton shift | Original zero-based p56 rune position | Earlier consumed primes within p56 | Later consumed primes within p56 |
|---:|---:|---:|---:|
| 28 | 9 | 9 | 74 |
| 3 | 34 | 34 | 49 |

There are exactly nine primes below 29. An increasing clock cannot place prime29 at the second candidate (34 required earlier primes). At the first candidate, **all nine smaller primes are already consumed inside p56**, forcing the ten-prime prefix 2,3,5,7,11,13,17,19,23,29 with no omissions and leaving **zero** available earlier prime consumptions. A decreasing clock cannot use either candidate, since 74 or 49 later consumptions would each require more than nine smaller primes. This excludes every strictly monotone prime-selection schedule across the seam even under arbitrary fixed secret residue relabeling and unbounded skipping. The original p55 contains 73 non-F ciphertext runes out of 76, so any authentic-F-style p55 branch consumes at least 73 primes. Even one pre-boundary consumption is impossible.

The forced prefix determines ten entries of the arbitrary p56 map; the remaining nineteen entries cannot be selected by the anchor alone. If unbounded skipping is permitted, Dirichlet's theorem guarantees that every permutation extending the forced ten entries can realize the subsequent nonzero residue demands in increasing order. Thus arbitrary-skip flexibility does not restore backwards continuity or uniquely determine the post-anchor schedule. A new independently sourced reset/coupling, nonmonotone or prime-reusing state law would be required.

**Reproduction and positive control:** [standalone original-corpus CommonJS SFT](../sims/lp2_p56_full_residue_monotone_endpoint_sft.cjs), executed with the exact repository corpus in the isolated JavaScript runtime. Genuine p56 85/85 replay passes. A planted noncanonical fixed residue map (f(r)=7r+4\bmod29) uses four hidden prime-consuming prefix runes from authentic clear p57 and a 475-rune known suffix comprising five repetitions of that page. The known suffix has 460 consuming runes and selects its unique feasible prime29 anchor at consuming position5 (shift4). Given the four required preceding consumptions, the recovered prefix clock is exactly primes 2,3,5,7; with the planted map supplied to the inverse, all four hidden plaintext runes recover exactly. This tests clock identification rather than recovery of an arbitrary unknown map.

**Decision for #2471:** no continuous backward ordinary-prime clock from the known p56 endpoint, even after arbitrary residue relabeling and skipping. This is an exact original-input exclusion, not a new unknown-page decryption. A p55 state unrelated to the monotone prime clock remains underdetermined; the source does not select an alternate invertible endpoint transition.

## Research decision

**Close #1464 at its negative source-selector gate.** On the available first-party image and known-algorithm evidence, there is no executable reversible p56/p57→p55 state transfer to freeze or test. The source-authentic p56 and p57 suffix cannot itself identify a p55 key/state, so there is no eligible complete 76-rune decoder to hand to waiting issue #41.

**What would change this:** an independently authenticated original Cicada clue specifying how a prior key/state enters p56 **without changing any of the 85 established ciphertext/plaintext pairs**, plus a complete p55 reverse rule and a held-out original prediction. The above argument excludes only recovery **from the documented public suffix transitions**, and makes no universal claim about lost external instructions, separately enciphered pages or unknown alternate cryptosystems.
