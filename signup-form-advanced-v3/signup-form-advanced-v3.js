
(RaiselyComponents, React) => {
	const config = {
		defaultTitle: 'Custom Signup Form Advanced V3',
	};

	const { useState, useEffect, useMemo, Fragment } = React;

	const {
		styled, // the emotion styled components method
	} = RaiselyComponents;

	const {} = RaiselyComponents.Common;

	const {} = RaiselyComponents.Atoms;

	const {
		MultiForm,
		UserForm
	} = RaiselyComponents.Molecules;

	/**
	 * The main component that is exported from this file
	 * @prop {Object} props
	 */
  	const CustomSignupFormAdvancedV3 = (props) => {
		const values = props.getValues();

		const {
			campaign,
			user,
			current,
		} = useRaisely();

		const {
			profile,
			post,
		} = current;

      	const eventConfig = values.events;

		const steps = [];

		steps.push(UserForm)



      	// const eventList = generateEventList(eventConfig);

		return (
			<Fragment>
				<p>Custom Sign Up Form</p>
				<MultiForm
					name="signup-form-advanced-v3"
					{...props}
					values={{}}
					updateValues={{}}
					promptOnLeave={
						!props.disablePrompt &&
						'Leaving this page will require you to re-enter your information. Are you sure you want to leave?'
					}
					steps={steps}
					onNavigate={(step) => {
						return step
					}}
					error={'error message'}
				/>
			</Fragment>
		);
	}

    return CustomSignupFormAdvancedV3;
}
