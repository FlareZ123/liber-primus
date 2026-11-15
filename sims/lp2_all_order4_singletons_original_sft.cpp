#include <array>
#include <cstdio>
#include <cstdlib>
#include <cstdint>
#include <algorithm>
#include <vector>
#include <string>
#include <fstream>
#include <iterator>
#include <stdexcept>

// Original-source, all-key A/I/O singleton attack on homogeneous GF29
// recurrences of order <= 4. Portable C++17, run from repository root.
// No fitted dictionary, plaintext guesses, or unknown coefficient cap.
using V=std::array<int,4>;
static constexpr int N=83;
static const int POSITION[N]={0,68,174,354,468,616,791,849,886,1074,1140,1369,1638,1972,2199,2252,2300,2390,2483,2826,2919,3046,3099,3171,3562,3607,3705,3830,3966,3972,4000,4041,4057,4182,4298,4457,4523,4575,4618,5077,5143,5160,5459,5523,5800,5815,6080,6387,6617,6748,6814,6818,6956,7009,7135,7304,7346,7507,7605,7922,8102,8151,8383,8502,8896,9070,9226,9379,9600,9770,10675,10796,10819,10910,11350,11471,11626,11775,11989,12057,12078,12472,12594};
static const int SYMBOL[N]={28,15,9,1,0,21,8,7,2,27,26,19,8,10,3,10,9,6,10,14,26,1,7,11,26,23,9,10,17,28,10,16,4,16,13,7,4,2,17,28,25,9,24,23,16,6,26,13,21,15,11,19,3,19,19,20,8,11,13,13,23,22,4,7,18,12,2,8,20,22,26,16,3,16,13,17,6,1,22,28,19,24,21};
static int INV[29];
static inline int fm(int x){x%=29;return x<0?x+29:x;}

