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
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView from "react-native-maps";

import CustomActions from "./CustomActions";

const firebase = require("firebase");
require("firebase/firestore");

class Chat extends React.Component {
  messages = firebase.firestore().collection("messages");
  messagesUser;
  authUnsubscribe;
  unsubscribeMessageUser;

  state = {
    messages: [],
    id: null,
    isConnected: true,
    image: null,
    location: {
      longitude: null,
      latitude: null
    }
  };

  componentDidMount() {
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        this.setState({
          isConnected: true,
          loading: true
        });

        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async user => {
            if (!user) {
              try {
                await firebase.auth().signInAnonymously();
              } catch (error) {
                console.error(error);
              }
            }

            this.setState({
              id: user.uid,
              loading: false
            });

            this.messagesUser = firebase
              .firestore()
              .collection("messages")
              .where("uid", "==", user.uid || this.state.id);

            this.unsubscribeMessageUser = this.messagesUser.onSnapshot(
              this.onCollectionUpdate
            );
          });
      } else {
        this.setState({
          isConnected: false
        });
        this.getMessages();
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

  pickImage = async () => {
    // Get permissions.
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if (status === "granted") {
      let result;

      try {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "Images"
        });
      } catch (error) {
        console.error(error);
      }

      if (!result.cancelled) {
        this.uploadImage(result.uri);
      }
    }
  };

  uploadImage = async uri => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.error(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    let endPath = uri.substring(uri.lastIndexOf("/") + 1);

    const ref = firebase
      .storage()
      .ref()
      .child(endPath);

    const snapshot = await ref.put(blob);

    blob.close();

    const image = await snapshot.ref.getDownloadURL();

    this.setState({
      image
    });
  };

  takePhoto = async () => {
    // Get permissions
    let [status1, status2] = await Promise.all([
      Permissions.askAsync(Permissions.CAMERA_ROLL),
      Permissions.askAsync(Permissions.CAMERA)
    ]);

    if (status1.status === "granted" && status2.status === "granted") {
      let result;
      try {
        result = await ImagePicker.launchCameraAsync();
      } catch (error) {
        console.error(error);
      }

      if (!result.cancelled) {
        this.uploadImage(result.uri);
      }
    }
  };

  getLocation = async () => {
    // Get permissions
    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status === "granted") {
      let result;
      try {
        result = await Location.getCurrentPositionAsync({});
      } catch (erro) {
        console.error(error);
      }
      if (result) {
        this.setState({
          location: {
            longitude: result.coords.longitude,
            latitude: result.coords.latitude
          }
        });
      }
    }
  };

  getMessages = async () => {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.error(error.message);
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
        system: data.system,
        user: {
          _id: this.state.id
          // name: data.name
        },
        image: this.state.image,
        location: {
          latitude: this.state.latitude,
          longitude: this.state.longitude
        }
      });
    });
  };

  addMessage = ([message]) => {
    // console.log("REBB add message2", message);

    return new Promise((resolve, reject) => {
      resolve(
        this.messages.add({
          text: message.text,
          createdAt: message.createdAt,
          userId: this.state.id,
          user: {
            _id: this.state.id
          },
          image: message.image || "",
          location: {
            latitude: message.location ? message.location.latitude : null,
            longitude: message.location ? message.location.longitude : null
          }
        })
      );
    });
  };

  onSend(message = []) {
    let updatedMessage = message;
    updatedMessage = [
      {
        ...message[0],
        image: this.state.image,
        location: {
          longitude: this.state.location.longitude,
          latitude: this.state.location.latitude
        }
      }
    ];
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, updatedMessage)
      }),
      () => {
        this.saveMessages();

        this.addMessage(updatedMessage)
          .then(() => {
            // reset image, location state after the messages have been sent/added
            this.setState({
              image: null,
              location: {
                latitude: null,
                longitude: null
              }
            });
          })
          .catch(err => console.error(err));
      }
    );
  }

  saveMessages = async () => {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(this.state.messages)
      );
    } catch (err) {
      console.error(err.message);
    }
  };

  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem("messages");
    } catch (error) {
      console.error(error.message);
    }
  };

  renderInputToolbar = props => {
    if (this.state.isConnected === false) {
    } else {
      return <InputToolbar {...props} />;
    }
  };

  renderCustomActions = props => {
    return (
      <CustomActions
        {...props}
        pickImage={this.pickImage}
        takePhoto={this.takePhoto}
        getLocation={this.getLocation}
      />
    );
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

  renderCustomView = props => {
    const { currentMessage } = props;
    const { location } = currentMessage;

    if (location && location.latitude) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
        />
      );
    }
    return null;
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
            renderCustomView={this.renderCustomView}
            renderActions={this.renderCustomActions}
            renderInputToolbar={this.renderInputToolbar}
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
