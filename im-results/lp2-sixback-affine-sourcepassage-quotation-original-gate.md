# Original six-back affine source-quotation retrieval under a secret alphabet

**Agent49, 18 November 2026. A complete original-cipher plaintext-recovery attempt; no verified unknown plaintext.** The original GP29 LP2 ciphertext has **80/1,290** true within-printed-word six-back events satisfying `C[j]=T(C[j−6])`, with `T(x)=24−2x mod29`. This is the independently observed unique best invertible affine lag-six map, reproducible in both manuscript halves. The map itself was discovered retrospectively by maximizing 812 candidate maps, and an actual author instruction selecting it has not been recovered. Prior direct six-step static-alphabet rotor inverses failed the full-book plaintext-frequency gate, so this is only a targeted **literal-source-quotation retrieval** probe: might a human-readable paragraph from an actual earlier Cicada-linked book leave an invariant sequence of six-step equality events even with a hidden 29-rune substitution alphabet?

## Source-derived comparison without fitting plaintext

A proposed word-local six-step rotor with unknown *arbitrary* fixed secret rune alphabet `S` satisfies `C[j]=T^(floor(j/6))(S(P[j]))`, where `j` is the rune's within-word index. Consequently for every genuine word-internal `j>=6`,

`C[j]=T(C[j−6])  iff  P[j]=P[j−6]`.

This bit equality is independent of the secret alphabet. For original ciphertext, the test extracts the **entire true/false mask** at every eligible word-internal six-back site. It then looks for a **contiguous** literal matching native-GP29 source-text window, without requiring the source's own word breaks to match the ciphertext cuts. Both observed and **absent** events must agree exactly. No key, secret alphabet, phase, original plaintext or edit distance is fitted. The source text is converted using the previously pinned Gematria Primus orthography (ING/IO are single runes); both the printed textual direction and its reversal are considered.

**Independent source corpus:** nine pinned reference sources already available in `resources/`: Shakespeare, Gibran, Emerson, Blake's *Marriage of Heaven and Hell*, all three books of Crowley's 2013 *Book of the Law*, the pre-2014 passion-gospel text, and Tennyson's *Lady of Shalott*. Together **713,301** native GP29 runes are checked, in **two** source directions each. They are plausible reference registers with historical or thematic relevance, although no original LP2 instruction identifies a particular one or a starting position.

| Original source-physical window | Runes | Eligible j>=6 pairs | Positive T6 equalities |
| --- | ---: | ---: | ---: |
| p0 | 262 | 26 | 4 |
| pp0–2 | 729 | **79** | **6** |
| pp3–7 | 1,145 | **106** | **6** |
| pp15–22 | 1,903 | see SFT | see SFT |
| p27 | 234 | see SFT | see SFT |
| p29 | 277 | see SFT | see SFT |
| pp40–53 | 3,008 | see SFT | see SFT |
| Entire pp0–55 | 12,956 | **1,290** | **80** |

The 262-rune p0 mask is short enough to admit source-matching accidental windows, so a p0-only hit is not a recovered passage. **All original windows of at least 700 runes have zero exact source offsets** in all nine original sources and both directions. In particular, neither the pp0–2, pp3–7, pp15–22 nor pp40–53 window can be a directly contiguous register from this corpus **under the frozen six-position equality invariant**. No original plaintext segment, key or destination emerges. The p27 and p29 short windows are reported for diagnostic completeness only.

### The three p0-only source-mask coincidences are mathematically ruled out as full decodings

Only **three** complete 262-rune p0 equality masks occur in the nine sources, and all happen to be in reversed reading order: Shakespeare reverse source offset **140,593**, Emerson reverse offset **134,828**, and the KJV passion-Gospels reverse offset **51,763**. A short four-positive-event mask admits these by chance; none continues through pp0–2.

Crucially, give **each individual candidate** the strongest static-alphabet follow-up possible. Undo the source `T` rotor at each original p0 position, grant both *continuous original-rune* and *restarted printed-word* six-position clocks, grant **all six** initial phases for each clock, then fit **any possible 29-way secret plaintext→ciphertext lookup** with no bijection requirement. Even this arbitrary lookup must change **at least 209, 211, 213 of the 262 positions**, respectively, to fit the original source. This is a strict exact all-hidden-alphabet obstruction to *each actual 262-rune mask-matching quotation*, irrespective of the candidate's English register. An authentic planted 729-rune Shakespeare passage under the word-clock six-rotor has **zero** mismatches under the same inverse and the correct hidden codebook. These three p0-only matches are therefore **not recovered original plaintext** under the proposed rotor. No free phase or source quote can rescue them within this specific cipher mechanism.

**Updated native Windows Node22 [PASS 44286839622](https://github.com/FlareZ123/liber-primus/actions/runs/44286839622)** reproduces the three addresses, all 12 secret-map search positions per candidate, the optimal 209/211/213 mismatch bounds and both positive controls. This extension still leaves changing alphabets/unknown clocks outside scope.

## Executable positive and limits

The source-exact [Node22 CommonJS SFT](../sims/lp2_sixback_sourcepassage_mask_original_sft.cjs) checks every original printed word and all 1,290 six-back opportunities, extracts each exact source mask, encodes nine reference sources, and scans every literal candidate offset in each direction. In a planted positive, it takes an **actual 729-rune Shakespeare GP29 contiguous source passage from offset 12,345** and encodes it using the same six-block rotor with secret bijection `S(p)=7p+3 mod29` and the **actual original printed word boundaries**. Its mask preserves all 79 true/false source comparisons and the unchanged blind search **recovers the exact offset 12,345**. Thus this test recognizes a genuine source passage under precisely the secret-alphabet equality mechanism it claims to evaluate. The entire original 12,956-rune corpus is untouched in the real search.

**Windows GitHub Actions Node22 PASS:** [run 44285690599](https://github.com/FlareZ123/liber-primus/actions/runs/44285690599), 18 November 2026. The test printed `textSources=9`, `nativeRunes=713301`, `longWindowMatchingOffsets=0`, `plant.recoveredExactly=true`.

**Research decision:** reject this one **fixed-secret-alphabet six-step rotor + exact contiguous earlier-source quotation** route for the full source windows tested. It is a nonduplicative reuse of the observed T6 equality fingerprint rather than a test of ordinary ciphertext doublets or printed word-length cribs. Because the prior full-cipher rotor frequency invariant already rejected the simplest global static alphabet, this null finding does not newly establish or refute that cipher. The equality mask is not guaranteed under changing per-word keys, secret symbol clocks, noncontiguous book ciphers, other languages, a different rotor, or entirely new plaintext. Finding such a rule requires a fresh original first-party opcode; the 80 matches alone are not a plaintext key.
