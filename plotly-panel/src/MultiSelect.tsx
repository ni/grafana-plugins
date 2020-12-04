import React, { useState, useEffect } from 'react';
import { FieldConfigEditorProps, SelectFieldConfigSettings, SelectableValue } from '@grafana/data';
import { MultiSelect } from '@grafana/ui';

type Props<T> = FieldConfigEditorProps<T[], SelectFieldConfigSettings<T>>;
type OptionsState<T> = Array<SelectableValue<T>>;

export const MultiSelectValueEditor = <T extends object>(props: Props<T>) => {
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState<OptionsState<T>>([]);

  useEffect(() => {
    updateOptions();
  }, [props.item?.settings, props.context?.data]);

  const updateOptions = async () => {
    const { item } = props;
    const { settings } = item;
    let _options: Array<SelectableValue<T>> = item.settings?.options || [];
    if (settings?.getOptions) {
      _options = await settings.getOptions(props.context);
    }
    if (options !== _options) {
      setOptions(_options);
      setIsLoading(false);
    }
  };

  const { value, onChange, item } = props;
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
};
