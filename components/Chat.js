import React from "react";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import KeyboardSpacer from "react-native-keyboard-spacer";
import {
  Text,
  View,
  Platform,
  FlatList,
  AsyncStorage,
  NetInfo
} from "react-native";

const firebase = require("firebase");
require("firebase/firestore");

class Chat extends React.Component {
  messages = firebase.firestore().collection("messages");
  messagesUser;
  authUnsubscribe;
  unsubscribeMessageUser;

  state = {
    messages: [],
    uid: null,
    isConnected: true
  };

  componentDidMount() {
    // AsyncStorage.removeItem("messages");

    this.getMessages();

    NetInfo.isConnected.fetch().then(isConnected => {
      this.unsubscribeMessageUser = this.messages.onSnapshot(
        this.onCollectionUpdate
      );

      if (isConnected) {
        this.setState({
          isConnected: true,
          loading: true
        });
      } else {
        this.setState({
          isConnected: false
        });
      }
    });
  }

  componentWillUnmount() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
    if (this.unsubscribeMessageUser) {
      this.unsubscribeMessageUser();
    }
  }

  getMessages = async () => {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  onCollectionUpdate = querySnapshot => {
    const messages = [];

    querySnapshot.forEach(doc => {
      let data = doc.data();

      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt,
        system: data.system
      });
    });
  };

  addMessage = ([message]) => {
    this.messages.add({
      text: message.text,
      createdAt: message.createdAt,
      uid: this.state.uid
    });
  };

  onSend(message = []) {
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, message)
      }),
      () => {
        this.saveMessages();
      }
    );

    this.addMessage(message);
  }

  saveMessages = async () => {
    try {
      // firebase
      //   .firestore()
      //   .collection("messages")
      //   .get()
      //   .then(async querySnapshot => {
      //     const messages = [];
      //     querySnapshot.forEach(doc => {
      //       const data = doc.data();
      //       messages.push({
      //         _id: Math.round(Math.random() * 1000000),
      //         text: data.text,
      //         createdAt: data.createdA.seconds,
      //         system: data.system
      //       });
      //     });

      //     this.setState({
      //       messages
      //     });

      await AsyncStorage.setItem("messages", JSON.stringify(messages));
      //  });
    } catch (err) {
      console.log(err);
    }
  };

  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem("messages");
    } catch (error) {
      console.log(error.message);
    }
  };

  renderInputToolbar = props => {
    if (this.state.isConnected === false) {
    } else {
      return <InputToolbar {...props} />;
    }
  };

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
            renderInputToolbar={this.renderInputToolbar}
            renderBubble={this.renderBubble}
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: this.state.uid
            }}
          />
          {Platform.OS === "android" ? <KeyboardSpacer /> : null}
        </View>
      </View>
    );
  }
}

export default Chat;
