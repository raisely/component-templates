/**
 * This example component renders a list of custom badges that are not default Raisely badges
 */
(RaiselyComponents, React) => {
	// Since we have access to the main React library, we can pull out the hooks we need
	const { useState, useEffect } = React;

	// We also pull out the `api` helper from Raisely
	const { api, styled } = RaiselyComponents;

	/**
	 * Here, we have defined our an array of custom badge objects
	 * These  badges will be displayed in place of the default Raisely badges
	 */
	const badgeConfig = [
		{
			// The `id` is a quick way to reference the badge
			id: 'motivation',
			// This is the `name` that is displayed to the user when the badge is rendered
			name: 'Shared Motivation',
			// This function takes in a profile and `recruited` state and returns true or false
			// It is used to determine if the badge is active for the current profile
			isActive: (profile) => profile && profile.description,
			// This is the badge image that is displayed if the badge is active
			active: 'https://raisely-images.imgix.net/switchon/uploads/badge-sharedmotivation-2-png.png',
			// This is the badge image that is displayed if the badge is inactive
			inactive: 'https://raisely-images.imgix.net/switchon/uploads/badge-sharedmotivation-1-png.png',
			// This describes how the badge is activated
			description: 'Has shared their motivation for acting',
		},
		{
			id: 'recruit',
			name: 'Recruited a Friend',
			isActive: (profile, recruited) => recruited,
			active: 'https://raisely-images.imgix.net/switchon/uploads/badge-switchon-2-png.png',
			inactive: 'https://raisely-images.imgix.net/switchon/uploads/badge-switchon-1-png.png',
			description: 'Has successfully recruited 1 friend',
		},
		{
			id: 'host',
			name: 'Inspiration',
			isActive: (profile) => profile && profile.public && profile.public.hosted,
			active: 'https://raisely-images.imgix.net/switchon/uploads/badge-inspiration-2-png.png',
			inactive: 'https://raisely-images.imgix.net/switchon/uploads/badge-inspiration-1-png.png',
			description: 'Has hosted a climate conversation',
		},
		{
			id: 'lung',
			name: 'Lung Saver',
			isActive: (profile, recruited) => (recruited >= 5),
			active: 'https://raisely-images.imgix.net/switchon/uploads/badge-lungsaver-2-png.png',
			inactive: 'https://raisely-images.imgix.net/switchon/uploads/badge-lungsaver-1-png.png',
			description: 'Has switched 5 or more people!',
		}
	];

	// Use emotion's `styled` helper function for styled components
	const BadgeWrapper = styled("div")`
		display: flex;
		justify-content: space-between;
		padding: 1rem;
		background-color: rgb(248, 243, 253);
		border-radius: 0.5rem;
	`;

	// `.badge-item-image` is a child element that we can style in this way
	const BadgeItem = styled("div")`
		text-align: center;

		.badge-item-image {
			width: 60%;
			border-radius: 100%;
			border: 2px solid rgba(93, 27, 166, 0.1);
		}

		.badge-item-name {
			font-weight: bold;
		}
	`;

	/**
	 * Helper that generate markup for the badge items
	 * @function generateBadgesItems
	 * @param {Object} values - The values object we get from props. See below.
	 * @param {Array} values.badges - An array of badge ids
	 * @param {Object} profile - The profile object we pass in from the current state
	 * @param {Number} recruited - The `recruited` state we set in the `loadRecruits` function
	*/
	const generateBadgesItems = (values, profile, recruited) => {
		values.badges =
		(values.badges && values.badges.split(',').map(b => b.trim())) ||
		badgeConfig.map(b => b.id);

		// Loop over our custom badges and build some markup for each one
		return badgeConfig
			.filter(badge => values.badges.includes(badge.id))
			.map((badge) => {
				// Set intial value for `isActive`
				let isActive = false;
				// Then re-set `isActive` based on the return value of each badge's isActive function
				if (badge.isActive) isActive = badge.isActive(profile, recruited);

				// Determine whether to use the `active` or `inactive` image url
				const url = isActive ? badge.active : badge.inactive;
				// The append a width to the url to create the final image url
				const fullUrl = `${url}?w=200`;

				return (
					<BadgeItem
						className={`badge ${isActive ? 'active' : 'inactive'}`}
						// The `key` prop allows React to uniquely identify each
						// element in this array. see: https://reactjs.org/docs/lists-and-keys.html
						key={badge.name}
					>
						<img
							src={fullUrl}
							alt={badge.description}
							className="badge-item-image" />
						<p className="badge-item-name">{badge.name}</p>
					</BadgeItem>
				);
			});
	}

	/**
	 * The main component that is exported from this file
	 * @prop {Object} props
	 */
	const BadgesComponent = (props) => {
		// We can get the `current` state from global values
		const { campaign, current } = useRaisely();

		// Then we get the profile from the `current` state
		const { profile } = current;

		/**
		 * You can add your own fields in your Custom Component settings
		 * Then when you set values for these fields within the page editor, they can be accessed
		 * here by calling props.getValues()
		 * However, if no values are set, your fields will not be present on this values object.
		 */
		const values = props.getValues();

		// Set up some state to track the number of `recruited` members
		// Default value is set to `0`
		const [recruited, setRecruited] = useState(0);

		/**
		 * Uses the Raisely `api` helper to fetch the member count for the current profile
		 * then sets the `recruited` state
		 * @async
		 * @function loadRecruits
		*/
		const loadRecruits = async () => {
			// API Doc: https://developers.raisely.com/reference/getprofilesmembers
			const response = await api.profiles.members.getAll({
				id: profile.uuid,
				query: {
					limit: 1,
					status: 'ACTIVE',
					"public.switchOnStatus": "confirmed"
				}
			})

			// Store the `pagination` object from the response data
			const pagination = response.data.pagination;

			// If there is no pagination object, log an error
			if (!pagination) console.log('Error fetching recruits', response.body())

			// Else, set the `recruited` state to the total number of members
			setRecruited(pagination.total);
		}

		useEffect(() => {
			loadRecruits();
		}, [])

		const badgeList = generateBadgesItems(values, profile, recruited);

		return (
			<BadgeWrapper className="badges">{badgeList}</BadgeWrapper>
		)
	}

	/**
	 * Once you've declared your required components, be sure to return the
	 * main Raisely Component so it can be shown on your page.
	 */
	return BadgesComponent;
};
