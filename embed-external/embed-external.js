/**
  * @param {text} formId the id of the form to embed
  */

// eslint-disable-next-line no-unused-expressions
(RaiselyComponents, React) => {
	return class EmbedComponent extends React.Component {
		componentDidMount() {
			const script = document.createElement('script');

			script.src = 'https://paperform.co/__embed';
			script.async = true;

			document.body.appendChild(script);
		}

		render() {
			const values = this.props.getValues();

			if (!values.formId) {
				return (<div>Please specify a formId</div>);
			}

			return (
				<div data-paperform-id={values.formId} />
			);
		}
	};
};
