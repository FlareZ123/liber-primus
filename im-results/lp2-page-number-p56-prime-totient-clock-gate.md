# Page-indexed p56 prime–totient starts and literal-F skips: bounded negatives

**Consolidated through 22 November 2026 (Agent34/Agent25). Classification: source-motivated original-cipher necessary-condition tests.** No unknown plaintext, key, or destination is recovered.

## Cipher constraint

The established p56 cipher uses the prime-totient stream beginning at prime 2 (zero-based ordinal 0), with plaintext F copied transparently and not consuming a key symbol. For a ciphertext rune \(C\ne F\), the inverse must not produce plaintext F: the forward encoder would have copied that F to ciphertext F instead.

The reproducer first re-encodes the established 85-rune p56 plaintext and reproduces its original ciphertext **85/85**, including its single literal F at local rune 56 and 84 consumed key symbols. It then checks all 55 nonempty original unknown pages p0–p55, excluding runeless p50, while retaining every possible transparent-F branch.

## Candidate A: physical page number as key phase

A simple cyclic extension is:

\[
\text{startOrdinal}(p)=p\bmod56.
\]

Known page p56 therefore starts at ordinal \(56\bmod56=0\), matching its established solution; each unknown page p0–p55 starts at its printed page number.

**Result: 53/55 pages fail.** Only p1 and p49 avoid a forbidden-F contradiction; that is not evidence of plaintext.

| Page | Start ordinal | First impossible rune (0-based) | Cipher rune/index | Key prime ordinal | Prime | Totient mod 29 | Forced plaintext |
|---:|---:|---:|---|---:|---:|---:|---|
| p0 | 0 | 235 | H / 8 | 231 | 1459 | 8 | F / 0 |
| p2 | 2 | 4 | T / 16 | 6 | 17 | 16 | F / 0 |
| p3 | 3 | 2 | EO / 12 | 5 | 13 | 12 | F / 0 |
| p7 | 7 | 15 | A / 24 | 22 | 83 | 24 | F / 0 |
| p10 | 10 | 3 | P / 13 | 13 | 43 | 13 | F / 0 |

For example, p3's third ciphertext rune has GP index 12; its key is \(\phi(13)=12\), forcing plaintext F from a non-F ciphertext. There is no ciphertext F in the prefix to provide a skip alternative. Because p0 is first in physical order, the same p0 contradiction at rune 235 also rejects a continuous physical-order p56 stream beginning at prime 2.

## Candidate B: p50 table byte addressed by physical page number

The p50 object is a 256-byte row-major table. A direct book-map reading is to let physical page p address table byte \(T[p]\), and interpret that byte as the zero-based prime ordinal at which the p56 key stream starts for page p.

This is distinct from the existing p49/p51 table-prime stream test (which consumes table bytes as successive key symbols) and from the p57 Josephus report (which assigns the first 55 table bytes by elimination rank).

**Result: 53/55 pages fail.** Only p12 and p55 avoid a forbidden-F contradiction; again, neither is a positive decryption.

| Page | Table byte / start ordinal | First impossible rune (0-based) | Cipher rune/index | Key prime ordinal | Prime | Totient mod 29 | Forced plaintext |
|---:|---:|---:|---|---:|---:|---:|---|
| p0 | 203 | 4 | G / 6 | 207 | 1283 | 6 | F / 0 |
| p39 | 5 | 24 | AE / 25 | 29 | 113 | 25 | F / 0 |

For p0, the first five ciphertext runes are SHEOG. The fifth rune G (index 6) is decrypted using \(\phi(1283)=1282\equiv6\pmod{29}\), again forcing plaintext F from non-F ciphertext.

## A distinct solved-p56 literal-F index hypothesis (Agent25, 22 November)

The authentic original p56 prime-totient solution has a particularly specific feature: of five original ciphertext **F** runes at zero-based local rune offsets **35, 47, 51, 56, 74**, the **sole** plaintext-literal, non-key-consuming F is at **offset 56**, exactly equal to the page's zero-based second-release ordinal **p56**. The other four ciphertext F runes are encrypted normally. The source JPEG filename is **73.jpg**, so “56” is a modern second-release positional count a player could reconstruct by counting, *not* an actual printed page number or an author-authenticated instruction. Its equality could be an accident.

