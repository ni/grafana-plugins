import React from 'react';
import { FieldConfigEditorProps, SelectFieldConfigSettings, SelectableValue } from '@grafana/data';
import { MultiSelect } from '@grafana/ui';

interface State<T> {
  isLoading: boolean;
  options: Array<SelectableValue<T>>;
}

type Props<T> = FieldConfigEditorProps<T[], SelectFieldConfigSettings<T>>;

// todo can this be a function component?
export class MultiSelectValueEditor<T> extends React.PureComponent<Props<T>, State<T>> {
  state: State<T> = {
    isLoading: true,
    options: [],
  };

  componentDidMount() {
    this.updateOptions();
  }

  componentDidUpdate(oldProps: Props<T>) {
    const old = oldProps.item?.settings;
    const now = this.props.item?.settings;
    if (old !== now) {
      this.updateOptions();
    } else if (now?.getOptions) {
      const old = oldProps.context?.data;
      const now = this.props.context?.data;
      if (old !== now) {
        this.updateOptions();
      }
    }
  }

  updateOptions = async () => {
    const { item } = this.props;
    const { settings } = item;
    let options: Array<SelectableValue<T>> = item.settings?.options || [];
    if (settings?.getOptions) {
      options = await settings.getOptions(this.props.context);
    }
    if (this.state.options !== options) {
      this.setState({
        isLoading: false,
        options,
      });
    }
  };

  render() {
    const { options, isLoading } = this.state;
    const { value, onChange, item } = this.props;

    const { settings } = item;
    return (
      <MultiSelect<T>
        isLoading={isLoading}
        value={value}
        defaultValue={value}
        allowCustomValue={settings?.allowCustomValue}
        onChange={e => onChange(e.map(v => v.value as T))}
        options={options}
      />
    );
  }
}
