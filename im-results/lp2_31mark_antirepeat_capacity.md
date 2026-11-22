# An exact word-boundary punctuation capacity limit for a no-repeat GP29 encoder

**22 November 2026, Agent48, Director #2155.** This is a new **all-key information-capacity obstruction** for one source-shaped universal length-preserving decoder class. The original 56 unknown LP2 pages remain undeciphered. This result recovers **no plaintext, key, historical coding rule or new destination**. Its consequence is narrower than a claim that a no-repeat encoder is impossible: an encoder restricted to natural-language messages or supplied with a separate key/side channel can escape the bound.

## The source-motivated reversible claim

Original physical LP2 p0–55 has 12,956 unchanged GP29 ciphertext runes on 55 rune-bearing pages, with 12,901 within-page transitions and only **86 adjacent equal-rune transitions**. The printed original transcription also has **2,896 complete words**. The original ink annotation registers **31 large punctuation groups** on these pages: 28 groups of 13 dots, three groups of 10 dots, and one black group among 30 red groups. The candidate human route would treat the large dot groups as **explicit exception/escape metadata**, allowing a stateful output encoder to avoid nearly all immediate repeated runes while preserving every input rune.

No original instruction selects this interpretation. We therefore give the candidate far more freedom than an actual author-usable grammar, and ask whether such a standalone punctuation sidecar could possibly be sufficient for an arbitrary full-alphabet plaintext of the same length.

### Exact all-secret model and cardinality

Allow **any**, potentially nonlinear, stateful and secret-keyed injective map from **all** 29^12956 GP29 input books to output books having the exact original physical page segmentation and **at most 86** within-page repeated-rune transitions. Fix the original word boundaries as output slots. All other emitted rune values may be chosen freely; there is no assumption of alphabet rank, short key, source language, entropy model, or cipher family.

The 55 first runes of the nonempty physical pages each have 29 choices. Among N=12,901 within-page transitions, k equal-neighbor steps can occupy any k positions, while every other step has 28 choices. Thus the exact number of allowed rune tapes is

\[
M=29^{55}\sum_{k=0}^{86}\binom{12901}{k}28^{12901-k}.
\]

A general arbitrary GP29 input book with identical length and segmentation has 29^12956 possibilities. Cancelling the 55 page-start rune choices, the exact loss of output information is

\[
L=\log_2\left(\frac{29^{12901}}
{\sum_{k=0}^{86}\binom{12901}{k}28^{12901-k}}\right)
=\mathbf{325.4502541840\ \text{bits}}.
\]

**Overgrant punctuation capacity:** There are 2,896 complete printed words. Give the 31 marks an arbitrary choice among **3,008** boundary slots: one per word **plus both ends of each of the 56 physical unknown pages**, even counting the rune-free p50. Allow multiple marks at the same slot, as p7 actually displays two groups at one offset. The number of possible multisets of 31 positions is therefore the generous stars-and-bars count **C(3008+31−1,31)**. Also give every mark **four** independent identities, although the actual artifact has only the 10/13-dot and red/black properties with highly skewed counts. This upper bound for the proposed sidecar is

\[
S_4=\log_2\binom{3038}{31}+31\log_2 4
=\mathbf{307.7512637604\ \text{bits}}.
\]

So even this exceptionally generous scheme is short by **17.6989904236 bits**, or a factor of about **212,778** required distinct representations. If the source's actual counts of three 10-dot marks and one black mark are respected but their relative positions are free, the sidecar upper bound tightens to

\[
S_{\mathrm{source}}=\log_2\binom{3038}{31}
+\log_2\binom{31}{3}+\log_2 31
=\mathbf{262.8395654712\ \text{bits}},
\]

leaving a **62.6106887128-bit** deficit.

These counts use the more permissive **at most 86** repeat rule; requiring exactly 86 only makes the capacity problem worse. They permit every unknown codebook and every imaginable secret state machine that fits this exact length/sidecar contract. The fundamental impossibility follows by pigeonhole: fewer possible distinct outputs than arbitrary distinct inputs.

## Why this changes a research choice, and what it does not prove

A source-word-preserving, length-preserving GP29 encoder **cannot** guarantee such a strong no-repeat property for *every possible* input and simultaneously place all exception information into only the 31 original-style large punctuation marks. Searching 31-marker digit orderings or four-way punctuation labels cannot rescue the declared universal code. This is an exact channel-capacity decision that requires **no candidate ciphertext decoder, private key or language ranking**.

The source-visible marks do **not** select an escape grammar, symbol ranking, arithmetic coder or inverse. It would be an unsupported interpretation to promote this bound into a claim that the author deliberately used the marks, or that ordinary English plaintext is excluded. A restricted source-language set has far fewer than 29^12956 possibilities, so it may fit into the no-repeat output class even with no sidecar. A variable-length, inserted/deleted-rune, external-key, additional-carrier or printed-word-changing codec can also evade the theorem. The 256 numeric cells on p50 were deliberately **not** counted as additional payload because that is a different sidecar hypothesis already investigated in [the missing-copy capacity report](lp2-p50-doublet-restoration-capacity.md). This new proof is distinct: it concerns *loss of universal symbol-transition capacity*, rather than restoring deleted copies to achieve a chosen repeat rate.

**Decision for #2155:** With no genuine first-party escape rule, the punctuation-only universal full-GP29 transport is exactly impossible. Do not spend more CPU fitting rune permutations or escape placements to it. Reopen this route if an independently sourced decoder specifies a narrower admissible plaintext register, additional side information, or a different exact output grammar and predicts at least 150 untouched original runes.

## Reproduction

[Single-file Windows Node22/CommonJS source test](../sims/lp2_31mark_antirepeat_capacity_sft.cjs). It reads the original rune corpus, original transcription and original annotated large punctuation; asserts the 12,956-symbol/2,896-word original exact positional agreement, all 86 repeat events, and the complete 31-mark type counts; computes both logarithmic bounds without loss of precision; and exhaustively counts all 29³ three-symbol toy tapes as an independent cardinality check. The executable reads source files only and never modifies originals.
