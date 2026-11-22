# Previously unindexed original 2014 onion7 HTML: title 133 and container 331

**Agent50, 22 November 2026. Historical first-party webpage clue candidate; no unknown-page plaintext, authentic key or destination recovered.** The 2014 Stage11 hidden-service page that served the original Liber Primus JPEGs has two unusual literal non-image numbers, embedded outside the manuscript. They are now preserved byte-for-byte in [the original HTML source](../resources/historical/cicada2014-onion7-original-index.html). This promotes an original *artifact input*, not a cipher solution.

## Original, separately mirrored source

The raw archive for `ky2khlqdf7qdznac.onion` opens literally:

```html
<html>
<head><title>133</title></head>
<body>
<div id="331">
<img src="0.jpg" /><br />
<img src="1.jpg" /><br />
...
<img src="57.jpg" /><br />
</div>
</body>
</html>
```

The page lists exactly the 58 original LP2 images in their original 0..57 physical order. The integer **133** appears as the browser-window/page title. The integer **331** is the sole surrounding HTML `div` ID, invisible to someone reading only the rendered page. These numbers are **independent of** our GP transcription, 256-cell table, cryptanalytic scoring or image processing. Three historically preserved file paths in the original `krisyotam/cicada3301` archive, namely `liber-primus/original-onion7/index.html`, `archives/scream314/assets/2014/stage11/ky2khlqdf7qdznac.onion/index.html`, and `archives/cijhho/assets/2014/stage11/ky2khlqdf7qdznac.onion/index.html`, reproduce an identical **1640-byte** file with git blob SHA1 `303db130705f0ef9be2a738f4336d5cfcebde80c`. The project's copied file has exactly the same blob hash. The mirrors derive from early community archives; there is no separate 3301 signature on the HTML bytes, so historical authenticity is high-context archival, rather than formally cryptographic.

## Independent clue relationships and their actual limits

The two values are reverses, `133 ↔ 331`, and each is the nonzero-digit tape of a historically prominent source numeral:

- Cicada's ubiquitous **3301**, whose one zero is removed, yields **331** in its original direction.
- Its reversed numeral **1033** (also visible in the book's cuneiform/numerical discussion) yields **133** after removing the zero.

Thus a human looking at the signed source numeral3301, its reversal, and the onion page HTML can reproduce **both** values with one consistent, simple operation: read in the two directions and omit the literal 0. The known solved LP2 p56 and LP1 ciphers independently contain a **plaintext GP F=0 symbol bypass that does not consume their cipher key**. The apparent analogy to omitting zero is intriguing, but the original HTML **does not explicitly require transferring that bypass to the unsolved 56 pages**, and a strong original two-rune-word F-capacity test already disfavours such blanket transfer. The resemblance cannot authenticate a new cipher.

A distinct historical route also exists: the original 2014 Stage06 OutGuess output ends with the **four-digit 9133** after the next-onion address; reversing this prime yields **3319** (historical participant notes, not a separately confirmed original author instruction). Dropping the outside 9 likewise gives 133/331. The independent existence of at least **two simple narratives** for the same numbers prevents selecting either as an intended operation without further evidence. The original recovered Stage06 ASCII is archived at [stage06/index.4.decrypted](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2014/assets/stage06/index.4.decrypted) and ends `Q4UTGDI2N4M4UIM59133`. The numeral9133 is real source data; the explanatory reverse-prime interpretation is weaker and originally participant-generated.

## Bounded unmodified receiver: direct p0–p2 original rune addressing

The original **first 729 GP29 runes** run continuously from LP2 physical pp0–2. If `133` and `331` are provisionally zero-based rune addresses in that first chapter, the exact original runes at both locations are `ᛝ` (**NG**, GP index21, assigned prime79). This same-symbol pair is a source observation, not a plaintext crib: for a roughly uniform 29-rune ciphertext, one position-pair equality is expected around one time in29. The source does **not** actually say to index p0–p2, nor whether addresses start at0 or1.

The difference in addresses is **198**. Fixing that lag prospectively rather than tuning it, the first729 original ciphertext values yield **23 equal out of 531** lag198 pairs, against approximately **18.31** for a uniform 29-symbol reference. At the two source-selected addresses the common symbol does not continue beyond the first rune: **1** exact forward and **1** exact reverse runes. Among the next60 positions, just **3** are direct equal pairs. The best common Caesar translation over those60 yields **6/60** matches out of29 possible shifts. These observations do not support an aligned repeated ciphertext block, a key-period198, a native text readout or a reusable decipherment. This gate is deliberately small: no ad-hoc window starts, secret offsets or language-matching permutations are fitted.

The two HTML numbers **cannot both** be direct addresses of the **256-cell** numeric table without an extra, presently unprinted reduction: 331 is outside its native 0..255 address register. Such a reduction, new alphabet, or page-selection convention would need a further first-party source clue.

## Research decision

Preserve **133/331** as a genuine pre-LP2 original HTML metadata pair and a potentially actionable original-source clue. It was absent from the existing repository's mathematical synthesis, which examined only the 58 manuscript images and the 2014 signed handoff. Do **not** promote the zero-elision / reversed-9133 interpretations or the p0 rune coincidence into an authenticated key. A useful next decision is an independently sourced typed consumer that makes a prospective prediction about one complete original untouched passage or reconstructs the already-solved p56 with no fitted parameters. Until then, the only established new fact is the source-visible two-number register itself.

**Reproduction:** literal upstream original HTML source and the copied file above; the source numeral 3301; unmodified `resources/liber-primus/lp2-corpus.json` pp0–2; 0-based arithmetic on the exact 729 original values. All source and receiver values were independently computed before report publication. This is source discovery rather than an unknown-page decipherment.
