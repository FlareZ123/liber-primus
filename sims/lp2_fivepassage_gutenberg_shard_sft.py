"""Five numbered Liber Primus passages: source-locked Gutenberg exact-crib search.

Reuses existing pinned Parquet source, GP29 orthography normalizer and
atomic file-locked JSON persistence from the prior quotation scanner.
"""
from __future__ import annotations
import os
from pathlib import Path
import lp2_quote_gutenberg_shard_sft as base

UNITS = {
  "1": (4,3,8,2,5,3,3,7,3,5,4,2,5,8,5,3,5,6,6,3,2,11,8,3,8,3,2,3,4,5),
  "2": (4,4,6,4,10,4,7,6,5,2,4,3,3,5,4,4,2,9,3,2),
  "3": (3,4,4,2,5,3,6,2,3,2,3,1,2,3,3,6,3,4,9,4,8,3,8,4,3),
  "4": (7,9,7,2,3,2,5,4,6,6,2,4,10,3,4,3,11,5,3),
  "5": (6,4,7,1,6,3,5,3,9,2,3,3,2,5,4,9,4,3,7,12,8,3,3,2,5,3,5,2)
}
# Reconstruct each word-length signature from the untouched original glyphs,
# including the original cross-page carry of numbered passage 4.
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
corpus=json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
physical=(ROOT/"resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf-8").split("%")
runes=set(corpus["runes"])
cuts=(
  ((36,99,238),),((37,0,91),),((37,91,189),),
  ((37,189,228),(38,0,57)),((38,57,186),)
)
def source_text(page:int,lo:int,hi:int)->str:
  text=physical[page if page<50 else page-1]
  positions=[i for i,glyph in enumerate(text) if glyph in runes]
  assert len(positions)==corpus["pages"][page]["runic_count"]
  assert 0<=lo<hi<=len(positions)
  return text[positions[lo]:positions[hi] if hi<len(positions) else len(text)]
def source_word_lengths(text:str)->tuple[int,...]:
  out=[]
  n=0
  for glyph in text:
    if glyph in runes: n+=1
    elif glyph in "-.assert [sum(x) for x in UNITS.values()]==[139,91,98,96,129]§" and n:
      out.append(n)
      n=0
  if n: out.append(n)
  return tuple(out)
for source_unit,segments in zip(UNITS.values(),cuts):
  text="".join(source_text(*part) for part in segments)
  assert source_word_lengths(text)==source_unit

assert [sum(x) for x in UNITS.values()]==[139,91,98,96,129]
assert [len(x) for x in UNITS.values()]==[30,20,25,19,28]
assert sum(map(sum,UNITS.values()))==553
# 8-word prefixes propose candidate quotations; 14-word prefixes are strong
# source-crits. Both are frozen at the five actual red numerical unit starts.
base.TARGETS={
  f"five_numbered_{number}_prefix{length}":tuple(words[:length])
  for number,words in UNITS.items() for length in (8,14)
}
base.PACKED={k:bytes(v) for k,v in base.TARGETS.items()}

if __name__=="__main__":
  base.selftest()
  for number,words in UNITS.items():
    fake=" ".join("Z"*n for n in words)
    _,hits,_=base.find_matches(fake,{"ID":int(number)})
    assert hits[f"five_numbered_{number}_prefix8"]>0
    assert hits[f"five_numbered_{number}_prefix14"]>0
  print("SFT PASS: five source-locked GP29 numbered unit signatures")
  raw=os.environ.get("LP2_GUTENBERG_SHARD")
  if raw is not None:
    report=base.run_shard(int(raw))
    report["task"]="Five source-locked original LP2 numbered passage word-length cribs"
    report["original_source_cuts"]=[
      [[36,99,238]],[[37,0,91]],[[37,91,189]],
      [[37,189,228],[38,0,57]],[[38,57,186]]
    ]
    report["original_unit_rune_lengths"]=[139,91,98,96,129]
    report["target_first8_and14"]=base.TARGETS
    output=Path(os.environ["LP2_GUTENBERG_OUTPUT"])
    base.save_json_atomic_locked(output,report)
