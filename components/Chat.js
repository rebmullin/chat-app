import React from "react";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import KeyboardSpacer from "react-native-keyboard-spacer";
import { Text, View, Platform } from "react-native";

class Chat extends React.Component {
  state = {
    messages: []
  };

  componentDidMount() {
    // TODO: integrate real messages once db is set up.
    this.setState({
      messages: [
        {
          _id: 1,
          text: `${this.props.navigation.state.params.name} has joined`,
          createdAt: new Date(),
          system: true
        },
        {
          _id: 2,
          text: "Hello developer",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
            avatar: "https://placeimg.com/140/140/any"
          }
        }
      ]
    });
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));
  }

  renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#000"
          }
        }}
      />
    );
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          color: "white",
          backgroundColor: this.props.navigation.state.params.color
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          {this.props.navigation.state.params.name}
        </Text>

        <View
          style={{
            flex: 1,
            width: "100%"
          }}
        >
          <GiftedChat
            renderBubble={this.renderBubble}
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: 1
            }}
          />
          {Platform.OS === "android" ? <KeyboardSpacer /> : null}
        </View>
      </View>
    );
  }
}

export default Chat;
