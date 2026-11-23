# Original terminal RS255 inverse: p55's 32-rune circumference and 223-rune interior/known tape

**Agent33, 23 November 2026. Exact all-secret rejection of two historically plausible terminal Reed–Solomon architectures. No unknown LP2 plaintext, cipher key, or destination recovered.** The principal test uses the solved PARABLE as a literal operation on the original p55 words. A secondary seam test grants every possible omitted p55 rune. Neither creates a valid full-width GF(256) RS codeword, even with a completely secret stationary GP29-to-byte alphabet.

## Strongest source-derived solve-path hypothesis

The original p55 page contains **76 runes**. Its first printed rune is a genuine continuation of a p54 word. Discard that one incoming glyph and split each of the remaining **16 complete p55-local words** into its two **circumference** runes (first and last) and strictly interior runes. This gives **32 shell runes and 43 inner runes**, as established independently in the [original SHED extraction](lp2-p55-shed-circumference-prime-shell-original.md). All 75 local runes are retained by this partition. The solved p57 PARABLE explicitly instructs readers to *shed our own circumferences* and find divinity within.

Add the known complete **p56 85 runes** and clear **p57 95 runes** to the 43 retained interior runes: **43+85+95=223**. The 32 removed p55 shell runes then supply **255−223=32** further positions. Consequently, the word-peel operation spells out the standard block-code dimensions **RS(255,223)**. A human Cicada solver could plausibly recognize RS because the earlier QR puzzle used Reed–Solomon correction. This is a stronger clue-constrained route than merely treating the p50 byte table's 256 cells as a codeword.

**Crucial unproven premise:** No surviving author instruction chooses RS, GF(256), its byte convention, systematic data/parity order, or its connection to LP2. Dropping the genuinely crossing p54→p55 word is also a substantive choice: the competing chapter-continuous peel gives 52 interior and 34 boundary runes, eliminating this exact 255 construction. The model below is tested as a conditional inverse, never promoted to original intent.

The proposed reversible arrangements, preserving printed order within each block, are:

- **interior43, known180, shell32**: the clearest data-first systematic RS(255,223) reading;
- **shell32, interior43, known180**: parity-first;
- **known180, interior43, shell32** and **shell32, known180, interior43**: source-block ordering rivals.

The GP29 tape on p56 has **two authentic representations**: the original 85 encrypted runes and the 85 decoded English runes. The latter is rederived from the original p56 using its exact prime-minus-one key and literal-F skip at position 56. Test either representation, original or reversed source order, both standard RS first-root conventions, and QR and AES field polynomials. Thus the literal SHED test has **4 block layouts ×2 page56 registers ×2 tape directions ×2 root conventions ×2 fields =64** predeclared exact original-source cases.

## Allow every unknown GP29-to-byte key without searching for it

Ordinary byte serialization might miss an author-selected substitution alphabet. Instead let each GP29 glyph \(s\) denote an **entirely unknown GF(256) byte \(v_s\)**, the same byte for that glyph throughout the codeword. Demand a distinct byte for each distinct glyph, as any reversible stationary alphabet requires.

For any proposed 255-rune tape \(c_0,\ldots,c_{254}\), Reed–Solomon's required root equations become a **linear system in the unknown 29-byte codebook**, regardless of the actual symbols' assigned bytes:

\[
\sum_{i=0}^{254}v_{c_i}\,\alpha^{k(254-i)}
 =\sum_{s=0}^{28}\left(\sum_{i:c_i=s}\alpha^{k(254-i)}\right)v_s
 =0.
\]

Here \(\alpha\) is a primitive GF(256) element and \(k\) runs over the declared consecutive parity roots. Thus there are at most **29 unknown field values**, and the original ciphertext determines every matrix coefficient before any codebook is chosen.

For standard RS(255,223), **32** consecutive zero syndromes are required. Over either of these source-relevant conventional field representations, the matrix's first **30** root rows already have **rank 29** when starting with \(\alpha^0\); its first **29** rows have **rank 28** when starting with \(\alpha^1\). This holds in **all 64 cases**, with **all 29 GP runes actually present**:

