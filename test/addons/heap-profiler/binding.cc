#include "node.h"
#include "v8.h"
#include "v8-profiler.h"

namespace {
  
  using namespace v8;

  inline void Test(const FunctionCallbackInfo<Value>& args) {
    Isolate* const isolate = args.GetIsolate();
    const HeapSnapshot* const heap_snapshot =
        isolate->GetHeapProfiler()->TakeHeapSnapshot();
    struct : public OutputStream {
      WriteResult WriteAsciiChunk(char*, int) override { return kContinue; }
      void EndOfStream() override {}
    } output_stream;
    heap_snapshot->Serialize(&output_stream, HeapSnapshot::kJSON);
    const_cast<HeapSnapshot*>(heap_snapshot)->Delete();
  }
  
  inline void Initialize(Local<Object> binding) {
    Isolate* const isolate = binding->GetIsolate();
    binding->Set(String::NewFromUtf8(isolate, "test"),
                 FunctionTemplate::New(isolate, Test)->GetFunction());
  }
  
  NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

}  // anonymous namespace
