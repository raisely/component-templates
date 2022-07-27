/**
 * This example component shows how you can personalise the amounts on a donation form based on the user who is logged in.
 * In this example, we have 3 private custom fields called `ask1`, `ask2` and `ask3`. When you send someone to the donation page
 * and log them in, the `user` object is populated and we change the dollar buttons shown to the 3 values in their record.
 *
 * This example also adds a default amount of the second ask value (if it exists), and will avoid a flash of default amounts while the user loads in.
**/

(RaiselyComponents, { useEffect }) => {
    const { DonationForm } = RaiselyComponents.Molecules;  	

    return () => {
           
      // find the user
      const { user } = useRaisely();
      const customFields = user.private;
	 
      useEffect(() => {
        if (user && customFields) {
          window.setCampaignConfig('amounts', [{
                "interval": "ONCE",
                "count": 1,
                "amounts": [
                  {
                    "amount": customFields.ask1 ? customFields.ask1 * 100 : 3000, // always good to set a default
                    "description": "",
                    "image": ""
                  },
                  {
                    "amount": customFields.ask2 ? customFields.ask2 * 100 : 5000,
                    "description": "",
                    "image": ""
                  },
                  {
                    "amount": customFields.ask3 ? customFields.ask3 * 100 : 8000,
                    "description": "",
                    "image": ""
                  },
                ]
            }])
          }
      	}, [customFields])
      
        if (window.location.search.includes('access_token') && !user) {
        	return null;
        }
      
        // This form will automatically target the profile in view
        return (
            <DonationForm 
              amount={customFields ? customFields.ask2 * 100 : null} 
              startOnAmountScreen 
              autoconfigure={true} 
              key={user.uuid} />
        );
    }
}
