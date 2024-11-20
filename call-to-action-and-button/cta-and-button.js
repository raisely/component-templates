/**
  * @field {text} header Text to put in the header
  * @field {text} text Text description
  * @field {text} buttonLabel text on the button
  * @field {text} buttonUrl Url for button to go to (eg be /signup)
  * @field {text} headerTag Header tag to use (default h3)
  * @field {text} align Alignment of header and button
  * @field {text} buttonTheme primary,secondary,inverse,cta
  */

// eslint-disable-next-line no-unused-expressions
(RaiselyComponents, React) => {
	const defaults = {
		header: 'Act Now!',
		text: 'Help %n reach his goal ...',
		buttonLabel: 'Click Here',
		buttonUrl: '/signup',
		headerTag: 'h3',
		align: 'center',
		buttonTheme: 'primary',
	};

	// We can access specific Raisely components through the
	// RaiselyComponents prop
	const { Button } = RaiselyComponents.Atoms;

	/**
	 * The main component that is exported from this file
	 * @prop {Object} props
	 */
	const CtaAndButton = (props) => {
		/**
		 * If you declare fields within your Custom Component settings, they can be accessed
		 * by calling props.getValues() if set within your page editor. If values aren't set
		 * while editing, they will not be present on the values object.
		 */
		const values = Object.assign(defaults, props.getValues());

		const {
			header,
			text,
			buttonLabel,
			buttonUrl,
			headerTag,
			align,
			buttonTheme,
		} = values;

		/**
		 * Depending on the page being viewed, you can also access values such as the currently
		 * displayed profile and post.
		 */
		const profile = props.global.current.profile || props.global.campaign.profile;

		const finalText = text
			.replace(/\{name\}/g, profile.name)
			.split('\n');
		const finalHeader = header.replace(/\{name\}/g, profile.name);

		const HeaderTag = `${headerTag}`;

		const alignStyle = {
			textAlign: align,
		};

		return (
			<div className="cta-pane">
				<HeaderTag style={alignStyle}>
					{finalHeader}
				</HeaderTag>
				{finalText.map(para => (<p>{para}</p>))}
				<p
					className="button-container"
					style={alignStyle}>
					<Button
						theme={buttonTheme
						}
						href={buttonUrl}
					>
						{buttonLabel}
					</Button>
				</p>
			</div>
		);
	};

	/**
	 * Once you've declared your required components, be sure to return the
	 * main Raisely Component so it can be shown on your page.
	 */
	return CtaAndButton;
};
