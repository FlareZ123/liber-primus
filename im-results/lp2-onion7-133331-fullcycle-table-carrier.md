# Source-linked 133/331 full-cycle reading of the original 256-cell table

**Agent 38, 13 November 2026. Evidence class:** exact new candidate traversal and unusual output statistic. **No decrypted LP2 plaintext, authenticated payload, decipherment key, or author-selected LCG rule.** This is exploratory supporting work, not an established cipher.

## Independent inputs and proposed source-selected operation

The original archived [2014 Onion7 HTML](../resources/cicada2014-onion7-index.html) contains literal `<title>133</title>` and `<div id="331">`. The LP2 pp49–51 [32×8 grid](../resources/liber-primus/lp2-grid-256.json) contains 256 two-digit entries; its byte decoding has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. A concrete *unprescribed* two-number consumer is the 8-bit linear-congruential traversal:

\[
x_0=0,\quad x_{t+1}=(133x_t+331)\bmod256,\quad B_t=\operatorname{table}[x_t].
\]

Because 133 is 1 modulo4 and 331 is odd, the map visits all **256 original table cells exactly once** and returns to zero. The reversed recurrence has coefficients (77,113) modulo256; swapping 133 and331 as multiplier/increment does not yield a full 256-cycle. Original-source selection of *linear congruence* remains the weakest unsupported premise.

## Original output and independently repeated pattern

The longest contiguous ASCII Base64-character run in the 256-byte LCG readout appears at output offsets **173–183**, zero-based:

`Q8rI6/I6PiT`

Its eleven original table offsets are **[183,94,33,112,123,50,69,36,255,198,41]**, carrying original printed two-character tokens:

`1L 0u 1s 1D 0s 0l 1D 0s 1K 1j 1O`

The literal repeated-pair motif is `I6/I6` at offsets176–180. Immediately before this Base64 run, output byte172 is a CR (0x0D); output byte184 is 0xE7. Base64 decoding with one padding `=` produces **8 bytes** `43cac8ebf23a3e24`, lacking an independently known message or signature. Original row-major table longest Base64 run is **5** characters; the inverse destination-slot placement has longest run **4**.

The same eleven original *tokens* under the alternative plausible radix59 alphabet (omitting unused lowercase f) decode instead as **`P7pH5.H5OgS`**. Hence repetition survives but the URL-like slash and Base64 continuity do **not** independently establish radix60 over radix59.

## Distinguishing this particular LCG among the entire full-period family

The [read-only reproducible Node22 SFT](../sims/lp2_onion7_133331_lcg256_carrier_sft.cjs) completely enumerates **all 8,192** full-period affine traversals mod256, with multiplier ≡1 (mod4) and odd increment. Only two maps have any Base64 run of length at least11: **(a,c)=(133,75)**, equivalent to signed-source (133,331), and **(77,113)**, its exact inverse. Only the **same two** have any five-byte Base64-alphabet `AB/AB` motif anywhere in the 256-cell traversal. Forward produces `I6/I6` at176; inverse produces `6I/6I` at76. They are a single traversal class counted in two directions.

**Whole-stream control:** the same source-selected ordering has **28** adjacent Base64-character pairs and **50** adjacent printable-byte pairs. Among the full 8,192 affine traversals, **214** have at least 28 Base64 adjacencies and **580** have at least 50 printable adjacencies. The source traversal is therefore unusual for its *single longest local run*, while global ASCII clustering is much less distinctive. This weakens the hypothesis that the complete reordered table is a plaintext message, and favors retaining it only as a possible local carrier.

The exact **fixed-inventory** random-permutation probability of at least one ≥11 Base64 run anywhere given the original **74/256** Base64-eligible values is **0.00012266664696342915**. With the source byte inventory containing two slash characters, the expected number of five-byte `AB/AB` motifs anywhere in a random permutation is **0.000003226680482656478**, also an upper bound on the occurrence probability.

**Statistical caution:** these are narrowly conditioned combinatorial checks, not an unconditional discovery probability. The AB/AB motif was recognized after observing the 11-byte run, the LCG hypothesis was retrospectively proposed, and forward/reverse traversals are dependent. The two rare features co-occur on the very same eleven bytes. Many unrelated transformations have been considered across this research project.

**Execution:** [final read-only Node22 original-input manual CI run 43458722137](https://github.com/FlareZ123/liber-primus/actions/runs/43458722137), all five manually selected source SFT steps successful; no on-push job.

## Original-input attempt at a recognizably typed output

The independently recovered [original 2014 Onion2 256-byte value](../resources/2014-onion2-final-256byte-hex.txt) offers an actual historical key-shaped control. Direct positional XOR with the table after the source-value LCG traversal yields neither PGP armor nor a meaningful ASCII/header payload. In a distinct natural original structural test, the complete original row-major GF29 table polynomial is exactly divisible by the historical 2013 3QO quadratic and original p39 red-triad quadratic. The permuted readout has respective **nonzero** ascending-order remainders **[27,7]** and **[21,20]**. Thus treating this LCG walk as the table's sole meant ordering would discard two prior original-source polynomial relationships. No unknown LP2 rune has been decrypted.

**Direct original-rune consumers (bounded new-key test).** The separate [read-only decoder SFT](../sims/lp2_onion7_133331_source_pad_consumer_sft.cjs) evaluates both concrete source candidates as GP29 repeating additive pads: the **256** table bytes along this orbit reduced mod29, and the Base64-run's **eight** decoded bytes reduced mod29 (GP29 indices **[9,28,26,3,10,0,4,7]**). On the complete **12,956 original unknown runes**, both signs under the single original-book clock have IoCs **0.0344722–0.0345144**, compared with **0.0344784** unmodified and **0.0627100** for the independently solved 95-rune PARABLE. One global secret output alphabet cannot improve IoC. Because the actual ciphertext strongly suppresses adjacent rune repetitions, the same exact source keys are also applied to a reversible GP28 predecessor-exclusion code with repeats as EA, both cyclic and sorted successor-rank conventions and both signs. All **eight** rank variants remain at IoC **0.0352586–0.0352999**, with exact encode/decode plants on the already-solved PARABLE. These tests retire only these frozen first consumers, not a clue-selected different cipher or stateful register. No sustained native plaintext emerged.

**Frozen p56 continuation-hash gate.** The original solved p56 deep-web clue publishes a 128-hex-character digest beginning `36367763ab73783c`. The eleven literal ASCII bytes `Q8rI6/I6PiT` and their eight decoded Base64 bytes were each hashed unchanged under SHA-512, SHA3-512 and BLAKE2b-512. **Zero of six hashes** match the original 512-bit target. These are precise negative preimage checks for three specified algorithms; historic BLAKE-512 is a distinct algorithm and has not been inferred from this test. The new hash checks pass in [manual source regression CI 43459618552](https://github.com/FlareZ123/liber-primus/actions/runs/43459618552).

This remains a possible **short carrier marker**; it does not supply an identified key, authentication, or reversible original-cipher equation. A genuine next decision requires a separately dated source indicating that 133 and331 select an affine recurrence, or a predeclared full-file/held-out-plaintext prediction using this frozen orbit. Do not expand this into arbitrary seed, phase, cipher, or table-modification searches without that independent selector.
