# Source-conditioned p55 53-rune crib: real-key recovery and a blind 23-rune prefix gate

**17 November 2026, Agent14. Classification:** bounded conditional historical known-plaintext cryptanalysis with positive native-text recovery. **No authentic unknown-page plaintext, cipher key or destination recovered.**

## Direct plaintext opportunity

A dated May 2014 participant guessed **ENLIGHTENMENT AWAITS THOSE** for original p55's 13+6+4-rune words at offsets 23–45. The separately source-linked LP1 p5 moth and p55 moth accompany an exact 2+7+7+2+6+3+3 GP29 word-length fit of the independently solved LP1 text **THE TOTIENT FUNCTION IS SACRED ALL THINGS** at p55 offsets 46–75. Neither hypothesis is Cicada-verified; the LP1 passage has a different punctuation break. The direct p56 consecutive-prime-totient operation on the LP1 phrase was previously excluded at *all prime starting phases* by duplicate required residue28 values. See the previous all-offset source gate and 2014 historical-crib report.

If both speculative segments were simultaneously correct, they provide 53 consecutive source-conditioned GP29 plaintext/ciphertext pairs on original p55. This is enough to attempt recovery of a genuinely reused or low-order key, then decode the **23 original p55 prefix runes withheld completely from the fit**. The original 76-rune p55 and its 17 complete printed-word lengths were preserved without edits.

## Three actual key-recovery attacks

For each of the 53 original p55 rune pairs, derive two elementary key registers:

- **Direct additive:** key = (cipher - hypothesizedPlain) mod29.
- **Ciphertext difference:** key = (cipher - previousOriginalCipher - hypothesizedPlain) mod29, carrying the actual p55 rune at offset22.

1. **GF29 linear key recovery**: Infer the minimal homogeneous recurrence via Berlekamp–Massey, first from 26 and then from 40 derived key values. Predict the remaining 27 or 13 *unseen* key values without refitting. A genuinely short-order recurrence would also be backward-extendable over the other 23 original page runes.
2. **Original and first-party-source running-key donors**: Seek the whole 53-symbol derived stream as a contiguous window of the **12,956 original LP2 ciphertext symbols**, independently solved p56–57's **180 runes**, **2,797 original LP1 runes**, **3,028 GP29 symbols in the editor-normalized LP1 solved-text reference**, or **175 GP29 runes in the verified 2016 Cicada message's 43 alphabetic words**. The independently signed 2014 May2 *YOUR ENLIGHTENMENT AWAITS YOU* message adds **69** GP symbols, the verified original 2014 stage09 instructions **167**, the 2012 signed MIDI/poem instructions **503**, and the 2013 signed no-more-testing note **130**. The latter four signed text readers normalize CRLF, exclude long embedded hex payload lines and hexadecimal fingerprint fragments, and preserve remaining alphabetic words. Each signed artifact is a distinct donor; key windows never concatenate unrelated documents. The LP1 solved-text reference is a derived transcription distinct from the original LP1 rune source; the 2016 source excludes its hex fingerprint and PGP signature. Grant every position, both reading directions and all arbitrary nonzero affine GP29 alphabet maps (28 possible slopes and the first-symbol-determined additive shift). A source-match allows the 23 earlier source positions to decrypt the 23 withheld original p55 prefix symbols.

3. **Arbitrary secret bijective GP29 source table**: Rather than restrict the unknown donor alphabet to 28 affine slopes, permit *every one of the 29! possible global GP29 bijections*, with no sampling or exhaustive factorial enumeration. Each proposed source window supplies necessary equal-input/equal-output and distinct-input/distinct-output constraints. Compare each of its 53 original donor letters to the 53 source-conditioned key symbols; reject immediately on either contradiction. The number of alphabet-table parameters is limited by the actual 53 training runes, and the decoder is allowed to reuse the learned table on the withheld source-prefix runes only when those letters have already been observed in its training segment. The original source and both reading directions are scanned at every possible starting position.

The source hypothesis and the original p55 full-book key family are locked before language testing; no key can be selected using the withheld 23 runes.

## Original results

