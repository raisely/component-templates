(RaiselyComponents) => {
	const {
		getDonationTargetFromProps,
		retrieveAvailablePerks,
		setupDonationFormState,
		updateFormValues,
		focusDonationForm,
		getClaimablePerksFromProps,
		getCurrentProviderFromProps,
		defaultGiftAidFields,
		providerTypeToMethod,
		updateTargetProfileTotal,
		generateSuccessMessagesFromProps,
		getAmountTypesFromProps,
	} = RaiselyComponents.Molecules.donationHelpers;

	const { Form, Spinner } = RaiselyComponents;

	const {
		htmr,
		currencies,
		startCase,
		displayCurrency,
		toOtherCurrency,
	} = RaiselyComponents.Common;

	const { Button, Icon, Input } = RaiselyComponents.Atoms;

	const { RaiselyPayment, RaiselyShare } = RaiselyComponents.Molecules;

	// In a custom component, these would be contained above the DonationForm

	// Stage selection area
	function StageSelect({ stages, step, onSelect }) {
		const donationStageClass = (stageNumber, isActive, isPrevious) =>
			`donation-form__stage donation-form__stage--${stageNumber}${
				isActive ? ' donation-form__stage--active' : ''}${
				isPrevious ? ' donation-form__stage--previous' : ''
			}`;

		// don't show success stage within donation form
		const showStages = stages.filter(stepName => stepName !== 'success');

		return (
			<div className={`donation-form__stages donation-form__stages--total-${stages.length}`}>
				{showStages.map((stepName, index) => (
					<div
						role="button"
						tabIndex="0"
						onKeyPress={() => (index < step ? onSelect(index) : null)}
						key={stepName}
						className={donationStageClass(index, index === step, index < step)}
						onClick={() => (index < step ? onSelect(index) : null)}
					>
						{index + 1}
					</div>
				))}
			</div>
		);
	}

	const amountButtonClass = isActive => `donation-form__amount-type-btn ${
		isActive ? 'donation-form__amount-type-btn--active' : 'donation-form__amount-type-btn--inactive'}`;

	// Tab select for donation frequency. Will very based on Raisely campaign
	// configuration
	const AmountFormTypeSelect = ({ onSelect, ...props }) => {
		// put your various labels here
		const amountTypeLabelMap = {
			ONCE: 'One Off',
			WEEK: 'Weekly',
			'4WEEK': '4 Weeks',
			MONTH: 'Monthly',
		};

		return (
			<div className="donation-form__amount-type">
				{getAmountTypesFromProps(props).map(({
					type, isActive, interval, count,
				}) => (
					<button
						key={type}
						className={amountButtonClass(isActive)}
						onClick={() => onSelect({ interval, count })}
					>
						{amountTypeLabelMap[type]}
					</button>
				))}
			</div>
		);
	};

	// Donation amount button (for showing amount)
	const AmountFormButton = ({
		amount: baseAmount, image, title, currency, campaignCurrency, onClick,
	}) => {
		// if the targeted currency does not match the currency then convert the value amount
		const amount = (campaignCurrency === currency) ?
			baseAmount : toOtherCurrency(baseAmount, campaignCurrency, currency, true);

		const displayAmount = displayCurrency(amount, currency);

		return (
			<button
				className={`donation-form__amount-btn button--donation ${
					image ? 'donation-form__amount-btn--image' : ''
				} ${displayAmount.length > 19 ? 'donation-form__amount-btn--full' : ''}`}
				onClick={() => onClick(amount)}
			>
				{image && (
					<img
						src={`${image}?w=500`}
						alt={title}
						className="donation-form__amount-img"
					/>
				)}
				<span className="donation-form__amount-value">
					{displayAmount}
				</span>
				{title && (
					<span className="donation-form__amount-title">
						{htmr(title)}
					</span>
				)}
			</button>
		);
	};

	// Donation amount selection and entry
	const AmountFormAmount = ({
		campaignCurrency, amountConfig, values,
		targetCurrency, onSelect, minAmount,
	}) => {
		// find the correct list of amounts to render based on internal and count
		const campaignAmounts = amountConfig
			.find(group => (group.interval === values.interval && group.count === values.count)) || {};

		// if the campaign config isn't correct soft-fail with a blank amount screen
		if (!Array.isArray(campaignAmounts.amounts)) return null;

		return (
			<div className="donation-form__amount">
				{campaignAmounts.amounts.map(amountItem => (
					<AmountFormButton
						{...amountItem}
						currency={targetCurrency}
						campaignCurrency={campaignCurrency}
						onClick={onSelect}
					/>
				))}
				<Input
					type="currency"
					id="amount"
					label="Other Amount"
					placeholder="Other"
					classes="donation-form__other-field"
					change={(id, amount) => onSelect(amount, true)}
					value={values.amount || ''}
					values={values}
					minAmount={minAmount}
				/>
			</div>
		);
	};

	// Currency select dropdown
	const AmountFormCurrencySelection = ({
		targetCurrency, languageConfig, allCurrencies, onSelect,
	}) => (
		<div className="donation-form__amount-currency">
			<hr />
			{languageConfig.donating ? startCase(languageConfig.donating) : 'Donating' }{' in '}
			<span className="donation-form__currency">
				{currencies[targetCurrency].name}
				<select
					className="donation-form__currency-select"
					value={targetCurrency}
					onChange={e => onSelect(e.target.value)}
				>
					{Object.values(currencies)
						.filter(currency => allCurrencies || currency.active)
						.map(currency => (
							<option value={currency.code} key={currency.code} name={currency.name}>
								{currency.name}
							</option>
						))}
				</select>
			</span>
		</div>
	);

	const AmountForm = ({
		global, values, formProps, targetCurrency, updateValues,
		campaignCurrency,
	}) => {
		const {
			language: languageConfig,
			amounts: amountConfig,
		} = global.campaign.config;

		// detect and apply minimum donation amount if passed to the DonationForm
		const minAmount = formProps.minAmount > 0 ? formProps.minAmount : 0;
		const atLeastMinimum = !!(minAmount && values.amount >= minAmount);

		return (
			<React.Fragment>
				<AmountFormTypeSelect
					global={global}
					values={values}
					formProps={formProps}
					onSelect={({ interval, count }) => updateValues({ interval, count })}
				/>
				<AmountFormAmount
					values={values}
					targetCurrency={targetCurrency}
					amountConfig={amountConfig}
					campaignCurrency={campaignCurrency}
					minAmount={minAmount}
					onSelect={(amount, wasCustom = null) =>
						updateValues({ amount }, { nextStep: !minAmount && !wasCustom })}
				/>
				<AmountFormCurrencySelection
					targetCurrency={targetCurrency}
					languageConfig={languageConfig}
					allCurrencies={formProps.allCurrencies}
					onSelect={currency => updateValues({ currency })}
				/>
				{(atLeastMinimum || values.amount) && (
					<Button
						type="submit"
						onClick={() => updateValues(null, { nextStep: true })}
						className="donation-form__next-button"
					>
						Next
					</Button>
				)}
			</React.Fragment>
		);
	};

	const PerksForm = ({
		updateValues, ...props
	}) => {
		const { claimablePerks, lowestPerkDisplay } = getClaimablePerksFromProps(props);

		const noGiftButton = (
			<Button
				theme="secondary"
				className="donation-form__perk-skip-btn"
				onClick={() => updateValues({ perkUuid: null }, { nextStep: true })}
			>
				Continue
			</Button>
		);

		if (!claimablePerks.length) {
			// the donation isn't high enough to claim any perks
			return (
				<React.Fragment>
					<p className="donation-form__perk-eligibility">
						No rewards are available at this donation amount.
						If you donate <b>{lowestPerkDisplay}</b> or more
						you will be eligible to claim a reward.
					</p>
					<div className="donation-form__perk-back-group">
						<Button
							className="donation-form__perk-back-btn"
							onClick={() => updateValues(null, { previousStep: true })}
						>
							Select a new amount
						</Button>
						{noGiftButton}
					</div>
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				<h3>Select a gift</h3>
				{claimablePerks.map(perk => (
					<Button
						key={perk.uuid}
						className="donation-form__perk-btn"
						onClick={() => updateValues({ perkUuid: perk.uuid }, { nextStep: true })}
					>
						<h3>{perk.name}</h3>
						<p>{perk.description}</p>
					</Button>
				))}
				{noGiftButton}
			</React.Fragment>
		);
	};

	const GiftAidForm = ({
		values, formProps, updateValues,
	}) => (
		<React.Fragment>
			<h3>Add Gift Aid</h3>
			<p>
				Make your donation of{' '}
				<strong>{displayCurrency(values.amount, values.currency)}</strong>{' '}
				worth{' '}
				<strong>{displayCurrency(values.amount * 1.25, values.currency)}</strong>{' '}
				at no extra cost to you.
			</p>
			<div className="donation-form__giftaid">
				<Form
					values={values}
					fields={formProps.giftAidFields || defaultGiftAidFields}
					action={actionValues => updateValues(actionValues, { nextStep: true })}
					buttons={({ onSubmitClick }) => (
						<nav className="donation-form__nav">
							<Button
								theme="primary-hollow"
								className="donation-form__back"
								onClick={(e) => {
									e.preventDefault();
									updateValues(null, { previousStep: true });
								}}
							>
								<Icon name="chevron_left" size="small" />
							</Button>
							<Button onClick={onSubmitClick} type="submit" className="donation-form__next">
								Next <Icon name="chevron_right" size="small" />
							</Button>
						</nav>
					)}
				/>
			</div>
		</React.Fragment>
	);

	const DetailForm = ({
		global, values, updateValues,
	}) => (
		<React.Fragment>
			<h3>Your Details</h3>
			<Form
				values={values}
				fields={global.customFields.donation}
				action={actionValues => updateValues(actionValues, { nextStep: true })}
				buttons={({ onSubmitClick }) => (
					<nav className="donation-form__nav">
						<Button
							theme="primary-hollow"
							className="donation-form__back"
							onClick={(e) => {
								e.preventDefault();
								updateValues(null, { previousStep: true });
							}}
						>
							<Icon name="chevron_left" size="small" />
						</Button>
						<Button onClick={onSubmitClick} type="submit" className="donation-form__next">
							Next <Icon name="chevron_right" size="small" />
						</Button>
					</nav>
				)}
			/>
		</React.Fragment>
	);

	const PaymentForm = (props) => {
		const { updateValues, availableProviders } = props;
		const currentProvider = getCurrentProviderFromProps(props);

		if (!currentProvider) {
			return (
				<div className="donation-form__missing-provider">
					<h3>Connect a Payment Provider</h3>
					<p>In order to take live payments, you&#39;ll need to
						<strong> add a Payment Gateway</strong> in your Raisely Dashboard
					</p>
				</div>
			);
		}

		return (
			<React.Fragment>
				{availableProviders.length > 1 && (
					<div className="donation-form__payment-buttons">
						{availableProviders.map(({ providerType }) => (
							<Button
								size="small"
								theme={providerType === currentProvider.providerType ? 'primary-hollow' : 'inverse'}
								onClick={() => updateValues({ method: providerTypeToMethod(providerType) })}>
								{startCase(providerTypeToMethod(providerType))}
							</Button>
						))}
					</div>
				)}
				<RaiselyPayment
					{...props}
					showWhenProcessing={finalAmount => (
						<h3 className="donation-form__submitting">
							<Spinner />
							<span className="donation-form__submitting-label">
								Donating {displayCurrency(finalAmount, props.targetCurrency)}
							</span>
						</h3>
					)}
					currentProvider={currentProvider}
				/>
			</React.Fragment>
		);
	};

	class SuccessScreen extends React.Component {
		componentDidMount() {
			// tells Raisely Host to update targeted profile and
			// refresh any related models
			updateTargetProfileTotal(this.props);
		}

		render() {
			const { props } = this;

			if (props.formProps.thankYou) {
				// return the provided custom thank you message
				return props.formProps.thankYou;
			}

			// make a list of parsed string we can use to make a customized donation message
			// to a new donor after they've donated
			const [
				thankYouTitle,
				thankYouMessage,
			] = generateSuccessMessagesFromProps(props, [
				props.thankYouTitle || 'Thank You',
				props.thankYouMessage || "You've successfully made a donation of [donation.amount]!",
			]);

			return (
				<React.Fragment>
					<h3>{thankYouTitle}</h3>
					<p>{thankYouMessage}</p>
					<br />
					<p className="donation-form__social-copy">Now let&#39;s get the word out there:</p>
					<RaiselyShare
						networks="campaign"
						theme="filled"
						size="medium"
						url="current"
						global={props.global}
					/>
				</React.Fragment>
			);
		}
	}

	// Optimised to some guidelines in this article
	// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

	return class DonationForm extends React.Component {
		static withLoader(props, showWhenHidden = null) {
			// only render DonationForm when certain critical props are passed
			// i.e global.campaign and global.embed || global.userAuthAttempted
			if (!props.embed && !props.global.userAuthAttempted) {
				return showWhenHidden;
			}

			return <this {...props} />;
		}

		// initialise the default donation form state. This can be modified to include
		// custom state as needed.
		state = {
			...setupDonationFormState(this.props),
		}

		async componentDidMount() {
			if (this.props.perks) {
				// fetch and update donation form with latest donation perk data
				// eslint-disable-next-line react/no-did-mount-set-state
				this.setState({ availablePerks: (await retrieveAvailablePerks()) });
			}
		}

		componentDidUpdate(_prevProps, prevState) {
			// on step change
			if (this.state.step !== prevState.step) {
				// bring the donation form into focus (if not completely in view)
				focusDonationForm(this.state.formUuid);
			}
		}

		// method that determines the presence and ordering of various
		// donation form states
		getAvailableStages = () => [
			// removes the amount selection if it's passed as a prop
			!this.props.amount && 'amount',
			// only show perks stage if enabled as a prop and perks are loaded
			this.props.perks && this.state.loadedPerks.length && 'perks',
			// only show giftaid if provided as a prop
			this.props.giftAid && 'giftaid',
			// only show details if onTokenSuccess callback is not provided
			!this.props.onTokenSuccess && 'details',
			// unconditionally include payment and success stage
			'payment',
			'success',
		].filter(i => !!i);

		// method responsible for incrementing the current step, as well
		// as caching values. Should not be removed
		updateValues = updateFormValues.bind(this);

		render() {
			const { props, state } = this;

			// determine available donation form stages and alias current stage
			const stages = this.getAvailableStages();

			// define the various available sub-forms here (via key-value mapping)
			const CurrentStage = ({
				amount: AmountForm,
				perks: PerksForm,
				giftaid: GiftAidForm,
				details: DetailForm,
				payment: PaymentForm,
				success: SuccessScreen,
			})[stages[state.step]];

			// determine the donation target (and potential currency)
			const donationTarget = getDonationTargetFromProps(props);

			// determine the currency resolved from state or props. Because currency is relative
			// to the page being viewed (prop configuration), the value will be dynamic
			// unless the user selects their own custom currency for donating
			const { currency: campaignCurrency } = props.global.campaign;
			const targetCurrency = state.values.currency || donationTarget.currency || campaignCurrency;

			return (
				<div
					id="donate"
					className={`donation-form donation-form--active-step-${state.step + 1}`}
					data-form-uuid={state.formUuid}
				>
					<div className="donation-form__header">
						{props.title ? <h4>{props.title}</h4> : null}
						<StageSelect
							step={state.step}
							stages={stages}
							onSelect={step => this.setState({ step })}
						/>
					</div>
					<div className="donation-form__body">
						<CurrentStage
							{...state}
							updateValues={this.updateValues}
							formProps={props}
							global={props.global}
							stages={stages}
							donationTarget={donationTarget}
							campaignCurrency={campaignCurrency}
							targetCurrency={targetCurrency}
						/>
					</div>
				</div>
			);
		}
	}
}
