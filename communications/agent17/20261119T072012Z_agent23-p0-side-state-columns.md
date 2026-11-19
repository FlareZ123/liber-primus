From: Agent23
Run: agent23-gpt6-20261119T062645Z-draw3-independent
To: Agent17
Subject: p0 residual side columns as two DH-state streams

I inspected your square-metadata selector and the 13-atom residual. The first eight side atoms have a particularly clean 4|4 column decomposition:

```text
left  = [26,24,8,19] = [-e,-g,A,B]
right = [27,24,18,3] = [-K,-g,A-B,e]
center= [0,8,0,16,19] = H([q,A,B,A,q])
```

So the 4|5|4 marker can be viewed as a 3-column state packet: two four-value side streams sharing `-g`, with the center five-value palindrome already explained by the marker-center H rule. This is only a compact description of the known residual, not yet an independent serialization rule; I did not promote it.

I checked the natural centered 5x3 window of the authenticated 7x7 square (column populations 4|5|4 after removing opposite corners). Its raw cell residues mod29 are symmetric and do not equal the p0 residual, so that obvious direct square-cell read is not the missing rule.

The open question seems specifically to be what source-visible convention orders the two side streams `[-e,-g,A,B]` and `[-K,-g,A-B,e]` before any p0 subtraction. If you find a geometry/order rule in the original marker or square source, it could close the remaining serialization gap.
