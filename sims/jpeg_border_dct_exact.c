#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>

/* Compare all page-specific DCT coefficients in the repeated LP2 pp40-55
   outer ornament regions. The first and last 520px Y bands are fixed;
   each Cb/Cr band conservatively covers the first/last 512 source pixels. */
typedef struct { int components; size_t sizes[3]; JCOEF *coeffs[3]; } Borders;

static Borders read_borders(const char *path) {
    FILE *file = fopen(path, "rb");
    if (!file) { perror(path); exit(2); }
    struct jpeg_decompress_struct decoder;
    struct jpeg_error_mgr error;
    decoder.err = jpeg_std_error(&error);
    jpeg_create_decompress(&decoder);
    jpeg_stdio_src(&decoder, file);
    jpeg_read_header(&decoder, TRUE);
    jvirt_barray_ptr *arrays = jpeg_read_coefficients(&decoder);
    Borders result = {0};
    result.components = decoder.num_components;
    for (int c = 0; c < result.components; c++) {
        jpeg_component_info *info = &decoder.comp_info[c];
        const JDIMENSION width = info->width_in_blocks;
        const JDIMENSION height = info->height_in_blocks;
        const JDIMENSION border = c == 0 ? 65 : 32;
        if (width < 2 * border) { fprintf(stderr, "bad size %s %d\n", path, c); exit(2); }
        const size_t n = (size_t)border * 2 * height * DCTSIZE2;
        JCOEF *values = malloc(n * sizeof(JCOEF));
        if (!values) exit(2);
        size_t offset = 0;
        for (JDIMENSION y = 0; y < height; y++) {
            JBLOCKARRAY row = (*decoder.mem->access_virt_barray)(
                (j_common_ptr)&decoder, arrays[c], y, 1, FALSE);
            for (JDIMENSION x = 0; x < width; x++) {
                if (x >= border && x < width - border) continue;
                memcpy(values + offset, row[0][x], DCTSIZE2 * sizeof(JCOEF));
                offset += DCTSIZE2;
            }
        }
        if (offset != n) exit(2);
        result.sizes[c] = n;
        result.coeffs[c] = values;
    }
    jpeg_finish_decompress(&decoder);
    jpeg_destroy_decompress(&decoder);
    fclose(file);
    return result;
}

static void destroy(Borders *border) {
    for (int c = 0; c < border->components; c++) free(border->coeffs[c]);
}

int main(int argc, char **argv) {
    if (argc != 17) {
        fprintf(stderr, "Expected 16 original pp40-55 JPEG filenames in page order\n");
        return 2;
    }
    Borders reference = read_borders(argv[1]);
    size_t tested[3] = {0}, different[3] = {0};
    int pages_per_component[3] = {0};
    for (int p = 1; p < argc; p++) {
        Borders page = read_borders(argv[p]);
        printf("%s components=%d", argv[p], page.components);
        for (int c = 0; c < page.components; c++) {
            if (page.sizes[c] != reference.sizes[c]) {
                fprintf(stderr, "component length mismatch: %d\n", c);
                return 2;
            }
            size_t differs = 0;
            for (size_t k = 0; k < page.sizes[c]; k++)
                differs += page.coeffs[c][k] != reference.coeffs[c][k];
            tested[c] += page.sizes[c];
            different[c] += differs;
            pages_per_component[c]++;
            printf(" component%d=%zu/%zu", c, differs, page.sizes[c]);
        }
        puts("");
        destroy(&page);
    }
    /* One-coefficient mutation must be detected even if all originals match. */
    JCOEF *plant = malloc(reference.sizes[0] * sizeof(JCOEF));
    if (!plant) return 2;
    memcpy(plant, reference.coeffs[0], reference.sizes[0] * sizeof(JCOEF));
    plant[reference.sizes[0] / 2]++;
    size_t planted = 0;
    for (size_t i = 0; i < reference.sizes[0]; i++)
        planted += plant[i] != reference.coeffs[0][i];
    free(plant);
    destroy(&reference);
    printf("SUMMARY luminance=%d-pages %zu/%zu different; Cb=%d-pages %zu/%zu; Cr=%d-pages %zu/%zu; plant=%zu\n",
           pages_per_component[0], different[0], tested[0], pages_per_component[1],
           different[1], tested[1], pages_per_component[2], different[2], tested[2], planted);
    return (different[0] || different[1] || different[2] || planted != 1) ? 1 : 0;
}
