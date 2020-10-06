(RaiselyComponents) => {
	const {
		ExerciseGoalForm,
		UserForm,
		ProfileFormV2: ProfileForm,
		PaymentFormV2: PaymentForm,
		CompleteForm,
	} = RaiselyComponents.Molecules;
	const { MultiForm } = RaiselyComponents.Molecules;
	const {
		qs,
		get,
		has,
		pick,
		mirrorPathValueFromProfileName,
		displayCurrency,
		apiCurrency,
		processDefaultValue,
		exerciseGoalFromConfig,
		exerciseMultiplierFromConfig,
	} = RaiselyComponents.Common;

	console.log("findme", RaiselyComponents.Molecules);

	return class CustomSignupForm extends React.Component {
		constructor(props) {
			super(props);

			const profile = {
				currency: props.global.campaign.currency,
			};
			// Get default exercise values
			const {
				defaultValue: defaultExerciseValue,
				fieldName: exerciseFieldName,
			} = exerciseGoalFromConfig(props.global.campaign.config);

			if (exerciseFieldName) {
				profile[exerciseFieldName] = defaultExerciseValue;
			}

			const { multiplier } = exerciseMultiplierFromConfig(
				props.global.campaign.config
			);

			const rawQuery = window.location.href.split("?")[1];
			const queryParams = rawQuery ? qs.parse(rawQuery) : {};

			if (queryParams.exerciseGoal) {
				profile.exerciseGoal = queryParams.exerciseGoal * multiplier;
			}
			if (queryParams.exerciseGoalTime) {
				profile.exerciseGoalTime =
					queryParams.exerciseGoalTime * multiplier;
			}
			/* eslint-disable */
			this.state = {
				user: {},
				profile,
				teamProfile: null,
				donation: null,
				donationUuid: null,
				settings: {
					searchGroup: false,
					feeFixed: 28,
					feePercent: 0.0385,
				},
				error: null,
			};
			/* eslint-enable */

			if (queryParams.parentId) {
				this.fetchTeam(queryParams.parentId);
			}
		}

		async fetchTeam(id) {
			const profileData = await this.props.api.profiles.get({ id });
			const profile = profileData.body().data().data;

			this.setState({
				profile: {
					...this.state.profile,
					parentUuid: profile.uuid,
				},
				// ensures we build the correct steps
				// without dropping
				parentProfile: profile,
			});
		}

		updateValues = (
			handleState, // handles state object or state update function
			afterUpdateCallback, // callback after updated
			toRemove // array of keys to totally remove from state
		) => {
			// handle state update function
			if (typeof handleState === "function") {
				return this.setState(handleState, afterUpdateCallback);
			}

			const { state: oldState } = this;

			// setState only updates the state keys it's presented, so only batch
			// changes that are passed through handleState
			const toUpdate = {};

			[
				"user",
				"profile",
				"teamProfile",
				"donation",
				"settings",
				"error",
				"donationUuid",
				"wasFacebookSignup",
				"loginToken",
			].forEach((updateKey) => {
				// only apply certain values to setState if they actually changes
				if (!handleState[updateKey]) return;

				// apply the updated values to the old one and append
				toUpdate[updateKey] = {
					...oldState[updateKey],
					...handleState[updateKey],
				};

				// handle non-object top level state
				if (typeof handleState[updateKey] !== "object") {
					toUpdate[updateKey] = handleState[updateKey];
				}
			});

			(toRemove || []).forEach((key) => (toUpdate[key] = null));

			return this.setState(toUpdate, afterUpdateCallback);
		};

		render() {
			const { props: defaultProps } = this;
			const props = {
				...defaultProps,
				...this.props.getValues(),
			};

			const steps = [];

			if (props.enableExerciseGoal) {
				steps.push(ExerciseGoalForm);
			}

			steps.push(UserForm);
			steps.push(ProfileForm);

			if (props.enableRego || props.enableDonation) {
				steps.push(PaymentForm);
			}

			steps.push(CompleteForm);

			return (
				<MultiForm
					{...{
						name: "signup-form",
						variant: "signup-form--v2",
						promptOnLeave:
							"Leaving this page will require you to re-enter your information. Are you sure you want to leave?",
						...props, // make global state accessible
						values: this.state, // add in form data
						updateValues: this.updateValues, // form data update function
						steps, // each step's react component
						error: this.state.error,
					}}
				/>
			);
		}
	};
};
