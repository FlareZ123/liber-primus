# Wordwise mixed-radix nonce: exact original-source one-letter capacity obstruction

**Research status, 10 November 2026:** A fully reversible, one-ciphertext-rune-overhead word cipher is sharply constrained by the **original LP2 two-rune words**, independently of every possible fixed secret first-symbol alphabet and all 29 predecessor-dependent successor permutations. Under this declared model, at most **118/447** distinct-adjacent two-rune ciphertext words can encode *any predeclared pair* of native GP one-rune plaintext symbols, including A and I. This is a **conditional exclusion of a cipher architecture**, with no authentic LP2 plaintext, secret key, or continuation recovered.

This tests a different hypothesis from the fixed same-length word substitutions in [the established word-equality invariant](wordwise-equality-invariant.md) and the global 78/79 packet experiments in [the radix-79 packet gate](prime79-radix29-packet-gate.md).

## A lossless original-cipher inverse, with its exact assumptions

Assume each printed ciphertext word with length \(L\ge2\), and with **no adjacent equal ciphertext runes**, encodes \(L-1\) ordinary Gematria Primus (GP) plaintext runes and a recoverable nonnegative integer nonce. The first ciphertext glyph \(c_0\) is interpreted as a digit \(d_0\in\{0,\ldots,28\}\) by one *unknown but book-fixed 29-permutation*. For \(i\ge1\), a completely arbitrary, secret, *book-fixed 28-permutation* belonging to the previous **ciphertext glyph** \(c_{i-1}\) maps \(c_i\ne c_{i-1}\) to a digit \(r_i\in\{0,\ldots,27\}\). Every predecessor glyph can have a different successor permutation.

Define the mixed-radix word integer

\[
V=d_0\,28^{L-1}+\sum_{i=1}^{L-1}r_i\,28^{L-1-i}.
\]

Split \(V=Q\,29^{L-1}+P\), with \(0\le P<29^{L-1}\), and expand \(P\) into exactly \(L-1\) base-29 GP plaintext digits. This is unambiguous; the quotient \(Q\) is transmitted implicitly in the ciphertext and suffices for exact re-encoding. The same secret permutations and fixed word boundaries are used in both directions.

The implementation [wordwise_radix_nonce_inverse.cjs](../sims/wordwise_radix_nonce_inverse.cjs) reconstructs \(V\), plaintext \(P\), and nonce \(Q\), and verifies *exact forward reconstruction of every eligible original LP2 word*. This roundtrip demonstrates losslessness within the posited architecture. It does **not** make the resulting arbitrary plaintext an authentic historical decryption. Original doublets, and potentially empty decoded words, require additional mechanisms outside this model.

## Key-independent theorem for every two-rune word

A clean original ciphertext word of length two has mixed digits \(d=d_0\) and \(r=r_1\), and exactly one recovered plaintext rune

\[
p=(28d+r)\bmod29=(r-d)\bmod29.
\]

For each *fixed* first cipher glyph, its first digit \(d\) is constant across the manuscript. For any predeclared set \(S\) of \(k\) candidate plaintext runes, a successor glyph can decode to at most one of those \(k\) runes, because each of its 28 successor ranks appears only once in that predecessor's secret table. Exactly \(k\) values of the first digit \(d\) make one particular target rune in \(S\) unattainable: they would require the forbidden rank \(r=28\). Those \(k\) first-digit values must be assigned to **distinct** observed first-glyph groups by the secret 29-permutation.

Let \(n_{a,b}\) count observed, clean two-rune ciphertext words \(a\,b\) where \(a\ne b\). Let \(v_{a,j}\) be the \(j\)-th highest count in row \(a\) among the 28 allowed successor glyphs. Then the **sharp maximum over all secret first-alphabet and 29 independent successor permutations** is

\[
B_k = \sum_{a=0}^{28}\sum_{j=1}^{k}v_{a,j}
      -\sum_{j=1}^{k}m_{k,j},
\]

