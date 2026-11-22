# P15 Fibonacci-prime spiral: bounded pre-2014 source search

## Decision

**No exact pre-2014 external source or published puzzle matching the complete p15 construction was located.** A partial cross-round antecedent is now identified: a public extraction of the 2013 CicadaOS prime_echo script prints primes through 3301, with pauses at 1033 and 3301. This supports a historical prime/3301 cue but does not supply the Fibonacci indexing, absolute-difference rule, spiral, or cipher consumer. The original p15 infinity mark may select one continuation term, but it does not specify how to use that term cryptographically. A separate bounded test of the signed-BASE29-derived repeating-key interpretation below is also negative. The exact 16-cell formula remains reproducible from the original scan; no key or plaintext is recovered.

## Exact target

The authoritative source reconstruction is [the p15 spiral result](../results/lp2-p15-fibonacci-prime-spiral.md). The target is the *composition*, not generic overlap:

1. Take the distinct Fibonacci values '0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987'.
2. Use each value plus one as a one-based prime index: 'p_(F_n+1)'.
3. Print 'abs(3301 - p_(F_n+1))'.
4. Place the 16 terms in the exact source-visible four-neighbour spiral beginning at red '3299', moving right/down/left/left/up/up/right/right/right/down/down/down/left/left/left.

A relevant historical source would need to prescribe this composed rule, its seed/offset and read order, and at least one further mathematical step or readout that makes a prediction beyond the 16 already printed cells. Shared keywords or an unrelated Fibonacci/prime construction do not qualify.

## Evidence checked

