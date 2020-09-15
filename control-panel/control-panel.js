(RaiselyComponents, _React) => {
	const { useState, useEffect, Fragment } = React;
	const { ProgressBar, Button, Link: RaiselyLink } = RaiselyComponents.Atoms;
	const { DonationForm, RaiselyShare } = RaiselyComponents.Molecules;
	const { resolveProfileValuesByDisplaySource } = RaiselyComponents.Common;
	return (props) => {
		const { actions, global } = useRaisely(true);
		const [activeTab, setActiveTab] = useState("individual");
		const [isDonating, setIsDonating] = useState(false);

		const user = global.user;
		const integrations = props.integrations;

		// Reset isDonating when tab changes
		useEffect(() => {
			setIsDonating(false);
		}, [activeTab]);

		if (!user) return null;

		const profile = user.profile;
		const teamProfile =
			profile &&
			profile.parent &&
			!profile.parent.isCampaignProfile &&
			profile.parent;

		const activeProfile =
			activeTab === "individual" ? profile : teamProfile;

		const [displayAmount] = resolveProfileValuesByDisplaySource(
			activeProfile,
			"total",
			global.campaign.config.activity
		);

		const baseUrl = `${window.location.protocol}//${window.location.host}`;
		let profileUrl = `/${activeProfile.path}`;
		if (activeTab === "group") {
			profileUrl = `/t/${activeProfile.path}`;
		}

		const isTeamOwner =
			teamProfile &&
			user.groupProfiles &&
			user.groupProfiles.find((g) => g.uuid === teamProfile.uuid);

		return (
			<Fragment>
				<div className="control-panel">
					{teamProfile && (
						<div className="control-panel__tabs">
							<button
								className={`control-panel__tab ${
									activeTab === "individual"
										? `control-panel__tab--active`
										: ""
								}`}
								onClick={() => setActiveTab("individual")}
							>
								My Profile
							</button>
							<button
								className={`control-panel__tab ${
									activeTab === "group"
										? `control-panel__tab--active`
										: ""
								}`}
								onClick={() => setActiveTab("group")}
							>
								My Team
							</button>
						</div>
					)}

					<div className="control-panel__raised">
						<div className="control-panel__raised__headline">
							So far you've raised:
						</div>
						<h2 className="control-panel__raised__total">
							{displayAmount}
						</h2>
						<ProgressBar
							profile={activeProfile}
							size="medium"
							className="control-panel__raised__progress-bar"
						/>
						{isDonating ? (
							<DonationForm
								existingCards={true}
								global={global}
								integrations={integrations}
								profileUuid={activeProfile.uuid}
								onSuccess={() => {
									actions.triggerPageStreamRefetch();
									actions.resolveCurrentUser(
										global.campaign.uuid
									);
								}}
								additionalClassname="control-panel__donation-form"
							/>
						) : (
							<Button
								className="control-panel__raised__sponsor"
								onClick={() => setIsDonating(true)}
							>
								{activeTab === "individual"
									? "Sponsor yourself"
									: "Sponsor your team"}
							</Button>
						)}
					</div>
					<div className="control-panel__social">
						<h6 className="control-panel__social__title">
							{activeTab === "individual"
								? "Share your page"
								: "Share your team"}
						</h6>
						<RaiselyShare
							global={global}
							networks="campaign"
							theme="filled-inverted"
							size="icon"
							profile={activeProfile}
						/>
					</div>
					<div className="control-panel__buttons button-row">
						{(activeTab === "individual" || isTeamOwner) && (
							<Button
								className="control-panel__button"
								href={`${profileUrl}?edit=1`}
							>
								Edit Page
							</Button>
						)}
						<Button
							className="control-panel__button"
							href={profileUrl}
						>
							View Page
						</Button>
					</div>
				</div>
				{!teamProfile && (
					<p className="control-panel__teamlink">
						Want to fundraise with friends?
						<br />
						<RaiselyLink to="/create/group">
							Start a team
						</RaiselyLink>
					</p>
				)}
			</Fragment>
		);
	};
};
