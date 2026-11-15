# LP1 p16 illustration: scarab, reclining figure and 5×5 square

**Status:** exploratory visual/historical lead only. No cipher mechanism or plaintext is established.

## What is actually visible

The original scan is `resources/liber-primus/16.jpg`. Its solved text is headed **KNOW THIS** and is followed by the 5×5 numeric square. The image places a beetle-like insect above the square and a reclining human figure below it. Calling the insect a scarab and the figure a mummy/corpse is an interpretation, not a fact established by the scan.

The square is centrosymmetric under 180° rotation. Its center is 809; every row, column and main diagonal sums to 3301. The direct/totient Hill-5, rank-order 25-rune transposition, and repeating additive-key uses have already been tested on original LP2 p0–p55 and produce no plaintext; see [the consolidated p16 gate](../im-results/lp1-p16-square-hill5-lp2-original-gate.md).

## Human solve-path hypothesis

A solver seeing **KNOW THIS**, a beetle, a human body, and a 3301 magic square might reasonably ask whether the illustrations select a historical or symbolic operation rather than another generic matrix cipher. If the insect is a scarab, plausible historical associations include Egyptian Khepri (solar renewal), the heart scarab in funerary practice, and Osiris. A 5×5 magic square also has a traditional planetary-magic association with Mars. None of these associations has yet been connected to Cicada by first-party evidence.

A numerical coincidence worth noticing, but not promoting: 3301 is the 464th prime, and a recovered 2013 CicadaOS `prime_echo` script contains 464 primes through 3301. That script is a historical/reconstructed 2013 artifact, not an authenticated instruction to use p16's square as a prime-index key. The relationship may be coincidental.

## Original 2014 Stage07 square relationship, corrected to LP1 pages

The original LP1 p16 **5×5/3301** numeric square matches matrix 1 in the source-extracted 745-byte OpenPuff magicsquares.txt. Matrix 3 is the **5×5/1033** square also encoded and printed on **LP1 p05**, as already established in [results/README.md](../results/README.md). Matrix 2 is the **7×7/1033** square used with the other two in the historical Stage10 three-square form. The [community file](https://github.com/micheloosterhof/cicada-2014/blob/master/stage07/magicsquares.txt) is another copy, not the sole basis for attribution.

**Important page correction:** the Stage07 third square is **not printed on LP2 p55**. LP2 p55 is the original 72.jpg: encrypted rune text, tree and moth, with no 5×5 numeric square. A former version of this note misidentified the LP2 page and thus suggested an unsupported terminal-square key bridge. Do not commission LP2 p55 key work from that error.

The direction of the 2014 original payload is independently established. Native OpenPuff v4.00 recovered the exact file from the original Cicada *Interconnectedness* MP3, password A=33011033, B/C disabled, MP3 Maximum1/2: 745 bytes, native CRC32 6A8C41E3 and SHA-256 9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f. See [original-media extraction](../im-results/openpuff-jpeg-capacity-gate.md) and [passing Windows run](https://github.com/FlareZ123/liber-primus/actions/runs/43662139707). [Contemporaneous discovery logs](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_8) date the extraction to 6 February 2014, preceding LP2's May release. The original Stage10 form explicitly consumed the three recovered matrices as submissions; its exact limits are already summarized in results/README.md. That solved-stage role supplies **no direct original LP2 decryption operand**.

A fruitful new lead would therefore require a different first-party source selecting a reversible operation or receiver for the p16 scarab/body illustration, beyond the already-established magic-square appearance and its solved-stage use.

## Quick source check

A repository code search for `scarab`, `Khepri`, `Osiris`, `heart scarab`, and `Mars magic square` found no existing project treatment. A public search combining Cicada 3301 with those terms found no relevant first-party Cicada reference. Thus there is currently no external source bridge from the illustration to a cipher instruction.

Be careful with the Mars-square association: the traditional 5×5 Mars square uses the consecutive integers 1–25 and magic constant 65. The p16 table uses unrelated entries and constant 3301, so it is **not** the standard Mars square; order 5 alone is a weak visual analogy, not a match. For historical context, Kircher's *Oedipus Aegyptiacus* labels the canonical 5×5 construction *Sigillum Martis* and gives the 65 row sum: https://resources.warburg.sas.ac.uk/pdf/noh1050b2331892v.2.2.pdf. This reference does not connect the p16 square to Mars or Cicada.

## Weakest assumptions and decisive next test

The weakest assumption is that the illustrations are cryptographic selectors at all, rather than thematic artwork accompanying the text and square. A second weak assumption is identifying the beetle and reclining figure as scarab and mummy.

The cheapest discriminating work is historical/source research, not more numerical search: look for pre-2016 Cicada material that explicitly links scarabs, Khepri, Osiris, heart scarabs, Mars magic squares, or the 3301/464 pair to a cipher operation. If no first-party selector emerges, do not launch spiral traversals, center-cell keys, or 464-prime sweeps. Preserve this as a visual lead only.
