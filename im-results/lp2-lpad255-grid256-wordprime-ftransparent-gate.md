# LPAD scrollwork × 256-table: word-start prime-clock inverse

**18 November 2026, Agent 3. Classification: bounded original-input negative; no unknown plaintext, authentic key or destination recovered.**

## Candidate route to actual text

LP2 physical p3–7 contain four independently source-observed red-span initials **L P A D** (see [original-image red-initial gate](../workplace/lp2-p3to7-red-initial-lpad-readout.md)). These five pages contain **exactly 255 whole printed rune words / 1,145 GP29 runes** when source line and page continuations are joined. The physical p49–51 grid prints **exactly 256 two-character base60 cells**, each already represented as one source-derived byte.

The numerical match suggests a low-description-length, testable receiver: let each of the 255 words take a different one-byte table entry as a prime-clock *starting index*. Its own GP29 rune symbols then decrypt using the **already established p56 prime-totient rule**, with the clock restarting at the beginning of the next word. A prime starting index from 0 to 255, with at most 12 runes in a word, needs only the first 267 primes; no secret key table or fitted phase is involved. An original author instruction choosing **LPAD width 13**, this 255:256 correspondence, or these particular bytes as *prime indices* has **not** been found. The route is an explicitly speculative finite experiment.

## Exact inverse and controls

Use all 255 unmodified source words `C_w` in printed order and table bytes `B[0..255]` in printed row-major order. Test the two source-natural one-byte alignments: word `w` starts at prime-sequence index `B[w]` (one unused final cell), or at `B[w+1]` (one unused first cell). For each alignment, test both decrypting signs, `-φ(p)` (as genuinely used on p56) and `+φ(p)`.

The **exact p56 plaintext-F rule** is modeled, including its ambiguity at ciphertext F. With `k` the word-local prime index:

- For each ciphertext rune **F** (GP index 0), either output plaintext F and leave `k` unchanged, or output non-F according to the chosen totient sign and increment `k`.
- For each ciphertext rune **non-F**, decrypt by the totient shift and increment `k` **only if plaintext is non-F**. A non-F ciphertext yielding plaintext F is impossible: in the verified p56 method, plaintext F would have appeared literally as ciphertext F.

A dynamic program retains every possible key index after each cipher rune; its state counts exhaust all literal-F choices. **Zero complete paths proves that a word cannot have arisen under the frozen candidate rule**, without requiring any English scorer or guessing which Fs are transparent.

The test first reproduces **all 85/85** originally solved p56 cipher runes from its independently established plaintext, with exactly the original unadvanced plaintext-F step at local offset 56. Its unrestricted inverse properly retains 22 possible final paths, including the established authentic one. It then synthesizes **255 original-length plaintext words per candidate variant** from independent genuinely clear p57 runes, encrypts them with the proposed word-local state and F transparency, and verifies that every planted word has a complete valid inverse. The planted control distinguishes a coding error or overrestrictive state rule from an original-cipher contradiction.

## Original source outcome

| Table alignment | Decrypt sign | Words admitting any exact inverse | **Words with zero exact inverse** | Words with multiple paths |
|---|---|---:|---:|---:|
| First 255 bytes | p56 sign (−) | 207 | **48** | 21 |
| First 255 bytes | reversed sign (+) | 216 | **39** | 18 |
| Last 255 bytes | p56 sign (−) | 218 | **37** | 18 |
| Last 255 bytes | reversed sign (+) | 221 | **34** | 19 |

The candidate is **mathematically impossible on all four locked choices**. Each has at least 34 wholly undecipherable original words. The simpler nontransparent variants are also nonlinguistic in full 1,145-rune output (GP29 index of coincidence 0.03434–0.03485, source input 0.03463). This statistical observation is secondary to the stronger exact no-path contradiction.

## Decision

The 255:256 visual alignment supplies a concrete, testable mathematical route; the full authentic p56 operator decisively excludes its four most direct no-free-parameter word-local prime-start uses. The result **does not reject** another table consumer, another external key, a changing-within-word operation, resegmentation, or any different interpretation of the unverified LPAD initials. Adding a tuned per-word offset or selectively disabling plaintext-F transparency would define a substantially different hypothesis without source support. Require an independent original instruction selecting that additional operation and a withheld original-plaintext prediction before pursuing it.

**Reproduction:** [single-file Windows-compatible CommonJS exact inverse and positive controls](../sims/lp2_lpad255_grid256_wordprime_ftransparent_sft.cjs), reading the original corpus, printed transcript and numeric grid without modifying them. The source-derived counts, all four exact original no-path totals, the solved p56 forward control and the synthetic plants are asserted in the file.
