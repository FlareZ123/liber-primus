#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <limits>
#include <numeric>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
constexpr int Q=29,B=30;constexpr double NEG=-1e100;array<float,B*B*Q> lm;
struct Tri {int n;vector<float> table;};
struct F {int a,b,c;vector<double> t;double maxv;};
struct Factor {vector<vector<int>> dom;vector<F> f;double constant=0.;};
int mod(int x){return (x+Q)%Q;}
vector<int> readcsv(string path){ifstream f(path);if(!f)throw runtime_error(path);string s;getline(f,s);istringstream in(s);vector<int>a;while(getline(in,s,','))a.push_back(stoi(s));return a;}
struct Block {
 vector<int> C,D,Z,Zid;vector<array<Tri,8>> T;int q;
 Block(vector<int> c,int period,int alpha,int iv):C(move(c)),q(period){D.resize(C.size());int prev=iv;for(int i=0;i<int(C.size());i++){D[i]=(C[i]+Q*Q-alpha*prev)%Q;prev=C[i];}Zid.resize(C.size(),-1);T.resize(C.size());for(int i=0;i<int(C.size());i++)if(C[i]==0){Zid[i]=Z.size();Z.push_back(i);}assert(Z.size()<31);
  for(int i=2;i<int(C.size());i++){int allow=0;for(int j=0;j<3;j++)if(!C[i-2+j])allow|=1<<j;for(int h=0;h<8;h++){if(h&~allow)continue;auto& t=T[i][h];t.n=3-__builtin_popcount(unsigned(h));int size=1;for(int k=0;k<t.n;k++)size*=Q;t.table.resize(size);
   for(int v=0;v<size;v++){int z=v,k[3]={0,0,0};for(int a=t.n-1;a>=0;a--){k[a]=z%Q;z/=Q;}int p[3],a=0;for(int j=0;j<3;j++)p[j]=(h&(1<<j))?0:mod(D[i-2+j]-k[a++]);t.table[v]=lm[(p[0]*B+p[1])*Q+p[2]];}
  }}
 }
 bool factors(uint32_t mask,Factor& out){vector<uint32_t> dom(q,(1u<<Q)-1);vector<int> phase(C.size());vector<vector<const Tri*>> group(q);int clock=0;out.constant=0.;
  for(int i=0;i<int(C.size());i++){if(Zid[i]>=0&&(mask&(1u<<Zid[i]))){phase[i]=-1;continue;}int j=clock++%q;phase[i]=j;dom[j]&=~(1u<<D[i]);if(!dom[j])return false;}
  for(int i=2;i<int(C.size());i++){int h=0,r=-1;for(int j=0;j<3;j++){int p=phase[i-2+j];if(p<0)h|=1<<j;else if(r<0)r=p;}const Tri* t=&T[i][h];if(r<0)out.constant+=t->table[0];else group[r].push_back(t);}
  out.dom.assign(q,{});out.f.resize(q);for(int r=0;r<q;r++)for(int k=0;k<Q;k++)if(dom[r]&(1u<<k))out.dom[r].push_back(k);
  for(int r=0;r<q;r++){auto& a=out.dom[r];auto& b=out.dom[(r+1)%q];auto& c=out.dom[(r+2)%q];auto& f=out.f[r];f.a=a.size();f.b=b.size();f.c=c.size();f.t.assign(f.a*f.b*f.c,0.);f.maxv=NEG;
    for(int x=0;x<f.a;x++)for(int y=0;y<f.b;y++){double v=0.;int p=a[x]*Q+b[y];for(auto t:group[r])if(t->n==1)v+=t->table[a[x]];else if(t->n==2)v+=t->table[p];
     for(int z=0;z<f.c;z++){double s=v;int id=p*Q+c[z];for(auto t:group[r])if(t->n==3)s+=t->table[id];f.t[(x*f.b+y)*f.c+z]=s;f.maxv=max(f.maxv,s);}}
  }
  return true;
 }
};
double chain(const Factor& f,int cut){int q=f.f.size();vector<double> dp(f.f[cut].a*f.f[cut].b,0.),next;for(int j=0;j<q;j++){auto& a=f.f[(cut+j)%q];next.assign(a.b*a.c,NEG);for(int x=0;x<a.a;x++)for(int y=0;y<a.b;y++){double v=dp[x*a.b+y];const double* w=&a.t[(x*a.b+y)*a.c];double* n=&next[y*a.c];for(int z=0;z<a.c;z++)n[z]=max(n[z],v+w[z]);}dp.swap(next);}return *max_element(dp.begin(),dp.end())+f.constant;}
struct Best {double v=NEG;vector<int> k;};
Best exact(const Factor& f,int cut){int q=f.f.size();auto& initial=f.f[cut];Best best;vector<double> dp,next;vector<vector<int>> ptr(q);for(int a=0;a<initial.a;a++)for(int b=0;b<initial.b;b++){dp.assign(initial.a*initial.b,NEG);dp[a*initial.b+b]=0.;for(int j=0;j<q;j++){auto& w=f.f[(cut+j)%q];next.assign(w.b*w.c,NEG);ptr[j].assign(w.b*w.c,-1);int z0=j==q-2?a:j==q-1?b:0,z1=j>=q-2?z0+1:w.c;for(int x=0;x<w.a;x++)for(int y=0;y<w.b;y++){double v=dp[x*w.b+y];if(v<NEG/2)continue;for(int z=z0;z<z1;z++){double s=v+w.t[(x*w.b+y)*w.c+z];int id=y*w.c+z;if(s>next[id]){next[id]=s;ptr[j][id]=x;}}}dp.swap(next);}double v=dp[a*initial.b+b]+f.constant;if(v>best.v){best.v=v;best.k.resize(q);int x=a,y=b;for(int j=q-1;j>=0;j--){auto& w=f.f[(cut+j)%q];int z=ptr[j][x*w.c+y];assert(z>=0);best.k[(cut+j)%q]=f.dom[(cut+j)%q][z];y=x;x=z;}assert(x==a&&y==b);}}
 return best;
}
vector<int> decrypt(const Block& b,uint32_t mask,const vector<int>& K){int clock=0;vector<int> p;for(int i=0;i<int(b.C.size());i++){if(b.Zid[i]>=0&&(mask&(1u<<b.Zid[i])))p.push_back(0);else{int x=mod(b.D[i]-K[clock++%b.q]);assert(x);p.push_back(x);}}return p;}
double score(const vector<int>&p){double v=0;for(int i=2;i<int(p.size());i++)v+=lm[(p[i-2]*B+p[i-1])*Q+p[i]];return v;}
int main(int argc,char**argv){if(argc<6){cerr<<"model input q start len [exact=0] [plant=0] [alpha=0]\n";return 2;}ifstream mf(argv[1],ios::binary);mf.read(reinterpret_cast<char*>(lm.data()),sizeof(lm));assert(mf.gcount()==sizeof(lm));auto input=readcsv(argv[2]);int q=stoi(argv[3]),start=stoi(argv[4]),len=stoi(argv[5]);assert(q>=3&&start>=0&&start+len<=int(input.size()));vector<int> C(input.begin()+start,input.begin()+start+len);bool full=argc>6&&stoi(argv[6]),plant=argc>7&&stoi(argv[7]);int alpha=argc>8?stoi(argv[8]):0;assert(alpha>=0&&alpha<Q);int iv=start?input[start-1]:0;vector<int>trueK,trueP;if(plant){iv=7;trueP=C;for(int j=0;j<q;j++)trueK.push_back((17*j*j+5*j+3)%29);int j=0,prev=iv;for(int& c:C){if(c)c=(c+trueK[(j++)%q]+alpha*prev)%Q;prev=c;}}
 Block b(C,q,alpha,iv);uint32_t masks=1u<<b.Z.size(),feasible=0;struct Candidate{double bound;uint32_t mask;int cut;};vector<Candidate> candidates;double bestBound=NEG;uint32_t bestMask=0;int exactMasks=0;Best best;uint32_t exactMask=0;
 Factor f;for(uint32_t m=0;m<masks;m++){if(!b.factors(m,f))continue;feasible++;int cut=0;for(int j=1;j<q;j++)if(f.f[j].a*f.f[j].b<f.f[cut].a*f.f[cut].b)cut=j;double ub=chain(f,cut);if(ub>bestBound){bestBound=ub;bestMask=m;}if(full)candidates.push_back({ub,m,cut});}
 if(full){sort(candidates.begin(),candidates.end(),[](auto a,auto b){return a.bound>b.bound;});for(auto c:candidates){if(c.bound<=best.v+1e-9)break;assert(b.factors(c.mask,f));double ub=c.bound;for(int k=0;k<q;k++)if(k!=c.cut){ub=min(ub,chain(f,k));if(ub<=best.v+1e-9)break;}if(ub<=best.v+1e-9)continue;auto s=exact(f,c.cut);exactMasks++;assert(s.v<=ub+1e-7);if(s.v>best.v){best=move(s);exactMask=c.mask;}}}
 cout.precision(12);cout<<"alpha="<<alpha<<" iv="<<iv<<" q="<<q<<" start="<<start<<" n="<<len<<" zeros="<<b.Z.size()<<" feasible="<<feasible<<"/"<<masks<<" ub="<<bestBound<<" ub_per="<<bestBound/(len-2)<<" best_ub_mask="<<bestMask<<" exact_masks="<<exactMasks<<"\n";
 if(plant)cout<<"true_score="<<score(trueP)<<" true_per="<<score(trueP)/(len-2)<<"\n";
 if(full){if(best.k.empty()){cout<<"no feasible key\n";return 0;}auto p=decrypt(b,exactMask,best.k);assert(abs(score(p)-best.v)<1e-6);int j=0,prev=iv;for(int i=0;i<len;i++){int c=p[i]?(p[i]+best.k[(j++)%q]+alpha*prev)%Q:0;assert(c==C[i]);prev=c;}cout<<"exact="<<best.v<<" exact_per="<<best.v/(len-2)<<" mask="<<exactMask<<" key=";for(int x:best.k)cout<<x<<",";cout<<"\n";if(plant){int n=0;for(int i=0;i<len;i++)n+=p[i]==trueP[i];cout<<"match="<<n<<"/"<<len<<"\n";}for(int x:p)cout<<x<<",";cout<<"\n";}
}
