/**
  * Custom Profile Editor
  * For displaying a limit set of fields to edit
  *
  * Define the following fields for the custom component
  *
  * @field {text} fields Comma separated list of field ids to show
  * @field {text} redirect Path to redirect to on successful form submission
  * @field {text} buttonLabel Label for the submit button
  */

// eslint-disable-next-line no-unused-expressions
(RaiselyComponents, React) => {
	const { Form } = RaiselyComponents;

	const defaults = {
		buttonLabel: 'Save',
	};

	/**
	 * Custom Profile Edit Form molecule
	 */
	return class CustomProfileEditForm extends React.Component {
		static description = 'The edit form for a profile';

		state = {
			values: this.props.getFormValues({
				fields: 'profile', from: this.props.profile || 'current',
			}),
		}

		action = async (formData, options) => {
			const { integrations } = this.props;
			// update user details
			try {
				const data = this.props.processFormData(formData);

				const request = await this.props.api.profiles.update({
					id: this.props.global.user.profile.uuid,
					data: { data },
				});

				this.props.actions.addUserProfile(request.body().data().data);
				this.props.actions.addMessage('Profile updated successfully');
				integrations.broadcast('profile.updated', { user: this.props.global.user, profile: request.body().data().data });
				options.setSubmitting(false);

				if (this.redirect) this.props.history.push(this.redirect);
			} catch (e) {
				options.setSubmitting(false);
				this.props.actions.addErrorMessage(e);
			}
		}

		render() {
			const { global } = this.props;
			const values = Object.assign({}, defaults, this.props.getValues());

			// Split fields by comma, remove any fields that are empty string
			const fieldsToShow = (values.fields || '').split(',').map(f => f.trim()).filter(f => f);

			// Show only selected fields
			const fields = global.customFields.profile
				.filter(f => fieldsToShow.includes(f.id));

			return (
				<div className="raisely-profile-form">
					{fields.length || 'Please specify some fields to show'}
					<Form
						fields={fields}
						values={values}
						global={global}
						actionText={values.buttonLabel}
						action={this.action}
					/>
				</div>
			);
		}
	};
};
