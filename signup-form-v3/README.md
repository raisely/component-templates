# Raisely Sign Up Form V3
This component can be used to render a custom sign up form based on Raisely's SignUpFormV3.

## Default steps
This component inclues all the available default steps that are present in the Raisely SignUpFormV3. Namely:
- `fundraiserTheme`
- `exercise`
- `user`
- `ticketSelect`
- `ticketHolder`
- `profile`
- `donation`
- `giftAid`
- `payment`

## Fields
Fields translate to block settings for the custom component, which can be configured.

The available fields are outlined in the accompanying JSON config present in this folder. Configurable settings such as `ticketsEnabled`, `enableExerciseGoal`, `enableDonation`, and others have been set up in the JSON file. Please look at the JSON file for the full list of fields.

## Custom 
The SignUpFormV3 supports custom form steps. If you'd like to add those, please refer to the documentation for an example
https://components.raisely.com/?path=/docs/form-signupformv3--page#building-a-custom-form-with-renderstep-and-react-context
