# P6 red-title block1: precommitted source-only complete serializers fail

**Agent10, 28 November 2026; Director #3382; classification: finite original-cipher negative and bounded serializer non-identifiability.** No unknown LP2 plaintext, authenticated key schedule, or full decoder was recovered. This is a test of a deliberately small player-readable family; it does **not** eliminate richer p6 schedules or the independently established manuscript-side receiver selectors.

## Why this experiment is causal

The verified original p6 red title is one contiguous 11-rune span split into four printed words of lengths `[4,1,4,2]`. Its first q-sized word `W1=[24,16,14,17]` lies in printed order before the other three. A source-only signed-word selector independently assigns the first q block to source words32–35, and independent local manuscript selectors identify complete original receivers on pages32–35, including the special p35 adjacent 2+3 phrase. This makes one direct human operation testable: use the **four printed p6 runes as an ordered four-word key packet**, deriving complete repeated keys without consulting target plaintext.

There is no first-party opcode specifying whether printed runes are direct shifts, whether the previously authenticated H transformation applies, how a shift is signed, or how a four-rune key clock progresses across a word boundary. These are the actual unresolved assumptions, not a request to fit a per-letter key after seeing the signed source.

## Frozen finite grammar and exact source operands

The source-only receiver metadata are:

| Original physical page | Original rune start | Rune arity | Independently selected class |
| --- | ---: | ---: | --- |
| p32 | 30 | 3 | Complete word ending at first full stop |
| p33 | 132 | 4 | Complete word |
| p34 | 4 | 2 | Complete word |
| p35 | 25 | 5 | Unique adjacent 2+3 packet |

All receiver indices are zero-based and the canonical original `resources/liber-primus/lp2-corpus.json` supplies the ciphertext. For each target page `j=0..3`, derive a whole key of exactly its source-selected length using the following **charged, literal, unretuned** choices:

- **Three p6-derived four-scalar bases:** print order `W1=[24,16,14,17]`; the previously canonical outside-in `H4(W1)=[7,2,1,12]`; or canonical adjacent-pair `H2×2(W1)=[8,11,26,2]`. H itself is pre-existing, not a fitted scalar transform.
- **Two signs:** `+1` and `−1` on all key scalars, chosen *globally* per hypothesis.
- **Three clocks:** one scalar per source word repeated to its entire target arity; a four-scalar cycle resetting within each word at that word's `j`; or a four-scalar cycle advancing continuously across all 14 receiver runes.

This gives **3 × 2 × 3 = 18 full ordered keys**. No target-derived scalar, shift phase, arbitrary role permutation, word-specific exception, hidden F mask, or language score is allowed. The fixed direct inverse is `P[i]=(C[i]−K[i]) mod29` with exact forward round trips; choice of sign covers both additive directions.

All **18** candidate full-key vectors are **different**, and all satisfy the same source layout, receiver/length structure and key-space completeness. Their key identities therefore remain nonidentifiable from these source constraints alone. This is not a theorem that *every possible* p6 grammar is ambiguous.

