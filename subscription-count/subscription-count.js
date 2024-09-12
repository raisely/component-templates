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
  
        const [totalCount, setTotalCount] = useState(null);
        const [error, setError] = useState(null);

        /* Fetch subscription data when the component loads.*/       
        const fetchData = async () => {
            try {
                const response = await api.all('subscriptions').getAll({
                    status: "OK",
                    limit: 1,
                });

                const responseData = response.data; 
                // Access pagination
                const pagination = responseData?.pagination;

                if (pagination && typeof pagination.total === 'number') {
                    setTotalCount(pagination.total);
                } else {
                    setError('Unable to fetch total count');
                    setTotalCount(0);
                }
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
                setError('Error fetching subscriptions');
                setTotalCount(0);
            }
        }

        useEffect(() => {
            fetchData();
        }, []);

        return (
            <div className="subscription-count">
                <h3 className="subscription-count__title">
                    {values.customTitle || config.defaultTitle}
                </h3>
                {error ? (
                    <p className="subscription-count__error">{error}</p>
                ) : totalCount !== null ? (
                    <p className="subscription-count__number">{totalCount}</p>
                ) : (
                    <p className="subscription-count__loading">Loading...</p>
                )}
            </div>
        );
    }
}
