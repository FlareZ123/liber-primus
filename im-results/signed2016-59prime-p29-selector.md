# Retired signed 2016 three-by-59 prime-ordinal p29 address

**Evidence level: exact source arithmetic, but the selector hypothesis is retired.** The apparent three equal-length 59-rune sections require unselected noncanonical English-to-GP aliases; the canonical 2016 instruction is 61 runes. Original ciphertext remains undeciphered, without a key, inverse or destination.

## Causal proposal and player-visible material

The archive-preserved, same-key-verified [2016 signed OutGuess text](../resources/historical/cicada2016-4gq25-outguess.asc) says, “Its words are the map, their meaning is the road, and their numbers are the direction.” A contemporary player could read the message alongside the 29-symbol Gematria Primus alphabet and the already-established Cicada use of prime ordinals, including the explicit 2013 BASE29 example.

There is a coherent, **proposed** three-part grouping of that signed text:

1. Greeting, path/epiphany sentence, and “Liber Primus is the way.”
2. “Its words are the map, their meaning is the road, and their numbers are the direction.”
3. “Seek and you will be found,” the closing, 3301, and the OpenPGP warning.

Under canonical English-to-GP tokenization without the extra ING→NG or IO→IA collapses, the proposed groups contain **59, 61, 59 GP symbols**, respectively, with prime-weight sums **2999, 2781, 2581**. They become **59, 59, 59** with sums **2999, 2819, 2581** only if both extra aliases are imposed. The 59th prime is **277**, and p29 uniquely has 277 runes, but the necessary uniform 59-count is therefore **not source-authenticated**. No original text commands the prime-ordinal-to-page-length operation.

The motivation was p29's existing unique [signed 2013 DH=2 / p39 G / p50 256-byte table congruence](p29-signed2013-dh2-gadic-congruence.md):

```text
P29(X) = S50(X) + 2 G39(X) + G39(X)^2 R(X) over GF(29).
```

The 2013 signed worked example supplies the shared secret **2**, modulus **23**, and BASE29 3301→3QO, while p39 supplies the red triad G. The congruence's transformed 273-symbol R is near-uniform; its direct GP and binary readouts do not give recognizable plaintext. A source-selected p29 address would address one weakness of this branch, yet the subsequent **original decoding operation remains missing**.

## Strongest objections and source controls

The 59→277→p29 relationship was recognized **after** inspecting the established p29 congruence. It depends on changing the tokenization of the 2016 central instruction to force a uniform section length. The signed message never instructs “count runes, take the ordinal prime, find a page of that length.” This retrospective match cannot select p29 independently of the algebra.

The source prints seven paragraph units, while the proposed grouping combines units and splits another at a sentence boundary. The central canonical 2016 instruction has 61 runes. Collapsing only ING or IO gives [59,60,59], and collapsing both gives [59,59,59]. The collapsed spellings are not established by the original English source, so the selector is retired.

Under the unselected double-collapse convention, the contained directive has nested lengths **59, 43, 27**, whose prime ordinals produce **277, 191, 103**. Only the first coincides with an original physical page length. This conditional pattern supplies no independent address rule. The signed 2017 warning has **45** GP symbols; prime(45)=**197**, also not an unknown page length. The proposed rule would therefore need to distinguish the three whole sections from embedded clauses, rather than generically interpreting every rune count as a page address.

The related [base59 coordinate/TINY–TEA proposal](2016-2017-base59-tiny-tea-hypothesis.md) was also **retracted by its author** because it depends on the same noncanonical aliases, an unselected 2017 radix carryover and rune-name initials. It supplies no basis for continuing TEA searches.

## Key-independent direct-TEA transport exclusion

A natural GP-native direct representation of 64-bit TEA ciphertext uses 14 base29 digits per 64-bit block because 29^14 exceeds 2^64. Reading the **12,956 unchanged unknown GP runes** as consecutive fixed 14-digit blocks, the source values exceed the valid 64-bit range in:

| Direct 14-digit rule | Full blocks | Valid 64-bit blocks | Overflow |
| --- | ---: | ---: | ---: |
| Book-continuous, big-endian within each block | 925 | 58 | **867** |
| Book-continuous, little-endian within each block | 925 | 55 | **870** |
| Natural big-endian restart on each physical page | 900 | 58 | **842** |

Five genuine 64-bit synthetic blocks were correctly serialized to 14 base29 digits and fitted exactly. This original-source result **excludes only the direct lossless fixed-14-GP-digit/full-64-bit-ciphertext transport** for TEA, irrespective of secret key. It does not exclude TEA on original p50 bytes, a source-framed or variable codec, another cipher, or the signed message's broader word-map instruction. Agent35 has separately already tested several direct p50 TEA/XTEA keys and IVs without recovered plaintext; do not repeat that finite family.

## Decision

**Retire the three-by-59 2016 prime-ordinal page selector.** Canonical source tokenization and the unselected sentence grouping defeat its proposed human solve path; future agents should not use the numerical p29 match as an upstream premise. The separate p29/p39/p50 signed-DH congruence survives as exact original arithmetic. The direct 14-digit TEA transport gate survives as an isolated negative, with no demonstrated decryption. Reopen a connection only if a newly recovered creator clue independently fixes the needed grammar and a plaintext inverse.

Reproducer: [`sims/signed2016_59prime_p29_selector_sft.cjs`](../sims/signed2016_59prime_p29_selector_sft.cjs), using only original repository source, builtin Node.js modules and source-native synthetic controls. Passing manual-only GitHub Actions [run 43059906848](https://github.com/FlareZ123/liber-primus/actions/runs/43059906848), base59-p29 job; workflow [`2016-message-prime-layers.yml`](../.github/workflows/2016-message-prime-layers.yml). All source files remain unchanged.
