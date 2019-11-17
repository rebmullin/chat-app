import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  // Alert,
  // ScrollView,
  ImageBackground,
  TouchableHighlight
} from "react-native";

class Start extends React.Component {
  state = {
    name: "",
    color: "#090C08"
  };

  colorSelect = color => {
    // Alert.alert(color);
    this.setState({ color });
  };

  onPressHandler = () => {};
  render() {
    return (
      <ImageBackground
        source={require("../assets/bg.png")}
        style={{ width: "100%", height: "100%" }}
      >
        <View
          style={{
            justifyContent: "center",
            alignContent: "center",
            flex: 2
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 45,
              fontWeight: "600",
              color: "white"
            }}
          >
            Let's Chat!
          </Text>
        </View>
        <View
          style={{
            flex: 5,
            justifyContent: "center",
            alignItems: "center",
            height: "100%"
          }}
        >
          <View
            style={{
              width: "90%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              minHeight: "44%",
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 30,
              paddingBottom: 10
              // borderWidth: 2,
              // borderColor: "red"
            }}
          >
            <TextInput
              placeholder="Your Name"
              style={{
                borderWidth: 2,
                borderColor: "#757083",
                width: "98%",
                height: 60,
                padding: 15,
                fontSize: 16,
                fontWeight: "300",
                color: "#757083",
                opacity: 0.5
                // marginBottom: 10,
                // marginTop: 20
              }}
              onChangeText={name => this.setState({ name })}
            />

            <View style={{ margin: 10, width: "98%" }}>
              <Text
                style={{
                  color: "#737083",
                  fontSize: 16,
                  marginTop: 10,
                  marginBottom: 10,
                  alignSelf: "flex-start"
                }}
              >
                Choose Background Color:
              </Text>
              <View
                style={{ flexDirection: "row", justifyContent: "space-around" }}
              >
                <TouchableHighlight
                  onPress={this.colorSelect.bind(null, "#090C08")}
                >
                  <View style={styles.circles}></View>
                </TouchableHighlight>

                <TouchableHighlight
                  color="red"
                  onPress={this.colorSelect.bind(null, "#474056")}
                >
                  <View
                    style={{ ...styles.circles, backgroundColor: "#474056" }}
                  ></View>
                </TouchableHighlight>

                <TouchableHighlight
                  color="red"
                  onPress={this.colorSelect.bind(null, "#8A95A5")}
                >
                  <View
                    style={{ ...styles.circles, backgroundColor: "#8A95A5" }}
                  ></View>
                </TouchableHighlight>

                <TouchableHighlight
                  onPress={this.colorSelect.bind(null, "#B9C6AE")}
                >
                  <View
                    style={{ ...styles.circles, backgroundColor: "#B9C6AE" }}
                  ></View>
                </TouchableHighlight>
              </View>
            </View>

            <TouchableHighlight
              style={{
                backgroundColor: "#737083",
                width: "100%",
                height: 60,
                marginTop: 20,
                marginBottom: 20,
                justifyContent: "center"
              }}
              onPress={() =>
                this.props.navigation.navigate("Chat", {
                  name: this.state.name,
                  color: this.state.color
                })
              }
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "600"
                }}
              >
                Start Chatting
              </Text>
            </TouchableHighlight>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  circles: {
    width: 40,
    height: 40,
    backgroundColor: "#090C08",
    borderRadius: 20
  }
});

export default Start;
