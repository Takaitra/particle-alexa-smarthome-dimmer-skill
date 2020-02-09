# particle-alexa-smarthome-dimmer-skill

Alexa Smart Home skill to control a dimmable light via the Particle Device Cloud.

## Directions

1. Create an AWS account if you don't already have one. Create a user in the IAM console and copy the access key id and secret.
2. Install [the AWS CLI](https://aws.amazon.com/cli/) and configure it using the command `aws configure`
3. Create an Alexa Smart Home skill using the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask/create-new-skill). Follow the steps in [this Medium article](https://medium.com/@thebelgiumesekid/how-to-create-an-alexa-enabled-smart-home-with-particle-photon-part-1-d8c4da3702e9) to configure it for account linking.
4. Replace the skill id in serverless.yml with your new skill id.
5. Update DISCOVERABLE_ENDPOINT with the name or id of your Particle device
6. [Install serverless](https://serverless.com/framework/docs/getting-started/) via `npm install -g serverless`
7. Install dependencies via `npm install` then deploy the Lambda using the command `serverless deploy`
8. Install the Alexa skill using the Alexa app

Now you can use commands such as

* "Alexa, turn on fairy lights"
* "Alexa, dim the fairy lights to 50 percent"
* "Alexa, goodnight" (Turn off the lights if you've added it to your goodnight routine)

Change the FRIENDLY_NAME constant if you want to refer to your device with a different name.

## Troubleshooting

* Check the Cloudwatch logs for the Lambda function
* Use eslint to check for syntax errors via the command `npx eslint --fix lambda/index.js`

## References

* [How to Create an Alexa-Enable Smart Home with Particle Photon](https://medium.com/@thebelgiumesekid/how-to-create-an-alexa-enabled-smart-home-with-particle-photon-part-1-d8c4da3702e9)  
A great read to understand the Alexa skill set up and account linking to Particle. Many of the steps such as creating an AWS role and installing the Lambda are handled for you by Serverless if using the steps above.
* [Steps to Build a Smart Home Skill](https://developer.amazon.com/en-US/docs/alexa/smarthome/steps-to-build-a-smart-home-skill.html)  
 Official Alexa Skills Kit documentation.
