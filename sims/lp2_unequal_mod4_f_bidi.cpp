// All-initial-list conservative rank domains, unequal non-F destinations, latent F.
#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <numeric>
#include <random>
#include <vector>
using namespace std;
using U=uint32_t;
constexpr int N=29; constexpr U ALL=(1u<<N)-1;
using D=array<U,N>; using R=array<int,N>;
const R CAT={0,2,1,2,2,1,1,2,2,1,2,1,1,2,2,1,2,1,2,2,1,2,2,1,1,1,2,2,1};
U bit(int x){return 1u<<x;} U below(int x){return bit(x)-1;} bool single(U x){return x&&!(x&(x-1));} int lo(U x){assert(x);return __builtin_ctz(x);} int hi(U x){assert(x);return 31-__builtin_clz(x);}
bool prop(D& a){U prev=ALL;while(true){U fixed=0;for(U v:a){if(!v)return false;if(single(v)){if(fixed&v)return false;fixed|=v;}}if(fixed==prev)return true;prev=fixed;for(U& v:a)if(!single(v)){v&=~fixed;if(!v)return false;}}}
bool step(D& a,int c,int d){U b=a[c];if(!b)return false;int l=lo(b),h=hi(b);U down=below(d+1)&~below(l+1),up=below(h)&~below(d),same=(below(min(h,d))|(ALL&~below(max(l,d)+1)))&ALL;for(int y=0;y<N;y++)if(y!=c){U v=a[y];a[y]=((v&down)>>1)|((v&up)<<1)|(v&same);}a[c]=bit(d);return prop(a);}
bool move(D& a,int c,int d,bool forced,U forbidden){if(c||forced){U v=a[c]&~forbidden;if(!v)return false;if(v!=a[c]){a[c]=v;if(!prop(a))return false;}return step(a,c,d);}D b=a;b[c]&=~forbidden;if(prop(b)&&step(b,c,d))for(int y=0;y<N;y++)a[y]|=b[y];return prop(a);}
struct Tape{vector<int> c;vector<bool> marker;};
struct Bound{int dead=-1;vector<array<int,2>> pairs;};
Bound bound(const Tape& t,const R& r,U pair=0,U forbidden=0){D a,p;a.fill(ALL);p.fill(ALL);for(int i=0;i<(int)t.c.size();i++){int c=t.c[i],d=r[c];U b=a[c];if(t.marker[i]){if(pair){a[c]&=pair;if(!prop(a))return{i,{}};}else{U any=0;for(int x=0;x<N;x++){if(!(b&bit(x)))p[x]&=b;any|=p[x]&~bit(x);}if(!any)return{i,{}};}}
if(!move(a,c,d,t.marker[i],forbidden))return{i,{}};}
Bound out;if(!pair)for(int x=0;x<N;x++)for(int y=x+1;y<N;y++)if(p[x]&bit(y))out.pairs.push_back({x,y});return out;}
R chart(array<int,3>d){R r;for(int i=0;i<N;i++)r[i]=d[CAT[i]];return r;}

