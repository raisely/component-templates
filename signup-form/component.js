// TODO: cleanup and better inline documentation

// eslint-disable-next-line
(RaiselyComponents, React) => {
	const { api, Form, Spinner, Common } = RaiselyComponents;
	const { Button, Icon } = RaiselyComponents.Atoms;
	const { findMostRelevantProfile } = RaiselyComponents.Common;
	const { CustomFieldsProvider } = RaiselyComponents.Modules;
	const {
		MultiForm,
		DonationForm,
		ProfilePreviewByUuid,
		ProfileSelect,
	} = RaiselyComponents.Molecules;

	// define inline configuration
	const config = {
		enableTeams: true,
		enableFacebook: true,
		accountTitle: 'Your Account',
		challengeTitle: 'Your Challenge',
		profileTitle: 'Your Fundraising Page',
		teamTitle: 'Your Team Page',
		paymentDonationTitle: 'Kickstart your Fundraising',
		paymentRegistrationTitle: 'Pay the Registration Fee',
		accountButton: 'Continue',
		profileButton: 'Continue',
		teamButton: 'Continue',
		paymentButton: 'Complete my Registration',
		feeType: 'Donation',
		registrationAmount: 5000,
	};

	class FacebookLogin extends React.Component {
		facebookLogin = (e) => {
			e.preventDefault();
			const { update } = this.props;
			window.FB.login((response) => {
				if (response.authResponse) {
					window.FB.api('/me?fields=email,first_name,last_name,name,picture,id', (r) => {
						const {
							first_name: firstName, last_name: lastName, name: fullName, email, id,
						} = r;
						update({
							firstName, lastName, fullName, preferredName: firstName, email, facebookId: id,
						});
					});
				} else {
					console.log('User cancelled login or did not fully authorize.');
				}
			}, { scope: 'email' });
		}

		render() {
			const { fbSDK } = this.props;

			return (
				<div className="signup-form__facebook" disabled={!fbSDK}>
					<Button className="button--facebook" onClick={this.facebookLogin}>
						<Icon name="facebook" theme="inverted" /> Sign up with Facebook
					</Button>
					<p>or use an email and password</p>
				</div>
			);
		}
	}

	class UserForm extends React.Component {
		state = {
			alreadyExists: false,
			email: '',
		};

		componentDidMount() {
			console.log({ userProps: this.props });
			this.props.actions.loadIntegration('fbSDK', this.props.global);
		}

		checkIfProfileExists = async (email) => {
			const existsRes = await api.users.checkUser({
				email,
				campaignUuid: this.props.global.campaign.uuid,
			});

			return existsRes.body().data().data.status !== 'OK';
		}

		next = async (user) => {
			const profileAlreadyExists = await this.checkIfProfileExists(user.email);

			if (profileAlreadyExists) {
				this.setState({ alreadyExists: true, email: user.email });
				return;
			}

			const nextStep = () => this.props.updateStep(this.props.step + 1);
			this.props.updateValues({ user }, nextStep);
		}

		render() {
			const {
				global,
				passwordLength,
				values,
			} = this.props;

			const { fbSDK } = this.props.integrations;

			if (this.state.alreadyExists) {
				return (
					<div className="signup-form__exists">
						<p><strong>It looks like {'you\'re'} already signed up to this campaign with {this.state.email}.</strong>
							You can access your dashboard by logging in with your email and password.
						</p>
						<Button
							theme="primary"
							href="/login"
						>
							Log In
						</Button>
						<Button
							theme="primary"
							href="/reset"
						>
							Reset my Password
						</Button>
					</div>
				);
			}

			return (
				<CustomFieldsProvider global={global} name="user">
					{fields => (
						<div className="signup-form__account">
							<h3 className="signup-form__account--heading">{config.accountTitle}</h3>
							{config.enableFacebook && global.campaign.config.site.facebook.active && (
								<FacebookLogin 
									update={user => this.props.updateValues({ user })}
									fbSDK={fbSDK} 
									/>
							)}
							<Form
								unlocked
								fields={[...fields, ...(values.user.facebookId && values.user.facebookId.length > 0) ? [] : [
									{
										active: true,
										core: true,
										id: 'password',
										label: 'Password',
										locked: false,
										private: false,
										required: true,
										type: 'password',
										minLength: passwordLength || 3,
									},
									{
										active: true,
										core: true,
										id: 'password2',
										label: 'Confirm Password',
										locked: false,
										private: false,
										required: true,
										compare: 'password',
										type: 'password',
										minLength: passwordLength || 3,
									},
								]]}
								values={this.props.values.user}
								actionText={config.accountButton}
								action={this.next} />
						</div>
					)}
				</CustomFieldsProvider>
			);
		}
	}


	/**
	 * Challenge Type Form
	 * @type {Class}
	 */

	const ProfileTypeForm = ({
		updateStep, updateValues, step,
	}) => {
		const next = () => updateStep(step + 1);
		const back = (e) => {
			e.preventDefault();
			updateStep(step - 1);
		};

		const update = (type, searchGroup = false) => () => {
			// handle creating group profile situation
			if (type === 'GROUP') {
				return updateValues({
					profile: { type: 'INDIVIDUAL' },
					teamProfile: { type: 'GROUP' },
					settings: { searchGroup: false, createTeam: true },
				}, next);
			}

			// handle both individual profile creation situations
			return updateValues({
				profile: { type },
				teamProfile: null,
				settings: { searchGroup, createTeam: false },
			}, next);
		};

		return (
			<div className="signup-form__profile-type">
				<h3>{config.challengeTitle}</h3>
				<p>How would you like to participate in the campaign?</p>
				<div className="signup-form__profile-options">
					<Button className="button--primary signup-form__button" onClick={update('INDIVIDUAL')}>Individual</Button>
					<Button className="button--primary signup-form__button" onClick={update('INDIVIDUAL', true)}>Join a Team</Button>
					<Button className="button--primary signup-form__button" onClick={update('GROUP')}>Start a Team</Button>
				</div>
				<div className="signup-form__nav">
					<button className="signup-form__back" onClick={back}>
						<Icon name="chevron_left" size="small" /> Back
					</button>
				</div>
			</div>
		);
	};


	/**
	 * Individual Profile Form
	 * @type {Class}
	 */

	const ProfileForm = ({
		updateStep, step, updateValues, global, values,
	}) => {
		const action = (profile) => {
			const next = () => updateStep(step + 1);
			updateValues({ profile }, next);
		};

		const back = (e) => {
			e.preventDefault();
			updateStep(step - 1);
		};

		// bootstrap some defaults
		if (!values.profile.name) {
			const { user } = values;

			Object.assign(values.profile, {
				name: `${user.firstName || user.first_name} ${user.lastName || user.last_name}`,
			});
		}

		const buttons = ({ setFieldsTouched }) => (
			<div className="signup-form__nav">
				<Button className="signup-form__profile--next" onClick={setFieldsTouched} type="submit">
					{config.profileButton}
				</Button>
				<br />
				<button className="signup-form__back" onClick={back}>
					<Icon name="chevron_left" size="small" /> Back
				</button>
			</div>
		);

		const JoinGroup = () => {
			if (values.settings.searchGroup) {
				if (values.profile.parentUuid) {
					return (
						<ProfilePreviewByUuid
							api={api}
							uuid={values.profile.parentUuid}
							cancel={() => updateValues({ profile: { parentUuid: null } })}
						/>
					);
				}
				return (
					<div className="signup-form__profile-select">
						<ProfileSelect
							api={api}
							global={global}
							update={value => updateValues({ profile: { parentUuid: value } })}
						/>
						<Button className="signup-form__profile-select__back" onClick={back}>
							Back
						</Button>
					</div>
				);
			}
			return null;
		};

		const ProfileFormRender = ({ fields }) => {
			if (values.settings.searchGroup) {
				if (values.profile.parentUuid) {
					// show form if the parent has been selected and this is a join a group form
					return (<Form
						values={values.profile}
						fields={fields}
						global={global}
						action={action}
						buttons={buttons}
						onChange={(...change) => Common.mirrorPathValueFromProfileName(...change)}
					/>);
				}
				// return nothing if a parent hasnt been selected
				return null;
			}

			// otherwise just return the form
			return (
				<Form
					values={values.profile}
					global={global}
					fields={fields}
					action={action}
					buttons={buttons}
					onChange={(...change) => Common.mirrorPathValueFromProfileName(...change)}
				/>
			);
		};

		return (
			<CustomFieldsProvider global={global} name="profile">
				{fields => (
					<div className="signup-form__profile">
						<h3>{config.profileTitle}</h3>
						<JoinGroup />
						<ProfileFormRender fields={fields} />
					</div>
				)}
			</CustomFieldsProvider>
		);
	};

	/**
	 * Team profile form
	 *
	 */
	const TeamProfileForm = ({
		updateStep, step, updateValues, global, values,
	}) => {
		const action = (teamProfile) => {
			const next = () => updateStep(step + 1);
			updateValues({ teamProfile }, next);
		};

		const back = (e) => {
			e.preventDefault();
			updateStep(step - 1);
		};

		const buttons = ({ setFieldsTouched }) => (
			<div className="signup-form__nav">
				<Button className="signup-form__team-profile__next" onClick={setFieldsTouched} type="submit">
					{config.teamButton}
				</Button>
				<br />
				<button className="signup-form__back" onClick={back}>
					<Icon name="chevron_left" size="small" /> Back
				</button>
			</div>
		);

		// add default currency
		if (!values.teamProfile) {
			Object.assign(values, {
				teamProfile: {
					currency: values.profile.currency,
				},
			});
		} else {
			Object.assign(values, {
				teamProfile: Object.assign(values.teamProfile, {
					currency: values.profile.currency,
				}),
			});
		}

		return (
			<CustomFieldsProvider global={global} name="profile">
				{fields => (
					<div className="signup-form__team-profile">
						<h3>{config.teamTitle}</h3>
						<Form
							values={values.teamProfile}
							global={global}
							fields={fields}
							action={action}
							buttons={buttons}
							onChange={(...change) => Common.mirrorPathValueFromProfileName(...change)}
						/>
					</div>
				)}
			</CustomFieldsProvider>
		);
	};

	/**
	 * Payment Form
	 * @type {Class}
	 */

	class PaymentForm extends React.Component {
		next = () => this.props.updateStep(this.props.step + 1);
		back = () => this.props.updateStep(this.props.step - 1);
		submit = ({
			// complete donation object with token
			data,
			// stripe response object
			// token,
		}) => {
			// add appropriate items
			const items = config.feeType === 'Donation' ? [{
				amount: data.amount, type: 'OTHER', includeInTotals: true, description: 'Self-donation',
			}] : [{
				amount: data.amount, type: 'REGISTRATION', includeInTotals: false, description: 'Registration Fee',
			}];

			Object.assign(data, { items });
			// update values and go to next step
			this.props.updateValues({ donation: data }, this.next);
		}

		render() {
			// needs skips and back buttons
			return (
				<div className="signup-form__payment">
					<h3>{config.feeType === 'Registration' ? config.paymentRegistrationTitle : config.paymentDonationTitle}</h3>
					<DonationForm
						{...this.props}
						feeType={config.feeType}
						title={config.paymentDonationTitle}
						perks={false}
						recurring={false}
						existingCards={false}
						user={this.props.values.user}
						onTokenSuccess={this.submit}
					/>
					<div className="signup-form__nav">
						{config.feeType !== 'Registration' && (
							<Button className="signup-form__skip-payment" theme="secondary" onClick={this.next} type="submit">
								Skip this step and complete registration
							</Button>
						)}
					</div>
				</div>
			);
		}
	}

	class CompleteForm extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				loading: true,
				message: null,
			};

			this.submitData = this.submitData.bind(this);
		}

		componentDidMount() {
			this.submitData();
		}

		async submitData() {
			const {
				updateStep, step, updateValues, actions,
			} = this.props;

			try {
				const res = await api.campaigns.register({
					id: this.props.global.campaign.uuid,
					data: { data: this.props.values },
				});

				const { token, message } = res.body().data();
				if (token) {
					// log user in
					const user = await api.users.setTokenGetUser(token);

					// add user to global state
					actions.addUser(user.body().data().data);

					// get profiles
					const profiles = await api.users.meWithProfiles();

					// add profile to user
					actions.addUserProfile(findMostRelevantProfile(profiles
						.body().data().data, this.props.global.campaign.uuid));

					// redirect to dashboard
					this.props.history.push('/dashboard');
				} else {
					// if no token display message because user already exists
					this.setState({ message, loading: false });
				}
			} catch (e) {
				const next = () => updateStep(step - 1);
				updateValues({
					error: {
						message: (e.response && e.response.data) ?
							e.response.data.errors[0].message
							: 'We couldn\'t register you due to an unexpected error. Please try again.',
					},
				}, next);
			}
		}

		render() {
			if (this.state.loading) {
				return (
					<div className="signup-form__loading">
						<Spinner />
						<p>One moment...</p>
					</div>
				);
			}
			return (
				<div className="signup-form__complete">
					<p>{this.state.message}</p>
				</div>
			);
		}
	}

	/**
	 * Core Signup Form molecule
	 */
	return class SignupForm extends React.Component {
		constructor(props) {
			super(props);

			const initState = {
				user: {},
				profile: {
					currency: props.global.campaign.currency,
				},
				teamProfile: null,
				donation: null,
				settings: {
					searchGroup: false,
					feeFixed: 28,
					feePercent: 0.0385,
				},
				error: null,
			};

			const steps = this.buildSteps(initState);

			this.state = Object.assign(initState, { steps });
		}

		calculateFee = (donation) => {
			return Object.assign({}, donation, {
				amount: Number(donation.amount),
				fee: (donation.feeOptIn) ? (this.state.settings.feeFixed +
					(Number(donation.amount) * this.state.settings.feePercent)).toFixed(0) : 0,
			});
		}

		updateValues = (
			handleState, // handles state object or state update function
			afterUpdateCallback // callback after updated
		) => {
			// handle state update function
			if (typeof handleState === 'function') {
				return this.setState(handleState, afterUpdateCallback);
			}

			const { state: oldState } = this;

			// setState only updates the state keys it's presented, so only batch
			// changes that are passed through handleState
			const toUpdate = {};

			['user', 'profile', 'teamProfile', 'donation', 'settings', 'error'].forEach((updateKey) => {
				// only apply certain values to setState if they actually changes
				if (!handleState[updateKey]) return;

				// apply the updated values to the old one and append
				toUpdate[updateKey] = { ...oldState[updateKey], ...handleState[updateKey] };
			});

			return this.setState(toUpdate, afterUpdateCallback);
		}

		buildSteps = (initState) => {
			const steps = [UserForm];
			if (config.enableTeams) steps.push(ProfileTypeForm);
			if (initState.settings.createTeam) steps.push(TeamProfileForm);
			steps.push(ProfileForm);
			if (config.feeType !== 'None') steps.push(PaymentForm);
			steps.push(CompleteForm);
			return steps;
		}

		render() {
			return (
				<MultiForm {...{
					name: 'signup-form',
					...this.props, // make global state accessable
					values: this.state, // add in form data
					updateValues: this.updateValues, // form data update function
					steps: this.buildSteps(this.state), // each step's react component
					error: this.state.error,
				}} />
			);
		}
	};
};
