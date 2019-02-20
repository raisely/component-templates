(RaiselyComponents, React) => {
	/**
	 * This is the closure area of your custom component, allowing you to
	 * specify and declare code used by your main component. This allows for
	 * a greater amount of complexity in your components while ensuring your
	 * component performs correctly.
	 */

	/**
	 * Anything declared in this area is only available to your custom component.
	 * This is great for text and values that aren't subject to change frequently.
	 */
	const config = {
		internalTitle: 'Hello world!',
	};

	// We can access specific Raisely components through the 
	// RaiselyComponents prop
	const { Button } = RaiselyComponents.Atoms;

	/**
	 * Once you've declared your required components, be sure to return the class
	 * representing your final Raisely Component so it can be shown on your page.
	 */
	return class MyCustomComponent extends React.Component {

		state = {
			/**
			 * Since we are using a stateful component, we can define a life-time state 
			 * for our-component this is idea if we want to allow our user's actions to 
			 * change the overall flow of our components
			 */
			buttonIsActive: true
		}

		/**
		 * This is an example of a class-bound method. This is what we will call when we want
		 * to update the state of our component.
		 */
		toggleButtonState = () => this.setState({ buttonIsActive: !this.state.buttonIsActive });

		render() {
			/**
			 * If you declare fields within your Custom Component settings, they can be accessed
			 * by calling props.getValues() if set within your page editor. If values aren't set
			 * while editing, they will not be present on the values object.
			 */
			const values = this.props.getValues();

			/**
			 * Raisely gives you access to global values that are based on the current state of the page.
			 * The campaign object represents the campaign object returned by Raisely, while user represents
			 * the currently logged in user (if your campaign allows user's to login).
			 * 
			 * The current user's profile can also be accessed as `user.profile`
			 */
			const {
				campaign,
				user,
			} = this.props.global;

			/**
			 * Depending on the page being viewed, you can also access values such as the currently
			 * displayed profile and post.
			 */
			const {
				profile,
				post,
			} = this.props.global.current;

			// let's use our component state to derive the string to append to our button
			const buttonLabel = this.state.buttonIsActive ? 'On' : 'Off';

			return (
				<div className="my-custom-component">
					<h1>
						{config.maskedTitle} {values.customTitle || 'You did not provide a title'}
					</h1>
					<Button
						onClick={() => {
							// this action is being handled when a user clicks this button
							console.log('This is a button click!');
						}}
					>
						This button will perform an action {buttonLabel}
					</Button>
				</div>
			);
		}
	}
}
