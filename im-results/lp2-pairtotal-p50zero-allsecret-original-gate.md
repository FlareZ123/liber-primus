# Pair-total invariant excludes stationary word-pair GP29 alphabets despite movable spaces

**23 November 2026, Agent23; [Director #2278](https://github.com/FlareZ123/liber-primus/issues/2278). Classification: new key-independent original-input obstruction for a precisely defined, resegmentation-invariant cipher family.** The complete source has 12,956 unknown GP runes, 2,896 whole printed words and 1,448 successive word pairs. For any global pair-total/position keyed bijective GP29 alphabets, no hidden key produces any of the 44 independent native-GP English source windows. This remains true after adding the physically printed p50 leading-zero bit as an independent per-pair secret-alphabet state. **It recovers no plaintext or author-selected key**, and it neither excludes changing-state cryptography nor genuine variable-length codes.

## Source-led operation and independent rival

The PGP-signed 2016 Cicada instruction states that the book's words and numbers supply a map and direction. The original pp49–51 table contains 256 values in 32 rows ×8 columns, of which precisely 60 printed values *begin with literal digit 0*. On the source-natural table clock, that one-bit class has previously been associated with the LP2 doublet-repeat rate, although the correct table clock cannot be recovered blind from repeats (see [original repeat-selector controls](lp2-p50-zero-phase-blindholdout-wordboundaries.md)).

A human could keep consecutive **pairs of complete printed rune words**, use each combined pair's length and within-pair position as a key state, and optionally use the table's printed first-digit-zero flag once per pair. This is a simple *potential receiver*, not a first-party instruction to pair words or look up p50; original word breaks may instead have no plaintext meaning, and the missing genuine encryption key may be external.

The important improvement over earlier [one-word length/position all-secret gates](lp2-wordlength-resegment-allsecret-original-gate.md) is that **the sum of two consecutive word lengths and each rune's offset within that combined pair survive arbitrary shifts of the one internal word boundary**, as long as the pair has the same total runes, stays in place and continues to contain two positive-length words. This experiment does not assume the decoded *individual* word lengths or their original positions.

## All-hidden-key proof with no fitted alphabet or readout

Let pair i contain source word lengths a_i,b_i with invariant total S_i=a_i+b_i. At absolute position j=0,...,S_i-1 within that combined pair, the actual original ciphertext rune is C_(i,j). Grant each occupied state an **entirely arbitrary independent secret permutation of all 29 GP29 symbols**:

- Base state: (S_i,j).
- Source numeric-bit state: (S_i,j,z_(i mod256)), where z is exactly 1 if the *first printed character* of p50 table cell i is 0 and 0 otherwise.
- Alternative finite state: (S_i,j,b_(i mod256) mod2), where b is its canonical table byte.

These states depend on unchanged ciphertext-known pair totals, original ordinal pairs, and source table content, so they are computable by both encryption and decryption even when the decoded *intra-pair* word boundary moves arbitrarily. No actual secret substitution need be identified to test every one: for state s, let N_(s,c) be the occurrence count of ciphertext rune c. An unknown bijection can map at most the k most frequent source classes in that state into any selected set of k plaintext runes. Therefore the sharp *all-keys* bound on the total frequency of the k commonest plaintext GP runes is

\[
U_k = \sum_s \sum_{q=1}^{k} \operatorname{sortdesc}_{q}(N_{s,*}).
\]

Because the secret substitutions can independently map each state's k highest source-frequency classes to the same k target plaintext symbols, this is a sharp attainable limit for that exact mathematical family. It remains a necessary condition across **all** allowed internal boundary shifts, all 29! secret alphabet choices per state and any plaintext distribution with the required top-k concentration.

| Fixed globally shared hidden alphabet state | Occupied secret alphabets | Original ceiling U1 /12,956 | Original ceiling U4 /12,956 |
|---|---:|---:|---:|
| Pair total + rune offset | 274 | **1,112** | **3,570** |
| Pair total + rune offset + printed p50 leading-zero flag | 461 | **1,364** | **4,234** |
| Pair total + rune offset + p50 byte parity | 461 | **1,400** | **4,350** |

All numbers are exact counts on the unchanged **12,956/12,956** original rune identities and **2,896** source-derived complete printed word lengths, including the **32 genuine physical-page word carries**. The tests retain physical p50 as a rune-free page and do not interpret numeric list-heading hyphens as actual word endings.

## Native-plaintext reference and true inverse controls

The independent whole-rune controls are complete disjoint 12,956-rune windows of three unaltered pinned literary corpora, each projected to historical solved GP29 spelling (including ING→NG, IO→IA, QU→CW, V→U, K/Q→C, Z→S). Their whole-stream top-k rune counts do not depend on the placement of plaintext spaces.

| Native GP29 donor | Nonoverlapping complete windows | Minimum top-one count | Minimum top-four count |
|---|---:|---:|---:|
| Gibran, *The Prophet* | 4 | **1,474** | **4,372** |
| Shakespeare | 16 | **1,465** | **4,331** |
| Emerson, *Essays* | 24 | **1,510** | **4,461** |
| Latin Vulgate, full word-preserving GP29 source | 15 | **1,485** | **5,324** |
| Old English *Beowulf*, original GP profile | 3 | **1,480** | **4,442** |
| Middle Welsh *Pwyll*, original-language Mabinogion | 2 | **1,601** | **5,122** |
| Old Norse *Hávamál* | 1 | **1,481** | **4,919** |
| Original ciphertext, even with fully private leading-zero alphabets | source | at most **1,364** | at most **4,234** |

Consequently, all **65/65** independent original-size source-language windows exceed *both* exact top-one and top-four ciphertext upper bounds for the printed p50 first-zero model, regardless of any secret state-alphabet choices. The byte-parity variant is excluded by the one-rune ceiling (at most1,400 versus native minimum1,465), even though its top-four ceiling4,350 does not rule out every Shakespeare window. The base model is still more strongly excluded.

The additional twenty-one windows represent **four language-family alternatives motivated by the manuscript's Latin title, its original rune-book context, and Cicada's prior Welsh book clue**, preserving the pinned 39,835 Latin Vulgate GP29 whole-word tape, Beowulf's independently archived corrected Old English GP29 stream and applying the documented rune spelling normalization to the separately pinned Old Welsh and Old Norse text files. Native-control minima for each corpus independently exceed both p50-leading-zero ceilings. The earlier English-vs-Latin *word-length grammar* tests do not prove the ciphertext is English; this broader exact rune-frequency condition now survives several historically plausible non-English plaintext registers, without asserting the original author's language.

For a nontrivial **typed positive**, the SFT builds a full 12,956-rune independently sourced genuine-Gibran plaintext, encrypts it with separately secret affine GP29 alphabets for **every source-defined (S,j,z) state**, and completely recovers **12,956/12,956** native runes. The planted encrypted text's own exact U4 bound is 5,859, safely above the actual plaintext top-four count 4,495, showing that the invariant accepts a real signal encrypted under its own stipulated class. The actual solved **p57 PARABLE** body (95 original GP29 runes) also undergoes an exact planted encrypt/decrypt round trip. An explicit original-p50 byte-driven resegmentation changes all selected word boundaries while leaving the state labels exactly identical to their source positions, demonstrating the segmentation-independent premise on the intact ciphertext.

**Limit:** The language contrast is conditional on the tested original-GP English and historically plausible Latin, Old English, Middle Welsh and Old Norse controls. A highly unusual text, random-looking intermediate layer, source with weaker rune concentration or separate compression can fit the mathematical upper bounds. A different hidden alphabet per **actual chapter/page/word pair**, an alphabet keyed by a newly recovered plaintext boundary, a nonlocal evolving state, full 256-state p50 byte values, a length-changing code that moves pair totals, or a separately sourced one-time pad are outside the stated exclusion. These are mechanism classes, not evidence that any particular one is Cicada's.

## Decision

Retire **all** globally shared fixed pair-total/within-pair GP29 substitutions, whether secrets are arbitrary and nonlinear or the state includes the only source-visible p50 zero-digit bit; *no* additional key guessing or internal word-boundary reflow rescues them. The original 256-byte-per-pair state has too many distinct states (8,932 pair-total-position-byte combinations) to yield the same useful capacity exclusion and has no independent historical key. Pursue a genuinely **changing-state/source-specific operator**, a typed key source or a different lossless encoding mechanism only when the original manuscript selects the next step. This is a structural key-free decision, not a decrypted passage.

[Original-source 226-line CommonJS SFT](../sims/lp2_pairtotal_p50_zero_allsecret_original_sft.cjs) · [Windows 11 / Node22 PASS, run45095353763](https://github.com/FlareZ123/liber-primus/actions/runs/45095353763) · [manual-only CI](../.github/workflows/agent23-pairtotal-p50zero-allsecret-manual.yml).
