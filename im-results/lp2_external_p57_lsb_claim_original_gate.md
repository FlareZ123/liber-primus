# External p57 LSB-index “complete solution”: original-source control falsification

**Decision, 14 November 2026, Agent38 (Director #870):** A recently publicized “complete solution” appears to offer a source key independent of LP2 ciphertext. Its exact proposed LSB-zero coordinate extraction on the original LP2 final-page JPEG is reproducible, including the advertised **1,543** positions. But its suggested **eleven Welcome master indices** have only **8/11** source-coordinate membership, multiple wrong manuscript images have **11/11**, and the advertised modulo29 Vigenère key decrypts **0/7** characters of the original historically solved **WELCOME** opening. This closes this source-to-key route before attempting an arbitrary LP2 unsolved word. No authentic new LP2 plaintext or key recovered.

## Why this lead was chosen

An external 28 October 2025 research package publicly titled [FINAL_COMPLETE_SOLUTION.md](https://github.com/nexon33/cicada3301/blob/main/FINAL_COMPLETE_SOLUTION.md) claims to select eleven numeric “master indices” by reading LSB bit-plane zeros in the original manuscript’s final-page image, convert the selected indices into a repeating GP29 Vigenère key using **index mod29**, and reproduce the solved WELCOME page. Its [EXTRACTION_DOCUMENTATION.md](https://github.com/nexon33/cicada3301/blob/main/EXTRACTION_DOCUMENTATION.md) supplies a fully executable pixel rule. The reported key is [4,15,28,7,14,15,14,15,16,16,22], from indices [62,102,115,181,217,218,333,566,596,625,689]. Its proposed “skip” positions start at rune29, so the first seven original WELCOME runes are an exact independently predetermined test with no skip ambiguity.

There are three conceptually distinct human route classes worth distinguishing, rather than broadening this one after failure: an authenticated instruction (such as the 2016 words/numbers/direction hint) that selects a physical movement; a manuscript-authored numerical operator (such as the GF29 factors of the p50 table) that selects a cipher; and a *hidden first-party message* genuinely extracted from original image coefficients or pixels. This external claim purports to supply the last of those. The 2016 movement lacks an independently specified start/stop, and p50's known factors lack a plaintext-register consumer; both are already bounded elsewhere. Accordingly this report tests **only** the newly encountered published original-image route.

## Source-image falsifier: actual final page and wrong images

The exact 2014-image source named by the external author is cicada-solvers/iddqd/liber-primus__images--unsolved/57.jpg. Its Git blob is 4397143b4df5ad729b00cfd740a74994052f46d2, the same byte-for-byte image that this repository stores as resources/liber-primus/74.jpg, **LP2 physical p57**, 2,400×3,600 JPEG. This resolves the full-archive versus LP2-only filename mapping.

The external algorithm converts that JPEG to 8-bit grayscale, crops at floor(0.4×height), selects **every** pixel whose grayscale least-significant bit is zero, and unions all zero pixels' x and crop-relative y coordinates. Exact reproduction gives **1,543 unique coordinates**, range **0–1,791**, from **136,346** zero-bit pixels. This reproduces the source-independent integer 1,543 perfectly, but the eleven selected coordinate values are only eight actually present: **217, 218, 566 are absent**. This agrees with the same author's [VERIFICATION_REPORT.md](https://github.com/nexon33/cicada3301/blob/main/VERIFICATION_REPORT.md), which calls the three missing values *derived* and supplies ad hoc 102+115=217, 333−115=218, 333+233=566. By contrast their EXTRACTION_DOCUMENTATION claims all eleven are present with positive frequency, including 217:214, 218:221 and 566:116. Source's true frequencies are **0, 0, 0** for those three, and **484** at coordinate 333 (one doc incorrectly says 32). The package's two incompatible data descriptions should not be conflated.

There is an independent discriminating wrong-page control: run the exact same bit-zero and coordinate-union operation, without refitting thresholds or master lists, on other **original JPEGs**. The result measures how strongly coordinate membership alone isolates p57:

| Physical LP2 page | Unique coordinates | Of 11 claimed master indices present |
| ---: | ---: | ---: |
| p15 | 1,766 | **11** |
| p32 | 1,392 | 7 |
| p40 | 2,272 | **11** |
| p53 | 2,281 | **11** |
| p54 | 2,264 | **11** |
| p55 | 2,304 | **11** |
| p56 | 1,511 | 5 |
| **p57 target** | **1,543** | **8** |

The claimed “all eleven appear” validation is **easier to satisfy on five wrong original pages** than on the named source. A coordinate's appearance is unsurprising because a manuscript image contains hundreds of thousands of grayscale pixels, making many x/y coordinate values occur with LSB zero. This observation does not exclude other, separately specified image steganography; it tests exactly the published operation.

## Authenticated known-plaintext falsifier: first seven WELCOME runes

A particularly strong test avoids all ciphertext-language scoring. The original LP1 **WELCOME** page first seven GP ciphertext runes, read from the independent source transcription resources/transcriptions/lp1_wulfic_canonical.txt, are

    U / EA / NG / S / EO / F / C

The independently authenticated plaintext is literally **WELCOME**, and the required modulo29 shifts, in the canonical published GP alphabet, are

    D / I / U / I / N / I / T

They exactly re-encrypt all seven original runes. This is the first seven runes of the already-established Vigenère **DIVINITY** key, where original GP uses **U** for V. The external “master indices mod29” key instead begins

    R / S / EA / W / X / S / X

It decodes the exact same untouched source runes to

    Y / P / OE / H / IA / X / L

This matches **0/7** of the already-solved source plaintext. The source claims its first skip rune is local position29, so none of these seven can be excused by the advertised skip mechanism. A second unidentified cipher or newly refitted skips would be an entirely different, unauthenticated model.

**Reproducers:** [CJS original WELCOME seven-rune test](../sims/lp1_external_masterindex_claim_original_sft.cjs); [Python/Pillow/NumPy original-JPEG source and wrong-page tests](../sims/lp2_external_p57_lsb_zero_controls_sft.py). They read only the original repository artifacts and contain source-exact finite assertions. The same observations were independently computed using the maintainer-supplied exact image ZIP and GitHub-fetched original GP source before the SFTs were committed.

## Causal decision and remaining gap

This is a direct falsification of the *claimed* source-selected Vigenère key. The image algorithm's 1,543-position output is real, but is not demonstrated to encode puzzle-authored coordinates: it fails a wrong-page discrimination check, requires three post hoc derived positions, and fails the easiest solved-source plaintext control.

The external package is therefore unsuitable as a key source for LP2. A new attempt must supply an independently identified original hidden payload with a positive period-method control **and** demonstrate that its derived key decrypts known text before trial on unknown pages. Existing 2014 and 2016 source material still does not specify a new executable first action for any of the three independent route classes above. Stop here rather than rescuing the failed public extraction by scanning alternate bit planes, coordinate transforms, thresholds, or Fibonacci choices.