// x^n mod (x^4 - a[3]x^3 - a[2]x^2 - a[1]x - a[0])
// gives the exact coefficients of K[n] in initial K[0..3].
static V mul(const V&u,const V&v,const V&a){
 int t[7]={0};
 for(int i=0;i<4;i++)for(int j=0;j<4;j++)t[i+j]+=u[i]*v[j];
 for(int k=6;k>=4;k--){int q=fm(t[k]);for(int j=0;j<4;j++)t[k-4+j]+=q*a[j];}
 return V{fm(t[0]),fm(t[1]),fm(t[2]),fm(t[3])};
}
struct Poly{
 V a;
 std::array<V,14> powers;
 explicit Poly(V c):a(c){
  powers[0]=V{0,1,0,0};
  for(int i=1;i<14;i++)powers[i]=mul(powers[i-1],powers[i-1],a);
 }
 V row(int n)const{
  V v{1,0,0,0};int bit=0;
  while(n){if(n&1)v=mul(v,powers[bit],a);n>>=1;bit++;}
  return v;
 }
};
static int rank4(const V*rows,int n){
 int m[4][4]={0};
 for(int i=0;i<n;i++)for(int j=0;j<4;j++)m[i][j]=rows[i][j];
 int r=0;
 for(int j=0;j<4&&r<n;j++){
  int k=r;while(k<n&&m[k][j]==0)k++;if(k==n)continue;
  for(int c=0;c<4;c++)std::swap(m[k][c],m[r][c]);
  const int inv=INV[m[r][j]];
  for(int c=j;c<4;c++)m[r][c]=fm(m[r][c]*inv);
  for(int i=r+1;i<n;i++){const int q=m[i][j];for(int c=j;c<4;c++)m[i][c]=fm(m[i][c]-q*m[r][c]);}
  r++;
 }
 return r;
}
static bool invert(const int in[4][4],int out[4][4],int n){
 int m[4][8]={0};
 for(int i=0;i<n;i++){for(int j=0;j<n;j++)m[i][j]=in[i][j];m[i][n+i]=1;}
 for(int j=0;j<n;j++){
  int k=j;while(k<n&&m[k][j]==0)k++;if(k==n)return false;
  for(int c=0;c<2*n;c++)std::swap(m[k][c],m[j][c]);
  const int inv=INV[m[j][j]];
  for(int c=j;c<2*n;c++)m[j][c]=fm(m[j][c]*inv);
  for(int i=0;i<n;i++){if(i==j)continue;const int q=m[i][j];
   for(int c=j;c<2*n;c++)m[i][c]=fm(m[i][c]-q*m[j][c]);}
 }
 for(int i=0;i<n;i++)for(int j=0;j<n;j++)out[i][j]=m[i][j+n];
 return true;
}
// Enumerate all key values consistent with the independent rank basis.
// This covers every initial state, including degenerate recurrences a0=0.
static int search(const V&a,const int*symbols,int& full,bool verbose=false){
 const Poly poly(a);
 V seen[N],basis[4];int sel[4]={0},r=0,end=0;
 for(;end<N;end++){
  const V row=poly.row(POSITION[end]);seen[end]=row;V trial[4];
  for(int j=0;j<r;j++)trial[j]=basis[j];
  trial[r]=row;
  if(rank4(trial,r+1)>r){basis[r]=row;sel[r]=end;r++;}
  if(r==4){end++;break;}
 }
 int piv[4]={0},p=0;
 for(int col=0;col<4&&p<r;col++){
  int w[4][4]={0};
  for(int i=0;i<r;i++){for(int j=0;j<p;j++)w[i][j]=basis[i][piv[j]];w[i][p]=basis[i][col];}
  int rank=0;
  for(int j=0;j<=p;j++){
   int t=rank;while(t<r&&w[t][j]==0)t++;if(t==r)continue;
   for(int c=0;c<=p;c++)std::swap(w[t][c],w[rank][c]);
   const int inv=INV[w[rank][j]];
   for(int c=j;c<=p;c++)w[rank][c]=fm(w[rank][c]*inv);
   for(int i=rank+1;i<r;i++){const int q=w[i][j];
    for(int c=j;c<=p;c++)w[i][c]=fm(w[i][c]-q*w[rank][c]);}
   rank++;
  }
  if(rank>p)piv[p++]=col;
 }
 if(p!=r)throw std::runtime_error("Independent pivot selection failed");
 int B[4][4]={0},iB[4][4]={0};
 for(int i=0;i<r;i++)for(int j=0;j<r;j++)B[i][j]=basis[i][piv[j]];
 if(!invert(B,iB,r))throw std::runtime_error("Basis inversion failed");
 int n=1;for(int j=0;j<r;j++)n*=3;
 int targets[81][4]={0};
 for(int c=0;c<n;c++){
  int x=c;
  for(int j=0;j<r;j++){const int plain=(x%3==0?24:(x%3==1?10:3));x/=3;
   targets[c][j]=fm(symbols[sel[j]]-plain);}
 }
 unsigned char live[81];std::fill(live,live+n,1);
 int remaining=n;
 for(int k=0;k<N;k++){
  const V row=k<end?seen[k]:poly.row(POSITION[k]);
  int alpha[4]={0};
  for(int j=0;j<r;j++)for(int z=0;z<r;z++)alpha[j]+=row[piv[z]]*iB[z][j];
  for(int j=0;j<r;j++)alpha[j]=fm(alpha[j]);
  const int b0=fm(symbols[k]-24),b1=fm(symbols[k]-10),b2=fm(symbols[k]-3);
  if(k==12&&verbose){
   std::printf("FINAL-POLY coeff=%d,%d,%d,%d prior-survivors=%d allowed-K=%d,%d,%d\n",
     a[0],a[1],a[2],a[3],remaining,b0,b1,b2);
   for(int c=0;c<n;c++)if(live[c]){
    int predicted=0;for(int j=0;j<r;j++)predicted+=alpha[j]*targets[c][j];
    std::printf("LAST-KEY basis=%d,%d,%d,%d predicted-K=%d\n",
      targets[c][0],targets[c][1],targets[c][2],targets[c][3],fm(predicted));
   }
  }
  for(int c=0;c<n;c++)if(live[c]){
   int val=0;for(int j=0;j<r;j++)val+=alpha[j]*targets[c][j];val=fm(val);
   if(val!=b0&&val!=b1&&val!=b2){live[c]=0;remaining--;}
  }
  if(remaining==0)return k+1;
 }
 full++;
 if(verbose)std::printf("COMPATIBLE coeff=%d,%d,%d,%d, seeds=%d\n",a[0],a[1],a[2],a[3],remaining);
 return N;
}
static void verifySource(){
 std::ifstream f("resources/lp2-transcription.txt",std::ios::binary);
 if(!f)throw std::runtime_error("Run from repository root: missing LP2 transcription");
 const std::string raw((std::istreambuf_iterator<char>(f)),std::istreambuf_iterator<char>());
 const int gp[29]={5792,5794,5798,5801,5809,5811,5815,5817,5819,5822,
  5825,5828,5831,5832,5833,5835,5839,5842,5846,5847,
  5850,5853,5855,5854,5802,5803,5795,5857,5856};
 std::vector<std::array<int,2>> words;
 int pages=0,total=0,wlen=0,wpos=0,wclass=-1;
 const auto finish=[&](){if(wlen==1)words.push_back({wpos,wclass});wlen=0;};
 for(std::size_t i=0;i<raw.size()&&pages<55;){
  const unsigned char b=static_cast<unsigned char>(raw[i]);
  if(b==0xe1&&i+2<raw.size()){
   const unsigned char d=static_cast<unsigned char>(raw[i+1]);
   const unsigned char e=static_cast<unsigned char>(raw[i+2]);
   const int cp=((b&15)<<12)|((d&63)<<6)|(e&63);
   if(cp>=0x16a0&&cp<=0x16ff){
    const auto it=std::find(std::begin(gp),std::end(gp),cp);
    if(it==std::end(gp))throw std::runtime_error("Unknown original rune");
    if(wlen==0)wpos=total;
    wclass=static_cast<int>(it-std::begin(gp));wlen++;total++;i+=3;continue;
   }
  }
  if(b=='%'){pages++;i++;continue;}
  if(b=='/'||b==' '||b=='\n'||b=='\r'||b=='\t'){i++;continue;}
  finish();i++;
 }
 finish();
 if(total!=12956||words.size()!=N)throw std::runtime_error("Original rune/word totals changed");
 for(int j=0;j<N;j++)if(words[j][0]!=POSITION[j]+176||words[j][1]!=SYMBOL[j])
   throw std::runtime_error("Original source singleton discrepancy at "+std::to_string(j));
 std::printf("SOURCE-PASS 12956 original ciphertext runes, 83 singletons exact\n");
}
static void positivePlant(){
 const V a{9,4,10,6},seed{7,1,12,23};const Poly p(a);
 int fake[N];
 for(int j=0;j<N;j++){
  const V row=p.row(POSITION[j]);int key=0;
  for(int k=0;k<4;k++)key+=row[k]*seed[k];
  const int plain=j%3==0?24:(j%3==1?10:3);
  fake[j]=fm(key+plain);
 }
 int full=0;
 if(search(a,fake,full)!=N||full!=1)throw std::runtime_error("Known plaintext plant failed");
 std::printf("PLANT-PASS source-shape 83/83 compatible under known recurrence and seed\n");
}
int main(){
 for(int a=1;a<29;a++)for(int b=1;b<29;b++)if(a*b%29==1)INV[a]=b;
 verifySource();positivePlant();
 int hist[N+1]={0},full=0;long tested=0;
 for(int a0=0;a0<29;a0++)for(int a1=0;a1<29;a1++)
 for(int a2=0;a2<29;a2++)for(int a3=0;a3<29;a3++){
  const int cutoff=search(V{a0,a1,a2,a3},SYMBOL,full,true);
  hist[cutoff]++;tested++;
 }
 std::printf("TOTAL %ld FULL %d\n",tested,full);
 for(int j=1;j<=N;j++)if(hist[j])std::printf("ELIMINATED-AT-EVENT %d: %d\n",j,hist[j]);
 if(tested!=707281||full!=0||hist[13]!=1)throw std::runtime_error("Original all-key certificate changed");
 return 0;
}
