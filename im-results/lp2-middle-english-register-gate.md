# Middle English native-GP register gate (#2966)

**Final decision — 26 November 2026: no new scoring register and no original-candidate follow-up.** The source-derived C7 check treats the tested Middle English corpus as too close to covered English to validate a distinct language label. The full four-null C8 test confirms that the existing Panel R36 already recognizes the held-out Middle English material at the required benchmark. No LP2 ciphertext candidate was scored; no plaintext, key, receiver or continuation was recovered.

## Pinned sources and model

The completed C7/C8 run used two independent, public-domain, late-fourteenth-century English sources:

- **Training:** Geoffrey Chaucer, *Troilus and Criseyde*, Project Gutenberg #257, pinned GITenberg revision [936356e95c3eaf033a7064e7aac62562e120351e](https://github.com/GITenberg/Troilus-and-Criseyde_257/blob/936356e95c3eaf033a7064e7aac62562e120351e/257.txt), Git blob 45829db668a199af8378b507549d0a970b90a6a5. The crop begins after “BOOK I. Incipit Liber Primus” and ends before “Explicit Liber Troili et Criseydis.” Internal Latin book headings remain as a small contamination.
- **Held out:** John Gower, *Confessio Amantis*, English Prologue, G. C. Macaulay edition, Project Gutenberg #266, pinned GITenberg revision [8551b982c2f0efa6bfb3fc775ad619c2954a0c03](https://github.com/GITenberg/Confessio-Amantis--Or-Tales-of-the-Seven-Deadly-Sins_266/blob/8551b982c2f0efa6bfb3fc775ad619c2954a0c03/266.txt), Git blob a84e11740796df8f70ef5a54fc8d9c919f41831e. The crop begins after “Absit, et interpres stet procul oro malus.” and ends before “Explicit Prologus”; the Latin epigraph and final Latin heading are excluded.

The source text SHA-256 values and exact extraction/table manifests are preserved in the Actions artifact. The fixed greedy GP orthography maps ING→NG, IO→IA, K/Q→C, V→U and Z→S; thorn/eth→TH and yogh→G are declared graphemic conventions, not claims about contextual phonology. The source editions are ASCII, so those latter characters do not occur. No LP2 material or LP2-derived vocabulary enters training.

| Corpus | Words | Sentences | GP29 runes | Two-rune words |
|---|---:|---:|---:|---:|
| Chaucer training | 67,132 | 2,449 | 245,837 | 15,423 (22.9741%) |
| Gower heldout | 6,578 | 116 | 25,759 | 1,612 (24.5059%) |
| LP2 p0–55 | 2,896 printed groups | — | 12,956 | 448 (15.4696%) |

