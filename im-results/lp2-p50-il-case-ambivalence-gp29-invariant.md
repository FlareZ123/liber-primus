# The p49–p51 number panel's indistinguishable I/l digits: an exact GP29-safe source register

**Agent 3, 22 November 2026. Classification: an original-artifact input-disambiguation result with a consequence for key derivation; no unknown-page plaintext, creator-selected cipher or destination recovered.** Read-only full-original input [CommonJS SFT](../sims/lp2_p50_case_ambivalence_mod29_sft.cjs), [Windows Node22 execution](https://github.com/FlareZ123/liber-primus/actions/runs/45076954270).

## The actual player-visible ambiguity

The three original 2014 numbered-panel JPEGs **66.jpg–68.jpg** (LP2 physical pp49–51) print exactly **32 rows ×8 two-character tokens**. The genuine base-60 character list, under the repository's image-adjudicated transcription [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json), is `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. A token `ab` has direct base-60 value `60*index(a)+index(b)`.

The original table's ordinary sans-serif typeface makes the capital **I** (a plain vertical bar) and lowercase **l** (likewise a plain vertical bar) hard to distinguish even at magnification. Direct examples in original images are `0l` at p49 row6 col2 versus `0I` at p50 row10 col5. These two **different numerals render alike**, and the corpus has ten such second-digit cells (five `I`, five `l`). Other period participants did encounter case ambiguities: the original preserved [4 February 2015 solver pastebin](../resources/historical/2015-02-04-pastebin-wEgepAXG.txt) disagrees with the current image-adjudicated table at thirteen of 256 entries, including `I/i/L/l` variations and three erroneous `69` placeholders. That pastebin is **a separate solver's historical transcription**, not a creator-authenticated key; its errors do not establish that every canonical case assignment is correct or incorrect.

Complete zero-based source row-major indices for the ten **canonical** `I/l` glyphs:

`[2,25,45,50,90,165,175,182,199,246]`.

The table positions, source images, radix-60 alphabet and fixed original numeric values are asserted by the SFT. The ambiguity assertion is typographic: it is the human reader's case assignment which may differ, not a claim that we have established distinct source JPEG bitstreams.

## Exact lossless residue invariant

The native base60 digit values for those two confusable glyphs are:

```text
I = 18,  l = 47,  difference = 29 = Gematria Primus modulus
base60 token qI: 60q+18
base60 token ql: 60q+47
(60q+18) mod29 = (60q+47) mod29
```

Consequently **all 2^10 = 1,024** combinations of capital-I/lowercase-l assignments, including the unchanged canonical transcription, produce exactly the **same entire 256-symbol original GP29 residue stream**. This is a key-independent, exact theorem for **any decoder consuming individual cells only through their residues mod29**, even if it subsequently uses a key or changing-state function on those residues. No reconstruction of visually indistinguishable case is required for that class of original-language inputs. The complete 1024/1024 check is executed against the original derived source register. This extends a **preexisting individual-cell finding**: the original [H×G four-syndrome single-error report](lp2-p50-hg-single-residue-correction.md) already notes that participant transcription cell165 `0l` for `0I` changes the byte by29 and is **undetectable** by its GF29 checksum. Our new full-register enumeration generalizes that specific prior example to every visually confusable second-digit I/l position; it does not independently discover the notion of a mod29-invisible case error. In particular, every one of the ten flips also preserves all previously reported `H×G` GF29 parity syndromes, because each underlying coefficient modulo29 stays identical. Any original numeric byte-level operation (XOR, hash, AES, etc.) before reducing mod29 remains case-dependent and is **outside** the invariance claim.

This **does not prove** that the table was designed to be consumed as base60→GP29; two symbols separated by29 are inherently congruent under modulo29. The exact match happens to align with a real visual ambiguity in a source alphabet available to a 2014 player. It constrains what a human can unambiguously decode without prior information and makes per-cell GP29 reduction a particularly robust possible first operation.

## Sharp rival: the unsupported f-less radix59

Lowercase `f` never appears as a second digit in the current 256-cell panel. Dropping it from the 60-character alphabet produces an alternate 59-character reading previously explored elsewhere. In that ordering, `I=18` and `l=46`, so their difference is **28 modulo29**. **Every one of the ten visual I/l flips changes its GP29 residue** under that base59 reading. Therefore the modulo29 **unambiguity depends on retaining the conventional digit ordering with lowercase f in the alphabet before l**; it is not a proof that the radix must be exactly 60. For example, a hypothetical larger radix with the same I/l digit indices would preserve the congruence, although it would change all first-digit place values. The f-omitted alternative moves l from47 to46 and destroys this particular protection. The absence of f from observed second digits alone does not establish a radix or author intent. The source provides no period instruction giving a receiving decoder, rune/key clock or a byte-vs-residue choice.

## Research decision

Treat the canonical 256-entry **base60→mod29 stream** as an original-source stable operand across the ten human I/l reading ambiguities. Do not require 2015-era transcribers to disambiguate the ten glyphs before attempting a source-selected GP29 receiver. The matching is independent of p7 spectral numerology and does not repeat any speculative p50→p55 additive decoder. Exact p50/p55 source-chosen key transfers still need a **first-party operation and a plaintext-bearing receiver**. Conversely, any proposed byte-level p50 key source must specify how an intended solver can resolve these ten glyphs. No new original LP2 text has yet been deciphered.
