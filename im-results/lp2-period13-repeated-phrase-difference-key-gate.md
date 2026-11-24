# Repeated native passage difference-key attack — LP2 p23–26 vs p54–55

**Decision (2026-11-24, Agent6, #2545):** The period-13 plaintext-F-hold model with independently keyed repeated passages has no discriminating original alignment in the two remaining collision-compatible chapter scopes. An exact all-start scan gives maximum 16 active runes, versus 16–17 under twelve independent within-scope shuffles. No absolute key, unknown plaintext, or withheld continuation is recovered. Retire this specific cross-chapter long-repeat route, not either chapter's standalone key model.

## Mechanism and exact necessary/sufficient local constraint

For nonzero plaintext (P), (C_A=P+K_A[j]), (C_B=P+K_B[j]) modulo 29; the relative active clock advances in both. A plaintext F emits zero on both sides and holds both clocks. Absorb the two unknown initial phases into independently rotated keys. Thus each ordinary step fixes (D[j]=(C_A-C_B)\bmod29) and forbids (K_A[j]=C_A), since that would make plaintext zero on an ordinary step. The other key is (K_B[j]=K_A[j]-D[j]). At a double-zero pair, branch into both ordinary and transparent-hold possibilities; all other pairs must advance. Recursively intersect constraints and reject when a difference is inconsistent or all 29 choices at some phase are forbidden. Every surviving local path admits at least one pair of periodic keys and a shared local plaintext. No word-alignment or printed punctuation assumption is needed; all rune starts are allowed. Equal plaintext under this exact model cannot evade this test at any start.

The known LP1 second-KOAN period 13 fixes the single tested period; Director memory and #2521 retain p23–26 and p54–55 under relaxed period-13 collision screening. Neither arbitrary other periods nor cross-chapter state fitting is tested. The two full physical chapter ranges (1,021 and 308 runes) include their headings, making this search more permissive than a body-only attack. Threshold: 21 ordinary steps, eight constraints beyond the first period. Under independent uniform ciphertext pairs a union bound over all 314,468 starting pairs and all hold placements through the 21st active step is (314468\,29^{-8}(1-1/841)^{-21}) = 6.445304e-7. This iid bound is descriptive only; real ciphertext is not established to be iid.

## Executed original-input and native controls

Source: canonical `resources/liber-primus/lp2-corpus.json`; native `resources/external/relikd-solved-gp29-native-v1.json`. The authentic repeated native GP passage is the longest non-overlapping repeat of the first solved KOAN: 42 runes at offsets 62 and 419. Another actual repeat of 22 runes occurs in LOSS OF DIVINITY at 215 and 343. These are actual native texts, but the independent periodic encryptions are controlled plants, not historical ciphertexts.

Six independent random period-13 key pairs and independently sampled start phases were applied to the two native KOAN intervals with 30-rune flanks. In all six, the full 42-rune alignment was the maximum, with correct location (30,30) and all 13 relative key differences exactly recovered. Each had 22 qualifying starts, all within the same long repeat. The 42-rune native repeat contains no F, so an additional WELCOME-derived 65-rune plant deliberately contains three transparent Fs and one simultaneous generated ciphertext F. The explicit correct difference path was checked in the connected runtime; the extended SFT also tests search completeness on that plant. No claim of a historical period-13 encryption of the first KOAN is made.

| Scope | Maximum active alignment | Starts reaching 21 |
|---|---:|---:|
| Original p23–26 vs p54–55 | 16 | 0 |
| Twelve independently shuffled matched-marginal pairs | 16,16,16,16,16,16,17,17,17,17,17,17 | 0 |

Original scan: 314,468 possible start pairs, 4,196,377 recursive states, maximum at chapter-relative offsets 193 and 161 (zero-based). Its difference vector is `[20,16,11,11,16,28,25,25,15,21,9,17,11]`. The weak maximum is ordinary in shuffled controls. It does not constrain a credible real key or establish shared plaintext.

## Absolute-key limit and next decision

Even a long true repeated alignment identifies relative shifts, not absolute shifts. Given a fixed path, the count of locally legal key pairs is the product across phases of 29 minus the number of distinct ordinary ciphertext-A values at that phase. A source or language constraint would still be necessary to pick an absolute key and predict an independent continuation. The original scan supplies no credible alignment on which to perform that second step. Fitting a language model to a null-level 16-rune alignment would be unmotivated.

Do not expand this to period sweeps, arbitrary nonperiodic keys, chapter-private rank maps, or illustration-driven cribs. Short common phrases and repeated plaintext encrypted under a different clock remain possible.

Reproduction: [read-only CommonJS SFT](../sims/lp2_repeated_phrase_fhold_difference_sft.cjs), seed `0x2545a006`. The principal experiment was executed directly in the connected JS runtime; no Actions run is asserted. [Director decision #2545](https://github.com/FlareZ123/liber-primus/issues/2545).
