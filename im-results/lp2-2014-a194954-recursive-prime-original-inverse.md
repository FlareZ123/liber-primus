# Archived 2014 A194954 recurrence as an LP2 running prime key

**Decision (16 November 2026): negative for this exact, original-cipher transfer.** The full independently specified OEIS A194954 sequence, interpreted as a continuous additive GP29 key with a fresh clock at each of the nine source-visible unknown chapters, produces no unknown plaintext. Its p56-style positive-φ transparent-F decoder becomes algebraically impossible on all nine original chapters, generally within their first 112 runes. No source-selected unknown-page key, plaintext, or continuation is recovered.

## Why test this distinct route?

The archived 2014 `message.txt.asc` contains whitespace runs transcribed as `2 3 5 7 11 13 17 23 29 31 37`. These match the first eleven values of [OEIS A194954](https://oeis.org/A194954), whose **full recurrence** is `a(1)=2` and, for `n>1`, `a(n)` the least larger prime with `a(n)-a(n-1)` divisible by the number of 1 bits of `n-1`. This supplies one specific 13,000-term key stream, instead of an unconstrained key search. The earlier [41×316 A194954 study](a194954_41x316_direct_key_gate.md) used the first eleven terms for p57 word selection and tested period-41 shifts/per-class substitutions; it **did not** test this indefinitely extended source recurrence as the GP29 running key.

**Source caveat:** many counted spaces were *trailing* whitespace, omitted from canonical OpenPGP cleartext signature verification. The earlier 41×316 study established that archive-dependent transcription cannot authenticate their exact count. The OEIS match is a conditional clue, not a verified deliberate Cicada instruction to run this cipher.

## Source-fixed decoder and input

- Input: `resources/liber-primus/lp2-corpus.json`, original runes from physical p0–55 (12,956 GP29 symbols; runeless p50 omitted).
- Key: regenerate the first 13,000 A194954 primes with no search for a seed; the 35-term opening matches the published OEIS listing exactly; term 13,000 is **644,089**.
- Clock: key index zero on each of the nine existing source-visible chapter boundaries p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55. The numbered table consumes zero rune-key positions.
- No-skip reference: for each original rune `C[i]`, compute `P[i]=(C[i]-K[i]) mod29`, with `K[i]` respectively `a(i)-1`, `a(i)`, `1-a(i)` and `-a(i)` for the four literal historical prime/totient polarity maps. No word boundary optimization, prime-start shift or fitted substitution.
- Authentic cipher transfer: use the source-solved p56 `K[i]=φ(prime[i]) mod29`, with plaintext F (GP29 0) emitted unencrypted and **without consuming a prime**. With the A194954 `K[i]=a(i)-1 mod29`, enumerate *every* legal path for each original unknown chapter via an exact consumed-key-count dynamic program. A ciphertext F may either be an unconsuming literal F or an encrypted non-F; a consuming inverse that yields plaintext F is invalid. Report the longest legally reachable prefix.
- Original positive: first prove that the same GP29 native encoder using *ordinary consecutive* prime totients reproduces **all 85 original p56 ciphertext runes**, including its authentic F skip; decoder reachability passes 85/85. This is calibration of the known solved algorithm, not evidence for the new key.

## Exact original-input results

Index of coincidence (IoC) for each unmapped GP29 output should be interpreted against the random-GP baseline near `1/29=0.03448`; genuinely native English source windows are considerably higher. All four output families remain very close to random.

| Chapter | Rune count | C IoC | φ+ inverse IoC | Prime+ inverse IoC | φ− inverse IoC | Prime− inverse IoC | p56-style φ+ F-transparent reachable runes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| p0–2 | 729 | 0.034083 | 0.033894 | 0.033894 | 0.034508 | 0.034508 | 52 |
| p3–7 | 1145 | 0.034634 | 0.034637 | 0.034637 | 0.034916 | 0.034916 | 83 |
| p8–14 | 1729 | 0.034460 | 0.034529 | 0.034529 | 0.034481 | 0.034481 | 76 |
| p15–22 | 1903 | 0.034502 | 0.034675 | 0.034675 | 0.034496 | 0.034496 | 7 |
| p23–26 | 1021 | 0.034274 | 0.034728 | 0.034728 | 0.034488 | 0.034488 | 0 |
| p27–32 | 1433 | 0.034186 | 0.034419 | 0.034419 | 0.034388 | 0.034388 | 19 |
| p33–39 | 1680 | 0.034360 | 0.034687 | 0.034687 | 0.034330 | 0.034330 | 112 |
| p40–53 | 3008 | 0.034543 | 0.034413 | 0.034413 | 0.034398 | 0.034398 | 88 |
| p54–55 | 308 | 0.033821 | 0.034265 | 0.034265 | 0.034519 | 0.034519 | 11 |

The prime/phi IoCs are identical within each sign because the two decoded outputs differ by the same constant rune shift at all positions; this is expected for alphabet-wide additive shifts. The positive-direction transparent-F algebra fails **before the first chapter completes in 9/9 cases**, even when every original ciphertext F is allowed to be a literal bypass. The no-skip affine readings also fail to recover coherent prose.

## Evidence scope and next decision

This closes only the deterministic **source-extended A194954 prime/totient additive stream at natural chapter starts**, with no-skip and one historically authenticated F-transparent positive-φ rule. It does not rule out alternate stateful ciphers, original-source selected traversal or a changed key clock supplied independently. In particular it would be misleading to claim the archival spaces are themselves authenticated cryptographic key instructions.

Do **not** expand this into arbitrary starts, inserted periodic resets, 41/316 key phases or keyword composites in the absence of a source selector. Existing 41×316 per-class capacity results and hundreds of direct source-key tests already discourage parameter tuning without a plaintext bridge.

**Reproducer:** [`sims/lp2_2014_a194954_runningprime_sft.cjs`](../sims/lp2_2014_a194954_runningprime_sft.cjs) is a single-file CommonJS Node22 test with exact original corpus input, independent 85-rune historical p56 positive, 35-term OEIS assertion, precise complete source-prime recursion, and expected chapter-level results. Source-only evidence resides in [the 41×316 archived-whitespace audit](a194954_41x316_direct_key_gate.md) and the [archived 2014 message](../resources/historical/cicada2014-stage11-message.asc). No new result is promoted to the authoritative plaintext synthesis.
