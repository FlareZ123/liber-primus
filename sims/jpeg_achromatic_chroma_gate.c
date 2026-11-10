/*
 * Audit source LP2 JPEGs for pixel-neutral RGB pages with covert chroma DCT
 * coefficients. Requires libjpeg; run against original resources/liber-primus.
 *
 * The ten pages with <=4 RGB channel deviation have exactly five original
 * chroma coefficient fingerprints; no page-specific fingerprint exists.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>

#define MAX_IMAGES 58

typedef struct { int image; size_t n; JCOEF *values; size_t nonzero; } Extra;

static int visually_achromatic(const char *path, int *color) {
    FILE *input = fopen(path, "rb");
    if (!input) { perror(path); exit(2); }
    struct jpeg_decompress_struct d;
    struct jpeg_error_mgr err;
    d.err = jpeg_std_error(&err);
    jpeg_create_decompress(&d);
    jpeg_stdio_src(&d, input);
    jpeg_read_header(&d, TRUE);
    *color = d.num_components == 3;
    if (!*color) {
        jpeg_destroy_decompress(&d);
        fclose(input);
        return 0;
    }
    d.out_color_space = JCS_RGB;
    jpeg_start_decompress(&d);
    JSAMPARRAY row = (*d.mem->alloc_sarray)((j_common_ptr)&d, JPOOL_IMAGE, d.output_width * 3, 1);
    int achromatic = 1, max_deviation = 0;
    while (d.output_scanline < d.output_height) {
        jpeg_read_scanlines(&d, row, 1);
        for (JDIMENSION x = 0; x < d.output_width; x++) {
            JSAMPLE *pixel = row[0] + x * 3;
            int dr = abs((int)pixel[0] - pixel[1]);
            int db = abs((int)pixel[0] - pixel[2]);
            if (dr > max_deviation) max_deviation = dr;
            if (db > max_deviation) max_deviation = db;
            if (dr > 4 || db > 4) achromatic = 0;
        }
    }
    jpeg_finish_decompress(&d);
    jpeg_destroy_decompress(&d);
    fclose(input);
    if (achromatic) printf("RGB_NEUTRAL_DIFFERENCE %s max=%d\n", path, max_deviation);
    return achromatic;
}

static Extra load_chroma(const char *path, int image) {
    FILE *input = fopen(path, "rb");
    if (!input) { perror(path); exit(2); }
    struct jpeg_decompress_struct d;
    struct jpeg_error_mgr err;
    d.err = jpeg_std_error(&err);
    jpeg_create_decompress(&d);
    jpeg_stdio_src(&d, input);
    jpeg_read_header(&d, TRUE);
    if (d.num_components != 3) exit(2);
    jvirt_barray_ptr *coefficients = jpeg_read_coefficients(&d);
    size_t count = 0;
    for (int component = 1; component <= 2; component++)
        count += (size_t)d.comp_info[component].width_in_blocks
               * d.comp_info[component].height_in_blocks * DCTSIZE2;
    JCOEF *values = malloc(count * sizeof(JCOEF));
    if (!values) exit(2);
    size_t position = 0, nonzero = 0;
    for (int component = 1; component <= 2; component++) {
        jpeg_component_info *info = &d.comp_info[component];
        for (JDIMENSION y = 0; y < info->height_in_blocks; y++) {
            JBLOCKARRAY row = (*d.mem->access_virt_barray)(
                (j_common_ptr)&d, coefficients[component], y, 1, FALSE);
            for (JDIMENSION x = 0; x < info->width_in_blocks; x++) {
                for (int k = 0; k < DCTSIZE2; k++) {
                    JCOEF v = row[0][x][k];
                    values[position++] = v;
                    nonzero += v != 0;
                }
            }
        }
    }
    if (position != count) exit(2);
    jpeg_finish_decompress(&d);
    jpeg_destroy_decompress(&d);
    fclose(input);
    Extra result = {image, count, values, nonzero};
    return result;
}

int main(int argc, char **argv) {
    const char *directory = argc == 2 ? argv[1] : "resources/liber-primus";
    char path[1024];
    Extra chroma[MAX_IMAGES] = {0};
    int n = 0, rgb = 0, gray = 0;
    for (int page = 17; page <= 74; page++) {
        snprintf(path, sizeof(path), "%s/%02d.jpg", directory, page);
        int color = 0;
        int neutral = visually_achromatic(path, &color);
        rgb += color;
        gray += !color;
        if (!neutral) continue;
        chroma[n] = load_chroma(path, page);
        printf("ACHROMATIC_RGB JPEG=%02d LP2=%02d nonzero_chroma=%zu\n",
               page, page - 17, chroma[n].nonzero);
        n++;
    }
    printf("MODE_COUNT RGB=%d grayscale=%d achromatic_RGB=%d\n", rgb, gray, n);
    int group_count = 0, groups[MAX_IMAGES] = {0};
    for (int i = 0; i < n; i++) {
        if (groups[i]) continue;
        group_count++;
        groups[i] = group_count;
        printf("CHROMA_GROUP %d JPEGs=%02d", group_count, chroma[i].image);
        for (int j = i + 1; j < n; j++) {
            if (chroma[i].n == chroma[j].n &&
                memcmp(chroma[i].values, chroma[j].values, chroma[i].n * sizeof(JCOEF)) == 0) {
                groups[j] = group_count;
                printf(",%02d", chroma[j].image);
            }
        }
        printf(" nonzero=%zu\n", chroma[i].nonzero);
    }
    int plant_detected = 0;
    if (n) {
        JCOEF *plant = malloc(chroma[0].n * sizeof(JCOEF));
        if (!plant) return 2;
        memcpy(plant, chroma[0].values, chroma[0].n * sizeof(JCOEF));
        plant[chroma[0].n / 2]++;
        for (size_t i = 0; i < chroma[0].n; i++)
            plant_detected += plant[i] != chroma[0].values[i];
        free(plant);
    }
    for (int i = 0; i < n; i++) free(chroma[i].values);
    printf("SUMMARY RGB=%d grayscale=%d neutral_RGB=%d exact_chroma_groups=%d planted_changes=%d\n",
           rgb, gray, n, group_count, plant_detected);
    return (rgb == 35 && gray == 23 && n == 10 && group_count == 5 && plant_detected == 1) ? 0 : 1;
}
