import React, { useRef, useEffect } from 'react';
import { DropDownList } from "smart-webcomponents-react/dropdownlist";
import { NumericTextBox } from "smart-webcomponents-react/numerictextbox";
import { QueryBuilder, QueryBuilderProps } from 'smart-webcomponents-react/querybuilder';
import { useTheme } from '@grafana/ui';

import 'smart-webcomponents-react/source/styles/components/smart.querybuilder.css';
import 'smart-webcomponents-react/source/styles/components/smart.dropdownlist.css';
import 'smart-webcomponents-react/source/styles/smart.dark-orange.css';
import 'smart-webcomponents-react/source/styles/smart.orange.css';
import { IFilterEnum, IFilterField, IFilterRelativeTimeCustom, RelativeTimeType } from 'types';
import { toInteger } from 'lodash';

type TestResultsQueryBuilderProps = Omit<QueryBuilderProps, 'customOperations' | 'fields' | 'messages' | 'showIcons'> &
  React.HTMLAttributes<Element> & {
    autoComplete: (field: string, startsWith: string) => Promise<string[]>;
    defaultValue?: string;
  };

export const TestResultsQueryBuilder: React.FC<TestResultsQueryBuilderProps> = (props) => {
  const theme = useTheme();
  // Need to set on body to affect dropdowns
  document.body.setAttribute('theme', theme.isDark ? 'dark-orange' : 'orange');

  const initialize = useRef(true);
  useEffect(() => {
    initialize.current = false;
  }, []);

  const getDataSource = (field: string) => {
    return async (query: string, callback: Function) => {
      callback(await props.autoComplete(field, query));
    };
  };

  const fields = [
    {
      label: 'Part Number',
      dataField: 'partNumber',
      dataType: 'string',
      filterOperations: ['=', '<>', 'startswith', 'endswith', 'contains', 'notcontains', 'isblank', 'isnotblank'],
      lookup: { dataSource: getDataSource('PART_NUMBER'), minLength: 2 },
    },
    {
      label: 'Test Program',
      dataField: 'programName',
      dataType: 'string',
      filterOperations: ['=', '<>', 'startswith', 'endswith', 'contains', 'notcontains', 'isblank', 'isnotblank'],
      lookup: { dataSource: getDataSource('PROGRAM_NAME'), minLength: 2 },
    },
    {
      label: 'Batch SN',
      dataField: 'nitmBatchSerialNumber',
      dataType: 'string',
      filterOperations: [
        'propertyequals',
        'propertynotequals',
        'propertystartswith',
        'propertyendswith',
        'propertycontains',
        'propertynotcontains',
        'propertyisblank',
        'propertyisnotblank',
      ],
    },
    {
      label: 'Keyword',
      dataField: 'keywords',
      dataType: 'string',
      filterOperations: ['listequals', 'listnotequals', 'listcontains', 'listnotcontains'],
    },
    {
      label: 'Operator',
      dataField: 'operator',
      dataType: 'string',
      filterOperations: ['=', '<>', 'startswith', 'endswith', 'contains', 'notcontains', 'isblank', 'isnotblank'],
      lookup: { dataSource: getDataSource('OPERATOR'), minLength: 2 },
    },
    {
      label: 'Serial Number',
      dataField: 'serialNumber',
      dataType: 'string',
      filterOperations: ['=', '<>', 'startswith', 'endswith', 'contains', 'notcontains', 'isblank', 'isnotblank'],
      lookup: { dataSource: getDataSource('SERIAL_NUMBER'), minLength: 2 },
    },
    {
      label: 'Started at',
      dataField: 'startedAt',
      dataType: 'string',
      filterOperations: ['>', '>=', '<', '<='],
      lookup: {
        dataSource: [
          { label: 'From', value: '${__from:date}' },
          { label: 'To', value: '${__to:date}' },
          { label: 'From (YYYY-MM-DD)', value: '${__from:date:YYYY-MM-DD}' },
          { label: 'To (YYYY-MM-DD)', value: '${__to:date:YYYY-MM-DD}' },
        ],
      },
    },
    {
      label: 'Updated at',
      dataField: 'updatedAt',
      dataType: 'string',
      filterOperations: ['>', '>=', '<', '<='],
      lookup: {
        dataSource: [
          { label: 'From', value: '${__from:date}' },
          { label: 'To', value: '${__to:date}' },
          { label: 'From (YYYY-MM-DD)', value: '${__from:date:YYYY-MM-DD}' },
          { label: 'To (YYYY-MM-DD)', value: '${__to:date:YYYY-MM-DD}' },
        ],
      },
    },
    {
      label: 'Started within',
      dataField: 'startedWithin',
      dataType: 'string',
      filterOperations: ['relative_time'],
      // lookup: {
      //   dataSource: [
      //     { label: 'Current day', value: 'Constants.CurrentDay' },
      //     { label: 'Current week', value: 'Constants.CurrentWeek' },
      //     { label: 'Current month', value: 'Constants.CurrentMonth' },
      //     { label: 'Current year', value: 'Constants.CurrentYear' }
      //   ]
      // }
    },
    { label: 'Updated within', dataField: 'updatedWithin', dataType: 'string', filterOperations: ['<='] },
    {
      label: 'Status',
      dataField: 'status.statusType',
      dataType: 'string',
      filterOperations: ['=', '<>'],
      lookup: {
        dataSource: [
          { label: 'Passed', value: 'Passed' },
          { label: 'Failed', value: 'Failed' },
          { label: 'Running', value: 'Running' },
          { label: 'Terminated', value: 'Terminated' },
          { label: 'Errored', value: 'Errored' },
          { label: 'Done', value: 'Done' },
          { label: 'Looping', value: 'Looping' },
          { label: 'Skipped', value: 'Skipped' },
          { label: 'Waiting', value: 'Waiting' },
          { label: 'Timed Out', value: 'TimedOut' },
          { label: 'Custom', value: 'Custom' },
        ],
        readonly: true,
      },
    },
    {
      label: 'System ID',
      dataField: 'systemId',
      dataType: 'string',
      filterOperations: ['=', '<>', 'contains', 'notcontains'],
      lookup: { dataSource: getDataSource('SYSTEM_ID'), minLength: 2 },
    },
    {
      label: 'System Alias',
      dataField: 'systemAlias',
      dataType: 'string',
      filterOperations: ['=', '<>'],
    },
    {
      label: 'Workspace',
      dataField: 'workspaceName',
      dataType: 'string',
      filterOperations: ['=', '<>'],
    },
  ];

  return (
    <QueryBuilder
      customOperations={customOperations}
      getDynamicField={getDynamicField}
      fields={fields}
      messages={messages}
      showIcons
      // Only set value on first render
      {...(initialize.current && { value: props.defaultValue })}
      {...props}
    />
  );
};

