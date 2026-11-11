# Physical p0 cross half-turn: exact source motif, bounded original-cipher readout

**Classification:** new original-JPEG visual fact and one finite source-selected cipher test. No unknown LP2 plaintext, key, complete mechanism, or destination is recovered. The visual symmetry is a possible human notice, not an authenticated instruction to reverse runes.

## The source image actually repeats a cross under a 180° rotation

On original unsolved physical **p0**, archive scan **17.jpg** (2,400×3,600 pixels; SHA-256 \`197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e\`), two large, highly distinctive triple-bar crosses flank the runic text at diagonally opposite corners. They look inverted relative to one another, so a human solver might try a backwards read order. Before treating the cue cryptographically, compare the original pixels.

Both source crops are exactly **500×1,286 pixels**, with no scale correction:

- Lower left: \`(x0,y0,x1,y1)=(52,1679,552,2965)\`.
- Upper right: \`(1848,635,2348,1921)\`.

Thresholding the original grayscale at 145, the lower-left crop compared with the upper-right crop yields:

| Source transform | Original pixel ink-mask intersection / union |
| --- | ---: |
| No transform | 0.11345046 |
| **Rotate 180°** | **0.98747722** |
| Horizontal reflection only | 0.35996459 |
| Vertical reflection only | 0.23821983 |

The original grayscale mean absolute pixel difference **after rotation** is only **0.9463173/255**. The binary overlap remains 0.9823–0.9887 across thresholds 50–230. This is overwhelming evidence for **one reused graphic placed at opposing orientations**; the residual is compatible with local JPEG rasterization, and there is no separate content to decode from the cross drawings themselves.

This is a stronger and more exact observation than simply calling both shapes similar. The likely mundane explanation is source artwork reuse and layout balance. The alternate puzzle-design reading is a deliberately noticeable **half-turn/order-reversal sign** at the opening page. Neither reading is forced by original instructions. No arbitrary cross glyph counts, fake messages, or orientation-dependent keys are inferred.

## One constrained, reversible read-order hypothesis tested on original p0

The page contains exactly **262 runes in 12 original printed lines** with line rune counts:

\`[20,23,19,22,24,21,21,23,23,20,23,23]\`.

Apply a literal source-selected half-turn to the reading stream, i.e. reverse **all 262 original rune symbols**. As an independent historical cipher operation, try the actual solved p56 key clock, decryption \`P[i]=(C[i]−φ(prime(i+1))) mod 29\` with phase zero, no fitted offset, punctuation ignored in the rune clock. This operation exactly recovers the original p56 five-rune heading **ANEND** from its ciphertext. Compare two specified p0 streams only: source-forward and half-turn reverse.

For a finite objective text gate, train an add-0.1 GP29 **four-gram** model on the first **180,000** encoded runes of the repository's Shakespeare 300k source, using its established \`QU→CW, V→U, K→C, Z→S\` conversion. Its held-out **38,800** runes provide **2,267** windows of length 262 at stride 17. Four-gram mean log scores are:

| Source p0 readout | Mean log score / GP29 four-gram |
| --- | ---: |
| Original p0 ciphertext, no inverse | −14.65597255 |
| Forward p0 minus p56 φ clock | −14.62676773 |
| **Reversed p0 minus p56 φ clock** | **−14.64463562** |
| Held-out native-GP control, minimum | **−11.03628387** |
| Held-out native-GP control, median | −10.40811081 |
| Held-out native-GP control, maximum | −9.61171314 |

Both candidate inversions score well below **every** finite held-out control. Reversed-φ begins \`GTHSEPNBUOUMSBDUNFPAEEWTHNGNGGNGOEYEOEOLEOAOPROEPEADEFCCSBNGPAEIAOEJSDMPXIPAEOAEBNY...\`; it is not recovered readable original plaintext. This retires only *the direct, phase-zero p56 φ cipher applied to p0 after the exact half-turn*. It cannot reject some other key, state-dependent inverse, or an alternative semantic use of the two crosses.

## Consequence and next original-cipher decision

The paired crosses are source-identical under half-turn to within JPEG-level variation. Future interpretations invoking two distinct symbolic crosses or hidden differences between their ornaments must confront this direct equality. The cross symmetry alone does **not** identify a cipher key and its placement is readily explained by layout reuse. The documented one-operation transfer from the known p56 method fails on original p0. More variants should be attempted only if an independently authenticated clue selects a different cipher or key.

**Reproducer:** [source-fixed standalone Python test](../sims/lp2_p0_inverted_cross_source_readout_sft.py), using the unchanged original scan, original canonical GP29 transcription, and frozen native-GP Shakespeare control. All source assertions and values are embedded. The script writes no files.
