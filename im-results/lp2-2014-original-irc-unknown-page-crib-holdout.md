# Unknown-page plaintext claims in the original May–August 2014 IRC corpus

**Evidence:** original-byte, SHA1-pinned community IRC transcript; bounded original-cipher holdout for a source-dated two-crib hypothesis. **No genuine new LP2 plaintext, key, reusable decoder or hash preimage recovered.** No IRC nickname is a Cicada-signed author.

## The source-directed question and screened archive

With the true first page-56 solve now established on **19 May 2014**, ask whether the same contemporary solvers recorded any independently predictive unknown-page plaintext before today's historical reconstructions. [This exact-source Node22 scanner](../sims/lp2_2014_unsolved_page_witness_scan_sft.cjs) checks Git blobs and bytes for all three surviving 2014 archived channels before scanning May–August original lines. [Successful manual CI 43606051226](https://github.com/FlareZ123/liber-primus/actions/runs/43606051226) tested the original source and the separate holdout. The principal channel has **74,548** timestamped May–August 2014 lines; an auxiliary channel has 2,091 and the third has zero in that period. The full first file yielded **28** same-line references to a specific unknown physical page together with discovery/key terms, and **29** with stronger claim terms; these overlap and are *candidate references*, not decryption counts. A manual review of the source-printed match contexts distinguishes guesses, jokes, and actual solved p56 from unknown-page plaintext.

The strongest apparent unknown-page claims are all **source-dated proposed cribs**:
- **21 May L185125:** a participant hypothesizes page25's 14-rune word `EA-I-IA-TH-NG-N-E-N-F-O-M-E-Y-A` as `C-O-N-D-I-T-IO-N-E-D-N-E-S-S`, publishing a fitted 14-value shift sequence, while stating `closest i got`. No general key follows.
- **24 May L188780:** another participant attributes to `idontworkfor3301` page35 `IT'S` with shifts **26,27,28**, and possible page34 `LESS` with shifts **27,28,0,1**. The same IRC sentence admits the rule worked only on that one word.
- **27 May L190223–25:** a proposed 13-rune page11 `OVERSIMPLIFYING` is a dictionary guess under possible plaintext-F exception; the author explicitly cannot make sense of the shifts.
- **12 June L198540–44:** a linked, later unrecovered Pastebin about page4 line8, `DON'T` and `CAN'T` and `LET'S`, is described as a plaintext attack; this text is a title/chat claim, with no full-page inverse in the captured IRC context.
- **18 June L204070 and 25 June L212616:** first-eight-rune-word brute-force/key-spreadsheet work for page0. **28 July L228404** participant reports checking 13,200 possible words with no readable candidate key.
- **30 June L216040–43:** `I solved the runes!` followed by `it says not to tell anyone how I solved it`; surrounding messages respond to a transparent joke/unsupported boast. **23 July L226881** page54 `A` requires an *assumed* initial key shift of 1.

These are evidence of 2014 hypotheses **already failing to generalize in that discussion**, rather than 2014 solutions to the other 56 pages. The text screen is not exhaustive of all indirect claims or offsite pages; it is a precise witness locator with stated term and date scope. The independent #881 investigation of linked code/pastes should handle external recovery.

## Fixed consecutive-shift holdout against two original words

The May24 source yields a specific source-selected mathematical continuation to test: at the cited **physical p34**, the original printed four-rune ciphertext word `OE-M-S-X` is uniquely located at original page-rune offset **81**. Adding the participant's shifts **[27,28,0,1] mod29** yields exactly `L-E-S-S`. At **physical p35**, the printed three-rune ciphertext `P-E-T` at original rune offset **78** plus participant shifts **[26,27,28] mod29** yields exactly `I-T-S`; the proposed apostrophe is an English conjecture, not part of ciphertext.

**Discriminating, unguessed next-word check:** the immediately following source-printed words contain **no ciphertext F**, so the p56-style transparent-F key-clock exception cannot rescue them before their end. Continue each reported +1 modulo29 shift with no reset:

| Page | Source-linked guessed crib | Original immediately following ciphertext | Forced original next-word output |
| --- | --- | --- | --- |
| p34 | `OE-M-S-X` → `LESS`, shift 27,28,0,1 | `T-Y-X` | **`E-F-E`** |
| p35 | `P-E-T` → `ITS`, shift 26,27,28 | `J-X-NG-L` | **`J-S-D-D`** |

Neither output supports a normal English continuation. The two guessed initial phases also fail a no-skip **cross-page clock**: the original offset between their starts is **258 runes = 26 mod29**, whereas their reported shifts change by **28 mod29**. Six ciphertext F symbols occur in the intervening span; to reconcile the two starts via a p56-like literal-F skip would require exactly two of those six F positions to be bypasses, leaving **15 unselected masks** and still no coherent immediate next word.

This rules against the **specific uninterrupted +1 progressive GP29 key operating through either adjacent word**, with the original word breaks preserved. It does not refute freely changing per-word keys, plaintext in another register, alternative word boundaries, or arbitrary compound ciphers. The two original historical positives were created by **choosing the plaintext after seeing the ciphertext**; they are unverified cribs and must never be promoted as recovered plaintext. The [single-file exact-source original-word SFT](../sims/lp2_2014_progressive_crib_holdout_sft.cjs) asserts the two word locations, original-GP arithmetic, forced holdouts, and F-ambiguity boundary. [Passing CI](https://github.com/FlareZ123/liber-primus/actions/runs/43606051226).

## Decision

The newly opened source-dated unknown-page crib record helps avoid resurrecting earlier selected-word stories. It does **not** supply evidence for an original unknown-LP2 decipherment. Before pursuing the 2014 progressive counter, require an independent Cicada clue selecting its phase and a correct **complete unseen original word** or verified multiword plaintext, rather than re-optimizing the same two guesses.
