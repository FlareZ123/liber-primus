# Cicada OS prime_echo as sixteen 29-prime floral-page keys

**Original-input decision, 15 November 2026.** The preserved first-party-era 2013 Cicada OS `prime_echo` script emits the first **464** primes in ascending order from 2 to 3301, with its intermediate pause after 1033. These are exactly **16×29** values, so they form sixteen whole 29-prime rows. LP2 has **sixteen consecutive original floral-border pages**, physical **p40–55**, and the authenticated GP chart has **29** rune identities. This is a complete, non-fitted input-key alignment. It was tested as one row per page under the independently known solved-p56 consecutive-prime-totient cipher and its **literal plaintext-F transparency**. **All fifteen rune-bearing original pages fail the exact reversible-inverse test.** The sixteenth is the authentic rune-free numeric table p50. No unknown plaintext or key was recovered.

This rejects a *different key clock* from the already established direct periodic first174/last290/full464 prime stream gates. The model here is a distinct page-reset, page-rekeyed 29-prime clock. The exact [CommonJS original-rune SFT](../sims/lp2_2013_primeecho_floral16_pagekey_sft.cjs) independently generates and asserts the entire prime list, consumes `resources/liber-primus/lp2-corpus.json`, and plants known clear p57 as 95/95 correctly inverted GP-rune ciphertext.

## Independent source clues and weak step

- The preserved original 2013 `prime_echo` shell script [source](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2013/cicada-os/usr_local_bin/prime_echo) prints primes `2,3,5,...,1033,...,3301`, with the two deliberate display pauses. The printed 1033 occurs at one-based ordinal **174=6×29**, 3301 at **464=16×29**. Thus the second block contains **290=10×29** primes. The actual script was consulted; the SFT's standard prime enumeration exactly reproduces all 464 values through 3301 and checks both distinguished ordinals.
- Physical LP2 pp40–55 genuinely have one repeated illustrated floral border on each of sixteen pages, including p50's all-numeric page. Their intended visual chapters include an earlier long floral chapter and a short terminal chapter. The sixteen-page scope here is one independently image-selected morphological group, not an established cipher scope.
- The solved physical p56 GP cipher uses shifts `φ(p)=p−1 (mod29)`, with plaintext F emitted as literal ciphertext F and *not* advancing the prime clock. Its first three known runes provide a native source positive: plaintext ANE (indices24,9,18), shifts 1,2,4, ciphertext AE J OE (25,11,22). The authentic page's special F behavior is crucial to the inverse.

**Weakest premise:** no authored LP2 text says to transpose the earlier `prime_echo` stream into a 16×29 array, align its rows to floral pages, reset the prime clock independently at their headings, or apply p56's cipher. The double coincidence of factors is motivated enough for one exact test, without licensing alternate row orders, phase hunts, arbitrary keys or more cipher layers.

## Locked decoder and actual original results

For physical page `p=40+r`, assign prime values `K_r[j]=prime(29*r+j+1)` for `j=0..28`, repeat its own row cyclically over that page's **key-consuming** runes, and start each nonempty page at key phase0. Use p56's additive sign: `C=P+(K−1) mod29` for `P≠F`. For `P=F/index0`, emit literal `C=F/index0` without changing the phase.

Crucial exact inversion: when `C=F`, the plaintext may be literal F **or** an encrypted non-F symbol landing on ciphertext F; both branches are carried. When `C≠F`, the only valid branch must decrypt to **non-F** and consume a key step. Therefore an input fails only when **every** possible legal plaintext-F history dies. The SFT explores all phase states, requiring no English dictionary and no guessed plaintext. It validates with a 95-rune source-native planted positive and verifies the initial three actual solved p56 cipher steps.

| Original page | Source rune count | Assigned source prime endpoints | First zero-based rune where all possible histories fail |
| ---: | ---: | --- | ---: |
| 40 | 231 | 2 → 109 | 39 |
| 41 | 273 | 113 → 271 | 1 |
| 42 | 272 | 277 → 449 | 39 |
| 43 | 274 | 457 → 641 | 102 |
| 44 | 273 | 643 → 829 | 6 |
| 45 | 270 | 839 → 1033 | 4 |
| 46 | 270 | 1039 → 1237 | 42 |
| 47 | 274 | 1249 → 1459 | 107 |
| 48 | 271 | 1471 → 1663 | 98 |
| 49 | 66 | 1667 → 1889 | 10 |
| 50 | 0 | 1901 → 2113 | Not applicable: number-only page |
| 51 | 92 | 2129 → 2347 | 89 |
| 52 | 263 | 2351 → 2591 | 15 |
| 53 | 179 | 2593 → 2791 | 37 |
| 54 | 232 | 2797 → 3037 | 33 |
| 55 | 76 | 3041 → 3301 | 33 |

In particular, original p41 fails already at its **second** rune under the frozen source-selected row; original terminal p55 fails at rune33 despite granting *every* legal plaintext-F mask. The source p50 number field is rune-free and makes no demand on its assigned row. There is no reason to infer it was supposed to consume the clock.

## Decision and next actionable requirement

Retire **this** prime_echo-row-to-floral-page GP29 additive/F-transparent consumer. Its fundamental failure is an exact source-language-independent **invalid inverse**, not a marginal score on English. Other source-selected uses of the 2013 prime list, other clock rules, mode switches at visual chapters or an external stage-specific hidden key remain logically possible. The factorial coincidence is not an independently authenticated GP29 instruction. A successor would need a historical message naming a row/key transport or an unknown-page inverse yielding a separately predicted ciphertext/plaintext relation.

This conditional exclusion does not alter [results/README.md](../results/README.md) because it is neither an authenticated key nor a plaintext breakthrough.
