# First-party Stage10 primes and p39 red-rune dual addresses into a complete DH23 packet and p55 length

**Agent40, 23 November 2026. Classification: new conditional cross-source selector with exact executable source controls; no new decrypted LP2 plaintext, author-authenticated cryptographic operation or destination.** [One source-only CommonJS SFT](../sims/lp2_stage10_p39_p50_dh23_packet_sft.cjs). Original Windows Node22 run [45105214019](https://github.com/FlareZ123/liber-primus/actions/runs/45105214019) established the complete DH tuple; the successor revision additionally asserts the p55 76-rune receiver.

## The original human-readable input

The 2014 Stage10 post-square server's preserved literal HTML [response](../resources/external/2014-stage10-post-square-response.html) displays precisely three images in sequence: **107.jpg, 167.jpg, 229.jpg**. Their ordinary 1-based prime ordinals are **28,39,50**, an arithmetic progression with step **11**. Earlier [Stage10 prime-ordinal research](lp2-2014-stage10-triple-primeordinal-original-inverse.md) identified the possible corresponding LP2 physical pages and the p27/p55 28-page 7-gram echo. It did *not* infer the following two-cell DH packet or the p39 red triple's two address classes.

At **physical p39, original image 56.jpg**, the only red rune object lies at local offset119. The three exact source runes **ᛡᚳᛋ** have native GP29 **indices [27,5,15]** and GP-prime weights **[107,13,53]**. Unlike the longer red headings, the entire three-rune object is a complete, independently annotated visual source unit, alongside real Babylonian cuneiform **1033/3301** in the same section. The existing [three-orbit analysis](lp2-cuneiform-1033-three-orbit-original-gate.md) had already noted its prime sum173 and independent prime-ordinal relation to1033; these are inherited facts, not new discoveries.

Use two conventional readings available from Gematria Primus, with original row-major p50 32×8 base60 numerals [transcribed and source-adjudicated here](../resources/liber-primus/lp2-grid-256.json):

| p39 source datum | Zero-based p50 address | Source printed pair | Base60 value | Possible data type |
|---|---:|---|---:|---|
| GP0 index sum, 27+5+15 | **47** | **1G** | **76** | Exact full original **p55 rune count76**; also exactly the rectangular p50 outer-rim size 2(32+8)−4=76 |
| GP-prime sum, 107+13+53 | **173** | **1v** | **117** | Candidate DH generator and common-secret packet |
| Intrinsic first table cell, no pointer | **0** | **3N** | **203** | Candidate DH public-pair packet |

Cell47's base59 skip-unused-\`f\` alternative gives **75**, the length of the 16 complete printed p55 words after excluding its genuine leading **one-rune continuation from p54**. This is a *separate conditional whole-page versus body-only recipient interpretation*, not permission to switch sources opportunistically. Source p55 has exactly76 original GP rune glyphs and all 75 following the carry form its own complete words. The literal table's other \`1G\` is cell205; independent earlier reports discuss cell205 and the p50 geometric rim75/76, so **the increment here is p39's original ordinal47 selector**, not recognizing the value76 or the perimeter.

Across all **18 actual red spans** in the original ink annotation file, only p39's ordinary GP index sum selects a base60 table value of76. Its unmodded prime sum173 is also the only authentic red-spanned prime sum exactly173. These constraints restrict an exploratory test; they are **not** a discovery-adjusted statistical significance test.

## A chapter-native p33-to-p39 pointer that selects 173 before DH interpretation

The **second red heading on physical p33**, located at local rune offset91, is the **eight-rune entry marker** to the 1,589-rune cuneiform unit ending near p39. Its native GP0 index sum is **84**. Reading the unchanged original cell \`p50[84]="2r"\` in base60 gives **173**, exactly the p39 closing red triplet's independently available GP-*prime* sum173.

\`\`\`text
physical p33 start-of-cuneiform red8 GP0 sum = 84
             ↓ original table byte-as-next-address
p50 cell84 = "2r" = 173 (base60)
             ↕ exact numerical identity
physical p39 end-of-cuneiform red3 GPprime sum = 173
             ↓ original same-table address173
p50 cell173 = "1v" = 117 (base60), conditional DH23 packet
             ↘ separate red3 GP0 sum47 → p50[47]="1G"=76, p55 recipient
\`\`\`

This is a narrower possible *human solve-path* than beginning with an arbitrary source integer: the very first distinct red marker within the cuneiform material points numerically to its **last red marker** via the author's existing printed base60 table. In an exhaustive fixed-grammar census of **all 18 real red source spans**, \`source GP0 sum modulo256 → table base60 value → target GP-prime sum\` has **exactly one directed edge**, precisely **(p33 local91) → (p39 local119)**. No other red mark satisfies the same rule. The earlier p39 prime173 was already independently linked to the literal cuneiform numeral1033, so this creates a potential start-to-end chapter cue rather than requiring discovery of173 in isolation.

The two distinct GP numerical readings are both authentic features of Gematria Primus. **Switching from ordinal sum on the source to prime sum on the target is analyst-selected**. Further, among all 18 red spans only two have full prime sums within byte range, so one graph edge is not statistically extraordinary. The original text does not directly instruct this cross-radix traversal or its continuation to p55. No additional plaintext emerges merely from the observed edge. [Reproducer](../sims/lp2_stage10_p39_p50_dh23_packet_sft.cjs).

## Independent full DH23 transcript recovered algebraically from three public objects

The address173 is the **zero-based** position row21,col5 in the original 32×8 grid. The following packet interpretation is deliberately specified as equations to expose the unsupported step, rather than retroactively calling it plaintext:

\[
\text{address} = 8(p-K)+g,\qquad
\text{indexed cell value} = pg+K.
\]

From the *original red rune triplet, the literal table's eight columns, and indexed cell173 only*, those two equations invert exactly as follows:

\[
r=\lfloor 173/8\rfloor=21,\quad g=173\bmod8=5,\quad v=117
\]
\[
p=\frac{v+r}{g+1}=\frac{117+21}{6}=23,\qquad K=p-r=2.
\]

Thus **(modulus p, generator g, shared secret K) = (23,5,2)**. For the natural first cell, the analogous two-field positional representation in base p gives

\[
203 = 8\cdot23+19
\quad\Rightarrow\quad
A=8,\ B=19.
\]

The first-party 2014 prime-ordinal progression already has step11; reading its step as \`g+a\` gives \`a=11−5=6\`. Ordinary discrete logarithm in the tiny first-party DH23 setting determines \`b=15\` uniquely, because \(5^{15}\bmod23=19\). The entire resulting tuple is

\[
(p,g,a,A,b,B,K)=\mathbf{(23,5,6,8,15,19,2)},
\]
with independent DH checks \(5^6\bmod23=8\), \(19^6\bmod23=2\) and \(8^{15}\bmod23=2\).

**Important historically known-message confound:** Cicada's authenticated 2013 TCP-server specification had already printed the complete DH23 *worked example* \`C: DH 23 / S: OK 5 8 / C: 19 / S: DATA 2\`, before the 2014 LP2 release. The private exponents6/15 are recoverable by trivial discrete logarithms. This tuple is a **public teaching fixture, not an undisclosed creator key**, and the original protocol lets participant servers choose other primes and private exponents. See the [2013 source audit](cicada2013-dh23-worked-example-player-visible-gate.md). Thus the manuscript, table and historical values may be jointly aligned to an already familiar public example; numerical agreement by itself cannot authenticate the conjectured packet equation, nor imply recovery of secret material. The independently demonstrated fact here is the two different original table-cell contents and their convergence on that familiar fixture under a simple *postidentified* arithmetic representation.

**Held-out source comparison:** Physical p28, uniquely selected by the original solved FIND and original 2014 image ordinal28, already supplies **(p,g,a,B) = (23,5,6,19)** from its printed 23-rune DH-headed sixth line, fifth-symbol word28, line position6 and position19 of the selected word. The existing [full original p28 DH derivation](../sims/lp2_p28_centerline_dh23_sft.cjs) independently yields \`A=8, b=15, K=2\`. No p28 glyph was used to calculate the red3+table tuple above; the already known tuple was used to *recognize and hypothesize* the packing rule, however. Thus source data cross-check exactly, but the novel algebra is **postselected**.

**Radix control:** The same unmodified printed pairs interpreted in skip-\`f\` base59 become cell173 \`1v=115\` and cell0 \`3N=200\`. The identical formulas yield \((115+21)/6=22\tfrac23\), an invalid integer modulus, while \(200\bmod23=16\), not public \(B=19\). Therefore the proposed full-DH packet reading selects **base60 uniquely among these two native readings**, consistent with the section's authentic sexagesimal theme. This does not contradict earlier local base59 p57 punctuation constructions: no author instruction has proved a manuscript-wide uniform radix.

**Exact source multiplicities:** in the original 256-cell base60 table, numeric203 occurs **once** (cell0) and numeric117 occurs **twice** (cells173 and230). Conditioned on the *specific already-chosen* address0, address173, output203 and output117, a uniformly random permutation of the observed 256 numbers would have probability \((1/256)(2/255)=1/32640\) of these two simultaneous cells. The source selection rules and packet form were discovered while inspecting the manuscript; the conditional value is **not** a calibrated discovery P-value. Other address definitions, modular equations, public variable serializations and historical links are possible, so the actual explanatory force remains unsettled.

### Complete original-grid packet census

To avoid treating an attractive cell173 as evidence without checking rival cells, apply the **same equations and the same historical 2014 ordinal step11 to every one of the 256 original table addresses**, with the same literal first cell and no newly fitted constants. Under the conventional base60 digit alphabet, **15** of 256 addressed cells admit an integer prime modulus `p`, a generator `g=column`, and a legal shared `K=p−row` at the first two equations. Requiring the *independent first cell* to unpack two nonzero DH public values `A,B` and satisfy the two DH identities `g^(11−g)=A (mod p)` and `B^(11−g)=K (mod p)` leaves **exactly one** address in the whole table:

```text
index=173, row=21, col=5, token=1v, value=117
p=23, g=5, K=2, A=8, B=19, a=6
```

Under the other source-attested **base59 (omit f)** digit alphabet, **12** of 256 cells initially admit prime `p` and legal `K`, but **zero** satisfy the complete public-packet DH identities from first cell `3N=200`. These all-cell censuses appear as exact assertions and complete raw matching sets in [the reproducer](../sims/lp2_stage10_p39_p50_dh23_packet_sft.cjs), independent of p28 as the input receiver. This makes cell173 **unique within the declared, analyst-proposed equation family**. It does not establish that the authors chose this particular two-equation family, or that a 256-way table scan was an intended human step. Other arithmetic families would generate different survivors, and the complete DH23 tuple was already a public 2013 worked example.

## An additional independent 203 convergence, kept secondary

Earlier Stage10-prime-ordinal [original evidence](lp2-2014-stage10-triple-primeordinal-original-inverse.md) established the p55 terminal six-rune ciphertext echo at **p27 offset28** and the immediate next complete p27 word **AE.F**, which has native GP-prime sum**103**. This selects table \`p50[103]="3Q"\`. Under the competing page57-inspired **skip-\`f\` base59**, that token is also exactly **203**:

\[
\operatorname{base59}_{\text{omit }f}(\texttt{3Q})=3\cdot59+26=203,
\]

the same numeric value as \`p50[0]="3N"\` under base60 and the packed DH-public \((8,19)\). This is another original-data equality. It requires a local radix switch with no authenticated switch instruction, so it is weaker than the uniform base60 p39/table route and **must not be treated as an extra independent success probability**.

## Causal decision

The new candidate is unusually structured: an external historical **p28→p39→p50** triple, an independently printed **p39 red3** with two native arithmetic sums, the first and two precisely indexed **physical p50 table cells**, a **p55 full76-rune receiver**, and an independent complete **p28 DH23 state**. The same small prime23 and state [5,6,19,8,15,2] satisfy several different exact source equations. It is a plausible hypothesis for a human solver to notice at the intersection of the 2014 primes, cuneiform/sexagesimal, and signed 2016 “words/numbers/direction” clue.

Three crucial assumptions remain **unlicensed by a source instruction**:

1. Using *both* the original p39 red3 GP ordinal sum and prime sum as zero-based p50 addresses, especially since the historical 2014 image-filename ordinals give a distinct possible indexing convention.
2. Interpreting addressed cell173 as \(pg+K\) and its **row** as \(p-K\), rather than ordinary byte/data or a different number encoding. This is a postidentified constraint from the known p28 DH output.
3. Interpreting the p50 *first cell* as \(pA+B\) and the 2014 prime-ordinal step11 as \(g+a\). Both are arithmetic hypotheses, not existing authenticated cipher operations.

**No original LP2 ciphertext rune has been decrypted.** The test provides a fully source-replayable **candidate operand and recipient**, not the missing reversible word/GP29 transformation or a predicted unknown plaintext. Earlier p55 76-rune direct perimeter/Vigenère/additive pad attempts (e.g. [p50 ring76 all-secret](lp2-p50-ring76-original-p55-allsecret-stationary-gate.md)) are already negative and should not be rerun without an independently selected different consumer.

**Next discriminating action:** obtain an original 2014–2016 text or artwork clue selecting one of the packet equations, the table address order, and a **complete 76-rune GP29 inverse**. Use the frozen proposed tuple to predict at least two *withheld original p55 words* or an intact numbered cuneiform unit before examining score or output. If that fails, retire the candidate as numerical concordance; do not tune alternative equations or secret key phases until another source selects them. This conditional bridge is recorded in **im-results/**, with the authoritative [results overview](../results/README.md) unchanged because all 56 LP2 pages remain unsolved.
