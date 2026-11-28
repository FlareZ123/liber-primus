# P50 32×8 panel as eight section-addressed predecessor lookup alphabets

**28 November 2026 · Agent 24 · original-cipher finite, all-secret negative.**
No unknown LP2 plaintext, key, creator-selected opcode or puzzle destination recovered.
[Complete reproducible Node22 test](../sims/lp2_p50_sectionrow_cprev_allsecret_original_sft.cjs)
· [Manually dispatched original-input workflow](https://github.com/FlareZ123/liber-primus/actions/runs/46109272281).

## Distinct, human-readable solve-path proposal

Original LP2 pp49–51 print **256 two-character numeric cells in 32 rows × 8 columns**. The unknown book has **29 GP rune identities** and **eight literal $-delimited text sections**. The original printed section rune lengths are **[729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]**, exactly 12,956. This suggests a practical dictionary-cipher lookup without a guessed key: in section q, the preceding *visible ciphertext rune* chooses one of the 32 printed rows, and the actual section number selects one of the eight columns. The excess three rows can be kept reserved. Both symbols are directly visible, so a recipient can run the inverse without unavailable plaintext state.

That section-addressed column role is **not** the previously tested p50 column clock advancing every eight runes. In particular, [the earlier all-secret previous-rune lookup](lp2-p50-cprev-outer-allsecret-assignment-capacity.md) assigns its table column from a global/page/section/**position** clock, not the same fixed original section ID used for every position within that section. The [eight p50 keys with AES/ChaCha](lp2-p50-eightcolumn-differential-streamkeys-gate.md) derive a *stream* from whole columns; they do not use the preceding ciphertext rune to address a fixed table row. The present test is a simpler independently typed receiver. The strongest rival is still an independently supplied long key or changing state. **No authentic Cicada source instructs this table operation**, so even a positive would initially be provisional.

Let G be the unchanged printed 32×8 numerical cells, interpreted conditionally as radix59 or radix60 bytes. Consider **every independent secret section-specific GP29 outer permutation**, with either additive orientation:

\[
 C_i=\sigma_q\bigl(P_i+s\,[G(R(C_{i-1}),Q(q))\bmod29]\pmod {29}\bigr),\quad s\in\{-1,+1\}.
\]

Here C is the actual printed cipher rune, P the hypothetical underlying GP rune, sigma_q an arbitrary *completely unknown* 29-element permutation for section q, R one of the four source-shaped 29-row addresses **0..28, 3..31, 28..0, 31..3**, and Q(q) either the original section column q or its horizontal reflection 7-q. The original table has only 256 cells, not a published permutation, and the two numeral radices remain distinct. This test therefore covers **2 numerical interpretations × 4 row windows × 2 column orientations × 2 additive signs × (29!)^8 secret outer alphabets**.

At a section start the previous visible rune may be undefined. To avoid using any unintended cross-page seed, **all 55 physical rune-bearing page initials and the one additional internal section initial are granted arbitrary plaintext**, 56 sites total. No guessed IV or plaintext word boundary is used. The model still consumes the original printed rune stream and table unmodified.

## Eliminate all secret alphabets exactly

For each section q, form N_q[c,k], the observed count of original ciphertext rune c when the previous *ciphertext* rune selects grid residue k. If sigma_q^{-1}(c)=x_c, the target plaintext rune t occurs at exactly

\[
\sum_c N_q[c,\;s(x_c-t)\bmod29].
\]

Every possible hidden outer alphabet corresponds to a bijection c→x_c. The **maximum over all 29! choices** is a 29×29 maximum-weight bipartite assignment, computed exactly by Hungarian matching, independently for each section. For two target plaintext runes E and O, use the combined weight N(c,s(x−E))+N(c,s(x−O)). This is the maximum possible joint E+O content under any outer alphabets, not a heuristic cryptanalysis score or selected near-miss. Both signs give identical optima: reflection of the pre-shift labels exchanges the target pair.

As an additional very generous escape allowance, discard every original ciphertext F from the lookup equations and count it as an arbitrarily chosen plaintext rune. This adds **456 F sites**, making **512 total unconstrained positions** including the 56 initials. The remaining lookup state and section numbering are unchanged. It therefore gives the hypothesis the benefit of every possible literal-F emission *without* claiming Cicada actually used F transparency here.

## Whole-book original-input result

The full source is checked independently against all eight original $-separated rune sequences in the canonical UTF-8 transcription and the 55 page-level rune arrays. Both numeric interpretations are built directly from all 256 source token spellings.

| Original table reading | Largest possible E, all secret alphabets | Largest possible E+O | Maximum E when ciphertext Fs free | Maximum E+O when Fs free |
|---|---:|---:|---:|---:|
| Base60, eight row/orientation variants | 1,056 | 1,759 | 1,504 | 2,204 |
| Base59, eight row/orientation variants | **1,061** | **1,771** | **1,510** | **2,213** |
| **Max over all 16 configurations** | **1,061** | **1,771** | **1,510** | **2,213** |

The maxima in each column can belong to different row/orientation variants; they are upper bounds, not one claimed recovered alphabet. Even with **every** ciphertext F and page start freely reassignable, a native GP plaintext cannot contain more than **1,510/12,956 =11.655% E** or **2,213/12,956 =17.081% E+O** in this family. The independent authenticated solved Cicada native-GP corpus has **380 E and 256 O among 2,979 runes**; a 12,956-rune passage with that frequency would have approximately **1,653 E and 2,766 E+O**, respectively. The F-free all-key maxima remain short by ~143 E and ~553 combined E+O. These gaps do not depend on a secret key guess, dictionary or word-by-word English recognizer.

**Control:** the SFT constructs a full 12,956-rune source-native plant by repeating the genuine 95-rune solved p57 register, encrypting with eight newly drawn independent secret 29-symbol permutations under the *actual* p50 source table and section-specific predecessor feedback, and decoding all runes through the genuine inverse. It checks 12,956/12,956 exact recovery and confirms that the planted ciphertext's own assignment upper bounds include its authentic E and E+O frequencies. It also brute-forces three independent 3×3 assignment controls to verify the bound algorithm.

### Nonparametric whole-book English control (same frozen capacity)

Instead of relying only on the solved-Cicada 2,979-rune E/O percentage, a newly executed source-independent control greedily converts the pinned historical **Gibran / The Prophet**, **Shakespeare first300k**, and **Emerson essays** into GP29 symbol streams, using the published GP digraphs `TH NG EO OE AE IA EA`, and common historical Latin normalizations `K→C, Q→C, Z→S, V→U`. Nonalphabetic characters are removed. The threshold **2,213 combined E/O symbols** is the *unchanged original all-secret maximum with every original F and physical/section initial already free*; no threshold is fitted to these controls.

For **every** full-length 12,956-rune contiguous window (overlapping windows, not independent draws), count E+O:

| Independent English source | GP29 stream length | Full-length windows | Minimum E+O | Windows at/below 2,213 |
|---|---:|---:|---:|---:|
| The Prophet | 63,114 | 50,159 | **2,556** | **0** |
| Shakespeare | 218,800 | 205,845 | **2,430** | **0** |
| Emerson | 324,630 | 311,675 | **2,455** | **0** |
| **All three** | 606,544 | **567,679** | **2,430** | **0** |

The *separate* E-only bound of1,510 is weaker: many genuine English windows have E at/below it, so the strong discriminant is **joint E+O**, not E alone. These are exact censuses of these three committed source texts, not formal probabilities that all possible English compositions must resemble them. The corpus conversion is specified and asserted in the same original-rune SFT; it does not add any secret-alphabet search. A constrained or intentionally E/O-poor plaintext, a different inner register, or an independently supplied hidden state can still evade the bounded finding.

## What changes

**Reject this complete section-addressed p50 predecessor lookup plus arbitrary secret section-local outer substitution architecture as the direct encoding of source-native GP English with the familiar solved-Cicada E/E+O content.** This is a newly typed original-source case, distinct from the older eight-phase numeric clocks; its result does not authorize further tuning of base digits, hidden substitution alphabets or arbitrary section offsets. The printed panel's purpose remains unknown.

The rejection is **language/register-conditional**, not a mathematical impossibility for a specially designed E-sparse text, different alphabet, opaque word transport or encrypted binary payload. It also does not cover an evolving column selected anew *within* a section, arbitrary per-rune rekeying, a table-address transformation chosen by another page, or transparent-F operations that **alter subsequent predecessor state**. Any successor should bring a separate original clue that fixes that additional state and a complete reversible inverse with an independently withheld plaintext prediction, rather than saving this decoder with unconstrained exceptions.

The original numerical panel and section geometry remain useful as clue candidates, but this standalone keyless mechanism does not yield an authentic decryption.
