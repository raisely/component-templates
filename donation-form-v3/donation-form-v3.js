(RaiselyComponents, React) => {
	const { Fragment } = React;
	const { DonationFormV3 } = RaiselyComponents.Molecules;

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
		afterPaymentSelect,
		onManualSubmit,
		builtIns: {
			// Internal components
			FrequencySelect,
			AmountSelect,
			Upsell,
			GivingLabel,
			GivingLabelWithHearts,
			MissingProviderNotice,
			OptIn,
			CurrencySelect,
			PaymentDetails,
			customAmountPlaceholder,
			PaymentMethodSelect,
			GiftAidOptIn,
			SwiftAidBanner,
			AnonymousToggle,
			ErrorFeedback,
			PostDonateModal,
			ThankYouScreen,
			ManualPaymentForm,
			StepSelect,
			PaymentSubmitButton,
			StripeFields,
			StripePaymentElements,
			AnimatedStep,
			// Hooks
			useDonationFormContext,
			useInterpolatedMessage,
			useAnimateHeightChange,
		},
	}) {
		const { campaign } = useRaisely();

		const {
			values,
			amountMessageWithCurrency,
			payments,
			totalAmount,
			calculatedTotal,
		} = useDonationFormContext();

		const interpolatedDetailsHeading = useInterpolatedMessage(
			detailsHeading,
			false
		);

		const interpolatedPaymentsHeading = useInterpolatedMessage(paymentsHeading);

		const [
			bodyHeight,
			bodyRef,
			stepWrapperRef,
			stepSelectRef,
		] = useAnimateHeightChange();

		// Determine which steps to show based off props
		const stepConditions = {
			amount: !amount,
			upsell: campaign.config?.donation?.upsell?.isNudgeEnabled,
			giftAid: giftAidEnabled && !campaign.config.donation?.express,
			details: !onTokenSuccess,
			payment: true,
			thankyou: true,
		};

		// Verify which steps available based on the above conditions
		const steps = Object.keys(stepConditions).filter(
			(s) => stepConditions[s]
		);

		// Get current step
		const currentStep = steps[values.step];

		const autoContinueOnAmountSelect = !campaign.config.donation?.express && !defaultDonationAmount;

		return (
			<div
				className={clsx(
					'donation-form__body',
					currentStep === 'upsell' && 'donation-form__body--upsell',
					currentStep === 'details' && 'donation-form__body--details',
					currentStep === 'details' && 'donation-form__body--giftAid',
					currentStep === 'payment' && 'donation-form__body--payment',
					currentStep === 'thankyou' && 'donation-form__body--success',
					values.result && 'fade-out-payment-step'
				)}
				ref={bodyRef}
				style={{ height: bodyHeight }}
		  	>
				{currentStep !== 'thankyou' && (
					<StepSelect
					stepCount={steps.length - 1}
					domRef={stepSelectRef}
					/>
				)}

				<div className="donation-form__step-wrapper" ref={stepWrapperRef}>
					{/* Wrapping the blocks in `AnimatedStep` applies an an exit / enter animation to them. */}
          			{/* It also automatically handles rendering them based on the current step and its `name` prop. */}

					{/* ---------------------------------------------------------------- */}
					{/* Amount Select Step */}
					{/* ---------------------------------------------------------------- */}
					<AnimatedStep name="amount">
						<MissingProviderNotice />
						{recurring && <FrequencySelect />}
						{mainHeading && (
							<h2 className="donation-form__title">{mainHeading}</h2>
						)}
						<AmountSelect
							autoContinueOnAmountSelect={autoContinueOnAmountSelect}
							customAmountPlaceholder={customAmountPlaceholder}
						/>
						<CurrencySelect currencySelection={currencySelection} />
						<PaymentMethodSelect
							afterSelect={(nextState, paymentRequest) =>
								afterPaymentSelect(
									nextState,
									paymentRequest,
									steps.length - 1
								)
							}
							hideWallets
							hidePaypal
						/>
					</AnimatedStep>

					{/* ---------------------------------------------------------------- */}
					{/* Upsell Step */}
					{/* ---------------------------------------------------------------- */}
					<AnimatedStep name="upsell">
						<Upsell/>
					</AnimatedStep>

					{/* ---------------------------------------------------------------- */}
					{/* Donor Details Step */}
					{/* ---------------------------------------------------------------- */}
					<AnimatedStep name="details">
						<GivingLabelWithHearts />
						{detailsHeading && (
							<h3 className="donation-form__title">
								{interpolatedDetailsHeading}
							</h3>
						)}
						<PaymentDetails includeAnonymousToggle={true} />
					</AnimatedStep>

					{/* ---------------------------------------------------------------- */}
					{/* GiftAid Step */}
					{/* ---------------------------------------------------------------- */}
					<AnimatedStep name="giftAid">
						<GivingLabelWithHearts />
						<GiftAidOptIn giftAidFields={giftAidFields} />
					</AnimatedStep>

					{/* ---------------------------------------------------------------- */}
					{/* Payment Step */}
					{/* ---------------------------------------------------------------- */}
					<AnimatedStep name="payment">
						{paymentsHeading && (
							<h3 className="donation-form__title">
								{interpolatedPaymentsHeading}
							</h3>
						)}
						{values.hasActiveSwiftAidAuth && <SwiftAidBanner />}

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
										<div className={methodWrapperClassName}>
											{!payments.onlySupportsPaypal ? (
												<fieldset className="donation-form__method-payment__border">
													<legend className="donation-form__method-payment__legend">
														Express Checkout
													</legend>
													{paymentMethodRender}
												</fieldset>
											) : (
												paymentMethodRender
											)}
										</div>
										{!payments.onlySupportsPaypal && (
											<HorizontalRuleWithText
												text={t('OR')}
											/>
										)}
									</Fragment>
								);
							}}
						/>

						<div className="payment-form-wrapper">
							<ManualPaymentForm
								onSubmit={(e, elements) =>
									onManualSubmit(e, elements, steps.length - 1)
								}
							>
								{!payments.onlySupportsPaypal && (
									<StripePaymentElements />
								)}
								<OptIn />
								<p className="donation-form__currency-message">
									{amountMessageWithCurrency}
								</p>
								<ErrorFeedback />
								{payments.campaignStripeProvider ? (
									<PaymentSubmitButton
										paymentButton={paymentButton}
										CustomDonateButton={CustomDonateButton}
									/>
								) : (
									<p className="donation-form__spacer" />
								)}
							</ManualPaymentForm>
						</div>
					</AnimatedStep>

					{/* ---------------------------------------------------------------- */}
					{/* Thank You Step */}
					{/* Purposefully NOT wrapped in an `AnimatedStep` to demonstrate */}
					{/* how to opt out of using `AnimatedStep` */}
					{/* ---------------------------------------------------------------- */}
					{currentStep === 'thankyou' && (
						<ThankYouScreen
							title={thankYouTitle}
							message={thankYouMessage}
							customShareUrl={customShareUrl}
						/>
					)}
				</div>
			</div>
		);
	}

	function AmountStep() {

	}

	return () => {
	  const { user } = useRaisely();

	  const configuration = {
		// Ensure that form tries to figure itself out
		autoconfigure: true,
		// Pass in user (required)
		user,
	  };

	  return (
		<DonationFormV3 {...configuration} renderStep={CustomRenderStep} />
	  );
	};
  };
