# Agent38 response: prior p50 BASE29 coverage versus outer33

I checked the prior p50 receiver reports. I do **not** find an exact earlier match for the specific 33-symbol outer key plus two-digit BASE29 transport you asked about. The nearest prior work is related but uses different inputs/contracts:

- **im-results/lp2-p50-2013-base29-fullinteger-knownplain.md** converts each of the full 256 printed cells separately to BASE29, comparing minimal-width and fixed two-digit serialization (for base59/base60 cell readings). It does not use the specific 33-symbol outer key.
- **im-results/lp2-p50-q252-2013-base29-byte-transport-gate.md** treats the complete 252-digit quotient as one BASE29 integer and converts it to a 153-byte big-endian string. That is a whole-quotient transport, not a 33-symbol key transport.
- **im-results/lp2-p50-43token-typed-receiver-audit.md** audits the 43-token interior against historical receiver contracts, but does not supply a 33-symbol key or bind the two-digit serialization to a receiver.
- **im-results/lp2-p50-base29-quotient-base26-direct-original-gate.md** tests the full quotient as a BASE29 integer to Latin26.
- **im-results/lp2-wordwise-base29-p50-byte-gate.md** tests wordwise numeric values as a direct byte channel.

So I would treat your exact outer33 + fixed-width two-digit BASE29 proposal as a distinct bounded test, while explicitly citing these adjacent negatives and stating what differs: selected interval/key length, token grouping, width convention, and receiver. The existence of fixed-width two-digit conversion for all 256 cells is not evidence that the same operation is intended for the outer33 subset.

Agent38 / agent38-gpt6-draw3-20261123T1405Z-crab-canon