| Conventional GF(256) basis | Primitive element | Root sequence | Matrix rank in all 64-way SHED family |
| --- | ---: | --- | ---: |
| QR code basis, 0x11d | 2 | α⁰ through α³¹ | **29 of 29** |
| QR code basis, 0x11d | 2 | α¹ through α³² | **28 of 29** |
| AES basis, 0x11b | 3 | α⁰ through α³¹ | **29 of 29** |
| AES basis, 0x11b | 3 | α¹ through α³² | **28 of 29** |

With root **α⁰=1**, full rank forces **every GP glyph's byte value to zero**. With roots beginning at **α¹**, an all-equal byte mapping is always a null solution, because all 255 powers of a nontrivial root sum to zero; rank 28 proves this is the **only** one-dimensional solution space. In both cases, the required field values collapse every rune to an identical byte. **There is no reversible stationary 29-symbol-to-byte assignment**, even a secret arbitrary one. All 32 parity syndromes therefore cannot hold under such a decoder.

This rejects a standard **RS(255,223) directly on the peeled original rune identities**, for the source-ordered layouts, registers, directions and two standard GF256 field choices. It makes no English scoring assumption.

## Independent 75+180 seam architecture

The simpler alternative discards **any one** of the 76 p55 glyphs, leaving 75 original p55 runes followed by 85 p56 and 95 p57 runes, or **75+180=255**. This would be **RS(255,180)** with 75 parity constraints. It is also loosely motivated by the exact 76/180 rim/interior count of the independent original 32×8 numeric table; that earlier [table-as-RS test](lp2-terminal-reed-solomon-76border-180interior-gate.md) concerns **different byte input** and must not be conflated with this terminal-rune tape.

The all-secret source test grants **every one of the 76 p55 deletion sites**, both p56 registers, both tape directions, both fields, and both first-root conventions: **1,216 exact cases**, with these exhaustive ranks:

| p56 representation | p55 omitted rune | GP identities remaining | Root α⁰ rank | Root α¹ rank |
| --- | --- | ---: | ---: | ---: |
| Original p56 ciphertext | Any of 76 | 29 | 29 | 28 |
| Authenticated p56 plaintext | 74 of 76 locations | 29 | 29 | 28 |
| Authenticated p56 plaintext | p55 local position 63 or 71 | 28 | 28 | 27 |

The final two rows occur because those two original p55 glyphs are respectively the **only OE or J** in the particular decoded-p56 terminal sequence. An unused GP identity may be assigned any byte, but all **used** identities are still forced to zero or to the same value. This precludes an injective codebook on actual source symbols. Only the first 30 or 29 syndrome rows are needed; the remaining RS checks cannot enlarge the nullspace.

## Reproduction and positive controls

The standalone read-only [Node 22 CommonJS original-source SFT](../sims/lp2_terminal255_allsecret_rs_source_gate_sft.cjs) re-reads the canonical unmodified GP29 corpus **and the original punctuation-level LP2 transcription**. It asserts the exact p55 word parse, proves the 32/43 shell/interior counts, reproduces authenticated p56 decoding rune-for-rune, and evaluates **all 64 SHED and 1,216 seam cases** under fully unknown GF(256) byte mappings.

An independent **genuine, nonzero RS codeword** is planted with three distinct, period-three byte symbols across 255 positions. The labels \([7,11,12]\) satisfy all **75** parity roots beginning at α⁰; the labels \([7,11,31]\) satisfy all **75** roots beginning at α¹. Each passes in both GF256 bases. This confirms the test accepts actual nonconstant encoded RS sequences. The first narrower SFT passed [Windows Node 22 run 45155022653](https://github.com/FlareZ123/liber-primus/actions/runs/45155022653). The extended word-peel version ran as [run 45155764249](https://github.com/FlareZ123/liber-primus/actions/runs/45155764249).

## Decision and limitation

The original PARABLE's word-level circumferences give a concrete **32/223** representation, but **its direct conventional RS(255,223) operation is impossible** on the actual terminal rune identities under any fixed reversible GP29 byte assignment in these historical field and order conventions. The **75/180** terminal variant is independently impossible under the broader 1,216-case source boundary family. These are substantial **negative decisions**, not plaintext decryptions.

A stage before Reed–Solomon (e.g. a source-specified stream transform or interleaver), a different block allocation, or an explicitly author-provided nonstationary byte mapping would escape the theorem. None is chosen by the manuscript's observable clues. Reopen this route only after an original instruction supplies the missing receiver and its transport grammar; an unconstrained alternative codebook cannot rescue it.
