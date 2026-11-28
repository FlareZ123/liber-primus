# 2014 whitespace channel reconstructs the p56 clue chain; A194954 itself is not an LP2 running key

**Agent1, 27 November 2026. Historical clue recovery + bounded original-cipher exclusion.**

## New source constraint recovered from the period handoff

The earliest public solver snapshot that acquired the seventh 2014 onion is commit `6c3421a4d245596e403c88e037509d162a2afd17` (11 May 2014 18:33:43Z) in `micheloosterhof/cicada-2014`. It adds exactly the 58 release JPEGs, `index.html`, and `stage11/message.txt.asc`; the later `56.bin` and decoding files are solver products, not additional server siblings.

Two days later the solver repository commit `5431b03eacf15d27c5f02eae860efcfdb7f1917b` is literally titled **"preserve spaces"** and restores the whitespace carrier in that signed message. Reading the nontrivial runs in order, including the five-space indentation before the onion hostname, gives:

`2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37`.

That is exactly the first eleven terms of **OEIS A194954**, a prime sequence defined before Cicada 2014. More importantly for the actual solve path, it is conspicuously the ordinary prime sequence with **19 missing** at the first divergence.

Archived 13 May 2014 solver discussion independently records the intended human observation: the missing 19 prompted the prime shift. The already-solved Wisdom page supplies the other half of the instruction: **THE PRIMES ARE SACRED / THE TOTIENT FUNCTION IS SACRED**.

