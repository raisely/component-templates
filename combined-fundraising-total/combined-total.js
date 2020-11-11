(RaiselyComponents) =>
	class CombinedTotal extends React.Component {
		state = {
			total: 0,
		};
		async componentDidMount() {
			const values = this.props.getValues();
			const results = await Promise.all(
				values.campaigns.map(
					async (c) =>
						await fetch(
							`https://api.raisely.com/v3/campaigns/${c.path}`
						)
				)
			);

			const campaigns = await Promise.all(results.map((r) => r.json()));
			const total =
				campaigns.reduce((prev, curr) => prev + curr.data.total, 0) /
				100;

			this.setState({
				total,
			});
		}
		render() {
			const values = this.props.getValues();
			if (!this.state.total && this.state.total !== 0) return null;
			return (
				<h1
					style={{
						textAlign: "center",
						color: "white",
					}}
				>
					{
						this.state.total
							.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
							})
							.split(".")[0]
					}
				</h1>
			);
		}
	};
