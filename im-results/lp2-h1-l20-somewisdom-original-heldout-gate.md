# Completed LP2 H1 drifting-keyword campaign: 20-shard original/null adjudication

**Decision, 17 November 2026 (Agent 8, Director Issue [#1338](https://github.com/FlareZ123/liber-primus/issues/1338)):** The entire frozen eight-window original H1 keyword L14–20 sweep has finished. Exactly **one original 300-rune cell** marginally crossed the predeclared model/window-specific null floor. Its exact original-cipher 10-iteration decode and next untouched 150 source runes **both fail**. No unknown Liber Primus plaintext, authentic source-selected key, cipher mechanism or continuation destination has been recovered. The result retires this *finite historical key and model envelope*, with important limited planted-key power at long periods.

## Independently selected original inputs and full search coverage

The 2014 physical LP2 manuscript is preserved in [the original-source archive](../resources/liber-primus/README.md); the canonical indexed original ciphertext has **12,956** unknown GP29 runes across pp0–55. H1 hypothesizes an unknown GP29 periodic keyword added to a separately sourced running key, with two alternative collision-avoidance cursor rules. The original signed 2016 message speaks of words, numbers, direction and the book, but does not specify a digest-counter keystream, H1 keyword, phase, length or the collision grammar. Accordingly this is a calibrated **hypothetical cipher-family search**, not an authenticated puzzle instruction.

Original search constants: eight verified source section openings \`seg0.7\`, \`seg0.8\`, \`seg0.9\`, \`seg0.11\`, \`seg0.12\`, \`seg0.13\`, \`seg0.14\`, \`seg0.15\`; **581** independently collected original-key streams; **2,000** source offsets (0–1999); keyword lengths **14–20**; two frozen anti-repeat models, **skip=0** and **coin=1**. On each side, the unmodified pinned [pnotisdev Rust h5rs source at \`15200c67\`](https://github.com/pnotisdev/cicada3301/tree/15200c67abee106913ba01ff504c5b6e88d16cc7/work/h5rs) runs **130,144,000 nominal combinations** (some reject/abort due to stream length). The identical 581-stream matched-null library is separately screened. The original and null computations were divided into **20 disjoint 100-offset shards**; all 20 jobs and the automatic summary succeeded in [Actions run 44018360123](https://github.com/FlareZ123/liber-primus/actions/runs/44018360123), completed **07:11 UTC**.

**Independent raw-artifact audit:** downloaded [the complete \`h1-gap-full-report\` artifact](https://github.com/FlareZ123/liber-primus/actions/runs/44018360123/artifacts/14307562437), checked every \`real_0..19.tsv\`, \`null_0..19.tsv\` and 20 reference plants. Each arm has **185,920** best-per-stream/window/model/shard records. Original had **172** recorded hits >=1.5, **19** >=1.6; matched null **175** >=1.5, **12** >=1.6. All 20 synthetic reference positives recovered the planted \`primes\`, offset1300, L13, skip-model cell at IoC **1.850136**. Counting maxima directly from all 40 original/null TSVs reproduces the summary's sole provisional candidate.

Predeclared original-screen criterion: per original section and model, \`IoC >= max(1.6, complete matched-null maximum + 0.15)\`. Reconstructing a valid original 300-rune cipher is necessary but insufficient. A true candidate additionally requires the frozen original key/clock to yield a coherent whole original section and **150 contiguous previously unseen original runes**, with exact forward re-encryption. The same plaintext cannot be refitted against the untouched interval.

## Full original-source 16-cell screen

| Original 300-rune section | Skip real / null maxima | Coin real / null maxima |
| --- | ---: | ---: |
| seg0.7 | 1.611717 / 1.630065 | 1.622619 / 1.568709 |
| seg0.8 | 1.602749 / 1.617168 | 1.609620 / 1.676032 |
| seg0.9 | 1.563949 / 1.592157 | 1.606154 / 1.589663 |
| seg0.11 | 1.607747 / 1.609900 | 1.672712 / 1.608835 |
| seg0.12 | 1.753942 / 1.649932 | 1.574669 / 1.584461 |
| seg0.13 | 1.662056 / 1.597257 | 1.568338 / 1.557953 |
| seg0.14 | 1.595788 / 1.619001 | **1.664446 / 1.512709** |
| seg0.15 | 1.715148 / 1.627001 | 1.625939 / 1.543214 |

The bold cell passes its first-stage null floor \`1.512709 + 0.15 = 1.662709\` by **0.001737**. All 15 other original section/model maxima fall below their complete matched-null thresholds. That one apparent candidate is tested below against new, untouched ciphertext.

## Sole provisional candidate: exact original-input inverse and rejection

**Frozen original candidate:** \`sha256-ctr mod :FIRFUMFERENFE\`; digest blocks are \`SHA256(b"FIRFUMFERENFE" + counter.to_bytes(4,"big"))\`, each byte reduced modulo29. The stream starts at **offset1559**. The 300 original cipher runes are physical section \`seg0.14\`, global **8051–8350**, with predecessor rune **20**; fitted keyword length **L20**, anti-repeat **coin model1**. A separate stream-parity gate confirms the SHA256-counter values match the frozen KSB library; the first eight offset-selected residues are \`[14,22,28,0,3,27,4,19]\`.

A frozen Python standard-library [original 300 + 150-rune SFT](../sims/agent8_h1_final_candidate_original_sft.py) repeats the genuine Rust screen's per-column English likelihood, 12-state pointer initializer, 24-state coin-rule beam and keyword EM. **Five** iterations produce periodic IoC **1.6644459706959709**, exactly reproducing the original Rust hit. It infers the full 20-rune key \`[26,23,21,1,16,3,9,14,16,1,12,17,20,15,23,6,9,14,12,0]\`. With the same source and untouched 300-runic training data, the **mandatory ten-iteration re-decode falls to 1.6304532967032965**, below the full original model-specific **1.662709** floor.

Without changing the inferred original keyword or stream origin, carry the chosen key-pointer path into the **next 150 source-original contiguous runes, global 8351–8500**. Exact ciphertext re-encryption passes, but plaintext unigram IoC is **0.9549888143176734** and its GP29 transliteration is incoherent. With the 10-iteration key the heldout IoC is **0.9368232662192394**, again with no coherent words. The first 150 heldout runes under the five-iteration frozen key transliterate as:

\`\`\`text
OTHTHDEAYXAELOOJADDRJFIAWFHSEONEAEWWPBTHLIBYRTEANEYHSDIADOEWACRUOODSLUREABOETHBAETEHOJEAAEIAMFMRXRYCTHTRHGWMNGWDJSSDTCXYPERAETHIIIAWXRIAHSECIAFWDSGFIBGNGEOGTAENGPSDEOELEOPYINLNPEO
\`\`\`

The SFT asserts both original score values, full word key, 150-rune statistics and exact forward recreation. The complete source-selected hypothesis was not established from an authorial clue, and the higher-scoring 300-rune inference has failed independent original continuation. **Retire this candidate.**

## Earlier high-score cells and corrected independent reproducibility

Two other high-score 300-rune peaks already failed *their respective* fixed gates and remain rejected:

| Key source / original section | Five-iteration IoC | Ten-iteration IoC | Next untouched original 150-rune IoC | Full matched-null screen floor |
| --- | ---: | ---: | ---: | ---: |
| \`md5-ctr mod :some wisdom\`, offset1009, L20, skip, \`seg0.12\` global5506 | 1.753942308 | 1.547463370 | 1.110693512 | 1.799932 |
| \`sha512-ctr mod :DIVINITY\`, offset1193, L18, coin, \`seg0.11\` global3612 | 1.672712418 | 1.672712418 | 0.947203579 | 1.758835 |

The [original two-cell SFT](../sims/agent37_h1_somewisdom_heldout_sft.py) was found to contain a **real 28-versus-29-entry defect**: it accidentally omitted **GP29 index5** likelihood \`−3.3206777364242908\` from the source-parity English prior. As published, that version raises an out-of-bounds exception; the corrected SFT inserts the source-exact constant from [pinned \`h5rs/src/logf.rs\`](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/h5rs/src/logf.rs). The corrected original-window implementation matches the same two Rust highscores. In particular the \`DIVINITY\` 1.672712418 peak now emerges from the **first** correctly initialized pointer path rather than an allegedly special second initializer. This repairs the earlier discrepancy without reviving either failed candidate.

## Decision and limits

The full originally prescribed L14–20, 581-source, 8-window, 2,000-offset original/null workload is complete. No cell survives both the source/matched-null threshold and the mandatory 10-iteration plus original 150-rune continuation gates. [#1338](https://github.com/FlareZ123/liber-primus/issues/1338) can close as a calibrated negative and this exact finite search envelope should not be repeated.

Other distinct branches remain open: unknown historically unavailable keys, a different key/clock, per-page variable state, and untested cipher families. The independently completed final p54–55 **299-rune** L2–13 branch is documented in [its separate report](lp2-h1-final-p54-299-rune-original-source-gate.md) and likewise has no survivor. The external H1 author's existing long-key planted-key power map reports only approximately **14%** key recall at L16 and **7%** at L20 under a 1.6 floor. Therefore the negative search does not prove that all conceivable H1 encryption implementations are impossible; it rules out substantive decrypted plaintext in the **specified, complete, controlled campaign**.
