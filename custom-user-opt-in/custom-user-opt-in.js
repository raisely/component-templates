(RaiselyComponents) => {
	const { api } = RaiselyComponents;
	const { Button } = RaiselyComponents.Atoms;

	// use a special flag to determine if a user has opted in
	const optInScope = 'private';
	const optInAttribute = 'optedIn';

	// create async helper function to opt an existing user into
	// some sort of promotion
	const optUserIn = async (e, props) => {
		const { user } = props.global;

		// generate a subset payload to apply new scoped values
		// to the currently logged in user.
		const data = {
			[optInScope]: {
				...user[optInScope],
				[optInAttribute]: true,
			},
		}

		// update the user and get the latest one from the Raisely api
		const { data: updatedUser } = (await api.users.update({ id: user.uuid, data })).body().data();
		// update the user locally (in state) to reflect the recent changes
		props.actions.addUser(updatedUser);
		props.actions.addMessage('Thanks for opting in!');
	}

	return (props) => {
		const { global } = props;

		// don't render this button unless their is a logged in user
		if (!global.user) return null;
		
		const userIsOptedIn = global.user[optInScope] && global.user[optInScope][optInAttribute];

		return (
			<Button
				onClick={e => optUserIn(e, props)}
				disabled={userIsOptedIn}
			>
				{userIsOptedIn ? 
					'Thanks, you\'ve already opted in' :
					'Opt in to receive special offers'
				}
			</Button>
		);
	}
}