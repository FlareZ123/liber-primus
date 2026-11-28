# P15 links independently to the authenticated 2013 TCP protocol's DH and BASE29 examples

**Consolidated 28 November 2026. Classification: exact historical cross-reference plus conditional state compatibility. No unknown LP2 body plaintext, unique descriptor→DH provenance or BASE29 body consumer is recovered.**

## Decision

Two numerical contacts with Cicada's authenticated January 2013 TCP-server specification are exact, but they have different evidential status.

The historical source contains:

```text
C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2

C: BASE29 3301
S: 01 OK 3QO
```

P15's conditional state vocabulary evaluates to the same DH tuple `(p,g,A,B,K)=(23,5,8,19,2)`. After the bounded role-map charges in #3399 and #3422, that remains **tuple-level compatibility**: the lower-red descriptor→role provenance is not independently selected.

The BASE29 contact has a stronger, role-independent core. P15's number grid was solved on 11 November by the exact source-fixed mechanism

```text
N(n) = |3301 - prime(distinctFibonacci[n] + 1)|.
```

Its red-origin prefix is

```text
selected primes  [2,3,5,7,13,23]
printed cells    [3299,3298,3296,3294,3288,3278].
```

Thus the page independently recovers **3301** before any DH labels:

```text
3299+2 = 3298+3 = 3296+5 = 3294+7 = 3288+13 = 3278+23 = 3301.
```

That independently recovered anchor is exactly the input of the authenticated historical `BASE29 3301 -> 3QO` example. This is a plausible human cross-reference to the 2013 source.


## Independent p3/Q selector for the `DH` request

A distinct manuscript route now selects the other worked operation in the same signed TCP specification without using the lower-red descriptor→role map audited in #3399/#3422. The p3 red triad defines the frozen GF(29²) relation; the exact p15-second minus solved-p57 factorization yields Q; and multiplying Q by the complementary p15 first red9 gives `[23,8]`. In the canonical GP alphabet those two indices transliterate **literally to `DH`**.

The signed TCP document selected independently by p15's 3301/BASE29 anchor contains the request vocabulary `RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, GOODBYE` and the worked example `DH 23 -> 5 8 -> 19 -> 2`. Across all 18 printed complete red spans, p15 first-red is the only frozen-Q output that equals any complete request name. Across all 450 cyclic/reverse presentations there are only two request hits, both on p15; the second requires reversing and rotating p15's other red span, while the actual printed first-red presentation is rotation0. The sole alternate quadratic factor relation gives `FNG`, not a request.

This does **not** repair the descriptor-cell provenance problem: #3399 and #3422 remain valid for claims that a particular p15 word statistic means `K`, `a`, `g`, etc. It supplies a different causal route. The canonical rune readout itself names `DH`, and the pair `[23,8]` simultaneously matches the signed example's modulus/public value `(p,A)`. Thus the historical DH procedure can now be selected without first assuming the disputed descriptor-role assignment.

[Exact field bridge and finite command-vocabulary charge](lp2-p3-red-field-route-p15-p57-quotient.md#canonical-gp-readout-selects-the-signed-2013-dh-opcode-agent14-28-november-2026) · [reproducer](../sims/lp2_p3_q_tcp_dh_opcode_sft.cjs).

## What #3431 changes

The earlier wording `3299 + K = 3301` was arithmetically true but overstated its independence. The first offset `2` is already the first selected prime of the established grid generator. Calling it `K` is a later conditional state label, not additional evidence for the descriptor→DH map.

A bounded raw-offset charge reinforces the distinction. Across all 16 grid cells, 21 source-visible p15 structural/descriptor values and both signs (672 labeled candidates), **nine labeled routes on four distinct cells** land on 3301. Even structural counts alone give four:

```text
3299 + upper-word-count 2 = 3301
3298 + lower-word-count 3 = 3301
3296 + total-red-word-count 5 = 3301
3288 + red-dot-count 13 = 3301.
```

The red ink does select 3299, but the required value2 has at least two raw p15 origins before state labeling (upper word count2 and lower-W2 length2). The complete generator supplies the actual unchanged explanation because its scheduled prime2 continues over all sixteen cells.

Therefore the correct causal route is:

```text
original red 3299
 -> solved Fibonacci/prime spiral
 -> anchor 3301
 -> recognize authenticated historical BASE29 3301 -> 3QO.
```

The historical command makes BASE29 a legitimate Cicada operation to test when another original object independently selects it. It does **not** by itself select a new p15 body receiver or key.

[Familywise charge and reproducer](lp2-p15-3301-base29-familywise-charge.md).

## Conditional digit naming

The ordinary positional conversions are exact:

```text
3299 = 3*29^2 + 26*29 + 22 = 3QM
3301 = 3*29^2 + 26*29 + 24 = 3QO.
```

Under the conditional p15 state vocabulary those digit vectors can be written

```text
3299 = [e,B^-1,p-1]
3301 = [e,B^-1,-g],
```

and the low-digit change is `22+2=24`. These labels remain conditional on the unselected state-role provenance. They are not independent validation of that provenance.

## Provenance

Primary preserved source copies:

- decrypted/verified TCP-server protocol transcription: <https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/tools/solvers/ibotpeaches/other/2013_TCP_Server.md>
- preserved encrypted original: <https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/tools/solvers/ibotpeaches/messages/2013/tcp-server.asc>
- preserved 2013 server-testing log: <https://github.com/cicada-solvers/optimisticninja_cicada3301/blob/c895e6b3b43d06dd2071fdab12694f73c2805c12/2013/04.leaks/tclping/ping.txt>

The protocol transcription records a good signature from Cicada's established key fingerprint `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F`.

## NEXT is historical context, not recovered payload

The signed specification also defines `NEXT`, and historical test logs show Cicada invoked it on participant servers. Public mirrors preserve command-level testing rather than a source-authenticated missing payload for LP2. The protocol does not require NEXT to follow DH. Treat NEXT as historical context, not p16 plaintext or a missing-key assertion.

## Evidence boundary

Established:

1. the p15 Fibonacci/prime generator independently uses and reconstructs anchor3301;
2. the signed 2013 source contains the exact worked command `BASE29 3301 -> 3QO`;
3. ordinary positional conversion gives `3299=3QM` and `3301=3QO`;
4. the p15 conditional state tuple numerically matches the historical DH example.
5. independently of that descriptor-role map, the frozen p3/Q multiplication on p15 first-red yields `[23,8]`, whose canonical GP transliteration is exactly the signed request name `DH`; it is the sole printed complete-red request-name hit.

Conditional/post-discovery:

- calling generator offset2 `K`;
- naming the base29 digits with `e,B^-1,p-1,-g`;
- treating the DH tuple as independently recovered from the p15 descriptors.
- treating the post-discovery `DH` readout as proof that the polynomial quotient operation itself was authored.

Not established:

- an authored p15 instruction to serialize another object with BASE29;
- unknown LP2 body plaintext or key;
- a fresh held-out BASE29 manuscript consequence;
- a missing NEXT payload required for LP2.

The next useful BASE29 test must begin from a new source-visible consumer, not from relabeling the already solved 3301 generator.

Reproducers: [familywise source-only charge](../sims/lp2_p15_3301_base29_familywise_charge_sft.cjs) · [conditional historical arithmetic](../sims/lp2_p15_signed2013_tcp_dual_example_sft.cjs).