const customOperations = [
  // Regular field expressions
  {
    label: 'Equals',
    name: '=',
    expressionTemplate: '{0} = "{1}"',
  },
  {
    label: 'Does not equal',
    name: '<>',
    expressionTemplate: '{0} != "{1}"',
  },
  {
    label: 'Starts with',
    name: 'startswith',
    expressionTemplate: '{0}.StartsWith("{1}")',
  },
  {
    label: 'Ends with',
    name: 'endswith',
    expressionTemplate: '{0}.EndsWith("{1}")',
  },
  {
    label: 'Contains',
    name: 'contains',
    expressionTemplate: '{0}.Contains("{1}")',
  },
  {
    label: 'Does not contain',
    name: 'notcontains',
    expressionTemplate: '!({0}.Contains("{1}"))',
  },
  {
    label: 'Is blank',
    name: 'isblank',
    expressionTemplate: 'string.IsNullOrEmpty({0})',
    hideValue: true,
  },
  {
    label: 'Is not blank',
    name: 'isnotblank',
    expressionTemplate: '!string.IsNullOrEmpty({0})',
    hideValue: true,
  },
  {
    label: 'Greater than',
    name: '>',
    expressionTemplate: '{0} > "{1}"',
  },
  {
    label: 'Greater than or equal to',
    name: '>=',
    expressionTemplate: '{0} >= "{1}"',
  },
  {
    label: 'Less than',
    name: '<',
    expressionTemplate: '{0} < "{1}"',
  },
  {
    label: 'Less than or equal to',
    name: '<=',
    expressionTemplate: '{0} <= "{1}"',
    expressionReaderCallback: (expression: any, bindings: any) => {
      if (bindings[0] === 'startedWithin') {
        return { fieldName: bindings[0], value: JSON.stringify(convertRelativeTimeValueFromLinq(bindings[1])) };
      }
      return { fieldName: bindings[0], value: bindings[1] };
    }
  },
  {
    label: 'Less than or equal to',
    name: 'relative_time',
    expressionTemplate: '{0} <= {1}',
    editorTemplate: (fieldType: string, val: string, fieldData: IFilterField) => {
      const html = `<div class="relative-time-editor">
        <smart-drop-down-list class="type-input" drop-down-append-to="body"></smart-drop-down-list>
        <div class="custom-input-container" style="display: none;">
          <smart-numeric-text-box class="value-input">
            input-format="integer"
            min=0
            spin-buttons
            spin-buttons-position="right"
            spin-buttons-step="1"
            enable-mouse-wheel-action
          </smart-numeric-text-box>
          <smart-drop-down-list class="unit-input"
            drop-down-append-to="body"
            placeholder="Unit"
          </smart-drop-down-list>
        </div>
      </div>`;

      let value = val ? JSON.parse(val) : val;
      const parsedHTML: any = $.parseHTML(html.trim())[0];

      const typeInput: DropDownList = parsedHTML.querySelector('.type-input');
      const customContainer = parsedHTML.querySelector('.custom-input-container');
      const unitInput: DropDownList = parsedHTML.querySelector('.unit-input');
      const valueInput: NumericTextBox = parsedHTML.querySelector('.value-input');

      typeInput['dataSource'] = relativeTimeTypes;
      typeInput['selectedIndexes'] = value.type ? [relativeTimeTypes.findIndex(el => el.value === value.type)] : [0];
      unitInput['dataSource'] = relativeTimeUnits;
      // Force selection of first value
      unitInput['selectedIndexes'] = [0];

      if (value.type === RelativeTimeType.Custom) {
        customContainer.style.display = 'block';
        valueInput.value = value.value ? value.value : '';
        unitInput['selectedIndexes'] = value.unit ? [relativeTimeUnits.findIndex(el => el.value === value.unit)] : [0];
      }

      typeInput.onChange = (event: any) => { // event: CustomEvent
        customContainer.style.display = event.detail.value === RelativeTimeType.Custom ? 'block' : 'none';
      };

      return parsedHTML;

    },
    valueTemplate: (editor: any, value: any): string => {
      var relativeTimeValue: any = typeof value === 'object' ? value : JSON.parse(value); // IFilterRelativeTimeValue
      if (relativeTimeValue.type === RelativeTimeType.Custom) {
        return relativeTimeValue.value + ' ' + (relativeTimeUnits.find(unit => unit.value === relativeTimeValue.unit) || {}).label;
      } else {
        return (relativeTimeTypes.find(type => type.value === relativeTimeValue.type) || {}).label || '';
      }
    },
    handleValue: (editor: any): string | undefined => {
      if (!editor) {
        return undefined;
      }
      const typeInput = editor.querySelector('.type-input');
      if (!typeInput) {
        return undefined;
      }
      const type = typeInput.dataSource[typeInput.selectedIndexes[0]].value;
      if (type === RelativeTimeType.Custom) {
        const unitInput = editor.querySelector('.unit-input');
        const valueInput = editor.querySelector('.value-input');
        if (unitInput && valueInput) {
          return JSON.stringify({
            type: RelativeTimeType.Custom,
            unit: unitInput.dataSource[unitInput.selectedIndexes[0]].value,
            value: valueInput.value
          });
        }
        return undefined;
      } else {
        return JSON.stringify({ type });
      }
    },
    expressionBuilderCallback: (dataField: any, operation: any, objValue: any): string => {
      var value = JSON.parse(objValue);
      if (value.type === RelativeTimeType.Custom) {
        return `${dataField} <= "${convertRelativeTimeValueToLinq(value)}"`;
      }
      return `${dataField} <= ${value.type}`;
    },
    expressionReaderCallback: (expression: any, bindings: any) => {
      return { fieldName: bindings[0], value: JSON.stringify({ type: bindings[1], value: bindings[2], unit: bindings[3] }) };
    },
  },
  // List expressions
  {
    label: 'Equals',
    name: 'listequals',
    expressionTemplate: '{0}.Contains("{1}")',
  },
  {
    label: 'Does not equal',
    name: 'listnotequals',
    expressionTemplate: '!({0}.Contains("{1}"))',
  },
  {
    label: 'Contains',
    name: 'listcontains',
    expressionTemplate: '{0}.Any(it.Contains("{1}"))',
  },
  {
    label: 'Does not contain',
    name: 'listnotcontains',
    expressionTemplate: '{0}.Any(!it.Contains("{1}"))',
  },
  // Properties expressions
  {
    label: 'Equals',
    name: 'propertyequals',
    expressionTemplate: 'properties["{0}"] = "{1}"',
  },
  {
    label: 'Does not equal',
    name: 'propertynotequals',
    expressionTemplate: 'properties["{0}"] != "{1}"',
  },
  {
    label: 'Starts with',
    name: 'propertystartswith',
    expressionTemplate: 'properties["{0}"].StartsWith("{1}")',
  },
  {
    label: 'Ends with',
    name: 'propertyendswith',
    expressionTemplate: 'properties["{0}"].EndsWith("{1}")',
  },
  {
    label: 'Contains',
    name: 'propertycontains',
    expressionTemplate: 'properties["{0}"].Contains("{1}")',
  },
  {
    label: 'Does not contains',
    name: 'propertynotcontains',
    expressionTemplate: '!(properties["{0}"].Contains("{1}"))',
  },
  {
    label: 'Is blank',
    name: 'propertyisblank',
    expressionTemplate: 'string.IsNullOrEmpty(properties["{0}"])',
    hideValue: true,
  },
  {
    label: 'Is not blank',
    name: 'propertyisnotblank',
    expressionTemplate: '!string.IsNullOrEmpty(properties["{0}"])',
    hideValue: true,
  },
];

