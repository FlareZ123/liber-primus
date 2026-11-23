# LP2 complete-word equality-pair invariant: arbitrary private alphabets and arbitrary private in-word shuffles

**Classification, 23 November 2026: exact key-independent necessary condition for a broad word-local cipher architecture, on all 12,956 source-original unknown GP29 runes, calibrated against five separate native word-length-matched controls. No unknown plaintext or key is recovered.** The fully reproducible test is [this Node 22 source SFT](../sims/lp2_wordprivate_pair_collision_allkey_sft.cjs), independently run on [Windows GitHub Actions 45097885709](https://github.com/FlareZ123/liber-primus/actions/runs/45097885709) (PASS). This decision is materially different from the earlier [fixed word-shape entropy exclusion](lp2-wordshape-secret-alphabet-entropy.md): it also grants an independent, completely secret alphabet and an independent rune-position shuffle **for every individual printed word**.

## The exact keyless barrier

Let the intended plaintext word \(P_w\) and observed ciphertext word \(C_w\) each contain \(L_w\) Gematria Primus rune indices. Grant the puzzle author a completely different and unconstrained GP29 permutation \(\pi_w\) and within-word position permutation \(\sigma_w\) on **every word**:

\[
C_{w,j}=\pi_w(P_{w,\sigma_w(j)}),\quad
\pi_w\in S_{29},\quad \sigma_w\in S_{L_w}.
\]

There is no restriction on the number of keys, recurrence, master secret, chosen per-word alphabet, or position-order schedule. For a word \(v\), define its total unordered same-rune pairs

\[
E(v)=\sum_{0\le i<j<|v|}\mathbf1[v_i=v_j]
=\sum_{r=0}^{28}\binom{\#\{j:v_j=r\}}{2}.
\]

**Theorem:** \(E(C_w)=E(P_w)\) for **every** word under every choice of \(\pi_w,\sigma_w\). The position permutation only reorders the word; the alphabet permutation only relabels its rune multiplicities. Hence \(\sum_w E(C_w)=\sum_w E(P_w)\), as do each word's repeated/not-repeated flag and entire multiplicity partition. This invariant survives an arbitrary word-private **monoalphabetic** shift, Vigenere key, affine permutation, general substitution, unknown direct secret lookup, plus any word-private transposition. It does not survive new varying maps *within the same word* or mixing runes between words.

**Stronger one-sided theorem, including completely arbitrary non-injective secret lookups:** replace each \(\pi_w\) by *any* deterministic function \(f_w:\{0,\dots,28\}\to\{0,\dots,28\}\). Equal original plaintext runes still receive the same ciphertext symbol under the same word's \(f_w\), regardless of the permutation of the positions. The map can merge two distinct plaintext runes, introducing new equal pairs; it can **never split** an existing equal plaintext pair. Consequently **\(E(C_w)\ge E(P_w)\) for every word**, without assuming that any secret substitution alphabet is invertible. A full-source positive with a newly sampled secret map from all 29 inputs into only 19 possible outputs independently for each word checks this 2,896 times. Such lossy maps require additional recoverable side information to make a complete cipher, but they **do not rescue native-English/Latin-like plaintext from the 811-pair deficiency**. More general deterministic lookup with a fixed word-local secret and no in-word clock is disfavored along with the bijective case.

The original 55 rune-bearing unknown physical LP2 pages 0–55 (physical p50 is solely a numeral table) yield **2,896 complete printed words, 12,956 runes**; physical page and printed-line wraps do not end words, preserving the 32 genuine cross-page carries. These are matched rune-by-rune against the canonical original-source GP29 corpus. Their exact statistics are:

| Original ciphertext characteristic | Observed |
|---|---:|
| Complete words | 2,896 |
| GP29 runes | 12,956 |
| Total within-word equal-rune unordered pairs \(E\) | **811** |
| Words with any repeated rune | **621** |
| Words with all runes distinct | **2,275** |
| Adjacent equal-rune pairs | **63** |
| Nonadjacent equal-rune pairs | **748** |
| Two-rune words | **448** |
| Two-rune words repeating the same rune | **1** |

The 811-pair total is much stronger than adjacency avoidance alone: it also counts **all long-distance same-rune recurrences inside a word**. It has no tunable key, search space, punctuation tolerance, or model fitting.

## Independent author-authentic solved-LP2 mechanism witness

The already-solved **LP2 p56** provides a more relevant comparison than an external novel. Its **25 original printed ciphertext words have exactly the same 25 GP29 word lengths** as its published independently solved plaintext (85 runes). The actual **ciphertext has only 1 same-rune within-word pair in 1 word**, while the corresponding authentic **plaintext has 9 same-rune pairs in 8 words**; 7 paired word locations change their equality-pair count. These facts are checked directly against the original p56 ciphertext, original word segmentation and pinned known English by the same SFT. Its historically verified solution is the *prime-totient per-rune moving-key* cipher (see authentic_decryption_regression.cjs).

This is a **real demonstration from the very same LP2 release** that Cicada employed a length-preserving cipher which changes same-rune multiplicities *inside authentic printed words*. Such a cipher escapes the key-independent word-private alphabet exclusion for a principled reason: the encryption alphabet/shift advances within words. The p56 example neither proves that any unknown page uses its exact keystream nor provides a new unknown-page plaintext. It strengthens the causal priority of identifying a new **source-selected moving per-rune operation or key schedule** over further per-word static-alphabet searches. [Full source-original p56-positive Windows test](https://github.com/FlareZ123/liber-primus/actions/runs/45099384872).

## Native-GP length-matched controls

For each independent control corpus, draw 256 seeded mock manuscripts of **2,896 GP29 words with exactly the original length at every word ordinal**, drawing with replacement from genuine source words of that rune length. Each sample has exactly the original word-length/space architecture. Four corpora are historical or independently published text; the fifth comprises editor-normalized solved LP1 English excerpts. The English sources use the same longest-first 29-rune spelling conventions as the project's established solved-page control (including QU→CW, V→U, K→C, Z→S, ING→NG). The Latin Vulgate New Testament reference is pre-encoded in independent GP29 *word-preserving* form. None is the claimed plaintext.

| Independent GP29 plaintext reference | Number of native-source words | Equal-pair count across 256 length-matched manuscript samples: min / median / max |
|---|---:|---:|
| Shakespeare, pinned first 300k text | source corpus | **1,254 / 1,332 / 1,439** |
| Gibran, *The Prophet* | source corpus | **1,207 / 1,285 / 1,372** |
| Emerson, *Essays* | source corpus | **1,234 / 1,320 / 1,391** |
| Latin Vulgate New Testament, pre-encoded GP29 | 39,835 | **1,379 / 1,490 / 1,610** |
| Already-solved LP1 English excerpts, original-reference normalized | 761 | **1,246 / 1,361 / 1,466** |
| **Original unknown LP2** | **2,896** | **811 (fixed)** |

All **1,280** native controls exceed the original count, with the closest at **1,207**, a gap of **396** equal-rune pairs. The unpooled add-one low-tail estimate is \(1/257\) for each control source, not a confidence bound; these are finite sampled native-language comparisons, **not** a universal theorem that no English wording could have such low recurrence. Solved LP1 excerpts are editorially normalized rather than independently author-verified continuous LP2 prose, so they remain a separate witness, not a cryptanalytic key.

The SFT includes a full-length, exact native-language encryption/decryption positive control: encrypt **every independently sampled native word** under a freshly shuffled 29-rune alphabet and independently shuffled rune positions, then invert every one of the 12,956 encoded runes. It also checks the 2,896 individual equality-pair invariants and the aggregate repeated-word count. All original-input assertions and native controls pass on Windows Node 22. Source-file digests, seed, source lengths, exact original count, all control ranges and plant checks are printed by the test.

## Cryptanalytic decision

**Retire an English/Latin-like decipherment architecture in which every intact printed word is allowed its *own wholly secret* monoalphabetic GP29 substitution and an arbitrary shuffle of all positions *inside that word*.** This extends far beyond known finite-key or fixed-position tests: granting all \(29!\) alphabet choices separately for each of 2,896 words **still cannot change any one original word's \(E\)**.

This is a *conditional architecture exclusion*, not an unconditional proof of the plaintext language or cipher family. The creator could have used within-word advancing state, per-rune keystream, homophony or polygraphic code, inserted/removed characters, variable-length encoding, fake printed word boundaries, or cross-word permutation. The comparatively uniform original rune marginal and strong adjacent-repeat avoidance independently favor examining how real letters might be separated from their own direct equality patterns. They do **not** select such a cipher without an authored clue.

**Highest-value next observation:** find an original author-selected map that changes a repeated plaintext rune's ciphertext identity *within the same printed word*, or a source-visible resegmentation that establishes actual plaintext word boundaries. A further search through arbitrary independent word-level substitution alphabets or fixed private word-local anagrams cannot recover English-like GP plaintext from these 2,896 source words, regardless of key size.

**Inputs and rerun:** [source-corrected full transcript](../resources/liber-primus/lp2-transcription.txt), [GP29 index corpus](../resources/liber-primus/lp2-corpus.json), the five pinned controls in resources/control/ and [solved LP1 reference](../resources/liber-primus/lp1-plaintext-reference.txt). Node 22: node sims/lp2_wordprivate_pair_collision_allkey_sft.cjs. The source parser is read-only and asserts word and rune totals plus identity of all original indices before scoring.