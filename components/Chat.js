import React from "react";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import KeyboardSpacer from "react-native-keyboard-spacer";
import { Text, View, Platform, FlatList } from "react-native";

const firebase = require("firebase");
require("firebase/firestore");

firebase.initializeApp({
  // app info...
});

class Chat extends React.Component {
  messages = firebase.firestore().collection("messages");
  messagesUser;
  authUnsubscribe;
  unsubscribeMessageUser;

  state = {
    messages: [],
    id: null
  };

  componentDidMount() {
    this.setState({
      loading: true
    });

    try {
      this.authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
        if (!user) {
          await firebase.auth().signInAnonymously();
        }

        // update user state with currently active user data
        this.setState({
          id: user.uid,
          loading: false
        });

        // create a reference to the active user's documents (shopping lists)
        this.messagesUser = firebase
          .firestore()
          .collection("messages")
          .where("uid", "==", user.uid || this.state.id);

        this.unsubscribeMessageUser = this.messagesUser.onSnapshot(
          this.onCollectionUpdate
        );
      });
    } catch (err) {
      console.error(err);
    }
  }

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribeMessageUser();
  }

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
      userId: this.state.id
    });
  };

  onSend(message = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, message)
    }));

    this.addMessage(message);
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
              _id: this.state.id
            }}
          />
          {Platform.OS === "android" ? <KeyboardSpacer /> : null}
        </View>
      </View>
    );
  }
}

export default Chat;
