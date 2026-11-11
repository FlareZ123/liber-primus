# Signed 2016 three-by-59 GP sections as a possible original p29 address

**Evidence level: exact conditional source arithmetic and an explicitly post-selected hypothesis.** Original ciphertext remains undeciphered; this route supplies a possible page selector, no authenticated cipher key, no inverse of unknown prose, and no destination.

## Causal proposal and player-visible material

The archive-preserved, same-key-verified [2016 signed OutGuess text](../resources/historical/cicada2016-4gq25-outguess.asc) says, “Its words are the map, their meaning is the road, and their numbers are the direction.” A contemporary player could read the message alongside the 29-symbol Gematria Primus alphabet and the already-established Cicada use of prime ordinals, including the explicit 2013 BASE29 example.

There is a coherent, **proposed** three-part grouping of that signed text:

1. Greeting, path/epiphany sentence, and “Liber Primus is the way.”
2. “Its words are the map, their meaning is the road, and their numbers are the direction.”
3. “Seek and you will be found,” the closing, 3301, and the OpenPGP warning.

With TH, EA, ING→NG, IO→IA, K→C and V→U as GP transliteration conventions, the original three groups contain **59, 59, 59 GP symbols**, respectively, with prime-weight sums **2999, 2819, 2581**. The 59th prime is **277**. Of all 56 original unsolved physical LP2 pages, **p29 uniquely contains 277 original GP runes**, which is also the maximum source-page length. It is therefore *possible* that the three-by-59 signed-message structure deliberately selects p29 by prime-ordinal-to-page-length matching.

This matters conditionally because p29 is independently the only original rune page satisfying the [signed 2013 DH=2 / p39 G / p50 256-byte table congruence](p29-signed2013-dh2-gadic-congruence.md):

```text
P29(X) = S50(X) + 2 G39(X) + G39(X)^2 R(X) over GF(29).
```

The 2013 signed worked example supplies the shared secret **2**, modulus **23**, and BASE29 3301→3QO, while p39 supplies the red triad G. The congruence's transformed 273-symbol R is near-uniform; its direct GP and binary readouts do not give recognizable plaintext. A source-selected p29 address would address one weakness of this branch, yet the subsequent **original decoding operation remains missing**.

## Strongest objections and source controls

The 59→277→p29 relationship was recognized **after** inspecting the established p29 congruence. The signed message never instructs “count runes, take the ordinal prime, find a page of that length.” Equal source group lengths are a meaningful exact pattern but do not license the proposed map. This is a new explanatory candidate, not independent confirmation of why the creator selected p29.

The source's typography prints seven paragraph units, while the proposed grouping combines paragraphs and splits one paragraph at a sentence boundary. That semantic split is reasonable, but it is not a uniquely commanded operation. The three 59 counts depend on interpreting both ING and IO as single GP symbols; omitting either gives group lengths **[59,60,59]**, and omitting both gives **[59,61,59]**. This explicitly exposes dependence on a prior tokenizer convention.

The contained directive has successively nested lengths **59, 43, 27**, whose prime ordinals produce **277, 191, 103**. The latter two do **not** match any unknown physical page's rune length. The signed 2017 warning has **45** GP symbols; prime(45)=**197**, also not an unknown page length. The proposed rule would therefore need to distinguish the three whole sections from embedded clauses, rather than generically interpreting every rune count as a page address.

The more immediate [base59 coordinate proposal](2016-2017-base59-tiny-tea-hypothesis.md) produces rune-name initials TINY, suggestive of Tiny Encryption Algorithm, but also lacks an authenticated key and employs a non-obvious 2017 radix carryover. The two readings of 59 should be compared as **competing** hypotheses. Neither is evidence for the other merely because the same source provides both.

## Key-independent direct-TEA transport exclusion

A natural GP-native direct representation of 64-bit TEA ciphertext uses 14 base29 digits per 64-bit block because 29^14 exceeds 2^64. Reading the **12,956 unchanged unknown GP runes** as consecutive fixed 14-digit blocks, the source values exceed the valid 64-bit range in:

| Direct 14-digit rule | Full blocks | Valid 64-bit blocks | Overflow |
| --- | ---: | ---: | ---: |
| Book-continuous, big-endian within each block | 925 | 58 | **867** |
| Book-continuous, little-endian within each block | 925 | 55 | **870** |
| Natural big-endian restart on each physical page | 900 | 58 | **842** |

Five genuine 64-bit synthetic blocks were correctly serialized to 14 base29 digits and fitted exactly. This original-source result **excludes only the direct lossless fixed-14-GP-digit/full-64-bit-ciphertext transport** for TEA, irrespective of secret key. It does not exclude TEA on original p50 bytes, a source-framed or variable codec, another cipher, or the signed message's broader word-map instruction. Agent35 has separately already tested several direct p50 TEA/XTEA keys and IVs without recovered plaintext; do not repeat that finite family.

## Decision

**Keep the 2016 59-prime page selector provisional.** The new relationship is potentially helpful only if an independent original instruction fixes the prime-ordinal/page-length grammar or specifies how the authentic 2013/p29/p39/p50 residue becomes an invertible decipherment. Under either development, the next probe should freeze the operation and predict authentic plaintext on untouched original ciphertext. Without it, additional arithmetic coincidences, key sweeps, or unframed TEA trials cannot establish intended design.

Reproducer: [`sims/signed2016_59prime_p29_selector_sft.cjs`](../sims/signed2016_59prime_p29_selector_sft.cjs), using only original repository source, builtin Node.js modules and source-native synthetic controls. Passing manual-only GitHub Actions [run 43059906848](https://github.com/FlareZ123/liber-primus/actions/runs/43059906848), base59-p29 job; workflow [`2016-message-prime-layers.yml`](../.github/workflows/2016-message-prime-layers.yml). All source files remain unchanged.
