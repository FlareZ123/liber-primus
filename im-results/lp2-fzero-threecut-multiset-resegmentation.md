# Three printed dividers suffice for strict F-zero word-mask lexeme support

**Agent46, 16 November 2026. Director [#1208](https://github.com/FlareZ123/liber-primus/issues/1208). Classification: conditional constructive original-source result, no decryption.**

The original 12,956 GP29 ciphertext runes can be resegmented so that **every word has an F-position pattern present in a native-GP English reference dictionary**, assuming the reversible rank28 family where a repeated ciphertext rune means plaintext GP-F and a nonrepeated ciphertext rune means a non-F plaintext rune. Under the bounded requirement of preserving every punctuation span's original multiset of word lengths, **exactly three shifted printed dividers suffice, and at least three are necessary**. This is a constructive counterexample to promoting fixed printed-word F-mask exclusions into exclusions of all variable-boundary ciphers. It does **not** identify plaintext, a key, or Cicada's intended word boundaries.

## Source and strict conditional mechanism

Use the exact original pp0–55 rune register and its physical hyphens/punctuation from resources/liber-primus/lp2-transcription.txt and resources/liber-primus/lp2-corpus.json. Line and physical-page carries are kept inside words. The result is **175 punctuation spans, 2,896 printed words and 12,956 GP29 runes**, with source word-length histogram **[83,448,720,513,317,256,216,156,78,52,32,18,4,3]** for lengths1–14.

Fix the family C_i = previous ciphertext rune when and only when P_i = GP-F. All other 28 GP plaintext rune types take one of the 28 nonrepeating ciphertext symbols by some bijection, with arbitrarily unknown keystream/state. Thus every observed **within-span equal ciphertext pair** creates a forced F in plaintext at that **same global rune position**, independent of any secret, while every non-equal transition forces non-F. The first rune of each punctuation span has **no imposed F status**, granting the model an unobserved state/IV. There are 85 forced F positions at the other transitions. These assumptions intentionally favor the proposed cipher and are not first-party instructions.

GP-normalize the existing English word-frequency reference resources/control/english_wordfreq_textblob.txt with the project's established longest-token GP29 transliteration. For each word length, retain its **exact set** of observed binary F-position masks. A hypothetical plaintext word of length L can exist under the reference dictionary only if its forced F/non-F mask equals one of those masks. At a punctuation span's first rune, either initial F value is allowed.

Keeping the original dividers fixed gives exactly **three unsupported masks**, in three different punctuation spans:

| Punctuation span, source page | Source word index in span (zero-based) | Original GP length | Required F bitmask (LSB=first) |
| --- | ---: | ---: | ---: |
| 82, p25 | 9 | 9 | **256** (F only at last index) |
| 86, p27 | 16 | 12 | **2,080** (F at indices 5 and11) |
| 100, p30 | 5 | 9 | **256** |

All other original fixed-divider words have at least one reference word with the required F mask. That criterion is strictly weaker than likely natural-language frequency or grammatical coherence.

## Tight three-divider constructive repair

For each of the above punctuation spans, retain its entire exact ciphertext rune stream and its original **word-length multiset**, and swap the lengths of **two adjacent printed words**. This changes **only their shared divider**; every other divider in the span remains at its exact printed position, with unchanged punctuation endpoints, rune count, number of words and singleton inventory. Search all adjacent unequal-length pairs, checking *every* resulting word against the same pre-fixed dictionary masks. The minimum-absolute-displacement valid single-divider witnesses are:

| Span/page | Adjacent word indices | Old lengths → new lengths | Old global cut → new cut | Shift |
| --- | --- | --- | --- | ---: |
| 82 / p25 | 9,10 | 9+4 → 4+9 | **6225 → 6220** | −5 runes |
| 86 / p27 | 15,16 | 4+12 → 12+4 | **6606 → 6614** | +8 runes |
| 100 / p30 | 5,6 | 9+8 → 8+9 | **7570 → 7569** | −1 rune |

All global cuts are measured as counts of GP runes *preceding* the divider, from zero before the first unknown rune. The images themselves are unchanged. The SFT finds respectively **2, 1 and 2** admissible adjacent-swap choices for these three spans and chooses the smallest movement.

There are concrete reference-native F-pattern witnesses for the new segments: span82's new nine-rune word permits **CAREFULLY** (one F at position4), span86's 12+4 permits **UNSUCCESSFUL** and **HALF** (F at positions9 and3 respectively), and span100's 8+9 permits **PRINCESS** and **FORMATION** (none and initial F respectively). These are **only examples of compatible F masks**, never recovered ciphertext plaintext. Each other word in all 175 spans remains compatible.

**Why three is the exact minimum for this restricted model:** the unsupported masks originally lie in **three disjoint punctuation spans**. Since punctuation endpoints are kept fixed, modifying dividers in one span cannot repair an unsupported word in another. Therefore at least one printed divider must move in *each* of those spans. The construction moves one in each, establishing an exact lower bound and witness. It does **not** minimize movement if punctuation endpoints, number of words, dictionary, or first-rune state rules change.

## What this changes, and what remains closed

The stronger fixed-word source-native conditional objections in [the existing F-zero report](lp2_gp29_fzero_two_word_source_invariant.md) remain valid *for literally preserved printed words*. This witness proves that word-preserving assumptions matter: an extremely small amount of resegmentation (3 of the 2,896-word layout's dividers) removes **all zero-support F-position masks** under the chosen reference. The repaired source still has the previously documented **extremely unusual** three length-three _F_ and three length-four _F__ masks in rare dictionary words, so it is **not evidence that the F-zero model explains natural English frequencies**. A source-authored resegmentation rule and a cipher for the other 28 letters are still completely missing.

An explicit source-specified boundary/letter inverse is the next required advancement; blindly minimizing F-mask violations produces overfitting and cannot by itself recover even one plaintext rune outside the forced F positions. Do not present witness words as decoded LP2 text.

**Reproduce:** [read-only Windows Node22 CommonJS SFT](../sims/lp2_fzero_threecut_multiset_resegmentation_sft.cjs) asserts all original rune identities, source word inventory, the three unsupported masks, every candidate adjacent swap, exact repaired source positions, and mathematical tightness within the stated bound. [Passing original GitHub Actions run 43837834191](https://github.com/FlareZ123/liber-primus/actions/runs/43837834191), 16 November 2026.
