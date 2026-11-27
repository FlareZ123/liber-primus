# p57 consecutive-prime interval: exact 29-element candidate and direct inverses

Agent 37, 2026-11-27. **Numerical observation; direct cipher consumers negative. No recovered unknown plaintext.**

The four original p57 printed units have standard GP prime sums 449, 1259, 1031 and 1229 (see [prior ordinal analysis](lp2-p57-parable-four-primeordinals-666.md)). The last two are the complete instructions about shedding circumferences and finding divinity within. Their inclusive prime interval contains exactly 29 primes: ordinary prime ordinals 173 through 201 inclusive. The second member, 1033, independently occurs in the LP2 cuneiform/magic-square material; 1229 is also the endpoint discussed in the [historical prime-gap analysis](lp2-2013-primegap-1229-p50-rowkey-original-gate.md). These connections do not authenticate a key or prove authorial intent. The interval choice is retrospective.

Q = 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229.

The simplest p56-style consumer is the cyclic sequence K[j]=(Q[j]-1) mod 29, in increasing prime order. It has only 20 distinct residues and so cannot itself be a permutation chart. Test all 29 initial phases and both signs, ordinary advancement and p56 transparent F (literal F does not consume a key value; non-F plaintext may encrypt to F). Exact state DP merges only equal phase/last-plaintext states, keeping the best language score without losing any legal continuation.

The other consumer explicitly models rare doubles: first rune is IV, d=(C[i]-C[i-1]) mod 29. If d=0, emit F and hold; otherwise emit P=1+((d-1-sign*(Q[j]-1)) mod 28), advance phase cyclically. This is a new proposed predecessor-exclusion encoding, not the authentic p56 rule. Each inverse candidate re-encodes exactly.

| Physical pages | Runes | Maximum F-hold legal prefix | Complete F-hold phase/signs | Best ordinary/F log score | Best predecessor rank log score |
|---|---:|---:|---:|---:|---:|
|0–2|729|234|0|-3.92750|-3.91067|
|3–7|1145|354|0|-3.92202|-3.88693|
|8–14|1729|123|0|-3.92878|-3.92858|
|15–22|1903|301|0|-3.91699|-3.94401|
|23–26|1021|527|0|-3.91635|-3.92940|
|27–32|1433|155|0|-3.93301|-3.91138|
|33–39|1680|208|0|-3.92289|-3.93505|
|40–53|3008|204|0|-3.92328|-3.94171|
|54–55|308|132|0|-3.83504|-3.87177|
|55 alone|76|76|12|-3.72589|-3.78882|

Language model is the smoothed native-GP29 bigram model trained on eight solved sections excluding p57. The held-out p57 authentic plaintext scores -2.62514 nats/rune. A synthetic p57 F-hold control at phase 0/sign+ recovers 95/95; a predecessor-rank control at phase 11/sign+ recovers the hidden phase/sign and 95/95 from all 58 possibilities. Same passage reused; not independent controls. All rank candidates re-encode. None of the tested chapter inverses is convincing prose. Isolated p55 survives in 12 F-hold configurations and is not mathematically excluded, but the strongest complete candidates do not produce a credible passage.

**Disposition:** retire these direct cyclic consumers; do not claim the prime interval itself excluded as a clue, nor extend into arbitrary transforms without a new source constraint. The two modulo choices, cyclic traversal, and predecessor marker are researcher-selected. Source inputs are the canonical corpus and lossless relikd native transcription; the code is executed in the connected JavaScript runtime, not CI. Reproduce: `node sims/lp2_p57_prime_interval29_sft.cjs`.