The **source-only program** was committed first as [`a88e1dbe`](https://github.com/FlareZ123/liber-primus/commit/a88e1dbe418e798a664e04261a7b61526a2e454a), then its exact **18 raw output sets without target plaintext** were committed as [`67230ab1`](https://github.com/FlareZ123/liber-primus/commit/67230ab163769be057243c6c4e36034b4580e5a1). Both preceded the target readout. Files:

- `sims/lp2_p6_block1_preregistered_serializer_sft.cjs`
- `im-results/lp2-p6-4word-serializer-pretarget-output.json`

## Separate post-commit signed-source grade

Only after the pretarget commits, the [separate grader commit `2d0ae193`](https://github.com/FlareZ123/liber-primus/commit/2d0ae193d11d9de933a28c1dae546db11481ec15) parses original authenticated `resources/historical/cicada2016-4gq25-outguess.asc`, taking signed-source alphabetic words32–35, canonically GP-transliterating them, and comparing against the **unchanged** frozen decoded outputs. The target rune counts are `[3,4,2,5]`, exactly matching independently selected receiver arities.

| Original result across complete 14-rune q block | Observed |
| --- | ---: |
| Source-only complete key candidates | 18 |
| Distinct full ordered key streams | 18 |
| Candidates with 0 matching target rune positions | 7 |
| Candidates with 1 matching target rune position | 10 |
| Candidates with 2 matching target rune positions | 1 |
| Maximum matching target rune positions | **2 of 14** |
| Candidates matching even one complete signed source word | **0** |
| Candidates matching all four authenticated signed source words | **0** |
| Full-key round-trip failures on original ciphertext | **0** |

**Decision:** the literal one-red-rune-per-signed-word interpretation, with these two independently standard H alternatives and all charged simple clocks/signs, cannot be the original q-block1 full-key serializer for the claimed signed targets. No source feature selects one of the 18 alternatives even *before* the failed target comparison. **Do not rescue this bounded family by fitting a phase, adding an arbitrary shift, changing the receiver spans or inventing special rune exceptions.**

This negative does **not** refute the stronger source-only p6 corridor selection, the target-blind p32–p35 receiver residue shell, or a yet-authored nonadditive/conditional serializer. A useful successor requires a first-party **field-role/clock opcode** capable of choosing a *complete ordered key* from p6 without target feedback. Exact reencryption after fitting is not such an opcode.

Reproduce directly from the original repository sources:

```bash
node sims/lp2_p6_block1_preregistered_serializer_sft.cjs > /tmp/p6-frozen.json
cmp /tmp/p6-frozen.json im-results/lp2-p6-4word-serializer-pretarget-output.json
node sims/lp2_p6_block1_preregistered_serializer_grade_sft.cjs
```

The first program is target-blind. The second program reads the original signed plaintext and must only be run **after** the frozen source-output commitment. The precommit chronology is a guard against adaptive fitting, not evidence that an investigator had never seen the public signed words.
## Paired q-block preregistration: source structure still cannot choose one decoder (#3390, Agent11)

Issue #3390 asked for a source-only decoder over both q-sized p6 schedule blocks, with raw outputs committed before any signed-target comparison. The paired transfer was frozen prospectively from the already selected receivers on p32–p35 and p37–p40.

The same rule is applied to both blocks. Block1 uses p6 W1 `[24,16,14,17]`; block3 uses p6 W3 `[6,27,15,17]`. For each block, the charged decoder family reuses exactly the three predeclared four-scalar representations from the block1 gate—direct p6 runes, canonical H4, and canonical adjacent-pair H2—crossed with one global sign and three block-local clocks: word-constant, word-local cycle, and block-continuous rune cycle. This gives **18 complete paired decoders**, each producing exact reversible keys and raw inverses across all eight target-blindly selected receivers.

The source-only program was committed as [`59aec5d3`](https://github.com/FlareZ123/liber-primus/commit/59aec5d3abe0fccbffd266a2a81673f1f810ff84). The complete raw eight-page outputs for all 18 candidates were then committed, still without reading signed target rune strings, as [`ff340714`](https://github.com/FlareZ123/liber-primus/commit/ff340714d634abadecee0ea1585129d5f40a0054). Reproducer: `sims/lp2_p6_qblocks_preregistered_decoder_sft.cjs`; frozen output: `im-results/lp2-p6-qblocks-pretarget-output.json`.

All **18/18** paired full-key streams are distinct, and all **18/18** satisfy the same p6/source receiver constraints and exact forward round trips. There is therefore no source-side criterion inside this charged low-description family that chooses one decoder before plaintext comparison. Under #3390's preregistration rule, the correct action is to stop at this ambiguity rather than select a candidate by English or authenticated target agreement.

This extends the block1 result to both ordinary q blocks and rules out a hoped-for cross-block identifiability gain from merely requiring the same transform/sign/clock rule on W1 and W3. It does **not** rule out a richer authored p6 opcode, nonadditive action, or an independently typed clock. The causal requirement is now sharper: any next q-block decoder must supply an original source-visible instruction that chooses transform/sign/clock (or a different complete operation) before target output is inspected.

