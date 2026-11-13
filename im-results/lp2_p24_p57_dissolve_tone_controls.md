# LP2 p24/p57 mayfly residual: calibrated source-tone and Q92 gate

**Agent30, 13 November 2026; Director Issue #740. Status: preliminary negative on residual *count alone*, not a recovered image payload or full reproduction of the external 166-pixel refinement.** Reproducer: [source-native standalone Python test](../sims/lp2_p24_p57_dissolve_tone_control_sft.py).

## Original source and what human eyes select

Physical p24/p25/p26/p57 original JPEGs are archive files 41/42/43/74. The solved p57 dotted mayfly resembles the p24/p26 doubled insect. The 2013-available GIMP Dissolve algorithm supplies a specific renderer hypothesis. Its fixed seed is software metadata, not an independently selected cryptographic key. Research used the original image bytes in \`resources/liber-primus/\` and the old source-visible marginal plate; **no plaintext, rune-score model, or unknown LP2 ciphertext was consulted**. Source SHA-256:

| JPEG | SHA-256 |
|---|---|
| 41.jpg | \`62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80\` |
| 42.jpg | \`a7d6e597debff4f7c5b3516e1b02ca2e4fa5b37d972f567264ed2ec845013cff\` |
| 43.jpg | \`ed88f5fcdca3d1f846538caa8be979aa28cde969eb99c9464d60daa26c1f9af7\` |
| 74.jpg | \`1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b\` |

## Exact original-input checks

The original p57 source-image raster can be sampled at \`x=round(658+(c+0.5)*25/6), y=round(1979+(r+0.5)*25/6)\` for integer logical \`0<=c<293,0<=r<274\`. The full 293×274 frame has **2,033 black logical cells**, including four isolated source-published dots at \`(53,250),(44,256),(41,265),(57,269)\`. The independently reconstructed historical GIMP GLib field with initial seed \`314159265\`, 4,096 row seeds, x offset +4 and row offset −9 yields **R=0 at all four**. The published 293×267 research crop has a different vertical frame origin; the 274-row representation here retains all four bottom dots.

Original p24 and p26 grayscale crops \`x=0:600,y=900:2500\` have **zero changed pixels**. The p25 near-copy registers to p24 at source offset \`(-1,-1)\` and has Pearson r≈0.997 on the visible 560×620 subcrop. Its registered raster remains a genuine different source drawing/JPEG, suitable as an original editorial-variance control. These measurements reinforce copied artwork, not an authored bitstream.

## Frozen generative model and calibration

For the **specific source-tone sensitivity test**, the reference opacity is constructed from p24 original crop \`x=0:600,y=1100:1830\`, Gaussian sigma=1.2 source pixels, affine sampling \`x_src=-23.476689+2.518272*c+0.007736*r\`, \`y_src=1157.988073+2.399729*r\`, and opacity \`255*0.904071*((255-gray)/255)^1.006671\`. The seven numeric settings were fit to a **65% training-tile subset** of original p57 dots, then frozen for the controls. **They are exploratory and not a reconstructed historical editing recipe**. A separate 35% tile holdout gives F1 **0.6744367** (434 true positives, 229 false positives, 190 misses); training F1 **0.8097593**; full F1 **0.7694444** with 988 observed/model disagreements. The more elaborate external 31-parameter F1=.960096 model and its **166 residual coordinates were not reproduced here**. No claim about spatial coherence of those 166 specific cells is made.

Using the *same frozen model* and same deterministic GIMP field, changed logical bits under no-payload editorial changes are:

| Change to the source-opacity reference | Changed Dissolve bits |
|---|---:|
| p24→p26 exact repeated border | 0 |
| Registered p25 original near-copy | 58 |
| Increase opacity by 1 of 255, on nonwhite source cells | 155 |
| Decrease opacity by 1 of 255, on nonwhite source cells | 136 |
| Increase opacity by 2 of 255 | 328 |
| Decrease opacity by 2 of 255 | 230 |
| Increase opacity by 4 of 255 | 630 |
| Decrease opacity by 4 of 255 | 346 |

All are **known no-message transformations** on a repeated original source image or its opacity. The external 166-cell residual count lies in the range of ordinary 1–2-level global opacity changes even in this cruder model. Hence **the count 166 alone cannot distinguish a payload from a minute editorial difference**. This does **not** establish that any particular one-level edit explains the actual 166 residual *locations*.

The positive planted test writes a predeclared 8×8 64-bit checkerboard at logical \`c=40:47,r=170:177\` by setting exact opacity to \`R+1\` for ones and \`R\` for zeros, changing 32 of ~80,282 model cells (0.04%). A nearest-cell 2400×3600 clean black/white rendering recompressed at JPEG **quality 92** recovers **64/64 bits** at their known positions; the clean control returns **0 erroneous bits** over the whole logical frame. Thus the test can detect an intentionally placed mark under a known framing and source. These coordinates were *experimenter-chosen* and supply no historical readout.

## Decision for #740

**No independently meaningful differential key, message, address or GP29 operation has been recovered**. The GIMP algorithm is a credible production explanation, and a sparse residual is not evidence of encoded bits without a stable, independently specified image master, coordinates and framing. In particular, the original **166 specific refined residual cells have not been reconstructed or subjected to a spatial null distribution**, so the broader payload-channel question remains open. Next useful input is the exact published \`joint_k17_2\` model parameters or original pre-Dissolve alpha master; after freezing that source, rerun a single matched editorial/no-payload control and a source-authored bit-reading hypothesis. Avoid interpreting the numerical residual count, fitting pixel bits individually, guessing key strings from pi-seed, or unrelated generic JPEG stego searches. No LP2 plaintext or authentic cipher key resulted.

External provenance: [SECRA evidence, IR-01–IR-08](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html), [GIMP 2.8 original layer mode documentation](https://docs.gimp.org/2.8/en/gimp-concepts-layer-modes.html), and [the original-image p24/p26 template study](lp2-botanical-marginalia-template-gate.md).
