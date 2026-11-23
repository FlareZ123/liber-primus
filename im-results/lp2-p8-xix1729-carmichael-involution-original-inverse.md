# The p8–p14 1,729-rune chapter as a Carmichael modulus, with a visible XIX exponent

**Agent19, 23 November 2026. Verdict: source-visible arithmetic supplies a completely specified self-inverse 1,729-position permutation, but neither that permutation nor its simplest GP29 value-changing companion recovers unknown LP2 plaintext. This is a provisional human-solve-path hypothesis, not an authenticated Cicada cipher.**

## Three separately visible inputs

1. The original physically adjacent botanical section **LP2 p8–p14** has the **untouched** GP29 page rune counts `[255,268,263,273,261,272,137]`, totaling precisely **1,729**. Its original first four red glyphs, visible at the beginning of p8 and canonically transliterated, spell **`XIXM`**.
2. Within this section the original p10 image has a standalone **literal decimal `7`**, directly between printed runic words. A dedicated [earlier original-source investigation](../workplace/lp2-p10-standalone-seven-1729-frame-original-lead.md) verified that physical numeral and 1,729 section boundaries. This note does not rerun its seven-column/magic-square/taxicab attacks.
3. `1729 = 7 × 13 × 19` is the smallest **Carmichael number**. It has Euler totient `φ(1729)=6×12×18=1296` and Carmichael exponent `λ(1729)=lcm(6,12,18)=36`; the three factors 7, 13 and 19 are distinct primes.

The subsection `XIX` of the intact p8 red glyph word `XIXM` could be read as Roman **19**, the same value as the largest prime factor. This is **selective parsing inside one four-rune printed word**; no creator instruction confirms it. The page count, literal p10 7, Carmichael factorization and the substring offer a concrete, human-visible *candidate* to consider before fitting any plaintext.

## A reversible exponent-19 map chosen before cipher tests

Let `N=1729` and number the original section's exact contiguous runes `i=0,...,1728`. The visually nominated map is

`f(i)=i^19 mod1729`.

It is a **permutation of all 1,729 positions**, including zero and nonunits, because on the three CRT factors the exponent19 is coprime to `6,12,18`. More specifically, **`19²≡1 (mod36)`**, so the map is a **self-inverse involution**:

`f(f(i))=i` for every original position.

The exact permutation has **931 fixed positions and 399 two-cycles**. This is an independently derivable, source-locked reversible operation rather than an exponent selected for a ciphertext fit. Its most significant limitation is equally sharp: **the map permutes positions only**. A pure application can never turn the original near-uniform rune histogram into ordinary native-GP29 prose, and no original source says to use Carmichael exponentiation to order these runes. A source map is a reversible *candidate instruction*, not an actual recovered key or plaintext.

## One strictly limited value-changing receiver

To allow a direct native-GP29 decoding claim, freeze the simplest source-index additive clock under the same modulus:

`K_i=( (i+origin)^19 mod1729 ) mod29`, `P_i=(C_{f(i)}+sign×K_i) mod29`.

The unpermuted direction is also measured; use only the two literal index origins 0/1 and two additive signs. This gives precisely **eight** source-constrained reversible models, no fitted keys, alphabet mappings, nonlinear exceptions or optimized resets. The zero-origin source-only kernel remains the primary hypothesis; other variants account for conventional book-index origin and encoder orientation.

| Origin | Sign | Position map? | Whole-section decrypted IOC |
| ---: | ---: | --- | ---: |
| 0 | − | no | **0.03457629** |
| 0 | − | yes | **0.03446852** |
| 0 | + | no | **0.03499199** |
| 0 | + | yes | **0.03438886** |
| 1 | − | no | **0.03492974** |
| 1 | − | yes | **0.03493242** |
| 1 | + | no | **0.03478046** |
| 1 | + | yes | **0.03498932** |

The unmodified original source IOC is **0.03446048**. All eight fixed decoders still produce nonlinguistic GP29 ciphertext-like text and values close to uniform `1/29≈0.03448276`. Each exact inverse reproduces all **1,729/1,729** printed runes. Each of the eight source-native positive controls constructs a fresh ciphertext from **1,729 repeated genuine solved p57 rune symbols**, then recovers exactly all 1,729 symbols, confirming the maps and arithmetic operate correctly when they are the actual cipher.

## Research decision

**Reject exponent-19 index permutation plus direct modular-exponent GP29 keystream as a stand-alone decipherment of the botanical chapter.** No original unknown plaintext appears. The pure involution cannot produce native rune-frequency restoration; its optional source-derived additive clock fails on exact original input.

The new mathematical observation worth retaining is the exact **Carmichael involution `i↦i^19 mod1729`** whose exponent and modulus are independently observable from plausible source geometry. Whether the author intended it remains unknown. Additional arbitrary source-shuffle combinations, changing key phases or fitted second ciphers have no support and should not be launched solely because the permutation is reversible.

**Reproduction:** [Windows-compatible CommonJS SFT](../sims/lp2_p8_xix1729_carmichael_involution_original_sft.cjs), [successful original-corpus GitHub Actions run 45118505294](https://github.com/FlareZ123/liber-primus/actions/runs/45118505294).
