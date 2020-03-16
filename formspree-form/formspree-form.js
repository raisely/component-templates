(RaiselyComponents, React) => {
	const { Form, styled } = RaiselyComponents;
	
	const formspreeUrl = 'https://formspree.io/abc123';

  const initialValues = {};

	const Wrapper = styled("div")`
		.field-wrapper {
			margin-bottom: 0.5rem;
		}
		.contact-form-thanks {
			padding: 1rem;
			text-align: center;
			font-weight: bold;
			background: #333;
			color: white;
		}
	`;

  return class ContactForm extends React.Component {
    state = {};
    save = async (data, options) => {
      if (!data.firstName || !data.lastName || !data.email) {
        throw new Error("Please fill in all the required fields");
      }

      const response = await fetch(formspreeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(data)
      });

      this.setState({ complete: true });
    };

    FinalPage() {
      return (
				<Wrapper>
					<div className="contact-form-thanks">
						<p>Thanks! We'll be in touch shortly.</p>
					</div>
				</Wrapper>
      );
    }

    render() {
      if (this.state.complete) return <this.FinalPage />;
      return (
        <Wrapper>
          <Form
            global={this.props.global}
            unlocked
            fields={[
              {
                active: true,
                visible: true,
                label: "First Name",
                type: "text",
                id: "firstName",
                required: true,
                core: true
              },
              {
                active: true,
                visible: true,
                label: "Last Name",
                type: "text",
                id: "lastName",
                required: true,
                core: true
              },
              {
                active: true,
                visible: true,
                label: "Email",
                type: "email",
                id: "email",
                required: true,
                core: true
							},
							{
                active: true,
                visible: true,
                label: "Message",
                type: "textarea",
                id: "message",
                required: false,
                core: true
              }
            ]}
            values={initialValues}
						action={this.save}
						actionText="Send Message"
          />
        </Wrapper>
      );
    }
  };
};
