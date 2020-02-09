
const Particle = require('particle-api-js');

const particle = new Particle();

const AlexaResponse = require('./alexa/skills/smarthome/AlexaResponse');

const DISCOVERABLE_ENDPOINT = 'hamster_jester';
const FRIENDLY_NAME = 'Fairy Lights';

function sendResponse(response) {
  // TODO Validate the response
  console.log('index.handler response -----');
  console.log(JSON.stringify(response));
  return response;
}

// Apply a dimming curve so that the perceived light output is linear
function convertLevel(level) {
  return 0.4 * level + 0.006 * level ** 2;
}

async function sendDeviceState(endpointId, token, brightness) {
  const converted = convertLevel(brightness);
  const level = Math.round(255 * converted / 100);

  console.log(`setDeviceState ${brightness}->${level}`);

  return particle.callFunction({
    deviceId: endpointId,
    name: 'analogwrite',
    argument: `D7 ${level}`,
    auth: token,
  }).then(
    (data) => console.log('Particle function success:', data),
    (err) => console.log('Particle error:', err),
  );
}

exports.handler = async function handle(event, context) {
  // Dump the request for logging - check the CloudWatch logs
  console.log('index.handler request  -----');
  console.log(JSON.stringify(event));

  if (context !== undefined) {
    console.log('index.handler context  -----');
    console.log(JSON.stringify(context));
  }

  // Validate we have an Alexa directive
  if (!('directive' in event)) {
    const aer = new AlexaResponse({
      name: 'ErrorResponse',
      payload: {
        type: 'INVALID_DIRECTIVE',
        message: 'Missing key: directive, Is request a valid Alexa directive?',
      },
    });
    return sendResponse(aer.get());
  }

  // Check the payload version
  if (event.directive.header.payloadVersion !== '3') {
    const aer = new AlexaResponse({
      name: 'ErrorResponse',
      payload: {
        type: 'INTERNAL_ERROR',
        message: 'This skill only supports Smart Home API version 3',
      },
    });
    return sendResponse(aer.get());
  }

  const { namespace } = (event.directive || {}).header || {};

  if (namespace.toLowerCase() === 'alexa.authorization') {
    const aar = new AlexaResponse({ namespace: 'Alexa.Authorization', name: 'AcceptGrant.Response' });
    return sendResponse(aar.get());
  }

  if (namespace.toLowerCase() === 'alexa.discovery') {
    const adr = new AlexaResponse({ namespace: 'Alexa.Discovery', name: 'Discover.Response' });
    const capabilityAlexa = adr.createPayloadEndpointCapability();
    const capabilityAlexaPowerController = adr.createPayloadEndpointCapability({ interface: 'Alexa.PowerController', supported: [{ name: 'powerState' }] });
    const capabilityAlexaBrightnessController = adr.createPayloadEndpointCapability({ interface: 'Alexa.BrightnessController', supported: [{ name: 'brightness' }] });
    adr.addPayloadEndpoint({
      friendlyName: FRIENDLY_NAME,
      description: 'Dimmable fairy lights',
      endpointId: DISCOVERABLE_ENDPOINT,
      displayCategories: ['LIGHT'],
      capabilities: [
        capabilityAlexa,
        capabilityAlexaPowerController,
        capabilityAlexaBrightnessController,
      ],
    });
    return sendResponse(adr.get());
  }

  if (namespace === 'Alexa.PowerController' || namespace === 'Alexa.BrightnessController') {
    const { endpointId } = event.directive.endpoint;
    const { token } = event.directive.endpoint.scope;
    const { correlationToken } = event.directive.header;

    const ar = new AlexaResponse({
      correlationToken,
      token,
      endpointId,
    });

    let brightness = 0;
    if (namespace === 'Alexa.PowerController') {
      let powerState = 'OFF';
      if (event.directive.header.name === 'TurnOn') {
        brightness = 100;
        powerState = 'ON';
      }
      ar.addContextProperty({
        namespace: 'Alexa.PowerController',
        name: 'powerState',
        value: powerState,
      });
    } else {
      brightness = event.directive.payload.brightness;
      ar.addContextProperty({
        namespace: 'Alexa.BrightnessController',
        name: 'brightness',
        value: brightness,
      });
    }

    // Check for an error when setting the state
    const deviceResponse = await sendDeviceState(endpointId, token, brightness);
    if (parseInt(deviceResponse, 10) < 0) {
      return new AlexaResponse(
        {
          name: 'ErrorResponse',
          payload: {
            type: 'ENDPOINT_UNREACHABLE',
            message: 'Unable to reach endpoint database.',
          },
        },
      ).get();
    }

    return sendResponse(ar.get());
  }
};
