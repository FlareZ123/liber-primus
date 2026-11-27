// Source-constrained Fibonacci-word whole-block GP29 receiver.
// Ciphertext-only fit of 21 independent shifts and literal-F histories.
// Input lines: GP0 encoded as ASCII 65..93; line 0 original 1883; nine native records.
#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <map>
#include <random>
#include <stdexcept>
#include <string>
#include <tuple>
#include <utility>
#include <vector>
using namespace std;
constexpr int A=29,K=21,FIT=1752,N=1883;
using Tape=vector<int>;
using Key=array<int,K>;
using Mask=array<uint64_t,2>;
constexpr double NEG=-numeric_limits<double>::infinity();
int mod(int x){return (x%29+29)%29;}
struct Model{
 array<double,A> uni{};
 array<array<double,A>,A> bi{};
 array<array<double,A>,A> emit{};
 explicit Model(const vector<Tape>& train){
  uni.fill(0.5); for(const auto&t:train){for(int p:t)uni[p]++;for(size_t i=1;i<t.size();i++)bi[t[i-1]][t[i]]++;}
  double total=0;for(double p:uni)total+=p;for(double &p:uni)p/=total;
  for(auto &r:bi){double s=0;for(double v:r)s+=v;for(int p=0;p<A;p++)r[p]=log((r[p]+5*uni[p])/(s+5));}
  for(int c=0;c<A;c++)for(int k=0;k<A;k++){int p=mod(c-k);emit[c][k]=p?uni[p]:0;}
 }
 double score(const Tape&p,int prev=-1)const{double s=0;for(int v:p){s+=(prev<0?log(uni[v]):bi[prev][v]);prev=v;}return s;}
};
Tape schedule(int order,int n){string w="0";while(int(w.size())*8<n){string t;for(char x:w)t+=x=='0'?"01":"0";w=move(t);}Tape s;for(char x:w){int b=(x-'0')^order;for(int j=0;j<(b?13:8);j++)s.push_back((b?8:0)+j);if(int(s.size())>=n)break;}s.resize(n);return s;}
Tape enc(const Tape&p,const Tape&s,const Key&k,int cursor=0){Tape c;for(int v:p){if(!v)c.push_back(0);else c.push_back(mod(v+k[s[cursor++]]));}return c;}
struct State{
 array<array<double,A>,K> prob{};
 double score=0;
 int cursor=0;
 Mask mask{};
};
struct Factor{
 array<array<double,A>,K> mult{};
 vector<int> touched;
 int cursor=0;
 bool hold=false;
 bool valid=true;
};
Factor factor(const Tape&c,const Tape&s,const Model&m,int begin,int end,int cursor,bool hold){
 Factor f;f.cursor=cursor;f.hold=hold;array<bool,K> seen{};
 for(int i=begin+(hold?1:0);i<end;i++){
  int t=s[f.cursor++];if(!seen[t]){seen[t]=true;f.touched.push_back(t);f.mult[t].fill(1.0);}
  for(int k=0;k<A;k++)f.mult[t][k]*=m.emit[c[i]][k];
 }
 for(int t:f.touched){bool any=false;for(double x:f.mult[t])any|=(x>0);if(!any)f.valid=false;}
 return f;
}
double advanceScore(const State&v,const Factor&f,const Model&m){
 if(!f.valid)return NEG;double sc=v.score+(f.hold?log(m.uni[0]):0);
 for(int t:f.touched){double z=0;for(int k=0;k<A;k++)z+=v.prob[t][k]*f.mult[t][k];if(!(z>0))return NEG;sc+=log(z);}
 return sc;
}
State advance(const State&v,const Factor&f,double score,int zero){
 State out=v;out.cursor=f.cursor;out.score=score;if(f.hold){if(zero<0||zero>=128)throw runtime_error("mask width");out.mask[zero/64]|=uint64_t(1)<<(zero%64);}
 for(int t:f.touched){double z=0;for(int k=0;k<A;k++){out.prob[t][k]*=f.mult[t][k];z+=out.prob[t][k];}assert(z>0);double inv=1/z;for(double &v:out.prob[t])v*=inv;}
 return out;
}
bool held(const Mask&m,int z){return (m[z/64]>>(z%64))&1;}
Key mapkey(const State&v){Key k{};for(int t=0;t<K;t++)k[t]=max_element(v.prob[t].begin(),v.prob[t].end())-v.prob[t].begin();return k;}
Tape decodeMask(const Tape&c,const Tape&s,const Key&k,const Mask&mask,int &cursor){
 Tape p;cursor=0;int z=0;
 for(int x:c){bool hold=(x==0&&held(mask,z++));if(hold)p.push_back(0);else{int y=mod(x-k[s[cursor++]]);if(y==0)throw runtime_error("illegal consuming F");p.push_back(y);}}
 return p;
}
struct Held{Tape p;double score=NEG;int cursor=-1;};
Held holdViterbi(const Tape&c,const Tape&s,const Key&k,const Model&m,int cursor,int prev){
 struct Node{double score;int j,p,back;};vector<vector<Node>> layer;layer.push_back({{0,cursor,prev,-1}});
 for(int x:c){vector<Node> next;map<pair<int,int>,int> where;for(int i=0;i<int(layer.back().size());i++){
  const auto&v=layer.back()[i];
  auto add=[&](int j,int p){double score=v.score+(v.p<0?log(m.uni[p]):m.bi[v.p][p]);auto id=make_pair(j,p);auto it=where.find(id);if(it==where.end()){where[id]=next.size();next.push_back({score,j,p,i});}else if(next[it->second].score<score)next[it->second]={score,j,p,i};};
  if(x==0)add(v.j,0);int p=mod(x-k[s[v.j]]);if(p)add(v.j+1,p);
 }if(next.empty())return {};layer.push_back(move(next));}
 int id=max_element(layer.back().begin(),layer.back().end(),[](const Node&a,const Node&b){return a.score<b.score;})-layer.back().begin();Held out;out.score=layer.back()[id].score;out.cursor=layer.back()[id].j;
 for(int i=int(c.size());i>0;i--){const auto &v=layer[i][id];out.p.push_back(v.p);id=v.back;}reverse(out.p.begin(),out.p.end());return out;
}
double logadd(double a,double b){if(a==NEG)return b;if(b==NEG)return a;if(a<b)swap(a,b);return a+log1p(exp(b-a));}
struct Prediction{double prefix=NEG,full=NEG;int prefixStates=0,dead=-1;};
Prediction predictive(const Tape&c,const Tape&s,const Key&k,const Model&m){
 map<pair<int,int>,double> states{{{0,-1},0}};Prediction out;
 for(int i=0;i<int(c.size());i++){
  int x=c[i];map<pair<int,int>,double> next;
  for(auto &it:states){int j=it.first.first,prev=it.first.second;double v=it.second;
   auto add=[&](int jj,int p){double sc=v+(prev<0?log(m.uni[p]):m.bi[prev][p]);auto id=make_pair(jj,p);auto q=next.find(id);if(q==next.end())next[id]=sc;else q->second=logadd(q->second,sc);};
   if(!x)add(j,0);int p=mod(x-k[s[j]]);if(p)add(j+1,p);
  }
  if(next.empty()){out.dead=i;return out;}states=move(next);
  if(i+1==FIT){out.prefixStates=states.size();for(auto &it:states)out.prefix=logadd(out.prefix,it.second);}
 }
 for(auto &it:states)out.full=logadd(out.full,it.second);return out;
}
struct Result{bool legal=false;Key key{};Tape fitp,holdp;double fitScore=NEG,holdScore=NEG,marginal=NEG;int cursor=-1,truthLost=-1,beamEnd=0,firstDead=-1;bool replay=false;};
Result recover(const Tape&c,const Tape&s,const Model&m,size_t width,size_t rerank,const Tape*truth=nullptr){
 Result result;Tape prefix(c.begin(),c.begin()+FIT),suffix(c.begin()+FIT,c.end());
 vector<int> zeros;for(int i=0;i<FIT;i++)if(c[i]==0)zeros.push_back(i);if(zeros.size()>=128)throw runtime_error("too many zeros");
 State start;for(auto&r:start.prob)r.fill(1.0/A);int initial=zeros.empty()?FIT:zeros[0];
 auto f0=factor(prefix,s,m,0,initial,0,false);double sc=advanceScore(start,f0,m);if(!isfinite(sc)){result.firstDead=0;return result;}
 vector<State> beam;beam.push_back(advance(start,f0,sc,-1));Mask trueMask{};
 for(int z=0;z<int(zeros.size());z++){
  int begin=zeros[z],end=(z+1<int(zeros.size())?zeros[z+1]:FIT);int jmin=begin-z,jmax=begin;
  vector<array<Factor,2>> fs;fs.reserve(jmax-jmin+1);for(int j=jmin;j<=jmax;j++)fs.push_back({factor(prefix,s,m,begin,end,j,false),factor(prefix,s,m,begin,end,j,true)});
  struct Candidate{double score;int parent;int hold;};vector<Candidate> cand;cand.reserve(beam.size()*2);
  for(int i=0;i<int(beam.size());i++)for(int h=0;h<2;h++){
   const auto&v=beam[i];const auto&f=fs[v.cursor-jmin][h];double score=advanceScore(v,f,m);if(isfinite(score))cand.push_back({score,i,h});
  }
  if(cand.empty()){result.firstDead=begin;return result;}
  auto cmp=[](const Candidate&a,const Candidate&b){if(a.score!=b.score)return a.score>b.score;if(a.parent!=b.parent)return a.parent<b.parent;return a.hold<b.hold;};
  if(cand.size()>width){nth_element(cand.begin(),cand.begin()+width,cand.end(),cmp);cand.resize(width);}sort(cand.begin(),cand.end(),cmp);
  vector<State> next;next.reserve(cand.size());for(const auto &u:cand){const auto&v=beam[u.parent];next.push_back(advance(v,fs[v.cursor-jmin][u.hold],u.score,z));}beam=move(next);
  if(truth){if((*truth)[begin]==0)trueMask[z/64]|=uint64_t(1)<<(z%64);if(result.truthLost<0&&!any_of(beam.begin(),beam.end(),[&](const State&v){return v.mask==trueMask;}))result.truthLost=begin;}
 }
 result.beamEnd=beam.size();
 for(size_t b=0;b<min(rerank,beam.size());b++){
  const auto&v=beam[b];Key k=mapkey(v);int j;Tape p=decodeMask(prefix,s,k,v.mask,j);double score=m.score(p);
  if(score>result.fitScore){result.legal=true;result.key=k;result.fitp=move(p);result.cursor=j;result.fitScore=score;result.marginal=v.score;}
 }
 if(!result.legal)return result;
 auto h=holdViterbi(suffix,s,result.key,m,result.cursor,result.fitp.back());result.holdp=move(h.p);result.holdScore=h.score;
 Tape full=result.fitp;full.insert(full.end(),result.holdp.begin(),result.holdp.end());result.replay=(full.size()==c.size()&&enc(full,s,result.key)==c);return result;
}
uint32_t fnv(const string&s){uint32_t h=2166136261U;for(unsigned char c:s)h=(h^c)*16777619U;return h;}
vector<Tape> read(const string&path){ifstream f(path);if(!f)throw runtime_error("input not found");vector<Tape>a;string line;while(getline(f,line)){if(line.size()&&line.back()=='\r')line.pop_back();Tape t;for(unsigned char c:line){if(c<65||c>93)throw runtime_error("input alphabet");t.push_back(c-65);}a.push_back(move(t));}return a;}
int matches(const Tape&a,const Tape&b,int offset=0){int n=0;for(int i=0;i<int(a.size());i++)n+=a[i]==b[offset+i];return n;}
void report(const string&name,int order,const Result&r,const Key*key=nullptr,const Tape*truth=nullptr){
 cout<<name<<" order="<<order<<" legal="<<r.legal<<" replay="<<r.replay<<" beamEnd="<<r.beamEnd<<" firstDead="<<r.firstDead<<" truthLost="<<r.truthLost<<" fitScore="<<r.fitScore/FIT<<" holdScore="<<r.holdScore/(N-FIT)<<" holdN="<<r.holdp.size()<<" marginal="<<r.marginal/FIT<<" cursor="<<r.cursor;
 if(key){int k=0;for(int i=0;i<K;i++)k+=(*key)[i]==r.key[i];cout<<" keyMatch="<<k;}if(truth)cout<<" fitMatch="<<matches(r.fitp,*truth)<<" holdMatch="<<matches(r.holdp,*truth,FIT);
 cout<<" key=";for(int k:r.key)cout<<k<<",";cout<<" fitHead=";for(int i=0;i<min(80,int(r.fitp.size()));i++)cout<<char(r.fitp[i]+65);cout<<" holdHead=";for(int i=0;i<min(80,int(r.holdp.size()));i++)cout<<char(r.holdp[i]+65);cout<<endl;
}
int main(int argc,char**argv){
 if(argc<4){cerr<<"usage: program input width rerank [control|original|all]\n";return 2;}
 auto a=read(argv[1]);size_t width=stoull(argv[2]),rerank=stoull(argv[3]);string mode=argc>4?argv[4]:"all";
 if(a.size()<10||a[0].size()!=N)throw runtime_error("input geometry");vector<Tape>native(a.begin()+1,a.begin()+10);vector<Tape>train;for(int i:{0,2,5,6,7,8})train.push_back(native[i]);Model m(train);
 cout<<fixed<<setprecision(8)<<"width="<<width<<" rerank="<<rerank<<" trainF="<<m.uni[0]<<endl;
 if(mode=="control"||mode=="all"){
  Tape p;for(int i:{1,3,4})p.insert(p.end(),native[i].begin(),native[i].end());p.resize(N);
  for(int order=0;order<2;order++){
   mt19937 rng(20261127U+order);Key k;for(int &v:k)v=rng()%29;Tape s=schedule(order,N+1),c=enc(p,s,k);
   auto r=recover(c,s,m,width,rerank,&p);report("native",order,r,&k,&p);auto pred=predictive(c,s,r.key,m);cout<<"predictive native prefixStates="<<pred.prefixStates<<" dead="<<pred.dead<<" holdScore="<<(pred.full-pred.prefix)/(N-FIT)<<endl;
  }
 }
 if(mode=="original"||mode=="all")for(int order=0;order<2;order++){Tape s=schedule(order,N+1);auto r=recover(a[0],s,m,width,rerank);report("original",order,r);auto pred=predictive(a[0],s,r.key,m);cout<<"predictive original prefixStates="<<pred.prefixStates<<" dead="<<pred.dead<<" holdScore="<<(pred.full-pred.prefix)/(N-FIT)<<endl;}
 return 0;
}
