// Exact all-partition two-rank hitting-set gate for the fixed-side non-F projection.
#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <random>
#include <vector>
using namespace std;
using U=uint32_t;
struct E{int at,t;U recent;};
int pc(U x){return __builtin_popcount(x);} int first(U x){return __builtin_ctz(x);}
U bit(int x){return U(1)<<x;}
U ranks(E e,U s,int k,bool left){int q=e.t<0?k:(s&bit(e.t)?k-1-pc(s&e.recent):k+1+pc(~s&e.recent));assert(q>=0&&q<=27);return left?(q<k?bit(q)|bit(q+1):bit(q+1)):(q>k?bit(q)|bit(q+1):bit(q));}
struct P{int a=-1;U b=0;};
array<P,2> hit(const vector<U>& sets,int n){assert(!sets.empty()&&pc(sets[0])<=2);U x=sets[0],all=bit(n)-1;array<P,2> p{};int j=0;while(x){int a=first(x);x&=x-1;p[j++]={a,all^bit(a)};}for(size_t i=1;i<sets.size();i++)for(auto& y:p)if(y.b&&!(sets[i]&bit(y.a)))y.b&=sets[i];return p;}
void controls(){mt19937 gen(3301);int tests=0;for(int n=3;n<=12;n++)for(int j=0;j<1000;j++){vector<U> sets;int count=1+gen()%20;for(int i=0;i<count;i++)sets.push_back(bit(gen()%n)|bit(gen()%n));auto p=hit(sets,n);for(int a=0;a<n;a++)for(int b=a+1;b<n;b++){bool exact=true;for(U x:sets)exact&=bool(x&(bit(a)|bit(b)));bool got=false;for(auto y:p)if(y.b)got|=(y.a==a&&bool(y.b&bit(b)))||(y.a==b&&bool(y.b&bit(a)));assert(got==exact);}tests++;}cerr<<"hitting-set controls: "<<tests<<"\n";}
struct Stats{uint64_t masks=0,assignments=0;array<array<array<uint64_t,29>,29>,29> keys{};};
int main(int argc,char**argv){controls();assert(argc==2);ifstream f(argv[1]);int start,end,burn,n;while(f>>start>>end>>burn>>n){vector<E> es(n);for(auto &e:es){f>>e.at>>e.t>>e.recent;assert(e.t<0||!(e.recent&bit(e.t)));}sort(es.begin(),es.end(),[](E a,E b){return pc(a.recent)<pc(b.recent);});vector<E> order;int lo=0,hi=n-1;while(lo<=hi){order.push_back(es[lo++]);if(lo<=hi)order.push_back(es[hi--]);}Stats out[2];
#pragma omp parallel
{Stats local[2];
#pragma omp for schedule(static)
for(U s=0;s<bit(27);s++){int k=pc(s);for(int left=0;left<2;left++){U init=ranks(order[0],s,k,left);int a=first(init);U b=(bit(29)-1)^bit(a);init&=init-1;int a2=init?first(init):-1;U b2=init?((bit(29)-1)^bit(a2)):0;for(int i=1;i<n&&(b||b2);i++){U x=ranks(order[i],s,k,left);if(b&&!(x&bit(a)))b&=x;if(b2&&!(x&bit(a2)))b2&=x;}if(!(b||b2))continue;local[left].masks++;if(b&&b2&&(b&bit(a2))&&(b2&bit(a)))b2&=~bit(a);int d=k+left;for(auto p:array<P,2>{{{a,b},{a2,b2}}})while(p.b){int j=first(p.b);p.b&=p.b-1;local[left].keys[d][min(p.a,j)][max(p.a,j)]++;local[left].assignments++;}}}
#pragma omp critical
{for(int l=0;l<2;l++){out[l].masks+=local[l].masks;out[l].assignments+=local[l].assignments;for(int d=0;d<29;d++)for(int a=0;a<29;a++)for(int b=a+1;b<29;b++)out[l].keys[d][a][b]+=local[l].keys[d][a][b];}}
}
cout<<"{\"start\":"<<start<<",\"end\":"<<end<<",\"burn\":"<<burn<<",\"anchors\":"<<n<<",\"partitions_per_side\":"<<bit(27)<<",\"sides\":[";for(int l=0;l<2;l++){if(l)cout<<",";cout<<"{\"zero_left\":"<<l<<",\"masks\":"<<out[l].masks<<",\"assignments\":"<<out[l].assignments<<",\"keys\":[";bool comma=false;for(int d=0;d<29;d++)for(int a=0;a<29;a++)for(int b=a+1;b<29;b++)if(out[l].keys[d][a][b]){if(comma)cout<<",";comma=true;cout<<"["<<d<<","<<a<<","<<b<<","<<out[l].keys[d][a][b]<<"]";}cout<<"]}";}cout<<"]}\n";}
}
