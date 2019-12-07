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
                // eslint-disable-next-line no-console
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

  /**
   * selects an image
   * @async
   * @return {void} selects an image
   */
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
        // eslint-disable-next-line no-console
        console.error(error);
      }

      if (!result.cancelled) {
        this.uploadImage(result.uri);
      }
    }
  };

  /**
   * uploads an image to firestore
   * @async
   * @return {Promise} uploads an image to firestore
   */
  uploadImage = async uri => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        // eslint-disable-next-line no-console
        console.error(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const endPath = uri.substring(uri.lastIndexOf("/") + 1);

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

  /**
   * takes picture
   * @async
   * @return {Promise} launches camera to take picture
   */
  takePhoto = async () => {
    // Get permissions
    const [status1, status2] = await Promise.all([
      Permissions.askAsync(Permissions.CAMERA_ROLL),
      Permissions.askAsync(Permissions.CAMERA)
    ]);

    if (status1.status === "granted" && status2.status === "granted") {
      let result;
      try {
        result = await ImagePicker.launchCameraAsync();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }

      if (!result.cancelled) {
        this.uploadImage(result.uri);
      }
    }
  };

  /**
   * gets the users location
   * @async
   * @return {Promise<string>} The location
   */
  getLocation = async () => {
    // Get permissions
    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status === "granted") {
      let result;
      try {
        result = await Location.getCurrentPositionAsync({});
      } catch (error) {
        // eslint-disable-next-line no-console
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

  /**
   * loads all messages from AsyncStorage
   * @async
   * @return {Promise<string>} The data from the storage
   */
  getMessages = async () => {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error.message);
    }
  };

  /**
   * loads all messages from AsyncStorage
   * @async
   * @return {Promise<string>} The data from the storage
   */
  onCollectionUpdate = querySnapshot => {
    const messages = [];
    const { id, image, latitude, longitude } = this.state;

    querySnapshot.forEach(doc => {
      const data = doc.data();

      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt,
        system: data.system,
        user: {
          _id: id
        },
        image,
        location: {
          latitude,
          longitude
        }
      });
    });
  };

  /**
   * adds a messages
   * @async
   * @param {Array} message
   * @return {Promise} adds a message to giftchat
   */
  addMessage = ([message]) => {
    const { id } = this.state;
    return new Promise(resolve => {
      resolve(
        this.messages.add({
          text: message.text,
          createdAt: message.createdAt,
          userId: id,
          user: {
            _id: id
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

  /**
   * sends a messages
   * @param {Array} message
   * @return {Promise} sends a message to giftchat
   */
  onSend = (message = []) => {
    const { image, location } = this.state;

    let updatedMessage = message;
    updatedMessage = [
      {
        ...message[0],
        image,
        location: {
          longitude: location.longitude,
          latitude: location.latitude
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
          .catch(err => {
            // eslint-disable-next-line no-console
            console.error(err);
          });
      }
    );
  };

  /**
   * saves messages
   * @async
   * @return {void} save messages to AsyncStorage
   */
  saveMessages = async () => {
    const { messages } = this.state;
    try {
      await AsyncStorage.setItem("messages", JSON.stringify(messages));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message);
    }
  };

  /**
   * delete messages
   * @async
   * @return {void} delete mesasges from AsyncStorage
   */
  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem("messages");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error.message);
    }
  };

  /**
   * renders a toolbar
   * @param {props}
   * @return {Object} renders a toolbar if the user is connected
   */
  renderInputToolbar = props => {
    const { isConnected } = this.state;
    if (isConnected) {
      return <InputToolbar {...props} />;
    }
  };

  /**
   * renders a custom actions button
   * @param {props}
   * @return {Object} renders a custom actions button
   */
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

  /**
   * renders bubbles
   * @param {props}
   * @return {Object} renders bubbles
   */
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

  /**
   * renders map view
   * @param {props}
   * @return {Object} renders map view when the user shares their location
   */
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
    const { navigation } = this.props;
    const { messages, id } = this.state;
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          color: "white",
          backgroundColor: navigation.state.params.color
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          {navigation.state.params.name}
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
            messages={messages}
            onSend={messagesToSend => this.onSend(messagesToSend)}
            user={{
              _id: id
            }}
          />
          {Platform.OS === "android" ? <KeyboardSpacer /> : null}
        </View>
      </View>
    );
  }
}

export default Chat;
