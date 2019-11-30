import React from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  // Alert,
  // ScrollView,
  ImageBackground,
  TouchableHighlight,
  TouchableOpacity
} from "react-native";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

class CustomActions extends React.Component {
  state = {
    name: ""
  };
  onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Share Location",
      "Cancel"
    ];

    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex
      },
      async buttonIndex => {
        switch (buttonIndex) {
          case 0:
            if (this.props.pickImage) {
              this.props.pickImage();
            }
            return;
          case 1:
            if (this.props.takePhoto) {
              this.props.takePhoto();
            }
            return;
          case 2:
            if (this.props.getLocation) {
              this.props.getLocation();
            }
            return;
          default:
        }
      }
    );
  };

  render() {
    return (
      <TouchableOpacity
        accessible
        accessibilityLabel="Choose Action"
        accessibilityHint="Choose Action: Pick an image, Take a Photo, Share your location, Cancel"
        accessibilityRole="button"
        style={[styles.container]}
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
    textAlign: "center"
  }
});

export default CustomActions;

CustomActions.contextTypes = {
  actionSheet: PropTypes.func
};
