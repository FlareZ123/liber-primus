# Original LP2 word-local five-phase affine cipher: 244-edit bound and authentic F-skip gate

**Agent47, 14 November 2026. Exact extension of an already established all-secret exclusion.** No unknown Liber Primus plaintext, original key, cryptographic mechanism, or continuation destination was recovered. A prior [word-local five-phase all-secret test](../sims/lp2_wordlocal_fivephase_allsecret_sft.cjs) already established that **109/109** original 10–14-rune words lack exact matches to a 29,157-word native-English reference under arbitrary secret word-specific affine keys. **The new substantive results are an exact 244-original-rune minimum correction budget and a separate failure of the historically authentic plaintext-F key-clock skip**, extending that prior binary match/no-match test across four independent fixed reference corpora. This is a bounded exclusion for word-local five-phase arithmetic and local replacement repairs, not for an arbitrary secret polyalphabetic substitution or variable-length cipher.

## Why test this particular mechanism?

The original LP2 manuscript has 12,956 GP29 ciphertext runes across 2,896 complete printed rune words, with only 86 same-page identical consecutive rune pairs. Its known five-back equal-symbol effect is specifically **word-internal**, at 104/2,105 eligible pairs, while the original 10,846 five-back comparisons crossing printed word boundaries contain 375 matches, near the random-GP29 rate. The source-original word-boundary alignment was separately established by [Agent43](lp2-lag5-fixedrune-boundary-alignment.md). A human might therefore consider a five-step key schedule **reset on each printed word**. No authentic Cicada instruction actually prescribes that key schedule or guarantees that printed words coincide with plaintext words.

The period-five model considered here grants each **individual original printed word** its own completely secret nonzero multiplicative slope and **five independent additive phase keys**:

    C[w,j] = a[w] * P[w,j] + b[w,j mod 5]  (mod 29)

where the 29 symbols are exact Gematria Primus indices, the word-specific slope may be **any value 1–28**, and the five phase keys each range over **0–28**. This subsumes the simple five-phase Vigenère model (slope 1). It permits 28 × 29⁵ unrelated keys *per printed word* and is fully reversible once the keys are known. It does **not** by itself explain the almost absent consecutive identical ciphertext pairs. An extra sparse correction layer could be proposed, but would have to account for the quantitative bound below.

## Key-independent decryption invariant

For each word of length L≥6, define differences separated by exactly five positions:

    d[j] = (C[j+5] − C[j]) mod 29,  j = 0,...,L−6.

Every unknown phase key cancels, leaving

    dC[j] = a[w] * dP[j]  (mod 29).

The vector of differences normalized by the inverse of its first nonzero entry (or an all-zero vector if none exists) is invariant under **every permissible secret word-specific key**. This projective signature is necessary and sufficient for a candidate plaintext word to admit a five-phase affine encryption to that ciphertext word. For the slope-one subfamily, the unnormalized difference vector is an even stronger invariant. It eliminates the need to search billions of per-word keys.

The **fixed reference language panel** consists of the repo-pinned 29,163-entry TextBlob English frequency list, Shakespeare first-300k passage (55,407 word tokens), Gibran's *The Prophet* (15,733 word tokens), and Emerson essays (77,932 tokens). Source native GP29 spelling is taken from [the verified solved-LP1 encoder](../results/lp1-source-orthography.md): ING→ᛝ, IO→ᛡ, QU→CW, V→U, K/Q→C, Z→S, then longest GP-runic tokens. The comparison unites distinct lexicon strings, groups candidates by **exact GP29 rune-word length**, and gives the cipher a fresh free slope and five phase keys at **every word**.

## Original ciphertext results

| Original GP word length | Printed ciphertext words | Compatible with five-phase additive keys | Compatible with five-phase affine keys | Minimum rune changes for affine compatibility |
| --- | ---: | ---: | ---: | ---: |
| 6 | 256 | 256 | 256 | Not required |
| 7 | 216 | 212 | 216 | Not required |
| 8 | 156 | 26 | 156 | Not required |
| 9 | 78 | 1 | 10 | Not required |
| 10 | 52 | **0** | **0** | **82** |
| 11 | 32 | **0** | **0** | **74** |
| 12 | 18 | **0** | **0** | **57** |
| 13 | 4 | **0** | **0** | **15** |
| 14 | 3 | **0** | **0** | **16** |
| **All 10–14** | **109** | **0** | **0** | **244** |

The **109 original 10–14-rune words**, totaling 1,182 ciphertext runes, have **zero exact native-English word candidates** even after granting arbitrary independent 28-way slopes and five phase shifts for each word. The **109-word binary exclusion is independently prior art** in [the existing exact original-input SFT](../sims/lp2_wordlocal_fivephase_allsecret_sft.cjs), which used the 29,157-word English frequency lexicon. The earlier [arbitrary secret symbol permutation at every five-phase slot](lp2-perword-alphabet-pattern-allsecret-gate.md) was too flexible to exclude any of the 2,896 words on equality shape alone. The contribution of this extension is the **exact minimum changes needed** after granting all word-specific secret field multipliers and five phase keys. The four-corpus reference is larger; no alphabet was fitted after testing.

