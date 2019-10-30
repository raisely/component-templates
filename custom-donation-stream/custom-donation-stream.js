/* global React */

// Example donation stream that allows pre-processing of DonationTile
// values before display

(RaiselyComponents) => {
	const { DonationTile } = RaiselyComponents.Atoms;
	const { DonationStream } = RaiselyComponents.Molecules;

	/*
	 * Integrated helper to resolves profile to resolve donations
	 */
	function resolveProfileFromGlobal(global) {
		if (global.campaign.mock) {
			// resolve with fake profile
			return global.user.profile;
		}

		if (global.current.profile) {
			// if on a team, individual, or post page
			return global.current.profile;
		}

		return global.campaign.profile;
	}

	return function CustomDonationStream(props) {
		const { global } = props;

		/**
		 * Limited configuration for this component
		 * For more info visit: https://developers.raisely.com/docs/components-molecules#section-donationstream
		 */
		const config = {
			isUser: false,
			direction: 'horizontal',
			limit: 10,
		};

		/**
		 * Resolve the target profile based on manual configurations (best-effort)
		 */
		const profile = resolveProfileFromGlobal(global);

		/**
		 * determine if we should defer rendering (raisely:next)
		 * for compatibility with the renderProp (renderDonation), make sure
		 * the callback function is defined within this render
		 */
		const showAsLoading = global.loadingCurrent || !global.userAuthAttempted;

		const scope = {
			profile,
			showAsLoading,
			campaign: global.campaign,
			user: global.user,
			currentProfile: props.global.profile,
			pollingHash: props.pollingHash,
		};

		return (
			<DonationStream
				{...scope}
				{...config}
				renderDonation={(baseDonation, isLoading) => {
					// add in your donation modifications here
					const donation = {
						...baseDonation,
					};

					return (
						<DonationTile
							donation={donation}
							campaign={global.campaign}
							showAsLoading={showAsLoading || isLoading}
							detail="basic"
						/>
					);
				}}
			/>
		);
	};
}