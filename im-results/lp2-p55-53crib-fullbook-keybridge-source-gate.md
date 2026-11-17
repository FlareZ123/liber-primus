# Source-conditioned p55 53-rune crib: real-key recovery and a blind 23-rune prefix gate

**17 November 2026, Agent14. Classification:** bounded conditional historical known-plaintext cryptanalysis with positive native-text recovery. **No authentic unknown-page plaintext, cipher key or destination recovered.**

## Direct plaintext opportunity

A dated May 2014 participant guessed **ENLIGHTENMENT AWAITS THOSE** for original p55's 13+6+4-rune words at offsets 23–45. The separately source-linked LP1 p5 moth and p55 moth accompany an exact 2+7+7+2+6+3+3 GP29 word-length fit of the independently solved LP1 text **THE TOTIENT FUNCTION IS SACRED ALL THINGS** at p55 offsets 46–75. Neither hypothesis is Cicada-verified; the LP1 passage has a different punctuation break. The direct p56 consecutive-prime-totient operation on the LP1 phrase was previously excluded at *all prime starting phases* by duplicate required residue28 values. See the previous all-offset source gate and 2014 historical-crib report.

If both speculative segments were simultaneously correct, they provide 53 consecutive source-conditioned GP29 plaintext/ciphertext pairs on original p55. This is enough to attempt recovery of a genuinely reused or low-order key, then decode the **23 original p55 prefix runes withheld completely from the fit**. The original 76-rune p55 and its 17 complete printed-word lengths were preserved without edits.

## Two actual key-recovery attacks

For each of the 53 original p55 rune pairs, derive two elementary key registers:

- **Direct additive:** key = (cipher - hypothesizedPlain) mod29.
- **Ciphertext difference:** key = (cipher - previousOriginalCipher - hypothesizedPlain) mod29, carrying the actual p55 rune at offset22.

1. **GF29 linear key recovery**: Infer the minimal homogeneous recurrence via Berlekamp–Massey, first from 26 and then from 40 derived key values. Predict the remaining 27 or 13 *unseen* key values without refitting. A genuinely short-order recurrence would also be backward-extendable over the other 23 original page runes.
2. **Original and first-party-source running-key donors**: Seek the whole 53-symbol derived stream as a contiguous window of the **12,956 original LP2 ciphertext symbols**, independently solved p56–57's **180 runes**, **2,797 original LP1 runes**, **3,028 GP29 symbols in the editor-normalized LP1 solved-text reference**, or **175 GP29 runes in the verified 2016 Cicada message's 43 alphabetic words**. The LP1 solved-text reference is a derived transcription distinct from the original LP1 rune source; the 2016 source excludes its hex fingerprint and PGP signature. Grant every position, both reading directions and all arbitrary nonzero affine GP29 alphabet maps (28 possible slopes and the first-symbol-determined additive shift). A source-match allows the 23 earlier source positions to decrypt the 23 withheld original p55 prefix symbols.

The source hypothesis and the original p55 full-book key family are locked before language testing; no key can be selected using the withheld 23 runes.

## Original results

| Frozen key register | Full53 minimal GF29 linear degree | From first26, correct final27 | From first40, correct final13 | Best full-book affine prefix | Best solved terminal affine prefix |
| --- | ---: | ---: | ---: | ---: | ---: |
| Direct additive | **27** | **2/27** | **1/13** | **5/53** | **4/53** |
| Ciphertext-difference | **27** | **2/27** | **2/13** | **5/53** | **3/53** |

There is **zero** complete 53-rune affine donor match over every possible window, forward/reverse orientation and arbitrary nonzero affine slope across all five source donors. The first two donor pools' four direction/source maxima are respectively [5,4,4,3] (direct) and [5,4,3,3] (differential). Original LP1 rune-stream maxima are **4/53** in both registers and directions. The edited GP29 solved-LP1 donor yields at most **5/53** direct and **4/53** differential. The original 2016 verified words yield at most **4/53** direct and **3/53** differential. All **20 original source/direction/key cells** have zero complete key matches. A full53 order27 key is the ordinary near-random outcome for such a sequence and has no defensible unfit predictive power. Neither key model produces a real p55 prefix.

**This result is conditional on a combined plaintext assumption that remains unverified**. It excludes the tested elementary recurrent/reused-key programs as a path from these two guesses to the missing 23 original p55 rune values. A different external or nonlinear pad remains possible.

## Positive: exact previously hidden source-rune recovery

The [standalone Windows Node22 CommonJS reproducer](../sims/lp2_p55_53crib_fullbook_keybridge_sft.cjs) uses 76 genuinely solved p57 runes as **native test plaintext** under both direct and differential key systems.

- In a frozen order-seven GF29 key plant, the decoder receives **only 53 tail plaintext pairs**, recovers degree7, backsteps the key 23 places and decrypts **23/23 held-out authentic-language prefix runes** plus the known 53.
- In an independently hidden affine-source donor plant, source is original solved p56–57 runes, source offset29, secret slope17 and shift4. The decoder receives only 53 tail plaintext pairs, searches the donor with no provided secret, correctly recovers all 53 key symbols and the donor offset and alphabet, extends the key over 23 previously unseen runes, and decrypts **23/23 held-out authentic-language prefix runes**.

Both positive cases work in both tested key registers. The original p55 source-conditioned residues fail both corresponding key discoveries. Every SFT assertion passed during **complete actual execution against the repository's exact original source files** in the connected JavaScript runtime on 17 November 2026. A manual GitHub Actions Node22 workflow was dispatched; as long as queued, this does not assert CI success.

## Decision

The historical 23-rune guess and the independent LP1 moth-linked 30-rune guess can be jointly treated as a large hypothetical crib, but they **do not recover any unknown p55 plaintext** through a source-native low-order GF29 recurrence or through a contiguous source-native LP1/LP2 rune stream, derived solved LP1 prose or original authenticated 2016 signed prose as a running key, even after granting arbitrary affine GP29 relabeling and reversal. Additional material must first independently establish these plain segments or furnish a specific external key. Do not fit order27 coefficients to the entire 53-symbol guess and call its automatically reproducible output a key discovery.
