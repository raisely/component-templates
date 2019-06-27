/**
  * @param {text} formId the id of the form to embed
  */

(RaiselyComponents) => {
	const { asyncLoadRemote } = RaiselyComponents.Common;

	const EmbedComponent = (props) => {
		const values = props.getValues();

		if (!values.formId) {
			return (<div>Please specify a formId</div>);
		}

		return (
			<div data-paperform-id={values.formId} />
		);
	}

	return React.lazy(async () => {
		// load in the remote script first and wait for it to load
		await asyncLoadRemote('https://paperform.co/__embed');
		// resolve with the component
		return { default: EmbedComponent };
	});
};