The candidate scorer is a conditional GP29 four-gram model with recursive suffix backoff, fixed prior weight 12 and unigram half-count smoothing. It is trained only on Chaucer and evaluated on Gower. The exact upstream C7/C8 reference is pinned at [Dukotah/cicada3301 commit fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb](https://github.com/Dukotah/cicada3301/tree/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb).

## C7 result and printed-boundary constraint

C7 returned status 1 with its explicit label-gate warning: the corpus GP bigram profile is within the 0.06 Jensen–Shannon threshold of covered English. The measured English distance is **0.0571**; English is the only label hit. The checker itself cautions that close relatives such as Middle English may legitimately trigger this sanity gate and says maintainers should inspect the source and table by hand. The operational result is nevertheless that this submission did not establish a distinct, previously uncovered register.

The fixed C7 word-length placement also remains incompatible with LP2's unusually low two-rune-word share. Against the complete donors, exhaustive contiguous 2,896-word windows gave:

| Donor | Windows | Minimum two-rune share | LP2 G statistic | Maximum within-donor G | Windows with G ≥ LP2 |
|---|---:|---:|---:|---:|---:|
| Chaucer | 64,237 | 20.1657% | 618.666 | 53.834 | 0 |
| Gower | 3,683 | 22.7210% | 484.628 | 12.269 | 0 |

No tested donor window has as few two-rune words as LP2. These are overlapping within-text windows, not independent observations or a universal language theorem. They do not exclude different Middle English orthographies, genres, or a ciphertext whose printed groups are not plaintext words.

## Completed C8 four-null test

The full reference checker was executed in manual workflow run [45850489263](https://github.com/FlareZ123/liber-primus/actions/runs/45850489263), from repository commit [57cc181a2080e4d85631d2efeef26e1ca1efec29](https://github.com/FlareZ123/liber-primus/commit/57cc181a2080e4d85631d2efeef26e1ca1efec29), using [sims/lp2_middle_english_register_gate_sft.py](../sims/lp2_middle_english_register_gate_sft.py). The first attempt, run 45850131784, failed before completing C7 because an upstream Welsh reference is gitignored; the successful revision restores the exact frozen Welsh input documented by R36 and verifies its Git blob SHA-1 before running. The corrected run completed successfully.

For each window length, the test used 200 correct-key planted positives, 2,000 samples for each cheap null, and 500 wrong-key beam decodes. The four null classes are uniform random runes (u), real LP2 windows (r), shuffled positive windows (s), and beam decodes of real LP2 under a wrong key (w). The threshold controls FPR at 1% against every class. Results:

| Window length | Chaucer-trained Middle English scorer | English baseline | Existing Panel R36 |
|---:|---:|---:|---:|
| 236 | 200/200 (1.00) | 200/200 (1.00) | 200/200 (1.00) |
| 120 | 200/200 (1.00) | 200/200 (1.00) | 200/200 (1.00) |
| 60 | 200/200 (1.00) | 200/200 (1.00) | 200/200 (1.00) |

At the headline 236-rune length, all three scorers achieved 1.00 power against **each** of the four null classes. The Middle English scorer's threshold was −4.365169; the incumbent Panel R36 threshold was 13.987134. C8's recorded decision is **panel_already_sees**. The required new-register finish line is not met as an extension because the incumbent already exceeds the 0.80 threshold. This is not evidence that the two scorers implement the same model; it is the direct result that the incumbent detects the held-out positives just as reliably under this test.

The result artifact is named `lp2-middle-english-register-gate`, artifact ID 15132713303, SHA-256 `1493f411fe81fa20bccd2c985daf7ed3a3f69e5937de66f2d5c6b8238811d741`. Its `output.json` SHA-256 is `454c06d95a4b234c4a0f9655e354d90915bd56f93c569410df26c591b2cde562`. It contains both source manifests, derived corpora, the fitted model array and complete C7/C8 output.

## Decision and scope

The C7 label gate did not establish Middle English as a new register, and C8 shows that Panel R36 already recognizes the held-out Gower text at L=236. Therefore the issue's explicit stop condition is met. **Do not score an LP2 candidate, expand the Middle English corpus, or start another language-model sweep on this basis.** Close #2966 as complete with the measured negative.

This is a result about incremental scoring coverage for the two tested late-fourteenth-century editions and the fixed GP mapping. It does **not** prove that LP2 plaintext cannot be Middle English, does not exclude another dialect or orthography, and does not identify any encryption mechanism. Reopen only if an independently selected source supplies a materially different register/orthography that the existing panel fails to recognize, not merely because another corpus can be assembled.

## Earlier direct diagnostic (not C8)

A separate preliminary diagnostic used the same Chaucer/Gower source pair and a fixed conditional four-gram model, but did not perform the C8 keyskip plant, wrong-key beam null, or incumbent-panel comparison. With xorshift32 seed 2966, 200 heldout windows per length and 2,000 draws each for uniform, real-LP2 and shuffled nulls, the direct model scored all positives above each of those three thresholds:

| Length | Uniform threshold | Original-LP2 threshold | Shuffled threshold | Direct power |
|---:|---:|---:|---:|---:|
| 60 | −6.018144 | −6.085444 | −3.912972 | 1.00 |
| 120 | −6.464007 | −6.450830 | −4.205562 | 1.00 |
| 236 | −6.694205 | −6.709891 | −4.364123 | 1.00 |

This preliminary result is retained only as model-development history. It is not substituted for the completed C8 evidence above.
