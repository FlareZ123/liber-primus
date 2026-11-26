#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <limits>
#include <random>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
constexpr int Q=29, B=30;
array<float,B*B*Q> lm;
struct Cell { double v; int origin,path; uint16_t h; };
struct Node { int prev; uint8_t p, retained; };
struct Result { double score; int start,end; vector<int> plain,keep; };
vector<int> primes(int n){int limit=max(100,n*20);vector<bool> sieve(limit+1,true);sieve[0]=sieve[1]=false;for(int i=2;i*i<=limit;i++)if(sieve[i])for(int j=i*i;j<=limit;j+=i)sieve[j]=false;vector<int> p;for(int i=2;i<=limit&&int(p.size())<n;i++)if(sieve[i])p.push_back(i);assert(int(p.size())==n);return p;}
vector<int> readcsv(string path){ifstream f(path);if(!f)throw runtime_error("input "+path);string s;getline(f,s);istringstream in(s);vector<int> a;while(getline(in,s,','))a.push_back(stoi(s));return a;}
vector<int> encrypt(const vector<int>& p,int start,const vector<int>& k){vector<int> c;for(int x:p)c.push_back(x?(x+k.at(start++))%Q:0);return c;}
Result solve(const vector<int>& C,const vector<int>& K,int lo,int hi,int maxj,double d,bool trace=false,int forcedEnd=-1){
 vector<vector<Cell>> cur(maxj+1),next(maxj+1);vector<Node> nodes;const double ld=d<0?0.:log(d),lr=d<0?0.:log1p(-d);for(int j=lo;j<=hi;j++)cur[j].push_back({0.,j,-1,uint16_t(29*B+29)});
 auto insert=[&](vector<Cell>& dst,int h,double v,int origin,int parent,int p,bool keep){
   for(auto& z:dst)if(z.h==h){if(v>z.v){int path=-1;if(trace){path=nodes.size();nodes.push_back({parent,uint8_t(p),uint8_t(keep)});}z={v,origin,path,uint16_t(h)};}return;}
   int path=-1;if(trace){path=nodes.size();nodes.push_back({parent,uint8_t(p),uint8_t(keep)});}dst.push_back({v,origin,path,uint16_t(h)});
 };
 for(int i=0;i<int(C.size());i++){
   int c=C[i],prev=i?C[i-1]:-1;double retain=(c==prev)?lr:0.;for(int j=lo;j<=maxj;j++){
     // cur[j] contains preceding observed-state paths and closure paths consuming
     // a hidden repeat at smaller j. Only F can emit without changing j.
     // At most two consecutive hidden F edges improve an optimum: after two,
     // history is (F,F), so an additional edge returns to the same state at cost.
     for(const auto z0:cur[j]){
       Cell z=z0;
       for(int f=0;f<=((prev==0)?2:0);f++){
         int b=z.h%B;
         if(c==0)insert(next[j],b*B,z.v+retain+lm[z.h*Q],z.origin,z.path,0,true);
         if(j<maxj){
           int p=(c-K[j]+Q)%Q;if(p)insert(next[j+1],b*B+p,z.v+retain+lm[z.h*Q+p],z.origin,z.path,p,true);
           if(prev>=0){int q=(prev-K[j]+Q)%Q;if(q)insert(cur[j+1],b*B+q,z.v+ld+lm[z.h*Q+q],z.origin,z.path,q,false);}
         }
         if(prev!=0||f==2)break;
         int nh=b*B;if(nh==z.h)break;
         z.v+=ld+lm[z.h*Q];z.h=nh;
         if(trace){int path=nodes.size();nodes.push_back({z.path,0,0});z.path=path;}
       }
     }
   }
   for(auto& v:cur)v.clear();
   cur.swap(next);
 }
 Cell best{-numeric_limits<double>::infinity(),-1,-1,0};int end=-1;for(int j=lo;j<=maxj;j++)if(forcedEnd<0||j==forcedEnd)for(auto z:cur[j])if(z.v>best.v){best=z;end=j;}
 Result out{best.v,best.origin,end,{},{}};if(trace&&best.path>=0){for(int n=best.path;n>=0;n=nodes[n].prev){out.plain.push_back(nodes[n].p);out.keep.push_back(nodes[n].retained);}reverse(out.plain.begin(),out.plain.end());reverse(out.keep.begin(),out.keep.end());auto raw=encrypt(out.plain,out.start,K);vector<int> replay;for(int i=0;i<int(raw.size());i++){if(out.keep[i])replay.push_back(raw[i]);else assert(!replay.empty()&&raw[i]==replay.back());}assert(replay==C);}
 return out;
}
int edit(const vector<int>& a,const vector<int>& b){vector<int> p(b.size()+1),q(p.size());for(int i=0;i<int(p.size());i++)p[i]=i;for(int i=0;i<int(a.size());i++){q[0]=i+1;for(int j=0;j<int(b.size());j++)q[j+1]=min({p[j+1]+1,q[j]+1,p[j]+(a[i]!=b[j])});p.swap(q);}return p.back();}
int main(int argc,char**argv){if(argc<4){cerr<<"usage model.bin input.csv [original|plant] [originMax=3301] [d=.81] [seed=3301] [plantOrigin=174]\n";return 2;}ifstream mf(argv[1],ios::binary);mf.read(reinterpret_cast<char*>(lm.data()),sizeof(lm));assert(mf.gcount()==sizeof(lm));auto input=readcsv(argv[2]);bool plant=string(argv[3])=="plant";int hi=argc>4?stoi(argv[4]):3301;double d=argc>5?stod(argv[5]):.81;int seed=argc>6?stoi(argv[6]):3301,origin=argc>7?stoi(argv[7]):174;auto p=primes(hi+int(input.size())*3+100);for(int& x:p)x=(x-1)%Q;vector<int> c=input;
 if(plant){auto raw=encrypt(input,origin,p);mt19937 rng(seed);c.clear();for(int x:raw){if(!c.empty()&&x==c.back()&&double(rng())/4294967296.0<d)continue;c.push_back(x);}}
 int maxj=hi+int(ceil(1.25*c.size()));auto r=solve(c,p,0,hi,maxj,d);assert(r.end>=0);
 // Every LM transition has log probability <= M < 0. Every deleted
 // rune contributes ld in addition; every retained repeat contributes lr.
 // Thus any path beating the feasible incumbent has a finite total
 // deleted-rune bound, independent of how its start and holds are chosen.
 double M=*max_element(lm.begin(),lm.end()),ld=d<0?0.:log(d),lr=d<0?0.:log1p(-d);
 int repeats=0;for(size_t i=1;i<c.size();i++)repeats+=c[i]==c[i-1];
 assert(M<0&&M+ld<0);
 int H=max(0,int(ceil((r.score-c.size()*M-repeats*lr)/(M+ld))));
 int exactMax=hi+int(c.size())+H;
 if(exactMax>maxj){p=primes(exactMax+1);for(int& x:p)x=(x-1)%Q;r=solve(c,p,0,hi,exactMax,d);}
 cout<<"initial_cap="<<maxj<<" proven_cap="<<exactMax<<" deletion_bound="<<H<<" maxLM="<<M<<"\n";
 auto rr=solve(c,p,r.start,r.start,r.end,d,true,r.end);assert(abs(r.score-rr.score)<1e-9);cout.precision(14);cout<<"obs="<<c.size()<<" start="<<r.start<<" end="<<r.end<<" hidden="<<rr.plain.size()-c.size()<<" score="<<r.score<<" per_observed="<<r.score/c.size()<<" per_plain="<<r.score/rr.plain.size()<<"\n";
 if(plant)cout<<"true_origin="<<origin<<" true_len="<<input.size()<<" true_hidden="<<input.size()-c.size()<<" edit="<<edit(input,rr.plain)<<"\n";
 for(size_t i=0;i<rr.plain.size();i++)cout<<(i?",":"")<<rr.plain[i];
 cout<<"\n";for(auto v:rr.keep)cout<<v;cout<<"\n";
}
