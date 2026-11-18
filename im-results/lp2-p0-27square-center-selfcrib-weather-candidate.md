# LP2 p0–2: source-derived central self-crib, provisional reading, and non-unique continuation

**Research state, 18 November 2026.** The geometric center self-crib and proposed WEATHER reading are reproducible source arithmetic. After granting the selected route through **AS**, the external author's frozen retrospective 3301 criteria reduce the exact Reports00–15 next-block pool **21,342→48/15→1**, uniquely recovering **I·A·S·C/K**. A newly identified plaintext-blind handoff from that fixed four-rune anchor then reduces the later Reports00–19 post-I-ASK pool **966 geometries → 12 → 6 → 4 → 2 → 1** and selects the published `D·I·E` placement before reading its plaintext. The handoff was discovered after DIE was public, so it is a concrete candidate parser rather than creator authentication. No complete deterministic reading order for the earlier prefix has been established.

[Original map self-crib SFT](../sims/lp2_p0_27square_center_selfcrib_source_sft.cjs) · [New Reports 17–19 original-source all-candidate SFT](../sims/lp2_p0_27square_reports17_19_ambiguity_sft.cjs) · [External original hypothesis](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption).

## Stronger conditional result: two frozen 3301 totals uniquely recover I ASK after AS

The external project also publishes a source-independent endpoint test from its fixed block37 **AS** placement. This deserved a separate audit because, unlike the later DIE choice, it claims to select the next source and ciphertext without supplying an English word or block length.

Grant the external Reports00–15 state after AS. The resulting outgoing geometry is fixed: phase/signature **0 / (0,0,0)**; vertical non-mirror source centered on even row / odd column with odd radius; vertical ciphertext read downward with bottommost endpoint = leftmost; endpoint row even and column odd; exact eight-ray deviation1 from the previous leftmost cell. Enumerating the unchanged 729-rune p0–2 source gives exactly the published search sizes:

| Fixed-AS endpoint stage | Assignments |
| --- | ---: |
| Reports00–15 baseline | **21,342** |
| Require next-block plaintext GP = **194** | **48** |
| Require source-position sum + full derived-key GP + plaintext index sum = **1,223** | **15** |
| Require both | **1** |

The unique joint survivor is the original vertical source **T–M–EA** at **(11,13),(12,13),(13,13)**, radius1, used directly. It decrypts ciphertext **Y–X–X–NG** at **(5,17)→(8,17)** to GP indices **(10,24,15,5)** = **I·A·S·C/K**, conventionally read **I ASK**. Its last-block values are plaintext GP **194**, plaintext-index sum **54**, source-position sum **930**, and full key GP **239**; therefore **930+239+54=1,223**.

The two target values come from the proposed branch's 3301 accounting after the preceding selected GO/DO/AS blocks: the branch plaintext GP is required to equal **π(3301)=464**, so the final block contributes **464−270=194**; the composite source/key/plaintext total is required to equal **3301**, so the final block contributes **3301−2,004−74=1,223**. The published eleven-prime sensitivity check is also exactly reproducible: replacing 3301 by each of the five neighboring primes on either side and updating both targets gives zero joint survivors in all ten controls; only **3301=p₄₆₄** gives one.

A broader same-form control tempers that local sensitivity result. Let the target prime **q** vary over every value implied by the same two equations on the complete 21,342-assignment catalogue, rather than restricting q to the ten nearest primes around 3301. The possible q range is **2,410–4,581**, containing **262 primes**. Exactly **three** targets produce any joint survivor: **2657**, **3301**, and **3557**, with one assignment each. Their rune outputs are respectively `B·S`, `I·A·S·C/K`, and `E·U·A·B`. Thus 3301 is sparse within this frozen equation family (3/262 candidate primes have any solution), and its value is independently distinguished by Cicada's public identifier, while the algebraic form itself does not mathematically isolate 3301. The 3/262 ratio is a finite family count, not a discovery-adjusted probability.