const relativeTimeTypes: IFilterEnum[] = [
  { label: 'Current day', value: RelativeTimeType.CurrentDay },
  { label: 'Current week', value: RelativeTimeType.CurrentWeek },
  { label: 'Current month', value: RelativeTimeType.CurrentMonth },
  { label: 'Current year', value: RelativeTimeType.CurrentYear },
  { label: 'Custom', value: RelativeTimeType.Custom }
];

const relativeTimeUnits: IFilterEnum[] = [
  { label: 'Days', value: 'DAYS' },
  { label: 'Hours', value: 'HOURS' },
  { label: 'Minutes', value: 'MINUTES' },
  { label: 'Seconds', value: 'SECONDS' }
];

const secondsInDay = 86400;
const secondsInHour = 3600;
const secondsInMinute = 60;

const convertRelativeTimeValueToLinq = (value: IFilterRelativeTimeCustom): string => {
  let seconds = 0;
  switch (value.unit) {
    case 'DAYS':
      seconds = value.value * secondsInDay;
      break;
    case 'HOURS':
      seconds = value.value * secondsInHour;
      break;
    case 'MINUTES':
      seconds = value.value * secondsInMinute;
      break;
    case 'SECONDS':
    default:
      seconds = value.value;
      break;
  }

  const days = Math.floor(seconds / secondsInDay);
  seconds = seconds - (days * secondsInDay);
  const hours = Math.floor(seconds / secondsInHour);
  seconds = seconds - (hours * secondsInHour);
  const minutes = Math.floor(seconds / secondsInMinute);
  seconds = seconds - (minutes * secondsInMinute);

  return `${days}.${hours}:${minutes}:${seconds}`;
}

