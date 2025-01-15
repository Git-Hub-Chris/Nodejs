#include "node_string.h"
#include "crdtp/json.h"
#include "node/inspector/protocol/Protocol.h"
#include "node_json_protocol.h"
#include "simdutf.h"
#include "util-inl.h"

namespace crdtp {

bool ProtocolTypeTraits<std::string>::Deserialize(DeserializerState* state,
                                                  std::string* value) {
  if (state->tokenizer()->TokenTag() == cbor::CBORTokenTag::STRING8) {
    span<uint8_t> cbor_span = state->tokenizer()->GetString8();
    value->assign(reinterpret_cast<const char*>(cbor_span.data()),
                  cbor_span.size());
    return true;
  }
  CHECK(state->tokenizer()->TokenTag() == cbor::CBORTokenTag::STRING16);
  span<uint8_t> utf16le = state->tokenizer()->GetString16WireRep();

  value->assign(node::inspector::protocol::StringUtil::fromUTF16LE(
      reinterpret_cast<const uint16_t*>(utf16le.data()),
      utf16le.size() / sizeof(uint16_t)));
  return true;
}

void ProtocolTypeTraits<std::string>::Serialize(const std::string& value,
                                                std::vector<uint8_t>* bytes) {
  cbor::EncodeString8(SpanFrom(value), bytes);
}

}  // namespace crdtp

namespace node {
namespace inspector {
namespace protocol {
std::unique_ptr<Value> StringUtil::parseJSON(const std::string_view string) {
  if (string.empty())
    return nullptr;

  return ProtocolValueParseJSON(reinterpret_cast<const uint8_t*>(string.data()),
                                string.size());
}

std::unique_ptr<Value> StringUtil::parseJSON(v8_inspector::StringView string) {
  if (string.length() == 0)
    return nullptr;
  if (string.is8Bit())
    return parseJSON(std::string_view(
        reinterpret_cast<const char*>(string.characters8()), string.length()));
  auto utf8 = StringViewToUtf8(string);
  return parseJSON(utf8);
}

String StringUtil::StringViewToUtf8(v8_inspector::StringView view) {
  if (view.length() == 0)
    return "";
  if (view.is8Bit()) {
    return std::string(reinterpret_cast<const char*>(view.characters8()),
                       view.length());
  }
  DCHECK(view.is16Bit());
  return fromUTF16LE(view.characters16(), view.length());
}

String StringUtil::fromDouble(double d) {
  std::ostringstream stream;
  stream.imbue(std::locale::classic());  // Ignore current locale
  stream << std::fixed << d;
  return stream.str();
}

double StringUtil::toDouble(const char* buffer, size_t length, bool* ok) {
  std::istringstream stream(std::string(buffer, length));
  stream.imbue(std::locale::classic());  // Ignore current locale
  double d;
  stream >> d;
  *ok = !stream.fail();
  return d;
}

ProtocolMessage StringUtil::jsonToMessage(String message) {
  return message;
}

ProtocolMessage StringUtil::binaryToMessage(std::vector<uint8_t> message) {
  return std::string(reinterpret_cast<const char*>(message.data()),
                     message.size());
}

String StringUtil::fromUTF8(const uint8_t* data, size_t length) {
  return std::string(reinterpret_cast<const char*>(data), length);
}

String StringUtil::fromUTF16LE(const uint16_t* data, size_t length) {
  auto casted_data = reinterpret_cast<const char16_t*>(data);
  size_t expected_utf8_length =
      simdutf::utf8_length_from_utf16le(casted_data, length);
  MaybeStackBuffer<char> buffer(expected_utf8_length);
  // simdutf::convert_utf16_to_utf8 returns zero in case of error.
  size_t utf8_length =
      simdutf::convert_utf16le_to_utf8(casted_data, length, buffer.out());
  // We have that utf8_length == expected_utf8_length if and only
  // if the input was a valid UTF-16 string. Otherwise, utf8_length
  // must be zero.
  CHECK(utf8_length == 0 || utf8_length == expected_utf8_length);
  // An invalid UTF-16 input will generate the empty string:
  return String(buffer.out(), utf8_length);
}

const uint8_t* StringUtil::CharactersUTF8(const std::string_view s) {
  return reinterpret_cast<const uint8_t*>(s.data());
}

size_t StringUtil::CharacterCount(const std::string_view s) {
  // The utf32_length_from_utf8 function calls count_utf8.
  // The count_utf8 function counts the number of code points
  // (characters) in the string, assuming that the string is valid Unicode.
  // TODO(@anonrig): Test to make sure CharacterCount returns correctly.
  return simdutf::utf32_length_from_utf8(s.data(), s.length());
}

}  // namespace protocol
}  // namespace inspector
}  // namespace node
