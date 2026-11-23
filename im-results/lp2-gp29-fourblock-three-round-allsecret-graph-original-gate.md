# Three-round GP29² Feistel: exact all-secret original graph gate

**Decision, 23 November 2026 (Agent36):** The full 12,956-rune original LP2 unknown ciphertext cannot be generated from any of **288 independently sampled, original-word-length-matched GP29 literary English controls** by a book-global **three-round additive Feistel** on four-rune blocks, *even when every entry of each of its three nonlinear round functions is wholly secret*. The same finite negative survives assigning new unrelated round functions to each of the **eight actually printed \`$\` sections**, allowing each section any independently chosen four-rune phase. Conversely, page-private arbitrary functions remain underidentified: the necessary graph constraint has **zero contradictory cycles on all 288 controls** when each of the 55 original rune-bearing pages may choose its own phase and functions. This reports a **conditional cipher-family decision**, with no recovered original plaintext, authored key, or historical evidence selecting Feistel.

## Key-independent theorem

Let each four-GP29-rune plaintext packet be two GF(29)² halves \`(L,R)\`, and its actual ciphertext packet be \`(A,B)\`. Any three-round additive Feistel has

\`\`\`
X = L + F1(R)
A = R + F2(X)
B = X + F3(A)
\`\`\`

with vector addition modulo 29. Eliminating the invisible state \`X\` forces

\`\`\`
F1(R) + F3(A) = B - L   (mod 29, in both components).
\`\`\`

Each original packet is therefore an edge from its **plaintext right half R** to its **original ciphertext left half A**, labeled \`B−L\`. Setting \`V(A)=−F3(A)\` yields a weighted bipartite potential equation \`F1(R)−V(A)=B−L\`. A system of these equations has some secret solutions \`F1,V\` if and only if all its graph cycles are consistent. Two-component weighted disjoint-set union detects every contradiction in linear-near-time without searching functions, keys, plaintext shifts, or IVs.

**Crucial scope:** graph consistency is **necessary, not sufficient**, for a complete three-round cipher: the independent middle function \`F2\` must also exist. The theorem holds for entirely arbitrary nonlinear/noninjective round maps, including secret ones. It does **not** apply to different block serialization, non-additive rounds, fourth rounds, changing cipher states, unknown plaintext representation, or altered word boundaries.

## Exact original-input test

The [standalone Windows Node22 SFT](../sims/lp2_gp29_fourblock_three_round_allsecret_graph_sft.cjs) reads canonical original [LP2 GP29 page arrays](../resources/liber-primus/lp2-corpus.json) and [the actual printed word/section boundaries](../resources/liber-primus/lp2-transcription.txt). They contain **55 rune-bearing pages, 2,896 continuous words, 32 cross-page words, 12,956 original runes**. The eight observed sections have lengths **729, 1,145, 1,738, 1,894, 1,021, 1,433, 1,680, 3,316** runes; this parsing is source-led. The controls encode independent Gibran, Shakespeare and Emerson literary words through the already authenticated [source-native GP orthography](../sims/lp2_native_gp_source_orthography_sft.cjs) and sample exact original printed rune-word lengths. Fixed seed \`0x33012026\`, **96 distinct books from each donor**. For the single global secret, all **four** four-rune phase offsets are considered and the lowest violation count is retained. For the source-eight-section and 55-page settings, each region may choose an independent best phase, then contradictions sum.

| Independently sampled native GP source | Book-global F1/F2/F3, min–max conflicts | Eight source-section keys, min–max | Per-page keys |
| --- | ---: | ---: | ---: |
| Gibran, 96 books | 1,984–2,013 | 74–100 | 0 for all 96 |
| Shakespeare, 96 books | 1,993–2,019 | 65–98 | 0 for all 96 |
| Emerson, 96 books | 1,981–2,013 | 69–95 | 0 for all 96 |

The source graph is strongly incompatible with these **specific donor books** under global and section-secret 3-round Feistel, even granting all unobserved secret round tables. A graph with no cycles in the page-private test supplies no evidence that some unique cipher or plaintext was found; page-private arbitrary functions are simply too flexible for this gate.

## Independent reproducibility and controls

- Four synthetic packets form a prescribed four-edge bipartite cycle. Setting the fourth edge to its required group sum gives **one cycle / zero contradictions**; changing just one GP29 coordinate gives **one cycle / one contradiction**.
- An independently solved real p57 **95-rune GP29** passage encrypted using three explicit unrelated nonlinear functions has **exact forward/backward replay** and zero graph contradictions.
- A complete **12,956-rune native-English book** encrypted with those functions also decrypts, exactly reencrypts, and satisfies the graph constraints without relaxing its 2,896 authentic word-length slots.
- The [original Windows Node22 run 45166022481](https://github.com/FlareZ123/liber-primus/actions/runs/45166022481) completed successfully with all 288 source-native donor trials. A follow-up with the four-edge regression asserted will be linked in this document after its run finishes.

The **next constructive step** would be an independently authored source clue that specifies the four-rune halves, a round function or key, and a page/section reset, then predicts contiguous untouched original text. There is no justification for brute-forcing fourth-round or page-private arbitrary round tables from this finite graph result. All **56 unknown physical LP2 pages remain undeciphered**.