const convertRelativeTimeValueFromLinq = (value: string): IFilterRelativeTimeCustom | undefined => {
  if (typeof value !== 'string') {
    return;
  }

  var possibleFormats = [
    /^(?<days>\d+)$/,
    /^(?<days>\d+)\.(?<hours>\d\d?):(?<minutes>\d\d?)(:(?<seconds>\d\d?(\.\d+)?))?$/,
    /^(?<hours>\d\d?):(?<minutes>\d\d?)(:(?<seconds>\d\d?(\.\d+)?))?$/
  ];

  var timespan;
  for (var format of possibleFormats) {
    timespan = value.match(format);
    if (timespan) {
      break;
    }
  }

  if (!timespan) {
    return;
  }

  return {
    type: RelativeTimeType.Custom,
    value: toInteger(timespan.groups?.days || timespan.groups?.hours || timespan.groups?.minutes || timespan.groups?.seconds) || 0,
    unit: timespan.groups?.days ? 'DAYS' : timespan.groups?.hours ? 'HOURS' : timespan.groups?.minutes ? 'MINUTES' : timespan.groups?.seconds ? 'SECONDS' : 'DAYS'
  };
};

const getDynamicField = () => ({
  filterOperations: [
    'propertyequals',
    'propertynotequals',
    'propertystartswith',
    'propertyendswith',
    'propertycontains',
    'propertynotcontains',
    'propertyisblank',
    'propertyisnotblank',
  ],
});

const messages = {
  en: {
    propertyUnknownType: "'' property is with undefined 'type' member!",
    propertyInvalidValue: "Invalid '!",
    propertyInvalidValueType: "Invalid '!",
    elementNotInDOM: 'Element does not exist in DOM! Please, add the element to the DOM, before invoking a method.',
    moduleUndefined: 'Module is undefined.',
    missingReference: '.',
    htmlTemplateNotSuported: ": Browser doesn't support HTMLTemplate elements.",
    invalidTemplate: "' property accepts a string that must match the id of an HTMLTemplate element from the DOM.",
    add: 'Add',
    addCondition: 'Add Condition',
    addGroup: 'Add Group',
    and: 'And',
    notand: 'Not And',
    or: 'Or',
    notor: 'Not Or',
    '=': 'Equals',
    '<>': 'Does not equal',
    '>': 'Greater than',
    '>=': 'Greater than or equal to',
    '<': 'Less than',
    '<=': 'Less than or equal to',
    startswith: 'Starts with',
    endswith: 'Ends with',
    contains: 'Contains',
    notcontains: 'Does not contain',
    isblank: 'Is blank',
    isnotblank: 'Is not blank',
    wrongParentGroupIndex: "' method.",
    missingFields:
      ': Fields are required for proper condition\'s adding. Set "fields" source and then conditions will be added as expected.',
    wrongElementNode: "' method.",
    invalidDataStructure: ': Used invalid data structure in updateCondition/updateGroup method.',
    dateTabLabel: 'DATE',
    timeTabLabel: 'TIME',
    queryLabel: '',
  },
};