**Independent two-participant exact-MD5 authentication of the whitespace channel (28 November 2026).** The first extant May 2014 solver snapshot alone did not establish which unsigned whitespace variant was actually delivered. The [2 May 2014 original IRC transcript](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%23cicadasolvers.freenode.log#L163711-L163712) now supplies a contemporaneous raw-byte check: `brotherBox` published MD5 `6808ed6409c243aacfe8a0f077dba606` for the uploaded signed message, and `ICU` confirmed the same hash for their own delivered copy. It **exactly** matches the locally preserved 1,183-byte `resources/historical/cicada2014-stage11-message.asc`, whose runs include the 11-number sequence above. The *different* archive `neuroretransmit/cicada/2014/010-hidden-service-reply/message.txt.asc` is 1,182 bytes and has MD5 `bca5eeebc68b7945dee16c55255d3b6a`: unsigned whitespace differences (extra empty-line spaces, one fewer trail after the address and farewell, terminal LF). This provides independent **May 2 player-observed attestation of the exact clue-bearing version**, not merely a May13 archival restoration. It supports the source-visible missing-prime selector on the historically delivered object; it does **not** authenticate any particular interpretation of the unsigned runs, demonstrate personalized secrets, or identify a key for p0–55. [Exact source script](../sims/lp2_2014_callback_independent_participant_md5_sft.cjs) · [full historical delivery comparison](cicada2014-stage10-to-stage11-original-operator-gate.md#independent-signaturewhitespace-audit-agent5-2026-11-23).

The historical p56 decoder then makes the clue chain explicit:

`P_i = C_i - (prime_i - 1) mod 29 = C_i - phi(prime_i) mod 29`

with one literal interrupter at rune index 56 that does not consume a prime. This reproduces **AN END / WITHIN THE DEEP WEB ...**.

This is a useful creator-design fact: a deliberately malformed familiar sequence can carry the missing operand, and outer handoff whitespace is cryptographic material. The local repository previously had the historical p56 decoder but did not index A194954 or the preserved-space handoff as a source-selected clue.

## Decisive follow-up: is A194954 itself the hidden LP2 prime family?

Because the whitespace exactly selects A194954, the cheapest non-arbitrary test is whether its own terms, rather than ordinary primes, form a running phi stream elsewhere in LP2.

Frozen family:

- sequence: exact A194954 recurrence, no fitted terms;
- key: `phi(p)=p-1 mod 29`, source-selected by Wisdom;
- directions: subtract (historical) and add control;
- state conventions: continuous chapter, page reset, and whole-book global;
- interrupter convention: all-rune consumption or literal ciphertext-F hold;
- chapter boundaries: the canonical nine LP2 section groups;
- score: solved-LP GP29 trigram model; no key/phase/plaintext fitting.

Positive control on the 85 p56 ciphertext runes:

| stream | mean solved-LP trigram log score | result |
|---|---:|---|
| ordinary primes, historical phi | **-1.7931** | exact readable p56 plaintext |
| A194954, same phi/skip | **-5.5838** | noise |

Across the unsolved p0-55 corpus, every frozen A194954 convention remains in the noise regime. The best section is p54-55 under add/F-hold at **-5.4344**, with visibly nonlinguistic output. No section approaches the positive-control regime.

## Original LP2 omission transfer gate (#3270, Agent25, 28 November 2026)

The authentic 2014 whitespace carrier supplies a recognizable ordered prime prefix and the historical solver identifies its first divergence. For an analogous original-manuscript transfer, the expected enumeration must be independently recognizable before any missing value or receiver is chosen. I inspected contact sheets generated directly from the maintainer-provided original 58 LP2 JPEGs (17.jpg–74.jpg), then compared the strongest literal enumerations with the existing source records:

| Original observable | Independently visible order | Omission decision |
| --- | --- | --- |
| Physical p36–38 (53–55.jpg), red item numerals | 1, 2, 3, 4, 5; item4 continues across a physical seam | Complete ordinary integer prefix. The following unnumbered material has no independently stated total of six or seven items. |
| Physical p8–14 (25–31.jpg), side saplings | L,R,L,R,L,R,L | Complete alternation. No missing phase; the previous [pixel comparison](lp2-p8-14-tree-stencil-source-gate.md) already rejects a distinct mirrored graphic at alternating positions. |
| Stage11 original delivery index | Explicit 0.jpg through 57.jpg, in order | Complete interval; all 58 scans are present. |
| Physical p33–39 recurrent cuneiform panel | Repeated same numeric emblem across its visible section, beginning below p33's second headed text | No consecutive numeral progression is authored in these repeated marks; absence of a different value cannot specify a missing term. |

The literal inline Arabic 7 on p10 is outside the p36–38 list, neither an item label nor an ordered list member. Juxtaposing the separate 1–5 sequence and 7 would invent the premise that 6 is missing; their separate source contexts supply no shared enumeration. The earlier [#2639](https://github.com/FlareZ123/liber-primus/issues/2639) fixed the actual p10 grammar and found no typed receiver. The solved p57 apparent TUNNELNG omission is also a false analogy: the primary GP chart uses one NG/ING grapheme, as established in [#2132](https://github.com/FlareZ123/liber-primus/issues/2132). This is not a missing I. The p15 Fibonacci spiral and p50 absent alphabet character were explicitly out of scope. I did not count arbitrary absent integers/runes, reinterpret images as ordinal labels, or score ciphertext.

The first three rows are recognizable sequential objects and therefore the best positive controls for the proposed design convention. None has an internal gap. No independent finite expectation supplies a missing ordinal in a new original LP2 object, and no typed operation/receiving interval is selected. The alternative conjecture that a missing item lies in the *unknown plaintext* is not a source-visible clue and cannot be tested before decryption.

**Decision:** close #3270 at the source gate. Retain the historically established whitespace/prime divergence as a design lesson, but do not commission another generalized missing-value search. Reopen only for an independently identified period enumeration with a specified absent item and an explicit original recipient. No cipher fit, new key or plaintext.

## Decision

**Reject A194954 as a direct phi running-key family for LP2 under the authentic simple state conventions.** Do not expand this into offsets, affine wrappers, or arbitrary sequence transforms: that would abandon the clue-selected operation.

Preserve the actual historical lesson instead: Cicada deliberately used a missing term in a prime-looking whitespace sequence to select the p56 ordinary-prime/totient operation. Future "missing term" work should require an independently visible almost-sequence in an original artifact before applying a repair/key rule.

Reproducer: `sims/lp2_2014_whitespace_A194954_phi_sft.cjs`.
