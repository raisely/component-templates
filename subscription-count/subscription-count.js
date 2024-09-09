(RaiselyComponents, React) => {

    const config = {
        defaultTitle: 'Active regular donations to this campaign',
    };

    const { useState, useEffect } = React;

    const {
        api, // an api wrapper for Raisely
    } = RaiselyComponents;

    return (props) => {
        const values = props.getValues();

        const {
            current,
        } = useRaisely();

        const {
        } = current;
     
        const [subscriptionCount, setSubscriptionCount] = useState(null);

        /* Fetch subscription data when the component loads.*/       
        const fetchData = async () => {
            try {
                const response = await api.all('subscriptions').getAll({
					status: "OK",
                });         

                const subscriptions = response.body().data();
                if (subscriptions.data) {
                    setSubscriptionCount(subscriptions.data.length); // Set the count of subscriptions
                }
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
                setSubscriptionCount(0); // Set to 0 if there's an error
            }
        }

        useEffect(() => {
            fetchData();
        }, [])

        return (
          <div className="subscription-count">
            <h3 className="subscription-count__title">
              {values.customTitle || config.defaultTitle}
            </h3>
            {subscriptionCount !== null ? (
              <p className="subscription-count__number">{subscriptionCount}</p>
            ) : (
              <p className="subscription-count__loading">Loading...</p>
            )}
          </div>
        );
    }
}
