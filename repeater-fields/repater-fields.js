(RaiselyComponents) => {
	const { Link } = RaiselyComponents.Atoms;

	const defaultValues = {
		footerItems: [
			{
				label: 'This item will show when none are set',
				url: '/home',
			}
		]
	}

	return (props) => {
		const values = props.getValues();
			console.log(values);

		// make sure that it falls back on default if none are present
		const footerItems = values.footerItems || defaultValues.footerItems;

		return (
			<div className="my-footer-items">
				{footerItems.map((item, index) => (
					<Link key={`item-${index}`} href={item.url}>
						{item.label}
					</Link>
				))}
			</div>
		)
	}
}