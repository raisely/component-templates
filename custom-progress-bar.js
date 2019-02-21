/**
  * Custom Progress Bar
  * For displaying progress on things other than donations
  * eg ExerciseTotals
  *
  * Define the following fields for the custom component
  *
  * @field {text} size small, medium or large
  * @field {text} style standard, hollow, rounded
  * @field {text} statPosition top, middle or bottom
  * @field {text} showGoal 0 or 1
  * @field {text} showTotal 0 or 1
  */

// eslint-disable-next-line no-unused-expressions
(RaiselyComponents, React) => {
	const validSizes = ['small', 'medium', 'large'];
	const validStyles = ['standard', 'hollow', 'rounded'];

	const progressBarClass = (variants) => {
		let output = 'progress-bar';
		variants.forEach((variant) => {
			output += ` progress-bar--${variant[0]}-${variant[1]}`;
		});
		return output;
	};

	function ProgressBar({
		// profile or campaign
		profile,
		size,
		style,
		showTotal,
		showGoal,
		statPosition,
	}) {
		// Select the exercise totals to display
		const displayAmount = profile.exerciseTotal;
		const displayGoal = profile.public && profile.public.exerciseGoal || 10;

		const barSize = validSizes.includes(size) ? size : 'medium';
		const barStyle = validStyles.includes(style) ? style : 'standard';
		const percentage = (profile.total / profile.goal) * 100;

		const showStats = showGoal || showTotal;

		const progressTotal = showTotal && (
			<span className="progress-bar__total">{`${displayAmount} raised`}</span>
		);
		const progressGoal = showGoal && (
			<span className="progress-bar__goal">{displayGoal}</span>
		);

		return (
			<div className={progressBarClass([['size', barSize], ['style', barStyle]])}>
				{(statPosition === 'top' && showStats) && (
					<div className="progress-bar__stats-outter progress-bar__stats-outter--above">
						{progressTotal}
						{progressGoal}
					</div>
				)}
				<div className="progress-bar__progress">
					{statPosition === 'middle' ? progressTotal + progressGoal : null}
					<span className="progress-bar__bar" style={{ width: `${Math.floor(Math.round(percentage, 100))}%` }}>
						{statPosition === 'middle' ? progressTotal + progressGoal : null}
					</span>
				</div>
				{(statPosition === 'bottom' && showStats) && (
					<div className="progress-bar__stats-outter progress-bar__stats-outter--below">
						{progressTotal}
						{progressGoal}
					</div>
				)}
			</div>
		);
	}

	return (props) => {
		const values = props.getValues();

		const {
			size,
			showTotal, // 0 or 1
			showGoal, // O or 1
			statPosition, // top, middle or bottom
			style,
		} = values;

		const profile = props.global.current.profile ||
			props.global.campaign.profile;

		return (
			<ProgressBar
				size={size}
				style={style}
				profile={profile}
				statPosition={statPosition}
				showTotal={showTotal != 0}
				showGoal={showGoal != 0}
			/>
		);
	};
};