where \(m_{k,1},\ldots,m_{k,k}\) are the \(k\) smallest values among \(v_{a,k}\) across the 29 different first-glyph rows. The first term assigns each predecessor's \(k\) most common successors to the \(k\) possible plaintext symbols. The subtraction optimally places the \(k\) first-digit states that each forbid one of those symbols. Independent arbitrary successor permutations attain these capacities, so this is a sharp exhaustive all-keys bound. It needs no assumed key, training data, or language likelihood.

For the **actual original 447 clean two-rune ciphertext words**, direct source counting yields:

| Allowed predeclared one-rune plaintext values | Sum of rowwise top counts | Required first-alphabet penalty | Exact maximum |
| ---: | ---: | ---: | ---: |
| 1 | 67 | 1 | **66 / 447** |
| 2 | 120 | 2 | **118 / 447** |
| 3 | 165 | 3 | **162 / 447** |
| 4 | 203 | 4 | **199 / 447** |

For a native GP-English register in which an encoded one-letter *word* is **A** (GP index 24) or **I** (GP index 10), at least **329 of the 447** clean two-cipher-rune words must violate this wordwise model, regardless of how the secret tables are chosen. A hidden alternative language or a different word segmentation would have to be independently justified.

## Original re-encryption, excluded words, and positive plant

The canonical [rune corpus](../resources/liber-primus/lp2-corpus.json) and [boundary-preserving parser](../sims/lp2_word_pages.cjs) give **12,956 runes** and **2,896 ciphertext words**. Their exact structural breakdown is:

- **448** two-rune words, of which **447** have distinct neighbors and one consists of a repeated glyph.
- **83** one-rune ciphertext words; the model's strict one-cipher-rune word overhead would decode these to *empty plaintext words*.
- **2,751** words of length at least two without adjacent identical runes; the implementation **re-enciphers exactly all 12,502 original ciphertext runes** in this subset while retaining each hypothesized nonce, yielding 9,751 arbitrary candidate plaintext runes.
- **62** words of length at least two with at least one adjacent repeated glyph; they cannot pass through the posited 28-choice predecessor alphabet and need a genuinely reversible exception channel. The original aggregate 86 immediate repeats across pages remain unexplained.

A deterministic hidden-alphabet positive plant uses 29 independently shuffled predecessor rows, an independently shuffled first-glyph alphabet, random representable nonces, and **447 genuine one-rune GP A/I plaintext words**. The same decoder recovers and re-enciphers **447/447** exactly. Its *key-independent* two-symbol capacity is **447**, showing the test would not reject a true source-native instance solely because its secret tables were unknown.

**Executed original and synthetic assertions:** [passed manual CI run 42829942279](https://github.com/FlareZ123/liber-primus/actions/runs/42829942279). The new test is part of the existing manual-only [word invariant workflow](../.github/workflows/word-partition-manual.yml), with no additional automatic or per-commit job.

## What remains possible

The theorem requires one fixed first-rune alphabet, 29 book-fixed predecessor-dependent successor permutations, one exact ciphertext-rune overhead **per printed word**, a direct ordinary GP plaintext digit register, and a constant \(V\bmod29^{L-1}\) extraction rule. It does not constrain dynamically changing secret rows, variable per-word overhead, an encrypted intermediate alphabet, inserted plaintext/ciphertext runes, changing or unrelated plaintext word boundaries, binary codes with their own framing, or a recoverable exception scheme outside the clean-word subset.

The direct original inverse returns arbitrary GP digits because the nonce/secret table architecture is unconstrained; all 12,502 clean ciphertext runes reconstruct tautologically. The new evidence is instead the sharp **original-input all-keys capacity exclusion**, indicating that a simple wordwise nonce transport cannot explain native-language LP2 even after completely freeing the 29 secret outgoing permutation tables. It should not be promoted as a cryptographic key or unknown text recovery.