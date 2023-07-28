
(RaiselyComponents, React) => {

	const config = {
		defaultTitle: 'Congee Climb Proposed Schedule',
	};

	const {
		styled, // the emotion styled components method
	} = RaiselyComponents;

  	const ComponentHeading = styled("h3")`
    	font-family: 'Montserrat';
        font-weight: 700;
    	margin-bottom: 35px;
    	color: #52288e;
        text-align: center;
    `;

  	const EventWrapper = styled("div")`
    	display: flex;
        flex-wrap: wrap;
        background-color: white;
        border: 2px solid #52288E;
        border-radius: 10px;
        overflow: hidden;

        @media (max-width: 1023px) {
        	flex-direction: column;
        }
    `;

  	const EventItem = styled("div")`
        position: relative;
        flex-basis: 25%;
        border: 1px solid #ada4d6;
        box-sizing: border-box;
        background-color: ${props => (props.type === 'special' ? '#F1ECFE' : 'transparent')};

        @media (max-width: 1023px) {
        	padding: 15px;
        }

        @media (min-width: 1024px) {
            &::before {
                content: '';
                display: block;
                padding-top: 100%;
            }

            .content {
                position: absolute;
                top: 0; left: 0;
                height: 100%;
                width: 100%;
                padding: 20px;
            }
        }
    `;

  	const Times = styled("div")`
        &::before {
        	content: ${props => (!props.start || !props.finish ? "" : "🕓")};
            margin-right: 5px;
        }

        margin-bottom: 10px;

        color: #262861;
    	font-size: 16px;
    `;

  	const Title = styled("h5")`
    	color: #262861;
    	font-weight: 900;
    `;

  	const Description = styled('span')`
    	font-size: 12px;
    	font-weight: 600;
    `;

  	const generateEventList = (eventData) => {
    	return eventData.map((event) => {
          	const { title, description, start, finish, type } = event;

        	return (
            	<EventItem type={type}>
                	<div className="content">
						<Times start={start} finish={finish}>
							{start && finish ? (<span>{start} - {finish}</span>) : null}
							{start && !finish ? <span><strong>Start </strong>{start}</span> : null}
							{!start && finish ? <span><strong>Finish </strong>{finish}</span> : null}
                        </Times>

                        <Title>{title && <span>{title}</span>}</Title>
                        <Description>{description && <span>{description}</span>}</Description>
                	</div>
              	</EventItem>
            )
        });
    }


  	const EventScheduleComponent = (props) => {
		const values = props.getValues();
      	const eventConfig = values.events;


      	const eventList = generateEventList(eventConfig);

		return (
			<div className="event-schedule">
				<ComponentHeading>
					{values.customTitle || config.defaultTitle}
				</ComponentHeading>
				<EventWrapper>
					{eventList}
				</EventWrapper>
			</div>
		);
	}

    return EventScheduleComponent;
}