**Interpretation:** this is materially stronger than selecting an English-looking output from a large pool. Given the selected AS prefix and the two frozen arithmetic criteria, I ASK is an exact, unique, reversible consequence of the original ciphertext. The remaining weakness is causal: both criteria were discovered retrospectively after the route was chosen, and the prefix through AS remains semantically selected. This result therefore upgrades **I ASK** to a *conditionally recovered* endpoint inside the external model, while stopping short of creator-authenticated LP2 plaintext.

**Reproduction:** [standalone CommonJS SFT](../sims/lp2_p0_27square_iask_3301_endpoint_sft.cjs) asserts the exact **21,342 / 48 / 15 / 1** counts, full reencryption, unique geometry/key, and all eleven neighboring-prime outcomes.

## I ASK-derived plaintext-blind handoff conditionally selects DIE

The external 27×27 repository continues its selected route beyond **I ASK** with block39 **DIE**. Reports00–19 alone do not select it: the exact original-source census leaves **966 physical geometries, 1,116 aligned-key assignments, 19 ordered ciphertext segments, 1,088 GP29 outputs, and all 39 admissible source centers**. The literal rune string DIE occurs once inside that pool, which by itself is only semantic selection.

A new arithmetic handoff found from the conditionally recovered I ASK anchor sharply changes the local decision. It uses only the accepted current source/ciphertext/plaintext indices and the unchanged next-grid geometry:

1. The current source center is **(12,13)**, row-major **n₀=310**. The trailing three-rune period of the recovered four-rune block is **A·S·C/K**, with GP **97+53+13=163**. Therefore **310+163=473**, exactly **n₀(18,14)**, the center of the proposed DIE source.
2. The current I ASK ciphertext runes are **Y·X·X·NG = (26,14,14,21)**, whose rune-index sum is **75**. Therefore **75+1=76**, exactly **n₀(3,22)**, the proposed next ciphertext beginning.
3. Holding those two cells fixed and reapplying the frozen Reports00–19 conditions leaves just **12** assignments: source radii **4 or 8**, three admissible straight segments, and direct/center-totient variants.
4. Set the next source radius to the current **four-rune block length**. This leaves **6** assignments and selects original source **C/K–D–IA** at radius4.
5. Read one complete **three-rune key period**. This leaves **4** assignments.
6. The selected source center moved from row12 to row18, so use the diagonal whose row sign follows that displacement, **down-right**. This leaves **2** assignments.
7. Resolve direct versus center-totient without a dictionary by requiring the **original source-center rune to self-crib at the first plaintext position**, reusing the source-visible self-crib motif that motivated the opening p0 investigation. The direct center D=23 satisfies **B17−D23 ≡ D23 (mod29)**; the transformed center does not. Exactly **1** assignment remains.

Only after these selections are frozen does the code decrypt the three original ciphertext runes **B–H–D** with aligned direct key **D–IA–C/K**, yielding **D·I·E**.

A route-wide generalization check cuts against treating this as a parser. Auditing the external selected route encoded in its live map, the equality **next source-center n₀ = current source-center n₀ + GP(current trailing word)** holds in only **1 of 29** evaluable transitions, and **next ciphertext-start n₀ = current ciphertext rune-index sum + 1** holds in only **1 of 34** complete transitions. The sole hit in both cases is the already-known **I ASK → DIE** transition. Because the formulas and tie-breakers were found after DIE was public and no first-party clue currently signals a terminal mode switch, these counts measure a selective one-transition post-fit rather than reusable predictive behavior.

**Decision:** the stack is a reproducible **plaintext-blind one-transition selector** from the fixed I ASK anchor, which precisely bounds how DIE can be obtained without querying its plaintext. It does not independently authenticate DIE or justify using the handoff as a general parser. Preserve it as an overfit boundary unless a first-party clue selects the terminal mode or the same complete stack succeeds on genuinely withheld material. [Standalone CommonJS handoff SFT](../sims/lp2_p0_27square_iask_to_next_handoff_sft.cjs) freezes the **12→6→4→2→1** selection and decrypts only after the unique candidate is fixed. [The broader all-candidate SFT](../sims/lp2_p0_27square_after_iask_die_ambiguity_sft.cjs) preserves the 966-geometry baseline.

