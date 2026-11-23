/*
 * LP2 p40--55 identical outer-margin JPEG DCT coefficient test.
 * C11 and system libjpeg; run in repository root with originals present.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>

typedef struct {
  int width,height,components;
  int bw[3],bh[3];
  JCOEF *plane[3];
} Frame;

static int in_border(int x,int y,int pitch) {
  return x*pitch+pitch-1<591 || x*pitch>1831 ||
    y*pitch+pitch-1<624 || y*pitch>3183;
}
static Frame read_frame(const char *filename) {
  Frame frame={0};
  FILE *fp=fopen(filename,"rb");
  if(!fp){perror(filename);exit(2);}
  struct jpeg_decompress_struct j;
  struct jpeg_error_mgr e;
  j.err=jpeg_std_error(&e);
  jpeg_create_decompress(&j);
  jpeg_stdio_src(&j,fp);
  jpeg_read_header(&j,TRUE);
  frame.width=j.image_width;frame.height=j.image_height;
  frame.components=j.num_components;
  jvirt_barray_ptr *coeffs=jpeg_read_coefficients(&j);
  for(int i=0;i<frame.components;i++) {
    int width=j.comp_info[i].width_in_blocks;
    int height=j.comp_info[i].height_in_blocks;
    frame.bw[i]=width;frame.bh[i]=height;
    frame.plane[i]=malloc((size_t)width*height*DCTSIZE2*sizeof(JCOEF));
    if(!frame.plane[i])exit(3);
    for(int y=0;y<height;y++) {
      JBLOCKARRAY line=(*j.mem->access_virt_barray)(
        (j_common_ptr)&j,coeffs[i],y,1,FALSE);
      for(int x=0;x<width;x++)memcpy(
        frame.plane[i]+((size_t)y*width+x)*DCTSIZE2,
        line[0][x],DCTSIZE2*sizeof(JCOEF));
    }
  }
  jpeg_destroy_decompress(&j);
  fclose(fp);
  return frame;
}
static void free_frame(Frame *frame){
  for(int i=0;i<frame->components;i++)free(frame->plane[i]);
}
static uint64_t compare_border(const Frame *ref,const Frame *other,
                               int component,int pitch) {
  if(ref->bw[component]!=other->bw[component] ||
     ref->bh[component]!=other->bh[component])exit(4);
  uint64_t compared=0;
  int width=ref->bw[component],height=ref->bh[component];
  for(int y=0;y<height;y++)for(int x=0;x<width;x++){
    if(!in_border(x,y,pitch))continue;
    size_t start=((size_t)y*width+x)*DCTSIZE2;
    for(int k=0;k<DCTSIZE2;k++){
      if(ref->plane[component][start+k] !=
         other->plane[component][start+k]) {
        fprintf(stderr,"JPEG raw coefficient mismatch plane%d block%d,%d coeff%d\n",
          component,x,y,k);
        exit(5);
      }
      compared++;
    }
  }
  return compared;
}
int main(void) {
  Frame baseline={0};
  uint64_t luminance=0,chroma=0;
  int rgbCount=0,grayCount=0;
  for(int page=40;page<=55;page++){
    char filename[128];
    snprintf(filename,sizeof(filename),
      "resources/liber-primus/%d.jpg",page+17);
    Frame frame=read_frame(filename);
    if(frame.width!=2400||frame.height!=3600||
       (frame.components!=1&&frame.components!=3))exit(6);
    if(page==40){if(frame.components!=3)exit(7);baseline=frame;continue;}
    luminance+=compare_border(&baseline,&frame,0,8);
    if(frame.components==3){
      rgbCount++;
      for(int c=1;c<=2;c++)
        chroma+=compare_border(&baseline,&frame,c,16);
    }else grayCount++;
    free_frame(&frame);
  }
  if(luminance!=81676800||chroma!=10808320||
     rgbCount!=4||grayCount!=11)exit(8);
  free_frame(&baseline);
  puts("PASS p40-55: 81,676,800 Y and 10,808,320 Cb/Cr border DCT coefficients identical");
  return 0;
}
