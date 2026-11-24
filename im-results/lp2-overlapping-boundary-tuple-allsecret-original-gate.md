# Overlapping rune/boundary tuples: exact segmentation recovery under arbitrary secret periodic alphabets

**Agent2, 24 November 2026; Director [#2278](https://github.com/FlareZ123/liber-primus/issues/2278).** Classification: exact original-input conditional architecture exclusion and constructive positive. No unknown plaintext or historical cipher selected.

## Causal question

The printed word boundaries may themselves be encrypted. A natural, lossless local architecture jointly substitutes a GP29 rune and its immediately preceding and following word-boundary bits. A human could implement a table of 29×2×2=116 entries in 2014; the two surrounding bits are genuine source-visible structure, not fitted English spaces. The original 2016 words/map and numbers/direction instruction motivates taking boundaries seriously, but it does **not** specify this 116-symbol alphabet or a periodic clock. The rival is a genuinely stateful or cross-rune mixing scheme. This is an all-key result on a precisely specified candidate, not an author-selected decoder.

For each rune i define X_i=(c_i,L_i,R_i), with L_i/R_i equal to 1 for a printed word boundary, 0 otherwise. Adjacent flags agree. Treat major source punctuation as separately fixed anchors and preserve physical line/page positions; line/page wraps without separators do not imply word breaks. Grant arbitrary independent secret 116-symbol bijections per phase i mod q, or independent stationary bijections in each of the nine chapters. Also grant one of 29 completely secret 116-symbol permutations selected by the immediately preceding ciphertext rune (forward inverse), or immediately following ciphertext rune (backward inverse), allowing all 29 endpoint states. The repeat-deficit observation motivates the adjacent-rune clock without authenticating it. The decoded rune count and order are unchanged, but spaces may in principle move. This includes nonlinear maps coupling both bits and rune values.

## Exact graph and capacity solver

Make left and right port variables for every observed (phase, X) type. Each observed consecutive pair imposes equality of the previous type's output right bit and the following type's output left bit. Do not join through major punctuation: anchor both ports there to 1 instead. Equality components force a common output bit; a component is independent of unknown rune labels.

Every phase bijection has exactly 58 output tuples with each prescribed L bit, likewise R, and exactly 29 tuples of each (L,R) combination. For each phase and each side count distinct observed types in each port component. If assigning a component bit would exceed capacity 58, force the other bit. Then enumerate remaining component values and reject any assignment that requires more than 29 distinct types in a particular output (L,R) pair.

This is an exact necessary and sufficient test for a boundary assignment **within the stated family**: once counts fit, assign distinct rune labels to each observed type within its phase and output flag pair, then complete the unused entries to a bijection. The implementation constructs such a permutation and its exact inverse for every feasible assignment, and checks all decoded adjacency and fixed punctuation anchors.

The static whole-book graph has one connected zero-gap component (116 observed ports) and two anchored one-gap components when major edges are omitted (113+1 ports). 115 distinct tuple types appear. Setting the zero-gap component to 1 would force every observed tuple to have (L,R)=(1,1), which accommodates only 29 types. Thus all original boundary flags are forced. This argument also works independently on both predeclared disjoint regions and all nine original chapters.

## Original results

Inputs: [canonical corpus](../resources/liber-primus/lp2-corpus.json) and [transcription](../resources/liber-primus/lp2-transcription.txt). Per-page rune indices cross-check exactly; p50 inserted as rune-free. All 12,956 runes, 2,896 complete words, 83 singleton words, 448 two-rune words, and 32 page carries are retained. Punctuation classes use the stated canonical derivative grammar (some editorial marks elsewhere are disputed); no claim to have re-adjudicated ink. The disjoint p16–21 and p40–53 regions contain 1,613 and 3,008 runes.

| Scope / independent secret alphabets | Feasible boundary tapes | Changed boundaries | Maximum rune IoC |
|---|---:|---:|---:|
| Entire book, stationary | 1 | 0 | 0.0346220423 |
| Nine separately keyed chapters, stationary | 1 per chapter | 0 | 0.0361358916 aggregate |
| Book, period 2 | 1 | 0 | 0.0348404343 |
| Book, period 4 | 1 | 0 | 0.0352771468 |
| Book, every integer period 1–13 | 1 each | 0 | at most 0.0371952381 |
| Book, period 31 | 2 | 0 or 1 | 0.0409934572 |
| p16–21, period 1–4, independently keyed | 1 each | 0 | at most 0.0410398453 |
| p40–53, period 1–4, independently keyed | 1 each | 0 | at most 0.0378085000 |

At period 31, marginal propagation leaves exactly six components affecting six internal gaps. Exhaust all 64 assignments; exact (L,R) capacity permits just two. The nonidentity tape inserts a divider (0→1) at global rune offset 7961, on physical p33; no existing divider is removed. There is no independent source clue selecting that insertion. The arbitrary private phase alphabets may have different keys in every phase; no Caesar/affine restriction, language scoring, or key fitting enters this result. Period 13 and 31 are included as source-visible ornament counts, not established clock choices.

For each feasible tape, sort the observed tuple frequencies in each (phase, decoded L,R) class. Align their descending ranks across classes; this attains the sharp upper bound on the number of equal plaintext rune pairs by the rearrangement inequality. Its normalized value gives maximum IoC over **all** compatible secret permutations. The code constructs the maximizing bijection as an implementation witness, not as a language-derived key. Genuine p57 has rune IoC 0.0627099664; prior independent native prose controls are around .059–.063 (see [authoritative synthesis](../results/README.md)). Low maximum IoC excludes ordinary comparable native prose conditionally, not every conceivable language or compressed payload.

## Stateful extension: adjacent ciphertext rune selects the secret alphabet

A causal feedback variant chooses the permutation at position i by the **preceding original ciphertext rune**. A backward variant chooses the following original ciphertext rune. Unlike a merely supplied phase tape, exact forward re-encoding recomputes the state from the previously reconstructed ciphertext tuple in the appropriate traversal direction. Exhaust all 29 endpoint IVs for each orientation. This is a genuine reversible state-dependent extension.

| State clock, all IVs | Distinct feasible segmentation tapes | Maximum number of moved/inserted/removed gaps | Sharp max IoC |
|---|---:|---:|---:|
| Previous cipher rune | 4 | 459 | 0.0428726674 |
| Following cipher rune | 12 | 4 | 0.0412579870 |

The preceding-rune clock permits a coherent global transformation of 458 gaps (361 insertions and 97 removals), optionally removing one further divider at global offset12649 on p54. The unchanged tape and the single-divider-removal tape are the other two alternatives. At IV3 only the latter two survive; the other 28 IVs permit all four. The backward clock allows at most four changed gaps, at offsets 2579, 10342, 10343 and 11598. All feasible tapes and maximizing secret alphabets are constructed and reverse exactly with state recomputed. These are mathematical solutions to the boundary constraint system, not unknown plaintext; the maximum GP concentrations remain far below ordinary native-prose controls. No source instruction selects any alternative tape.

## Positive control and reproducibility

Genuine clear p57 PARABLE (95 runes, 20 words) admits a stationary planted 116-symbol permutation changing actual boundary positions 53 and 86, removing those two breaks while keeping major anchors. The generated ciphertext remains internally consistent, and the exact inverse recovers every original rune and boundary. This confirms that the boundary rigidity is a property of the unknown original source under the candidate family, not an artifact of the construction. The test is an architecture positive; it does not discover an unknown key.

[SFT](../sims/lp2_overlapping_boundary_tuple_allsecret_sft.cjs) is CommonJS and uses only Node built-ins. Run from a checkout: `node sims/lp2_overlapping_boundary_tuple_allsecret_sft.cjs`. The initial committed source (9839a298c9042506a5118e8753cadcee2269c6b5) was fetched back and executed in a JavaScript runtime with the repository corpus/transcription and equivalent strict assertion shim; all input, graph, capacity, bijection, boundary and positive-control assertions passed. The expanded adjacent-state version (bfe887ce6a645653106c73b1a4ab514e9a386c95) was executed on the same original input before committing, including recomputed-state full forward re-encoding for every feasible tape at every IV. No CI dispatch needed.

## Decision for #2278

Retire stationary two-sided local tuple substitutions and their original full-book periodic variants q=1–13 and q=31 as a substantive space-changing solution, under the declared one-to-one rune order and punctuation anchors. The adjacent-ciphertext feedback extensions now permit actual space changes but still fail the ordinary-native-prose concentration gate even with arbitrary private alphabets and every IV. This materially strengthens the separate old arbitrary-space/affine and length-state exclusions: even a nonlinear 116-symbol permutation cannot independently choose a plausible new segmentation when the same local types recur in overlapping contexts.

The unresolved author-selected operation is a **nonlocal or richer-state boundary transducer**: an authentic source switch, clock or state law that allows identical local tuples to yield different boundary bits without violating overlapping consistency. A block codec, transposition, variable token counts, a genuinely unknown clock, or a separate boundary side-channel falls outside the theorem. Do not interpret the period-31 optional insertion as a key or plaintext clue. The broader Director task remains open because no independently authenticated segmentation-changing opcode was recovered.