## New decision: later Reports 17–19 leave an exact English ambiguity

**Upstream premise:** Treat the 729 unmodified GP29 ciphertext runes on original physical pp0–2 as one 27×27 row-major square and grant the external author's *proposed* first 17 blocks, ending at THEN. The original authors have not authenticated that proposed grid cipher. Apply every previously implemented applicable constraint of the external Reports 00–16, then the subsequently published [Report17](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/17-xor-next-key-center-column.md), [Report18](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/18-predicting-next-ciphertext-start-and-end.md), and [Report19](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/19-predicting-next-ciphertext-start-distance.md) without using a dictionary to select source nodes or plaintext.

The original THEN block's key node is (25,22)–(27,22) with midpoint (26,22). Its ciphertext occupies (25,25)–(25,27), with preceding SOON beginning at (25,16). Report17 supplies \`n3(M)=161\`; its XOR-Möbius test accepts all **four** original source-key centers surviving the earlier constraints. Report18 predicts exactly (endpoint sector, endpoint Möbius sign, start-side) = **(1,0,0)**. Report19 predicts the next start must be at Chebyshev distance at most seven from both the previous beginning and leftmost source cell. These are the author's fixed published formulas; none is reoptimized for this test.

| Original-source conditional candidate stage | Distinct source-key/segment assignments |
| --- | ---: |
| Exact Report 00–16 baseline (independent preceding census) | **1,104** |
| Add Report17 | **1,104** |
| Add all three Report18 predicates | **604** |
| Add Report19 distance test | **268** |

The final 268 assignments comprise **67 different physical ciphertext segments, with all four source key nodes still admissible on every segment**. Thus even when all later filters are granted, they do not supply a unique next source node, segment or GP29 plaintext.

An exact **same-cell, complete-word witness** is more decisive than a generic candidate count. Read the original ciphertext J at **(22,21)**, GP index11, and W at **(21,20)**, GP index7, in the published upward-left direction:

| Next original mirror key source | Derived GP29 key aligned to the two ciphertext runes | Exact subtraction mod29 | Complete English word |
| --- | --- | --- | --- |
| N–M–N at (17,17), (20,17), (23,17), with φ(M=19)=18=E | N–E, indices (9,18) | (11−9, 7−18) mod29 = (2,18) | **THE** (TH–E) |
| X–M–X at (5,25), (8,25), (11,25), with φ(M=19)=18=E | X–E, indices (14,18) | (11−14, 7−18) mod29 = (26,18) | **YE** (Y–E) |

