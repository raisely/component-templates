(RaiselyComponents, React) => {
	const { DonationForm } = RaiselyComponents.Molecules;

	const clsx = (...classes) =>
		classes.filter((value) => value && typeof value === 'string').join(' ');

	function CustomRenderStep({
		mainHeading,
		currencySelection,
		giftAidEnabled,
		giftAidFields,
		thankYouTitle,
		thankYouMessage,
		customShareUrl,
		recurring,
		amount,
		onTokenSuccess,
		// callback handles
		afterPaymentSelect,
		// built-in iternals
		builtIns: {
			// internal components
			FrequencySelect,
			AmountSelect,
			MissingProviderNotice,
			OptIn,
			CurrencySelect,
			PaymentMethodSelect,
			GiftAidOptIn,
			AnonymousToggle,
			ErrorFeedback,
			PostDonateModal,
			ThankYouScreen,
			StepSelect,
			// hooks
			useDonationFormContext,
		},
	}) {
		const { campaign, isEmbed } = useRaisely();
		const { values } = useDonationFormContext();

		// Determine which steps to show based off props
		const stepConditions = {
			amount: !amount,
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
			// Detect missing express config
			if (!campaign.config.donation?.express) {
				return (
					<div className="donation-form__body">
						<ErrorFeedback customError="Please enable express donations" />
					</div>
				);
			}

			return (
				<div className="donation-form__body">
					<MissingProviderNotice />
					{mainHeading && (
						<h2 className="donation-form__title">{mainHeading}</h2>
					)}
					{recurring && <FrequencySelect />}
					<AmountSelect />
					<OptIn />
					{giftAidEnabled ? (
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
						hideManual
						hidePaypal={Boolean(onTokenSuccess)}
					/>
					<AnonymousToggle />
					<ErrorFeedback />
				</div>
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
		const { user } = useRaisely();

		const configuration = {
			// Ensure that form tries to figure itself out
			autoconfigure: true,
			// pass in user (required)
			user,
		};

		return (
			<DonationForm {...configuration} renderStep={CustomRenderStep} />
		);
	};
};
