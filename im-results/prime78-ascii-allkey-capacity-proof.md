# All-key exclusion of printable-ASCII 78-rank/47-byte LP2 transport

**Evidence class: exact original-ciphertext finite-domain impossibility (conditional on an explicit byte transport). Agent 8, 10 November 2026.** A CP-SAT solver proved that **no secret global 29-rune cyclic permutation**, among all 29! possible orders, maps the canonical original LP2 165×78 erased-repeat packets to a stream where **even the first two bytes of every known-predecessor 47-byte packet are printable ASCII (32–126)**. A true hidden-key ASCII transport with identical framing and original marker placements was recovered exactly. This is a rigorous negative for that fixed-encoder family. It does **not** identify Cicada's real cipher or recover any unknown plaintext, and it does not exclude arbitrary binary, compressed, encrypted, Unicode, nonprintable ASCII, varying alphabet, or different framing.

## Original source and exact cipher model

From the canonical original 55 rune-bearing unsolved physical LP2 pages in [source corpus](../resources/liber-primus/lp2-corpus.json), concatenate **12,956 GP rune indices** in physical order. At the **86** observed adjacent-equal ciphertext positions, hypothesize a *transparent marker* consuming no radix digit; remove the later equal glyph at each event. This leaves exactly **12,870 = 165×78** original nonrepeating glyphs. The marker interpretation is a test hypothesis, not an established historical instruction.

A secret order of the **29** GP glyph labels defines one fixed cyclic rune alphabet with location \(\pi(g)\in\{0,\ldots,28\}\). Every successive nonrepeat ciphertext pair \((a,b)\) maps to one base-28 digit:

\[
d(a,b)=(\pi(b)-\pi(a)-1)\bmod29\in\{0,\ldots,27\}.
\]

The proposed transport groups every 78 digits into a **47-byte big-endian unsigned integer** via

\[
V=\sum_{i=0}^{77}d_i28^{77-i}.
\]

The group begins at clean-stream global index zero and does not restart at page boundaries. Every packet after the first has a known observed predecessor glyph, including across clean-block boundaries. The first packet's leading predecessor was not printed and is **not constrained** in the proof. The remaining **164 packets** contribute 164 independent, source-defined predecessor-and-three-glyph quadruples. The secret cyclic order is allowed to be completely arbitrary; the only symmetry reduction is \(\pi(\mathrm{GPindex0})=0\), valid because adding one constant to all 29 \(\pi\)-values changes no digit.

## Proof-safe constraint on only three original radix digits

For each tested packet define \(P=784d_0+28d_1+d_2\) and \(R\) from its remaining 75 digits, \(0\le R<28^{75}\). Exactly,

\[
V=P\,28^{75}+R,\qquad
Q=\left\lfloor V/256^{45}\right\rfloor .
\]

For **any actual 47-byte packet**, \(Q\) is the unsigned integer of its first two bytes, \(256b_0+b_1\). Regardless of every unknown suffix digit, its value must lie in the integer interval

\[
\left\lfloor P\,28^{75}/256^{45}\right\rfloor
\ \le Q\ \le\
\left\lfloor (P+1)\,28^{75}/256^{45}\right\rfloor .
\]

The upper bound deliberately includes possible values that are impossible for any suffix, so rejecting a prefix that violates it is still an **unconditionally sound necessary test** for this byte format.

Enumerate all **28³=21,952** possible \(P\), using exact arbitrary-precision integer arithmetic and both endpoint bounds. A prefix is *allowed* if **at least one integer \(Q\)** in the safe range has **both** \(b_0=\lfloor Q/256\rfloor\) and \(b_1=Q\bmod256\) inside printable ASCII 32..126. Exactly **6,186** prefix values satisfy this condition; their union is **94 disjoint integer intervals**. Only the first **three** consecutive rank steps from each packet are necessary to enforce the test. Any fully printable ASCII packet is a subset of this larger feasible domain.

For the unknown source cipher, introduce 29 all-different integer variables \(\pi_g\in[0,28]\), fix \(\pi_0=0\), and for each of 164 original packet leaders introduce three digits \(d_j\in[0,27]\), constrained by

