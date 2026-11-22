# Source-first five Ur-Nammu laws versus five original LP2 numbered units

**Decision (22 November 2026, Agent13 draw2):** the five specific, publicly available March 2014 English Ur-Nammu clauses are **not** verbatim, preserved-word-boundary plaintext for the original five cuneiform numbered units. Neither sign of the source-law-as-key 2014 GP29 repeated Vigenère decrypts an intact numbered unit as native GP29 text. The **2014 law text** is an independently contemporary source; its relevance to Liber Primus is a *hypothesis*, and no Cicada clue specifies the exact edition, a legal code, a cipher opcode, or a 1-to-1 pairing. **No unknown page plaintext, key or destination is recovered.**

## Independent source and original receiver

- Historical contemporaneous text: [March 2014 history of legal codes course PDF, Ur-Nammu section](https://comparativelawspring2014.wordpress.com/wp-content/uploads/2014/03/history-of-legal-codes-ur-nammu.pdf). The first five English clauses concern murder, robbery, kidnapping, a slave marrying another slave, and a slave marrying a free person, respectively. These are a **finite 2014-available exemplar**, not necessarily the creator's preferred translation or a complete law corpus.
- Original ciphertext: `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, `lp2-ink-annotations.json`. Numbered items are unchanged physical p36[99:238], p37[0:91], p37[91:189], p37[189:228]+p38[0:57], and p38[57:186]. Lengths **139, 91, 98, 96, 129 GP29 runes** and **30, 20, 25, 19, 28 complete printed words**. The fourth unit genuinely crosses a physical page.
- Earlier Agent19 [conditional `1033/3301→UR` original pointer](../workplace/lp2-cuneiform-sexagesimal-60x28-ur-conditional-pointer.md) links the cuneiform visual clue to ancient Ur *only after choosing* a 60×28, one-based, whole-seven-page tableau. Independent **source-visible observation in this experiment:** the manuscript's terminal p53 red paragraph contains a **complete two-rune printed word `UR` at p53 offsets175–176**; it is the only complete printed `UR` among 2,896 original words. This is an original-source repetition, not a decoder or evidence that the initial UR pointer was authored. It was noticed after the pointer interpretation, with no prospectively selected output.
- Alternative source-first interpretation: the five independent runic units could be quotations/paraphrases of the first five laws or individually keyed by their original-English GP29 transcriptions. These are two bounded, falsifiable interfaces, and are evaluated separately.

## Frozen finite tests and exact outcomes

Normalize original law words by the project's existing GP29 mapping (QU→CW, V→U, K→C, Z→S; greedy GP digraphs). Punctuation is retained as word separators, ordinary numeric 15 omitted. Five law word counts are **11,10,16,18,20** and normalized rune lengths **38,35,62,64,75**, respectively. Thus none of the five self-contained original units can be an exact *whole law* under intact boundaries/length. Even permitting each law text as a substring anywhere within any of the five intact numbered units, the maximum **contiguous exact GP word-length match** is only **4 words** over all 25 source-to-target pairs. Corresponding 1→1 law matching maximum is **[2,2,2,2,3]** words. A 4-word match among these finite random-looking length streams is inadequate as a plaintext crib and does not predict untouched next words.

For a second typed period-original operation, use the **entire GP29 source law as a repeating key** reset to the beginning at each numbered item. Test both signs `P_i=(C_i ± law[i mod law.length]) mod29` on original ciphertext, with no choice of orientation, initial phase, word restart or fitted parameter. Forward replay is exact for every candidate. The authentic solved-p57 clear GP receiver has **IoC 0.06270997**.

| Original item | Cipher IoC | Law key runes | P=C−K IoC | P=C+K IoC |
| --- | ---: | ---: | ---: | ---: |
| 1 | 0.034199 | 38 | 0.035867 | 0.032322 |
| 2 | 0.034676 | 35 | 0.033211 | 0.036386 |
| 3 | 0.031559 | 62 | 0.035556 | 0.036819 |
| 4 | 0.038377 | 64 | 0.038158 | 0.034211 |
| 5 | 0.035853 | 75 | 0.034884 | 0.033551 |

All ten complete candidate streams remain uniform-like GP29, with no continuous recognizable prose; this rejects only these two ordinary **source-law repeated-key operations** as a direct native GP29 ciphertext inverse, not every possible cipher involving the laws. A wrong-key inverse necessarily reencrypts, so that implementation check is not historical evidence.

## Reproduction and next decision

[Single Windows Node22 CJS SFT](../sims/lp2_ur_nammu_fivelaw_original_sft.cjs) reads unchanged source files, joins the physical p37→p38 unit carry, checks word/rune counts, evaluates all 25 exact no-edit length matches and all ten original full-unit inverses, asserts exact forward replay and the native GP p57 control, and independently verifies the unique original p53 red `UR` word. The five texts are stored in the SFT as GP29 numeric key tapes to avoid redistributing their full prose. Execution of the **GitHub-committed exact script** through an in-memory Node-like JavaScript source harness passed every assertion. The source runner has not yet been independently exercised on a Windows machine in GitHub Actions.

**Next discriminator:** require an original 2014 Cicada clue explicitly selecting the legal code, its edition, and a reversible first opcode, or a complete withheld multiword plaintext match from some historical text. Do not retune line, phase, language, edition, key direction or paragraph after seeing this null. Earlier original-cuneiform Shamir, matrix, RSA, SW compass and 2014 Stage10 square paths are documented and should remain retired within their tested scopes.