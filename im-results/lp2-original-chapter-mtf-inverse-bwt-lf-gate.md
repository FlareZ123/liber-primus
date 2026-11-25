# Exact original-image chapter MTF-inverse → circular-BWT LF gate

**Agent19 · Director Issue #2719 · 25 November 2026.** Exact source-structural rejection of the frozen standard MTF→BWT outer representation; no unknown plaintext or key recovered.

## Decision

Interpret each original GP29 ciphertext value as a standard move-to-front rank, decode it using the initial list [0..28] and move-to-front update, resetting independently at the nine original-image chapter starts. Treat each decoded chapter tape as a candidate circular-BWT last column.

**All nine exact visual chapters fail** the necessary LF-cycle condition. Every candidate has unequal LF cycle lengths. Therefore no chapter is eligible for a primary-row search, and the proposed p56 prime-minus-one/F-hold inner clock is not run on the original.

## Why this is a distinct exact test

The earlier report **im-results/lp2-raw-bwt-mtf-zero-run-original-gate.md** already tested MTF inversion followed by BWT legality, but its legacy nine-section partition used rune cuts [0,3,8,15,23,28,33,40,54,56]. That splits p23–27 and p28–32. The original-image map instead establishes p23–26 and p27–32. The earlier 0/9 result is valid for its legacy partition, not for the exact visual chapter reset required here. The earlier report is corrected in the same commit as this exact-boundary result. Its bzip2 zero-run extension remains a legacy-partition test and is not promoted to a corrected chapter result.

## Frozen operation and legality condition

For each chapter, start with the ordered GP29 list [0,1,...,28]. For every input rank r, output the current list entry at position r, remove it, and move it to the front. The output is the proposed BWT last column L. There is no guessed alphabet permutation, reverse orientation, move-to-back variant, RLE, or secret rank relabeling.

For stable LF mapping,

    LF(i) = C[L[i]] + rank(L[i], i)

where C counts symbols strictly smaller than L[i] and rank counts earlier occurrences of L[i].

A primitive cyclic BWT input requires one LF cycle of length N. A periodic input may have multiple LF cycles, but every cycle must have the same length as the primitive period. Equal cycle lengths alone are insufficient: inverse from row zero must also forward-transform to the exact same complete last column. The test implements both conditions, so periodic degeneracy is not treated as an automatic rejection.

## Original results

| Original visual chapter | Runic length | Sorted LF cycle lengths | Valid BWT last column |
|---|---:|---|---|
| p0–2 | 729 | 2, 34, 331, 362 | No |
| p3–7 | 1,145 | 1, 2, 35, 60, 82, 187, 191, 587 | No |
| p8–14 | 1,729 | 1, 2, 4, 5, 9, 29, 33, 716, 930 | No |
| p15–22 | 1,903 | 1, 1, 1, 9, 19, 45, 56, 1771 | No |
| p23–26 | 1,021 | 1, 1, 2, 3, 11, 30, 32, 33, 50, 51, 93, 93, 218, 403 | No |
| p27–32 | 1,433 | 1, 8, 167, 267, 409, 581 | No |
| p33–39 | 1,680 | 1, 3, 13, 15, 21, 29, 45, 47, 98, 119, 177, 407, 705 | No |
| p40–53 | 3,008 | 1, 1, 1, 1, 1, 1, 15, 157, 577, 2253 | No |
| p54–55 | 308 | 1, 1, 1, 1, 2, 46, 71, 185 | No |

All nine MTF inverses re-encode exactly to their original rank tapes. The failure is not an MTF implementation or round-trip error: the resulting candidate last columns have unequal LF cycles. No choice of primary row can change those cycles.

## Native positive controls

The control pipeline is deliberately ordered as requested:

**native GP plaintext → authentic p56 prime-minus-one/F-hold cipher → cyclic BWT → standard MTF rank encoding.**

The inverse test then performs MTF rank decoding, LF validation and BWT inversion. The p56 cipher uses consecutive primes beginning at 2, adds prime−1 modulo 29, and treats plaintext F as transparent without advancing the key clock. Re-encrypting the known p56 plaintext reproduces its original ciphertext **85/85**.

Nine independently sourced solved-GP sections pass the complete control pipeline:

| Native control | Runes | LF cycles after MTF inversion | Exact inverse and replay |
|---|---:|---|---|
| 0_warning | 184 | 184 | Yes |
| 0_welcome | 515 | 515 | Yes |
| 0_wisdom | 157 | 157 | Yes |
| 0_koan_1 | 780 | 780 | Yes |
| 0_loss_of_divinity | 755 | 755 | Yes |
| jpg107-167 | 319 | 319 | Yes |
| jpg229 | 89 | 89 | Yes |
| p56_an_end | 85 | 85 | Yes |
| p57_parable | 95 | 95 | Yes |

Four additional small primitive/periodic BWT controls pass. In particular, periodic inputs with two cycles of length 2, three cycles of length 1, and two cycles of length 3 are accepted after exact forward-BWT replay. This verifies that the gate does not incorrectly require a single LF cycle for periodic strings.

## Consequence and scope

Retire this exact outer representation:

- original rune values are standard MTF ranks;
- initial alphabet is canonical [0..28];
- standard move-to-front rank decoding;
- resets at the nine source-visible chapter boundaries;
- decoded output is one complete cyclic-BWT last column per chapter.

Since no original chapter passes the outer legality gate, there is no justified primary-row enumeration and no p56 inner-key search. The test does not reject a complete framed bzip2 packet, RLE1/RLE2, a different alphabet or reset, BWT before MTF rather than after it, or a separately source-selected representation. Those require their own independently motivated evidence.

## Reproduction

Run **node sims/lp2_original_chapter_mtf_inverse_bwt_lf_gate_sft.cjs**. It reads the canonical LP2 corpus and pinned solved-GP native control corpus, asserts all nine original chapter cycle lists, the authentic p56 85/85 cipher replay, nine end-to-end BWT→MTF positive controls, and periodic LF controls. The same computation was executed against the connected repository sources in the JavaScript runtime; no CI execution is claimed.
