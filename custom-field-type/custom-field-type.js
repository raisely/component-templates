(RaiselyComponents, _React) => {
	// See legacy Form docs for more examples of configurations
	// https://developers.raisely.com/docs/components-form
	const { Form } = RaiselyComponents;

	// Your custom field lives as a typical React component, rolled yourself
	// Note you also need to handle validation state
	function MyCustomFormInput({
		value,
		label,
		change,
		blur,
		id,
		errors,
		active,
		// locked is typically not handled, but can be used for state validations
		locked,
		// has the field been modified yet
		touched,
		// className from the field/Raisely
		classes,
		required,
		placeholder,
		// props passed to the Raisely form/internally generated
		formProps,
	}) {
		return (
			<input
				type="text"
				value={value}
				onBlur={() => blur(id, true)}
				placeholder={placeholder}
				onChange={(e) => {
					// indicate the change to the Raisely Form
					// (fieldId, newValue, touched state)
					change(id, e.target.value, true);
					// Note you can commit multiple changes in a single custom input!
				}}
			/>
		);
	}

	// Use a memoized (or single instanced) function for the render of the custom field
	// This ensures that the field has the same functional signature, helping prevent
	// rendering performnance issues
	function myCustomFieldRender(props, formProps) {
		return <MyCustomFormInput {...props} formProps={formProps} />;
	}

	return () => {
		const fields = [
			{
				id: 'myCustomField',
				type: 'custom',
				label: 'My text field',
				active: true,
				// the default value of the field (if none is provided)
				default: 'Hello world!',
				// determines if the id is saved directly to the form
				// object, otherwise defaults to the `public.myDefaultField`.
				core: true,
				// optional: indicate that we must have a value set to submit
				required: true,
				// a custom render key that provides a render function for this custom input
				render: myCustomFieldRender,
			},
		];

		const action = async (resultValues, options) => {
			// Here you handle your form's post actions
			console.log('submitted values', resultValues);
			console.log('internals', options);
		};

		return <Form fields={fields} action={action} />;
	};
};
