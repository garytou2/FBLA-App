import React from "react";
import {
	TouchableOpacity,
	TouchableWithoutFeedback,
	Keyboard,
	StyleSheet,
} from "react-native";
import { colors, strings } from "../config/styles";
import * as firebase from "firebase";
import "firebase/firestore";
import {
	Button,
	Content,
	Spinner,
	Container,
	Text,
	View,
	Form,
	Item,
	Label,
	Input,
	Footer,
} from "native-base";
import { userConverter } from "../config/user";
import {chapterConverter, getChapterInitialized} from "../config/chapter";
import {StackActions} from "@react-navigation/native";

export default class JoinChapScreen extends React.Component {
	state = {
		code: "",
		errorMessage: null,
		loading: false,
	};

	startChapter = (chapterID) =>{

		let chapterListener = firebase
			.firestore()
			.collection("Chapter")
			.doc(chapterID)
			.onSnapshot(
				(doc) => {
					console.log(doc.data());
					if (doc.data() != null) {
						chapterConverter.setCurChapter(doc);

						if (getChapterInitialized() === false) {
							chapterConverter.setInit(true);
							chapterConverter.addListener(chapterListener);
						}
						this.setState({ errorMessage: null, loading: false });
						this.props.navigation.dispatch(StackActions.replace("App"));
					}
				},
				() => {
					console.log("User Logged Out");
				}
			);

	}

	joinChapter = () => {
		this.setState({ errorMessage: null, loading: true });
		const user = firebase.auth().currentUser;
		const { code } = this.state;
		firebase
			.firestore()
			.collection("Chapter")
			.where("code", "==", parseInt(code))
			.get()
			.then((querySnapshot) => {
				if (querySnapshot.size === 0) {
					this.setState({
						errorMessage: "No chapter with code given",
						loading: false,
					});
				} else {
					querySnapshot.forEach((doc) => {
						firebase
							.firestore()
							.collection("DatabaseUser")
							.doc(user.uid)
							.set(
								{
									chapterID: doc.data().chapterID,
									inChapter: true,
								},
								{ merge: true }
							)
							.then(() => {
								this.startChapter(doc.data().chapterID);
							});
					});
				}
			});
	};

	render() {
		console.log("here");
		return (
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<Container>
					<Content contentContainerStyle={styles.content}>
						<Text style={styles.heading}>Join a Chapter!</Text>

						<Form>
							<Item floatingLabel style={styles.noLeftMargin}>
								<Label style={styles.codeLabelText}>Enter Chapter Code</Label>
								<Input
									style={styles.codeInput}
									autoCapitalize="none"
									onChangeText={(code) => this.setState({ code })}
									value={this.state.code}
								/>
							</Item>
							<Button
								block
								style={styles.codeButton}
								onPress={this.joinChapter}
							>
								{this.state.loading ? (
									<Spinner color={colors.white} />
								) : (
									<Text style={styles.codeButtonText}>Join</Text>
								)}
							</Button>
						</Form>

						<TouchableOpacity
							style={styles.signOutButton}
							onPress={() => {
								userConverter.signOut();
							}}
						>
							<Text style={styles.signOutText}>Sign Out</Text>
						</TouchableOpacity>

						<View style={styles.errorContainer}>
							<Text style={styles.errorText}>{this.state.errorMessage}</Text>
						</View>
					</Content>

					<TouchableWithoutFeedback
						onPress={() => this.props.navigation.navigate("CreateChap")}
					>
						<Footer style={styles.footer}>
							<Text style={styles.redirectText}>
								Don't have a Chapter?{" "}
								<Text style={{ color: colors.complementAccent }}>
									Create one.
								</Text>
							</Text>
						</Footer>
					</TouchableWithoutFeedback>
				</Container>
			</TouchableWithoutFeedback>
		);
	}
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		justifyContent: "center",
		marginHorizontal: 50,
	},
	heading: {
		fontSize: 24,
		textAlign: "center",
	},
	errorContainer: {
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: 30,
		marginTop: 15,
	},
	errorText: {
		color: colors.complementAccent,
		fontSize: 13,
		textAlign: "center",
	},
	codeLabelText: {
		color: colors.lightText,
		fontSize: 15,
		textTransform: "uppercase",
	},
	codeButtonText: {
		color: colors.white,
		fontSize: 16,
	},
	codeInput: {
		fontSize: 20,
	},
	codeButton: {
		backgroundColor: colors.complementAccent,
		borderRadius: 4,
		marginTop: 30,
	},
	signOutButton: {
		alignSelf: "center",
		marginTop: 20,
	},
	redirectText: {
		color: colors.mediumText,
		fontSize: 13,
	},
	signOutText: {
		color: colors.mediumText,
		fontSize: 13,
	},
	footer: {
		alignItems: "center",
		backgroundColor: colors.white,
		borderTopWidth: 1,
		borderTopColor: "#d3d3d3",
	},
	noLeftMargin: {
		marginLeft: 0,
	},
});
