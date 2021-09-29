(RaiselyComponents, React) => {
	const { Fragment } = React;
	const { DonationForm } = RaiselyComponents.Molecules;
	const { displayCurrency } = RaiselyComponents.Common;

	const clsx = (...classes) =>
		classes.filter((value) => value && typeof value === 'string').join(' ');

	function CustomRenderStep({
		mainHeading,
		detailsHeading,
		paymentsHeading,
		currencySelection,
		giftAidEnabled,
		giftAidFields,
		thankYouTitle,
		thankYouMessage,
		customShareUrl,
		paymentButton,
		CustomDonateButton,
		recurring,
		amount,
		onTokenSuccess,
		defaultDonationAmount,
		// callback handles
		afterPaymentSelect,
		onManualSubmit,
		// built-in iternals
		builtIns: {
			// internal components
			FrequencySelect,
			AmountSelect,
			MissingProviderNotice,
			OptIn,
			CurrencySelect,
			PaymentDetails,
			PaymentMethodSelect,
			GiftAidOptIn,
			AnonymousToggle,
			ErrorFeedback,
			PostDonateModal,
			ThankYouScreen,
			ManualPaymentForm,
			StepSelect,
			PaymentSubmitButton,
			StripeFields,
			// hooks
			useDonationFormContext,
			useInterpolatedMessage,
		},
	}) {
		const { campaign, isEmbed } = useRaisely();
		const {
			values,
			amountMessage,
			currencyName,
			payments,
			updateValues,
			isExpress,
		} = useDonationFormContext();

		const interpolatedDetailsHeading = useInterpolatedMessage(
			detailsHeading,
			isExpress
		);

		const interpolatedPaymentsHeading = useInterpolatedMessage(
			paymentsHeading
		);

		// Determine which steps to show based off props
		const stepConditions = {
			amount: !amount,
			giftAid: giftAidEnabled && !campaign.config.donation?.express,
			details: !onTokenSuccess,
			payment: true,
			thankyou: true,
		};

		// Verify which steps available based on the above conditions
		const steps = Object.keys(stepConditions).filter(
			(s) => stepConditions[s]
		);

		const currentStep = steps[values.step];

		/**
		 * Because components of the donation form are modular, we can create different
		 * layouts based on the state of the donation form.
		 */
		if (currentStep === 'amount') {
			/**
			 * Amount will step through to next step if:
			 * - not express and
			 * - no default donation amount selected
			 */
			const autoContinueOnAmountSelect =
				!campaign.config.donation?.express && !defaultDonationAmount;
			return (
				<Fragment>
					{!campaign.config.donation?.express && (
						<div className="donation-form__header">
							<StepSelect stepCount={steps.length - 1} />
						</div>
					)}
					<div className="donation-form__body">
						<MissingProviderNotice />
						{mainHeading && (
							<h2 className="donation-form__title">
								{mainHeading}
							</h2>
						)}
						{recurring && <FrequencySelect />}
						<AmountSelect
							autoContinueOnAmountSelect={
								autoContinueOnAmountSelect
							}
						/>
						{campaign.config.donation?.express && <OptIn />}
						{giftAidEnabled && campaign.config.donation?.express ? (
							<GiftAidOptIn giftAidFields={giftAidFields} />
						) : null}
						<CurrencySelect currencySelection={currencySelection} />
						<PaymentMethodSelect
							afterSelect={(nextState, paymentRequest) =>
								afterPaymentSelect(
									nextState,
									paymentRequest,
									steps.length - 1
								)
							}
							hideWallets={!campaign.config.donation?.express}
							hidePaypal={Boolean(onTokenSuccess)}
						/>
						{campaign.config.donation?.express && (
							<AnonymousToggle />
						)}
						<ErrorFeedback />
					</div>
				</Fragment>
			);
		}

		if (currentStep === 'giftAid') {
			return (
				<Fragment>
					{!campaign.config.donation?.express && (
						<div className="donation-form__header">
							<StepSelect stepCount={steps.length - 1} />
						</div>
					)}
					<div className="donation-form__body">
						<h3 className="donation-form__title">Add Gift Aid</h3>
						<p>
							Make your donation of{' '}
							<strong>
								{displayCurrency(
									values.amount,
									values.currency
								)}
							</strong>{' '}
							worth{' '}
							<strong>
								{displayCurrency(
									values.amount * 1.25,
									values.currency
								)}
							</strong>{' '}
							at no extra cost to you.
						</p>
						<GiftAidOptIn giftAidFields={giftAidFields} />
						<div className="form__navigation">
							<nav className="donation-form__nav">
								<button
									className="button button--standard button--primary donation-form__back"
									onClick={(e) => {
										e.preventDefault();
										updateValues((state) =>
											state.set('step', values.step - 1)
										);
									}}
								>
									<span className="icon icon--default icon--small icon--id-chevron_left ">
										<i
											data-icon-name="chevron_left"
											className="material-icons"
										>
											chevron_left
										</i>
									</span>
								</button>
								<button
									type="submit"
									className="button button--standard button--primary donation-form__next"
									onClick={(e) => {
										e.preventDefault();
										updateValues((state) =>
											state.set('step', values.step + 1)
										);
									}}
								>
									Next{' '}
									<span className="icon icon--default icon--small icon--id-chevron_right ">
										<i
											data-icon-name="chevron_right"
											className="material-icons"
										>
											chevron_right
										</i>
									</span>
								</button>
							</nav>
						</div>
					</div>
				</Fragment>
			);
		}

		if (currentStep === 'details') {
			return (
				<Fragment>
					<div className="donation-form__header">
						<StepSelect stepCount={steps.length - 1} />
					</div>
					<div
						className={clsx(
							'donation-form__body',
							'donation-form__body--details'
						)}
					>
						{detailsHeading && (
							<h3 className="donation-form__title">
								{interpolatedDetailsHeading}
							</h3>
						)}
						<PaymentDetails
							includeAnonymousToggle={
								!campaign.config.donation?.express
							}
							hideCustomFields={campaign.config.donation?.express}
						/>
					</div>
				</Fragment>
			);
		}

		if (currentStep === 'payment') {
			return (
				<Fragment>
					<div className="donation-form__header">
						<StepSelect stepCount={steps.length - 1} />
					</div>
					<div
						className={clsx(
							'donation-form__body',
							'donation-form__body--payment'
						)}
					>
						{paymentsHeading && (
							<h3 className="donation-form__title">
								{interpolatedPaymentsHeading}
							</h3>
						)}
						{!campaign.config.donation?.express ? (
							<PaymentMethodSelect
								afterSelect={(nextState, paymentRequest) =>
									afterPaymentSelect(
										nextState,
										paymentRequest,
										steps.length - 1
									)
								}
								hidePaypal={Boolean(onTokenSuccess)}
								hideManual
								customRender={(
									paymentMethodRender,
									methodWrapperClassName
								) => {
									// If no payment methods are available, don't render
									if (!paymentMethodRender) return null;

									// Otherwise render our own frame
									return (
										<Fragment>
											<div
												className={
													methodWrapperClassName
												}
											>
												{paymentMethodRender}
											</div>
											{payments.onlySupportsPaypal ? null : (
												<span className="donation-form__method-divider">
													OR
												</span>
											)}
										</Fragment>
									);
								}}
							/>
						) : null}
						<div>
							<ManualPaymentForm
								onSubmit={(e, elements) =>
									onManualSubmit(
										e,
										elements,
										steps.length - 1
									)
								}
							>
								{payments.campaignStripeProvider && (
									<StripeFields />
								)}
								{(!campaign.config.donation?.express ||
									!steps.includes('amount')) && <OptIn />}
								<p className="donation-form__currency-message">
									{amountMessage} in {currencyName}
								</p>
								{payments.campaignStripeProvider ? (
									<PaymentSubmitButton
										paymentButton={paymentButton}
										CustomDonateButton={CustomDonateButton}
									/>
								) : (
									<p
										className={clsx(
											'donation-form__spacer'
										)}
									/>
								)}
							</ManualPaymentForm>
						</div>
					</div>
				</Fragment>
			);
		}

		if (currentStep === 'thankyou') {
			// confirmation/thank you
			return (
				<div>
					<div className="donation-form__header">
						<StepSelect stepCount={steps.length - 1} />
					</div>
					<div
						className={clsx(
							'donation-form__body',
							'donation-form__body--success'
						)}
					>
						<ThankYouScreen
							title={thankYouTitle}
							message={thankYouMessage}
							customShareUrl={customShareUrl}
						/>
					</div>
					{!isEmbed && (
						<PostDonateModal
							title={thankYouTitle}
							message={thankYouMessage}
							customShareUrl={customShareUrl}
						/>
					)}
				</div>
			);
		}

		return null;
	}

	return () => {
		const configuration = {
			// Ensure that form tries to figure itself out
			autoconfigure: true,
			// Other props go here!
		};

		return (
			<DonationForm {...configuration} renderStep={CustomRenderStep} />
		);
	};
};
