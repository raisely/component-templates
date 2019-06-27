/**
  * Custom Progress Bar
  * TODO: clean this up, use best practices here
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
  * @field {text} totalText  '%n people switched',
  * @field {text} goalText 'Goal: %n',
  */

// eslint-disable-next-line no-unused-expressions
(RaiselyComponents, React) => {
	const validSizes = ['small', 'medium', 'large'];
	const validStyles = ['standard', 'hollow', 'rounded'];

	const defaults = {
		size: 'medium',
		style: 'standard',
		showGoal: 1,
		showTotal: 1,
		statPosition: 'top',
		totalText: '%n people switched',
		goalText: 'Goal: %n',
	};

	const progressBarClass = (variants) => {
		let output = 'progress-bar';
		variants.forEach((variant) => {
			output += ` progress-bar--${variant[0]}-${variant[1]}`;
		});
		return output;
	};

	function makeText(text, number) {
		return text.replace(/\%n/g, number);
	}

	function ProgressBar({
		// profile or campaign
		profile,
		size,
		style,
		showTotal,
		showGoal,
		statPosition,
		totalText,
		goalText,
		isPreview,
	}) {
		// When we're editing pages, make the progress non-zero so that
		// we can see what the progress bar looks like
		const defaultProgress = isPreview ? 3 : 0;

		// Select the exercise totals to display
		const displayAmount = profile.exerciseTotal || defaultProgress;
		const displayGoal = profile.public && profile.public.exerciseGoal || 10;

		const barSize = validSizes.includes(size) ? size : 'medium';
		const barStyle = validStyles.includes(style) ? style : 'standard';
		const percentage = (displayAmount / displayGoal) * 100;

		const showStats = showGoal || showTotal;

		const progressTotal = showTotal && (
			<span className="progress-bar__total">{`${makeText(totalText, displayAmount)}`}</span>
		);
		const progressGoal = showGoal && (
			<span className="progress-bar__goal">{makeText(goalText, displayGoal)}</span>
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

		Object.keys(values)
			.forEach((key) => { if (values[key] === null) values[key] = defaults[key]; });
		// eslint-disable-next-line eqeqeq
		values.showTotal = values.showTotal == '1';
		// eslint-disable-next-line eqeqeq
		values.showGoal = values.showGoal == '1';

		const {
			size,
			showTotal, // 0 or 1
			showGoal, // 0 or 1
			statPosition, // top, middle or bottom
			style,
			goalText,
			totalText,
		} = values;

		// Are we actually on the public website or the editor
		const isMock = props.global.campaign.mock;

		const profile = props.global.current.profile ||
			props.global.campaign.profile;

		return (
			<ProgressBar
				size={size}
				style={style}
				profile={profile}
				statPosition={statPosition}
				showTotal={showTotal}
				showGoal={showGoal}
				goalText={goalText}
				totalText={totalText}
				isPreview={isMock}
			/>
		);
	};
};