| Frozen key register | Full53 minimal GF29 linear degree | From first26, correct final27 | From first40, correct final13 | Best full-book affine prefix | Best solved terminal affine prefix |
| --- | ---: | ---: | ---: | ---: | ---: |
| Direct additive | **27** | **2/27** | **1/13** | **5/53** | **4/53** |
| Ciphertext-difference | **27** | **2/27** | **2/13** | **5/53** | **3/53** |

There is **zero** complete 53-rune affine donor match over every possible window, forward/reverse orientation and arbitrary nonzero affine slope across all five source donors. The first two donor pools' four direction/source maxima are respectively [5,4,4,3] (direct) and [5,4,3,3] (differential). Original LP1 rune-stream maxima are **4/53** in both registers and directions. The edited GP29 solved-LP1 donor yields at most **5/53** direct and **4/53** differential. The original 2016 verified words yield at most **4/53** direct and **3/53** differential. Across all **36 original source/direction/key cells**, there are zero complete affine key matches. Under the even more permissive **arbitrary secret permutation** model, the longest original key match is **11/53** (both key registers on the original LP2 source, and several secondary-source registers). No 53-symbol source window in any of the nine original or historically signed donor pools is compatible with *any* single secret GP29 bijection, in either direction. This is an exact source-dependent equality contradiction that holds for every one of the 29! symbol substitutions and cannot be rescued by fitting a different static alphabet. The longest source-aligned prefix in the May2 signed message specifically is **6/53** (direct) or **9/53** (differential), despite its distinctive historical word ENLIGHTENMENT. A full53 order27 key is the ordinary near-random outcome for such a sequence and has no defensible unfit predictive power. Neither key model produces a real p55 prefix.

**This result is conditional on a combined plaintext assumption that remains unverified**. It excludes the tested elementary recurrent/reused-key programs as a path from these two guesses to the missing 23 original p55 rune values. A different external or nonlinear pad remains possible.

## Positive: exact previously hidden source-rune recovery

The [standalone Windows Node22 CommonJS reproducer](../sims/lp2_p55_53crib_fullbook_keybridge_sft.cjs) uses 76 genuinely solved p57 runes as **native test plaintext** under both direct and differential key systems.

- In a frozen order-seven GF29 key plant, the decoder receives **only 53 tail plaintext pairs**, recovers degree7, backsteps the key 23 places and decrypts **23/23 held-out authentic-language prefix runes** plus the known 53.
- In an independently hidden affine-source donor plant, source is original solved p56–57 runes, source offset29, secret slope17 and shift4. The decoder receives only 53 tail plaintext pairs, searches the donor with no provided secret, correctly recovers all 53 key symbols and the donor offset and alphabet, extends the key over 23 previously unseen runes, and decrypts **23/23 held-out authentic-language prefix runes**.

A **third** positive uses an independently hidden *non-affine* random GP29 permutation, and a running-key source from the actual original LP2 ciphertext with training key window at original source offset105. Its initial 23 source positions are all present in the 53-key training suffix. With only 53 known tail plaintext pairs, the code searches the full 12,956-source-rune book under an arbitrary unknown bijective alphabet, identifies **exactly one full 53-rune donor key** at source offset105, recovers the needed secret symbol values, and decrypts **all23/23 withheld solved-p57 prefix runes**, in both additive/differential cipher registers. Every original native plant passes the identical source-window and key-recovery procedure; the original p55 input never produces a complete 53-key donor.

All three positive cases work in both tested key registers. The original p55 source-conditioned residues fail both corresponding key discoveries. Every SFT assertion passed during **complete actual execution against the repository's exact original source files** in the connected JavaScript runtime on 17 November 2026. A manual GitHub Actions Node22 workflow was dispatched; as long as queued, this does not assert CI success.

## Decision

The historical 23-rune guess and the independent LP1 moth-linked 30-rune guess can be jointly treated as a large hypothetical crib, but they **do not recover any unknown p55 plaintext** through a source-native low-order GF29 recurrence or through any registered original LP1/LP2 or dated first-party signed-message source as a running key, even after granting an **arbitrary secret global GP29 alphabet permutation** and reversal. Additional material must first independently establish these plain segments or furnish a specific external key. Do not fit order27 coefficients to the entire 53-symbol guess and call its automatically reproducible output a key discovery.
