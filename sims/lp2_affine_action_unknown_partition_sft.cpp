// Exact all-noncommuting-pair, all-IV, unknown fixed binary GP29 partition inverse.
// Authentic plaintext-F hold; both composition orders; carry-correct p54/p55.
#include <algorithm>
#include <array>
#include <atomic>
#include <chrono>
#include <cstdint>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <limits>
#include <memory>
#include <sstream>
#include <stdexcept>
#include <string>
#include <thread>
#include <unordered_set>
#include <vector>
using namespace std;
constexpr int Q=29,M=812,TRI=24389,NEG=-1000000000;
using Rune=uint8_t;
using Tape=vector<Rune>;
using Mask=uint32_t;
const string alphabet="0123456789abcdefghijklmnopqrs";
int md(int x){int r=x%Q;return r<0?r+Q:r;}
int ident(int a,int b){return (a-1)*Q+b;}
int slope(int s){return s/Q+1;}
int intercept(int s){return s%Q;}
Mask bit(int p){return Mask(1)<<p;}
int inverse[Q];
array<int16_t,TRI> scores;
array<array<Rune,Q>,M> encTable,decTable;
array<array<uint16_t,M>,M> action[2];
array<array<uint8_t,M>,M> noncomm;
struct TrieNode{array<int,Q> ch;TrieNode(){ch.fill(-1);}};
vector<TrieNode> trie;
vector<int> roots;
vector<Tape> anchors;
int newNode(){trie.emplace_back();return int(trie.size())-1;}
void insert(const Tape& p){
 if(roots.size()<=p.size())roots.resize(p.size()+1,-1);
 if(roots[p.size()]<0)roots[p.size()]=newNode();
 int n=roots[p.size()];for(Rune x:p){int child=trie[n].ch[x];if(child<0){child=newNode();trie[n].ch[x]=child;}n=child;}
}
int root(int n){return n<int(roots.size())?roots[n]:-1;}
int stepTrie(int n,int p){return n<0?-1:trie[n].ch[p];}
Tape parse(const string& s){Tape p;for(char c:s){auto n=alphabet.find(c);if(n==string::npos)throw runtime_error("bad compact rune");p.push_back(Rune(n));}return p;}
string compact(const Tape& p){string s;for(Rune x:p)s+=alphabet[x];return s;}
void init(){
 for(int a=1;a<Q;a++)for(int b=1;b<Q;b++)if(md(a*b)==1)inverse[a]=b;
 for(int s=0;s<M;s++){int A=slope(s),B=intercept(s);
  for(int x=0;x<Q;x++){encTable[s][x]=md(A*x+B);decTable[s][x]=md(inverse[A]*(x-B));}
  for(int k=0;k<M;k++){int a=slope(k),b=intercept(k);action[0][s][k]=ident(md(A*a),md(A*b+B));action[1][s][k]=ident(md(A*a),md(a*B+b));noncomm[s][k]=action[0][s][k]!=action[1][s][k];}
 }
}
struct Key {int u=-1,v=-1,iv=-1;bool valid()const{return u>=0&&v>=0&&iv>=0;}bool operator==(const Key& k)const{return u==k.u&&v==k.v&&iv==k.iv;}int at(int c)const{return c?v:u;}};
uint64_t keyId(const Key& k){return (uint64_t(k.u)*M+k.v)*M+k.iv;}
struct Data{string name;int side,train;bool plant;Key truth;Mask truthOnes=0;vector<Tape> groups,pwords;vector<int> start;Tape c,p;};
struct Candidate {Key key;Mask known=0,ones=0;int state=-1,oov=1000000,score=NEG;Tape p;bool valid()const{return key.valid();}};
bool better(const Candidate& a,const Candidate& b){if(!b.valid())return true;if(a.oov!=b.oov)return a.oov<b.oov;if(a.score!=b.score)return a.score>b.score;if(keyId(a.key)!=keyId(b.key))return keyId(a.key)<keyId(b.key);if(a.known!=b.known)return a.known<b.known;if(a.ones!=b.ones)return a.ones<b.ones;return a.p<b.p;}
struct Stats{uint64_t anchorNodes=0,knownTests=0,firstUse=0,anchorLeaves=0,anchorPartials=0,trainNodes=0,trainPaths=0,trainBestTies=0;size_t compatible=0;bool truthRetained=false;unordered_set<uint64_t> anchorKeys,trainKeys;Candidate best;};
struct Hold {uint64_t paths=0;bool truthRetained=false;unordered_set<string> texts;Candidate best;};
int addScore(const Tape& p,int i,Rune v){return i<2?0:scores[(int(p[i-2])*Q+p[i-1])*Q+v];}
int fullScore(const Tape& p){int s=0;for(int i=2;i<int(p.size());i++)s+=addScore(p,i,p[i]);return s;}
pair<Tape,int> encode(const Tape& p,Key k,int side,Mask ones,int state){Tape c;for(Rune x:p){if(x==0)c.push_back(0);else{c.push_back(encTable[state][x]);state=action[side][state][k.at(bool(ones&bit(x)))];}}return {c,state};}
struct Search{
 const Data& d;Stats st;Tape plain;Key k;int nTrain;
 Search(const Data& data):d(data),plain(data.c.size()),nTrain(data.start[data.train]){}
 int update(int s,int gen)const{return action[d.side][s][gen];}
 void record(int state,Mask known,Mask ones,int oov,int score){
  st.trainPaths++;st.trainKeys.insert(keyId(k));
  Candidate a{k,known,ones,state,oov,score,Tape(plain.begin(),plain.begin()+nTrain)};
  if(d.plant&&k==d.truth&&((ones^d.truthOnes)&known)==0&&equal(a.p.begin(),a.p.end(),d.p.begin()))st.truthRetained=true;
  if(!st.best.valid()||oov<st.best.oov||(oov==st.best.oov&&score>st.best.score))st.trainBestTies=1;
  else if(oov==st.best.oov&&score==st.best.score)st.trainBestTies++;
  if(better(a,st.best))st.best=move(a);
 }
 void trainWord(int g,int j,int state,Mask known,Mask ones,int oov,int score,int node){
  st.trainNodes++;
  if(g==d.train){record(state,known,ones,oov,score);return;}
  const Tape& w=d.groups[g];
  if(j==int(w.size())){int noov=oov+int(node<0);if(noov>3)return;trainWord(g+1,0,state,known,ones,noov,score,g+1==d.train?-1:root(d.groups[g+1].size()));return;}
  const int pos=d.start[g]+j,c=w[j],p=decTable[state][c];
  auto follow=[&](int v,int ns,Mask nk,Mask no){
   int n=stepTrie(node,v);if(n<0&&oov==3)return;
   int sc=score+addScore(plain,pos,v);plain[pos]=Rune(v);trainWord(g,j+1,ns,nk,no,oov,sc,n);
  };
  if(c==0)follow(0,state,known,ones);
  if(p==0)return;Mask b=bit(p);
  if(known&b)follow(p,update(state,k.at(bool(ones&b))),known,ones);
  else{follow(p,update(state,k.u),known|b,ones);follow(p,update(state,k.v),known|b,ones|b);}
 }
 void extend(const Tape& P,const Tape& p,int s,int u,int v,int iv,Mask known,Mask ones){
  if(!noncomm[u][v])return;
  k={u,v,iv};st.anchorPartials++;st.anchorKeys.insert(keyId(k));
  copy(P.begin(),P.end(),plain.begin());int sc=fullScore(P),last=p.back();Mask b=bit(last);
  auto go=[&](int c,Mask kn,Mask on){trainWord(1,0,update(s,k.at(c)),kn,on,0,sc,root(d.groups[1].size()));};
  if(known&b)go(bool(ones&b),known,ones);else{go(0,known|b,ones);go(1,known|b,ones|b);}
 }
 void anchor(const Tape& P,const Tape& p,const Tape& C,int i,int s,int u,int v,int iv,Mask known,Mask ones){
  st.anchorNodes++;
  if(i==int(p.size())-1){
   st.anchorLeaves++;
   if(u>=0&&v>=0)extend(P,p,s,u,v,iv,known,ones);
   else if(u<0&&v<0){for(int a=0;a<M;a++)for(int b=0;b<M;b++)extend(P,p,s,a,b,iv,known,ones);}
   else if(u<0){for(int a=0;a<M;a++)extend(P,p,s,a,v,iv,known,ones);}
   else{for(int b=0;b<M;b++)extend(P,p,s,u,b,iv,known,ones);}
   return;
  }
  int x=p[i],y=p[i+1],c=C[i+1];Mask b=bit(x);
  auto choose=[&](int cl,Mask kn,Mask on){
   int gen=cl?v:u;
   if(gen>=0){st.knownTests++;int ns=update(s,gen);if(encTable[ns][y]==c)anchor(P,p,C,i+1,ns,u,v,iv,kn,on);return;}
   int target=d.side?c:decTable[s][c],operand=d.side?encTable[s][y]:y;
   for(int a=1;a<Q;a++){st.firstUse++;int gen=ident(a,md(target-a*operand)),nu=cl?u:gen,nv=cl?gen:v;
    if(nu>=0&&nv>=0&&!noncomm[nu][nv])continue;
    anchor(P,p,C,i+1,update(s,gen),nu,nv,iv,kn,on);
   }
  };
  if(known&b)choose(bool(ones&b),known,ones);
  else{choose(0,known|b,ones);choose(1,known|b,ones|b);}
 }
 void one(const Tape& P){
  const Tape& c=d.groups[0];if(P.size()!=c.size())throw runtime_error("anchor length");
  Tape p,C;for(int i=0;i<int(P.size());i++){if(!P[i]){if(c[i])return;}else{p.push_back(P[i]);C.push_back(c[i]);}}
  if(p.empty())throw runtime_error("all-F anchor outside model");
  st.compatible++;for(int a=1;a<Q;a++){int iv=ident(a,md(C[0]-a*p[0]));anchor(P,p,C,0,iv,-1,-1,iv,bit(p[0]),0);}
 }
};
void merge(Stats& a,Stats& b){
 a.anchorNodes+=b.anchorNodes;a.knownTests+=b.knownTests;a.firstUse+=b.firstUse;a.anchorLeaves+=b.anchorLeaves;a.anchorPartials+=b.anchorPartials;a.trainNodes+=b.trainNodes;a.trainPaths+=b.trainPaths;a.compatible+=b.compatible;a.truthRetained|=b.truthRetained;
 a.anchorKeys.insert(b.anchorKeys.begin(),b.anchorKeys.end());a.trainKeys.insert(b.trainKeys.begin(),b.trainKeys.end());
 if(b.best.valid()){if(!a.best.valid()||b.best.oov<a.best.oov||(b.best.oov==a.best.oov&&b.best.score>a.best.score))a.trainBestTies=b.trainBestTies;else if(b.best.oov==a.best.oov&&b.best.score==a.best.score)a.trainBestTies+=b.trainBestTies;if(better(b.best,a.best))a.best=move(b.best);}
}
Stats search(const Data& d){
 atomic<size_t> next{0};unsigned n=max(1u,min(8u,thread::hardware_concurrency()));vector<unique_ptr<Search>> workers;for(unsigned j=0;j<n;j++)workers.emplace_back(make_unique<Search>(d));
 vector<thread> threads;for(unsigned j=0;j<n;j++)threads.emplace_back([&,j]{auto& w=*workers[j];size_t i;while((i=next.fetch_add(1))<anchors.size())w.one(anchors[i]);});
 for(auto& t:threads)t.join();Stats s;for(auto& w:workers)merge(s,w->st);return s;
}
struct HoldSearch{
 const Data& d;const Candidate& train;Hold out;Tape p;int nTrain;
 HoldSearch(const Data& data,const Candidate& c):d(data),train(c),p(data.c.size()-data.start[data.train]),nTrain(data.start[data.train]){}
 void walk(int g,int j,int state,Mask known,Mask ones,int oov,int score,int node){
  if(g==int(d.groups.size())){
   out.paths++;out.texts.insert(compact(p));if(d.plant&&equal(p.begin(),p.end(),d.p.begin()+nTrain))out.truthRetained=true;
   Candidate c{train.key,known,ones,state,oov,score,p};if(better(c,out.best))out.best=move(c);return;
  }
  const Tape& w=d.groups[g];
  if(j==int(w.size())){walk(g+1,0,state,known,ones,oov+int(node<0),score,g+1==int(d.groups.size())?-1:root(d.groups[g+1].size()));return;}
  const int pos=d.start[g]+j-nTrain,c=w[j],v=decTable[state][c];
  auto go=[&](int x,int s,Mask kn,Mask on){int sc=score+addScore(p,pos,x);p[pos]=Rune(x);walk(g,j+1,s,kn,on,oov,sc,stepTrie(node,x));};
  if(!c)go(0,state,known,ones);
  if(!v)return;Mask b=bit(v);
  if(known&b)go(v,action[d.side][state][train.key.at(bool(ones&b))],known,ones);
  else{go(v,action[d.side][state][train.key.u],known|b,ones);go(v,action[d.side][state][train.key.v],known|b,ones|b);}
 }
 Hold run(){walk(d.train,0,train.state,train.known,train.ones,0,0,root(d.groups[d.train].size()));return move(out);}
};
string keyJson(const Key& k){ostringstream s;s<<"[["<<slope(k.u)<<","<<intercept(k.u)<<"],["<<slope(k.v)<<","<<intercept(k.v)<<"],["<<slope(k.iv)<<","<<intercept(k.iv)<<"]]";return s.str();}
string candidateJson(const Candidate& c){if(!c.valid())return "null";ostringstream s;s<<"{\"key\":"<<keyJson(c.key)<<",\"known_mask\":"<<c.known<<",\"class1_mask\":"<<c.ones<<",\"state\":"<<c.state<<",\"oov\":"<<c.oov<<",\"score\":"<<c.score<<",\"mean\":"<<double(c.score)/(256*max(1,int(c.p.size())-2))<<",\"decoded\":\""<<compact(c.p)<<"\"}";return s.str();}
string boolean(bool x){return x?"true":"false";}
int main(){
 ifstream in("im-results/lp2-affine-action-unknown-partition-input.txt");if(!in)throw runtime_error("missing input");int n;in>>n;
 unordered_set<string> forms;for(int i=0;i<n;i++){string w;in>>w;if(!forms.insert(w).second)throw runtime_error("duplicate dictionary");Tape p=parse(w);insert(p);if(p.size()==8)anchors.push_back(p);}
 for(auto& s:scores){int x;in>>x;if(x>0||x<-32768)throw runtime_error("score range");s=x;}
 if(n!=40606||anchors.size()!=6294)throw runtime_error("dictionary mismatch");init();
 int cases;in>>cases;vector<Data> ds(cases);
 for(auto& d:ds){int plant,groups;string side;in>>d.name>>side>>plant>>d.train>>groups;d.side=side=="left";d.plant=plant;d.groups.resize(groups);if(d.plant)in>>d.truth.u>>d.truth.v>>d.truth.iv>>d.truthOnes;
  d.start.push_back(0);for(auto& g:d.groups){string w;in>>w;g=parse(w);d.c.insert(d.c.end(),g.begin(),g.end());d.start.push_back(d.c.size());}
  if(d.plant){for(int j=0;j<groups;j++){string w;in>>w;Tape g=parse(w);if(g.size()!=d.groups[j].size())throw runtime_error("plant lengths");d.p.insert(d.p.end(),g.begin(),g.end());}
   if(!noncomm[d.truth.u][d.truth.v]||encode(d.p,d.truth,d.side,d.truthOnes,d.truth.iv).first!=d.c)throw runtime_error("plant mismatch");}
  if(d.groups[0].size()!=8||d.train!=47||groups!=64)throw runtime_error("frame mismatch");
 }
 if(!in)throw runtime_error("truncated input");
 ostringstream out;out<<"{\"nominal_affine_pair_iv_tuples\":516266352,\"unknown_binary_class_labels\":28,\"canonical_first_class\":0,\"cases\":[";
 for(int i=0;i<cases;i++){const Data& d=ds[i];auto start=chrono::steady_clock::now();Stats s=search(d);
  if(i)out<<",";out<<"{\"name\":\""<<d.name<<"\",\"side\":\""<<(d.side?"left":"right")<<"\",\"plant\":"<<boolean(d.plant)<<",\"compatible_anchors\":"<<s.compatible<<",\"anchor_nodes\":"<<s.anchorNodes<<",\"first_use\":"<<s.firstUse<<",\"known_tests\":"<<s.knownTests<<",\"anchor_leaves\":"<<s.anchorLeaves<<",\"anchor_partials\":"<<s.anchorPartials<<",\"anchor_keys\":"<<s.anchorKeys.size()<<",\"train_nodes\":"<<s.trainNodes<<",\"train_keys\":"<<s.trainKeys.size()<<",\"train_paths\":"<<s.trainPaths<<",\"best_ties\":"<<s.trainBestTies<<",\"best\":"<<candidateJson(s.best);
  if(s.best.valid()){
   auto q=encode(s.best.p,s.best.key,d.side,s.best.ones,s.best.key.iv);if(q.first!=Tape(d.c.begin(),d.c.begin()+d.start[d.train])||q.second!=s.best.state||fullScore(s.best.p)!=s.best.score)throw runtime_error("train replay");
   Hold h=HoldSearch(d,s.best).run();if(h.best.valid()){auto e=encode(h.best.p,h.best.key,d.side,h.best.ones,s.best.state);if(e.first!=Tape(d.c.begin()+d.start[d.train],d.c.end())||e.second!=h.best.state)throw runtime_error("hold replay");}
   out<<",\"hold_paths\":"<<h.paths<<",\"hold_distinct_plaintexts\":"<<h.texts.size()<<",\"hold_diagnostic_best\":"<<candidateJson(h.best);
   if(d.plant){bool keyExact=s.best.key==d.truth,trainExact=equal(s.best.p.begin(),s.best.p.end(),d.p.begin()),classesExact=((s.best.ones^d.truthOnes)&s.best.known)==0;out<<",\"actual\":"<<keyJson(d.truth)<<",\"true_class_mask\":"<<d.truthOnes<<",\"true_train_path_retained\":"<<boolean(s.truthRetained)<<",\"key_exact\":"<<boolean(keyExact)<<",\"train_exact\":"<<boolean(trainExact)<<",\"learned_classes_exact\":"<<boolean(classesExact)<<",\"true_holdout_retained\":"<<boolean(h.truthRetained);if(!s.truthRetained||!keyExact||!trainExact||!classesExact||!h.truthRetained)throw runtime_error("blind plant failed");}
  }else if(d.plant)throw runtime_error("plant has no path");
  double sec=chrono::duration<double>(chrono::steady_clock::now()-start).count();out<<",\"elapsed_seconds\":"<<sec<<"}";cerr<<d.name<<" "<<(d.side?"left":"right")<<" anchors "<<s.anchorKeys.size()<<" train keys "<<s.trainKeys.size()<<" paths "<<s.trainPaths<<" nodes "<<s.trainNodes<<" seconds "<<sec<<"\n";
 }
 out<<"]}\n";cout<<out.str();if(const char* file=getenv("SFT_OUTPUT")){ofstream f(file);f<<out.str();}
}
