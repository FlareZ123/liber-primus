# LP1 p16 illustration: scarab, reclining figure and 5×5 square

**Status:** exploratory visual/historical lead only. No cipher mechanism or plaintext is established.

## What is actually visible

The original scan is `resources/liber-primus/16.jpg`. Its solved text is headed **KNOW THIS** and is followed by the 5×5 numeric square. The image places a beetle-like insect above the square and a reclining human figure below it. Calling the insect a scarab and the figure a mummy/corpse is an interpretation, not a fact established by the scan.

The square is centrosymmetric under 180° rotation. Its center is 809; every row, column and main diagonal sums to 3301. The direct/totient Hill-5, rank-order 25-rune transposition, and repeating additive-key uses have already been tested on original LP2 p0–p55 and produce no plaintext; see [the consolidated p16 gate](../im-results/lp1-p16-square-hill5-lp2-original-gate.md).

## Human solve-path hypothesis

A solver seeing **KNOW THIS**, a beetle, a human body, and a 3301 magic square might reasonably ask whether the illustrations select a historical or symbolic operation rather than another generic matrix cipher. If the insect is a scarab, plausible historical associations include Egyptian Khepri (solar renewal), the heart scarab in funerary practice, and Osiris. A 5×5 magic square also has a traditional planetary-magic association with Mars. None of these associations has yet been connected to Cicada by first-party evidence.

A numerical coincidence worth noticing, but not promoting: 3301 is the 464th prime, and a recovered 2013 CicadaOS `prime_echo` script contains 464 primes through 3301. That script is a historical/reconstructed 2013 artifact, not an authenticated instruction to use p16's square as a prime-index key. The relationship may be coincidental.

## Newly identified 2014 Stage07 cross-reference

The exact 3301 square from LP1 p16 appears verbatim as the **first** matrix in the contemporaneous community reconstruction `micheloosterhof/cicada-2014/stage07/magicsquares.txt` ([file](https://github.com/micheloosterhof/cicada-2014/blob/master/stage07/magicsquares.txt)). The same file also contains a 7×7 square with magic constant 1033 and, as its third matrix, the exact 5×5 1033 square used on LP2 p55. The GitHub file's recorded commit is `48893f174cb35c534ab23220b58845a78e72edac`, dated 2014-06-02. The repository README describes Stage07 as the large MP3 and marks it unsolved.

This is a strong **archival cross-reference**, but not proof of an upstream Cicada instruction: the repository is a community reconstruction, and the matrix file may have been populated by copying the Liber Primus pages into a Stage07 candidate list. Direction of dependency is unresolved. The next discriminating task is to inspect the 2014 Stage07 MP3, the history/origin of `magicsquares.txt`, and reliable LP1 release chronology to determine whether these squares were candidate solutions to Stage07 or were derived from LP1. Do not yet treat the 2014 file as an independent key source.

## Quick source check

A repository code search for `scarab`, `Khepri`, `Osiris`, `heart scarab`, and `Mars magic square` found no existing project treatment. A public search combining Cicada 3301 with those terms found no relevant first-party Cicada reference. Thus there is currently no external source bridge from the illustration to a cipher instruction.

Be careful with the Mars-square association: the traditional 5×5 Mars square uses the consecutive integers 1–25 and magic constant 65. The p16 table uses unrelated entries and constant 3301, so it is **not** the standard Mars square; order 5 alone is a weak visual analogy, not a match. For historical context, Kircher's *Oedipus Aegyptiacus* labels the canonical 5×5 construction *Sigillum Martis* and gives the 65 row sum: https://resources.warburg.sas.ac.uk/pdf/noh1050b2331892v.2.2.pdf. This reference does not connect the p16 square to Mars or Cicada.

## Weakest assumptions and decisive next test

The weakest assumption is that the illustrations are cryptographic selectors at all, rather than thematic artwork accompanying the text and square. A second weak assumption is identifying the beetle and reclining figure as scarab and mummy.

The cheapest discriminating work is historical/source research, not more numerical search: look for pre-2016 Cicada material that explicitly links scarabs, Khepri, Osiris, heart scarabs, Mars magic squares, or the 3301/464 pair to a cipher operation. If no first-party selector emerges, do not launch spiral traversals, center-cell keys, or 464-prime sweeps. Preserve this as a visual lead only.
