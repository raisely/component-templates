(RaiselyComponents, React) => {
	const { useState } = React;
	const { api, Form } = RaiselyComponents;
	const { htmr } = RaiselyComponents.Common;

	const generateModifiedFields = (fields) => {
		const newFields = [...fields.map((f) => ({ ...f }))];
		newFields.push({
			type: "custom",
			id: "recaptcha",
			render: () => <div id="recaptcha"></div>,
		});
		return newFields;
	};

	const siteKey = "6LdiCUIUAAAAAMuF1TD8VkdBgTlrklGyJbNgJCdn";
	let recaptcha = [false, false]; // [ready, loaded]
	
	const cache = {};

	return (props) => {
		const [success, setSuccess] = useState(false);
		const { successMessage, successRedirect, tags, buttonText } = props.getValues();

		const captchaInterval = setInterval(() => {
			if (recaptcha[0] && !recaptcha[1]) {
				recaptcha[1] = true;
				window.grecaptcha.render("recaptcha", {
					sitekey: siteKey,
					size: "invisible",
					callback: onSubmit,
				});
				clearInterval(captchaInterval);
			}
		}, 100);

		window.loadRecaptcha = () => {
			recaptcha[0] = true;
		};
		if (window.grecaptcha && window.grecaptcha.render) {
			recaptcha[0] = true;
		}

		const onValidate = async (data, options) => {
			cache.data = data;
			cache.options = options;
			window.grecaptcha.execute();
		};

		const onSubmit = async (recaptcha) => {
			const { data, options } = cache;
			try {
				const userRes = await api.users.upsert({
					recaptcha,
					data: {
						...data,
						tags: tags ? tags.map((t) => t.uuid) : [],
					},
				});

				const res = userRes.body().data();
				if (successRedirect) props.actions.redirect(successRedirect);
				if (successMessage) {
					setSuccess(true);
				}
			} catch (e) {
				options.setSubmitting(false);
				props.actions.addErrorMessage(e);
			}
		};

		return (
			<div className={`lead-form`}>
				{success ? (
					htmr(successMessage || "<p>Thank you!</p>")
				) : (
					<div>
						<Form
							global={props.global}
							unlocked
							fields={generateModifiedFields(
								props.global.customFields.user
							)}
							action={onValidate}
							actionText={buttonText || 'Submit'}
						/>
					</div>
				)}
			</div>
		);
	};
};
