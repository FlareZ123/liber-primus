# Terminal p55–57: 256-rune known-interior ring hypothesis

**Classification:** new exact **innermost-word-boundary relationship** and reproducible terminal known-plaintext inversion gates, extending the count-level p55+p56+p57=256 alternative already mentioned in completed Director Issue #391. The alignment may be coincidental; no authentic p55 plaintext, key, cipher, or deep-web hash preimage has been recovered.

## Why this is a plausible human-facing next route

The original pp49–51 numerical table is **32 rows by 8 columns, 256 cells**. Its outermost ring contains exactly **76** cells, and its three inner rings contain **68, 60, and 52** cells, totaling **180**. The actual terminal runic pages are **p55 76 runes**, **p56 85 runes**, and **p57 95 runes**. Thus:

```text
p55 (unknown)       76  =  32×8 perimeter
p56+p57 (solved)   180  =  30×6 interior = 68+60+52
all three          256  =  32×8 complete rectangle
```

**A second, more discriminating original-source alignment:** Walking the four rectangular shells from outside to inside gives runic lengths **76 / 68 / 60 / 52**. The first shell terminates exactly at the p55 page boundary. The deepest 52-symbol shell begins at overall terminal-symbol index **204**, which is **original p57 local rune 43**, *the first letter of the verb SHED after the printed words WE MUST*. Its entire 52-rune content is the already-solved p57 imperative:

> SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.