// Arc-consistent marginal forward/backward branches. True paths cannot be removed.
bool meet(D& a,const D& b){for(int y=0;y<N;y++)a[y]&=b[y];return prop(a);}
bool back(D& a,int c,int d,U preRank){if(!(a[c]&bit(d))||!preRank)return false;int l=lo(preRank),h=hi(preRank);U up=below(d)&~below(l),down=below(h+1)&~below(d+1),same=(below(min(h,d))|(ALL&~below(max(l,d)+1)))&ALL;for(int y=0;y<N;y++)if(y!=c){U v=a[y]&~bit(d);a[y]=((v&down)>>1)|((v&up)<<1)|(v&same);}a[c]=preRank;return prop(a);}
bool edge(D& a,D& b,int c,int d,bool marked,U pair,U forbidden){D pre=a,post=b;if(marked)pre[c]&=pair;pre[c]&=~forbidden;bool moving=prop(pre)&&step(post=pre,c,d)&&meet(post,b)&&back(post,c,d,pre[c])&&meet(pre,post);if(moving){post=pre;moving=step(post,c,d)&&meet(post,b);}D hold=a;bool holding=!c&&!marked&&meet(hold,b);if(!moving&&!holding)return false;if(!moving){a=b=hold;return true;}if(holding)for(int y=0;y<N;y++){pre[y]|=hold[y];post[y]|=hold[y];}a=pre;b=post;return true;}
int bidi(const Tape& t,const R& r,U pair,U forbidden,int maxsweep=12){int n=t.c.size();vector<D> x(n+1);for(auto& a:x)a.fill(ALL);for(int pass=0;pass<maxsweep;pass++){bool change=false;for(int k=0;k<2;k++)for(int j=0;j<n;j++){int i=k?n-1-j:j;D a=x[i],b=x[i+1];if(!edge(x[i],x[i+1],t.c[i],r[t.c[i]],t.marker[i],pair,forbidden))return -1;if(a!=x[i]||b!=x[i+1])change=true;}if(!change)return pass+1;}return maxsweep+1;}
void controls(){int checks=0;for(int j=0;j<N;j++)for(int d=0;d<N;d++)for(int r=0;r<N;r++)if(r!=j){int q=r-(r>j);q+=q>=d;U down=below(d+1)&~below(j+1),up=below(j)&~below(d),same=(below(min(j,d))|(ALL&~below(max(j,d)+1)))&ALL;U b=bit(r),z=((b&down)>>1)|((b&up)<<1)|(b&same);assert(z==bit(q));checks++;}mt19937 rng(3301);for(int trial=0;trial<32;trial++){array<int,3>d={int(rng()%N),int(rng()%N),int(rng()%N)};R r=chart(d),a,s;iota(a.begin(),a.end(),0);iota(s.begin(),s.end(),0);shuffle(a.begin(),a.end(),rng);shuffle(s.begin(),s.end(),rng);Tape t;for(int i=0;i<2000;i++){int p=rng()%N,c=p? a[s[p]]:0;t.c.push_back(c);t.marker.push_back(p==10||p==24);if(p){int j=s[p],z=r[c];if(j<z)rotate(a.begin()+j,a.begin()+j+1,a.begin()+z+1);else if(j>z)rotate(a.begin()+z,a.begin()+j,a.begin()+j+1);assert(a[z]==c);}}auto u=bound(t,r);auto xy=array<int,2>{min(s[10],s[24]),max(s[10],s[24])};U pair=bit(xy[0])|bit(xy[1]);assert(u.dead<0&&find(u.pairs.begin(),u.pairs.end(),xy)!=u.pairs.end());assert(bound(t,r,pair).dead<0);assert(bound(t,r,pair,bit(s[0])).dead<0);assert(bidi(t,r,pair,bit(s[0]))>0);}cerr<<"controls: "<<checks<<" rank transforms, 32 latent-F plant truths retained\n";}
struct Stats{uint64_t maps=0,dead1=0,pairs1=0,dead2=0,pairs2=0,dead3=0,pairs3=0,fkeys=0;};
struct Survivor{array<int,3>d;array<int,2>p;U f;};
int main(int argc,char**argv){controls();assert(argc==2);ifstream f(argv[1]);Tape t;char c;U h=2166136261u;while(f>>c){t.c.push_back(c<='9'?c-'0':c-'A'+10);h=(h^(unsigned char)c)*16777619u;}assert(t.c.size()==12956&&h==0x75f0ccfa);t.marker.resize(t.c.size());for(int i:{176,244,350,530,644,792,967,1025,1062,1250,1316,1545,1814,2148,2375,2428,2476,2566,2659,3002,3095,3222,3275,3347,3738,3783,3881,4006,4142,4148,4176,4217,4233,4358,4474,4633,4699,4751,4794,5253,5319,5336,5635,5699,5976,5991,6256,6563,6793,6924,6990,6994,7132,7185,7311,7480,7522,7683,7781,8098,8278,8327,8559,8678,9072,9246,9402,9555,9776,9946,10851,10972,10995,11086,11526,11647,11802,11951,12165,12233,12254,12648,12770})t.marker[i]=true;
for(int a=0;a<=14;a++){Stats all;vector<Survivor> out;vector<array<int,3>> ds;for(int b=0;b<N;b++)for(int c=0;c<N;c++){array<int,3>d={a,b,c},ref={28-a,28-b,28-c};if(d>ref||b==c)continue;ds.push_back(d);}
#pragma omp parallel
{Stats st;vector<Survivor> loc;
#pragma omp for schedule(dynamic,1)
for(int i=0;i<(int)ds.size();i++){auto d=ds[i];R r=chart(d);st.maps++;auto u=bound(t,r);if(u.dead>=0){st.dead1++;continue;}st.pairs1+=u.pairs.size();bool any2=false,any3=false;for(auto p:u.pairs){U pair=bit(p[0])|bit(p[1]);if(bound(t,r,pair).dead>=0)continue;st.pairs2++;any2=true;U fs=0;for(int z=0;z<N;z++)if(!(pair&bit(z))&&bound(t,r,pair,bit(z)).dead<0)fs|=bit(z);if(!fs)continue; for(int z=0;z<N;z++)if((fs&bit(z))&&bidi(t,r,pair,bit(z))<0)fs&=~bit(z); if(!fs)continue;st.pairs3++;st.fkeys+=__builtin_popcount(fs);any3=true;loc.push_back({d,p,fs});}if(!any2)st.dead2++;else if(!any3)st.dead3++;}
#pragma omp critical
{all.maps+=st.maps;all.dead1+=st.dead1;all.pairs1+=st.pairs1;all.dead2+=st.dead2;all.pairs2+=st.pairs2;all.dead3+=st.dead3;all.pairs3+=st.pairs3;all.fkeys+=st.fkeys;out.insert(out.end(),loc.begin(),loc.end());}}
sort(out.begin(),out.end(),[](auto x,auto y){return x.d<y.d||(x.d==y.d&&x.p<y.p);});cout<<"{\"batch\":"<<a<<",\"maps\":"<<all.maps<<",\"dead1\":"<<all.dead1<<",\"pairs1\":"<<all.pairs1<<",\"dead2\":"<<all.dead2<<",\"pairs2\":"<<all.pairs2<<",\"dead3\":"<<all.dead3<<",\"pairs3\":"<<all.pairs3<<",\"fkeys\":"<<all.fkeys<<",\"survivors\":[";bool comma=false;for(auto x:out){if(comma)cout<<",";comma=true;cout<<"["<<x.d[0]<<","<<x.d[1]<<","<<x.d[2]<<","<<x.p[0]<<","<<x.p[1]<<","<<x.f<<"]";}cout<<"]}"<<endl;}
}
