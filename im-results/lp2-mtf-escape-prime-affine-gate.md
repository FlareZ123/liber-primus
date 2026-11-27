# Repeat-signaled plaintext MTF rank / prime-affine inverse (#3208)

**Agent46, 27 November 2026.** A lossless two-branch sender which achieves exactly the original repeat *counts* on real native GP controls, with fully identifiable keys and frozen continuation. The original fails exact finite-donor repeat-mask and all-secret rank-concentration gates. No recovered unknown plaintext or authentic key.

## Distinct architecture and source status

Earlier [fixed rune escape](lp2-fixed-escape-repeat-site-native-language-gate.md), [plaintext-predecessor escape](lp2-plainprev-adaptive-repeat-escape-gate.md), [ciphertext-recency/Atbash escape](lp2-recency-prime-atbash-escape.md), [ordinary MTF around prime-F clock](lp2-mtf-native-prime-fhold.md), retry and V-NULL receivers do not test this plaintext-history rank law. The independent historical ingredients are standard move-to-front from the 2014 bzip2 stage and the authentic prime-minus-one clock. The original repeat scarcity motivates the explicit branch. The 23-dot terminal mark supplies a candidate rank number, but does not authenticate zero-based rank23 or the composition. No source-selected opcode is claimed.

Initialize a plaintext list A=[0,...,28], public preceding ciphertext Cprev=0 and prime ordinal origin t. Process all 12,956 runes continuously, including every printed boundary. A plaintext symbol P has current rank j in A. Set fixed exception rank e=23:

- j=e: emit C=Cprev and leave t unchanged.
- j!=e: let r=j-[j>e], choose a unit a modulo28 and b modulo28, emit C=Cprev+1+((a*r+b+prime[t]-1) mod28) modulo29; advance t.
- In both branches move P to the front of A, update Cprev=C.

The receiver observes D=(C-Cprev) mod29. D=0 uniquely selects j=e. Otherwise r=a^{-1}(D-1-b-(prime[t]-1)) mod28 and j=r+[r>=e]; advance t. Read P=A[j], perform the same list update. This is a bijective causal transducer on every 29-symbol input for every key, including F. F is not separately special here: the rank-e branch is only analogous to historical nonconsuming F. No concealed exception mask, retries, sidecar or removed glyphs. The state depends on the complete plaintext recency ordering, not just Pprev or Cprev. The 23rd ordinal is fixed before original fit; stronger bounds below grant all 29 possible exceptions.

## Key-independent repeat-mask condition

Once a particular plaintext glyph has occurred in a candidate contiguous passage, its MTF rank at every subsequent occurrence is exactly the number of distinct intervening glyphs. Initial list order affects at most one occurrence of each label, at most 29 positions. Therefore every non-first occurrence at an original repeated-C position must have the same intrinsic rank e, and no intrinsic occurrence of e may appear at a nonrepeat position. The 86 original events exceed the 29 freely granted first occurrences, so the event mask determines e if it is compatible at all.

Use the first 1600 lines each of the pinned repository Gibran, Emerson and Shakespeare sources, transliterated to GP29. Examine every contiguous 12,956-rune window, even granting arbitrary initial list order and every exception e. At first occurrences allow arbitrary ranks independently (a relaxation of realizable initial lists). Original event mask results:

| Native source | Full-length windows | All forced event ranks agree | Mask compatible |
|---|---:|---:|---:|
| Gibran | 12,070 | 0 | 0 |
| Emerson | 60,332 | 0 | 0 |
| Shakespeare | 17,925 | 0 | 0 |
| **Total** | **90,327** | **0** | **0** |

All original windows fail even before checking nonrepeat sites. This exact finite-source rejection applies to *any* nonrepeat rank-bijection schedule, not just the prime-affine key, and any fixed exception rank. It does not exclude new prose, moving exception ranks, changed representation, noncontinuous framing, or all natural language.

## Exact all-key rank-concentration bound

For every prime origin 0..3301, remove the prime-minus-one shifts from the observed nonzero successor ranks using the public nonrepeat cursor. The resulting histogram plus the actual repeat count is merely relabelled by any shared arbitrary 28! rank permutation and any exception e. Hence its top-k sum is independent of that unknown key and of the initial plaintext list. Native MTF rank concentration floors across all contiguous donor windows are valid for arbitrary initialization by subtracting 29 from the intrinsic histogram's top-k sum.

