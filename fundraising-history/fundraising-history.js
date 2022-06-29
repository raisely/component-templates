(RaiselyComponents) => {
	const { styled } = RaiselyComponents;

	const Wrapper = styled("div")`
		.fundraising-history__profile {
			font-size: 1.2rem;
			margin-bottom: 0.25rem;
		}
	`;

	return class MyRaiselyComponent extends React.Component {
		state = {
			fetching: false,
		};
		async componentDidMount() {
			const { user } = this.props.global;
			if (!user) return;

			await this.fetchData();
		}
		async componentDidUpdate() {
			const { user } = this.props.global;
			if (!user) return;
			if (this.state.fetching) return;

			await this.fetchData();
		}
		async fetchData() {
			let { campaigns } = this.props.getValues();
			const { user } = this.props.global;
			this.setState({
				fetching: true,
			});

			const profiles = (
				await this.props.api.profiles.getAll({
					query: {
						user: user.uuid,
						limit: 20,
						type: "INDIVIDUAL",
						$avoidCampaign: true,
						sort: "createdAt",
						order: "asc",
					},
					$avoidCampaign: true,
				})
			)
				.body()
				.data();

			campaigns = campaigns.map((c) => c.uuid);
			this.setState({
				profiles: profiles.data.filter((p) =>
					campaigns.includes(p.campaignUuid)
				),
			});
		}
		render() {
			const values = this.props.getValues();
			const { profiles } = this.state;

			const extractYear = (profile) => {
				return new Date(profile.createdAt).getFullYear();
			};
			return (
				<Wrapper className="fundraising-history">
					{Boolean(values.heading) && <h2>{values.heading}</h2>}
					{!profiles && <p>One moment...</p>}
					{profiles &&
						profiles.map((profile) => (
							<React.Fragment>
								<div className="fundraising-history__profile">
									<strong>
										Raised in {extractYear(profile)}:
									</strong>{" "}
									${profile.total / 100}
								</div>
								<div className="fundraising-history__profile">
									<strong>
										{values.activityWord || "Did"} in{" "}
										{extractYear(profile)}:
									</strong>{" "}
									{profile.exerciseTotal / 1000}kms
								</div>
							</React.Fragment>
						))}
				</Wrapper>
			);
		}
	};
};
