# Literal p50 SHED difference as base5 digits: fixed p56 hash64 and GP85 recipients

**Agent 2, 22 November 2026. Classification:** one new bounded original-source negative. Neither p55 unknown plaintext nor any new key was recovered.

## Source-selected numerical transformation

The independent solved final LP2 p57 says **“WE MUST SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE.”** The previously documented [p50 60→59 numeral-state interpretation](lp2-p50-radix-shed-circumference-divinity.md) gives a natural original-only **SHED field** at all 256 printed p50 cells:

```text
D(cell) = original base60 two-digit value − original drop-f base59 two-digit value.
```

Every actual unchanged source `D` is a base5 digit **0–4**, with exact value multiplicities **[36,62,62,63,33]**. This field exists without guessing a plaintext, key or rune alignment. Because the table contains **256** cells, there are two genuinely finite candidate known-target transports:

- **Four base5 digits → one number:** 256/4 = **64** groups, exactly the **64 bytes** of the independently printed and solved p56 SHA-512 target (128 hex characters). The source supplies p56's expected data, so an exact full-byte match is unambiguous.
- **Three base5 digits → one GP29 symbol:** floor(256/3)=**85** groups plus one unused digit, exactly the **85** original p56 printed ciphertext runes and independently solved p56 plaintext runes. The specific projection chosen here is integer modulo29; other secret mappings have no original selector.

These candidate packings are *possible* literal ways to consume SHED, rather than an instruction attested in Cicada. Both are actual known-recipient inverse tests; the 64-byte hash is a particularly strong exact target with no English-scoring discretion.

## Original-input results

For the 64-byte receiver, freeze four physical source readings before comparing output: printed row order; four-row vertical groups by original column; complete column-major order; a literal inward rectangular spiral from the top-left. For each, freeze high-first and low-first base5 quartet orientation. Reduce each 0..624 group modulo256 to obtain a byte (the more restrictive interpretation without reduction also fails to produce all 64 valid bytes).

| 256-cell reading | High-first exact SHA-512 byte matches/64 | Low-first matches/64 | Raw quartets at most 255, high/low |
|---|---:|---:|---:|
| Original row-major | **1** | **1** | 20 / 33 |
| Four-row vertical groups | **0** | **0** | 22 / 26 |
| Column-major | **0** | **0** | 22 / 26 |
| Inward physical spiral | **1** | **0** | 33 / 20 |

Thus **none of the eight parameter-frozen source readers** recovers the authenticated p56 SHA-512 bytes (best single matches1/64, compatible with chance). Without modulo256, only20–33 of64 quartets even represent a byte, so the literal base5→raw-byte hypothesis is internally impossible.

For consecutive printed-row **base5 triples**, the two natural high/low digit orders each give85 integers in0..124. Map each modulo29 into native GP29 and compare against both independently authenticated actual registers, with no fitted shift:

| Original D-field triple order | Exact p56 printed-cipher rune matches/85 | Exact p56 known-plaintext rune matches/85 |
|---|---:|---:|
| High-first | **0** | **3** |
| Low-first | **3** | **3** |

Neither output resembles genuine known p56 prose or the independently attested printed cipher.

## Positive controls, scope and decision

A synthetic digit stream formed by packing **each one of the actual 64 p56 hash bytes into its exact four base5 digits** returns **64/64** original target bytes using the same decoder; perturbing the first digit fails full equality. A separate synthetic 256-symbol digit array packs **all 85 authentic original p56 printed cipher runes into exact three-digit base5 groups**, appending one zero cell, and decodes **85/85** original rune indices. These controls ensure the receiver is capable of the required recovery if the tested packing is genuinely used.

**Decision:** Retire the eight direct SHED-difference quartet→known SHA-512 recipients and the two literal original-row triple→known GP85 recipients. They do not uncover p56's publicly known hash or plaintext, so reusing the identical rules on p55 cannot be justified by this source. The original SHED field and earlier circumferential totals remain numerical observations, and a separately provided grouping/address/key operation could still use them. Avoid arbitrary digit reordering after this exact known-target failure.

**Reproduce:** [Windows Node.js22 all-source SFT](../sims/lp2_p50_shed_base5_p56_hash64_gp85_sft.cjs), [successful CI run 44994924237](https://github.com/FlareZ123/liber-primus/actions/runs/44994924237). Original data files are `resources/liber-primus/lp2-grid-256.json`, `lp2-corpus.json`, `lp1-plaintext-reference.txt`; the script preserves all original tokens and prints all original receiver comparisons.
