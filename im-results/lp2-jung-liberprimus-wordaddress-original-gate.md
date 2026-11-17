# LP2 original printed-word address into Jung's *Liber Primus*

**Executed source-exact negative, 17 November 2026 (Agent34).** The original manuscript gives no coherent English readout by either direct word-number address rule tested here. A source-native 19-character planted message was recovered exactly. **No unknown LP2 plaintext, selected Jung key, cipher mechanism or destination was recovered.**

## Hypothesis and original-input boundary

The 2016 Cicada signed statement says that the manuscript's “words are the map, their meaning is the road, and their numbers are the direction.” Cicada previously used both GP29 numerals and GP-prime-weight sums. C. G. Jung's *The Red Book: Liber Novus* contains a named *Liber Primus* portion, independently providing a possible same-title text for a conventional book cipher, although no Cicada-authored LP2 clue identifies Jung as the intended donor. The simple, fully specified test uses the whole fixed English reader's-edition PDF as the donor, without selecting a source offset after seeing the output.

Input: canonical original 55 rune-bearing physical LP2 pages p0–p55 (p50 has no runes), parsed at the original printed word boundaries. Exact counts **12,956 GP29 runes** and **2,896 complete words**. Complete words spanning page breaks remain whole. The donor PDF SHA-256 is `5cbb32a6a6033399c8692ac9aaeb148e02a1a0734f4d7a31a90453fbc6073359`; Unicode text extraction produces **228,597** alphabetic donor words.

For each original printed cipher word (w=(d_0,\dots,d_{k-1})) in original GP29 numeral order, try exactly:

1. (a_{29}(w)=(\sum_i d_i 29^{k-1-i})\bmod 228597).
2. (a_{prime}(w)=(\sum_i p_{d_i})\bmod 228597), where (p_{d_i}) is the established GP prime weight.

Read the **first Latin letter** of donor word at zero-based address (a(w)). Concatenate all **2,896** resulting letters in printed order. No arbitrary alphabet, ROT, word offset, source section restart, discarded letters or plaintext prefix was optimized. This is a *direct original rune-to-text readout hypothesis*, rather than a candidate LP2 cryptographic decryptor; it is not itself reversible to the unique source word because many source words can map to one donor address.

## Executed original result

A source-native planted control replaced 19 original-shape GP words by exact BASE29 encodings of known donor-word addresses, decoding the planted text `LIBERPRIMUSISOURMAP` with no fitting or loss. Both original readouts completed successfully on Windows Python 3.12, under [run 44182144954](https://github.com/FlareZ123/liber-primus/actions/runs/44182144954). The actual original readout prefixes are:

- BASE29 address: `DBBMAMSTAAWTDTJGAAISOIPWTPSBHDTASSTADARJATTIMDSOOIIBIDAITDLWNTAADWJTIRRCTFIWTTSCBOOTABTASCIAKGHHWTTTXGFJTOTLPASINCAPEAJNHRLFOTCTAIIDSIDCBWBM`.
- Prime-sum address: `AXCITTTIINXVFIOSLFRRHSCVCCARXCRFTXTCTIVIVTRRTVAITFCFAYNCVODDOIFIINTCONJFROTFTEHPRWITWNAXVFOELOTWSVEOSSUSVTPCXFIGOPQINNOMSLNACTTVRVIIDTXMTIDI`.

An unsmoothed clue search found **zero** complete occurrences of the nine preselected concepts `LIBER, PRIMUS, DIVINITY, CIRCUMFERENCE, INSTAR, TUNNEL, PARABLE, EMERGE, ENLIGHTENMENT`. GP-native entire output lacks intelligible unknown-page text. A donor-trained trigram likelihood, compared against 200 in-place whole-output letter shuffles, places BASE29 at upper-tail **0.955224** and prime sum at **0.164179**. Neither outperforms a shuffled output at a meaningful level in this bounded comparison; the BASE29 output is especially poor.

## Research decision

Retire both **direct unkeyed, zero-origin, entire-reader's-edition Jung first-letter book-address readings**. Their planted success demonstrates that the implementation recognizes a real encoded message, while the original full-book results do not support this specific source-to-readout transfer. This says nothing decisive about a different, original-author-selected book, a different source page, a keyed address rule, full-word outputs or more elaborate ciphers. The shared Jung whole-source plaintext-length and running-key analyses are separate completed gates; do not re-run them under this result. A successor requires a first-party instruction selecting a donor or address clock and must predict untouched original plaintext.

Reproduce from [`sims/lp2_jung_liberprimus_wordaddress_sft.py`](../sims/lp2_jung_liberprimus_wordaddress_sft.py) in the [manual-only workflow](../.github/workflows/lp2-jung-wordaddress-manual.yml), complete original [Actions run 44182144954](https://github.com/FlareZ123/liber-primus/actions/runs/44182144954). The source PDF is downloaded in memory and pinned by SHA-256; no copyrighted donor material is redistributed.
