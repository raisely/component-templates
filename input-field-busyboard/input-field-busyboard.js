(RaiselyComponents) => {
	const { css } = RaiselyComponents;
	const { Input } = RaiselyComponents.Atoms;

	const propPreviewClass = css`
		white-space: pre;
		font-family: 'Consolas', 'Lucida Console', monospace;
	`;

	const InputPropPreview = ({ inputProps }) => {
		// make sure function props are converted to string value
		const formatted = Object.assign({}, ...Object.keys(inputProps).map((key) => {
			if (typeof inputProps[key] === 'function') {
				return { [key]: '(function)' };
			}

			return { [key]: inputProps[key] };
		}));

		return (
			<pre className={propPreviewClass}>
				{JSON.stringify(formatted, null, 2)}
			</pre>
		);
	};

	// contains each minimal additional prop required by various types
	const extraPropsByFieldType = {
		text: { placeholder: 'Placeholder' },
		textarea: { placeholder: 'Placeholder' },
		path: { placeholder: 'Placeholder' },
		number: { min: 10, max: 50 },
		address: {
			showManualInput: true,
			forceManual: true,
		},
		boolean: { true: 'Yes', false: 'No' },
		checkbox: {},
		select: {
			placeholder: 'Placeholder',
			options: [
				{ label: 'Option 1', value: 'one' },
				{ label: 'Option 2', value: 'two' },
				{ label: 'Option 3', value: 'three' },
			],
		},
		'select-currency': {},
		date: {},
		file: {},
		hidden: {},
	};

	return class ClassComponent extends React.Component {
		state = { currentType: 'text', currentValue: null }

		onSelectFieldType = (_id, newType) => this.setState({
			currentType: newType,
			currentValue: null,
		});

		render() {
			const { currentType } = this.state;

			const inputProps = {
				active: true,
				type: currentType,
				id: 'currentValue',
				label: `My ${currentType} field`,
				value: this.state.currentValue,
				change: (id, value) => this.setState({ [id]: value }),
				blur: id => console.log(id, 'field blurred!'),
				...extraPropsByFieldType[currentType],
			};

			// a generic text field
			return (
				<React.Fragment>
					<Input
						active
						type="select"
						id="currentType"
						label={`Field Type`}
						value={currentType}
						change={this.onSelectFieldType}
						options={Object.keys(extraPropsByFieldType)}
					/>
					<h4>Field Preview</h4>
					<Input {...inputProps} />
					<h4>Field Prop Preview</h4>
					<InputPropPreview inputProps={inputProps} />
				</React.Fragment>
			);
		}
	};
}