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
 *  platform: Short text (add required validation)
 *  videoId: Short text (add required validation)
 *  youtubeOptions: JSON Object
 *  customOptions: JSON Object
 * 
 *  See https://github.com/contentful/create-contentful-extension/blob/master/docs/examples/entry-editor-content-model.json for details.
 */

interface IAppProps {
  sdk: EditorExtensionSDK;
}

interface IYoutubeOptions {
  default: { [key: string]: { options: { [key: string]: string | number } } },
  custom: { [key: string]: { options: { [key: string]: string | number } } }
}

interface IYoutubeOptionJSON {
  default: { [key: string]: string },
  custom: { [key: string]: string }
}

interface IAppState {
  platform: string;
  videoId: string;
  youtubeOptions?: IYoutubeOptionJSON;
}

const youtubeOptions: IYoutubeOptions = {
  default: {
    autoplay: {
      options: {
        'No Auto Play': 0,
        'Auto Play': 1
      }
    },
    color: { options: { 'white': 'white', 'red': 'red' } },
    controls: { options: { 'Enable Controls': 1, 'Disabel Controls': 0 } },
    loop: { options: { 'SinglePlay': 0, 'Loop': 1 } }
  },

  custom: {
    mute: {
      options: {
        'Enable': 1,
        'Disable': 0
      }
    }
  }
}

export class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);

    this.state = {
      videoId: props.sdk.entry.fields.videoId.getValue(),
      platform: props.sdk.entry.fields.platform.getValue(),
      youtubeOptions: props.sdk.entry.fields.youtubeOptions.getValue()
    };
  }

  onPlatformChangeHandler = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    this.setState({ platform: value });
    if (value === 'instagram') {
      this.setState({ youtubeOptions: undefined })
      this.props.sdk.entry.fields.youtubeOptions.setValue(undefined);
    } else {
      this.setState({ youtubeOptions: {custom: {}, default: {}} })
      this.props.sdk.entry.fields.youtubeOptions.setValue({custom: {}, default: {}});
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
    let options: IYoutubeOptionJSON = await this.props.sdk.entry.fields.youtubeOptions.getValue() || {};
    if(name in youtubeOptions.default) {
      options.default[name] = value;
    } else {
      options.custom[name] = value;
    }

    this.setState({ youtubeOptions: options })
    await this.props.sdk.entry.fields.youtubeOptions.setValue(options);
  };

  YoutubePlayerOptions() {
    let selects: JSX.Element[] = [];

    Object.keys(youtubeOptions.default).map(name => {
      const options = youtubeOptions.default[name]['options']
      let optionElements = [<Option value="default">Default</Option>];
      for (const [key, value] of Object.entries(options)) {
        optionElements.push(
          <Option key={key} value={(value as number).toString()}>{key}</Option>
        )
      };
      selects.push(
        <div>
          <HelpText>{name}</HelpText>
          <Select value={(this.state.youtubeOptions!.default && name in this.state.youtubeOptions!.default) ? this.state.youtubeOptions!.default[name] : 'default'} name={name} onChange={this.onVideoOptionChangeHandler}>
            {optionElements}
          </Select>
        </div>)
    });

    Object.keys(youtubeOptions.custom).map(name => {
      const options = youtubeOptions.custom[name]['options']
      let optionElements = [<Option value="default">Default</Option>];
      for (const [key, value] of Object.entries(options)) {
        optionElements.push(
          <Option key={key} value={(value as number).toString()}>{key}</Option>
        )
      };
      selects.push(
        <div>
          <HelpText>{name}</HelpText>
          <Select value={(this.state.youtubeOptions!.custom && name in this.state.youtubeOptions!.custom) ? this.state.youtubeOptions!.custom[name] : 'default'} name={name} onChange={this.onVideoOptionChangeHandler}>
            {optionElements}
          </Select>
        </div>)
    });


    return <FieldGroup row={false}>
      {selects}
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
