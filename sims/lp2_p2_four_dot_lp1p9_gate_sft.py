#!/usr/bin/env python3
"""Original LP2 p2 four-dot and solved LP1 p9 'FOUR' selector gate.

Run from a checkout: python sims/lp2_p2_four_dot_lp1p9_gate_sft.py
Reads 19.jpg original pixel ink, source-derived LP2 punctuation event coordinates,
full p2 rune indices, and the saved solved LP1 p9 text. No ciphertext search.
"""
import json
from pathlib import Path
import cv2
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
CORPUS=ROOT/"resources"/"liber-primus"/"lp2-corpus.json"
PUNCT=ROOT/"resources"/"liber-primus"/"lp2-punctuation-identity.json"
LP1=ROOT/"resources"/"liber-primus"/"lp1-plaintext-reference.txt"
RUNES="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"


def main():
    corpus=json.loads(CORPUS.read_text(encoding="utf-8"))
    inventory=json.loads(PUNCT.read_text(encoding="utf-8"))
    page=next(p for p in corpus["pages"] if p["page"]==2)
    assert page["runic_count"]==len(page["indices"])==201
    mark=[e for e in inventory["events"] if e["page"]==2]
    assert [(e["local_rune_offset"],e["symbol"]) for e in mark]==[
        (3,"⁘"),(201,"⁜")
    ]
    assert len([e for e in inventory["events"] if e["symbol"]=="⁘"])==145
    lp1=LP1.read_text(encoding="utf-8")
    assert "DO FOUR UNREASONABLE THINGS EACH DAY" in lp1
    image=cv2.imread(str(ROOT/"resources"/"liber-primus"/"19.jpg"),cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape==(3600,2400)
    x0,x1,y0,y1=775,830,700,755
    roi=(image[y0:y1,x0:x1]<150).astype(np.uint8)
    count,labels,stats,center=cv2.connectedComponentsWithStats(roi,8)
    dots=[]
    for i in range(1,count):
        x,y,w,h,area=map(int,stats[i])
        if 7<=w<=11 and 7<=h<=11 and 50<=area<=115 and .75<=w/h<=1.25:
            dots.append({"x":x0+x,"y":y0+y,"width":w,"height":h,"area":area})
    dots.sort(key=lambda q:(q["y"],q["x"]))
    assert [(d["x"],d["y"]) for d in dots]==[
        (799,708),(783,725),(814,725),(799,742)
    ],dots
    # Bounding-box diagram: one upper dot, two middle, one lower.
    assert [d["y"] for d in dots]==[708,725,725,742]
    a=page["indices"]
    print(json.dumps({
        "authenticated_LP1_p9_instruction":"DO FOUR UNREASONABLE THINGS EACH DAY",
        "source_LP2_page":2,"original_jpeg":"19.jpg",
        "four_dot_printed_geometry":dots,
        "four_dot_event_rune_offset":3,
        "prefix_three_runic_indices":a[:3],
        "prefix_three_runes":"".join(RUNES[v] for v in a[:3]),
        "four_runes_immediately_after_mark":"".join(RUNES[v] for v in a[3:7]),
        "rest_of_page_runes":len(a)-3,
        "section_13dot_end_event_rune_offset":201,
        "transcription_inventory_four_dot_events_all_LP2":145,
        "caveat":"Four of the source inventory's p15 small marks are editorial rather than physical, so this 145-count is an upper bound on printed four-dot instances.",
        "decision":"One normal punctuation mark is present; the source fixes no key, nonlocal extraction, direction, transform or forward encoder."
    },ensure_ascii=False,indent=2))


if __name__=="__main__":
    main()