| Scope | Original maximum top5 across all origins | Lowest native top5 after initialization relaxation | Original maximum top10 | Lowest native top10 |
|---|---:|---:|---:|---:|
| p0–39, 9640 runes | 1,924 | 2,747 | 3,716 | 5,305 |
| p0–55, 12956 runes | 2,550 | 3,713 | 4,952 | 7,159 |

The training bounds compare 100,275 reference windows; the full bounds compare 90,327. Thus the original falls outside every shared static rank permutation (including affine), any exception rank and any initial list for all 3302 candidate prime origins in the finite native reference. No printed word assumption enters either gate. The rank-count floor is finite-donor evidence; it is not a universal bound on English or arbitrary stateful ciphers.

## Blind key identification and predictive original inverse

Under the finite affine class, histogram-score all 3302 prime origins × 12 units × 28 offsets = **1,109,472** keys. Use the MTF-rank unigram distribution estimated on the first 10,000 Gibran GP runes with 0.5 smoothing. Fit solely p0–39 (9,640 runes, 65 actual repeat events) and freeze the single winner. Carry the state continuously to p40–55 (3,316 runes, 21 events). A separate GP bigram likelihood, never used in key selection, scores the decoded plaintext.

Select the first contiguous native window in each reference satisfying precisely the same 65/21 rank23 event counts, without matching locations or editing plaintext. Gibran selection starts at offset10000 to exclude training. These windows are offsets11323,49648,8723; their repeat events arise from the rank law itself. Apply three distinct concealed keys. Rival: same Emerson window and exactly the same naturally generated mask, with an independent random rank pad instead of the prime-affine stream. Thus the rival has identical frame geometry and suppression profile.

| Input | Best (prime origin,a,b) | Fit rank nats/rune | Held rank nats/rune | Held GP nats/rune | Held IoC | Exact held runes |
|---|---|---:|---:|---:|---:|---:|
| Gibran | (237,5,11) true | -3.111900 | -3.107508 | -2.565521 | .058702 | 3316/3316 |
| Emerson | (1419,3,16) true | -3.135549 | -3.123427 | -2.677878 | .061231 | 3316/3316 |
| Shakespeare | (3200,27,6) true | -3.114521 | -3.101889 | -2.674156 | .060281 | 3316/3316 |
| Same-mask random-pad rival | (832,27,10) | -3.909666 | -3.958920 | -4.269516 | .034332 | 121/3316 |
| Original | (2309,3,10) | -3.911725 | -3.980272 | -4.296768 | .034508 | none authenticated |

All three native hidden keys are unique global training optima, with 9640/9640 training runes and **9948/9948 total held runes** recovered. Train runner gaps 507.675, 502.767, 433.460 total log units; original gap11.801. Original frozen continuation begins with tokens `C E OE OE Y S D X A G EA G F IA O U D NG B EA G P TH AE`, nonprose. Every candidate replays all 12,956 cipher runes exactly; replay alone is not evidence. The actual solved-native p57 95 runes also roundtrip under this transducer.

Given an aligned plaintext, the exact event mask identifies e, then for each origin and unit a one nonrepeat pair fixes b. Enumerate the remaining 39,624 origin/unit choices with exact equality. Each plant has precisely its true key; the matched-mask random-pad rival has zero. The mask-only donor alignment relaxation uniquely recovers the correct offset and e=23 in each plant's own donor, and also in the rival (as expected: the mask does not depend on the nonrepeat key). Thus the repeat-mask condition and rank-key inference discriminate complementary parts of the sender.

## Decision

Close #3208 for this distinct fixed-recency-rank escape architecture. Exact finite-donor mask exclusion survives arbitrary changing rank maps; the independent concentration bound excludes any static rank map within the specified prime clock and finite native register. Blind complete affine-key recovery passes all three exactly suppression-matched controls, yet the original remains indistinguishable in plaintext score from the same-mask independent-pad rival. No new authenticated key, plaintext or side information. Do not expand the prime-origin range or fit alternate recency laws without new independent source evidence. The original repeat mechanism remains unresolved.

[Reproducer](../sims/agent46_lp2_mtf_escape_prime_affine_sft.cjs) · [observed metrics](lp2-mtf-escape-prime-affine-output.json). Core actually executed in connected V8 against source corpus and reference files, 5.0–7.2 seconds per full case; standalone Node/CI not independently executed.
