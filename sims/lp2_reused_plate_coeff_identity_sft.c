/* Read-only comparison of original quantized luma DCT blocks in exact LP2 art copies. */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>

typedef struct {
    unsigned width, height, bw, bh;
    uint16_t q[64];
    JCOEF *coef;
} Image;

static int load_image(const char *path, Image *im) {
    FILE *fp = fopen(path, "rb");
    if (!fp) { perror(path); return 0; }
    struct jpeg_decompress_struct c;
    struct jpeg_error_mgr e;
    c.err = jpeg_std_error(&e);
    jpeg_create_decompress(&c);
    jpeg_stdio_src(&c, fp);
    if (jpeg_read_header(&c, TRUE) != JPEG_HEADER_OK) return 0;
    jvirt_barray_ptr *arrays = jpeg_read_coefficients(&c);
    jpeg_component_info *y = &c.comp_info[0];
    im->width = c.image_width; im->height = c.image_height;
    im->bw = y->width_in_blocks; im->bh = y->height_in_blocks;
    JQUANT_TBL *qt = c.quant_tbl_ptrs[y->quant_tbl_no];
    if (!qt) return 0;
    for (int k=0;k<64;k++) im->q[k] = qt->quantval[k];
    size_t n = (size_t)im->bw * im->bh * 64;
    im->coef = malloc(n * sizeof(JCOEF));
    if (!im->coef) return 0;
    for (JDIMENSION row=0; row<y->height_in_blocks; row++) {
        JBLOCKARRAY blocks = (*c.mem->access_virt_barray)(
            (j_common_ptr)&c, arrays[0], row, 1, FALSE);
        for (JDIMENSION col=0; col<y->width_in_blocks; col++) {
            size_t base = ((size_t)row * im->bw + col) * 64;
            memcpy(im->coef + base, blocks[0][col], 64 * sizeof(JCOEF));
        }
    }
    jpeg_finish_decompress(&c);
    jpeg_destroy_decompress(&c);
    fclose(fp);
    return 1;
}

static int compare_roi(const char *label, const Image *a, const Image *b,
                       unsigned x0, unsigned y0, unsigned x1, unsigned y1,
                       size_t expected_blocks) {
    if (a->width!=2400 || b->width!=2400 || a->height!=3600 || b->height!=3600 ||
        a->bw!=300 || b->bw!=300 || a->bh!=450 || b->bh!=450 ||
        ((x0|y0|x1|y1)&7) || x0>=x1 || y0>=y1 || x1>2400 || y1>3600 ||
        memcmp(a->q,b->q,sizeof(a->q))) return 0;
    size_t blocks=(size_t)((x1-x0)/8)*((y1-y0)/8);
    if (blocks!=expected_blocks) return 0;
    size_t diff_blocks=0, diff_coeffs=0;
    int max_delta=0;
    for (unsigned by=y0/8; by<y1/8; by++) for (unsigned bx=x0/8; bx<x1/8; bx++) {
        size_t base=((size_t)by*a->bw+bx)*64;
        int changed=0;
        for (int k=0;k<64;k++) {
            int d=(int)a->coef[base+k]-(int)b->coef[base+k];
            if (d) { changed=1; diff_coeffs++; if (abs(d)>max_delta) max_delta=abs(d); }
        }
        diff_blocks += (size_t)changed;
    }
    printf("%s: blocks=%zu coefficients=%zu differing_blocks=%zu differing_coefficients=%zu max_abs_delta=%d exact=%s\n",
           label,blocks,blocks*64,diff_blocks,diff_coeffs,max_delta,diff_coeffs?"NO":"YES");
    return diff_coeffs==0;
}

static void free_image(Image *im) { free(im->coef); im->coef=NULL; }
static int path(char *out,size_t n,const char *root,unsigned scan) {
    int k=snprintf(out,n,"%s/%02u.jpg",root,scan); return k>0 && (size_t)k<n;
}

int main(int argc,char **argv) {
    if (argc!=2) { fprintf(stderr,"usage: %s resources/liber-primus\n",argv[0]); return 2; }
    char pa[1024],pb[1024]; Image a={0},b={0}; int ok=1;
    if (!path(pa,sizeof(pa),argv[1],18)||!path(pb,sizeof(pb),argv[1],19)||
        !load_image(pa,&a)||!load_image(pb,&b)) return 2;
    ok &= compare_roi("p1/p2 exact left cross",&a,&b,0,904,448,2648,12208);
    free_image(&a); free_image(&b);
    if (!path(pa,sizeof(pa),argv[1],41)||!path(pb,sizeof(pb),argv[1],43)||
        !load_image(pa,&a)||!load_image(pb,&b)) return 2;
    ok &= compare_roi("p24/p26 exact left insect plate",&a,&b,0,1000,520,2600,13000);
    ok &= compare_roi("p24/p26 exact right insect plate",&a,&b,1800,1000,2400,2600,15000);
    free_image(&a); free_image(&b);
    if (!ok) return 1;
    puts("PASS: fixed source-exact regions have identical original quantized luma DCT coefficients.");
    return 0;
}
