import React from "react";
import {
  // StyleSheet,
  Text,
  View
  // TextInput,
  // Button,
  // Alert,
  // ScrollView
} from "react-native";

class Chat extends React.Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          color: "white",
          backgroundColor: this.props.navigation.state.params.color
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          {this.props.navigation.state.params.name}
        </Text>

        <Text style={{ color: "white" }}>entered chat! </Text>
      </View>
    );
  }
}

export default Chat;
