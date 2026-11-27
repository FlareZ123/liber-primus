// Full76 bigram all-placement shortlist -> trigram top64 placements/top16 masks, approximate aggregate.
// Six fresh controls, gate before original; exact conditional MAP under shortlisted masks.
// Build: g++ -O3 -std=c++17 -pthread <this file>
#include <algorithm>
#include <array>
#include <atomic>
#include <cassert>
#include <chrono>
#include <cmath>
#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <sstream>
#include <string>
#include <thread>
#include <vector>
using namespace std;
constexpr int Q=29,W=32;
using V=array<double,W>;
using Mat=array<double,Q*W>;
using Tape=vector<int>;
using Triple=array<Tape,3>;
V U; double B[Q][Q]; Mat ones;
vector<int> arr(const string&s,const string&key){
 auto p=s.find("\""+key+"\"");
 assert(p!=string::npos);p=s.find('[',p);
 vector<int> out; int d=0;
 do{char c=s[p];if(c=='[')++d;else if(c==']')--d;
 else if(c>='0'&&c<='9'){int v=0;do{v=v*10+s[p]-'0';++p;}while(s[p]>='0'&&s[p]<='9');out.push_back(v);continue;} ++p;}while(d);
 return out;
}
Triple split(const vector<int>&v){assert(v.size()==376);return {Tape(v.begin(),v.begin()+121),Tape(v.begin()+121,v.begin()+300),Tape(v.begin()+300,v.end())};}
Tape window(const Tape&t,int off,int len){return Tape(t.begin()+off,t.begin()+off+len);}
int mod(int x){return (x+Q)%Q;}
struct Node{
 int code=-1,c=-1,mask=-1;bool terminal=false;vector<int> next;
 V first{};Mat tr{};
};
struct Trie{
 vector<Node> n; int masks=0; double single=0;
 Trie(const Tape&t){
  V prev{},dst{};
  for(int p=0;p<Q;p++)prev[p]=U[p]*(p?1:(t[0]==0?Q:0));
  for(size_t i=1;i<t.size();i++){dst.fill(0);
   for(int p=0;p<Q;p++)for(int j=0;j<Q;j++)dst[p]+=prev[j]*B[j][p];
   dst[0]*=t[i]==0?Q:0;prev=dst;
  }single=log(accumulate(prev.begin(),prev.end(),0.0));
  int z=count(t.begin(),t.end(),0);assert(z<20);masks=1<<z;n.emplace_back();
  for(int mask=0;mask<masks;mask++){
   vector<array<int,3>> g;int held=0,j=0;
   for(int c:t){bool hold=(c==0&&(mask&(1<<j)));if(c==0)j++;if(hold)held++;else{g.push_back({c,held,0});held=0;}}
   assert(!g.empty());g.back()[2]=held;
   int par=0;
   for(auto a:g){
    int c=a[0],h=a[1],tail=a[2],code=(c*128+h)*128+tail,cur=-1;
    for(int x:n[par].next)if(n[x].code==code){cur=x;break;}
    if(cur<0){
     cur=n.size();int pc=n[par].c;n.emplace_back();n[par].next.push_back(cur);
     Node&v=n[cur];v.code=code;v.c=c;
     const double scale=pow(double(Q),h+1+tail);
     auto trail=[&](int p){return tail?B[p][0]*pow(B[0][0],tail-1):1.0;};
     for(int k=0;k<Q;k++){
      int p=mod(c-k);if(!p)continue;
      if(!par)v.first[k]=scale*(h?U[0]*pow(B[0][0],h-1)*B[0][p]:U[p])*trail(p);
      else for(int l=0;l<Q;l++){
       int s=mod(pc-l);if(!s)continue;
       v.tr[l*W+k]=scale*(h?B[s][0]*pow(B[0][0],h-1)*B[0][p]:B[s][p])*trail(p);
      }
     }
    }par=cur;
   }n[par].terminal=true;n[par].mask=mask;
  }
  for(auto&v:n)if(v.terminal)assert(v.next.empty());
 }
};
struct MaskScore{array<int,3> m;double lr;};
struct Eval{double lr=0;long long leaves=0,steps=0;bool keep=false;vector<MaskScore> ms;};
void walk(const Trie&a,const Trie&b,const Trie&c,int ia,int ib,int ic,const V&prev,Eval&e){
 const Node&A=a.n[ia],&D=b.n[ib],&C=c.n[ic];
 if(A.terminal&&D.terminal&&C.terminal){e.lr+=accumulate(prev.begin(),prev.end(),0.0);++e.leaves;if(e.keep)e.ms.push_back({{A.mask,D.mask,C.mask},accumulate(prev.begin(),prev.end(),0.0)});return;}
 const int na=A.terminal?1:A.next.size(),nb=D.terminal?1:D.next.size(),nc=C.terminal?1:C.next.size();
 for(int i=0;i<na;i++)for(int j=0;j<nb;j++)for(int k=0;k<nc;k++){
  int xa=A.terminal?ia:A.next[i],xb=D.terminal?ib:D.next[j],xc=C.terminal?ic:C.next[k];
  const Mat &ma=A.terminal?ones:a.n[xa].tr,&mb=D.terminal?ones:b.n[xb].tr,&mc=C.terminal?ones:c.n[xc].tr;
  alignas(64) V next{};
  for(int l=0;l<Q;l++){
   double w=prev[l]/Q;int off=l*W;
   for(int r=0;r<W;r++)next[r]+=w*ma[off+r]*mb[off+r]*mc[off+r];
  }++e.steps;walk(a,b,c,xa,xb,xc,next,e);
 }
}
Eval joint(const Trie&a,const Trie&b,const Trie&c,bool keep=false){
 Eval e;e.keep=keep;
 for(int x:a.n[0].next)for(int y:b.n[0].next)for(int z:c.n[0].next){
  V p{};for(int k=0;k<Q;k++)p[k]=a.n[x].first[k]*b.n[y].first[k]*c.n[z].first[k]/Q;
  ++e.steps;walk(a,b,c,x,y,z,p,e);
 }
 assert(e.leaves==1LL*a.masks*b.masks*c.masks);assert(isfinite(e.lr)&&e.lr>0);return e;
}
struct Score{int a,b;double bf;long long leaves,steps;};
Score score(const Triple&t,int a,int b,int len){
 Trie x(window(t[0],a,len)),y(window(t[1],b,len)),z(window(t[2],0,len));auto e=joint(x,y,z);return{a,b,log(e.lr)-x.single-y.single-z.single,e.leaves,e.steps};
}

