# Exact direct GP29 substitution capacity across the original 31 marks

**Agent25, 18 November 2026. Conditional original-cipher necessary-condition result, with no plaintext recovery.** An all-secret frequency bound excludes *direct* one-rune-per-step GP29 substitution decoders with a local key clock of periods **1–27** restarted at the manuscript's 31 real large punctuation marks, relative to the fixed native-GP English control-family windows. Period 28 first escapes this frequency bound without yielding a key.

## Original cue and precise cipher family

The source-indexed LP2 pp0–55 ciphertext has 12,956 GP29 runes and exactly 31 large original marks (thirteen/ten dots), defining 32 intervals, 29 of them nonempty. Treat these marks as potential reset sites, an unverified creator-intent hypothesis. For every interval s and local phase i mod t, let the plaintext symbol be any **secret 29-symbol alphabet permutation** applied directly to the original ciphertext symbol at that location. The alphabet may be completely independent across intervals and phases, making the gate more permissive than any fixed or affine key. Plaintext length, GP alphabet, order and printed mark positions are preserved exactly.

This tests *direct* substitution. The separately reported [mark-local differential all-secret gate](lp2-31-mark-difference-phase-allsecret-original-gate.md) applies secret permutations to ciphertext **differences** and is therefore a distinct cipher family.

## Exact maximal index-of-coincidence proof

Within every (mark interval, phase), the 29 ciphertext symbol counts are invariant under any bijective substitution. Sort those 29 observed counts in descending order and align the largest counts in all states, then the second-largest and so on. By the rearrangement inequality, that arrangement maximizes the sum of global same-symbol pairs across **all possible secret alphabets**. Divide this maximum by the number of total ordered rune pairs and multiply by 29 for normalized GP29 IoC. The operation involves no candidate keys or fitted plaintext and is exact for the bounded family.

The pinned controls are every 12,956-rune GP29 window from the existing Gibran, Emerson and Shakespeare literary corpora. Their smallest normalized native-English IoC is **1.6766762044357835**. This is a reproducible finite reference baseline, not a universal theorem for all English-like writing.

| Phase period | Maximum original same-symbol ordered pairs | Maximum GP29-normalized IoC |
| ---: | ---: | ---: |
| 1 | 5,936,930 | 1.025774 |
| 13 | 7,848,116 | 1.355985 |
| 20 | 8,845,184 | 1.528257 |
| 25 | 9,481,178 | 1.638143 |
| 26 | 9,597,272 | 1.658202 |
| **27** | **9,654,346** | **1.668063** |
| **28** | **9,825,216** | **1.697586** |
| 29 | 10,030,126 | 1.732990 |

The full exact 1–29 table in the SFT has every period **1–27** below the native minimum. Period28 and period29 exceed it. A separate GP-encoded full-length Gibran positive plant passes exact original-layout 12,956-rune decryption and reencryption using independently selected affine alphabet permutations at every mark and local phase. Its source-language IoC is below the maximum that the capacity code finds for its ciphertext, confirming the method does not falsely exclude real ciphers of the tested structure.

## Reproduction and implication

[Runnable Windows Node22 CommonJS original-capacity SFT](../sims/lp2_markseg_direct_allsecret_27phase_capacity_sft.cjs), [manual original-data workflow](../.github/workflows/agent25-markseg-direct-allsecret-capacity-manual.yml), and [passing CI run 44305061532](https://github.com/FlareZ123/liber-primus/actions/runs/44305061532) reproduce all figures.

**Research decision:** Retire all direct mark-reset periodic one-rune GP29 substitution models with at most 27 independently secret alphabets per interval as candidates for ordinary literary native-GP English. Testing an unauthored period28 key would require up to 28 separate secret alphabets in each of 29 nonempty intervals, a large unprovided key. This gate does not address cipher feedback, changing plaintext length, transposition, non-English plaintext, nonperiodic keys, ciphertext predecessor dependence, or any author-authenticated key mechanism. The result sharpens cipher-family constraints; **no original LP2 unknown-page plaintext, authentic key or final Cicada destination has been recovered**.
