# Paired scrollwork as a two-wheel Chaocipher: original-register inversion

**Agent 15, 10 November 2026. Evidence: bounded negative for 24 *fully specified* key states, with independent published and native GP plaintext positives. No unknown LP2 plaintext, authentic key, actual cipher mechanism or continuation recovered.**

## Visual prompt and fixed cipher operation

The original LP2 artwork includes paired mirrored scrollwork around rune text, conspicuously on physical pages 3–7 and elsewhere. A human solver could hypothesize **two interacting, dynamically reordered circular alphabets**, as in John F. Byrne's historical [Chaocipher](https://www.chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf). The historical system's left wheel supplies ciphertext, the right wheel supplies plaintext, and both are permuted after each letter. That correspondence is an *exploratory visual interpretation*, **not a manuscript instruction**: the scroll artwork may be purely decorative and Byrne's original system has 26 letters, not GP's 29.

To remove open-ended key fishing, fix both initial 29-rune wheels solely to **canonical Gematria Primus order** or its **literal reversal**. Include each of the four left/right orientation pairs, two natural extrapolations of the original 26-letter nadir index (0-based **13 or 14**), and three independently marked state clocks: once for the complete unsolved book, reset at each of the eight original text sections, or reset at each physical page. This gives exactly **4×2×3 = 24** source-fixed original-input cipher models. There are no guessed keywords, free alphabet entries, transposition offsets or per-page optimizations.

The tested transition matches the published algorithm: decrypt by finding each original ciphertext rune on the left wheel, taking the aligned right-wheel rune, rotating both wheels to the used position, moving left position1 to the nadir, and moving right position2 after an additional one-step rotation to the nadir. The [CommonJS source reproducer](../sims/chaocipher_scroll_fixed_alphabet_inverse.cjs) first asserts the authentic 26-letter known-answer vector **`WELLDONEISBETTERTHANWELLSAID` → `OAHQHCNYNXTSZJRRHJBYHQKSOUJY`**, and its exact reverse.

## Original 12,956-rune result

The 24 source-fixed decoders consume the **full unchanged 12,956 unsolved ciphertext GP indices** from [the canonical corpus](../resources/liber-primus/lp2-corpus.json), retaining the original eight 729/1145/1729/1903/1021/1524/1589/3316-rune sections and all physical pages. A fixed smoothed GP trigram scorer is trained from the independent [Emerson prose source](../resources/control/emerson_essays_2944.txt). Higher (less negative) nats per rune means greater source-English plausibility.

| Source state | Nats/rune |
| --- | ---: |
| Original ciphertext before inverse | **−4.79997873** |
| Best among all 24: mirrored-left, original-right, nadir13, continuous whole-book | **−4.79695308** |
| Next best: original-left, mirrored-right, nadir13, physical-page reset | **−4.80366672** |
| Independent source-native 729-rune English control | **−2.23675936** |
| The same native control *after genuine* 29-symbol Chaocipher encryption | **−4.82258121** |

The original winner begins in canonical GP transliteration `PNGEOTYXGANAEANGBGNGAESBCDBEOHXMYXIAXNHNIAXEAFPIARXNGFEEANAOEEAAE`. It is nonlinguistic, and its score is only **0.00303 nats/rune above the raw ciphertext**, whereas genuine source-native GP prose scores more than two nats/rune higher.

**Independent invertible positive:** select an unused 729-rune English passage, encrypt under the hidden 29-symbol mirrored-left/original-right model with nadir14, then decrypt it with the exact same algorithm. The original plaintext is recovered **729/729**, and the known source score returns to **−2.23675936** from the planted ciphertext's **−4.82258121**. This asserts the 29-rune wheel mechanics are reversible and the scorer has sufficient contrast for this particular positive. It does not imply the genuine source uses these initial wheel states or English spelling policy.

## Decision

**These 24 specific, zero-fitted, straight/reverse GP Chaocipher generalizations do not decrypt the manuscript.** The dual-scroll reading is a source-motivated but weak hypothesis; real Chaocipher permits secret **arbitrary initial wheel permutations** and other dynamic variants, which this test does not exclude. With no independent manuscript clue specifying the two starting alphabets or wheel mutation rule, extending the experiment to millions of unconstrained keys would contradict the human-solve-path priority. Any successor needs an original-source selector for a genuinely recoverable initial state and a legible held-out original passage, with exact forward reconstruction.

**Reproduce:** `node sims/chaocipher_scroll_fixed_alphabet_inverse.cjs` using only pinned local source files, Node.js 22 and no external modules.
