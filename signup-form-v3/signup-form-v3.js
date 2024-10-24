(RaiselyComponents, React) => {
	const { SignupFormV3 } = RaiselyComponents.Molecules;


	// This is the component that we'll pass as the value to `renderStep`.
	// It gives us access to built-in components, as well as the context.
	// Within it, we can set up and render our custom form component.
	function CustomRenderStep({
	  // Built-in helpers for custom forms
	  builtIns: {
		Form, // Some form "primitives"
		Mobile, // Mobile-view related components
		StepSelect, // The step selection widget
		NavBtns, // Back and Next Buttons
		NoTickets, // Components to show when there are no available tickets
		FundraiserThemeSelect,
		ExerciseGoalForm,
		UserForm,
		TicketSelectForm,
		TicketHolderForm,
		ProfileForm,
		SelfDonationForm,
		PaymentForm,
		useSignupFormContext, // function to access form context
	  },
	  ...props
	}) {
		// Access what we need from context.
		const {
		  step,
		  updateStep,
		  values,
		  ticketsEnabled,
		  ticketTypes,
		  updateValues,
		  fundraiserThemesActive,
		  disableNavPrompt,
		  enableExerciseGoal,
		  enableDonation,
		} = useSignupFormContext();

		// Defines the conditions for which steps we want to render and their order.
		// Note, we render exercise and payment steps conditionally based on context values.
		const stepConditions = {
			fundraiserTheme:
				fundraiserThemesActive &&
				(!queryParams.fundraiserTheme ||
					!campaign.config.fundraiserThemes?.some(
						(theme) => theme.path === queryParams.fundraiserTheme
					)),
		  	exercise: enableExerciseGoal,
			user: true,
			ticketSelect: ticketsEnabled && ticketTypes.length,
			ticketHolder: values.showTicketHolder,
			profile: true,
		  	donation: enableDonation,
			giftAid:
				campaign.config.donation?.giftAid &&
				values.donationAmount &&
				currency === 'GBP' &&
				// Only show the Gift Aid step if the user doesn't have an active swift aid auth.
				!values.hasActiveSwiftAidAuth,
		  	payment: true,
		};

		// Verify which steps are available based on the above conditions.
		const steps = Object.keys(stepConditions).filter((s) => stepConditions[s])

		const currentStep = steps[step]

		// Create a set of common props to pass in to components.
		// Necessary primarily to maintain compatibility with legacy steps.
		const commonProps = {
		  ...props,
		  values,
		  updateValues,
		  step,
		  updateStep,
		  disableNavPrompt,
		  error: values.error,
		};

		return (
		  <Form className="signup-form--v3">
			<Form.Header>
				<StepSelect numSteps={steps.length} />
				<h2>Your own custom heading</h2>
			</Form.Header>
			<Form.Body>
				{currentStep === 'fundraiserTheme' && <FundraiserThemeSelect {...commonProps} />}
				{currentStep === 'exercise' && <ExerciseGoalForm {...commonProps} />}
				{currentStep === 'user' && <UserForm {...commonProps} />}
				{currentStep === 'ticketSelect' && (
					<TicketSelectForm
						title={commonProps.ticketSelectTitle}
						description={commonProps.ticketSelectDescription}
						button={commonProps.ticketSelectButton}
					>
						<TicketSelectForm.Contents />
					</TicketSelectForm>
				)}
				{currentStep === 'ticketHolder' && (
					<TicketHolderForm
						title={commonProps.ticketHolderTitle}
						button={commonProps.ticketHolderButton}
					>
						<TicketHolderForm.Contents />
					</TicketHolderForm>
				)}
				{currentStep === 'profile' && <ProfileForm {...commonProps} />}
				{currentStep === 'donation' && <SelfDonationForm {...commonProps} />}
				{currentStep === 'giftAid' && <GiftAidForm {...commonProps} />}
				{currentStep === 'payment' && (
					<PaymentForm {...commonProps} steps={steps}>
						<PaymentForm.Contents />
					</PaymentForm>
				)}
			  {values.error && <Form.Error />}
			</Form.Body>
		  </Form>
		)
	};

	return (props) => {
	  return <SignupFormV3 {...props} renderStep={CustomRenderStep} />;
	};
  };
