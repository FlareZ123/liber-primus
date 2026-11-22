# Original PARABLE interiors as one prime-clock start per unresolved rune-bearing page

**Decision, 16 November 2026 (Agent32): no complete original-page decryption under the three directly encoded prime starts.** The source-motivated correspondence is exact: physical LP2 p57 is a clear-text, 20-word, 95-GP-rune parable saying to shed circumferences and find divinity within. Remove the first and final original rune of **each whole printed word**. The unchanged original transcription then gives **55 interior runes**, exactly one per **55 rune-bearing unsolved physical pages p0–p55** (p50 is rune-free). Unlike an arbitrary keyword hunt, this supplies an unambiguous ordered key candidate and a natural page-by-page use.

## Locked proposed inverse

Map interior rune 1 to physical p0, rune 2 to p1 and so on through p55, skipping p50. Reinitialize on each original page. Let `k` be the ordinal of the first prime in the genuine solved-p56 consecutive-prime-totient cipher. Three direct GP29 interpretations of the corresponding PARABLE interior rune `r` are `k = GP_index(r)`, `k = GP_prime(r)` and `k = GP_prime(r) - 1`. All use zero-based prime-clock ordinals, preserving the creator's original prime order beginning 2,3,5,... and its **authenticated sign**:

`cipher = (plain + (prime[k] - 1)) mod 29`.

Every possible legal plaintext F is handled exactly as in solved p56: a plaintext F emits ciphertext F **without consuming a prime**; an ordinarily encrypted non-F must consume one prime and cannot decode to F. At each printed ciphertext F the inverse retains both possible histories. There is **no** language-score filtering, dictionary selection, chosen start offset or parameter fitted to the unknown ciphertext.

The independent positive control reproduces **all 85/85** original p56 ciphertext runes from its complete known plaintext, with exactly the source plaintext-F bypass at rune index 56 and 84 consumed primes. Two further original-p57-plaintext synthetic plants with the separately selected page-start clocks are fully reachable.

## Result on the complete original corpus

| P57 interior to page-start clock | Original pages with any legal F-bypass path | First impossible original rune on p0 (zero-based) |
| --- | --- | ---: |
| GP29 rune index | p43 only, 1/55 | 49 |
| GP rune prime value | p49 only, 1/55 | 2 |
| GP rune prime totient | p49 and p55, 2/55 | 0 |

All three original-input routes fail to decode even p0 in full. The positive controls prove that a source-legal transparent-F path would be retained when present. The p55 survival in the prime-totient interpretation supplies **no** plaintext claim, because the other 53 pages under that same fixed mapping have no algebraically legal path.

**Boundary of the decision:** The text of PARABLE does not explicitly say to assign its interiors to physical pages or use them as prime ordinal starts. These were motivated and locked for the experiment, not authenticated authorial instructions. This excludes this exact direct correspondence under p56's true operator. It does not exclude keyed state changes, different word-shell operations, independent source keys, a table consumer, or another cipher. No previously undeciphered plaintext or valid destination was recovered.

[Original-source 55-page stand-alone test](../sims/lp2_parable55_page_prime_start_ftransparent_sft.cjs) reads the authoritative `lp2-corpus.json` and `lp2-transcription.txt`, cross-checks every physical page including the runeless p50, checks p56's actual ciphertext word-for-word, asserts the complete survivor sets and first p0 failure offsets, and emits the keyed page-by-page feasibility results. This is a bounded test of a human-visible clue, requiring no numerical null or speculative English model.

**Independent environment check:** the [manual Windows/Node 22 original-input run](https://github.com/FlareZ123/liber-primus/actions/runs/43779102104) completed successfully on 16 November 2026. The source SFT remains executable without a dedicated permanent workflow.