The **244-rune minimum repair budget** is an exact combinatorial lower bound for the selected native-English candidate panel and model. For a fixed candidate plaintext word and slope, choose each phase shift to be the **most common residual** of C[j] − aP[j] among positions j with the same residue modulo 5. Every other position requires a ciphertext rune change. Enumerate all **28 slopes**, minimize those five residual disagreements, then minimize across every fixed native-English candidate of the identical length. The resulting per-word minima sum to 244. This already permits corrections at **arbitrary locations**. Therefore a proposed *extra layer that changes at most one original ciphertext rune per each of the manuscript's 86 adjacent-doublet events* cannot rescue this five-phase affine family for all 109 long words, even if every correction is allocated optimally.

A source-original positive uses **109 native-GP source words** with exactly these long-word lengths, encrypts each with an independently generated nonzero slope and five arbitrary phase values, and verifies the complete inverse, the identical invariant and **0 exact repair edits**. The independent solved-LP1 pages 3,8,9,10,11,14, which were **excluded from the lexicon**, provide a separate vocabulary check: **23/25** original clear native GP words of lengths 8–14 have the matching affine signature (21/25 for slope one). This bounds the lexicon's incompleteness but does not establish that every English word is represented.

## Genuine Cicada plaintext-F bypass does not rescue the five-phase keys

The solved p56 cipher establishes a real historical exception: a plaintext rune **F (index0)** is copied unchanged to ciphertext F and **does not advance the key clock**, while an ordinary encrypted non-F plaintext rune **may also** produce ciphertext F. This is a materially distinct extension of the five-phase affine word scheme, because a literal plaintext F changes the phase assignment for every later rune in its word. The earlier 244-edit bound by itself cannot exclude such a phase change.

For each candidate plaintext word, test the exact rule: every plaintext F must be at a ciphertext F position and consumes no phase; every other plaintext symbol is emitted with an arbitrary word-specific nonzero multiplier and five independently selected phase shifts, with the phase advanced **only for that non-F symbol**. The phase-constant residual test enumerates all 28 possible secret multipliers and derives phase keys from the first consumed symbol in each phase. It permits ciphertext F from *either* origin and does not guess a plaintext F mask.

Of the **109** untouched 10–14-rune words, **73 have no ciphertext F at all**. For those 73, literal F cannot occur and the earlier zero-match affine invariant applies unchanged. The remaining **36 have at least one ciphertext F**; all 36 fail the exact F-skip feasibility test against every exact-length word in the same four-reference native-English panel. The full F-skip extension thus admits **0/109** original long-word matches, even though it has the historically real clock-changing escape.

A positive source-native plant independently tests five different long-word lengths10–14. Each contains plaintext F and forces at least one **ordinary non-F plaintext symbol to encrypt to ciphertext F**, exercising the ambiguous branch. Each plant is accepted by the feasibility test and exactly decrypted/re-encrypted with its known slope, phase keys and literal-F mask. This is a stronger positive than merely planting unchanged literal Fs.

**Scope:** this rejection remains conditional on original printed words being plaintext words, the finite GP-English lexicon and exactly one fixed secret multiplier per word with five additive key phases. It does not exclude p56's genuine totient cipher, which uses a different nonperiodic prime key schedule, or any nonlinear changing alphabet, additional input symbol, untested vocabulary, segmentation change or an independently derived external key.

## Consequence for a real decoder

This is **not** an impossibility theorem for all word-local five-state processes. In particular, a source-selected nonlinear alphabet per phase, stateful autoregressive rule, per-phase multiplicative factor, extra symbols or deletions that change subsequent key-phase alignment, a differently segmented plaintext, a non-English register, and English words absent from the fixed lexicon all lie outside the model. A true exception occurring at one site may also alter the entire remaining phase clock, so the 244-versus-86 comparison **only excludes positionwise replacement corrections**, not general edit or escape channels. The original printed word-length grammar is itself atypical of sequential native prose; interpreting these divisions as unchanged plaintext words is a substantive conditional assumption.

**Next cryptanalytic decision:** Do **not** optimize per-word Caesar/Vigenère keys, word-specific affine factors, or a mere 86-position local repair layer to explain the short-lag echo. Those have a keyless original-cipher contradiction against the finite native register. A plausible next source-led mechanism must genuinely vary its state *within the same five-position phase*, transform word membership, or identify original key material and independently check recovered plaintext. No claims of native plaintext should be made from one of the isolated 8–9-rune candidate word matches.

**Reproduce:** [SFT](../sims/lp2_word5_affine_allsecret_sft.cjs), CommonJS on Node.js 22, reads the canonical original transcription and numeric GP alphabet plus the four pinned control corpora. It checks all 2,896 original words, both secret-key invariants, every length bucket, the exact 244-rune repair minimum, held-out solved-page native words, and 109 fully reversible source-native positive plants. No external network, installs or file writes.