constexpr int S=30,START=29;
double M[S][S][Q]; // conditional probability times 29
using Row=array<double,W>;
vector<Row> rows;
Row unit;
int maxTail=8;
size_t rid(int tail,int a,int b,int c){return (((size_t)tail*S+a)*S+b)*Q+c;}
void initRows(){
 rows.resize((maxTail+1)*S*S*Q);
 unit.fill(1);for(int k=Q;k<W;k++)unit[k]=0;
 for(int h=0;h<=maxTail;h++)for(int a=0;a<S;a++)for(int b=0;b<S;b++)for(int c=0;c<Q;c++){
  Row& r=rows[rid(h,a,b,c)];
  for(int k=0;k<Q;k++){
   int p=mod(c-k);if(!p)continue;
   double w=M[a][b][p];int aa=b,bb=p;
   for(int j=0;j<h;j++){w*=M[aa][bb][0];aa=bb;bb=0;}
   r[k]=w;
  }
 }
}
struct Group{int c,h,tail;};
vector<Group> groups(const Tape&t,int mask){
 vector<Group>g;int h=0,j=0;for(int c:t){bool hold=(c==0&&(mask&(1<<j)));if(c==0)j++;if(hold)h++;else{g.push_back({c,h,0});h=0;}}
 assert(!g.empty()&&h<=maxTail);g.back().tail=h;return g;
}
struct Factor{const Row* r;double w;};
Factor factor(const vector<Group>&g,int t,int i,int j){
 if(t>=int(g.size()))return {&unit,1};
 int b=t?mod(g[t-1].c-j):START,a=START;
 if(t&&b==0)return {&unit,0};
 if(t&&g[t-1].h)a=0;else if(t>=2){a=mod(g[t-2].c-i);if(a==0)return {&unit,0};}
 double w=1;for(int h=0;h<g[t].h;h++){w*=M[a][b][0];a=b;b=0;}
 return{&rows[rid(g[t].tail,a,b,g[t].c)],w};
}
double singleTri(const Tape&t){
 array<double,S*W>p{},n{};p[START*W+START]=1;
 for(int c:t){n.fill(0);for(int a=0;a<S;a++)for(int b=0;b<S;b++){
  double v=p[a*W+b]/Q;if(v==0)continue;
  for(int k=0;k<Q;k++){if(!k&&c)continue;n[b*W+k]+=v*M[a][b][k]*(k?1:Q);}
 }p=n;}
 return log(accumulate(p.begin(),p.end(),0.0));
}
struct TriVal{double lr=0,map=0;vector<int> key;};
TriVal triJoint(const Triple&t,const array<int,3>&mask,bool trace=false){
 auto a=groups(t[0],mask[0]),b=groups(t[1],mask[1]),c=groups(t[2],mask[2]);int L=max({a.size(),b.size(),c.size()});
 array<double,S*W>p{},n{},v{},u{};p[START*W+START]=v[START*W+START]=1;
 vector<array<unsigned char,S*W>>back;if(trace)back.resize(L);
 for(int z=0;z<L;z++){
  n.fill(0);if(trace)u.fill(0);
  int is=z<2?START:0,ie=z<2?START+1:Q,js=z==0?START:0,je=z==0?START+1:Q;
  for(int i=is;i<ie;i++)for(int j=js;j<je;j++){
   int ij=i*W+j;double pv=p[ij],vv=trace?v[ij]:0;if(!pv&&!vv)continue;
   auto A=factor(a,z,i,j),B=factor(b,z,i,j),C=factor(c,z,i,j);
   double w=A.w*B.w*C.w/Q;if(!w)continue;
   const Row &ra=*A.r,&rb=*B.r,&rc=*C.r;double q=pv*w;
   for(int k=0;k<Q;k++)n[j*W+k]+=q*ra[k]*rb[k]*rc[k];
   if(trace){double qv=vv*w;for(int k=0;k<Q;k++){double x=qv*ra[k]*rb[k]*rc[k];if(x>u[j*W+k]){u[j*W+k]=x;back[z][j*W+k]=i;}}}
  }p=n;if(trace)v=u;
 }
 TriVal out;out.lr=accumulate(p.begin(),p.end(),0.0);assert(isfinite(out.lr)&&out.lr>0);
 if(trace){int idx=max_element(v.begin(),v.end())-v.begin();out.map=v[idx];assert(out.map>0);
  out.key.resize(L);for(int z=L-1;z>=0;z--){int j=idx/W,k=idx%W;assert(k<Q);out.key[z]=k;idx=back[z][idx]*W+j;}
 }
 return out;
}
struct Candidate{int a,b;double triBF;vector<MaskScore> masks;};
Candidate rerank(const Triple&t,int a,int b){
 Triple w={window(t[0],a,76),window(t[1],b,76),window(t[2],0,76)};
 Trie x(w[0]),y(w[1]),z(w[2]);auto e=joint(x,y,z,true);
 stable_sort(e.ms.begin(),e.ms.end(),[](auto&a,auto&b){return a.lr>b.lr;});
 if(e.ms.size()>16)e.ms.resize(16);
 double lr=0;for(auto&m:e.ms)lr+=triJoint(w,m.m).lr;
 double den=singleTri(w[0])+singleTri(w[1])+singleTri(w[2]);
 return{a,b,log(lr)-den,move(e.ms)};
}
struct Result{int a,b,rank,preRank,correct,overlap;double best,mixture,posterior,seconds;vector<int> key;Triple plain;array<int,3> masks;};
Result sweep(const Triple&t,int ta,int tb,const vector<int>&truth,const Triple&plainTruth){
 auto start=chrono::steady_clock::now();
 vector<Trie>A,Bb;A.reserve(46);Bb.reserve(104);
 for(int i=0;i<46;i++)A.emplace_back(window(t[0],i,76));
 for(int i=0;i<104;i++)Bb.emplace_back(window(t[1],i,76));
 Trie C(window(t[2],0,76));vector<Score> s(4784);atomic<int> cur{0};
 int nt=max(1u,min(4u,thread::hardware_concurrency()));
 auto work=[&](){for(;;){int id=cur.fetch_add(1);if(id>=4784)return;int a=id/104,b=id%104;auto e=joint(A[a],Bb[b],C);s[id]={a,b,log(e.lr)-A[a].single-Bb[b].single-C.single,e.leaves,e.steps};}};
 vector<thread> th;for(int i=0;i<nt;i++)th.emplace_back(work);for(auto&x:th)x.join();
 stable_sort(s.begin(),s.end(),[](auto&x,auto&y){return x.bf>y.bf;});
 int preRank=-1;for(int i=0;i<4784;i++)if(s[i].a==ta&&s[i].b==tb)preRank=i+1;
 vector<Candidate>cs(64);cur=0;th.clear();
 auto triwork=[&](){for(;;){int id=cur.fetch_add(1);if(id>=64)return;cs[id]=rerank(t,s[id].a,s[id].b);}};
 for(int i=0;i<nt;i++)th.emplace_back(triwork);for(auto&x:th)x.join();
 stable_sort(cs.begin(),cs.end(),[](auto&x,auto&y){return x.triBF>y.triBF;});
 auto&top=cs.front();double mass=0;int rank=-1;
 for(int i=0;i<64;i++){mass+=exp(cs[i].triBF-top.triBF);if(cs[i].a==ta&&cs[i].b==tb)rank=i+1;}
 Triple w={window(t[0],top.a,76),window(t[1],top.b,76),window(t[2],0,76)};
 TriVal map;array<int,3>mask{};
 for(auto&m:top.masks){auto v=triJoint(w,m.m,true);if(v.map>map.map){map=move(v);mask=m.m;}}
 Triple p;
 for(int j=0;j<3;j++){
  auto g=groups(w[j],mask[j]);int k=0;
  for(auto&x:g){p[j].insert(p[j].end(),x.h,0);int y=mod(x.c-map.key[k++]);assert(y!=0);p[j].push_back(y);p[j].insert(p[j].end(),x.tail,0);}
  assert(p[j].size()==76);
  Tape replay;int i=0;for(int y:p[j])replay.push_back(y?mod(y+map.key[i++]):0);assert(replay==w[j]);
 }
 int overlap=0,correct=0;if(!truth.empty()){
  overlap=76;for(auto&x:plainTruth)overlap=min(overlap,int(count_if(x.begin(),x.end(),[](int y){return y!=0;})));
  if(rank==1)for(int i=0;i<min(overlap,int(map.key.size()));i++)correct+=truth[i]==map.key[i];
 }
 double secs=chrono::duration<double>(chrono::steady_clock::now()-start).count();
 return{top.a,top.b,rank,preRank,correct,overlap,top.triBF,top.triBF+log(mass/4784),1/mass,secs,move(map.key),move(p),mask};
}
template<typename T>string nums(const T&x){ostringstream o;o<<"[";bool first=true;for(int y:x){if(!first)o<<",";first=false;o<<y;}o<<"]";return o.str();}
string json(const Result&r,bool include=true){
 ostringstream o;o<<setprecision(12)<<"{\"a\":"<<r.a<<",\"b\":"<<r.b<<",\"true_rank\":"<<r.rank<<",\"bigram_rank\":"<<r.preRank<<",\"correct\":"<<r.correct<<",\"overlap\":"<<r.overlap<<",\"best_truncated_bf\":"<<r.best<<",\"truncated_average_bf\":"<<r.mixture<<",\"shortlist_mass\":"<<r.posterior<<",\"seconds\":"<<r.seconds;
 if(include)o<<",\"key\":"<<nums(r.key)<<",\"masks\":"<<nums(r.masks)<<",\"plain\":["<<nums(r.plain[0])<<","<<nums(r.plain[1])<<","<<nums(r.plain[2])<<"]";
 o<<"}";return o.str();
}
int main(){
 ifstream f("im-results/lp2-triple-latent-f-trigram-offset-fixtures.json");assert(f);string s((istreambuf_iterator<char>(f)),{});
 auto u=arr(s,"n1"),b=arr(s,"n2"),tri=arr(s,"n3");assert(u.size()==29&&b.size()==841&&tri.size()==24389);double N=accumulate(u.begin(),u.end(),0.0);
 for(int p=0;p<Q;p++)U[p]=(u[p]+.5)/(N+14.5);
 for(int p=0;p<Q;p++){double row=accumulate(b.begin()+p*Q,b.begin()+(p+1)*Q,0.0);for(int q=0;q<Q;q++)B[p][q]=(b[p*Q+q]+12*U[q])/(row+12);}
 for(int a=0;a<S;a++)for(int b=0;b<S;b++){
  double sum=0;if(a<Q&&b<Q)for(int k=0;k<Q;k++)sum+=tri[(a*Q+b)*Q+k];
  for(int k=0;k<Q;k++)M[a][b][k]=Q*(b==START?U[k]:a==START?B[b][k]:(tri[(a*Q+b)*Q+k]+9*B[b][k])/(sum+9));
 }
 for(int p=0;p<Q;p++)for(int q=0;q<Q;q++)ones[p*W+q]=1;
 initRows();
 int aligned=0,ph=0,nh=0,rec=0;vector<string> rs;auto i=s.find("\"controls\"");
 for(int t=0;t<6;t++){
  i=s.find('{',i);auto j=s.find('}',i);string x=s.substr(i,j-i+1);i=j+1;auto off=arr(x,"off"),pt=arr(x,"p"),key=arr(x,"k");
  assert(off.size()==3&&pt.size()==228&&key.size()==76);
  Triple plain={Tape(pt.begin(),pt.begin()+76),Tape(pt.begin()+76,pt.begin()+152),Tape(pt.begin()+152,pt.end())};
  auto p=sweep(split(arr(x,"positive")),off[0],off[1],key,plain);aligned+=p.rank==1;ph+=p.mixture>0;rec+=p.correct>=.7*p.overlap;
  cout<<"positive "<<t<<" "<<json(p,false)<<endl;
  auto n=sweep(split(arr(x,"negative")),-1,-1,{},{});nh+=n.mixture<=0;
  cout<<"negative "<<t<<" "<<json(n,false)<<endl;
  rs.push_back("{\"trial\":"+to_string(t)+",\"positive\":"+json(p)+",\"negative\":"+json(n)+"}");
 }
 bool pass=aligned>=5&&ph>=5&&nh>=5&&rec>=4;cout<<"gate "<<aligned<<" "<<ph<<" "<<nh<<" "<<rec<<" "<<pass<<endl;
 string orig="null";if(pass){orig=json(sweep(split(arr(s,"original")),-1,-1,{},{}));cout<<"original "<<orig<<endl;}
 ostringstream out;out<<"{\"controls\":[";for(int i=0;i<6;i++){if(i)out<<",";out<<rs[i];}out<<"],\"gate\":{\"aligned\":"<<aligned<<",\"positive_mixture\":"<<ph<<",\"negative_mixture\":"<<nh<<",\"recovered\":"<<rec<<",\"pass\":"<<(pass?"true":"false")<<"},\"original\":"<<orig<<"}";
 cout<<out.str()<<endl;if(const char*p=getenv("SFT_OUTPUT")){ofstream o(p);o<<out.str()<<endl;}
}
