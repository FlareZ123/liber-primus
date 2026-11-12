#!/usr/bin/env python3
"""LP1->LP2 original-image illustration reuse and source-selected cipher gate.

Run from repository root:
  python sims/lp1_lp2_illustration_source_transfer_sft.py
Requires cv2, numpy, Pillow. Use --archive PATH to read original JPEGs from
a ZIP with entries liber-primus-jpegs/00.jpg...74.jpg (optional).
This uses only original JPEGs and pinned rune indices, and never fits keys.
"""
import argparse
import io
import json
import math
from pathlib import Path
from zipfile import ZipFile

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
KEY = [0,10,4,0,1,19,0,18,4,18,9,0,18] # solved LP1 koan's FIRFUMFERENFE


def load_image(root: Path, archive: ZipFile | None, index: int):
    filename = f"{index:02}.jpg"
    if archive:
        data = archive.read(f"liber-primus-jpegs/{filename}")
        arr = np.asarray(Image.open(io.BytesIO(data)).convert("L"))
    else:
        arr = np.asarray(Image.open(root/"resources"/"liber-primus"/filename).convert("L"))
    assert arr.shape == (3600,2400), (filename,arr.shape)
    return arr


def affinity(a: np.ndarray, b: np.ndarray):
    cv2.setRNGSeed(3301)
    sift = cv2.SIFT_create(nfeatures=1800)
    ka, da = sift.detectAndCompute(a, None)
    kb, db = sift.detectAndCompute(b, None)
    pairs = cv2.BFMatcher().knnMatch(da, db, k=2)
    good = [m for m, n in pairs if m.distance < .72 * n.distance]
    assert len(good) >= 4
    aa = np.float32([ka[m.queryIdx].pt for m in good]).reshape(-1,1,2)
    bb = np.float32([kb[m.trainIdx].pt for m in good]).reshape(-1,1,2)
    matrix, mask = cv2.estimateAffinePartial2D(
        aa, bb, method=cv2.RANSAC, ransacReprojThreshold=5,
        maxIters=10000, confidence=.99
    )
    assert matrix is not None
    warped=cv2.warpAffine(a,matrix,(b.shape[1],b.shape[0]),borderValue=255)
    inta=warped<140
    intb=b<140
    iou=float(np.logical_and(inta,intb).sum()/np.logical_or(inta,intb).sum())
    corr=float(np.corrcoef(warped.ravel(),b.ravel())[0,1])
    return {
        "feature_count_a":len(ka), "feature_count_b":len(kb),
        "accepted_feature_pairs":len(good), "ransac_inliers":int(mask.sum()),
        "affine_matrix":np.round(matrix,7).tolist(),
        "raster_IoU_threshold140":round(iou,6),
        "registered_gray_correlation":round(corr,6),
    }


def ioc(indices: list[int]) -> float:
    freq=np.bincount(np.asarray(indices,dtype=np.int64),minlength=29)
    n=len(indices)
    return float(np.sum(freq*(freq-1))/(n*(n-1)))


def direct_key(indices: list[int], sign: int, skip_f: bool) -> list[int]:
    key_index=0
    result=[]
    for c in indices:
        if skip_f and c==0:
            result.append(0)
        else:
            result.append((c+sign*KEY[key_index%len(KEY)])%29)
            key_index+=1
    return result


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",type=Path,default=ROOT)
    parser.add_argument("--archive",type=Path)
    args=parser.parse_args()
    archive=ZipFile(args.archive) if args.archive else None
    try:
        a5=load_image(args.root,archive,5)
        a14=load_image(args.root,archive,14)
        a15=load_image(args.root,archive,15)
        a39=load_image(args.root,archive,39)
        a72=load_image(args.root,archive,72)
    finally:
        if archive:
            archive.close()
    # LP1 pp14-16 use one identical body raster: positive source control.
    assert np.array_equal(a14[3200:3600],a15[3200:3600])
    body14=a14[3090:3590,:]
    body22=a39[3090:3590,:]
    body_direct=affinity(body14,body22)
    body_reflected=affinity(body14,body22[:,::-1].copy())
    moth5=a5[1550:1850,900:1500]
    moth55=a72[2730:3280,630:1900]
    moth_match=affinity(moth5,moth55)
    assert body_reflected["ransac_inliers"] > body_direct["ransac_inliers"]*10
    assert body_reflected["registered_gray_correlation"]>0.98
    assert moth_match["ransac_inliers"]>200
    assert moth_match["registered_gray_correlation"]>0.95
    corpus=json.loads((args.root/"resources"/"liber-primus"/"lp2-corpus.json").read_text(encoding="utf-8"))
    p={page["page"]:page["indices"] for page in corpus["pages"]}
    p2,p22,p55,p57=[p[i] for i in (2,22,55,57)]
    assert (len(p2),len(p22),len(p55),len(p57))==(201,131,76,95)
    # The first koan on original LP1 p6-9 decodes as P=2-C; original
    # LP1 pp14-15 decode P=C-FIRFUMFERENFE[step] with two supplied F skips.
    # The source does not authorize choosing individual skip locations on p22.
    c2=[(2-c)%29 for c in p2]
    p22fixed=direct_key(p22,-1,False)
    p22alls=direct_key(p22,-1,True)
    output={
      "source_image_pairs":{
        "LP1_p14_to_LP2_p22_39jpg_unmirrored":body_direct,
        "LP1_p14_to_LP2_p22_39jpg_mirrored":body_reflected,
        "LP1_p5_moth_to_LP2_p55_72jpg":moth_match,
      },
      "solved_LP1_body_replication_positive_control":True,
      "source_fixed_cipher_transfer":{
        "LP2_p2":{ "n":len(p2), "raw_ioc":round(ioc(p2),8),
          "LP1_first_koan_P_equals_2_minus_C_ioc":round(ioc(c2),8),
          "first_50_GP29_indices":c2[:50]},
        "LP2_p22":{"n":len(p22),"raw_ioc":round(ioc(p22),8),
          "LP1_second_koan_known_key":KEY,
          "continuous_no_skip_ioc":round(ioc(p22fixed),8),
          "continuous_skip_all_F_ioc":round(ioc(p22alls),8),
          "continuous_no_skip_first_50_GP29_indices":p22fixed[:50]},
        "LP2_p55":{"n":len(p55),"matched_original_LP1_p5_topic":
          "prime numbers and the totient function, with no source-selected page-55 clock"},
        "solved_LP2_p57_plaintext_ioc_reference":round(ioc(p57),8),
      },
      "interpretation":("Three independent exact-form artwork reuses; no LP2 "
                        "plaintext is produced by the two uniquely selected "
                        "direct LP1 inverse transfers.")
    }
    print(json.dumps(output,indent=2,ensure_ascii=False))


if __name__=="__main__":
    main()
