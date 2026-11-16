# 2012 Cicada-logo caption as an exact p55 GP29 keyword: source-gated negative

**Agent8, 16 November 2026. Classification: original-input bounded cryptanalytic negative. No unknown LP2 plaintext, authentic key or destination.**

## Authored clue and hypothesis

The 2012 Cicada coordinate page `845145127.com` used `cicada.jpg` with the archived HTML image title **"Patience is a virtue."** The same Cicada emblem appears on original solved LP1 p05 and unknown LP2 pp53/p55, with exact independent image registration. The 2012 site's original HTTP response is no longer preserved, however: the title is witnessed by a 2015 saved/local page, while the actual JPEG and signed OutGuess coordinate handoff are independently preserved. The title is **a plausible authentic puzzle-era phrase**, but no archived instruction says to use it as a GP rune key.

This supplies a concrete candidate the earlier unsigned image-source search did not consume: literal `PATIENCE` or the whole phrase `PATIENCEISAVIRTUE`, changing printed V into GP rune U under the manuscript's actual 29-rune alphabet. The source has a historical cipher exemplar: LP1 genuinely uses repeating Gematria Primus Vigenère with **plaintext-F nonconsumption**, and LP2 p56 independently uses the same transparent-F rule. A complete exact inverse is therefore worth running once, avoiding arbitrary key-word search.

The original p55 has **76 runes**, but its first rune continues a word from p54. Accordingly run the key from either the complete physical p55 first rune (start0) or the first fully printed p55 word (start1). For each of the two source phrases, both GP29 shift signs are included; there are **eight** fixed cases. No key rotation, skip-mask fit, page-specific dictionary or other source phrase was optimized.

## Original full-page exact results

For every case, the genuine cipher branches on original ciphertext GP-F (index0): it can be literal plaintext-F without advancing the key, or a key-consumed non-F whose ciphertext is F; a nonzero ciphertext rune can only come from a consumed **non-F** plaintext rune. Each branch is required to reproduce the full original ciphertext under exact forward encryption. The source p55 ciphertext has F only at zero-based offsets **15,25,41**. A zero surviving branch is therefore a **strict whole-page incompatibility with this cipher/key family**, even if plaintext is not English.

| Literal label | Physical p55 start | Sign of encryption | Legal full-length inverse paths | First impossible length, if zero |
| --- | --- | --- | ---: | ---: |
| PATIENCE (8 GP symbols) | 0 | + | **0** | 4 |
| PATIENCE | 0 | − | 2 | — |
| PATIENCE | 1 | + | 2 | — |
| PATIENCE | 1 | − | 1 | — |
| PATIENCEISAVIRTUE (17 GP symbols) | 0 | + | **0** | 4 |
| PATIENCEISAVIRTUE | 0 | − | **0** | 9 |
| PATIENCEISAVIRTUE | 1 | + | **0** | 66 |
| PATIENCEISAVIRTUE | 1 | − | **0** | 14 |

Thus **five of the eight source/clock/direction models are impossible** regardless of plaintext language, and the four full-caption models are all impossible. The other **three models yield exactly five full-page candidate plaintext streams**; none is recognizable GP-native English. Their highest IoC is **0.03459459459**, lower than original p55 **0.03789473684** and the independently solved first76 original p57 runes **0.05964912281**. The best-IoC surviving opening, `PATIENCE` starting at local1 with positive sign, is

`EOADYYHNUTHBMPPTFOEGRIXYSHDFAEYAXAAEATTHEAAEAPNRFEOMEAIAEHINC`

This is a literal GP-token transliteration of a wrong candidate, **not** a phrase or recovered plaintext. Avoid reading short substrings such as THE in it as a result.

**Exact controls:** The SFT encrypts the first 76 (or first75) independently solved p57 original GP indices under every source key, direction and start, and its same complete branching inverse recovers every planted rune, including all literal-F skips. Every surviving original candidate also re-encrypts to its original unchanged p55 byte-for-byte GP29 source. No manually supplied source F-mask or plaintext is used for the original input. The test passed on Windows Node22 in [CI run 43865011570](https://github.com/FlareZ123/liber-primus/actions/runs/43865011570).

## Decision

The 2012-logo caption is a real bounded reader-visible key candidate worth having tested once because it comes from the exact reused emblem's earlier site, and the GP29 cipher family has authentic solved-page precedent. **Retire the eight direct source-caption GP29 Vigenère consumers on p55.** The full phrase is excluded by exact F-state reachability, the abbreviated keyword's survivors are nonlinguistic, and the caption itself lacks an original signed key-instruction. This does **not** exclude the phrase under a genuinely different source-instructed operator, and does not weaken the original emblem's confirmed identity as reused Cicada artwork. Do not expand to subtitle fragments, free phase rotations, or speculative surrounding English.

**Reproduction:** [complete read-only Node22 CommonJS original-source SFT](../sims/lp2_2012_emblem_patience_vigenere_p55_sft.cjs). Earlier exact [2012 emblem image-source registration and archive limitations](lp2-moth-pre2014-logo-source-registration.md).
