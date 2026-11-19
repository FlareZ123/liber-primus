# P0 141..144: conditional WILL recovery from the DEVOTED -> YOU self-index receiver

**Agent9, 19 November 2026. Classification: conditional value-changing plaintext recovery on a prospectively selected p0 receiver. The receiver and the candidate word WILL were selected before the packet/H inverse family was charged. Upstream DEVOTED and READOUT packet interpretations remain conditional.**

## Decision

Retain **WILL** as a substantially strengthened p0 plaintext candidate at offsets **141..144**.

The route is:

\`\`\`text
candidate DEVOTED
  -> GP0 102
  -> p50/base60 32
  -> authenticated signed word32 YOU
  -> GP0 30
  -> p50/base60 141
  -> p0 zero-based word32, offsets141..144

signed word immediately after YOU = WILL
WILL has exactly four GP runes, matching the selected receiver

ciphertext p0[141..144] = [19,16,9,18]
fixed split-packet/DH key = [12,6,18,27]
subtract -> [7,10,20,20] = WILL
\`\`\`

The value-changing key is built only from already selected state objects:

\`\`\`text
split[a] = split[6] = 12          (one-based packet index)
split[A] = split[8] = 6
H(A,B) = H(8,19) = [18,27]

key = [split[a], split[A], H(A,B)]
    = [12,6,18,27]
\`\`\`

where the existing reversible operation is:

\`\`\`text
H(x,y) = (x-y, x+y) mod29.
\`\`\`

Exact inverse and forward reconstruction:

\`\`\`text
[19,16,9,18] - [12,6,18,27] mod29
  = [7,10,20,20]
  = W I L L

[7,10,20,20] + [12,6,18,27] mod29
  = [19,16,9,18].
\`\`\`

## Receiver chronology

The p0 word at141 was selected without using its four ciphertext values in the selection rule.

The upstream LEAD82 route had already produced a downstream holdout:

\`\`\`text
GP0(DEVOTED)=102
p50[102]=32
signed word[32]=YOU
GP0(YOU)=30
p50[30]=141
\`\`\`

A complete 43-signed-word census over base60/base59 and zero/one origin showed that **YOU under base60/zero is the sole signed word whose GP0 lands at the start of the same zero-based p0 word ordinal**. That receiver selection is documented in \`lp2-p0-lead82-as-epiphany-chain.md\`.

After the receiver was fixed, its length was observed to be four. The next authenticated signed word after YOU is **WILL**, whose canonical GP representation is also four runes:

\`\`\`text
WILL = [W,I,L,L] = [7,10,20,20].
\`\`\`

Thus WILL was a source-sequence candidate before the packet/H inverse family below was charged.

## Frozen cryptographic sources

The two source-selected 23-rune center-F receivers already define two fixed H-shell packets:

\`\`\`text
split READ|OUT packet p0 80..102:
[19,23,25,4,16,12,9,6,10,14,15,8,24,5,21,5,28,26,22,9,0,18,2]

whole READOUT packet p0 166..188:
[15,8,22,10,11,15,10,2,13,8,28,15,14,8,20,12,9,4,25,4,7,24,19]
\`\`\`

The already reconstructed standard DH23 state is:

\`\`\`text
p=23, g=5, a=6, b=15, A=8, B=19, K=2.
\`\`\`

The packet cascade independently fixed **one-based** indexing. In particular, the split packet's one-based \`(A,K)\` selector produces \`[a,p]\`, the whole packet's same selector produces \`[K,A]\`, and the combined cascade closes a standard DH exchange.

No new packet, DH field, index origin, or H sign is invented for the WILL inverse.

## Charged family: 9,604 fixed-origin configurations, one hit

To measure how much freedom remains in the observed formula, charge a deliberately broader family than the exact construction.

For each of the two already selected packets:

1. choose any ordered DH state field for the first one-based packet lookup;
2. choose any ordered DH state field for the second one-based packet lookup;
3. choose any ordered pair of DH state fields as the H input;
4. concatenate the two lookup outputs with the two H outputs to form a four-rune key;
5. test both addition and subtraction.

There are:

\`\`\`text
2 packets × 7² lookup selectors × 7² H pairs × 2 signs
= 9,604 configurations.
\`\`\`

The plaintext target family is every **distinct authenticated 2016 signed word represented by exactly four GP runes**. There are nine distinct rune sequences:

\`\`\`text
LIES, THEIR, MEANING, ROAD, SEEK, WILL, GOOD, LUCK, PATHS
\`\`\`

Across all 9,604 configurations, exactly **one** hits any member of that target family:

\`\`\`text
packet   = split
lookups  = (a,A)
H pair   = (A,B)
sign     = subtraction
key      = [12,6,18,27]
target   = WILL
\`\`\`

This does not make 1/9,604 an authorship probability. The family was formulated after WILL had become the source-sequence candidate. Its value is structural: the exact source-state construction is isolated even after granting every same-form DH selector.

## Packet-origin control

The already established packet mechanism is one-based. As a control, widen the family to include zero-based packet indexing while changing nothing else.

Because zero-based index23 is out of range, the widened family contains **16,660** valid configurations. Exactly two signed four-rune target hits appear:

1. the intended one-based split construction above, yielding **WILL**;
2. a whole-packet **zero-based** construction yielding **ROAD** with key \`[15,13,14,24]\`.

The second hit violates the frozen one-based packet convention. Under the source-selected packet semantics, WILL remains the sole hit.

## Why this advances the solve

This is a new value-changing recovery on untouched p0 ciphertext selected by a downstream navigation rule before its contents were used.

It also extends a coherent authenticated 2016 vocabulary chain:

\`\`\`text
... PATH -> EPIPHANY -> DEVOTED -> YOU -> WILL ...
\`\`\`

The first three items come from the LEAD82/PATH-number route and the pre-existing DEVOTED receiver. The new self-index edge selects YOU, and the next signed word supplies WILL. The packet/H inverse then converts original ciphertext to WILL exactly.

The strongest remaining objection is upstream dependence. DEVOTED is still a conditional candidate rather than independently authenticated plaintext, and the READ OUT packet interpretation remains conditional. The WILL inverse therefore belongs in \`im-results/\` rather than authoritative \`results/\`.

The next decisive test is to use the recovered WILL or its fixed key **without reading later candidate plaintext** to select another original receiver or predict another key. Avoid enlarging the packet/H family after this hit.

## Reproduction

Run:

\`\`\`text
node sims/lp2_p0_you_will_packet_dh_inverse_sft.cjs
\`\`\`

The SFT derives the receiver from DEVOTED -> YOU, reconstructs both H packets from the original p0 transcription, performs the exact WILL inverse and re-encryption, enumerates all 9,604 frozen one-based family configurations, and checks the 16,660-configuration origin control.
