# Raisely Donation Form V3
This component can be used to render a custom donation form based on Raisely's DonationFormV3.

## Default steps
This component includes all the default steps that are present in the Raisely DonationFormV3. Namely:
- `amount`
- `upsell`
- `details`
- `giftAid`
- `payment`
- `thankyou`

## Rendering steps with `AnimatedStep`
The Raisely DonationFormV3 uses the `AnimatedStep` component to render most of the steps. This component uses the `name` prop to automatically render the current step. This eliminates the need to manually check for the current step using an `if` statement.

While this is the preferred way to render steps, you do not have to use it. The `ThankYouScreen` step provides an example that uses an `if` statement instead.

## Pass the `user` in the configuration object
Unlike V2 of the DonationForm, you will need to pass the user in to the `configuration` object. This is required.