- Exact-phrase and exact-sequence searches included 'absolute difference from 3301' prime Fibonacci, '3301 - prime' Fibonacci, the 16-prime list, 'Fibonacci-indexed primes', 'primes indexed by Fibonacci numbers', and targeted OEIS queries. These returned modern LP2 reproductions and nearby mathematical concepts, but no pre-2014 source for the full composition.
- [OEIS A001605](https://oeis.org/A001605) is titled **indices of prime Fibonacci numbers**: it lists indices n for which the Fibonacci number F_n is prime. That is the reverse construction, not primes selected at Fibonacci-number indices p_(F_n+1), and it does not supply the 3301 absolute difference or square-spiral layout.
- The pre-2014 paper [Bayless, Klyve & Oliveira e Silva, “New Bounds and Computations on Prime-Indexed Primes,” INTEGERS 13 (2013)](https://math.colgate.edu/~integers/n43/n43.pdf) is a close terminological false friend. It defines prime-indexed primes as q_i=p_(p_i), where the prime's index is itself prime (pp. 1–2); the PDF contains no Fibonacci reference. It does not use Fibonacci values as prime indices, 3301, absolute differences, or a 4×4 spiral.
- Standard Fibonacci and prime-sequence references establish the component sequences, not the target composition. No located pre-2014 source fixed the exact F_n+1 convention, 3301 offset, red starting cell, spiral orientation, or a next-step operation.
- [Cicada Notebook Session 03](https://cicadanotebook.com/sessions/3.html) and the [Wulfic master tracker](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) reproduce the 16-cell LP2 formula, but are modern research records, not pre-2014 historical sources. The [CicadaSolvers quickstart](https://www.cicadasolvers.com/quickstart/) discusses a later 2016 cumulative-Fibonacci/464 prime-index interpretation; that is post-2014 and a different operation.

## Partial Cicada antecedent and one-step continuation (provisional)

A public extraction of the 2013 CicadaOS root filesystem preserves the prime_echo script at https://github.com/neuroretransmit/cicada/blob/main/2013/002-3301/rootfs-contents/usr/local/bin/prime_echo. It prints successive primes through 3301 and pauses at 1033 and 3301. This is a plausible earlier-round prompt to notice the prime sequence and the 3301 anchor on p15, but it does not state the Fibonacci-indexed selection or the spiral construction. The signed TCP BASE29 command is a separate artifact: it defines ordinary integer-to-base-29 text encoding, not the GP rune-to-prime table.

The original p15 image places an infinity symbol beneath the 4×4 grid. If this is read as a one-step continuation cue, the next distinct Fibonacci value after 987 is 1597, so p1598=13477. The exact relation is 13477=29×464+21, where 464=π(3301) and 21=F8. Ordinary BASE29 renders 13477 as G0L. This is a candidate cross-round arithmetic closure, not a plaintext, key, or authenticated cipher instruction.

The possible relative byte offset base+13477 is 8,966,441. It has now been tested as the single infinity-mark continuation in an 18-offset DATA/560.13 R40-B3 run: 360 frozen L24 candidates per clock, 720 total, zero survivors (run 43333075277, artifact 13997535717). The authentic 2013 XOR positive control and all planted-language/decoy controls passed. This rejects the exact continuation as a pad consumer under the frozen R40-B3 family; it does not establish that the arithmetic association is a cipher instruction.

## Bounded BASE29-derived repeating-key test (exploratory negative)

A plausible human attempt is to treat the 16 recovered primes around 3301 as the key: preserve their p15 spiral order, encode each prime using the signed 2013 TCP BASE29 operation, concatenate the numeric digits, and use those values as a repeating GP29 additive key. This is a *new* consumer test, distinct from reducing the prime values or grid offsets modulo 29. The signed BASE29 output alphabet is printable alphanumeric `0–9,A–S`, not Gematria Primus; interpreting its numeric digits as GP29 shift values is an additional mapping assumption. Repetition, additive Vigenere, and the initial phase at the first LP2 rune are also hypotheses, not instructions supplied by the source.

- The 16 prime values in p15 spiral order are `[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]`.
- Their signed-BASE29 concatenation is the 30-digit string **`2357DN1E2L5492FSSH1M232C5AC98G`**. The authenticated vectors `1033 → 16I` and `3301 → 3QO` are asserted by the reproducer.
- The resulting 30 numeric digits were repeated continuously across all **12,956** unknown runes on pp0–55. Both signs were tested with an ordinary key clock and a *ciphertext-F-skipping heuristic*. That heuristic differs from the authenticated historical rule, which skips **plaintext** F and must allow ciphertext F from encrypted non-F. The exact authentic-rule test is reported below. No page/chapter reset, phase sweep, or alternate key encoding was searched.
- Raw ciphertext has IoC **0.0344784** and current Emerson-GP score **−6.51838**. The four outputs score **−6.54651**, **−6.54219**, **−6.54084**, and **−6.54167**, respectively; none is language-like, and all score below raw. The authentic solved-p56 control is **−4.46165**. Synthetic encrypt/decrypt round-trips pass for the two tested *ciphertext-visible* clocks. The historically authentic plaintext-dependent clock receives the separate exact all-phase inverse test below.

This rejects the exact 30-digit repeating-key/additive consumer under the plain clock and the two signs of the *ciphertext-F-skipping heuristic*. It does not establish that the primes are an LP2 key, and it does not exclude another source-selected use of the p15 sequence. Reproducer: [`sims/p15_fibonacci_prime_base29_key_sft.cjs`](../sims/p15_fibonacci_prime_base29_key_sft.cjs).

## Exact plaintext-F all-phase inverse: p15–22 and independent p16 reset

**Source key repaired and original-cipher obstruction (14 November 2026, Agent39).** The older standalone p15 SFT had two executable errors: its expected **29-character** literal BASE29 string disagreed with the actual **30** generated digits; it also inferred the composite 2095 from the printed 1206 by applying `3301−1206`, whereas the source Fibonacci-prime ordinal establishes **4507−3301=1206**. Both assertions stopped execution before the advertised original-text test. The implementation now checks the exact 16 prime ordinals, the genuine `1033→16I` and `3301→3QO` BASE29 controls, and the corrected 30-character string `2357DN1E2L5492FSSH1M232C5AC98G`. The 12,956-rune direct-additive program now runs successfully and reproduces its previously reported negative output scores; [corrected-key all-rune CI](https://github.com/FlareZ123/liber-primus/actions/runs/43649825449).

The more discriminating question is whether **any plaintext whatsoever** could be encrypted under this 30-digit key and Cicada's **actual historical plaintext-F bypass**. The original 2014 LP1 and LP2 p56 solutions transmit plaintext GP-F (0) as ciphertext F without consuming the key; all other plaintext runes consume one shift. A ciphertext F may be literal or may arise from shifted non-F. With the key `K` and consumed count `t`, a branch for observed `c` is therefore:

- If `c=0`, emit plaintext F and retain `t`.
- Always consider plaintext `p=(c−s K[(phase+t) mod30]) mod29` and consume one shift **only if `p≠0`**.

Exhaustively preserve all reachable key-clock counts at each original rune, for both `s∈{+1,−1}` and **all 30 phase rotations**. This procedure neither chooses a key from the ciphertext nor scores English; when no state survives, no possible plaintext in *any* register can satisfy this exact reversible cipher and key.

The source-selected initial scope starts immediately after the original p15 number plate's **11-rune second red heading**, continuing across p16–22. Original `p15` after its first 9-rune top heading and second 11-rune heading, plus p16–22, contributes exactly **1,883 untouched runes / 432 printed words**. The source text parser asserts its rune identity against the canonical original page bytes before testing.

| Source-bound clock | Sign×phase models | Complete legal inverses | Maximum legal prefix | Forced earliest failure conclusion |
| --- | ---: | ---: | ---: | --- |
| Continuous key from second p15 heading to p22 end | **60** | **0** | **213 of 1,883** runes | Every configuration dies by rune **214** |
| Independent fresh key on following physical page p16, unknown starting phase | **60** | **0** | **176 of 267** runes | Every configuration dies by rune **177** |

The second row is a separate, natural page-reset interpretation. It rules out rescuing the same key merely by restarting the clock at the beginning of the very next physical page. The two scopes use distinct original ciphertext input and independent all-phase initial clocks. For **all 60** sign/phase combinations, authentic clear GP p57 (95 runes) was independently encrypted under the genuine plaintext-F bypass; exact reachability retained its correct key state at the end. The imported lexical Cicada decoder also rechecks **710/710** original previously solved GP positions, including **14/14** genuine literal-F bypasses. The positive controls establish that the original impossibilities follow from the ciphertext, rather than an incorrect rule for F.

**Executed reproducer:** [`sims/lp2_p15_base29_ftransparent_original_sft.cjs`](../sims/lp2_p15_base29_ftransparent_original_sft.cjs), [successful original-input CI with both scope tests](https://github.com/FlareZ123/liber-primus/actions/runs/43649825449). The exact earliest obstruction, 12 most persistent failed phase variants, original rune values and authentic source plant results are printed in CI. The fixed plain/heuristic direct-key SFT is [`sims/p15_fibonacci_prime_base29_key_sft.cjs`](../sims/p15_fibonacci_prime_base29_key_sft.cjs).

**Decision:** the *source-derived key* is numerically valid, but it cannot decrypt these original sections under **either sign of the historical plaintext-F-transparent additive cipher**, even if its phase is entirely unknown or the next original page resets the clock. No inferred key phase, local English phrase, or F-mask tuning can repair the exact obstruction. This is an exclusion of one well-motivated cross-round cipher transfer, not of all uses of the p15 clue. A different key source, non-Vigenere operator, extra symbol transformation or genuinely different state-reset rule requires independent evidence before new tests.

## Exact historical OutGuess probe from the infinity continuation

**Original-JPEG, positive-controlled decision (14 November 2026, Agent39):** a three-case, source-bounded application of the p15 infinity continuation produced **no recognizable payload**. The two original-language spellings of the *same* next prime are decimal `13477` and the signed-2013 TCP BASE29 representation `G0L`. Earlier Cicada stages demonstrably used OutGuess, so the native keyed JPEG decoder offers a concrete consumer of these strings. No first-party source instructs applying a continued p15 prime as a JPEG password; this is an investigator-proposed cross-round transfer.

Freeze the original carrier to the physical p15 JPEG `32.jpg`; for the historically represented `G0L` key, grant the immediately following original page p16 `33.jpg` as a second natural target. Do not enumerate alternate primes, punctuation, phases or JPEGs. Run the existing manual `.github/workflows/lp2-outguess.yml` with `custom_password` / `custom_image`, pinned OutGuess 0.4, its keyed source-image embed/recover positive, actual earlier Cicada default-key payload controls, and a genuine payload-free generated JPEG with the *same proposed key*.

| Exact key | Original JPEG | Extracted bytes | SHA-256 of extracted bytes | Empirical entropy (bits/byte) | Authentic readable payload |
| --- | --- | ---: | --- | ---: | --- |
| `G0L` | `32.jpg` (p15) | 24,000 | `6a264052676b59e36528363f53467695fe8b43f83a2831feece0790e3c2d0d4a` | 7.992823 | **No** |
| `G0L` | `33.jpg` (p16) | 24,000 | `0a859fb85147b991b507956699292cf178edf105277ac2a6fab67ab3ee345e47` | 7.991577 | **No** |
| `13477` | `32.jpg` (p15) | 13,496 | `dff0fac83cb3a88391386b39b48fc691aa6052d47bd64ba33863e36e84fb45e3` | 7.988626 | **No** |

**False-header control is essential.** The extractor reported formally internally consistent seed/length headers for all three source attempts, but the freshly manufactured *payload-free* JPEG reported the same kind of consistent header under `G0L` (**47,065** pseudo-bytes) and under `13477` (**46,193** pseudo-bytes). The existing [original-source all-key header theorem](lp2-outguess-universal-header-artifact.md) independently establishes that every physical LP2 original has an initial eligible-bit prefix forcing encrypted OutGuess header `ffffffff` for *every* password. Thus even the identical `G0L` 24,000-byte lengths and same first/last 32 bytes on two adjacent originals cannot authenticate a shared embedded message. The three middle bodies are high-entropy and yield no recognizable clear text, file format, PGP armor or source-specified binary signature.

**Reproduce exact original input and controls:** [`G0L` on p15](https://github.com/FlareZ123/liber-primus/actions/runs/43648037315), [`G0L` on p16](https://github.com/FlareZ123/liber-primus/actions/runs/43648144842), [`13477` on p15](https://github.com/FlareZ123/liber-primus/actions/runs/43648148704). Each successful run prints an `OUTGUESS_KEYED_RAW` record, the same-key synthetic-no-payload control and exact payload SHA-256. Raw candidate artifacts are retained with those runs. Positive calibrated OutGuess embed/recover and two authentic Cicada default-key source controls pass in all three cases.

**Decision:** retire the p15 infinity-prime → literal `G0L` / `13477` → ordinary OutGuess extraction on those directly associated original pages as a plaintext-recovery route. The original 16-cell equation and the one-term continuation remain mathematical clues; an alternative carrier, tool, password format, or plaintext-independent hidden binary mechanism needs a new independent selector. No new LP2 key, unknown plaintext or destination follows.

## What follows

- The original p15 grid itself remains the only verified source for the 16-term construction and its visible spiral order. The corrected signed-BASE29 key is exactly `2357DN1E2L5492FSSH1M232C5AC98G`. Direct additive tests and the more decisive authentic plaintext-F all-phase test are both negative. Do not repeat these key/clock consumers.
- The complete external-source avenue remains negative at this scope. The 2013 prime_echo extraction is only a partial antecedent; do not turn it, the nearby PIP paper, or the later 2016 message into an LP2 key/source without an exact primary instruction.
- The original infinity mark supports one tentative next-prime continuation `p1598=13477`, encoded as `G0L` by the signed 2013 BASE29 convention. Both the prior DATA/560.13 offset consumer and the now-tested literal `G0L` / `13477` keyed OutGuess consumers on source-linked JPEGs fail to recover plaintext. Retire these exact transfers and preserve the continuation only as an unverified cross-round arithmetic relation.
- The already documented p32 direction/navigation interpretation remains provisional and is not strengthened by this search. No unknown LP2 plaintext, authentic key, reversible cipher, or destination was recovered.

## Reopening criterion

Reopen only if a dated pre-2014 primary or authoritative mathematical source matches the complete composition and specifies a further operation that can be applied once to a source-selected original LP2 interval with a locked prediction. Generic Fibonacci spirals, prime-indexed-prime literature, and numerical resemblance are insufficient.
