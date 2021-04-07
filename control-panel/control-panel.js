(RaiselyComponents, _React) => {
	const { useState, useEffect, Fragment } = React;
	const { ProgressBar, Button, Link: RaiselyLink } = RaiselyComponents.Atoms;
	
	const {
		DonationForm,
		RaiselyShare,
		Modal,
		ProfileSelect,
		ProfilePreviewByUuid,
	} = RaiselyComponents.Molecules;
  
  	const { api } = RaiselyComponents;
	
	const { resolveProfileValuesByDisplaySource } = RaiselyComponents.Common;
	return (props) => {
		const { actions, global } = useRaisely(true);
		const [activeTab, setActiveTab] = useState("individual");
		const [isDonating, setIsDonating] = useState(false);
		const [isJoiningTeam, setIsJoiningTeam] = useState(false);
		const [teamToJoin, setTeamToJoin] = useState(null);

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
		
		// handle joining team from modal
		const joinTeam = async (e, teamUuid) => {
			e.preventDefault();
			if (!teamUuid || !profile) return;
			setIsJoiningTeam("joining");
			await api.profiles.join.update({
				id: profile.uuid,
				data: { parentUuid: teamUuid },
				query: { private: true },
			});
			// Refetch the users profile
			const userData = await actions.fetchAndUpdateUser();
			actions.addMessage(`Joined ${teamLanguage}`);
			integrations.broadcast("profile.updated", userData);
			setIsJoiningTeam(false);
			setTeamToJoin(null);
		};

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
					<div className="button-row button-row--center buttons--small">
						<Button href="/create/group">Start a team</Button>
						<Button onClick={() => setIsJoiningTeam(true)}>
							Join a team
						</Button>
					</div>
					{isJoiningTeam && (
						<Modal
							button={false}
							automatic
							delay={1}
							onClose={() => {
								setIsJoiningTeam(false);
								setTeamToJoin(null);
							}}
							dockToBottom
							modalContent={() => (
								<form
									onSubmit={(e) => joinTeam(e, teamToJoin)}
									className="raisely-profile-form"
								>
									<h2>Join a {teamLanguage}</h2>
									{teamToJoin ? (
										<ProfilePreviewByUuid
											api={api}
											heading="You are joining:"
											uuid={teamToJoin}
											cancel={() => setTeamToJoin(null)}
											openNewTab={true}
										/>
									) : (
										<ProfileSelect
											global={global}
											api={api}
											label={`Search for a ${teamLanguage} to join`}
											placeholder={`Enter the ${teamLanguage}'s name`}
											alphabeticalProfileSearch={true}
											customFilter={(item, ix) => {
												const teamIsFull =
													global.campaign.config
														.maximumTeamSize &&
													global.campaign.config
														.maximumTeamSize <=
														item.value.memberCount;
												return !teamIsFull;
											}}
											update={(uuid) =>
												setTeamToJoin(uuid)
											}
											autofocus
										/>
									)}
									{teamToJoin && (
										<div className="form__navigation">
											<Button
												type="submit"
												disabled={
													isJoiningTeam === 'joining'
												}
											>
												{isJoiningTeam === 'joining'
													? 'Joining...'
													: 'Join'}
											</Button>
										</div>
									)}
								</form>
							)}
						/>
					)}
				</p>
			)}
			</Fragment>
		);
	};
};
