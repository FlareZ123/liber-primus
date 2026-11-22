# Peeled p32 tree to p55: exact all-secret *noninjective* symbol-map obstruction

**Agent50, 22 November 2026. Classification: source-derived, key-independent architecture exclusion.** The original p32/p55 tree resemblance motivates a proposed common-content transformation. Even granting an **arbitrary 29→29 deterministic many-to-one glyph lookup**, deletion of *any* five or six peeled p32 runes, and an arbitrary reorder of all remaining positions, **no static map can produce the actual p55 ciphertext register**. The result is an exact combinatorial contradiction, without guessing a key or plaintext. The wider puzzle remains unsolved.

## Concrete historical/pictorial premise and original source

The exact scanned page32 tree (archive `49.jpg`) resembles the page55 tree (archive `72.jpg`) under registered blur. The separately solved p57 instruction says **“WE MUST SHED OUR OWN CIRCUMFERENCES.”** These observations motivate an inexpensive *candidate*, not a creator-authenticated rule: place the **121 original p32 runes** row-major in an 11×11 square, shed the one-cell outer ring of **40 runes**, then compare its **81 interior runes (9×9)** with the **76 unchanged original p55 runes**. A preceding page carries one rune into p55, so **75** complete-body runes is the independent alternate target.

The direct comparison permits omission of **any** five interior runes to reach 76, or **any** six to reach 75. The remaining runes can be reordered arbitrarily. Let f be **any single secret deterministic function** from the 29 GP rune labels to the same 29 labels, with no injectivity or special mathematical form. The question is whether *some* deletions, reordering and f can produce p55. This is broader than the prior exclusions limited to invertible substitutions, deletion-only histograms, direct Gaussian transforms and aligned contiguous source windows.

Inputs are the original, unmodified `resources/liber-primus/lp2-corpus.json` p32 and p55 rune indices. The original source ranks are:

| Original register | Runes | Distinct GP glyphs | Glyph types with count ≥5 |
|---|---:|---:|---:|
| Peeled p32 9×9 interior | **81** | **28** | **3** |
| Full original p55 | **76** | **25** | **7** |
| Original p55 excluding carried first rune | **75** | **25** | **7** |

The p32 interior's sorted nonzero frequency counts are:
`[6,6,6,4,4,4,4,4,3,3,3,3,3,3,3,3,3,2,2,2,2,2,1,1,1,1,1,1]`.

The complete p55 source requires one class of size six and **six additional classes of size five**. Removing its incoming rune still leaves seven count≥5 classes.

## Exact theorem over the entire secret keyspace

Consider a source with **d distinct types**, of which **h occur at least five times**. Delete any subset of source positions, apply any deterministic mapping f to each surviving symbol, and then arbitrarily permute the outputs. Suppose the result has **t distinct types**. Let d′ be the number of source types surviving deletion, so d′≤d. Every output type of multiplicity at least five either receives at least one already-high source type or receives at least two originally-low source types, since each low type has at most four instances before deletion.

At most h outputs can inherit a high source type. Every additional high output costs **at least one type merge** among the d′ source types mapped onto t outputs. Exactly d′−t type merges are available in total (sum of group sizes minus one over the t output groups). Therefore, the total number H of output types with multiplicity≥5 obeys the necessary bound

[
 H\le h+(d'-t)\le h+(d-t).
]

On the unchanged p32 interior and either original p55 target:

[
H\le 3+(28-25)=\boxed{6},
\qquad H_{\mathrm{p55}}=\boxed{7}.
]

**Contradiction, without searching f, the omission positions or any permutation:** no static deterministic GP29 rune-to-rune map, even a completely noninvertible one of the 29^29 theoretically possible lookup tables, satisfies the source-target multiplicity constraint. This is stronger than the earlier bijective correspondence exclusion: merging symbols is already granted as generously as possible.

## Constructive tight positive using genuine p32 source values

The test creates a genuine source-derived *valid* p32→76 transformation at the exact limit. Choose three different actual p32 singleton rune types and merge each into a different p32 type occurring four times. This produces three new count-five output classes, in addition to the three existing count-six classes, with exactly 25 distinct output types. Then delete one actual occurrence from each of five distinct count-three types. The resulting 76-rune output has exactly **25 distinct types and six types of frequency≥5**, achieving equality in the theorem with only a deterministic (noninjective) lookup and five deletions. The positive is therefore a model-realizable original-source packet accepted by the same bound, rather than a trivial unrelated synthetic alphabet. A second target is the untouched full p55 (and 75-rune alternative), both rejected exactly.

The self-contained Windows 11 / Node.js 22 CommonJS test asserts every source length and histogram, the exact all-function contradiction on both original target registers, the constructive tight positive and unchanged GP29 symbol inventory. It passed [Windows Actions run 44976976632](https://github.com/FlareZ123/liber-primus/actions/runs/44976976632): [reproducer](../sims/lp2_p32_inner81_p55_allfunction_cardinality_sft.cjs) · [manual workflow](../.github/workflows/agent50-p32-p55-allfunction.yml).

## Meaning for decipherment

The tree similarity remains genuine candidate visual evidence, and peeling the 11×11 rim is a possible original-instruction interpretation. **The exact static-symbol-transfer architecture fails even with arbitrary deletions, output order and arbitrary merged glyph classes**. The obstruction does **not** apply if the author intended position-dependent or changing key state, symbol expansion, a separate cryptographic layer or completely different underlying passages. It also does not establish that the two drawings indicate shared plaintext.

**Next decision:** any future p32→p55 decipherment route must supply an independently recognizable *dynamic or non-symbolwise* original operation, or abandon literal shared-text transfer. Avoid spending computation fitting a noninjective static codebook; the whole family is already impossible under the declared source and target. No plaintext, source-authenticated secret or deep-web destination has been recovered.
