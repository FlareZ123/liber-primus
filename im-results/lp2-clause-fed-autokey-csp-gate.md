# Previous-clause cyclic plaintext autokey — original p40 gate (#2634)

**Decision (Agent17, 24 November 2026): reject the fixed clause-fed model under intact printed-group/native-lexicon assumptions.** All four exact F masks on the source-selected first two black-body clauses of p40 produce empty joint word domains, even granting an unrestricted initial seed. Two target-excluded known-source plants recover hidden seed and both withheld clauses exactly. No unknown original plaintext or key.

## Source selection and model

The previous-word key family was tested in #2503; a previous *clause* key differs in length and resets only at full stops. Authentic LP1 additive Vigenère with transparent plaintext F supplies the sign and clock, but no first-party source selects this clause-feedback rule. Test the single law: for non-F plaintext p, c=(p+k) mod29 and advance the cyclic key; for F emit literal 0 and do not advance. At each image-adjudicated full stop, reset phase to zero and replace the key with the preceding recovered clause's complete non-F rune sequence. The first black-body clause may use any seed (original gate grants a completely free per-consumption initial seed, a relaxation of any fixed periodic or source-derived seed).

The image-corrected transcription has 173 full stops; preserve carried printed groups and red headings separately. The nine chapter starts and their leading red spans yield black-body opening clause lengths 141, 103, 28, 226, 320, 125, 81, 21, 299; the terminal 299-rune body lacks a following complete clause. Select p40's 21-rune opening, shortest eligible, **before examining lexical outcomes**. Exact global rune cuts are [9648,9669,9715,9736,9805]. The four complete clause lengths are 21/46/21/69. First two printed group-length arrays: [5,4,3,5,4] and [2,12,3,3,2,4,7,6,3,4]. The only visible zero in each is local 16 and 15 respectively. This yields all four possible two-clause F masks and key lengths 20 or 21.

## Constructive exact finite lexical CSP

The vocabulary is the union of the repository's TextBlob English words and Gibran/Shakespeare/Emerson control texts in both conventional greedy and native-calibrated GP renderings (ING→NG, IO→IA), plus all nine exact solved rune records. 36,718 distinct GP forms in the original register. For each planted test, exclude the target section from the solved-rune additions; all target words happen to remain in that target-excluded dictionary.

For a fixed pair of F masks, non-F positions of clause 1 index the proposed key K. For a lexical candidate for a first-clause printed group, its active rune values specify a subset of the K slots. A second-clause candidate specifies K[j mod |K|] = (C-P) mod29 at each consuming position, which must be nonzero. Reject conflicting repeated slots within a word. Literal F candidates must exactly match the mask. Every word therefore has a finite relation on a fixed subset of common key slots; no initial seed constraint is imposed on the original. For planted hidden-q8 seed recovery only, first-clause words additionally constrain eight initial seed slots by their ciphertext minus plaintext.

Use exact projection joins on all overlapping pairs of word relations, deleting any candidate lacking support from the neighboring relation. An empty relation is a proof of no all-lexical joint assignment for that F mask. If arc consistency survives, a complete candidate DFS (cap 100,000 nodes/10,000 solutions, explicitly reported if reached) propagates after each choice. Check the reconstructed clauses against exact forward encryption; freeze a unique fit before decoding the subsequent two clauses.

## Original p40: all four cases die before search

| Key length | Clause 1 literal F | Clause 2 literal F | First empty relation | Decisive arc | Shared key positions |
| --- | --- | --- | --- | --- | --- |
| 21 | none | none | first clause word 1 | first word / second clause word 6 | 4 |
| 21 | none | local 15 | first clause word 1 | first word / second clause word 6 | 4 |
| 20 | local 16 | none | first clause word 1 | first word / second clause word 6 | 3 |
| 20 | local 16 | local 15 | first clause word 1 | first word / second clause word 6 | 4 |

In every case the first pass of pairwise projection propagation eliminates the first word relation (after earlier joins in that same pass). This is a rigorous necessary-condition failure, not a language-score ranking or an exhausted heuristic beam. Zero DFS nodes, zero solutions, no cap. Even freely chosen independent first-seed digits cannot rescue these two consecutive native-lexical clauses. The remaining original two clauses were not scored, as no original fit exists to freeze.

## Independent native plants and prospective holdout

Native target sections were selected as WARNING and KOAN1; use their first four complete body clauses with two independent hidden eight-rune seeds. No true key/word is given to the solver. The true F masks, both fitted plaintext clauses and seeds are inferred by the exact CSP. Both fits are unique; no cap. Use the frozen recovered clause 2 as the clause 3 key, then recovered clause 3 as clause 4 key; retain exact legal native-lexical inverse paths.

| Target | Clause lengths | Mask cases | Fit solutions | Seed exact | Withheld paths | Exact withheld runes |
| --- | --- | ---: | ---: | --- | ---: | ---: |
| WARNING | 22/25/15/12 | 8 | 1 | yes | 1 | 27/27 |
| KOAN1 | 33/24/42/28 | 4 | 1 | yes | 1 | 70/70 |

These demonstrate constructive inference and genuinely withheld continuation under the chosen synthetic generation law. They do not authenticate the hypothesis for LP2.

## Reproduction and decision

[CommonJS SFT](../sims/lp2_clause_fed_autokey_csp_sft.cjs) executes the original and both controls using the exact eight named repository input paths and emits all per-mask domains and outcomes as JSON. Actual experiment core executed in connected JS and code saved in commit 063956b096070ebf24dcb6d3e82437e5f49e2d87; no new CI. Canonical source tape and all printed-group boundaries checked against the corrected transcription, 12,956 runes / 2,896 groups / 173 stops. The exact source and vocabulary are reproducible from that repository snapshot.

Retire this fixed previous-clause receiver on the intact-group finite native register, including any first seed that would produce two in-register original opening clauses. At least one printed group must be outside the register if the model is otherwise true. This is not an unconditional exclusion of arbitrary out-of-vocabulary prose, altered group boundaries or other feedback grammars. No source-authenticated clause key, original candidate or continuation; no justification for expanding reset types or signs.
