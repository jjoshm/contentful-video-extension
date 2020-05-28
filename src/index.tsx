import * as React from 'react';
import { render } from 'react-dom';
import {
  DisplayText,
  Select,
  SectionHeading,
  Option,
  TextInput,
  FieldGroup,
  Form,
  FormLabel,
  HelpText
} from '@contentful/forma-36-react-components';
import { init, locations, EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';

/**
 * To use this Extension create a Content Type with the following fields:
 *  platform: Short text
 *  videoId: Short text
 *  options: JSON Object
 * 
 *  See https://github.com/contentful/create-contentful-extension/blob/master/docs/examples/entry-editor-content-model.json for details.
 */

interface AppProps {
  sdk: EditorExtensionSDK;
}

interface AppState {
  platform: string;
  videoId: string;
  options?: any;
}

interface YoutubeParameters {
  [key: string]: {
    options: { [key: string]: string | number }
  }
}


const youtubeParameter: YoutubeParameters = {
  autoplay: {
    options: {
      'No Auto Play': 0,
      'Auto Play': 1
    }
  },
  color: { options: { 'white': 'white', 'red': 'red' } },
  controls: { options: { 'Enable Controls': 1, 'Disabel Controls': 0 } },
  loop: { options: { 'SinglePlay': 0, 'Loop': 1 } }
};

export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      videoId: props.sdk.entry.fields.videoId.getValue(),
      platform: props.sdk.entry.fields.platform.getValue(),
      options: props.sdk.entry.fields.options.getValue()
    };

    console.log(this.state)
  }


  onPlatformChangeHandler = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    this.setState({ platform: value });
    if (value === 'instagram') {
      this.setState({ options: undefined })
      this.props.sdk.entry.fields.options.setValue(undefined);
    } else {
      this.setState({ options: {} })
      this.props.sdk.entry.fields.options.setValue({});
    }
    await this.props.sdk.entry.fields.platform.setValue(value);
  };

  onVideoIdChangeHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    this.setState({ videoId: value });
    await this.props.sdk.entry.fields.videoId.setValue(value);
  };

  onVideoOptionChangeHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const name = event.target.name;
    let options = await this.props.sdk.entry.fields.options.getValue() || {};
    options[name] = value;
    this.setState({ options: options })
    await this.props.sdk.entry.fields.options.setValue(options);
    console.log(this.state)
  };

  YoutubePlayerOptions() {
    return <FieldGroup row={false}>
      {Object.keys(youtubeParameter).map(name => {
        const options = youtubeParameter[name]['options']

        let optionElements = [<Option value="default">Default</Option>];
        for (const [key, value] of Object.entries(options)) {
          optionElements.push(
            <Option key={key} value={(value as number).toString()}>{key}</Option>
          )
        };
        return (
          <div>
            <HelpText>{name}</HelpText>
            <Select value={(this.state.options && name in this.state.options) ? this.state.options[name] : 'default'} name={name} onChange={this.onVideoOptionChangeHandler}>
              {optionElements}
            </Select>
          </div>

        )
      })}
    </FieldGroup>
  }


  render() {
    return (
      <Form className="f36-margin--l">
        <DisplayText>Video Extension</DisplayText>
        <FieldGroup row={true}>
          <React.Fragment>
            <FormLabel htmlFor="platform-select" required>Platform</FormLabel>
            <Select required value={this.state.platform} className="" name="platform-select" onChange={this.onPlatformChangeHandler}>
              <Option value="">Select a Platform</Option>
              <Option value="youtube">Youtube</Option>
              <Option value="instagram">Instagram</Option>
            </Select>
          </React.Fragment>
          <React.Fragment>
            <FormLabel htmlFor="videoId-input" required>Video Id</FormLabel>
            <TextInput
              required
              name="videoId-input"
              placeholder="video id"
              onChange={this.onVideoIdChangeHandler}
              value={this.state.videoId}
            />
          </React.Fragment>
        </FieldGroup>

        {this.state.platform === 'youtube' && (
          <React.Fragment>
            <SectionHeading>Player Options</SectionHeading>
            {this.YoutubePlayerOptions()}
          </React.Fragment>
        )}
      </Form>
    );
  }
}

init(sdk => {
  if (sdk.location.is(locations.LOCATION_ENTRY_EDITOR)) {
    render(<App sdk={sdk as EditorExtensionSDK} />, document.getElementById('root'));
  }
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
