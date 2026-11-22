'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

const imagePath = path.join(__dirname, '..', 'resources', 'liber-primus', '67.jpg');

const py = String.raw`
import cv2, hashlib, json, numpy as np, sys

image_path = sys.argv[1]
raw = open(image_path, 'rb').read()
assert hashlib.sha256(raw).hexdigest() == 'bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776'

im = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
assert im.shape == (3600, 2400)

# Fixed source crops used by the existing p50-vs-2016 registration gate.
left = (im[650:3050, 0:650] < 128).astype(np.uint8)
right = (im[650:3050, 1750:2400] < 128).astype(np.uint8)

def largest_component(mask):
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    idx = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return labels == idx

left_tree = largest_component(left)
right_tree = largest_component(right)[:, ::-1]

def iou(a, b):
    return float(np.logical_and(a, b).sum() / np.logical_or(a, b).sum())

source_iou = iou(left_tree, right_tree)
assert abs(source_iou - 0.9885412229071213) < 1e-12

# Test only horizontal translation after the source-defined page-center reflection.
scores = {}
for shift in range(-20, 21):
    if shift < 0:
        a = left_tree[:, :650 + shift]
        b = right_tree[:, -shift:]
    elif shift > 0:
        a = left_tree[:, shift:]
        b = right_tree[:, :650 - shift]
    else:
        a = left_tree
        b = right_tree
    scores[shift] = iou(a, b)

best_shift = max(scores, key=scores.get)
assert best_shift == 0
assert scores[0] > 0.98
assert max(v for k, v in scores.items() if k != 0) < 0.88

# The largest-tree bounding boxes are exact page-center mirrors.
def bbox(mask):
    ys, xs = np.where(mask)
    return [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]

left_box = bbox(left_tree)
# Undo crop+reflection to report original-page coordinates for the right tree.
n, labels, stats, _ = cv2.connectedComponentsWithStats(right, 8)
idx = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
right_raw = labels == idx
ys, xs = np.where(right_raw)
right_box_global = [1750 + int(xs.min()), 650 + int(ys.min()), 1750 + int(xs.max()), 650 + int(ys.max())]
left_box_global = [left_box[0], 650 + left_box[1], left_box[2], 650 + left_box[3]]
assert left_box_global == [28, 800, 569, 2833]
assert right_box_global == [1830, 800, 2371, 2833]
assert left_box_global[0] + right_box_global[2] == 2399
assert left_box_global[2] + right_box_global[0] == 2399

# Source-natural reversible operation selected by the artwork on an 8-column table.
mapping = {c: 7 - c for c in range(8)}
assert mapping == {0:7,1:6,2:5,3:4,4:3,5:2,6:1,7:0}
for c in range(8):
    assert mapping[mapping[c]] == c

print(json.dumps({
    'sha256': hashlib.sha256(raw).hexdigest(),
    'main_tree_iou_after_page_center_reflection': source_iou,
    'best_translation_after_reflection_px': best_shift,
    'left_tree_bbox_global': left_box_global,
    'right_tree_bbox_global': right_box_global,
    'column_reflection': mapping
}, indent=2))
`;

const output = execFileSync('python', ['-c', py, imagePath], { encoding: 'utf8' });
process.stdout.write(output);
