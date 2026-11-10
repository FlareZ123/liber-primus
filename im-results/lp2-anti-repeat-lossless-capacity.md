# Lossless coding capacity of LP2's original adjacent-repeat deficit

**Scope and status (10 November 2026).** This is an exact, source-original information-accounting theorem for proposed **universal fixed-length runic encoders** that force ciphertext into a rare-repeat subset. It is **not a proposed historical Cicada cipher, not plaintext recovery, and not a claim that the author constrained every possible ciphertext to the observed repeat count**. The source-specified artifact is the unchanged [canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json). A standalone [Node reproducer](../sims/lp2_anti_repeat_lossless_capacity.cjs) asserts every original page count and verifies the combinatorial formula with complete small-case enumeration.

## Why it matters for a full inverse

The actual 55 rune-bearing unknown LP2 physical pages contain **12,956 runes** and **12,901 within-page successor positions**; exactly **86** of those successors repeat the previous rune. Uniform iid GP29 strings would have **12,901/29 = 444.862069** repeats on average. This near-uniform-but-anti-repeating property has encouraged ciphers that *rewrite* unwanted repeated outputs, reject a proposed glyph, map a 29-rune plaintext stream directly to 28 nonzero differential steps, or treat 86 doubles as a special escape symbol.

These can be useful statistical generators without being **decoders**. A deterministic many-to-one rewrite loses information. A full solution must prove where overwritten information lives and how it is recovered from the original artifact. Conversely, the low repeat count **does not** rule out a reversible stream cipher whose particular plaintext/key happen to yield few repeats, nor a reversible source coder operating on a restricted vocabulary or message set.

## Exact counting theorem

Fix all 55 original page lengths and the GP alphabet size 29. There is one unconstrained starting rune per page and a total of \(N=12,901\) subsequent transitions. A transition either repeats the previous rune (one choice) or differs (28 choices).

For a fixed **binary repeat mask** with \(k\) repeated positions, the number of permitted ciphertext rune books is

\[
A_{\mathrm{mask}}(k)=29^{55}\,28^{N-k}.
\]

For **exactly \(k\) repeats, anywhere**, the number of books is

\[
A_{=k}=29^{55}{N\choose k}28^{N-k}.
\]

For **at most \(K\) repeats** the book count is \(\sum_{k=0}^{K}A_{=k}\). Dividing by all possible \(29^{12,956}\) GP books gives the exact binomial tail

\[
\frac{A_{\le K}}{29^{12,956}}
=\sum_{k=0}^K{N\choose k}
 (1/29)^k(28/29)^{N-k}
=\Pr\big[\mathrm{Binom}(N,1/29)\le K\big].
\]

An injective map from **all** GP29 plaintext books of these lengths into a constrained ciphertext book plus a \(b\)-bit plaintext-dependent sidecar requires

\[
2^b A\ge 29^{12,956}
\quad\Longrightarrow\quad
b\ge\left\lceil\log_2(29^{12,956}/A)\right\rceil.
\]

A preshared, plaintext-independent secret key does **not** increase the number of available ciphertext/sidecar combinations under any *fixed* key. It can of course change which individual plaintext maps to which ciphertext.

## Original-input bounds

| Restriction imposed on *all* outputs of the proposed encoder | Exact information deficit | Minimum integer sidecar size |
| --- | ---: | ---: |
| At most 86 repeated transitions in the whole book | 325.450254 bits | **326 bits / 67 GP29 symbols** |
| Every original page has at most its observed count | 430.561201 bits | **431 bits / 89 GP29 symbols** |
| Every original page has exactly its observed count | 445.731558 bits | **446 bits / 92 GP29 symbols** |
| Repeat/nonrepeat mask fixed at all 12,901 original positions | 1,066.559492 bits | **1,067 bits / 220 GP29 symbols** |

The per-page rows are products of independent \(\mathrm{Binom}(L_j-1,1/29)\) masses or cumulative probabilities using **each original physical rune page** \(j\) with \(L_j\) runes. The 55 original page-specific pairs \((L_j,k_j)\), including the short p49/p51/p55 regions, are printed in the reproducer's JSON output. Runeless physical p50 contributes no initial symbol or transitions.

The at-most-86 and exact-mask bounds differ because freedom to choose **which 86 positions** repeat carries \(\log_2{12,901\choose86}=740.809882\) bits of combinatorial choice; it would be incorrect to treat a freely chosen mask as if its positions were known in advance. In particular, a model that merely rewrites collisions but does not transmit enough information to distinguish original inputs is *provably nonuniversal* under the stated output constraint, not just "possibly lossy."

**Concrete architecture gate:** a supplementary channel supplying only **256 arbitrary binary bits** is too small for an encoder that must accept all original-length GP29 inputs and always output no more than 86 repeats: 256 is below the unconditional 326-bit minimum. However, the known 256 ink/grid-event coincidence does **not** mean there is exactly a 256-bit channel. Positions, symbols and printed bytes could encode many more bits, and their independent information content has not been established. A 256-**byte** table has enough *nominal cardinality* to bypass the bound, but that alone neither demonstrates a coupled encoder nor identifies an authentic key.

## Positive controls, limitations and next decision

The [reproducer](../sims/lp2_anti_repeat_lossless_capacity.cjs) enumerates **all \(29^L\)** GP strings for \(L=1,2,3\) and verifies the predicted repeat-class counts, then reads the actual **55 page lengths and 86 events** and computes the exact log-binomial mass/cdf, asserting the values above. No probabilistic simulation, English-language scoring, ciphertext crib or fitted key enters the theorem.

This is a **source-bookkeeping gate only**. The manuscript may have a non-GP intermediate alphabet, plaintext restricted to language, compressed variable-length coding, physically printed non-rune side channels, or a cipher that produces low repeats only for the *actual* input. The author might not have specified any hard bound on repeat counts. In every such case, the theorem's universal-domain restriction does not apply directly. The observed scarcity is not proof of a 326-bit key, a 28-symbol inner alphabet or an entropy coder.

Before launching a new "lossless soft-rejection" inversion, require the proposer to specify **which outputs are legal for every possible source input**, whether the equal-transition mask is selected or predetermined, and how extra symbols/bits are recoverable from the original LP2 images. If no decodable side channel or restricted source alphabet can be written down, the proposal is only a statistical surrogate. Source-authenticated rules and actual original plaintext remain the necessary next evidence.