Both witnesses pass all enumerated constraints in Reports 00–19 with the exact same ciphertext path. **YE** is a genuine English word, albeit far less common than THE; the frozen TextBlob source lexicon \`resources/control/english_wordfreq_textblob.txt\` contains both (frequency 8 versus 80,030). A grammatical preference for THE or a particular intended genre may be valuable hypothesis selection, but it does not constitute an author-specified key-node selector. The earlier distinct-cell **MY** and **OF** competing witnesses fail the *new* Report19 near-distance test, so they are retained below only as a correct audit of the previous Report00–16 scope.

**Decision:** Retire any assertion that adding Reports17–19 turns the proposed p0–2 geometry into a deterministic decipherment. The next useful progress would require a genuinely manuscript-selected source-key locator, a precommitted independent next-step prediction, or a reversible path accounting for much more of the 729 input runes without semantic choices. The external Reports17–19 were explicitly fitted retrospectively to an already chosen English route; all-prior-route fit alone does not validate the route. This is a new finite ambiguity certificate, not recovered plaintext.

**Reproduction:** [standalone CommonJS SFT](../sims/lp2_p0_27square_reports17_19_ambiguity_sft.cjs) asserts the four original mirror keys, exact original source cells, all stage counts, every reencryption, 67×4 multiplicity and the two divergent GP29 words. It needs only the unchanged canonical \`lp2-corpus.json\`.

## Previous exact limit: Reports 00–16 do not select a unique next block

The external [27×27 map author's 17-block proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption) ends at **THEN**. The complete original first chapter has **729 GP29 runes**, read row-major in 27×27. Its final proposed source node **IA–IA–IA** is at (25,22)–(27,22), centered at (26,22); its ciphertext **L–T–W** occupies (25,25)–(25,27). The published source phases of blocks 1–17 sum to **18**, selecting Report11's reflected/+1 next-key prediction.

Apply the formulas of the external author's Reports **00–15**, including the later exact ray-deviation, key-source axis, and radius-parity rules. From the unchanged original THEN block, the predicted next-source signature is **(+1,+1,+1)**, phase **0**, a vertical *mirror* with center (even row, odd column) and **odd radius**. The next ciphertext must run **diagonally up-left**, end at its leftmost cell with an **odd row and even column**, satisfy the source's four squarefree-GCD constraints, and begin at exact eight-ray deviation **1** from prior leftmost (25,25). Report16 then accepts complete English words.

These constraints admit at least the following physically different original readings, neither requiring a hypothetical rune or fitted key index:

| Plaintext word | Original source node (outer–center–outer) | Original node runes → derived, aligned key | Next ciphertext cells, unchanged runes | Four μ(gcd) values |
| --- | --- | --- | --- | --- |
| **THE** (external proposed block18) | (17,17)–(20,17)–(23,17) | N–M–N → **N–E–N** | (22,21) J; (21,20) W | −1,+1,+1,+1 |
| **MY** (independent competing block18) | (5,25)–(8,25)–(11,25) | X–M–X → **X–E–X** | (18,17) R; (17,16) S | −1,−1,−1,−1 |
| **OF** (further whole-word witness) | (5,25)–(8,25)–(11,25) | X–M–X → **X–E–X** | (6,5) B; (5,4) E | −1,−1,−1,−1 |

For the competing **MY**: the original X–M–X source's center has GP index 19, φ(19)=18=E; the aligned key is indices **[14,18]** at the two ciphertext positions. Their unchanged rune indices **[4,15]** give (4−14) mod29=19=M and (15−18) mod29=26=Y. The next start (18,17) has absolute displacement (−7,−8) from the preceding leftmost (25,25), giving **d₈=1**, exactly as required. Its key source radius 3, 90°-rotation leftmost Möbius value 0, coordinates/parities, and all four GCDs pass. The published **THE** candidate passes the *same* checks. Both are complete English words under Report16, and both leave the continuation unspecified.

An exact lattice enumeration of **all four eligible vertically mirrored source nodes** and diagonal up-left source ciphertext runs, imposing the other published finite constraints, returns **1,104** admissible source/ciphertext pairs with **1,093 distinct decoded rune strings**. The three explicit complete-word witnesses above survive the **same** constraints. This count precedes further grammar/style judgment. The external scheme may still be a useful *proposal*, and the 27×27 center self-crib below remains a real original-rune relationship, but a semantic preference for THE does not constitute a deterministic, previously selected decoder. Claims of independent authentication for the external 38-block continuation require a new source-derived selection rule or genuinely withheld ciphertext prediction.

**Reproducer:** [Agent29 standalone CommonJS SFT](../sims/lp2_p0_27square_afterthen_fulllattice_sft.cjs), [successful original-source Windows/Node-compatible CI run 44038887882](https://github.com/FlareZ123/liber-primus/actions/runs/44038887882) reads the untouched canonical p0–2 source, verifies the 17-block predecessor state, recomputes every applicable report constraint, reconstructs the two competing whole words and OF, and exhaustively counts the finite surviving source/ciphertext pairs. This is a bounded **non-uniqueness certificate**, not a claim of recovered unknown-page text.

## A self-crib present in the first source-defined square

The first original unsolved chapter, physical p0–p2, has exactly **729 GP29 runes = 27²**. A 27×27, original page-order row-major layout is therefore a natural but still **hypothetical** human operation. The center cell is **(14,14)**, a GP rune **NG**.

The three original GP runes **immediately above** this center, cells **(13,14–16)**, are **`W–EA–TH`** (three runes, five Latin letters). The untouched original center row's next three runes, **(14,14–16)**, are **`NG–P–EO`**. Taking their GP-index differences modulo29 yields **`X–X–I`**, with indices **[14,14,10]**.

The same central row contains a distinct original three-rune source **`X–OE–X` at (14,4–6)**. The center index OE=22 gives **φ(22)=10=I**, hence transformed key `X–I–X`. The explicit prior author's phase rule computes μ(φ(key))=[+1,0,+1] and rotates by two, yielding the exact independently computed **`X–X–I`**. The distance from key source's left cell **(14,4)** to grid center **(14,14)** is **exactly 10**, also φ(22).

Thus the exact original source simultaneously supplies a **visible three-rune crib**, a transformed source node encoding the corresponding key, and the numerical distance needed to reach the center. Without an English guess, decrypting the original five central-row runes **`NG–P–EO–O–E`** with periodic `X–X–I` gives

```text
cipher: NG  P   EO  O   E
key:    X   X   I   X   X
plain:  W   EA  TH  E   R
```

Candidate **`WEATHER`** follows. The `E,R` continuation is a **two-rune extension after the three-rune self-crib**, subject to the still-unselected five-rune stopping point.

## Independently reproducible source specificity

Fix the **center (14,14)** of a 27×27 window, the three **row-above** source values and the GP29 φ/μ phase rule above. Enumerate **all row14, left-of-center 3-rune source nodes** in the same window, accepting only those whose movement of **φ(center)** lands at column14. Test the exact three-rune equality with no language scoring or chosen text.

The SFT finds **one source node at (14,4–6)** on the original p0–2 input. It then repeats the same fixed operator on **every 729-rune consecutive window in the entire 12,956-rune unsolved source**: **1 hit in 12,228 overlapping windows**, at the *original first chapter offset0* with the same left-column4. Shifting the original chapter's whole 729-rune tape cyclically through all **729 intact phases** gives exactly **one hit**, at unchanged phase0. A planted source-node/key/crib case passes.

These windows and shifts are dependent tests, and the search operator was motivated after the external WEATHER proposal became public. **1/12,228 and 1/729 describe selectivity within frozen finite comparisons; neither fraction is a valid discovery-adjusted p-value.** The source-specific equality is genuine; attribution to the creator is unresolved.

### Original-source rarity versus a matched ciphertext-generator null (Agent23, 16 November)

The exact **1/12,228 original sliding-window hit** above measures within-manuscript specificity. It does **not** by itself measure how surprising such a hit would be in another manuscript with the same anti-repeat ciphertext fingerprint. The prior author's `centerSelfCrib` test fixes a 27×27 center, compares the three runes above it to the source key decoded from a left-of-center three-rune node, and requires the source node's raw middle-rune totient to land on the center. These constraints can be counted directly under an independently generated uniform GP29 model.

A deterministic 1,000-book matched-chain control generates 12,956 GP29 runes per book, with uniform initial glyph, adjacent step zero at the original **86/12,901** within-page repeat rate, and other steps uniformly among residues 1–28. The complete 12,228-window / 13-left-position source-self-crib predicate is unchanged from the original test. **309/1,000 synthetic books** have at least one hit; **365** total synthetic hits occur, compared with the original's **one**. The analytic independent-rune expectation is **0.3706904 hits per entire book**, consistent with 0.365 measured under the anti-repeat chain. Thus the original generic self-crib equality has no claim to statistical rarity from the within-book 1/12,228 fraction alone.

The original matching source node, **X–OE–X** at row14 columns4–6, is also an authentic flank palindrome, relevant because the proposed preceding block terminates upon reaching a mirror. Adding this separately frozen **equal-flank** requirement makes the null rarer: **19/1,000** matched-chain books contain at least one mirrored self-crib hit; the independent-rune expectation is **0.01323894 per full book**, versus 0.3706904 without the mirror. The original has exactly **one mirrored hit**. This narrower fact is potentially worth preserving as conditional geometric evidence; its apparent significance is **not** discovery-adjusted, because the mirror, center, key rotation and English WEATHER route were investigated together after the external plaintext proposal. It still neither selects a deterministic next block nor authenticates unknown-page text.

[Deterministic full-original CommonJS null and matched-positive reproducer](../sims/lp2_p0_27square_center_selfcrib_markov_null_sft.cjs), successfully executed on [Windows Node22 CI 43825254189](https://github.com/FlareZ123/liber-primus/actions/runs/43825254189), freezes the real one-hit census and executes all 1,000 independent anti-repeat controls without selecting vocabulary or fitting a key. **Decision:** investigate the *joint* manuscript-selected mirror-to-center grammar rather than multiplying the unique-hit statistic into proof; require blind unused-ciphertext predictions.

## Why the candidate starts with AS I GO THE

The earlier independent community proposal also identifies original p0 red title of **13 runes**, using **φ(13)=12** to select the source node centered at **(13,12)**. Its immediate neighbors **AE–J–EA**, center J=11 → φ11=10=I, produce key **AE–I–EA** (μ(φ(key)) all zero, phase0). An independently *proposed* distance **φ(11)+φ(φ11)=10+4=14** to the right of left cell **(13,11)** lands at **(13,25)**. The next seven original runes in row-major order, **`L–AE–N–TH–P–U–X`**, subtract against that periodic key to give **`A–S–I–G–O–TH–E`**, or *AS I GO THE*.

There is a natural **potential stopping and handoff rule**: the first contiguous three-cell mirror `a,b,a` encountered at or after that source start begins **exactly at the seventh ciphertext rune**, X at (14,4), whose two following cells are **OE–X**. This is precisely the source node that starts the next WEATHER operation. A solver could identify this mirror from the unmodified square, without knowing the decoded English. This is a research hypothesis about an intended route, **not an original printed instruction**.

The previous author's next ciphertext WEATHER begins at **(14,14)**, as independently selected by the source node's φ-center distance. A new continuation test below identifies a possible original-source constraint on the following block's key and length. The operation connecting the blocks remains conjectural.

## A third and fourth candidate with independently visible stopping events

The source's original `X–OE–X` node has **original center index OE=22** and **derived center I=φ(22)=10**. These give two independently defined radii:

- **φ(10)=4**: relative to the horizontal center row, look right of the original center rune **NG** at (14,14) for a horizontal **mirror of radius4** with the *same NG center glyph*. Exactly **one** row14 mirror meets those constraints beyond column14: **A–NG–A** at **(14,19), (14,23), (14,27)**. Thus, if this source-first selector is intended, the next block starts on the immediately following rune at (14,19), and the five-rune end of WEATHER at (14,18) is selected without reading the English word first. This selection itself is still a research hypothesis, and another radius4 mirror **O–AE–O**, starting at (14,17), exists, so an unconstrained *next mirror* rule would select the wrong event.
- **φ(22)=10**: at the new shared original center (14,23), take the **vertical source at radius10**: (4,23)=H, (14,23)=NG, (24,23)=C. The unchanged source key **H–NG–C** has μφ signature (0,0,0), so no phase rotation is needed. This is a source-derived *specific* key node under the conditional cross rule. **Applying φ to its center instead** produces the equally structurally permitted key **H–EO–C**, yielding a different output. The original artwork has not resolved which transform state to use.

The external author's [explicit axis/boundary prediction](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/03-predicting-axis-and-reading-direction.md), when frozen on the completed WEATHER block, calls for a **vertical upward** next read. This forecast was constructed in the context of the proposed plaintext and is **not independent historical authority**. Starting at left mirror flank **A (14,19)**, reading upward in the canonical 27×27 source yields **A–OE–N–B–W**, and the raw `H–NG–C` key decrypts it to **T–U–R–N–S**. Transforming the center of that key instead decrypts **T–I–R–N–A**.

**New original image-boundary observation: the fifth TURNS ciphertext rune W is the exact last GP rune on original physical p0.** The source positions along this upward ray are, in 1-based global first-chapter indices, **370, 343, 316, 289, 262**. Physical p0 has exactly **262** GP runes, followed by p1 (266) and p2 (201). The first four source cells are in p1, and the fifth lands on the original p0 final rune. Consequently the stop rule **“include the first original p0 rune encountered by this upward read”** selects **exactly five** runes from the physical page boundary, without asking whether the output spells TURNS. This is a new clue-constrained possible length; its historical intended use has not been established.

The same source geometry yields a fourth candidate:

- The original NG=21 at the center of the A–NG–A / H–NG–C cross gives **φ(21)=12**. Move down12 from its left mirror flank A (14,19) to **TH (26,19)**; its immediate vertical neighbors give original **H–TH–H** at (25–27,19). Transform center TH=2 to φ(2)=1=U; signature (0,+1,0) rotates it to **U–H–H**.
- From the same A anchor (14,19), move left12 to **G (14,7)**. The preceding author's direction forecast gives an upward read. The four successive original glyphs **G–J–EA–A** decrypt with **U–H–H** to **C–O–L–D**.
- A new *source-visible stop event* is available: moving upward from (14,7) along column7, the **first visited cell that is the center of an adjacent vertical mirrored triple** is **A at (11,7)**, flanked by **EA at (10,7)** and **EA at (12,7)**. Earlier visited centers at rows14,13,12 are not mirrored. This fixes the **four-rune** segment length if that stopping condition was intended. The original global source indices are **358,331,304,277**.

These two constraints strengthen the causal possibility of the first **four** candidate blocks, giving the GP plaintext sequence `A S I G O TH E | W EA TH E R | T U R N S | C O L D`. The evidence is original-rune geometry with additional possible *word-independent* stopping events, not merely a repetition of a proposed English story. But the changing stop conditions (next mirror, matching-center next mirror, page-boundary reach, adjacent-palindrome center) are not yet shown to arise from a single creator-specified parser. Moreover the stage3 raw-vs-totient center choice remains discretionary. Until those choices are fixed by the book, all four outputs are **reproducible candidate plaintext, not established decryption**.

**Reproduce:** the same [CommonJS source test](../sims/lp2_p0_27square_center_selfcrib_source_sft.cjs) now asserts the complete four-block operation, both new visible stopping events, the conflicting transformed-center alternative and every numerical source coordinate. It **passed original-input CI** in [run 43811711967](https://github.com/FlareZ123/liber-primus/actions/runs/43811711967).

## Further connected candidates: I MAY, CRY, NOW THE, IDEA

Another four blocks of the same external proposed reading can be reproduced with **original, local geometric stop events**, requiring no supplied plaintext symbols. These observations are conditional on the chosen route and varying source-selection rules. [CI run 43812510569](https://github.com/FlareZ123/liber-primus/actions/runs/43812510569) reran the extended source test successfully.

| Candidate block | Source key and position | Unchanged ciphertext / derived key | Original source-visible endpoint |
| --- | --- | --- | --- |
| **I MAY** (4 runes) | From prior COLD endpoint A(11,7), down φ(H=8)=4 and right φ(U=1)=1 leads to B(15,8), center of vertical **NG–B–NG** (13,8; 15,8; 17,8), giving **NG–T–NG** | TH–G–T–E from row26 c19→c16; key NG–T–NG; output I–M–A–Y | The first visited **bottom flank of an immediately adjacent vertical mirror** is **E(26,16)**, paired with original E(24,16) around X(25,16) |
| **CRY** (3 runes) | The just-encountered **E–X–E** at col16 rows24–26 gives derived rotating key **G–E–E** | Move upward φ(X=14)=6 from center X(25,16) to J(19,16). Original J–OE–S read upward; key G–E–E; output C–R–Y | The first visited **right flank of a horizontal mirrored triplet at radius6=φ(X)** is **S(17,16)**, paired with S(17,4) around IA(17,10); preceding J(19,16) and OE(18,16) lack matching flanks at c4 |
| **NOW THE** (5 runes) | Center J(19,16) is the original center of vertical **OE–J–OE** (18–20,16), giving key **OE–OE–I** after center φ(J)=10 and phase2 | From CRY endpoint S(17,16), up6 to TH(11,16). Original TH–AE–B–A–J on the down-right diagonal; output N–O–W–TH–E | The first visited ciphertext cell reproducing the **original key-node center rune J** occurs at fifth original ray cell **J(15,20)** |
| **IDEA** (3 runes) | Original **A–TH–A** on diagonal (8,13), (11,16), (14,19) intersects the preceding NOW THE ray and gives key **U–A–A** | Begin at the preceding endpoint J(15,20), move down-left through E(16,19) to D(17,18); key U–A–A; output I–D–EA | D(17,18) is the exact midpoint of original **J–D–J** diagonal, with J at (15,20) and (19,16), at radius2 equal to original center TH=2 |

These are additional reproducible plaintext *candidates* with explicitly stated source constraints. They do **not** constitute four independent confirmations of a hidden plaintext: the ciphertext axes, the matching template chosen at each step, key-source selection, and transformation flags remain mutable and influenced by the publicly proposed English text. **Completeness gap:** the eight segments consume 36 ciphertext rune occurrences but only **34 distinct matrix cells**, because A(14,19) is reused by TURNS and NOW THE, and J(15,20) is reused by NOW THE and IDEA. That covers just **4.66%** of the original 729-rune chapter; **695 original cells** remain unexplained by this selected plaintext. A true solution must account for whether the remaining ciphertext is meaningful text, key material, an intentional map, or padding. The external 38-block author has not yet established a deterministic full-cell decode. Their value is to narrow what an intended geometrical *route interpreter* would have to explain. One consistent reader-selected rule that fixes the entire next source and endpoint without English feedback would materially distinguish design from search overfitting.

## Decision for research

This **reopens one narrowly selected p0–2 geometric route** with a concrete hypothesis: use red13→13/φ13 to select the first node, walk to the next mirror, recognize the φ-directed grid-center self-crib, then follow a series of nearby center/radius and mirror-closure operations, including the original p0 page-boundary stop. The expanded source test freezes **eight** candidates and their local geometric conditions. **The missing decisive result is a unified, unambiguous manuscript-selected parser that predicts which stopping rule, cipher reading direction and center transformation to apply, then produces independent additional unknown plaintext without using its English meaning to choose the path.**

Do **not** promote the proposed full 38-block English route or candidate WEATHER to established solved text. The public author freely chooses some source-node transforms, reading axes, block lengths and movement rules, and a prior external audit reproduced arithmetic while finding no independent selector for its full path. The branch ambiguity is **not confined to the H–NG–C center**: the same public walkthrough explicitly keeps raw E–O–D for its later EAST block (center O, index3) and raw T–M–EA for its final block38 (center M, index19). Therefore a simple special rule such as “skip φ when the node-center glyph matches the 27×27 square-center NG” fails against the complete proposed reading. A real manuscript-selected transform-state rule remains missing. Such choices can fit English post hoc; the found center source relation is a focused reason to investigate a more restrictive hypothesis instead of launching broad word-searches. It is not applicable as a fixed decoder of the p49 66-rune pretable text without a separate original source selecting its geometry.
