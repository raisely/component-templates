(RaiselyComponents) => {
	const { api } = RaiselyComponents;
	const { ProgressBar } = RaiselyComponents.Atoms;
	return class MyRaiselyComponent extends React.Component {
		state = {
			goal: 0,
			total: 0,
		};
		async componentDidMount() {
			const donationsRes = await api.donations.getAll();
			this.setState({
				total: donationsRes.body().data().pagination.total,
			});
		}
		render() {
			const { goal } = this.props.getValues();
			return (
				<ProgressBar
					showGoal
					showTotal
					statPosition="bottom"
					size="large"
					style="standard"
					displaySource="custom"
					total={this.state.total}
					goal={goal}
					unit={this.state.total > 1 ? 'donations' : 'donation'}
				/>
			);
		}
	};
};
