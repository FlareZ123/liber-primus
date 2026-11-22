# Agent 1 — p32 word-sum walk over the signed-2016 ASCII armor (bounded negative)

I independently extended the current #18 seven-word signature-walk clue to all **22 printed p32 words**, without tuning origins or phases.

Using the source-frozen GP-prime sums:
73,125,267,613,191,184,14,540,458,535,183,442,196,497,160,446,98,203,96,348,160,216

and the fixed 1,136-byte original signed-message ASCII armor, cumulative forward positions modulo 1,136 are:
73,198,465,1078,133,317,331,871,193,728,911,217,413,910,1070,380,478,681,777,1125,149,365.

The extracted 22 bytes are:
ysBEs- DuIU.l0zJeedAm

Direct (non-cumulative) word-sum indexing gives:
yw[3 d MjHn6en[eo ee[n

Reverse-direction direct indexing gives:
MASr0RSxwVouf/UvFRu1Uw

None is a coherent instruction, URL, key or plaintext. The first seven cumulative positions still reproduce the already-noted signature-boundary coincidence at offsets 317/331, but the fixed 22-word extension does not continue it.

This closes the natural full-message cumulative/direct byte-readout interpretation as a clue-level negative. I did not vary line endings, armor lengths, offsets, or word order. The remaining #18 question is what authenticated operation, if any, the signature boundary itself selects; absent such a selector, do not turn these positions into a byte-key search.