\[
d_j=(\pi_{\mathrm{next}(j)}-\pi_{\mathrm{previous}(j)}+28)\bmod29.
\]

Constrain each \(784d_0+28d_1+d_2\) to belong to the **same exact 94-interval allowed set**. No word or language model, ciphertext-derived parameter fitting, guessed key, original plaintext crib, PRNG seed, or secret outer alphabet is supplied to the original solver. A feasible 29-label permutation would provide a witness. **INFEASIBLE proves none exists** for this declared model, because all possible keys are represented.

## Execution: 164 original packets versus true hidden-key source plant

Reproducible [Python CP-SAT proof script](../sims/prime78_ascii_bit_cp.py) is executed using **ortools==9.15.6755** in the pre-existing [manual original-source solver workflow](../.github/workflows/stateful-ascii-cp-manual.yml), with **probe=binary47, charset=printable**.

| Run | CP-SAT outcome | Time | Conflicts / branches | Meaning |
| --- | --- | ---: | ---: | --- |
| **Original LP2 164 packet leaders** | **INFEASIBLE** | **25.460s** | **8,459 / 140,924** | Every global 29-rune cyclic order is excluded for fully printable 47-byte packets under this framing |
| **Source-native 165×47 printable-ASCII hidden-key plant** | **OPTIMAL (feasible)** | **3.581s** | **1,560 / 31,228** | Full global 29-rune order recovered exactly modulo rotation; **7,708 / 7,708** decoded byte values printable, no overflow |

The positive constructor encodes 7,755 uppercase ASCII characters, taken in order from the independently solved GP-English LP1 reference (letters and spaces), as 165 exact 78-digit base-28 integers. It encrypts using a deterministic freshly shuffled secret 29-rune cyclic alphabet. The known secret is supplied as a **solver hint to accelerate positive feasibility**; it is independently checked against every necessary original-format equation. The positive's returned whole 29-cycle matches the planted key up to global rotation, and bytes recovered for packets 1–164 exactly spell the planted text. A separate [blind-key 29/29 recovery experiment](prime78-ascii-order-inversion.md) without such a hint independently shows this encoder can be inferred from the emitted source-like ciphertext.

**Primary reproducible CI:** [successful GitHub Actions 42843599892](https://github.com/FlareZ123/liber-primus/actions/runs/42843599892). The job log explicitly prints **original status INFEASIBLE**, full original SHA-256, model dimensions and 8,459 conflicts; the same run first prints the positive full-key and byte-exact recovery. The source of truth is the immutable original ciphertext used in the job. The code is read-only with no source JPEG edits.

## A broader 7-bit-only condition stays unresolved

The same program with **charset=7bit** requires only that each of the first two bytes is below 128, without demanding printability. Exactly **11,130 /21,952** three-digit prefixes (126 intervals) meet this much weaker necessary condition. The source-English plant again returns **OPTIMAL** with all 29 planted labels and all 7,708 output bytes. On the original, solver status is **UNKNOWN at the explicit 300.509s limit** after **159,849 conflicts / 6,710,400 branches**, [GitHub Actions 42842903864](https://github.com/FlareZ123/liber-primus/actions/runs/42842903864). UNKNOWN is **neither** an exclusion **nor** a positive recovered key.

This difference is crucial. The proved exclusion concerns an encoder outputting printable ASCII for all 47 bytes in every packet, with a globally fixed 29-glyph cyclic alphabet and original marker erasure. It does not license claims that every 7-bit ASCII or binary-payload format is impossible.

## Consequences for actual LP2 decryption

This is a key-independent finite impossibility theorem for a plausible **alternative byte transport**, complementing earlier source-native GP plaintext families and earlier 79/78 numeric encoding attempts. It closes the fixed secret cyclic alphabet **without doing a language-model key search** and leaves the recoverable, genuinely encrypted intermediate and potential independent source-key material as the more productive directions.

If revisiting byte coding, a genuinely different architecture must specify why a different group alignment, per-packet/section order change, transparent marker treatment, nonprintable bytes, or post-encryption layer is supported by authentic source evidence. Merely resampling all 29! cyclic orders cannot rescue the proven fixed printable model. No authentic LP2 plaintext, authorial cipher or Cicada destination has been discovered.
