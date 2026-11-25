# Clause-local reversal of allocated prime blocks: exact original-input exclusion

**Agent 7, 25 November 2026 — Director Issue [#2664](https://github.com/FlareZ123/liber-primus/issues/2664). Decision: reject the specified receiver.** Exact all-path support is empty in all nine physical chapters. No unknown plaintext or authentic key is recovered.

## Hypothesis tested

The source-known solved p56 mechanism supplies the operation and clock: subtract the consecutive prime-minus-one stream modulo 29, with literal plaintext F transparent and non-consuming. The candidate variation is a simple clause-local reading-order change:

For a clause with \(m\) consuming runes and incoming prime cursor \(j\), assign the allocated key block in reverse order,

\[
K_{j+m-1},K_{j+m-2},\ldots,K_j,\qquad
K_t=(p_t-1)\bmod29.
\]

The next clause begins at \(j+m\). The cursor advances continuously through clauses and resets only at the nine physical chapter openings: p0, p3, p8, p15, p23, p27, p33, p40 and p54. Only original full stops delimit the reversed blocks. Hyphens, paragraph/segment marks, line wraps and page turns do not reset the clock. All rune positions are retained, including leading red headings; the known p56 red AN END heading is itself part of the authentic prime-totient stream.

For ciphertext F, the exact inverse must branch between (a) literal plaintext F with no key consumption and (b) consuming the next key only when the resulting plaintext is non-F. Nonzero ciphertext runes must consume a key and cannot decode to F. This preserves every latent F-hold history, including ciphertext F values that are actually consumed.

## Exact inverse

The reversed allocation has a direct exact implementation: read each clause from right to left. Its rightmost consuming rune uses \(K_j\), the next uses \(K_{j+1}\), etc. At each reversed position maintain the set/count of consumed keys:

- if ciphertext is F, retain the hold branch;
- compute \(P=(C-K_{j+u})\bmod29\); retain the consuming branch only if \(P\ne F\);
- at clause end, join the exact next cursor \(j+u\) into the next clause.

The only state required between clauses is the prime cursor. Paths that reach the same cursor are future-equivalent, so merging their exact BigInt path counts is lossless. This enumerates every possible clause consumption count \(m\) and every visible-F hold placement; there is no beam, language model, key-origin search, or fitted parameter.

## Original source contract

Inputs are the canonical GP29 rune tape and the image-corrected transcription:

- resources/liber-primus/lp2-corpus.json
- resources/transcriptions/lp2-image-corrected.txt

The parser restores the omitted rune-free physical p50 grid when mapping transcription sections to physical pages. It asserts exact equality with all **12,956** original unsolved runes, all **173** corrected full stops, and the nine page ranges above. Each chapter ends at a full stop, so the 173 full-stop clauses are exactly the clauses tested. No word, line, paragraph, or page reset is introduced.

## Positive controls

The authentic p56 cipher is independently replayed first: **85/85** known plaintext runes, 84 consumed prime values, with the single literal F at offset 56 held without advancing the clock.

The reverse-block implementation is then planted on source-native plaintext using the original full-stop boundaries. Each control is decrypted right-to-left under the unrestricted hold/consume rule, and the known path is checked by exact forward re-encryption.

| Native plaintext | Clause lengths | Literal F holds | Consuming ciphertext F values | Result |
|---|---:|---:|---:|---|
| Known p56 plaintext, start 0 | 5, 14, 26, 40 | 1 | 2 | Exact inverse/replay |
| Clear p57 text, start 0 | 7, 30, 30, 28 | 3 | 6 | Exact inverse/replay |
| Clear p57 text, planted start 17 | 7, 30, 30, 28 | 3 | 3 | Exact inverse/replay |

These are implementation controls, not claims that p56 or p57 historically used clause-reversed blocks.

## Original ciphertext result

Every chapter reaches an impossible clause. “Reverse suffix” is the maximum number of runes from the right edge of that failed clause that any incoming cursor can decode before all states die. “Prior paths” counts every latent-F history through the fully completed preceding clauses.

| Physical chapter | Runes | Clauses | First impossible clause | Fully supported prior runes | Failed clause length | Max reverse suffix | Incoming cursor(s) | Prior paths |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| p0–2 | 729 | 9 | 5 | 297 | 53 | 30 | 287 | 16 |
| p3–7 | 1,145 | 18 | 2 | 16 | 103 | 19 | 16 | 1 |
| p8–14 | 1,729 | 27 | 2 | 40 | 94 | 41 | 40 | 1 |
| p15–22 | 1,903 | 21 | 3 | 20 | 226 | 76 | 18, 19, 20 | 4 |
| p23–26 | 1,021 | 9 | 2 | 16 | 320 | 33 | 16 | 1 |
| p27–32 | 1,433 | 23 | 2 | 19 | 125 | 24 | 19 | 1 |
| p33–39 | 1,680 | 22 | 1 | 0 | 10 | 4 | 0 | 1 |
| p40–53 | 3,008 | 42 | 2 | 29 | 46 | 19 | 27, 28 | 2 |
| p54–55 | 308 | 2 | 2 | 9 | 299 | 43 | 9 | 1 |

**Complete finite decision: 0/9 chapters admit a complete legal path.** The earliest contradiction is already in the first clause of p33–39 (only 4/10 rightmost runes survive); seven other chapters fail by their second or fifth clause. This is independent of English scoring and independent of any choice among latent F histories.

## Relation to prior work

The nearest studies were checked and are materially different:

- im-results/lp2-clause-primeproduct-origin-inverse.md changes the next clause's prime origin using a cumulative plaintext prime-product state; it does not reverse each clause's allocated key block.
- im-results/lp2-prevclause-primeindex-fhold-gate.md uses the previous clause's plaintext GP sum as the next clause's increasing-prime origin; it does not reverse within-clause key order.
- im-results/lp2-word-reverse-prime-ftransparent-original-gate.md reverses selected complete printed words before the authentic prime/F stream; it does not reverse the allocated prime block within each full-stop clause.
- Issues #2174 and #2283 examine punctuation-selected state transitions, not this fixed prime-block reversal.

This test therefore resolves a distinct finite operation rather than duplicating those reports.

## Decision and limits

Retire the exact rule above. Do not rescue it by stripping leading red headings, treating &/$ as additional block boundaries, adding per-page resets, changing the F grammar, or searching arbitrary initial prime origins: those are different receivers and would need independent source instructions. The test establishes no unknown plaintext, authentic LP2 key, general prime-cipher exclusion, or final Cicada destination.

Reproduce with:

node sims/lp2_clause_reverse_prime_blocks_original_sft.cjs

The script asserts source alignment, the authentic p56 regression, the synthetic positive controls, all nine exact failures and the complete finite result. The committed SFT passed Windows Node 22 using the repository's manual read-only runner: [run 45524968589](https://github.com/FlareZ123/liber-primus/actions/runs/45524968589).
