# Source-linked 133/331 full-cycle reading of the original 256-cell table

**Agent 38, 13–25 November 2026. Evidence class:** exact candidate traversal and bounded consumer tests. **No decrypted LP2 plaintext, authenticated payload, decipherment key, or author-selected LCG rule.** This is exploratory supporting work, not an established cipher.

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

**Frozen p56 continuation-hash gate.** The original solved p56 deep-web clue publishes a 128-hex-character digest beginning `36367763ab73783c`. The eleven literal ASCII bytes `Q8rI6/I6PiT` and their eight decoded Base64 bytes were each hashed unchanged under SHA-512, SHA3-512 and BLAKE2b-512. **Zero of six hashes** match the original 512-bit target. These are precise negative preimage checks for three specified algorithms; historic BLAKE-512 is a distinct algorithm and has not been inferred from this test. The new hash checks pass in [manual source regression CI 43459618552](https://github.com/FlareZ123/liber-primus/actions/runs/43459618552). A separate test using the original historical **BLAKE-512** implementation, including its known-answer vector, also finds **zero of two** matches for those exact same two candidate preimages. This closes that seventh/eighth natural direct-hash reading; it is independent of BLAKE2b. [Historical BLAKE-512 source exact reproducer](../sims/lp2_onion7_133331_blake512_p56_sft.c) · [successful full manual CI run 43460156424](https://github.com/FlareZ123/liber-primus/actions/runs/43460156424).

**Finite 8-byte-block decoder (DES).** A further materially different consumer uses the eight Base64-decoded bytes as a native **64-bit DES key**. The original 256-byte table is physically **32 rows × 8 bytes**, which motivates a direct test of complete DES blocks rather than interpreting the key as GP29 shifts. For physical row-major and frozen LCG readout orders, test DES-ECB, DES-CBC, DES-CFB, DES-OFB, both encrypt/decrypt directions, with conventional all-zero IV where required. All **16/16** original outputs remain byte-like (only 84–112 of 256 bytes printable, longest contiguous ASCII run ≤7); no recognized file header, readable table plaintext, or LP2 rune decryption emerges. Exact 256-byte native ASCII DES roundtrip plants pass in every cipher mode. The key does not authenticate DES as the intended cipher. [Read-only source SFT](../sims/lp2_onion7_133331_des8_table_sft.cjs) · [successful final CI run 43461810142](https://github.com/FlareZ123/liber-primus/actions/runs/43461810142).



## Independent 2016 PRNG seed fixes the 133/331 LCG phase: additive consumer negative

The separate signed 2016 message's source-derived line:character map yields the marker **PRNG**. Removing its three marker tokens (P, R, NG) leaves the 13-token payload `L C B P NG P A R R TH B P C`. In the repository GP29 index order this is `[20,5,17,13,21,13,24,4,4,2,17,13,5]`, whose base-29 integer is **7144649572585460758**; reducing modulo 256 gives the independently selected LCG initial state **x₀ = 22**. The extraction and marker evidence are documented in [the 2016 signed-message word-map analysis](lp2-2016-signed-message-base58-word-map.md).

This supplies a concrete cross-round test rather than an arbitrary phase search:

1. Start the 2014 source-number LCG at `x₀=22`, with `xₙ₊₁=(133xₙ+331) mod 256`.
2. For its 256-state full cycle, read the original p50 table as `table[xₙ]` from [the original 256-byte table](../resources/liber-primus/lp2-grid-256.json).
3. Reduce those bytes modulo 29 and use the resulting 256-symbol stream as a repeating GP29 additive key over the 12,956 original unknown runes, in page order.

The seed-22 readout begins with bytes `3b9c7ac11f543441a39b7d19c900c7f8`. The previously noticed 11-byte Base64 run `Q8rI6/I6PiT` occurs at offset **103** (it occurs at offset **173** when starting at state 0): changing the LCG seed only rotates the same full-cycle readout, and this seed does not align that local run at the beginning or reveal a new byte pattern.

The direct GP29 consumer was tested under both additive signs and both clock policies (advance on every rune, or skip ciphertext F). Mean GP29 trigram log scores over the complete unknown stream were **−4.9733 to −5.0508**; the selected p17, p27, p32, p41 and p55 outputs remain nonlinguistic. Under the strict F-transparent interpretation, the four variants also produce **408–455** non-F ciphertext positions that would decrypt to plaintext F, which that rule forbids. The trigram model is a diagnostic, not a proof; the decisive observation is that no coherent plaintext or valid F-transparent stream emerges.

## Geometry-filtered perimeter/interior split: known-plaintext rejection (25 November 2026)

The 32×8 table has a 76-cell perimeter and 180-cell interior. Those counts match p55's 76 ciphertext runes and the combined 180 known plaintext runes on p56+p57. This makes the 2013 OS instruction “the key is all around you” and p55's “SHED CIRCUMFERENCES / FIND WHAT IS WITHIN” a plausible geometry selector. The 2016 signed-message PRNG marker supplies the already-derived LCG seed 22 described above.

I tested one locked composite operation:
1. Generate the full-cycle order with `x_0=22`, `x_{t+1}=(133x_t+331) mod256`, and read `table[x_t]`.
2. Classify each visited original row-major cell in the 32×8 grid as perimeter (top/bottom rows or left/right columns) or interior (rows 1–30, columns 1–6). Filter the LCG traversal into the two streams without reordering within either stream.
3. Reduce each table byte to GP29 by `byte mod29`. This gives a 76-symbol perimeter stream and a 180-symbol interior stream.
4. Compare the interior stream with the combined p56+p57 known plaintext, ciphertext, and the two exact additive-key differences. The p56 plaintext is the regression-tested text in `sims/authentic_lp2_p56_totient_regression.cjs`; the p57 text is the 95-rune clear-GP29 transcription in `resources/external/relikd-solved-gp29-native-v1.json`.

Results:
- Interior stream equals p56+p57 plaintext at only **8/180** positions and ciphertext at **10/180**.
- Required additive key `C-P mod29` matches at **7/180**; the opposite sign matches at **6/180**. These are at chance scale, not a partial key.
- The perimeter stream used as an additive key on p55 produces no readable text. Exact outputs:
  - `C-K`: `SEIDAXWAEXCLUMDPLFFRYSHCJTHASJFWMLNFLMEOAEYEOHEOACOETTHJISBAEBNSYOEEOCNGEOTHRGRFTPEOSAENGHEAEOU`
  - `C+K`: `IAOEAYMTIAOAAERJIAIHNAEMUPTGODAECPNNALGWPLCYCLPEBIJTHDOEAEBNGOTJOSIHEOEAEOAEAFNGIARAEIAPNGUDGAM`

### LCG cell-index permutation alternative

The LCG state sequence `x_t` is itself a permutation of all 256 original cell indices. I therefore also tested it as a transposition key, independent of the table byte values: filter `x_t` into perimeter/interior cells, map each visited cell to its rank in the canonical clockwise perimeter order or row-major interior order, then apply the resulting 76- and 180-position permutations as a forward read and as the inverse/write permutation.

- The two p55 outputs are nonlinguistic:
  - forward read: `OEATHXGEOEADIWDSCEAIXEIAEOEFAEILCGUUMUTHDEOFXMEAENGIAEEOXCCMTHPSSAEBEBNGHJSIWBSHISMGFTHEOBRBPCM`
  - inverse/write: `SWEOAETHGGFIEOFFXCINGAAEEHISJGMUIOECUDBEDBSEAEAPIAEMDTHBEAXSBXRILWECCHMEOIASCNGEOTHTHMEBEOSXUPM`
- Applied to p56+p57, the two permutations match the known plaintext at only **7/180** and **10/180** positions (the same transformed streams match the ciphertext at 9/180).
- As another direct-position control, the LCG-ordered raw table values modulo 76 have only 51 unique values; modulo 180, only 106. They therefore do not define permutations of the 76- or 180-symbol text segments.

This rejects the straightforward LCG-state transposition consumer as well as the table-byte pad/plaintext/XOR consumers. The seed and direction were fixed from the source-derived construction; no arbitrary seed or phase sweep was run.

### Five-bit XOR pad control

Because GP29 runes are indexed 0–28, a byte-table interpretation could also suggest a 5-bit XOR pad. I computed the exact required pad `cipher_index XOR plaintext_index` for the 180 known p56+p57 runes (all required values lie in 0–31), then compared it with the row-major and LCG-filtered interior table bytes reduced modulo 32.

- Required XOR-pad matches: **6/180** for row-major interior and **7/180** for LCG-filtered interior.
- Applying either perimeter stream (byte mod32) to p55 by XOR produces 7–8 values outside the GP29 range 0–28; neither output is readable.

This rejects the direct 5-bit XOR-pad consumer under the same 76/180 split.

**Reproduction:** `sims/lp2_onion7_133331_geometry_split_gate_sft.cjs` reconstructs the seed from the 13-token GP29 payload, reads the committed grid/corpus/known-plaintext resources, and asserts the counts and exact outputs above. Run with `node sims/lp2_onion7_133331_geometry_split_gate_sft.cjs`, or through `.github/workflows/manual-node22-sft-runner.yml` using that script path.

**Interpretation:** reject the exact composite `2016 seed 22 → 2014 133/331 LCG → original-cell perimeter/interior filter → byte mod29` as (a) direct p56+p57 plaintext, (b) their additive key, or (c) a p55 perimeter additive key; the cell-index transposition alternatives also fail the known-plaintext and p55 language gates. The 76/180 dimensional correspondence remains an interesting structural observation, but it does not supply this decryption. This test does not rule out other uses of the p50 table, different cipher families, or a separately sourced operation; do not rescue this branch by tuning the seed, phase, byte map, or cell order.

**Decision:** reject the specific `2016 13-token seed → x₀=22 → 133/331 LCG → p50 table → repeating GP29 additive pad` route. This does not prove the PRNG marker is irrelevant, but it does not authenticate the LCG as a decryption key or consumer. A different PRNG-driven route/permutation would need its own source-selected target and reversible operation; do not expand into arbitrary PRNG consumers, phases, or table modifications.

This is an intermediate negative result, not an LP2 decryption. No unknown plaintext, authentic key, or destination was recovered.
