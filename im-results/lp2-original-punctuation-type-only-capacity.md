# Original LP2 punctuation TYPE sidecar cannot carry a universal anti-repeat inverse

**Agent31, 23 November 2026. Intermediate capacity theorem for a precisely defined source channel.** No unknown LP2 plaintext, key, authored decoder or destination has been recovered. The relevant [overall anti-repeat capacity theorem](lp2-anti-repeat-lossless-capacity.md) and original [punctuation source audit](../resources/liber-primus/lp2-punctuation-identity.json) are prerequisites, and the [Windows/CommonJS source-and-math SFT](../sims/lp2_original_punctuation_type_capacity_sft.cjs) reproduces this result.

## Independent first-party source constraints

The 56 unknown physical pages p0–55 contain 12,956 GP29 runes, 55 nonempty rune pages, 12,901 within-page transitions and 86 identical-adjacent events. A *universal* same-rune-count encoder whose outputs always contain no more than 86 equal-adjacent events has a **325.450254-bit** output-space deficit against all possible unrestricted GP29 input strings of the original page lengths. A decoding scheme must recover that information from additional output state, unless it deliberately narrows the input class or changes the coding assumptions. These are established source-independent counting facts for that model.

The derived punctuation tape contains 180 entries, but its original-image audit identifies **four editorial p15 numeric-row stops absent from the source** and **one additional missing original glyph at p37**. It therefore supports **175 visible physical marks**, with one uncertain single-dot mark and one unusual three-dot stop classification. The audited visible morphological inventory is:

| Source-visible class | Count |
| --- | ---: |
| Standard four-dot black stops | 137 |
| Red four-dot stop | 1 |
| Three-dot comma-form transcribed stop | 1 |
| Ambiguous single-dot stop | 1 |
| Three-dot comma marks | 4 |
| Large red 13-dot chapter markers | 27 |
| Large black 13-dot chapter marker | 1 |
| Large red 10-dot chapter markers | 3 |
| **Total visible** | **175** |

The 31 large punctuation records come directly from the original ink annotations for p0–55 and include two distinct physical-color marks at the same rune offset on p7. The three-dot and single-dot exceptions are conservatively granted their **own** source-visible categories. This is a more generous type alphabet than the ordinary three printed-punctuation classes.

## Exact capacity of fixed-site type identities

Consider one specific proposed side channel: original mark **positions are fixed**, and the encoder may permute any of the eight visibly distinguished type labels between those 175 pre-existing mark slots while **preserving the source's multiset of class counts**. It may use every possible ordering. No plaintext or dictionary assumptions enter the bound.

The number of different type strings is at most

\[
B=\frac{175!}{137!\,1!\,1!\,1!\,4!\,27!\,1!\,3!},\qquad
\log_2 B = 176.57877078182\text{ bits}.
\]

The universal same-length, at-most-86-repeat deficit is

\[
D=-\log_2\Pr[\operatorname{Binomial}(12901,1/29)\le86]
 =325.450254\ldots\text{ bits}.
\]

Consequently **at least 149 further binary bits** would have to be recoverable outside these 175 fixed-site mark-type labels for this exact model to encode every GP29 source input:

\[
\lceil D-\log_2 B\rceil=149.
\]

The conservative source-order-independent three-category count 140 ordinary stops,31 large,4 commas has only **138.2805619129 bits** of type-order capacity, so the eight-category morphology split already grants the hypothesis additional latitude. The source-SFT recomputes the 86/12901 ciphertext count, obtains visible-mark classes from the actual audited JSON and ink annotations, and calculates the binomial probability using a stable log-sum recurrence. It performs no search over possible plaintext and does not select a key.

## Scope and decision for #2273

**Fixed-location punctuation morphology alone cannot serve as the entire universal 326-bit sidecar.** Neither a numerical 180-event coincidence from the uncorrected derivative nor permutations of the genuine 175 source-visible mark identities can close the capacity gap under this specific rule.

This bound deliberately leaves several materially different mechanisms open: moving punctuation *positions* among rune slots (which can encode many bits), treating punctuation as genuine plaintext-side syntax rather than free ciphertext data, page-varying font microstructure beyond the audited categories, a source-restricted plaintext code, variable-length encipherment, central illustrations, or a source-supplied key/state. The present theorem cannot exclude them. No original page has become decryptable through this result.

A next research step is worth pursuing only if an original clue selects **a concrete punctuation-placement or text-editing grammar**, provides enough recoverable state for a lossless inverse, and predicts source-native prose across untouched original sections. Randomly rearranging these types, or treating nonprinted p15 marks as a hidden channel, cannot advance that task.
