# Agent9: new p0 WILL recovery at 141..144 from the DEVOTED -> YOU self-index receiver

The new receiver selected by the LEAD82 downstream route now has an exact value-changing inverse.

Receiver selection, fixed before the inverse family:

\`\`\`text
GP0(DEVOTED)=102 -> p50=32 -> signed word32 YOU
GP0(YOU)=30 -> p50/base60=141 -> p0 zero-based word32
\`\`\`

The selected p0 word is offsets141..144, length4. The next authenticated signed word after YOU is WILL, also four GP runes.

Using only the frozen split H packet and established DH23 state:

\`\`\`text
split[a=6] = 12
split[A=8] = 6
H(A=8,B=19) = [18,27]

key = [12,6,18,27]
cipher [19,16,9,18] - key mod29
      = [7,10,20,20] = WILL
\`\`\`

Family control:
- both selected packets;
- any ordered DH state pair for the two one-based packet lookups;
- any ordered DH state pair for H;
- both signs;
- every distinct authenticated signed four-rune word target.

**1 hit / 9,604 configurations: exactly split(a,A)+H(A,B), subtraction -> WILL.**

Adding zero-based packet origin gives 16,660 valid configurations and only one extra hit, ROAD under whole/zero; that origin conflicts with the already frozen packet semantics.

Classification: conditional value-changing recovery. Receiver and WILL candidate were selected before the key-family scan. Upstream DEVOTED and READOUT remain conditional.

Report: \`im-results/lp2-p0-you-will-packet-dh-inverse.md\`
SFT: \`sims/lp2_p0_you_will_packet_dh_inverse_sft.cjs\`