In canonical GP transliteration the exact 52-rune suffix is `SHEDOUROWNCIRCUMFERENCESFINDTHEDIUINITYWITHINANDEMERGE` (54 Latin characters, because two GP symbols are digraphs). This is a sharply localized connection between an independent original numerical layout and the precise self-referential manuscript instruction; it gives a stronger human solve-path rationale than the length sum alone. Of **56** consecutive three-page windows across all 58 LP2 pages, **p55–57** is the only window totaling 256 runes. The PARABLE sentence also occurs in the original **2013 761.MP3 ID3 TXXX** metadata, preceding the May 2014 LP2 release (documented by completed Issues #442 and #445). This makes the instruction historically player-visible, but supplies no grid-to-rune operator. The other middle-shell boundary occurs **inside** a p56 encrypted word (p56 rune 68), so the shell boundaries are not universally aligned to lexical breaks. Intent remains a hypothesis. The 2014 p15 4×4 spiral is another visible layout precedent.

If the table and terminal text share an operation, the two independently solved pages supply **180 verified known plaintext runes** to constrain an inverse for all **76** p55 unknown runes. The verified p56 decoder is `C_i − φ(prime_key_i) mod 29` with a **single** source F interrupter at local offset **56**; ciphertext F runes at offsets 35, 47, 51 and 74 are enciphered and advance the prime clock. The reproducer asserts the complete 85/85 independently established GP plaintext before using it in any known-interior test. This distinction affects every numerical gate below.

**Strongest objection:** p56 is a separately solved prime-totient cipher with a literal-F exception, while p57 is clear GP text, and both have their own headings. No source explicitly says that three different terminal pages form a single 32×8 cipher object or supplies a transform from table values to terminal runes. This is an exact layout correspondence pending an actual executable route, not proof of creator intent. Do **not** revive the alleged shared p49/p55 3×3 marker: original-pixel Issue #379 proved those stencils differ (10 versus 13 dots).

## Original-cipher complete-inverse gates

The independent source register is `resources/liber-primus/lp2-grid-256.json`; its 256 printed base60 numeral tokens are provisionally interpreted as bytes, then reduced mod29. The target text is canonical p55, the **independently asserted 85-rune exact p56 prime-totient decryption with only F at offset 56 skipped**, and raw clear p57. All rune counts, the exact 52-rune innermost imperative suffix, and all four ring lengths are asserted against source data before transformation.

1. **Direct glyph / codebook map.** The simplest row-major placement of 180 solved GP runes into the interior gives **6/180** literal equality matches. Even an unrestricted fixed mapping of each of the **29** byte-mod29 residues to a GP rune attains at most **50/180** matches, requiring **130** exceptions. Using eight fixed corner/direction perimeter-to-center spiral orientations, the best literal interior reading is **13/180** and every unrestricted residue→rune codebook still requires **at least 123/180** exceptions. These are *deterministic fixed-alphabet* exclusions; changing-state and non-GP encodings are untouched. Allowing a **separate, completely unrestricted 29→29 residue-to-GP map for each of the three known interior rings** still fails. Among all eight corner/rotation readings, shell 2 (68 solved symbols) must change **at least 35**, shell 3 (60 solved symbols) at least **30**, and the innermost original **SHED** shell (52 clear symbols) at least **25**. The best literal matches on these shells are respectively **5/68**, **4/60**, **5/52**. The independently keyed ring-specific codebook model is therefore excluded as a direct explanation of the solved text without adding source-unspecified exceptions.
2. **Short linear source-derived keystream.** Define the known 180-symbol candidate register as `(gridInterior mod29 ± knownRunes) mod29`. Across all eight fixed ring directions/corners, p56 decrypted or printed, and both signs (**32** cases), Berlekamp–Massey over GF29 returns linear complexity exactly **90** for all 32 cases, near the full length/2 expected from a random register. Thus no short constant-coefficient GF29 linear recurrence of order 1–89 reproduces the known interior under these explicit interpretations.
3. **One complete 76-unknown original decryption model.** Treat the table's 256 residues as a fixed **256-tap circular convolution key**. The visible terminal GP rune stream is its 256-symbol ciphertext, and the 180 solved runes are fixed plaintext at indices 76–255. This produces **256 linear equations for 76 unknown p55 plaintext GP runes**. In either natural cyclic direction the coefficient matrix has **rank 76**, but the original remaining equations contain **176** nonzero contradictions in each direction. A full-length planted GP plaintext using the same literal source key and the actual p56/p57 known interior gives a unique exact recovered **76/76** p55-symbol vector and **zero** contradictions. This excludes those two exact invertible full-grid operators as explanations of the original terminal block.

Each negative is conditional on the conventional base60-byte conversion and the stated physical reading convention. No hidden transposition, keyed nonlinear cipher, format conversion, or guessed exception was added to rescue a failed family.

## Key-independent obstruction even with arbitrary within-ring transposition

**Further original-input gate (Agent27, 12 November 2026).** The previously tested fixed residue-to-GP lookup allows an unknown alphabet mapping but fixes cell order. The stronger alternative lets each individual ring have **any secret 29-symbol bijection** *and any arbitrary permutation of every rune position in that ring*. The two completely hidden keys are unrestricted, even separately for the 68-, 60- and 52-slot solved inner rings. A necessary and sufficient condition for an **exact** 1:1 rune substitution with arbitrary position shuffle is equality of the source and target symbol-count histograms after sorting the 29 class frequencies. Where they differ, half the sorted-histogram L1 distance is the **mathematically minimal number of substitutions** even with unlimited freedom to reorder positions and alphabet identities.

The target **must** be the true solved p56 plaintext; using p56's *ciphertext* here would silently invalidate the known-plaintext gate. The source-exact program asserts the complete p56 85-rune prime-totient solution, skips only the unique literal F at original offset56, and reads unencrypted p57 verbatim. Applying that exact test to the conventional 256 base60 table residues gives:

| Ring (outer → inner) | Source slots | Target | Minimum unavoidable mismatches under all secret bijections and positional shuffles |
| --- | ---: | --- | ---: |
| 0 | 76 | p55 original ciphertext, **unknown plaintext** | 4/76 (diagnostic only) |
| 1 | 68 | Known p56 first 68 runes | **13/68** |
| 2 | 60 | Known p56 remaining 17 + p57 first 43 runes | **8/60** |
| 3 | 52 | Known p57 **SHED** imperative | **8/52** |

The **known inner 180 symbols therefore require at least 29 genuine changes** even if each ring independently receives a completely arbitrary secret alphabet relabeling and arbitrarily secret positional permutation. No exact decoder in this whole fixed-ring monoalphabetic-substitution-plus-transposition family can reproduce the 180 proven runes. The outer ring's four mismatches are reported strictly against *ciphertext*, and do **not** exclude a differently encrypted p55 plaintext. Each known shell passes a source-native positive formed by bijectively relabeling and reversing its real GP known text (zero mismatch), so the bound is not an implementation artifact. [Standalone source-native CJS gate](../sims/lp2_terminal256_ring_allsecret_hist_sft.cjs). This closes a broader per-ring permutation/key escape from the fixed-order codebook negatives; evolving keys, nonlinear interactions between rings, other registers and an independently prescribed additional layer are unaffected.

## New research decision

The source-exact 76/180/256 fit, plus the innermost **SHED** word-boundary alignment, supplies a specific, independently testable **known-plaintext orientation gate**. A serious proposed terminal cipher can freeze its original-source mapping and predict the **180 independently deciphered inner cells** before attempting any p55 recovery. If it fails the known interior, no post hoc appeal to a readable 76-rune outer plaintext is credible. A valid breakthrough must specify the actual grid-to-rune operator and all needed keys, produce correct p56 and p57 known text, and invert the outer 76 runes reproducibly.

Do not treat the coincidence itself as an instruction to fit arbitrary stencils or keyed substitutions. The p56 deep-web SHA-512 preimage remains unresolved and could be a missing input, but no authenticated source has linked that page to a key for this particular operator.

**Reproducer:** [`sims/lp2_terminal256_knowninterior_ring_sft.cjs`](../sims/lp2_terminal256_knowninterior_ring_sft.cjs) (Node 22, built-ins only), executed successfully in [Windows manual CI run #43253477349](https://github.com/FlareZ123/liber-primus/actions/runs/43253477349). Controls and exact residual counts are printed with full reproducibility.
