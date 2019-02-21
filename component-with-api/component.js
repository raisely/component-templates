(RaiselyComponents, React) => {
	/**
	 * This is the closure area of your custom component, allowing you to
	 * specify and declare code used by your main component. This allows for
	 * a greater amount of complexity in your components while ensuring your
	 * component performs correctly.
	 */

	/**
	 * The api can be accessed from the RaiselyComponents object, along with various
	 * internal Raisely Components
	 */
	const { api, Atoms } = RaiselyComponents; 
	const { Button } = Atoms;

	/**
	 * To demonstrate the capabilities of the Raisely api interface, let's create a 
	 * simple stateful component that performs a fetch for us and displays the results
	 */
	class ApiDisplay extends React.Component {
		state = {
			result: null,
		}

		fetchModels = async () => {
			/**
			 * Api fetches are always asynchronous, meaning that we can sequence other
			 * events to take place after the models are fetched from the raisely api.
			 */
			const models = await this.props.fetch(this.props.arguments);
			const result = models.body().data();

			// bind the payload result to this component
			this.setState({ result });
		}

		componentDidMount() {
			// when this component first loads, let's perform the call
			this.fetchModels();
		}

		render() {
			const { props } = this;

			// let's prerender a final value
			const renderedPreview = this.state.result ?
				JSON.stringify(this.state.result, null, 4) :
				'Loading Data...';

			return (
				<div className="my-custom-component__results">
					<h2>{props.heading}</h2>
					<code>
						<pre>
							{renderedPreview}
						</pre>
					</code>
					{this.state.result && (
						<Button onClick={this.fetchModels}>
							Fetch
						</Button>
					)}
				</div>
			);
		}
	}

	/**
	 * Once you've declared your required components, be sure to return the class
	 * representing your final Raisely Component so it can be shown on your page.
	 */
	return class RaiselyApiDemo extends React.Component {
		updateField = (field, value) => this.setState({ [field]: value });

		render() {
			const { global } = this.props;
			
			const campaignUuid = global.campaign.uuid;

			return (
				<div className="my-custom-component">
					<h1>Raisely Api Integration demo</h1>
					<ApiDisplay
						heading="Get current campaign"
						arguments={{ id: campaignUuid }}
						fetch={api.campaigns.get}
					/>
				</div>
			);
		}
	}
}
