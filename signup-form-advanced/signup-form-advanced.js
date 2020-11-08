(RaiselyComponents, { useState, useEffect, Fragment }) => {
	const {
		ExerciseGoalForm,
		UserForm,
		ProfileFormV2: ProfileForm,
		CompleteForm,
		DonationFormMinimal,
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
		htmr,
	} = RaiselyComponents.Common;
	const { Button, Input, Icon } = RaiselyComponents.Atoms;
	const { styled } = RaiselyComponents;

	const Wrapper = styled("div")`
		.signup-form__merch__item {
			display: flex;
			margin: 1rem 0;
			background: #eee;
			padding: 1.5rem;

			&-content {
				width: 60%;
				text-align: left;

				p {
					margin-bottom: 1rem;
				}
			}
			&-bg {
				width: 35%;
				background-color: white;
				background-size: contain;
				flex: 1;
				margin-left: 5%;
				background-repeat: no-repeat;
				background-position: center center;
			}
		}
		.signup-form__merch__cart {
			display: flex;
			margin: 0.5rem 0;
			padding: 0.5rem 1rem;
			background: #eee;

			&-title {
				flex-grow: 1;
				text-align: left;
				align-self: center;
			}

			&-price {
				text-align: right;
				align-self: center;
				margin-right: 0.5rem;
				font-weight: bold;
			}

			.signup-form__merch--remove {
				font-size: 0.8rem;
				width: 100px;
			}
		}
	`;

	const MerchForm = ({
		updateValues,
		values,
		step,
		updateStep,
		global,
		merchDescription,
		merchTitle,
		merchandise,
	}) => {
		const [items, setItems] = useState(
			merchandise.map((item) => ({
				...item,
				option: item.options ? item.options.split(",")[0].trim() : null,
				quantity: 1,
			}))
		);

		const [cart, setCart] = useState(values.settings.cart || []);

		const updateItem = (index, name, value) => {
			items[index][name] = value;
			setItems([...items]);
		};

		const cartQty = (item) => {
			return cart.filter((i) => i.internalTitle === item.internalTitle)
				.length;
		};

		const addToCart = (e, item) => {
			setCart([...cart, { ...item }]);
		};

		const removeFromCart = (e, index) => {
			const newCart = [...cart];
			newCart.splice(index, 1);
			setCart([...newCart]);
		};

		const onSubmit = () => {
			updateValues(
				{
					settings: {
						cart,
						items: cart.map((item) => ({
							type: "OTHER",
							description: `${item.internalTitle}${
								Boolean(item.option) ? ` - ${item.option}` : ""
							}`,
							qty: 1,
							includeInTotals: false,
							amount: item.price * 100,
							private: {
								merchandise: true,
								title: item.title,
								option: item.option,
								description: item.description,
							},
						})),
					},
				},
				() => updateStep(step + 1)
			);
		};

		const back = () => {
			return updateStep(step - 1);
		};

		return (
			<Wrapper className="signup-form__merch">
				{merchTitle && (
					<h3 className="signup-form__merch__heading">
						{merchTitle}
					</h3>
				)}
				{merchDescription && (
					<p className="signup-form__merch__description">
						{merchDescription}
					</p>
				)}
				{items.length > 0 &&
					items.map((item, index) => (
						<div className="signup-form__merch__item">
							<div className="signup-form__merch__item-content">
								<h4>{item.title}</h4>
								<h6>${item.price}</h6>
								<p>{htmr(item.description)}</p>

								{Boolean(item.options) && (
									<Input
										type="select"
										change={(name, value) =>
											updateItem(index, "option", value)
										}
										options={item.options
											.split(",")
											.map((item) => ({
												value: item.trim(),
												label: item.trim(),
											}))}
										label={
											item.optionsLabel ||
											"Choose an option"
										}
										value={item.option}
										name="option"
									/>
								)}

								{cartQty(item) < item.maxQuantity ? (
									<Button
										onClick={(e) => addToCart(e, item)}
										className="signup-form__merch--add button--full"
										theme="secondary"
									>
										+ Add
									</Button>
								) : (
									<Button
										className="signup-form__merch--add button--full"
										theme="secondary"
										disabled
									>
										+ Add
									</Button>
								)}
							</div>
							<div
								className="signup-form__merch__item-bg"
								style={{
									backgroundImage: `url(${item.image})`,
								}}
							></div>
						</div>
					))}
				{cart.length > 0 && (
					<h3 className="signup-form__merch__card-heading">
						Your Cart
					</h3>
				)}
				{cart.length > 0 &&
					cart.map((item, index) => (
						<div className="signup-form__merch__cart">
							<div className="signup-form__merch__cart-title">
								{item.title}{" "}
								{Boolean(item.option) && `- ${item.option}`}
							</div>
							<div className="signup-form__merch__cart-price">
								${item.price}
							</div>
							<Button
								onClick={(e) => removeFromCart(e, index)}
								className="signup-form__merch--remove"
								theme="inverse"
							>
								- Remove
							</Button>
						</div>
					))}
				<div className="signup-form__navigation">
					<Button
						onClick={onSubmit}
						className="signup-form__exercise--next button--full"
						type="submit"
					>
						Next
					</Button>
					<button
						className="signup-form__navigation__link signup-form__back"
						onClick={(e) => back(e)}
					>
						<Icon name="chevron_left" size="small" />
						<span>Back</span>
					</button>
				</div>
			</Wrapper>
		);
	};

	class PaymentForm extends React.Component {
		state = {
			loading: false,
			promoCode: "",
		};
		next = () => this.props.updateStep(this.props.step + 1);
		back = () => this.props.updateStep(this.props.step - 1);

		submit = async ({
			data, // complete donation object with token
			processSCADonation, // process an SCA-based donation
		}) => {
			const registrationItems = [];
			if (this.props.enableRego) {
				const { amount } = this.getRegistrationAmount();
				// If registration fee is enabled, push the item
				if (amount) {
					registrationItems.push({
						amount,
						type: "REGISTRATION",
						includeInTotals: false,
						description: this.props.registrationDescription || "Registration Fee",
					});
				}
				// If there's also a self donation, add as an item
				if (this.props.enableDonation) {
					const selfDonationAmount = data.amount - amount;
					if (selfDonationAmount) {
						registrationItems.push({
							amount: selfDonationAmount,
							type: "OTHER",
							includeInTotals: true,
							description: "Self-donation",
						});
					}
				}
				// If there's not a registration fee, but there is a self donation
				// push that too
			} else if (this.props.enableDonation) {
				if (data.amount) {
					registrationItems.push({
						amount: data.amount,
						type: "OTHER",
						includeInTotals: true,
						description: "Self-donation",
					});
				}
			}
			// Merge the registration items in with any specified items from prev steps
			Object.assign(data, {
				items: [
					...(data.items || []),
					...registrationItems,
					...this.props.values.settings.items,
				],
			});

			if (processSCADonation) {
				// We're in SCA mode, so process the donation and then set the donation state as uuid
				// Also bind forRegistration value to payload

				// Show the spinner
				this.setState({ loading: true });

				// Assemble the SCA payload
				const donationPayload = {
					...data,
					...pick(this.props.values.user, [
						"firstName",
						"lastName",
						"preferredName",
						"fullName",
						"email",
					]),
					forRegistration: this.props.values.profile.path,
				};

				const { api } = this.props;
				// create donation with special intent secret passed back
				try {
					const result = (
						await api.donations.create({
							data: donationPayload,
						})
					)
						.body()
						.data();

					// process the #D payment (if applicable)
					await processSCADonation(result);

					// update values and go to next step
					this.props.updateValues(
						{
							donation: { uuid: result.data.uuid },
							loginToken: result.token,
						},
						this.next
					);
				} finally {
					this.setState({ loading: false });
				}
			} else {
				// update values and go to next step
				this.props.updateValues({ donation: data }, this.next);
			}
		};

		getRegistrationAmount = () => {
			const {
				registrationAmount,
				registrationAmountField,
				promoCodes,
				global,
			} = this.props;
			let amount = registrationAmount;
			let description = "Registration Fee";

			if (registrationAmountField) {
				const dynamicAmount = get(
					this.props.values,
					registrationAmountField
				);
				amount = dynamicAmount
					? apiCurrency(
							dynamicAmount.split(":")[0],
							global.campaign.currency
					  )
					: amount;
				description =
					dynamicAmount && dynamicAmount.split(":")[1]
						? dynamicAmount.split(":")[1]
						: description;
			}

			if (promoCodes && promoCodes.length > 0) {
				if (this.state.code && this.state.code.discount) {
					amount = amount * ((100 - this.state.code.discount) / 100);
				}
			}

			return { amount, description };
		};

		getMerch = () => {
			const merchItems = this.props.values.settings.items;
			const merchAmount = merchItems.reduce(
				(prev, curr) => prev + curr.amount,
				0
			);
			return { merchItems, merchAmount };
		};

		setPromoCode = (value = '') => {
			const {
				promoCodes,
			} = this.props;
			const code = promoCodes.find(
				(c) =>
					c.code.toLowerCase() ===
					value.trim().toLowerCase()
			);
			this.setState({
				promoCode: value,
				code,
			});

			if (code) {
				this.props.updateValues({
					profile: {
						public: {
							...this.props.values.profile.public,
							promoCode: code.code
						}
					}
				})
			}
		};

		render() {
			const {
				enableRego,
				completeButton,
				paymentDonationTitle,
				paymentRegistrationTitle,
				registrationDescription,
				promoCodes,
				global,
			} = this.props;
			const { loading } = this.state;

			if (enableRego) {
				let {
					amount: regAmount = 0,
					description,
				} = this.getRegistrationAmount();
				const { merchAmount, merchItems = [] } = this.getMerch();

				return (
					<Fragment>
						{loading && (
							<div className="signup-form__loading">
								<Spinner />
								<p>One moment...</p>
							</div>
						)}
						<div
							className="signup-form__payment signup-form__payment--registration"
							style={{ display: loading ? "none" : "block" }}
						>
							{paymentRegistrationTitle && (
								<h3 className="signup-form__title">
									{paymentRegistrationTitle}
								</h3>
							)}

							{(regAmount > 0 || this.state.code) && (
								<div className="signup-form__payment-total">
									<span className="signup-form__payment-total__label">
										{registrationDescription || description}
										{this.state.code && ` (${this.state.code.code} - ${this.state.code.discount}% off)`}
									</span>
									<span className="signup-form__payment-total__amount">
										{displayCurrency(
											regAmount,
											global.campaign.currency
										)}
									</span>
								</div>
							)}

							{merchItems.map((item) => (
								<div className="signup-form__payment-total">
									<span className="signup-form__payment-total__label">
										{item.private.title}
										{Boolean(item.private.option) &&
											` - ${item.private.option}`}
									</span>
									<span className="signup-form__payment-total__amount">
										{displayCurrency(
											item.amount,
											global.campaign.currency
										)}
									</span>
								</div>
							))}

							{promoCodes && promoCodes.length > 0 && (
								<div style={{ padding: "1rem 0" }}>
									<h5
										style={{ marginTop: "0" }}
										className="signup-form__promo-code-heading"
									>
										Promo Code
									</h5>
									<p
										style={{
											marginTop: "-10px",
											marginBottom: "1rem",
										}}
									>
										If you have a promo code, enter it here:
									</p>
									<Input
										type="text"
										change={(name, value) =>
											this.setPromoCode(value)
										}
										label={"Promo code"}
										value={this.state.promoCode}
										name="promoCode"
									/>
								</div>
							)}

							{regAmount || merchAmount ? (
								<Fragment>
									<h5 className="signup-form__payment-card-heading">
										Payment Details
									</h5>
									<DonationFormMinimal
										{...this.props}
										perks={false}
										recurring={false}
										existingCards={false}
										user={this.props.values.user}
										onTokenSuccess={this.submit}
										amount={regAmount + merchAmount}
										registrationAmount={
											regAmount + merchAmount
										}
										appendToForm={() => (
											<div className="signup-form__navigation">
												<button
													className="signup-form__navigation__link signup-form__back"
													onClick={this.back}
												>
													<Icon
														name="chevron_left"
														size="small"
													/>
													<span>Back</span>
												</button>
											</div>
										)}
									/>
								</Fragment>
							) : (
								<div className="signup-form__navigation">
									<Button
										className="signup-form__profile--next"
										onClick={this.next}
									>
										Continue
									</Button><br />
									<button
										className="signup-form__navigation__link signup-form__back"
										onClick={this.back}
									>
										<Icon
											name="chevron_left"
											size="small"
										/>
										<span>Back</span>
									</button>
								</div>
							)}
						</div>
					</Fragment>
				);
			}

			// needs skips and back buttons
			return (
				<div className="signup-form__payment signup-form__payment--donation">
					{paymentDonationTitle && (
						<h3 className="signup-form__title">
							{paymentDonationTitle}
						</h3>
					)}
					<DonationFormMinimal
						{...this.props}
						perks={false}
						recurring={false}
						existingCards={false}
						user={this.props.values.user}
						onTokenSuccess={this.submit}
						appendToForm={(amount) => (
							<div className="signup-form__navigation">
								{(!amount || amount === 0) && (
									<Fragment>
										<Button
											className="signup-form__skip-payment signup-form__navigation__button--next"
											theme="primary"
											onClick={this.next}
											type="submit"
										>
											{completeButton}
										</Button>
										<br />
									</Fragment>
								)}
								<button
									className="signup-form__navigation__link signup-form__back"
									onClick={this.back}
								>
									<Icon name="chevron_left" size="small" />
									<span>Back</span>
								</button>
								{amount > 0 && (
									<Fragment>
										{` - `}
										<button
											className="signup-form__navigation__link signup-form__skip"
											onClick={this.next}
										>
											<span>
												Skip and continue to your
												dashboard
											</span>
											<Icon
												name="chevron_right"
												size="small"
											/>
										</button>
									</Fragment>
								)}
							</div>
						)}
					/>
				</div>
			);
		}
	}

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
					cart: [],
					items: [],
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
				// items: this.state.donation.items,
			};

			const steps = [];

			if (props.enableExerciseGoal) {
				steps.push(ExerciseGoalForm);
			}

			steps.push(UserForm);
			steps.push(ProfileForm);

			if (props.enableMerchandise) {
				steps.push(MerchForm);
			}

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
