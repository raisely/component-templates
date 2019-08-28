(RaiselyComponents) => {
	const { api, Form } = RaiselyComponents;
	const {
		qs,
		op,
		mirrorPathValueFromProfileName,
	} = RaiselyComponents.Common;

	const resolveProfileTypeFromProps = (props) => {
		const type = props.getValues().type || 'auto';

		// resolve from url if presented
		if (type === 'auto') {
			const typeFromUrlParam = `${props.match.params.type}`.toLowerCase();

			const baseValue = ['individual', 'group', 'team'].includes(typeFromUrlParam) ?
				typeFromUrlParam : null;

			return baseValue === 'team' ? 'group' : baseValue;
		}

		return type;
	}

	const resolveParentUuid = (profileType, props) => {
		// if group, assign to the campaign
		if (profileType === 'group') {
			return props.global.campaign.profile.uuid;
		}

		const { parentId: externalParentId } = qs.parse(window.location.href.split('?')[1]);
		return externalParentId || props.global.campaign.profile.uuid;
	}

	const generateModifiedFields = (fields, resolvedType) => {
		const nameField = fields.find(f => f.id === 'name');

		if (resolvedType && resolvedType.toLowerCase() === 'group' && nameField.label === 'Profile Name') {
			nameField.label = 'Team Name';
		}

		return fields;
	}

	return (props) => {
		// determine profile create type
		const type = resolveProfileTypeFromProps(props) || 'individual';
		// resolve parentUuid from props
		const parentUuid = resolveParentUuid(type, props);

		const initialValues = {
			type,
			currency: props.global.campaign.currency,
		};

		const onSubmit = async (data, options) => {	
			// attempt profile creation
			try {
				const newData = op(data)
					.set('type', type);
	
				const profileRes = await api.profiles.members.create({
					id: parentUuid,
					data: {
						join: (type === 'group'),
						data: newData.value(),
					},
				});
	
				await props.actions.fetchAndUpdateUser();
	
				const { data: profile } = profileRes.body().data();

				props.integrations.broadcast('profile.created', { profile });
				props.actions.redirect('/dashboard');
			} catch (e) {
				options.setSubmitting(false);
				props.actions.addErrorMessage(e);
			}
		}

		return (
			<div className={`profile-form profile-form--type-${type ? type.toLowerCase() : 'individual'}`}>
				<Form
					global={props.global}
					unlocked
					onChange={(...change) => mirrorPathValueFromProfileName(...change)}
					fields={generateModifiedFields(props.global.customFields.profile, type)}
					values={initialValues}
					action={onSubmit}
				/>
			</div>
		);
	}
}

