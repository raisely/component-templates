(RaiselyComponents) => {
	const { DonationStream } = RaiselyComponents.Molecules;
	const { Link } = RaiselyComponents;

	/**
	 * About this component
	 *
	 * This is a copy of Raisely's built in donation stream component. It supports all
	 * three displays of donations on Raisely: vertical, horiztonal, and grid.
	 *
	 * To set this up, you should copy both this file and the fields
	 * definition in donation-stream.json into your own custom component.
	 *
	 * Note: This donation stream does not support thanking donors.
	 *
	 * You can read more about Raisely custom components and our built-in library at
	 * https://components.raisely.com
	 */

	/**
	 * Utility function to generate the class for the donation tile.
	 * Built-in styles target these specific classes.
	 */
	const donationTileClass = (detail, theme, size) =>
		[
			"donation-tile",
			`donation-tile--${detail}`,
			`donation-tile--${theme}`,
			`donation-tile--${size}`,
		]
			.filter((i) => i)
			.join(" ");

	/**
	 * Utility function to see if the donation has a profile (or if it went to the campaign)
	 */
	const hasProfile = (donation) =>
		RaiselyComponents.Common.get(donation, "profile.path", null) !== null;

	/**
	 * DonationTileActivity breaks out name display and other logic into a separate
	 * component.
	 *
	 * By default, last names are private on Raisely. If they've been made public they will exist
	 * in the response, so we should assume they need to be shown.
	 */
	function DonationTileActivity({ donation, verb, campaign, user }) {
		// default – first name only
		let DonorName = () => (
			<em className="donation-tile__content__donor__first-name">
				{donation.firstName}
			</em>
		);

		// last names
		if (donation.lastName) {
			DonorName = () => (
				<Fragment>
					<em className="donation-tile__content__donor__first-name">
						{donation.firstName}
					</em>{" "}
					<em className="donation-tile__content__donor__last-name">
						{donation.lastName}
					</em>
				</Fragment>
			);
		}

		// full names
		if (donation.fullName && !donation.lastName) {
			DonorName = () => (
				<em className="donation-tile__content__donor__full-name">
					{donation.fullName}
				</em>
			);
		}

		// anonymous version
		if (donation.anonymous) {
			DonorName = () => (
				<em className="donation-tile__content__donor__first-name">
					Anonymous
				</em>
			);
		}

		// self version
		if (donation.user && user.uuid === donation.user.uuid) {
			DonorName = () => (
				<em className="donation-tile__content__donor__first-name">
					You
				</em>
			);
		}

		const donationHasProfile = hasProfile(donation);

		// if donation was to profile and profile is not campaign
		if (donationHasProfile && donation.profile.path !== campaign.path) {
			return (
				<p className="donation-tile__content__activity">
					<span className="donation-tile__content__donor">
						<DonorName />
					</span>
					<span>{` ${verb} to `}</span>
					<Link to={`/${donation.profile.path}`}>
						{donation.profile.name}
					</Link>
				</p>
			);
		}

		// otherwise treat as basic
		return (
			<p className="donation-tile__content__activity">
				<span className="donation-tile__content__donor">
					<DonorName />
				</span>
				<span>{` ${verb}`}</span>
			</p>
		);
	}

	/**
	 * Donation Tile
	 * Render an individual donation as part of the stream
	 *
	 * @param {*} {
	 * 		donation,
	 * 		detail,
	 * 		theme,
	 * 		size,
	 * 		campaign,
	 * 		user,
	 * 		showAsLoading,
	 * 	}
	 * @returns
	 */
	function DonationTile({
		donation,
		detail,
		theme,
		size,
		campaign,
		user,
		showAsLoading,
	}) {
		const displayAmount = !showAsLoading
			? RaiselyComponents.Common.displayCurrency(
					donation.displayAmount,
					donation.currency
			  )
			: " ";

		switch (detail || "basic") {
			case "tile":
			case "basic":
				return (
					<div
						className={donationTileClass(
							detail || "basic",
							"default",
							size || "medium"
						)}
					>
						{!showAsLoading && (
							<div className="donation-tile__amount">
								<span>{displayAmount}</span>
							</div>
						)}
						{!showAsLoading && (
							<div className="donation-tile__content">
								<DonationTileActivity
									donation={donation}
									user={user}
									campaign={campaign}
									displayAmount={displayAmount}
									verb="donated"
								/>
								<p className="donation-tile__content__timestamp">
									{RaiselyComponents.Common.dayjs(
										donation.createdAt
									).fromNow()}
								</p>
								{donation.message && (
									<p className="donation-tile__content__message">
										<em>{`"${donation.message}"`}</em>
									</p>
								)}
							</div>
						)}
					</div>
				);
			default:
				return "";
		}
	}

	return class CustomDonationStream extends React.Component {
		render() {
			const { global, getProfile, actions } = this.props;

			const {
				direction,
				limit,
				sort,
				order,
				profile: profileSetting,
				disableThankYou,
				showHighlight,
			} = this.props.getValues();

			const profile = getProfile("profile");
			const isUser = profileSetting === "user-donations";
			const highlight = global.query.donation;

			return (
				<DonationStream
					isUser={isUser}
					profile={profile}
					user={global.user}
					currentProfile={global.current.profile}
					pollingHash={this.props.pollingHash}
					limit={parseInt(limit, 10)}
					sort={sort}
					order={order}
					direction={direction}
					campaign={global.campaign}
					showAsLoading={
						global.loadingCurrent || !global.userAuthAttempted
					}
					highlight={highlight}
					showHighlight={showHighlight}
					renderDonation={(donation) => {
						return (
							<DonationTile
								donation={donation}
								campaign={global.campaign}
								showAsLoading={
									global.loadingCurrent ||
									!global.userAuthAttempted
								}
								detail={direction === "grid" ? "tile" : "basic"}
								user={global.user}
							/>
						);
					}}
				/>
			);
		}
	};
};
