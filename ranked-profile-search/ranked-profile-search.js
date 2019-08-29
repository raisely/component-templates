/**
 * Add The following CSS to your campaign styles:
 *
	.profile-search__results .profilelist__item {
		position: relative;
	}
 */

(RaiselyComponents) => {
	const { styled } = RaiselyComponents;
	const { ProfileSearch } = RaiselyComponents.Molecules;
	const { ProfileTile } = RaiselyComponents.Atoms;

	const RankDisplay = styled('div')`
		z-index: 1;
		position: absolute;
		top: .2rem;
		left: .2rem;
		border-radius: .7rem;
		min-width: 1.4rem;
		line-height: 1;
		height: 1.4rem;
		text-align: center;
		padding: .2rem .3rem;
	`;

	const renderProfile = (profile, props) => (
		<React.Fragment>
			<RankDisplay className="block--primary">
				{profile.rank}
			</RankDisplay>
			<ProfileTile
				defaultImage={props.defaultImage || ''}
				profile={profile}
			/>
		</React.Fragment>
	);

	return (props) => {
		const { heading, type } = props.getValues();

		return (
			<ProfileSearch
				rank
				header={heading ? <h3>{heading}</h3> : null}
				campaignUuid={props.global.campaign.uuid}
				sort="total"
				renderProfile={profile => renderProfile(profile, props)}
				type={type}
			/>
		);
	}
}
