(RaiselyComponents, _React) => {
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
	 * Once you've declared your required components, be sure to return the function
	 * representing your final Raisely Component so it can be shown on your page.
	 */
	return (props) => {
		/**
		 * If you declare fields within your Custom Component settings, they can be accessed
		 * by calling props.getValues() if set within your page editor. If values aren't set
		 * while editing, they will not be present on the values object.
		 */
		const values = props.getValues();

		/**
		 * Raisely gives you access to global values that are based on the current state of the page.
		 * The campaign object represents the campaign object returned by Raisely, while user represents
		 * the currently logged in user (if your campaign allows user's to login).
		 */
		const {
			campaign,
			user,
		} = props.global;

		/**
		 * Depending on the page being viewed, you can also access values such as the currently
		 * displayed profile and post.
		 */
		const {
			profile,
			post,
		} = props.global.current;

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
					This button will perform an action
				</Button>
			</div>
		);
	}
}
