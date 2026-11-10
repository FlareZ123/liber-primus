"""Reproduce exact five-dot stencil reuse in original LP2 JPEG images.

Run at repository root: python sims/black_dot_reflection.py
Requires numpy and opencv-python(-headless). Read-only.
"""
from __future__ import annotations

import itertools
import json
import math
from pathlib import Path

import cv2
import numpy as np

IMAGE_DIR = Path(__file__).resolve().parent.parent / 'resources' / 'liber-primus'


def image_and_dots(path: Path) -> tuple[np.ndarray, list[tuple[float, float]]]:
    image = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise FileNotFoundError(path)
    _, _, stats, centers = cv2.connectedComponentsWithStats(
        (image < 70).astype(np.uint8), connectivity=8
    )
    dots = []
    for i in range(1, len(stats)):
        _, _, width, height, area = (int(v) for v in stats[i])
        if (60 <= width <= 80 and 60 <= height <= 80
                and 2900 <= area <= 3800
                and area / (width * height) >= 0.55):
            dots.append((float(centers[i, 0]), float(centers[i, 1])))
    dots.sort()
    return image, dots


def orientation_fits(source: list[tuple[float, float]],
                     target: list[tuple[float, float]]) -> list[dict]:
    """Fit each axis flip and translate, searching all 5! correspondences."""
    assert len(source) == len(target) == 5
    results = []
    for flip_x, flip_y in itertools.product((1, -1), repeat=2):
        best = None
        for order in itertools.permutations(range(5)):
            tx = sum(target[j][0] - flip_x * source[i][0]
                     for i, j in enumerate(order)) / 5
            ty = sum(target[j][1] - flip_y * source[i][1]
                     for i, j in enumerate(order)) / 5
            errors = [math.hypot(
                flip_x * x + tx - target[j][0],
                flip_y * y + ty - target[j][1]
            ) for i, ((x, y), j) in enumerate(zip(source, order))]
            candidate = {
                'flip_x': flip_x, 'flip_y': flip_y,
                'translation': [tx, ty],
                'rms_px': math.sqrt(sum(e * e for e in errors) / 5),
                'max_error_px': max(errors), 'assignment': list(order)
            }
            if best is None or candidate['rms_px'] < best['rms_px']:
                best = candidate
        results.append(best)
    return sorted(results, key=lambda entry: entry['rms_px'])


def patch(image: np.ndarray, center: tuple[float, float]) -> np.ndarray:
    x, y = (round(v) for v in center)
    return image[y - 44:y + 45, x - 44:x + 45] < 70


def matched_dot_iou(source_image: np.ndarray, target_image: np.ndarray,
                    source: list[tuple[float, float]],
                    target: list[tuple[float, float]], fit: dict) -> list[float]:
    values = []
    for i, j in enumerate(fit['assignment']):
        a = patch(source_image, source[i])
        b = patch(target_image, target[j])
        if fit['flip_x'] == -1:
            b = np.fliplr(b)
        if fit['flip_y'] == -1:
            b = np.flipud(b)
        values.append(float(np.count_nonzero(a & b) / np.count_nonzero(a | b)))
    return values


def main() -> dict:
    cv2.setNumThreads(2)
    occurrences = {}
    images = {}
    for number in range(17, 75):
        image, dots = image_and_dots(IMAGE_DIR / f'{number:02d}.jpg')
        if dots:
            occurrences[number] = dots
            images[number] = image
    assert {page: len(dots) for page, dots in occurrences.items()} == {
        24: 5, 40: 5, 50: 3, 73: 5
    }, 'The compact black-dot census has changed'
    comparisons = {}
    for page, expected_flips in [(40, (1, -1)), (73, (-1, 1))]:
        fits = orientation_fits(occurrences[24], occurrences[page])
        best = fits[0]
        assert (best['flip_x'], best['flip_y']) == expected_flips
        assert best['rms_px'] < 0.5 and fits[1]['rms_px'] > 100
        iou = matched_dot_iou(images[24], images[page],
                              occurrences[24], occurrences[page], best)
        assert min(iou) > 0.90
        comparisons[f'24_to_{page}'] = {
            **best, 'second_best_rms_px': fits[1]['rms_px'],
            'dot_mask_iou': iou
        }
    return {
        'source': 'Original JPEG files 17.jpg through 74.jpg',
        'threshold': 'gray<70; 60..80 px width/height; 2900..3800 dark pixels',
        'occurrences': {
            str(page): [[round(x, 3), round(y, 3)] for x, y in dots]
            for page, dots in occurrences.items()
        },
        'comparisons': comparisons,
        'interpretation': 'Five-dot geometric template reuse; key significance unknown'
    }


if __name__ == '__main__':
    print(json.dumps(main(), indent=2))
