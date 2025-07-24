import axios from 'axios';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
export const handler = async (event, context) => {
  let response;

  try {
    // Get meme templates
    //   Reference: https://imgflip.com/api
    const MEME_TEMPLATE_ENDPOINT = 'https://api.imgflip.com/get_memes';
    const templateResult = await axios.get(MEME_TEMPLATE_ENDPOINT);
    const templates = templateResult.data.data.memes;

    // Randomly select meme template
    const imgUrl = templates[Math.floor(Math.random() * templates.length)].url;
    console.log('imgUrl:', imgUrl);

    // Parse phrase (command) into two portions (by word count)
    const body = JSON.parse(event.body);
    const phrase = body.command;
    console.log('phrase:', phrase);
    const words = phrase.split(' ');
    const firstHalfLength = Math.round(words.length / 2);
    let topText = '';
    let bottomText = '';
    for (const [index, word] of words.entries()) {
      if (index < firstHalfLength) {
        topText += (index === 0 ? '' : ' ') + word;
      } else {
        bottomText += (index === firstHalfLength ? '' : ' ') + word;
      }
    }
    console.log('topText:', topText);
    console.log('bottomText:', bottomText);

    // Build Meme Gen URL
    //   Reference: https://github.com/jacebrowning/memegen
    const MEMEGEN_ENDPOINT = 'https://api.memegen.link/images/custom/';
    const url = encodeURI(`${MEMEGEN_ENDPOINT}${topText}/${bottomText}/my_background.png?background=${imgUrl}`);
    response = {
      statusCode: 200,
      body: url
    };
    console.log('Returning Meme Gen URL:', url);
    return response;
  } catch (error) {
    console.log('Something went wrong:', error.message);
    response = {
      statusCode: 200,
      body: 'Something went wrong :( https://media.giphy.com/media/l41JNsXAvFvoHvWJW/giphy.meme'
    };
    return response;
  }
};
