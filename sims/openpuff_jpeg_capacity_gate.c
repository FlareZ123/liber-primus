#include <errno.h>
#include <inttypes.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>
#include <setjmp.h>

#define FIRST_PAGE 17
#define LAST_PAGE 74
#define PAGE_COUNT (LAST_PAGE - FIRST_PAGE + 1)
#define OPENPUFF_OVERHEAD_BITS 2984
#define MEDIUM_DIVISOR 5

struct errctx { struct jpeg_error_mgr pub; jmp_buf jump; };
static void jpeg_fail(j_common_ptr c) {
    struct errctx *e = (struct errctx *)c->err;
    longjmp(e->jump, 1);
}
struct stats { uint64_t luma_ac, all_ac, luma_blocks; unsigned components; };

static int read_stats(const char *path, struct stats *s) {
    FILE *fp = fopen(path, "rb");
    if (!fp) { fprintf(stderr, "%s: %s\n", path, strerror(errno)); return 0; }
    struct jpeg_decompress_struct c;
    struct errctx e;
    memset(&c, 0, sizeof(c));
    c.err = jpeg_std_error(&e.pub);
    e.pub.error_exit = jpeg_fail;
    if (setjmp(e.jump)) {
        fprintf(stderr, "invalid JPEG: %s\n", path);
        jpeg_destroy_decompress(&c); fclose(fp); return 0;
    }
    jpeg_create_decompress(&c);
    jpeg_stdio_src(&c, fp);
    if (jpeg_read_header(&c, TRUE) != JPEG_HEADER_OK) {
        jpeg_destroy_decompress(&c); fclose(fp); return 0;
    }
    jvirt_barray_ptr *coef = jpeg_read_coefficients(&c);
    memset(s, 0, sizeof(*s));
    s->components = c.num_components;
    for (int ci = 0; ci < c.num_components; ci++) {
        jpeg_component_info *comp = &c.comp_info[ci];
        uint64_t nz = 0;
        if (ci == 0) s->luma_blocks = (uint64_t)comp->width_in_blocks * comp->height_in_blocks;
        for (JDIMENSION y = 0; y < comp->height_in_blocks; y++) {
            JBLOCKARRAY row = (*c.mem->access_virt_barray)((j_common_ptr)&c, coef[ci], y, 1, FALSE);
            for (JDIMENSION x = 0; x < comp->width_in_blocks; x++)
                for (int k = 1; k < DCTSIZE2; k++) if (row[0][x][k] != 0) nz++;
        }
        s->all_ac += nz;
        if (ci == 0) s->luma_ac = nz;
    }
    jpeg_destroy_decompress(&c); fclose(fp); return 1;
}

/* Conditional model, NOT an OpenPuff JPEG decoder:
   assume one whitened bit per nonzero luma AC coefficient. */
static uint64_t medium_capacity_bits(uint64_t whitened) {
    uint64_t plain = (whitened / 13) * 6;
    if (plain < OPENPUFF_OVERHEAD_BITS) return 0;
    return ((plain - OPENPUFF_OVERHEAD_BITS) / MEDIUM_DIVISOR) & ~UINT64_C(127);
}
static int cmp64(const void *a, const void *b) {
    uint64_t x=*(const uint64_t*)a, y=*(const uint64_t*)b;
    return (x>y)-(x<y);
}
int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "usage: %s <dir-with-17.jpg-through-74.jpg>\n", argv[0]); return 2;
    }
    uint64_t ys[PAGE_COUNT], alls[PAGE_COUNT], caps[PAGE_COUNT];
    uint64_t miny=UINT64_MAX,maxy=0,mina=UINT64_MAX,maxa=0,minc=UINT64_MAX,maxc=0;
    unsigned n=0,rgb=0,gray=0;
    puts("page,components,luma_blocks,luma_nonzero_ac,total_nonzero_ac,conditional_medium_capacity_bytes");
    for (unsigned p=FIRST_PAGE;p<=LAST_PAGE;p++) {
        char path[4096]; snprintf(path,sizeof(path),"%s/%02u.jpg",argv[1],p);
        struct stats s; if(!read_stats(path,&s)) return 1;
        uint64_t cap=medium_capacity_bits(s.luma_ac)/8; unsigned i=p-FIRST_PAGE;
        ys[i]=s.luma_ac; alls[i]=s.all_ac; caps[i]=cap;
        printf("%u,%u,%" PRIu64 ",%" PRIu64 ",%" PRIu64 ",%" PRIu64 "\n",
               p,s.components,s.luma_blocks,s.luma_ac,s.all_ac,cap);
        if(s.components==3) rgb++; if(s.components==1) gray++;
        if(s.luma_ac<miny)miny=s.luma_ac; if(s.luma_ac>maxy)maxy=s.luma_ac;
        if(s.all_ac<mina)mina=s.all_ac; if(s.all_ac>maxa)maxa=s.all_ac;
        if(cap<minc)minc=cap; if(cap>maxc)maxc=cap; n++;
    }
    qsort(ys,PAGE_COUNT,sizeof(uint64_t),cmp64);
    qsort(alls,PAGE_COUNT,sizeof(uint64_t),cmp64);
    qsort(caps,PAGE_COUNT,sizeof(uint64_t),cmp64);
    double medy=((double)ys[28]+ys[29])/2.0, meda=((double)alls[28]+alls[29])/2.0;
    double medc=((double)caps[28]+caps[29])/2.0;
    uint64_t bytes=745+10+(sizeof("magicsquares.txt")-1);
    uint64_t needbits=((bytes*8+127)&~UINT64_C(127));
    uint64_t needplain=OPENPUFF_OVERHEAD_BITS+needbits*MEDIUM_DIVISOR;
    uint64_t needwhite=((needplain+5)/6)*13;
    printf("SUMMARY pages=%u RGB=%u grayscale=%u luma_AC_min=%" PRIu64
           " luma_AC_median=%.1f luma_AC_max=%" PRIu64
           " all_AC_min=%" PRIu64 " all_AC_median=%.1f all_AC_max=%" PRIu64
           " conditional_capacity_min=%" PRIu64 " conditional_capacity_median=%.1f conditional_capacity_max=%" PRIu64
           " historical_record_bytes=%" PRIu64 " required_whitened_bits=%" PRIu64
           " required_fraction_of_min_luma_AC=%.6f\n",
           n,rgb,gray,miny,medy,maxy,mina,meda,maxa,minc,medc,maxc,bytes,needwhite,(double)needwhite/miny);
    return (n==58 && rgb==35 && gray==23)?0:1;
}