Freeze this one entirely specified extension of the **known** successful p56 cipher: at zero-based rune index `i=physicalPageNumber`, if the original glyph is literal F/GP0, copy a plaintext F and **do not advance the prime key**; at every other position subtract `phi(prime[keyIndex])=(prime[keyIndex]-1) mod29` from the original GP29 ciphertext, starting independently from prime2 on each physical page. A non-F ciphertext decrypting to plaintext F is impossible under the authentic encoder's F-copy rule, which makes this a no-language-score **necessary-condition test**. Nothing is tuned per page. The full original p56 **85/85** rune plaintext is recovered exactly, including its unique skip at index56, so the candidate truly contains the solved positive.

Across the **55 original unsolved nonempty pages**, only **two** have an original ciphertext F at their own local rune index: **p27 at offset27** and **p48 at offset48**. The p56-known-page plus those two form the complete 3-page diagonal-F set. Both prospective unknown pages fail the same decoder decisively:

| Original page | Original runes | Fixed literal-F skip | First illegal non-F→plaintext-F position | Total illegal positions | Inverse GP29 IoC |
| --- | ---: | ---: | ---: | ---: | ---: |
| p27 | 234 | 27 | **50** | **5** | 0.0347749532 |
| p48 | 271 | 48 | **7** | **10** | 0.0334563346 |
| **p56, solved positive** | **85** | **56** | None | **0** | **0.0700280112** |

All **53 other unknown** rune-bearing pages have no page-index F skip and also contain at least one forbidden non-F→F under the frozen same-key rule. The whole 55-page unknown set therefore has **55/55** exact forward-encoder contradictions, despite the complete **85/85** independently known p56 positive. These exclusions are conditional on using the solved page's independently resetting prime2 key and the single special index rule. Another page key/start, other skip positions, a different cipher or nonliteral plaintext semantics escapes them.

The diagonal coincidence is not by itself cryptographically selective. Under the exact null that independently permutes GP29 rune positions within each of the **55 original unknown pages**, keeping their authentic per-page Fehu frequencies and rune counts fixed, the mean number of pages with F at their own page ordinal is **1.9229500273**; the exact Poisson-binomial probability of at least the observed **two** is **0.5778776501**. This null conditions on the independently *discovered known-p56 event* and does not pretend that the original author sampled a uniform cipher.

**Decision:** the unusually precise one-p56 match is a useful original-cipher **positive-control bridge**, but the page-index skip is an unsuccessful transfer, not a genuine manuscript decryptor. Neither the index coincidence nor its unsuccessful transfer supplies an unobserved key, source-guided operation or unknown plaintext. Preserve it as a test of this *particular* index-F rule and do not alter the key start or add arbitrary F skips to rescue the original unknowns. [Read-only exact original complete source CJS SFT](../sims/lp2_p56_pageindex_literalF_55page_source_sft.cjs).

## Decision and scope

The two fixed page-indexed **starting-key** schedules fail the p56 forward-cipher constraint on 53 of 55 nonempty unknown pages, and the separately page-indexed **literal-F skip** fails on **55/55** with its frozen prime2 start:

- physical page number modulo 56 as start ordinal;
- p50 table byte at the physical page index as start ordinal.

Do not continue with offsets around these schedules. The pages that avoid a forbidden F are only necessary-condition survivors, not recovered plaintext. This does not rule out the p56 cipher under a different, independently selected key schedule, nor does it rule out other roles for the p50 table.

**Reproduction:** node sims/lp2_page_number_p56_prime_totient_clock_gate.cjs (Node.js 22, no dependencies). It reads the canonical LP2 corpus, transcription, and p50 table; verifies the p56 known-answer encryption; and checks both schedules on every nonempty unknown page without language scoring or phase search.