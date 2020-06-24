# contentful-video-extension

## Instal dependencies
install the dependencys using `npm install`

## Local development
To start development run the following commands

`npm run login && npm run configure`
It starts a new session with our CLI. As the CLI tool uses our Content Management API, you need to have a CMA access token to use all the commands.

Once you're successfully logged in, it asks what space and environment you want to use. Your answers (CMA token, space and environment ids) be will be saved to a local .contentfulrc.json.

When configuration part is finished you can actually start the development by typing the following command:

`npm run start`
It starts the development server and deploys the extension in development mode to the selected space. The extension will automatically reload if you make changes to the code.

Note: As Contentful runs in an HTTPS environment, temporarily disable the security checks in the browser. For example, "Load unsafe scripts" in Chrome.

## Uploading a UI Extension to Contentful
When development is done, you need to install your extention to a space in production mode. To do so run the following command in your extension folder:

`npm run deploy`
It correctly bundles all extension dependencies in production mode and optimizes the build for the best performance, then it uploads build version of extension to a selected space.
