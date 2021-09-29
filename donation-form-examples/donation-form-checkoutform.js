(RaiselyComponents, React) => {
	const { Fragment, useCallback } = React;
	const { DonationForm } = RaiselyComponents.Molecules;

	function CheckoutForm({
		enableDonation,
		enableRego,
		appendToForm,
		registrationAmount,
		paymentDonationTitle,
		hideFee,
		...props
	}) {
		// Create memoized component renderer baseed on static config props
		const RenderStep = useCallback(
			({
				paymentButton,
				onManualSubmit,
				afterPaymentSelect,
				CustomDonateButton,
				builtIns: {
					ManualPaymentForm,
					PaymentMethodSelect,
					StripeFields,
					OptIn,
					PaymentSubmitButton,
					AmountSelect,
					useDonationFormContext,
				},
			}) => {
				const {
					totalAmount,
					values,
					payments,
				} = useDonationFormContext();

				return (
					<div>
						<ManualPaymentForm
							onSubmit={async (e, elements) =>
								await onManualSubmit(e, elements, values.step)
							}
						>
							{enableRego && enableDonation && (
								<h5 className="donation-form--checkout-form__subheading">
									{paymentDonationTitle}
								</h5>
							)}
							{enableDonation && <AmountSelect />}
							{totalAmount > 0 && (
								<Fragment>
									<hr className="donation-form--checkout-form__separator" />
									{!hideFee && <OptIn />}
									<PaymentMethodSelect
										hidePaypal={Boolean(
											props.onTokenSuccess
										)}
										hideManual
										afterSelect={(
											nextState,
											paymentRequest
										) => {
											afterPaymentSelect(
												nextState,
												paymentRequest,
												values.step
											);
										}}
										customRender={(
											paymentMethodRender,
											methodWrapperClassName
										) => {
											// If no payment methods are available, don't render
											if (!paymentMethodRender)
												return null;

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
									<StripeFields />
									<PaymentSubmitButton
										paymentButton={paymentButton}
										CustomDonateButton={CustomDonateButton}
									/>
								</Fragment>
							)}
							{typeof appendToForm === 'function' &&
								appendToForm(totalAmount)}
						</ManualPaymentForm>
					</div>
				);
			},
			[enableDonation, enableRego, registrationAmount]
		);

		return (
			<DonationForm
				{...props}
				additionalAmount={enableRego && registrationAmount}
				key={enableRego && registrationAmount}
				renderStep={RenderStep}
				className={'donation-form--checkout-form'}
				defaultDonationAmount={false}
				hideFee={hideFee}
			/>
		);
	}

	return () => {
		const { user } = useRaisely();

		const registrationAmount = 2000;

		return (
			<CheckoutForm
				enableRego
				onTokenSuccess={async ({
					data, // complete donation object with token
					processSCADonation, // process an SCA-based donation
					preferSCAMode,
				}) => {
					// YOU can do something here! Usually within a signup flow
				}}
				registrationAmount={registrationAmount}
				user={user}
				initialState={{
					details: {
						private: {},
						public: {},
					},
				}}
			/>
		);
	};
};
