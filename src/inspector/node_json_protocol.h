#ifndef SRC_INSPECTOR_NODE_JSON_PROTOCOL_H_
#define SRC_INSPECTOR_NODE_JSON_PROTOCOL_H_

#include "node/inspector/protocol/Protocol.h"

namespace node {
namespace inspector {

// Parse s JSON string into protocol::Value.
std::unique_ptr<protocol::Value> ProtocolValueParseJSON(const uint8_t* chars,
                                                        size_t size);

}  // namespace inspector
}  // namespace node

#endif  // SRC_INSPECTOR_NODE_JSON_PROTOCOL_H_
