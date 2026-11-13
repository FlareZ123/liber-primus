# Authenticated 2013 Parable number as a deterministic MT19937 seed: an original-LP2 inverse gate

**Research status (Agent 20, 13 November 2026):** A distinct, historically motivated *source-selected seed* was tested against **all 12,956 original unknown LP2 runes**, using 48 exactly specified reversible GP29 additive inverses. The most favorable whole-book IoC was **0.03595919**, versus **0.06270997** for the original known-clear p57; the decoded outputs remain ciphertext-like. **No unknown Liber Primus plaintext, original encryption key, decoding method or continuation address was recovered.**

## Why this key has a causal path to plaintext

The immutable 2013 audio source \`761.MP3\` contains an ID3 TXXX description literally \`Parable 1,595,277,641\`. Its value is the independently reconstructed product of the three prime-valued clause totals of the actually solved LP2 p57 Parable:

\[
1259 \times 1031 \times 1229 = 1595277641 .
\]

These are source-linked numbers from before the release of LP2, rather than researcher-generated seed candidates. [The byte-exact 2013 audio ID3 inventory](audio761-original-id3-frame-inventory.md) preserves the archived original SHA-256 and parsed message. A source writer versed in the 2013 Python-era Cicada challenge might plausibly treat this large integer as a reproducible random-number-generator seed, whose 29-symbol output encrypts the later runic manuscript with the historically demonstrated GP29 additive cipher. This supplies a testable idea for a candidate **key**, not only a structural coincidence.

**Unsupported leap:** neither original ID3 text nor later signed Cicada messages instruct the reader to seed Python's Mersenne Twister from the Parable number, use MT output as a GP29 pad, or choose a key clock. The experiment consequently covers a finite, explicitly declared family and does not identify an authenticated generator.

## Exact program and 48 source-pinned inverses

The source is unchanged \`resources/liber-primus/lp2-corpus.json\`: 55 rune-bearing unknown physical pages p0–55, 12,956 symbols; p50 is runeless. Set the MT19937 initial seed to the **exact decimal integer 1,595,277,641**, without byte encoding, offset, salt, KDF, hash, brute-force seed search or key fitting. Initialize with CPython's 32-bit integer \`init_by_array\` construction. The first five \`random()\` values are precisely:

\`0.9507952938928932, 0.5667359452061599, 0.5505065894518398, 0.37170915127859805, 0.29726430698699413\`.

These were compared to Python \`random.Random(1595277641)\` and assert exactly in the reproducer. The legacy Python \`randrange\` style and contemporary rejection-based \`randrange\` are intentionally distinguished. <https://docs.python.org/3/library/random.html>

Use four deterministic outputs from the same unchanged MT stream:

- \`py2\`: \`floor(29*random())\`, with two MT32 draws per 53-bit float, matching the historically documented pre-Python-3.2 integer selection.
- \`py3\`: \`getrandbits(5)\`, discard values 29–31, with most-significant-five-bit extraction.
- \`word\`: \`next32() mod29\`.
- \`scaled\`: \`floor(29*next32()/2**32)\`.

For each, use three original source clocks: a continuous 12,956-rune stream; restart at each printed rune-bearing physical page; or restart at the nine visually supported unknown chapter starts \`[0,3,8,15,23,27,33,40,54]\`. For each clock, apply both already attested GP29 additive signs \`(C+K) mod29\`, \`(C−K) mod29\`. For each sign, include exactly two historically demonstrated F policies: either treat index-zero F as an ordinary encrypted rune, or copy ciphertext F to plaintext F while *not consuming* an MT key symbol. The full design is **4×3×2×2=48**, all input pages unmodified.

## Executed original-input result

| Original control / best variant | Whole-book native GP29 IoC | Meaning |
| --- | ---: | --- |
| Original 12,956 unknown runes | **0.0344783978645** | Approximately uniform symbols |
| Best of 24 variants without F bypass: Python-2 clock, chapter resets, subtract | **0.03450663** | No recognizable plaintext |
| Best of 24 variants with F bypass: scaled MT32, page resets, add | **0.03595919** | Still ciphertext-like |
| Solved, unencrypted physical p57 native GP runes (95) | **0.0627099664054** | Genuine English-language positive reference |

Across all 48 direct original inverses, the observed whole-book IoC range is **0.03444534–0.03595919**. The best output's intact **76-rune p55** has IoC **0.03754386** and no meaningful terminal instruction; the terminal twelve GP transliterations are \`NG D I EA P Y W Y M N J B\`. The source ID3 number does not give a successful simple additive MT pad on any of the frozen source clocks.

**Implementation controls:** the MT CJS reimplementation asserts five exact independent CPython \`random()\` outputs. It tests original solved p57 runes as a synthetic encryption/decryption plant under each of the four generator outputs, and checks F-bypass correctness on a collision-free constructed sample. The original-source 48-score calculation was executed independently in a JavaScript tool; the committed standalone Node22 SFT contains the complete original-input test and asserts that even its highest IoC remains under 0.04. **The standalone file has not yet been run by GitHub CI**; the exact submitted numbers above are from the independently executed implementation and are not a claim of CI execution.

**Reproducer:** [\`sims/lp2_signed2013_parable_mt_seed_original_sft.cjs\`](../sims/lp2_signed2013_parable_mt_seed_original_sft.cjs). The initial Python2/3 output-method distinction is documented by the official Python \`random\` documentation. No original artifact is modified.

## Decision

Retire **the fixed signed-2013 Parable product as an MT19937 GP29 additive pad** under these explicit four draws, three clocks, two signs and two F policies. The source number remains a real historical clue, and a different *source-instructed* construction is possible, but another variation on password formatting, hash prefix, dynamic threshold or newly tuned phase would be unmotivated.

A successful successor must disclose a new original cue fixing a different reversible consumer of this source number, or supply a genuine unknown-page plaintext/key. Do not relabel the failed MT output as a decryption.
