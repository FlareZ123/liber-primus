# Liber Primus research: current evidence

As of **2026-11-10**, this repository contains all 75 original scan images in `resources/liber-primus/` and a separate, attributed community transcription in `resources/transcriptions/`. The 2014 manuscript consists of LP1 scans 00–16 and LP2 scans 17–74. According to independently reproduced public research, LP1's encrypted passages and LP2's final two pages (*AN END*, *PARABLE*) are solved. LP2 pages **0–55 remain undeciphered** (56 pages, one numeric-only, 12,956 runes across the remaining 55).

## Strongest currently supported external constraints

Published reproducible analyses establish near-uniform rune frequencies, a pronounced shortage of identical adjacent ciphertext runes (86 within the 12,956-rune LP2 corpus under the standard segmentation), and no established reusable short periodic key. Those observations are compatible with a long, nonrepeating keystream and a ciphertext-dependent no-repeat mechanism, but **do not uniquely determine the cipher**, recover its key, or prove that all conceivable alternatives are impossible. See [Wulfic's MASTER_TRACKER](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md), [Leo-Y-Zhang's reproductions](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis), and [Dukotah's solver dossier](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/SOLVERS-DOSSIER.md). This repository does not yet claim an independent LP2 decryption.

## Independent work in this repository

The first experiment attacks the unencrypted segmentation channel through **sequence matching of word lengths**. It verifies 20 consecutive expected rune lengths on the solved *PARABLE* as a positive control and finds no exact 10-word quotations nor 18-word sequences differing at only two length positions in four selected literary sources. This is an experimental exclusion for four editions and a single spelling model, **not** a general proof about the intended plaintext. See [full evidence, methods and limitations](../im-results/wordlength-literary-crib.md) and [scanner](../sims/wordlength_crib_scan.js).

## Major unresolved questions

The keystream source and mechanism remain unknown; so do all 56 encrypted LP2 pages' plaintext, the 256-cell base-60 grid's intended use, the deep-web hash preimage described by *AN END*, and any intended continuation of Cicada 3301. Further searches should be keyed to explicit hypotheses with known-plaintext controls, a controlled false-positive rate, and reproducible code. Derivations and negative screens belong in `im-results/`; only real novel decipherments or independently established, important mechanisms should be promoted here.
